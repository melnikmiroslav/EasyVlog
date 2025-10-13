import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AdManager from '../components/AdManager'
import './Studio.css'

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  views: number
  created_at: string
  category: string
}

function Studio() {
  const { user, phoneUser } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'Все',
  })

  const categories = ['Все', 'Музыка', 'Игры', 'Новости', 'Прямые трансляции', 'Кулинария', 'Спорт', 'Технологии', 'Путешествия', 'Образование']
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedVideoForAds, setSelectedVideoForAds] = useState<string | null>(null)

  const currentUserId = user?.id || phoneUser?.id
  const isLoggedIn = user || phoneUser

  useEffect(() => {
    if (isLoggedIn) {
      loadVideos()
    }
  }, [isLoggedIn, currentUserId])

  const loadVideos = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (err) {
      console.error('Error loading videos:', err)
    } finally {
      setLoading(false)
    }
  }

  const extractMetadata = async () => {
    if (!videoUrlInput.trim()) {
      setError('Введите ссылку на видео')
      return
    }

    setIsExtracting(true)
    setError('')

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-video-metadata`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrlInput }),
      })

      if (!response.ok) throw new Error('Failed to extract metadata')

      const metadata = await response.json()
      setFormData({
        title: metadata.title,
        description: metadata.description,
        video_url: metadata.video_url,
        thumbnail_url: metadata.thumbnail_url,
        category: metadata.category || 'Все',
      })
      setVideoUrlInput('')
    } catch (err) {
      setError('Не удалось извлечь данные видео')
      setFormData({
        title: '',
        description: '',
        video_url: videoUrlInput,
        thumbnail_url: '',
        category: 'Все',
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.video_url || !formData.thumbnail_url) {
      setError('Заполните все обязательные поля')
      return
    }

    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update({
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            thumbnail_url: formData.thumbnail_url,
            category: formData.category,
          })
          .eq('id', editingVideo.id)

        if (error) throw error
        setSuccess('Видео успешно обновлено!')
      } else {
        const { error } = await supabase.from('videos').insert([
          {
            user_id: currentUserId,
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            thumbnail_url: formData.thumbnail_url,
            category: formData.category,
          },
        ])

        if (error) throw error
        setSuccess('Видео успешно добавлено!')
      }

      setFormData({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'Все' })
      setEditingVideo(null)
      setShowAddForm(false)
      loadVideos()
    } catch (err) {
      setError(editingVideo ? 'Ошибка при обновлении видео' : 'Ошибка при добавлении видео')
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      category: video.category || 'Все',
    })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingVideo(null)
    setFormData({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'Все' })
    setVideoUrlInput('')
    setShowAddForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это видео?')) return

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id)

      if (error) throw error
      setSuccess('Видео удалено')
      loadVideos()
    } catch (err) {
      setError('Ошибка при удалении видео')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="studio-container">
        <div className="studio-header">
          <h1>Моя Студия</h1>
        </div>
        <div className="studio-content">
          <p className="studio-message">Войдите, чтобы управлять своими видео</p>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-container">
      <div className="studio-header">
        <h1>Моя Студия</h1>
        <button className="add-video-btn" onClick={() => editingVideo ? cancelEdit() : setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Отмена' : '+ Добавить видео'}
        </button>
      </div>

      {error && <div className="message error-msg">{error}</div>}
      {success && <div className="message success-msg">{success}</div>}

      {showAddForm && (
        <div className="add-form">
          <h2>{editingVideo ? 'Редактировать видео' : 'Добавить новое видео'}</h2>

          {!editingVideo && !formData.video_url && (
            <div className="url-input-section">
              <div className="form-field">
                <label>Ссылка на видео *</label>
                <div className="url-input-group">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... или прямая ссылка"
                    disabled={isExtracting}
                  />
                  <button
                    type="button"
                    className="extract-btn"
                    onClick={extractMetadata}
                    disabled={isExtracting || !videoUrlInput.trim()}
                  >
                    {isExtracting ? 'Загрузка...' : 'Извлечь данные'}
                  </button>
                </div>
              </div>
              <p className="helper-text">Вставьте ссылку на YouTube, Vimeo или прямую ссылку на видео</p>
            </div>
          )}

          {(formData.video_url || editingVideo) && (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Название *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название видео"
              />
            </div>

            <div className="form-field">
              <label>Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание видео"
                rows={3}
              />
            </div>

            <div className="form-field">
              <label>Ссылка на видео *</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="form-field">
              <label>Ссылка на превью *</label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="form-field">
              <label>Категория *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingVideo ? 'Сохранить изменения' : 'Добавить видео'}
              </button>
              {formData.video_url && !editingVideo && (
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setFormData({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'Все' })
                    setVideoUrlInput('')
                  }}
                >
                  Начать заново
                </button>
              )}
              {editingVideo && (
                <button type="button" className="reset-btn" onClick={cancelEdit}>
                  Отмена
                </button>
              )}
            </div>
          </form>
          )}
        </div>
      )}

      <div className="videos-list">
        <h2>Мои видео ({videos.length})</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : videos.length === 0 ? (
          <p className="no-videos">У вас пока нет видео</p>
        ) : (
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video.id} className="video-item">
                <img src={video.thumbnail_url} alt={video.title} className="video-thumbnail" />
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p className="studio-video-description">{video.description}</p>
                  <div className="video-stats">
                    <span>{video.views} просмотров</span>
                    <span>{new Date(video.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="video-actions">
                    <Link to={`/watch/${video.id}`} className="action-btn">
                      Смотреть
                    </Link>
                    <button onClick={() => handleEdit(video)} className="action-btn edit-btn">
                      Изменить
                    </button>
                    <button onClick={() => setSelectedVideoForAds(video.id)} className="action-btn ads-btn">
                      Реклама
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="action-btn delete-btn">
                      Удалить
                    </button>
                  </div>
                </div>
                {selectedVideoForAds === video.id && (
                  <div className="video-ads-section">
                    <AdManager videoId={video.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Studio