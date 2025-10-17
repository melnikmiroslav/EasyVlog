import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration)
      })
      .catch((error) => {
        console.log('SW registration failed:', error)
      })
  })
}
