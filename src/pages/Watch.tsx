import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Watch.css'

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  views: number
  created_at: string
  user_id: string
}

interface Profile {
  id: string
  channel_name: string
  avatar_url: string | null
}

function Watch() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const [video, setVideo] = useState<Video | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (videoId) {
      loadVideo()
      incrementViews()
    }
  }, [videoId])

  const loadVideo = async () => {
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .maybeSingle()

      if (videoError) throw videoError
      if (!videoData) {
        navigate('/')
        return
      }

      setVideo(videoData)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', videoData.user_id)
        .maybeSingle()

      if (profileError) throw profileError
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading video:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_views', { video_id: videoId })
    } catch (error) {
      console.error('Error incrementing views:', error)
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

  const handleChannelClick = () => {
    if (video?.user_id) {
      navigate(`/profile/${video.user_id}`)
    }
  }

  if (loading) {
    return (
      <div className="watch-page">
        <div className="watch-loading">Загрузка...</div>
      </div>
    )
  }

  if (!video) {
    return null
  }

  const channelName = profile?.channel_name || 'Мой Канал'
  const avatarUrl = profile?.avatar_url
  const channelInitial = channelName.charAt(0).toUpperCase()

  return (
    <div className="watch-page">
      <div className="watch-container">
        <div className="video-player-section">
          <video
            src={video.video_url}
            controls
            autoPlay
            className="video-element"
          />
          <div className="video-info-section">
            <h1 className="video-title">{video.title}</h1>
            <div className="video-metadata">
              <div className="channel-info" onClick={handleChannelClick}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={channelName} className="channel-avatar" />
                ) : (
                  <div className="channel-avatar-placeholder">{channelInitial}</div>
                )}
                <div className="channel-details">
                  <div className="channel-name">{channelName}</div>
                </div>
              </div>
              <div className="video-stats">
                {formatViews(video.views)} просмотров • {getTimeAgo(video.created_at)}
              </div>
            </div>
            {video.description && (
              <div className="video-description">
                <p>{video.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Watch
