import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Studio from './pages/Studio'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Watch from './pages/Watch'
import Header from './components/Header'
import NotificationPrompt from './components/NotificationPrompt'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname !== '/') {
      setSearchQuery('')
    }
  }, [location.pathname])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  return (
    <div className="app">
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} onSearchChange={setSearchQuery} sidebarOpen={sidebarOpen} onSidebarClose={() => setSidebarOpen(false)} />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/watch/:videoId" element={<Watch />} />
      </Routes>
      <NotificationPrompt />
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = '<div style="color: white; padding: 20px;">Error loading application. Please refresh the page.</div>'
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
      }
      console.log('Service Workers unregistered')
    }).catch((error) => {
      console.error('Error unregistering Service Workers:', error)
    })
  })
}
