import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Studio from './pages/Studio'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Watch from './pages/Watch'
import Header from './components/Header'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
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
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} onSearchChange={setSearchQuery} />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/watch/:videoId" element={<Watch />} />
      </Routes>
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
