'use client'

import { MusicDNAProfile } from '@/types/musicDNA'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

interface TasteSummaryViewProps { profile: MusicDNAProfile }

export function TasteSummaryView({ profile }: TasteSummaryViewProps) {
  const paragraphs: string[] = []

  /* ── Texture & Mood ── */
  if (profile.atmospheric > 60 && profile.melancholy > 55) {
    paragraphs.push("You gravitate toward atmospheric, emotionally rich soundscapes — music that feels like space rather than structure. Reverb, texture, and introspection are your defaults.")
  } else if (profile.energy > 60 && profile.danceability > 60) {
    paragraphs.push("Your taste skews high-energy and physically engaging. You are drawn to strong rhythms, kinetic production, and music that commands the room.")
  } else if (profile.acousticness > 55) {
    paragraphs.push("You prefer organic, intimate recordings — acoustic instruments, raw performances, and the warmth of analogue production over digital sheen.")
  } else {
    paragraphs.push("Your sound sits comfortably between the organic and the electronic. You move naturally between lush live arrangements and studio-crafted productions.")
  }

  /* ── Exploration vs Loyalty ── */
  if (profile.replay_rate > 55) {
    paragraphs.push("You invest deeply in what you love. Favourites get replayed, catalogues get explored cover to cover, and trust is earned slowly — but it lasts.")
  } else if (profile.discovery > 55) {
    paragraphs.push("Novelty drives you. You are constantly hunting for the next artist before the algorithm finds them, and your library reflects a restless, forward-moving curiosity.")
  } else {
    paragraphs.push("You balance comfort with curiosity — a core rotation of trusted artists alongside a healthy appetite for discovery without obsession.")
  }

  /* ── Format preference ── */
  if (profile.album_listener > 55) {
    paragraphs.push("Albums over singles. You respect the full listening arc and prefer experiencing an artist's intent from track one to close.")
  } else {
    paragraphs.push("You are playlist-native — comfortable with fragments, highlights, and assembling your own narrative across artists and moods.")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="premium-card flex flex-col gap-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
          Taste Summary
        </p>
      </div>

      <div className="space-y-4 pl-5 border-l-2 border-border">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[11px] text-muted-foreground leading-[1.8]"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            {p}
          </p>
        ))}
      </div>
    </motion.div>
  )
}
