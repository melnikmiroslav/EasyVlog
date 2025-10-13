import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import VideoGrid from '../components/VideoGrid'

interface HomeProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

function Home({ searchQuery, onSearchChange }: HomeProps) {
  const [sidebarOpen] = useState(true)

  return (
    <div className="main-container">
      <Sidebar isOpen={sidebarOpen} />
      <VideoGrid sidebarOpen={sidebarOpen} searchQuery={searchQuery} onSearchChange={onSearchChange} />
    </div>
  )
}

export default Home
