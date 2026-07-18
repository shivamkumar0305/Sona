'use client'

import { Music, Home, Compass, BookOpen, User, Settings } from 'lucide-react'

interface SidebarProps {
  activeItem: string
  setActiveItem: (item: string) => void
}

export default function Sidebar({ activeItem, setActiveItem }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'library', label: 'Library', icon: BookOpen },
  ]

  const playlists = [
    'After Hours Mix',
    'Productivity Flows',
    'Late Night Jazz',
    'Discovery Daily',
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
          <Music className="w-5 h-5 text-accent-foreground" />
        </div>
        <h1 className="text-xl font-bold">Sona</h1>
      </div>

      {/* Main Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`sidebar-item ${isActive ? 'active' : ''} w-full`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Playlists */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-4">
          Your Playlists
        </p>
        <nav className="space-y-1">
          {playlists.map((playlist, index) => (
            <button
              key={index}
              className="sidebar-item w-full text-xs"
            >
              <span>{playlist}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="space-y-2 pt-4 border-t border-border">
        <button 
          onClick={() => setActiveItem('profile')}
          className={`sidebar-item w-full ${activeItem === 'profile' ? 'active' : ''}`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
        <button 
          onClick={() => setActiveItem('settings')}
          className={`sidebar-item w-full ${activeItem === 'settings' ? 'active' : ''}`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}

