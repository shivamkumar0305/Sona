'use client'

import { useApp } from '@/context/AppContext'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'
import ContentGrid from '@/components/content-grid'
import { ProfileView } from '@/components/music-dna/ProfileView'
import { LoginPage } from '@/components/auth/LoginPage'
import { motion } from 'framer-motion'
import { RefreshCw, User, LogOut, CheckCircle, Database } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

export default function Home() {
  const {
    user, logout, activeItem, setActiveItem,
    tracks, recentlyPlayed,
    syncStatus, syncProgress, syncData, lastSynced,
    profile, refreshDNA, isRefreshingDNA,
  } = useApp()

  if (!user) return <LoginPage />

  /* ── derived stats ── */
  const totalPlayCount = tracks.reduce((a, t) => a + t.playCount, 0)
  const uniqueArtistsCount = new Set(tracks.map(t => t.artistId)).size

  /* top artists */
  const artistMap: Record<string, { name: string; playCount: number; trackIds: Set<string>; imageUrl: string }> = {}
  tracks.forEach(track => {
    if (!track.artistId) return
    if (!artistMap[track.artistId]) {
      artistMap[track.artistId] = {
        name: track.artistName,
        playCount: 0,
        trackIds: new Set(),
        imageUrl: track.artistImageUrl || track.imageUrl || ''
      }
    }
    if (!artistMap[track.artistId].imageUrl && (track.artistImageUrl || track.imageUrl)) {
      artistMap[track.artistId].imageUrl = track.artistImageUrl || track.imageUrl || ''
    }
    artistMap[track.artistId].trackIds.add(track.id)
    artistMap[track.artistId].playCount += track.playCount
  })
  const topArtists = Object.entries(artistMap)
    .map(([id, v]) => ({
      id,
      name: v.name,
      subtitle: `${v.trackIds.size} ${v.trackIds.size === 1 ? 'track' : 'tracks'}`,
      count: `${v.playCount} plays`,
      imageUrl: v.imageUrl
    }))
    .sort((a, b) => parseInt(b.count) - parseInt(a.count))
    .slice(0, 6)

  /* top albums */
  const albumMap: Record<string, { name: string; playCount: number; artist: string; imageUrl: string }> = {}
  tracks.forEach(track => {
    if (!track.albumId) return
    if (!albumMap[track.albumId]) {
      albumMap[track.albumId] = { name: track.albumName, playCount: 0, artist: track.artistName, imageUrl: track.imageUrl || '' }
    }
    albumMap[track.albumId].playCount += track.playCount
  })
  const topAlbums = Object.entries(albumMap)
    .map(([id, v]) => ({ id, name: v.name, subtitle: v.artist, count: `${v.playCount} plays`, imageUrl: v.imageUrl }))
    .sort((a, b) => parseInt(b.count) - parseInt(a.count))
    .slice(0, 6)

  /* top tracks */
  const topTracks = [...tracks]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 6)
    .map(t => ({ id: t.id, name: t.name, subtitle: t.artistName, count: `${t.playCount} plays`, imageUrl: t.imageUrl }))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="flex-1 flex flex-col ml-60 min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-10">

            {/* ───── PROFILE / DNA ───── */}
            {activeItem === 'profile' ? (
              <ProfileView />

            /* ───── SETTINGS ───── */
            ) : activeItem === 'settings' ? (
              <div className="space-y-10 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
                    Settings
                  </h2>
                  <p className="mono-label">Manage your account and data sync.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Account */}
                  <div className="premium-card space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-8 h-8 bg-secondary rounded-xl border border-border flex items-center justify-center">
                        <User className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="text-sm font-extrabold uppercase tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>Account</h3>
                    </div>

                    <div className="space-y-3" style={{ fontFamily: 'var(--font-space-mono)' }}>
                      {[
                        { label: 'Name', value: user.name },
                        { label: 'Email', value: user.email },
                        { label: 'Status', value: 'Connected ✓' },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{row.label}</span>
                          <span className="text-[11px] font-bold text-foreground">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <button onClick={logout} className="btn-solid w-full justify-center cursor-pointer">
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>

                  {/* Sync */}
                  <div className="premium-card space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-8 h-8 bg-secondary rounded-xl border border-border flex items-center justify-center">
                        <Database className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="text-sm font-extrabold uppercase tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>Sync</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-3">
                          <span className="mono-label">Listening history</span>
                          <span className="mono-label">{lastSynced || 'Never synced'}</span>
                        </div>
                        <button
                          onClick={syncData}
                          disabled={syncStatus === 'syncing'}
                          className="btn-outline w-full justify-center cursor-pointer"
                        >
                          {syncStatus === 'syncing' ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                                <RefreshCw className="w-3.5 h-3.5" />
                              </motion.div>
                              Syncing…
                            </>
                          ) : (
                            <><RefreshCw className="w-3.5 h-3.5" /> Refresh Spotify Data</>
                          )}
                        </button>
                      </div>

                      <div className="pt-4 border-t border-border/40">
                        <div className="flex justify-between mb-3">
                          <span className="mono-label">Music DNA</span>
                          <span className="mono-label">{profile ? 'Cached' : 'Not computed'}</span>
                        </div>
                        <button
                          onClick={refreshDNA}
                          disabled={isRefreshingDNA}
                          className="btn-outline w-full justify-center cursor-pointer"
                        >
                          {isRefreshingDNA ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                                <RefreshCw className="w-3.5 h-3.5" />
                              </motion.div>
                              Recalculating…
                            </>
                          ) : (
                            <><RefreshCw className="w-3.5 h-3.5" /> Refresh Music DNA</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            /* ───── DASHBOARD ───── */
            ) : (
              <div className="space-y-12 animate-fade-up">

                {/* Hero welcome card */}
                <div className="premium-card overflow-hidden relative">
                  {/* Subtle decorative dot grid */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.035]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, oklch(0.08 0 0) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <p className="mono-label">Spotify account</p>
                      <h2
                        className="text-4xl font-extrabold tracking-tight text-foreground"
                        style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.03em' }}
                      >
                        Hi, {user.name.split(' ')[0]}
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm" style={{ fontFamily: 'var(--font-space-mono)' }}>
                        {syncStatus === 'error' && syncProgress
                          ? syncProgress
                          : tracks.length > 0
                          ? `${totalPlayCount} plays tracked across ${uniqueArtistsCount} artists.`
                          : 'Sync your Spotify data to see your stats.'}
                      </p>
                    </div>

                    {/* Stat chips */}
                    <div className="flex items-center justify-center gap-3 flex-wrap sm:flex-nowrap">
                      {[
                        { label: 'Artists', value: uniqueArtistsCount || '—' },
                        { label: 'Tracks', value: tracks.length || '—' },
                      ].map(stat => (
                        <div
                          key={stat.label}
                          className="flex h-[72px] min-w-[80px] flex-col items-center justify-center bg-secondary border border-border rounded-2xl px-5"
                        >
                          <span className="text-xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-syne)' }}>
                            {stat.value}
                          </span>
                          <span className="mono-label mt-1">{stat.label}</span>
                        </div>
                      ))}
                      <button
                        type="button"
                        disabled={syncStatus === 'syncing'}
                        className="group flex h-[72px] min-w-[90px] flex-col items-center justify-center gap-1 rounded-2xl border border-foreground bg-foreground px-5 text-background transition-all duration-200 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={syncData}
                      >
                        <RefreshCw className={`w-4 h-4 text-background ${syncStatus === 'syncing' ? 'animate-spin-slow' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-background/70" style={{ fontFamily: 'var(--font-space-mono)' }}>
                          {syncStatus === 'syncing' ? 'Syncing' : 'Sync'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Top Artists */}
                <ContentGrid title="Top Artists" items={topArtists} icon="trending" square />

                {/* Top Albums */}
                <ContentGrid title="Top Albums" items={topAlbums} icon="music" square />

                {/* Top Tracks */}
                <ContentGrid title="Top Tracks" items={topTracks} icon="chart" square />

                {/* Recently Played */}
                <div>
                  <p className="section-title">Recently Played</p>
                  <div className="space-y-2">
                    {recentlyPlayed.length === 0 ? (
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
                        No recent tracks yet — sync your Spotify data first.
                      </p>
                    ) : recentlyPlayed.map(track => (
                      <div key={track.id} className="list-row group cursor-pointer">
                        <div className="flex items-center gap-4 min-w-0">
                          {track.imageUrl ? (
                            <ImageWithFallback
                              src={track.imageUrl}
                              alt={track.name}
                              className="w-10 h-10 rounded-xl object-cover border border-border/60 flex-shrink-0"
                              fallback={(
                                <div className="w-10 h-10 bg-secondary rounded-xl border border-border flex-shrink-0" />
                              )}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-secondary rounded-xl border border-border flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-syne)', textTransform: 'none', letterSpacing: 'normal' }}>
                              {track.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{track.artistName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0" style={{ fontFamily: 'var(--font-space-mono)' }}>
                          {track.playedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-8" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
