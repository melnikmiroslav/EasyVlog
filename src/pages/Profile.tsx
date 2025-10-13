import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import VideoCard from '../components/VideoCard'
import Sidebar from '../components/Sidebar'
import './Profile.css'

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

interface UserProfile {
  id: string
  channel_name: string
  avatar_url: string | null
  banner_url: string | null
  created_at: string
}

function Profile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user, phoneUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editChannelName, setEditChannelName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const currentUserId = user?.id || phoneUser?.id
  const isOwnProfile = currentUserId === userId

  useEffect(() => {
    setLoading(true)
    setProfile(null)
    setVideos([])
    loadUserProfile()
  }, [userId, currentUserId])

  async function loadUserProfile() {
    if (!userId) return

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError

      if (profileData) {
        setProfile(profileData)
        setEditChannelName(profileData.channel_name)
      } else {
        setProfile(null)
        setEditChannelName('')
      }

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (videosError) throw videosError

      setVideos(videosData || [])
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 день назад'
    if (diffDays < 7) return `${diffDays} дней назад`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяцев назад`
    return `${Math.floor(diffDays / 365)} лет назад`
  }

  function getAvatar(channelName: string) {
    if (!channelName) return 'U'
    const firstChar = channelName.charAt(0)
    return firstChar.toUpperCase()
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentUserId) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUserId}/avatar.${fileExt}`

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${currentUserId}/${oldPath}`])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Ошибка при загрузке аватара')
    } finally {
      setUploading(false)
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentUserId) return

    setUploadingBanner(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUserId}/banner.${fileExt}`

      if (profile?.banner_url) {
        const oldPath = profile.banner_url.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${currentUserId}/${oldPath}`])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          banner_url: publicUrl,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, banner_url: publicUrl } : null)
    } catch (error) {
      console.error('Error uploading banner:', error)
      alert('Ошибка при загрузке баннера')
    } finally {
      setUploadingBanner(false)
    }
  }

  async function handleSaveProfile() {
    if (!currentUserId || !editChannelName.trim()) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          channel_name: editChannelName.trim(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setProfile(prev => prev ? { ...prev, channel_name: editChannelName.trim() } : null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Ошибка при обновлении профиля')
    }
  }

  if (loading) {
    return (
      <div className="main-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="profile-container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="main-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="profile-container">
          <div className="error">Пользователь не найден</div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="profile-container">
        <div className="profile-banner" style={{ backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          {isOwnProfile && !previewMode && (
            <button
              className="banner-upload-btn"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              title={uploadingBanner ? 'Загрузка...' : 'Изменить баннер'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            style={{ display: 'none' }}
          />
          <div className="profile-header">
            <div className="profile-avatar-wrapper">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.channel_name} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-large profile-avatar-placeholder">
                  {getAvatar(profile.channel_name)}
                </div>
              )}
              {isOwnProfile && !previewMode && (
                <button
                  className="avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title={uploading ? 'Загрузка...' : 'Изменить аватар'}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-info">
            {isEditing ? (
              <div className="profile-edit-form">
                <input
                  type="text"
                  value={editChannelName}
                  onChange={(e) => setEditChannelName(e.target.value)}
                  className="channel-name-input"
                  placeholder="Название канала"
                />
                <div className="edit-buttons">
                  <button onClick={handleSaveProfile} className="save-btn">Сохранить</button>
                  <button onClick={() => {
                    setIsEditing(false)
                    setEditChannelName(profile.channel_name)
                  }} className="cancel-btn">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="profile-name-section">
                <h1 className="profile-channel-name">{profile.channel_name}</h1>
                {isOwnProfile && !previewMode && (
                  <div className="profile-action-buttons">
                    <button onClick={() => setPreviewMode(!previewMode)} className="preview-profile-btn" title={previewMode ? "Вернуться к редактированию" : "Просмотреть как посетитель"}>
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    <button onClick={() => setIsEditing(true)} className="edit-profile-btn" title="Редактировать профиль">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </div>
                )}
                {isOwnProfile && previewMode && (
                  <button onClick={() => setPreviewMode(false)} className="exit-preview-btn" title="Выйти из режима просмотра">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Выйти из просмотра
                  </button>
                )}
              </div>
            )}
            <div className="profile-stats">
              <span>{videos.length} видео</span>
            </div>
          </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section-title">Видео</div>
          {videos.length === 0 ? (
            <div className="no-videos">У этого пользователя пока нет видео</div>
          ) : (
            <div className={`videos-grid ${sidebarOpen ? 'sidebar-open' : ''}`}>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  thumbnail={video.thumbnail_url}
                  title={video.title}
                  channel={profile.channel_name}
                  views={`${video.views}`}
                  timestamp={formatDate(video.created_at)}
                  duration="0:00"
                  avatar={getAvatar(profile.channel_name)}
                  avatarUrl={profile.avatar_url || undefined}
                  userId={video.user_id}
                  onClick={() => navigate(`/watch/${video.id}`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile
