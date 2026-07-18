'use client'

import { Search, Bell, Settings, RefreshCw } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'

export default function TopBar() {
  const { user, syncStatus, syncProgress } = useApp()

  // Get initials of user display name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
      {/* Search Bar / Sync Indicator */}
      <div className="flex-1 max-w-md flex items-center gap-4">
        {syncStatus === 'syncing' ? (
          <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider animate-pulse">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-3 h-3" />
            </motion.div>
            <span>{syncProgress}</span>
          </div>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-none text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-none hover:bg-card transition-colors flex items-center justify-center border border-transparent hover:border-border cursor-pointer">
          <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        <button className="w-10 h-10 rounded-none hover:bg-card transition-colors flex items-center justify-center border border-transparent hover:border-border cursor-pointer">
          <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-foreground font-mono">{user.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono lowercase">{user.spotifyUser}</span>
            </div>
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-9 h-9 rounded-none border border-border object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-none bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold font-mono">
                {getInitials(user.name)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

