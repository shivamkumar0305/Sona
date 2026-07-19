'use client'

import { useApp } from '@/context/AppContext'
import { TopGenreData, TopArtistData, TopAlbumData } from '@/types/musicDNA'
import { DNAHorizontalBar, DNACircularProgress, DNAMetricPill, DNARadialCard } from './DNAVisualization'
import { MusicHabits } from './MusicHabits'
import { TasteSummaryView } from './TasteSummaryView'
import { motion } from 'framer-motion'
import { RefreshCw, Disc, User } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export function ProfileView() {
  const { profile, tracks, refreshDNA, isRefreshingDNA: isRefreshing } = useApp()

  if (!profile || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <RefreshCw className="w-7 h-7 text-muted-foreground/40 animate-spin-slow" />
        <p className="mono-label animate-pulse">Loading Music DNA…</p>
      </div>
    )
  }

  /* ── Genre map ── */
  const genrePlays: Record<string, number> = {}
  let totalGenreWeight = 0
  tracks.forEach(t => {
    const trackGenres = t.genres.filter(g => g && g.toLowerCase() !== 'pop').slice(0, 3)
    trackGenres.forEach(g => {
      genrePlays[g] = (genrePlays[g] || 0) + t.playCount
      totalGenreWeight += t.playCount
    })
  })
  const topGenres: TopGenreData[] = Object.keys(genrePlays)
    .map(name => ({ name, playCount: genrePlays[name], percentage: Math.round((genrePlays[name] / Math.max(1, totalGenreWeight)) * 100) }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 6)

  /* ── Artist map ── */
  const artistMap: Record<string, { name: string; playCount: number; trackIds: Set<string>; imageUrl: string }> = {}
  tracks.forEach(t => {
    if (!t.artistId) return
    if (!artistMap[t.artistId]) {
      artistMap[t.artistId] = {
        name: t.artistName,
        playCount: 0,
        trackIds: new Set(),
        imageUrl: t.artistImageUrl || t.imageUrl || ''
      }
    }
    if (!artistMap[t.artistId].imageUrl && (t.artistImageUrl || t.imageUrl)) {
      artistMap[t.artistId].imageUrl = t.artistImageUrl || t.imageUrl || ''
    }
    artistMap[t.artistId].trackIds.add(t.id)
    artistMap[t.artistId].playCount += t.playCount
  })
  const topArtists: TopArtistData[] = Object.entries(artistMap)
    .map(([id, v]) => ({
      id,
      name: v.name,
      subtitle: `${v.trackIds.size} ${v.trackIds.size === 1 ? 'track' : 'tracks'}`,
      count: `${v.playCount} plays`,
      playCount: v.playCount,
      imageUrl: v.imageUrl
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 4)

  /* ── Album map ── */
  const albumMap: Record<string, { name: string; playCount: number; artist: string; imageUrl: string }> = {}
  tracks.forEach(t => {
    if (!t.albumId) return
    if (!albumMap[t.albumId]) albumMap[t.albumId] = { name: t.albumName, playCount: 0, artist: t.artistName, imageUrl: t.imageUrl || '' }
    albumMap[t.albumId].playCount += t.playCount
  })
  const topAlbums: TopAlbumData[] = Object.entries(albumMap)
    .map(([id, v]) => ({ id, name: v.name, subtitle: v.artist, count: `${v.playCount} plays`, playCount: v.playCount, imageUrl: v.imageUrl }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 4)

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-1" style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.03em' }}>
            Music DNA
          </h2>
          <p className="mono-label">Multidimensional analysis of your sonic identity.</p>
        </div>
        <button onClick={refreshDNA} disabled={isRefreshing} className="btn-outline self-start sm:self-auto cursor-pointer">
          {isRefreshing ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}><RefreshCw className="w-3.5 h-3.5" /></motion.div>Recalculating…</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" />Refresh DNA</>
          )}
        </button>
      </div>

      {/* Key metric circles */}
      <div>
        <p className="section-title">Core metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Energy', value: profile.energy, delay: 0 },
            { label: 'Melancholy', value: profile.melancholy, delay: 0.06 },
            { label: 'Atmospheric', value: profile.atmospheric, delay: 0.12 },
            { label: 'Complexity', value: profile.complexity, delay: 0.18 },
          ].map(m => (
            <DNACircularProgress key={m.label} label={m.label} value={m.value} size={110} strokeWidth={5} delay={m.delay} />
          ))}
        </div>
      </div>

      {/* Experimental & Loyalty */}
      <div>
        <p className="section-title">Taste characteristics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DNARadialCard
            title="Experimental vs Mainstream"
            description="Affinity for avant-garde and outlier genres versus chart-toppers."
            value={profile.experimental}
            delay={0.1}
          />
          <DNARadialCard
            title="Artist Loyalty"
            description="Depth of investment in particular artist discographies over time."
            value={Math.round((profile.replay_rate + profile.album_listener) / 2)}
            delay={0.16}
          />
        </div>
      </div>

      {/* Genres & Summary side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Genres */}
        <div className="premium-card space-y-5">
          <p className="section-title mb-0">Top Genres</p>
          {topGenres.length > 0 ? (
            <div className="space-y-5">
              {topGenres.map((g, i) => (
                <DNAHorizontalBar
                  key={g.name}
                  label={g.name}
                  value={g.percentage}
                  delay={i * 0.04}
                  colorClass={i === 0 ? 'from-foreground to-foreground/70' : 'from-muted-foreground/40 to-muted-foreground/10'}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-space-mono)' }}>
              Spotify did not return genre metadata for these tracks yet. Sync again after listening data changes.
            </p>
          )}
        </div>

        {/* Taste summary */}
        <TasteSummaryView profile={profile} />
      </div>

      {/* Artists & Albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Artists */}
        <div>
          <p className="section-title">Top Artists</p>
          <div className="space-y-2">
            {topArtists.map(artist => (
              <div key={artist.id} className="list-row cursor-pointer">
                {artist.imageUrl ? (
                  <ImageWithFallback
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover border border-border/60 flex-shrink-0"
                    fallback={(
                      <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-syne)', textTransform: 'none' }}>{artist.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate capitalize">{artist.subtitle}</p>
                </div>
                <span className="count-badge flex-shrink-0">{artist.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Albums */}
        <div>
          <p className="section-title">Top Albums</p>
          <div className="space-y-2">
            {topAlbums.map(album => (
              <div key={album.id} className="list-row cursor-pointer">
                {album.imageUrl ? (
                  <ImageWithFallback
                    src={album.imageUrl}
                    alt={album.name}
                    className="w-10 h-10 rounded-xl object-cover border border-border/60 flex-shrink-0"
                    fallback={(
                      <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                        <Disc className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Disc className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-syne)', textTransform: 'none' }}>{album.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{album.subtitle}</p>
                </div>
                <span className="count-badge flex-shrink-0">{album.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Habits */}
      <div>
        <p className="section-title">Listening Habits</p>
        <MusicHabits profile={profile} />
      </div>

      <div className="h-8" />
    </div>
  )
}
