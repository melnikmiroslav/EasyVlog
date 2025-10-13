import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './AdManager.css'

interface Ad {
  id: string
  video_id: string
  title: string
  description: string
  image_url: string
  link_url: string | null
  show_at_seconds: number
  duration_seconds: number
  is_active: boolean
  created_at: string
}

interface AdManagerProps {
  videoId: string
}

function AdManager({ videoId }: AdManagerProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    show_at_seconds: 0,
    duration_seconds: 5,
    is_active: true,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadAds()
  }, [videoId])

  const loadAds = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('video_id', videoId)
        .order('show_at_seconds', { ascending: true })

      if (error) throw error
      setAds(data || [])
    } catch (err) {
      console.error('Error loading ads:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.image_url || formData.show_at_seconds < 0) {
      setError('Заполните все обязательные поля')
      return
    }

    try {
      if (editingAd) {
        const { error } = await supabase
          .from('ads')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            show_at_seconds: formData.show_at_seconds,
            duration_seconds: formData.duration_seconds,
            is_active: formData.is_active,
          })
          .eq('id', editingAd.id)

        if (error) throw error
        setSuccess('Реклама обновлена!')
      } else {
        const { error } = await supabase.from('ads').insert([
          {
            video_id: videoId,
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            show_at_seconds: formData.show_at_seconds,
            duration_seconds: formData.duration_seconds,
            is_active: formData.is_active,
          },
        ])

        if (error) throw error
        setSuccess('Реклама добавлена!')
      }

      resetForm()
      loadAds()
    } catch (err) {
      setError('Ошибка при сохранении рекламы')
    }
  }

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      show_at_seconds: ad.show_at_seconds,
      duration_seconds: ad.duration_seconds,
      is_active: ad.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту рекламу?')) return

    try {
      const { error } = await supabase.from('ads').delete().eq('id', id)
      if (error) throw error
      setSuccess('Реклама удалена')
      loadAds()
    } catch (err) {
      setError('Ошибка при удалении рекламы')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      show_at_seconds: 0,
      duration_seconds: 5,
      is_active: true,
    })
    setEditingAd(null)
    setShowForm(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="ad-manager">
      <div className="ad-manager-header">
        <h3>Управление рекламой</h3>
        <button
          className="add-ad-btn"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Отмена' : '+ Добавить рекламу'}
        </button>
      </div>

      {error && <div className="message error-msg">{error}</div>}
      {success && <div className="message success-msg">{success}</div>}

      {showForm && (
        <form className="ad-form" onSubmit={handleSubmit}>
          <h4>{editingAd ? 'Редактировать рекламу' : 'Новая реклама'}</h4>

          <div className="form-field">
            <label>Название *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Название рекламы"
            />
          </div>

          <div className="form-field">
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание или текст рекламы"
              rows={2}
            />
          </div>

          <div className="form-field">
            <label>Изображение *</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/ad-image.jpg"
            />
          </div>

          <div className="form-field">
            <label>Ссылка (опционально)</label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Показать на (секунды) *</label>
              <input
                type="number"
                min="0"
                value={formData.show_at_seconds}
                onChange={(e) =>
                  setFormData({ ...formData, show_at_seconds: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="form-field">
              <label>Длительность (секунды) *</label>
              <input
                type="number"
                min="1"
                value={formData.duration_seconds}
                onChange={(e) =>
                  setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 5 })
                }
              />
            </div>
          </div>

          <div className="form-field checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Активна
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingAd ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="ads-list">
        {loading ? (
          <p>Загрузка...</p>
        ) : ads.length === 0 ? (
          <p className="no-ads">Нет рекламы для этого видео</p>
        ) : (
          <div className="ads-grid">
            {ads.map((ad) => (
              <div key={ad.id} className={`ad-item ${!ad.is_active ? 'inactive' : ''}`}>
                <img src={ad.image_url} alt={ad.title} className="ad-preview" />
                <div className="ad-details">
                  <h4>{ad.title}</h4>
                  {ad.description && <p className="ad-description">{ad.description}</p>}
                  <div className="ad-timing">
                    <span>Показ: {formatTime(ad.show_at_seconds)}</span>
                    <span>Длительность: {ad.duration_seconds}с</span>
                  </div>
                  <div className="ad-status">
                    {ad.is_active ? (
                      <span className="status-badge active">Активна</span>
                    ) : (
                      <span className="status-badge inactive">Неактивна</span>
                    )}
                  </div>
                  <div className="ad-actions">
                    <button onClick={() => handleEdit(ad)} className="edit-btn">
                      Изменить
                    </button>
                    <button onClick={() => handleDelete(ad.id)} className="delete-btn">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdManager
