'use client'

import { Search, RefreshCw } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export default function TopBar() {
  const { user, syncStatus, syncProgress } = useApp()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="topbar h-14 flex items-center justify-between px-7 gap-4">
      {/* Left: Search or Sync status */}
      <div className="flex-1 max-w-xs">
        {syncStatus === 'syncing' ? (
          <div className="flex items-center gap-2.5 text-muted-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-3 h-3" />
            </motion.div>
            <span className="text-[10px] uppercase tracking-widest font-bold animate-pulse">
              {syncProgress}
            </span>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search…"
              className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-xl text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:bg-card transition-all duration-200"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            />
          </div>
        )}
      </div>

      {/* Right: User pill */}
      {user && (
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden sm:flex flex-col items-end">
            <span
              className="text-[11px] font-bold text-foreground leading-tight"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              {user.name}
            </span>
            <span
              className="text-[9px] text-muted-foreground leading-tight mt-0.5"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              {user.spotifyUser}
            </span>
          </div>
          {user.profilePic ? (
            <ImageWithFallback
              src={user.profilePic}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-border object-cover flex-shrink-0"
              fallback={(
                <div
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ fontFamily: 'var(--font-space-mono)' }}
                >
                  {getInitials(user.name)}
                </div>
              )}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              {getInitials(user.name)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
