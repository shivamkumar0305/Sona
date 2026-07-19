'use client'

import { useApp } from '@/context/AppContext'
import { MusicDNAService } from '@/services/music-dna/MusicDNAService'
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
import { RefreshCw, Music, Disc, User, Activity, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProfileView() {
  const { profile, tracks, refreshDNA, isRefreshingDNA: isRefreshing } = useApp()
  const isLoading = !profile
  const error = null


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
  const artistMap: { [id: string]: { name: string; playCount: number; genre: string } } = {}
  tracks.forEach(track => {
    if (track.artistId) {
      if (!artistMap[track.artistId]) {
        artistMap[track.artistId] = {
          name: track.artistName,
          playCount: 0,
          genre: track.genres[0] || 'Unknown Genre'
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
      playCount: artistMap[id].playCount
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)

  // 3. Calculate Top Albums
  const albumMap: { [id: string]: { name: string; playCount: number; artist: string } } = {}
  tracks.forEach(track => {
    if (track.albumId) {
      if (!albumMap[track.albumId]) {
        albumMap[track.albumId] = {
          name: track.albumName,
          playCount: 0,
          artist: track.artistName
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
      playCount: albumMap[id].playCount
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-accent" />
        </motion.div>
        <p className="text-muted-foreground animate-pulse text-sm">Decoding your Music DNA...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-bold mb-2">Failed to load Music DNA</h3>
        <p className="text-muted-foreground text-sm max-w-md mb-6">{error || 'An unknown error occurred.'}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Header and Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/30">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">Music DNA Engine</h2>
          <p className="text-muted-foreground">
            A multidimensional representation of your musical identity based on play habits and audio analysis.
          </p>
        </div>
        <Button
          onClick={refreshDNA}
          disabled={isRefreshing}
          className="relative premium-card flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground border-accent/40 bg-accent/10 text-accent font-bold py-2 px-6 rounded-xl min-w-[180px] self-start sm:self-auto cursor-pointer"
        >
          {isRefreshing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              <span>Recalculating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Music DNA</span>
            </>
          )}
        </Button>
      </div>

      {/* Main DNA Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Music DNA
        </h3>
        
        {/* Metric Pills */}
        <div className="flex flex-wrap gap-3">
          <DNAMetricPill label="Acousticness" value={`${profile.acousticness}%`} icon={<Music className="w-4 h-4" />} />
          <DNAMetricPill label="Electronic" value={`${profile.electronic}%`} icon={<Activity className="w-4 h-4" />} />
          <DNAMetricPill label="Tempo preference" value={profile.tempo_preference > 65 ? 'High (Upbeat)' : profile.tempo_preference < 35 ? 'Low (Chill)' : 'Balanced'} icon={<Activity className="w-4 h-4" />} />
          <DNAMetricPill label="Darkness" value={`${profile.darkness}%`} icon={<Disc className="w-4 h-4" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DNACircularProgress label="Energy" value={profile.energy} strokeWidth={8} size={130} delay={0.05} />
          <DNACircularProgress label="Melancholy" value={profile.melancholy} strokeWidth={8} size={130} color="oklch(0.55 0.15 50)" delay={0.1} />
          <DNACircularProgress label="Atmospheric" value={profile.atmospheric} strokeWidth={8} size={130} color="oklch(0.45 0.12 70)" delay={0.15} />
          <DNACircularProgress label="Complexity" value={profile.complexity} strokeWidth={8} size={130} color="oklch(0.35 0.1 200)" delay={0.2} />
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
        <section className="premium-card bg-card/30 border border-border/50 p-6 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Music className="w-5 h-5 text-accent" />
            Top Genres
          </h3>
          <div className="space-y-6">
            {topGenres.map((g, idx) => (
              <DNAHorizontalBar
                key={g.name}
                label={g.name}
                value={g.percentage}
                delay={idx * 0.05}
                colorClass={idx === 0 ? "from-accent to-accent/60" : "from-secondary-foreground/40 to-secondary-foreground/20"}
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
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            Top Artists
          </h3>
          <div className="space-y-3">
            {topArtists.map((artist) => (
              <div
                key={artist.id}
                className="premium-card flex items-center justify-between hover:bg-card/80 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-foreground">{artist.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{artist.subtitle}</p>
                </div>
                <span className="text-sm text-muted-foreground font-semibold bg-secondary/40 px-3 py-1 rounded-full border border-border/30">
                  {artist.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Albums */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Disc className="w-5 h-5 text-accent" />
            Top Albums
          </h3>
          <div className="space-y-3">
            {topAlbums.map((album) => (
              <div
                key={album.id}
                className="premium-card flex items-center justify-between hover:bg-card/80 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-foreground">{album.name}</h4>
                  <p className="text-sm text-muted-foreground">{album.subtitle}</p>
                </div>
                <span className="text-sm text-muted-foreground font-semibold bg-secondary/40 px-3 py-1 rounded-full border border-border/30">
                  {album.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Listening Habits */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Listening Habits
        </h3>
        <MusicHabits profile={profile} />
      </section>

      {/* Spacer */}
      <div className="h-10" />
    </div>
  )
}
