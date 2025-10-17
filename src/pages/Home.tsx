import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import VideoGrid from '../components/VideoGrid'

interface HomeProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sidebarOpen: boolean
  onSidebarClose: () => void
}

function Home({ searchQuery, onSearchChange, sidebarOpen, onSidebarClose }: HomeProps) {

  return (
    <div className="main-container">
      <Sidebar isOpen={sidebarOpen} onClose={onSidebarClose} />
      <VideoGrid sidebarOpen={sidebarOpen} searchQuery={searchQuery} onSearchChange={onSearchChange} />
    </div>
  )
}

export default Home
