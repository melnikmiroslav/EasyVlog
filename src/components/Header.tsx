import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import './Header.css'

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

function Header({ searchQuery = '', onSearchChange }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, phoneUser, signOut } = useAuth()
  const showSearchBar = location.pathname === '/' || location.pathname.startsWith('/profile/')

  const isLoggedIn = user || phoneUser

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setShowUserMenu(!showUserMenu)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  const getUserInitial = () => {
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    if (phoneUser?.phone) {
      return phoneUser.phone.slice(-1)
    }
    return 'A'
  }

  const getUserDisplay = () => {
    if (user?.email) {
      return user.email
    }
    if (phoneUser?.phone) {
      return phoneUser.phone
    }
    return ''
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 180 40" width="180" height="40">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <text x="2" y="28" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="30" fontWeight="700" fill="#065fd4">EasyVlog</text>
            </svg>
          </div>
        </div>

        {showSearchBar && (
          <div className="header-center">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск"
                className="search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <button className="search-button" aria-label="Search">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7s-7,3.13-7,7s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z"/>
                </svg>
              </button>
            </div>
            <button className="icon-button voice-search" aria-label="Voice search">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          </div>
        )}

        <div className="header-right">
          {isLoggedIn && (
            <button className="studio-button" onClick={() => navigate('/studio')} aria-label="Studio">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <span>Моя Студия</span>
            </button>
          )}
          <button className="icon-button" aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          <div style={{ position: 'relative' }}>
            <button className="user-avatar" onClick={handleProfileClick} aria-label="Account">
              <div className="avatar-circle">{getUserInitial()}</div>
            </button>
            {showUserMenu && isLoggedIn && (
              <div className="user-menu">
                <div className="user-menu-email">{getUserDisplay()}</div>
                <button className="user-menu-item" onClick={handleSignOut}>
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}

export default Header
