import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CommentsList from '../components/CommentsList'
import VideoAd from '../components/VideoAd'
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

interface Ad {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string | null
  show_at_seconds: number
  duration_seconds: number
  max_views_per_user: number | null
  max_total_views: number | null
  current_total_views: number
}

function Watch() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const [video, setVideo] = useState<Video | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [ads, setAds] = useState<Ad[]>([])
  const [currentAd, setCurrentAd] = useState<Ad | null>(null)
  const [shownAdIds, setShownAdIds] = useState<Set<string>>(new Set())
  const [videoTime, setVideoTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (videoId) {
      loadVideo()
      loadAds()
      incrementViews()
    }
  }, [videoId])

  useEffect(() => {
    if (ads.length === 0) return

    const videoElement = videoRef.current
    if (videoElement) {
      const handleTimeUpdate = () => {
        setVideoTime(Math.floor(videoElement.currentTime))
      }
      videoElement.addEventListener('timeupdate', handleTimeUpdate)
      return () => videoElement.removeEventListener('timeupdate', handleTimeUpdate)
    } else {
      const interval = window.setInterval(() => {
        setVideoTime((prev) => prev + 1)
      }, 1000)
      timeIntervalRef.current = interval
      return () => window.clearInterval(interval)
    }
  }, [ads, video])

  useEffect(() => {
    if (ads.length === 0 || videoTime === 0) return

    const adToShow = ads.find(
      (ad) =>
        ad.show_at_seconds === videoTime &&
        !shownAdIds.has(ad.id)
    )

    if (adToShow) {
      const userId = getUserId()

      void (async () => {
        try {
          await supabase.rpc('increment_ad_views', { p_ad_id: adToShow.id, p_user_id: userId })
          console.log('Ad view tracked')
        } catch (err) {
          console.error('Error tracking ad view:', err)
        }
      })()

      setCurrentAd(adToShow)
      setShownAdIds((prev) => new Set(prev).add(adToShow.id))
      if (videoRef.current) {
        videoRef.current.pause()
      }
      if (timeIntervalRef.current) {
        window.clearInterval(timeIntervalRef.current)
        timeIntervalRef.current = null
      }
    }
  }, [videoTime, ads, shownAdIds])

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

  const getUserId = () => {
    const userId = localStorage.getItem('ad_user_id')
    if (userId) return userId

    const newUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('ad_user_id', newUserId)
    return newUserId
  }

  const loadAds = async () => {
    if (!videoId) return

    try {
      const userId = getUserId()
      const { data: allAds, error } = await supabase
        .from('ads')
        .select('*')
        .eq('video_id', videoId)
        .eq('is_active', true)
        .order('show_at_seconds', { ascending: true })

      if (error) throw error

      const filteredAds = await Promise.all(
        (allAds || []).map(async (ad) => {
          const { data: shouldShow } = await supabase
            .rpc('should_show_ad', { p_ad_id: ad.id, p_user_id: userId })

          return shouldShow ? ad : null
        })
      )

      setAds(filteredAds.filter(ad => ad !== null) as Ad[])
    } catch (error) {
      console.error('Error loading ads:', error)
    }
  }

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_video_views', { video_id: videoId })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  const handleAdClose = () => {
    setCurrentAd(null)
    if (videoRef.current) {
      videoRef.current.play()
    } else if (!timeIntervalRef.current) {
      const interval = window.setInterval(() => {
        setVideoTime((prev) => prev + 1)
      }, 1000)
      timeIntervalRef.current = interval
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

  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url)

      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v')
        if (videoId) {
          return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
        }
      }

      if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1)
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
      }

      if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/shorts/')) {
        const videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0]
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
      }

      return url
    } catch {
      return url
    }
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
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
          <div className="video-player-wrapper">
            {isYouTubeUrl(video.video_url) ? (
              <iframe
                ref={iframeRef}
                src={getEmbedUrl(video.video_url)}
                className="video-element"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: currentAd ? 'none' : 'block' }}
              />
            ) : (
              <video
                ref={videoRef}
                src={video.video_url}
                controls
                autoPlay
                muted
                className="video-element"
                style={{ display: currentAd ? 'none' : 'block' }}
              />
            )}
            {currentAd && (
              <VideoAd
                title={currentAd.title}
                description={currentAd.description}
                imageUrl={currentAd.image_url}
                linkUrl={currentAd.link_url}
                duration={currentAd.duration_seconds}
                onClose={handleAdClose}
              />
            )}
          </div>
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
            <CommentsList videoId={video.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Watch
