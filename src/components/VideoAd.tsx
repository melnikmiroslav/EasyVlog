import { useEffect, useState } from 'react'
import './VideoAd.css'

interface VideoAdProps {
  title: string
  description: string
  imageUrl: string
  linkUrl: string | null
  duration: number
  onClose: () => void
}

function VideoAd({ title, description, imageUrl, linkUrl, duration, onClose }: VideoAdProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [duration, onClose])

  const handleClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="video-ad-overlay">
      <div className="video-ad-container">
        <div className="video-ad-content" onClick={linkUrl ? handleClick : undefined}>
          <img src={imageUrl} alt={title} className="video-ad-image" />
          <div className="video-ad-text">
            <h3 className="video-ad-title">{title}</h3>
            {description && <p className="video-ad-description">{description}</p>}
          </div>
          {linkUrl && <div className="video-ad-cta">Подробнее</div>}
        </div>
        <div className="video-ad-controls">
          <div className="video-ad-timer">Реклама: {timeLeft}с</div>
          <button className="video-ad-close" onClick={handleSkip}>
            Пропустить
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoAd
