'use client'

import { MusicDNAProfile } from '@/types/musicDNA'
import { motion } from 'framer-motion'
import { Disc, RotateCcw, Compass, Users, Sparkles } from 'lucide-react'

interface MusicHabitsProps { profile: MusicDNAProfile }

export function MusicHabits({ profile }: MusicHabitsProps) {
  const habits = [
    {
      id: 'album',
      label: 'Album Listener',
      value: profile.album_listener,
      icon: <Disc className="w-3.5 h-3.5" />,
      note: profile.album_listener > 60
        ? 'You prefer full-album journeys and cohesive artist narratives.'
        : 'You thrive on curated playlists and track-by-track exploration.',
    },
    {
      id: 'replay',
      label: 'Replay Rate',
      value: profile.replay_rate,
      icon: <RotateCcw className="w-3.5 h-3.5" />,
      note: profile.replay_rate > 55
        ? 'You return to favourite tracks often, valuing depth over breadth.'
        : 'You rarely loop the same track twice — always seeking the next thing.',
    },
    {
      id: 'discovery',
      label: 'Discovery',
      value: profile.discovery,
      icon: <Compass className="w-3.5 h-3.5" />,
      note: profile.discovery > 60
        ? 'You actively explore underground artists and emerging sounds.'
        : 'You build trust in a curated set of established artists.',
    },
    {
      id: 'mainstream',
      label: 'Mainstream Lean',
      value: profile.mainstream,
      icon: <Users className="w-3.5 h-3.5" />,
      note: profile.mainstream > 65
        ? 'Your taste gravitates toward chart-defining cultural moments.'
        : 'You actively avoid the mainstream, carving a distinct niche.',
    },
    {
      id: 'diversity',
      label: 'Genre Diversity',
      value: Math.round((100 - profile.mainstream + profile.experimental) / 2),
      icon: <Sparkles className="w-3.5 h-3.5" />,
      note: Math.round((100 - profile.mainstream + profile.experimental) / 2) > 45
        ? 'You move fluidly across genres, from ambient to trap without friction.'
        : 'You maintain a focused, consistent sonic palette.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((h, i) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          className="premium-card flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground flex-shrink-0">
                {h.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
                {h.label}
              </span>
            </div>
            <span className="text-sm font-extrabold text-foreground" style={{ fontFamily: 'var(--font-syne)' }}>
              {h.value}%
            </span>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${h.value}%` }} />
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-space-mono)' }}>
            {h.note}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
