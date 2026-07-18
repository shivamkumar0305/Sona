'use client'

import { MusicDNAProfile, ListeningHabitInsight } from '@/types/musicDNA'
import { motion } from 'framer-motion'
import { Disc, RotateCcw, Compass, Users, Sparkles, UserCheck, Shuffle } from 'lucide-react'

interface MusicHabitsProps {
  profile: MusicDNAProfile
}

export function MusicHabits({ profile }: MusicHabitsProps) {
  const habits: (ListeningHabitInsight & { icon: React.ReactNode })[] = [
    {
      id: 'album',
      title: 'Album Listener',
      percentage: profile.album_listener,
      icon: <Disc className="w-5 h-5" />,
      shortExplanation: profile.album_listener > 60
        ? 'You love full-album journeys, preferring cohesive structural stories over random hits.'
        : 'You prefer curated tracks and playlist-hopping over sitting through full-length albums.'
    },
    {
      id: 'replay',
      title: 'Replay Rate',
      percentage: profile.replay_rate,
      icon: <RotateCcw className="w-5 h-5" />,
      shortExplanation: profile.replay_rate > 55
        ? 'You have deep musical roots, frequently revisiting favorite anthems for comfort.'
        : 'You are a fast explorer, rarely looping the same track twice and constantly seeking new vibes.'
    },
    {
      id: 'discovery',
      title: 'Discovery Score',
      percentage: profile.discovery,
      icon: <Compass className="w-5 h-5" />,
      shortExplanation: profile.discovery > 60
        ? 'You actively hunt for rising talent and underground sounds outside your rotation.'
        : 'You prefer sticking to familiar records and trusting your established libraries.'
    },
    {
      id: 'popularity',
      title: 'Popularity Bias',
      percentage: profile.mainstream,
      icon: <Users className="w-5 h-5" />,
      shortExplanation: profile.mainstream > 65
        ? 'Your taste leans toward chart-toppers and cultural sensations that define the moment.'
        : 'You actively avoid the mainstream, curating a highly distinct niche library.'
    },
    {
      id: 'diversity',
      title: 'Listening Diversity',
      percentage: Math.round((profile.acousticness + profile.electronic + profile.experimental) / 3),
      icon: <Shuffle className="w-5 h-5" />,
      shortExplanation: Math.round((profile.acousticness + profile.electronic + profile.experimental) / 3) > 50
        ? 'Your rotation blends acoustic, electronic, and avant-garde styles with absolute ease.'
        : 'Your library focuses on a highly-tuned and unified acoustic or electronic preference.'
    },
    {
      id: 'loyalty',
      title: 'Artist Loyalty',
      percentage: Math.round((profile.replay_rate + profile.album_listener) / 2),
      icon: <UserCheck className="w-5 h-5" />,
      shortExplanation: Math.round((profile.replay_rate + profile.album_listener) / 2) > 55
        ? 'You establish deep bonds with creators, following their entire discographies closely.'
        : 'You are track-centric; you appreciate songs regardless of who sings them.'
    },
    {
      id: 'genre_diversity',
      title: 'Genre Diversity',
      percentage: Math.round((100 - profile.mainstream + profile.experimental) / 2),
      icon: <Sparkles className="w-5 h-5" />,
      shortExplanation: Math.round((100 - profile.mainstream + profile.experimental) / 2) > 45
        ? 'You bridge disparate cultures, moving between standard pop, IDM, and indie folk seamlessly.'
        : 'You maintain a highly focused palette centered around specific signature genres.'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map((habit, index) => (
        <motion.div
          key={habit.id}
          className="premium-card bg-card/60 border border-border/40 hover:border-border hover:bg-card flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                {habit.icon}
              </div>
              <span className="text-xl font-extrabold text-foreground">{habit.percentage}%</span>
            </div>
            
            <h4 className="font-bold text-foreground text-base mb-2">{habit.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{habit.shortExplanation}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${habit.percentage}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
