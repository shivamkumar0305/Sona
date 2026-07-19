'use client'

import { Home, Settings, BarChart3 } from 'lucide-react'

interface SidebarProps {
  activeItem: string
  setActiveItem: (item: string) => void
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'profile',   label: 'Music DNA',  icon: BarChart3 },
]

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeItem, setActiveItem }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center">
        <span
          className="text-lg font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-syne), sans-serif', letterSpacing: '-0.02em' }}
        >
          Sona
        </span>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="mono-label px-3 mb-3">Menu</p>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveItem(id)}
            className={`sidebar-item w-full text-left ${activeItem === id ? 'active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
        {BOTTOM_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveItem(id)}
            className={`sidebar-item w-full text-left ${activeItem === id ? 'active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
