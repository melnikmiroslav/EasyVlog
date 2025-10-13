import { useNavigate } from 'react-router-dom'
import './VideoCard.css'

interface VideoCardProps {
  thumbnail: string
  title: string
  channel: string
  views: string
  timestamp: string
  duration: string
  avatar: string
  avatarUrl?: string
  videoUrl?: string
  userId?: string
  onClick?: () => void
}

function VideoCard({ thumbnail, title, channel, views, timestamp, duration, avatar, avatarUrl, userId, onClick }: VideoCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (userId) {
      navigate(`/profile/${userId}`)
    }
  }

  return (
    <div className="video-card" onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="thumbnail-container">
        <img src={thumbnail} alt={title} className="thumbnail" />
        <span className="duration">{duration}</span>
      </div>
      <div className="video-info">
        <div
          className="channel-icon"
          onClick={handleChannelClick}
          style={{ cursor: userId ? 'pointer' : 'default' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={channel} className="avatar avatar-img" />
          ) : (
            <div className="avatar">{avatar}</div>
          )}
        </div>
        <div className="video-details">
          <h3 className="video-title">{title}</h3>
          <div className="video-metadata">
            <div
              className="channel-name"
              onClick={handleChannelClick}
              style={{ cursor: userId ? 'pointer' : 'default' }}
            >
              {channel}
            </div>
            <div className="video-stats">
              {views} просмотров • {timestamp}
            </div>
          </div>
        </div>
        <button className="more-options" aria-label="More options">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default VideoCard
