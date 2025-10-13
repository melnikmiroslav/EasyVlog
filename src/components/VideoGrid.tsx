import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import VideoCard from './VideoCard'
import VideoPlayer from './VideoPlayer'
import './VideoGrid.css'

interface VideoGridProps {
  sidebarOpen: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
}

interface Video {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  views: number
  created_at: string
  user_id: string
  category: string
}

interface Profile {
  id: string
  channel_name: string
  avatar_url: string | null
}


function VideoGrid({ sidebarOpen, searchQuery }: VideoGridProps) {
  const [dbVideos, setDbVideos] = useState<Video[]>([])
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState('Все')

  const categories = ['Все', 'Музыка', 'Игры', 'Новости', 'Прямые трансляции', 'Кулинария', 'Спорт', 'Технологии', 'Путешествия', 'Образование']

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (videosError) throw videosError
      setDbVideos(videosData || [])

      if (videosData && videosData.length > 0) {
        const userIds = [...new Set(videosData.map(v => v.user_id))]
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)

        if (profilesError) throw profilesError

        const profilesMap = new Map<string, Profile>()
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile)
        })
        setProfiles(profilesMap)
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatViews = (views: number) => {
    return views.toLocaleString('ru-RU')
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'сегодня'
    if (diffDays === 1) return '1 день назад'
    if (diffDays < 7) return `${diffDays} дня назад`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} неделю назад`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяца назад`
    return `${Math.floor(diffDays / 365)} года назад`
  }

  const getChannelInitial = (title: string) => {
    return title.charAt(0).toUpperCase()
  }

  let filteredVideos = activeCategory === 'Все'
    ? dbVideos
    : dbVideos.filter(video => video.category === activeCategory)

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filteredVideos = filteredVideos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query)
    )
  }

  const allVideos = filteredVideos.map(video => {
    const profile = profiles.get(video.user_id)
    const channelName = profile?.channel_name || 'Мой Канал'
    const avatarUrl = profile?.avatar_url

    return {
      id: video.id,
      thumbnail: video.thumbnail_url,
      title: video.title,
      channel: channelName,
      views: formatViews(video.views),
      timestamp: getTimeAgo(video.created_at),
      duration: '0:00',
      avatar: avatarUrl ? '' : getChannelInitial(channelName),
      avatarUrl: avatarUrl || undefined,
      videoUrl: video.video_url,
      userId: video.user_id
    }
  })

  return (
    <main className={`video-grid-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="category-chips">
        {categories.map(category => (
          <div
            key={category}
            className={`chip ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
            style={{ cursor: 'pointer' }}
          >
            {category}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>Загрузка...</div>
      ) : (
        <div className="video-grid">
          {allVideos.map(video => (
            <VideoCard
              key={video.id}
              {...video}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>
      )}

      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.videoUrl || '#'}
          title={selectedVideo.title}
          channel={selectedVideo.channel}
          avatar={selectedVideo.avatar}
          avatarUrl={selectedVideo.avatarUrl}
          views={selectedVideo.views}
          timestamp={selectedVideo.timestamp}
          userId={selectedVideo.userId}
          videoId={selectedVideo.id}
          onClose={() => {
            setSelectedVideo(null)
            loadVideos()
          }}
        />
      )}
    </main>
  )
}

export default VideoGrid
