import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './VideoPlayer.css'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  channel: string
  avatar?: string
  avatarUrl?: string
  views: string
  timestamp: string
  userId?: string
  videoId?: string
  onClose: () => void
}

function VideoPlayer({ videoUrl, title, channel, avatar, avatarUrl, views, timestamp, userId, videoId, onClose }: VideoPlayerProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const incrementViews = async () => {
      if (videoId) {
        try {
          const { error } = await supabase.rpc('increment_video_views', { video_id: videoId })
          if (error) console.error('Error incrementing views:', error)
        } catch (err) {
          console.error('Error incrementing views:', err)
        }
      }
    }

    incrementViews()
  }, [videoId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (userId) {
      onClose()
      navigate(`/profile/${userId}`)
    }
  }

  const hasValidUrl = videoUrl && videoUrl !== '#' && videoUrl.trim() !== ''

  const getYouTubeEmbedUrl = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }
    return null
  }

  const getGoogleDriveEmbedUrl = (url: string) => {
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`
      }
    }
    return null
  }

  const isYouTubeVideo = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))
  const isGoogleDriveVideo = videoUrl && videoUrl.includes('drive.google.com')

  const youtubeEmbedUrl = isYouTubeVideo ? getYouTubeEmbedUrl(videoUrl) : null
  const googleDriveEmbedUrl = isGoogleDriveVideo ? getGoogleDriveEmbedUrl(videoUrl) : null

  const autoplayEmbedUrl = youtubeEmbedUrl ? `${youtubeEmbedUrl}?autoplay=1` : null

  return (
    <div className="video-player-overlay" onClick={handleOverlayClick}>
      <div className="video-player-container">
        <button className="video-player-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {!hasValidUrl ? (
          <div className="video-player-iframe" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '18px' }}>
            Ссылка на видео не найдена
          </div>
        ) : isYouTubeVideo && autoplayEmbedUrl ? (
          <iframe
            className="video-player-iframe"
            src={autoplayEmbedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isGoogleDriveVideo && googleDriveEmbedUrl ? (
          <iframe
            className="video-player-iframe"
            src={googleDriveEmbedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video className="video-player-iframe" controls autoPlay>
            <source src={videoUrl} type="video/mp4" />
            Ваш браузер не поддерживает видео тег.
          </video>
        )}

        <div className="video-player-info">
          <h2 className="video-player-title">{title}</h2>
          <div className="video-player-meta">
            <div
              className="video-player-channel"
              onClick={handleChannelClick}
              style={{ cursor: userId ? 'pointer' : 'default' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={channel} className="video-player-avatar" />
              ) : (
                <div className="video-player-avatar">{avatar}</div>
              )}
              <span>{channel}</span>
            </div>
            <span>•</span>
            <span>{views} просмотров</span>
            <span>•</span>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
