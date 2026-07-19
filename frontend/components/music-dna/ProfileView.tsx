'use client'

import { useApp } from '@/context/AppContext'
import { TopGenreData, TopArtistData, TopAlbumData } from '@/types/musicDNA'
import {
  DNAHorizontalBar,
  DNACircularProgress,
  DNAMetricPill,
  DNARadialCard
} from './DNAVisualization'
import { MusicHabits } from './MusicHabits'
import { TasteSummaryView } from './TasteSummaryView'
import { motion } from 'framer-motion'
import { RefreshCw, Music, Disc, User, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProfileView() {
  const { profile, tracks, refreshDNA, isRefreshingDNA: isRefreshing } = useApp()

  if (!profile || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-foreground/40" />
        </motion.div>
        <p className="text-muted-foreground animate-pulse text-xs font-mono">Loading Music DNA Profile...</p>
      </div>
    )
  }

  // 1. Calculate Top Genres
  const genrePlays: { [name: string]: number } = {}
  let totalPlays = 0
  tracks.forEach(track => {
    track.genres.forEach(genre => {
      genrePlays[genre] = (genrePlays[genre] || 0) + track.playCount
      totalPlays += track.playCount
    })
  })
  
  const topGenres: TopGenreData[] = Object.keys(genrePlays)
    .map(name => ({
      name,
      playCount: genrePlays[name],
      percentage: Math.round((genrePlays[name] / Math.max(1, totalPlays)) * 100)
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5)

  // 2. Calculate Top Artists
  const artistMap: { [id: string]: { name: string; playCount: number; genre: string; imageUrl: string } } = {}
  tracks.forEach(track => {
    if (track.artistId) {
      if (!artistMap[track.artistId]) {
        artistMap[track.artistId] = {
          name: track.artistName,
          playCount: 0,
          genre: track.genres[0] || 'pop',
          imageUrl: track.artistImageUrl || ''
        }
      }
      artistMap[track.artistId].playCount += track.playCount
    }
  })
  
  const topArtists: TopArtistData[] = Object.keys(artistMap)
    .map(id => ({
      id,
      name: artistMap[id].name,
      subtitle: artistMap[id].genre,
      count: `${artistMap[id].playCount} plays`,
      playCount: artistMap[id].playCount,
      imageUrl: artistMap[id].imageUrl
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)

  // 3. Calculate Top Albums
  const albumMap: { [id: string]: { name: string; playCount: number; artist: string; imageUrl: string } } = {}
  tracks.forEach(track => {
    if (track.albumId) {
      if (!albumMap[track.albumId]) {
        albumMap[track.albumId] = {
          name: track.albumName,
          playCount: 0,
          artist: track.artistName,
          imageUrl: track.imageUrl || ''
        }
      }
      albumMap[track.albumId].playCount += track.playCount
    }
  })
  
  const topAlbums: TopAlbumData[] = Object.keys(albumMap)
    .map(id => ({
      id,
      name: albumMap[id].name,
      subtitle: albumMap[id].artist,
      count: `${albumMap[id].playCount} plays`,
      playCount: albumMap[id].playCount,
      imageUrl: albumMap[id].imageUrl
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)

  return (
    <div className="space-y-12">
      {/* Header and Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/30">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground uppercase">Music DNA</h2>
          <p className="text-xs text-muted-foreground font-mono">
            A multidimensional representation of your musical identity calculated from play logs.
          </p>
        </div>
        <Button
          onClick={refreshDNA}
          disabled={isRefreshing}
          className="relative border border-border hover:bg-secondary/60 text-foreground font-mono font-bold text-xs uppercase tracking-wider py-2 px-6 rounded-xl min-w-[180px] self-start sm:self-auto cursor-pointer"
        >
          {isRefreshing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.div>
              <span>Recalculating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Music DNA</span>
            </>
          )}
        </Button>
      </div>

      {/* Main DNA Grid */}
      <section className="space-y-6">
        {/* Metric Pills */}
        <div className="flex flex-wrap gap-3">
          <DNAMetricPill label="Acousticness" value={`${profile.acousticness}%`} icon={<Music className="w-3.5 h-3.5" />} />
          <DNAMetricPill label="Electronic" value={`${profile.electronic}%`} icon={<Activity className="w-3.5 h-3.5" />} />
          <DNAMetricPill label="Tempo preference" value={profile.tempo_preference > 65 ? 'High (Upbeat)' : profile.tempo_preference < 35 ? 'Low (Chill)' : 'Balanced'} icon={<Activity className="w-3.5 h-3.5" />} />
          <DNAMetricPill label="Darkness" value={`${profile.darkness}%`} icon={<Disc className="w-3.5 h-3.5" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DNACircularProgress label="Energy" value={profile.energy} strokeWidth={6} size={110} delay={0.05} />
          <DNACircularProgress label="Melancholy" value={profile.melancholy} strokeWidth={6} size={110} color="var(--accent)" delay={0.1} />
          <DNACircularProgress label="Atmospheric" value={profile.atmospheric} strokeWidth={6} size={110} color="var(--accent)" delay={0.15} />
          <DNACircularProgress label="Complexity" value={profile.complexity} strokeWidth={6} size={110} color="var(--accent)" delay={0.2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DNARadialCard
            title="Experimental vs Mainstream"
            description="Measures your affinity for avant-garde arrangements and outlier genres vs billboard sensations."
            value={profile.experimental}
            delay={0.25}
          />
          <DNARadialCard
            title="Loyalty Coefficient"
            description="Calculates how deeply you invest in particular artist discographies over time."
            value={Math.round((profile.replay_rate + profile.album_listener) / 2)}
            delay={0.3}
          />
        </div>
      </section>

      {/* Grid for Genres & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Genres */}
        <section className="premium-card bg-card border border-border/80 p-6 rounded-xl space-y-6">
          <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
            <Music className="w-4 h-4" />
            Top Genres
          </h3>
          <div className="space-y-6">
            {topGenres.map((g, idx) => (
              <DNAHorizontalBar
                key={g.name}
                label={g.name}
                value={g.percentage}
                delay={idx * 0.05}
                colorClass={idx === 0 ? "from-foreground to-foreground/60" : "from-muted-foreground/30 to-muted-foreground/10"}
              />
            ))}
          </div>
        </section>

        {/* Taste Summary */}
        <TasteSummaryView profile={profile} />
      </div>

      {/* Top Artists & Albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Artists */}
        <section className="space-y-6">
          <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
            <User className="w-4 h-4" />
            Top Artists
          </h3>
          <div className="space-y-3">
            {topArtists.map((artist) => (
              <div
                key={artist.id}
                className="premium-card flex items-center justify-between hover:bg-secondary/40 rounded-xl p-4 border border-border/80 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-12 h-12 object-cover rounded-full border border-border/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center border border-border/30">
                      <User className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase leading-tight">{artist.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{artist.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono font-bold bg-secondary border border-border px-3 py-1 rounded-lg">
                  {artist.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Albums */}
        <section className="space-y-6">
          <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
            <Disc className="w-4 h-4" />
            Top Albums
          </h3>
          <div className="space-y-3">
            {topAlbums.map((album) => (
              <div
                key={album.id}
                className="premium-card flex items-center justify-between hover:bg-secondary/40 rounded-xl p-4 border border-border/80 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {album.imageUrl ? (
                    <img
                      src={album.imageUrl}
                      alt={album.name}
                      className="w-12 h-12 object-cover rounded-lg border border-border/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center border border-border/30">
                      <Disc className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase leading-tight">{album.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{album.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono font-bold bg-secondary border border-border px-3 py-1 rounded-lg">
                  {album.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Listening Habits */}
      <section className="space-y-6">
        <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
          <Activity className="w-4 h-4" />
          Listening Habits
        </h3>
        <MusicHabits profile={profile} />
      </section>

      {/* Spacer */}
      <div className="h-10" />
    </div>
  )
}
