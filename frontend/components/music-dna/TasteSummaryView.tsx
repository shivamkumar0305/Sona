'use client'

import { MusicDNAProfile } from '@/types/musicDNA'
import { motion } from 'framer-motion'
import { Sparkles, Quote } from 'lucide-react'

interface TasteSummaryViewProps {
  profile: MusicDNAProfile
}

export function TasteSummaryView({ profile }: TasteSummaryViewProps) {
  const getTasteSummaryParagraphs = (prof: MusicDNAProfile): string[] => {
    const paragraphs: string[] = []

    // 1. Textures & Energy
    if (prof.atmospheric > 60 && prof.melancholy > 55) {
      paragraphs.push(
        "You strongly prefer atmospheric and emotionally dense music. You are drawn to spacious soundscapes, rich reverb, and reflective moods that let you get lost in the sound."
      )
    } else if (prof.energy > 60 && prof.danceability > 60) {
      paragraphs.push(
        "Your listening habits suggest you lean heavily toward high-energy, electrifying, and beat-driven soundscapes. You love driving tempos, sharp drums, and physical music that keeps you moving."
      )
    } else if (prof.acousticness > 55) {
      paragraphs.push(
        "You prefer organic, raw, and intimate performance-focused tracks. You are drawn to acoustic instruments, acoustic singer-songwriters, and clean live recording environments."
      )
    } else {
      paragraphs.push(
        "Your taste profile represents a balanced combination of electronic production and organic instrumental elements, switching naturally between studio perfection and raw acoustic performance."
      )
    }

    // 2. Artist Loyalty & Exploration
    if (prof.replay_rate > 55) {
      paragraphs.push(
        "You tend to establish deep roots with your music. You revisit favorite artists, classic tracks, and comfort records often, valuing familiarity and emotional connection over constant novelty."
      )
    } else if (prof.discovery > 55) {
      paragraphs.push(
        "You are an active musical voyager. You prefer to constantly explore fresh releases, uncover rising indie talent, and traverse obscure subgenres rather than letting your library grow static."
      )
    } else {
      paragraphs.push(
        "You strike a healthy equilibrium between your staple heavy rotation tracks and the thrill of discovery, maintaining a trusted circle of artists while keeping an eye open for new releases."
      )
    }

    // 3. Album Listening Habits
    if (prof.album_listener > 55) {
      paragraphs.push(
        "Your listening suggests a strong preference for cohesive, full-length albums over individual standalone singles. You respect the artist's overarching vision and structural storytelling."
      )
    } else {
      paragraphs.push(
        "You thrive on track-by-track playlists and singular anthem releases. You like to jump across artists and moods quickly, curating highly dynamic lists rather than sitting through full-length album journeys."
      )
    }

    // 4. Complexity & Style
    if (prof.experimental > 50 || prof.complexity > 55) {
      paragraphs.push(
        "Additionally, you have an ear for unconventional, experimental, or progressive song structures. You are not afraid of complex arrangements, time signature shifts, or avant-garde production."
      )
    } else if (prof.mainstream > 65) {
      paragraphs.push(
        "Additionally, you appreciate polished, high-production values and universally loved anthems. You love participating in current pop culture movements and mainstream blockbusters."
      )
    }

    return paragraphs
  }

  const paragraphs = getTasteSummaryParagraphs(profile)

  return (
    <motion.div
      className="premium-card bg-card border border-border/80 rounded-xl relative overflow-hidden p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-secondary text-foreground border border-border">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-foreground uppercase tracking-tight">Taste Summary</h3>
      </div>

      <div className="relative z-10 pl-6 border-l border-foreground/30 space-y-4 font-mono text-xs">
        <Quote className="absolute -left-[9px] -top-2.5 w-4 h-4 text-foreground/30 bg-background" />
        {paragraphs.map((p, idx) => (
          <p key={idx} className="text-muted-foreground leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </motion.div>
  )
}
