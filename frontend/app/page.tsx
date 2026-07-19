'use client'

import { useApp } from '@/context/AppContext'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'
import ContentGrid from '@/components/content-grid'
import { ProfileView } from '@/components/music-dna/ProfileView'
import { LoginPage } from '@/components/auth/LoginPage'
import { motion } from 'framer-motion'
import { RefreshCw, User, LogOut, CheckCircle, Database, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const {
    user,
    logout,
    activeItem,
    setActiveItem,
    tracks,
    recentlyPlayed,
    syncStatus,
    syncProgress,
    syncData,
    lastSynced,
    profile,
    refreshDNA,
    isRefreshingDNA
  } = useApp()

  // Guard Clause: Authentication
  if (!user) {
    return <LoginPage />
  }

  // Calculate dynamic stats
  const totalPlayCount = tracks.reduce((acc, t) => acc + t.playCount, 0)
  const uniqueArtistsCount = new Set(tracks.map(t => t.artistId)).size
  const uniqueAlbumsCount = new Set(tracks.map(t => t.albumId)).size
  
  // Dynamic mapped Top Artists
  const artistMap: { [id: string]: { name: string; playCount: number; genre: string; imageUrl: string } } = {}
  tracks.forEach(track => {
    if (track.artistId) {
      if (!artistMap[track.artistId]) {
        artistMap[track.artistId] = {
          name: track.artistName,
          playCount: 0,
          genre: track.genres[0] || 'Unknown Genre',
          imageUrl: track.artistImageUrl || ''
        }
      }
      artistMap[track.artistId].playCount += track.playCount
    }
  })
  
  const dynamicTopArtists = Object.keys(artistMap)
    .map(id => ({
      id,
      name: artistMap[id].name,
      subtitle: artistMap[id].genre,
      count: `${artistMap[id].playCount} plays`,
      imageUrl: artistMap[id].imageUrl
    }))
    .sort((a, b) => parseInt(b.count) - parseInt(a.count))
    .slice(0, 3)

  // Dynamic mapped Top Albums
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
  
  const dynamicTopAlbums = Object.keys(albumMap)
    .map(id => ({
      id,
      name: albumMap[id].name,
      subtitle: albumMap[id].artist,
      count: `${albumMap[id].playCount} plays`,
      imageUrl: albumMap[id].imageUrl
    }))
    .sort((a, b) => parseInt(b.count) - parseInt(a.count))
    .slice(0, 3)

  // Dynamic mapped Top Tracks
  const dynamicTopTracks = [...tracks]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      name: t.name,
      subtitle: t.artistName,
      count: `${t.playCount} plays`,
      imageUrl: t.imageUrl
    }))

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 md:p-12">
            
            {/* PROFILE VIEW */}
            {activeItem === 'profile' ? (
              <ProfileView />
            ) : 
            
            // SETTINGS VIEW
            activeItem === 'settings' ? (
              <div className="space-y-12">
                <div className="pb-6 border-b border-border/30">
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground uppercase">Settings</h2>
                  <p className="text-sm text-muted-foreground font-mono">Manage Sona credentials and sync caches.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Account Info */}
                  <section className="premium-card space-y-6">
                    <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Account info
                    </h3>
                    
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Spotify Name</span>
                        <span className="text-foreground font-bold">{user.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Spotify Email</span>
                        <span className="text-foreground">{user.email}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Connection</span>
                        <span className="text-foreground uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-foreground" /> Connected
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={logout}
                      className="border border-foreground bg-foreground text-background hover:bg-foreground/80 font-mono font-bold text-xs uppercase tracking-wider w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Button>
                  </section>

                  {/* Sync Settings */}
                  <section className="premium-card space-y-6">
                    <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Spotify sync
                    </h3>

                    <div className="space-y-4">
                      {/* Spotify Data Sync */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-muted-foreground uppercase font-bold">Sync listening history</span>
                          <span className="text-muted-foreground">Last: {lastSynced || 'Never'}</span>
                        </div>
                        <Button
                          onClick={syncData}
                          disabled={syncStatus === 'syncing'}
                          className="border border-border hover:bg-secondary/40 text-foreground font-mono font-bold text-xs uppercase tracking-wider w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {syncStatus === 'syncing' ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                <RefreshCw className="w-4 h-4" />
                              </motion.div>
                              <span>Syncing...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Refresh Spotify Data</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Recalculate Music DNA */}
                      <div className="space-y-2 pt-4 border-t border-border/30">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-muted-foreground uppercase font-bold">Compute Music DNA</span>
                          <span className="text-muted-foreground">Cache: {profile ? 'Active' : 'Empty'}</span>
                        </div>
                        <Button
                          onClick={refreshDNA}
                          disabled={isRefreshingDNA}
                          className="border border-border hover:bg-secondary/40 text-foreground font-mono font-bold text-xs uppercase tracking-wider w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isRefreshingDNA ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
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
                    </div>
                  </section>
                </div>
              </div>
            ) : 
            
            // DASHBOARD VIEW (Clean and minimal layout)
            (
              <>
                {/* Welcome section & Hero Card */}
                <div className="premium-card bg-card border border-border/80 p-8 md:p-12 mb-8 relative overflow-hidden rounded-2xl">
                  <div className="relative z-10 space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono">
                      Spotify Account
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-foreground">
                      Hi, {user.name.split(' ')[0]}
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-xl">
                      Your music metrics are loaded. You have streamed {totalPlayCount} plays across {uniqueArtistsCount} artists.
                    </p>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-6 pt-6 font-mono border-t border-border/30">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Unique Artists</p>
                        <p className="text-xl font-bold text-foreground">{uniqueArtistsCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Last Sync</p>
                        <p className="text-sm font-bold text-foreground uppercase pt-1">
                          {syncStatus === 'syncing' ? 'Syncing...' : lastSynced ? 'Completed' : 'Pending First Sync'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Artists */}
                <ContentGrid
                  title="Top Artists"
                  items={dynamicTopArtists}
                  icon="trending"
                />

                {/* Top Albums */}
                <ContentGrid
                  title="Top Albums"
                  items={dynamicTopAlbums}
                  icon="music"
                />

                {/* Top Tracks */}
                <ContentGrid
                  title="Top Tracks"
                  items={dynamicTopTracks}
                  icon="chart"
                />

                {/* Recently Played */}
                <div className="mb-12">
                  <h3 className="text-lg font-bold mb-6 uppercase tracking-wider font-mono text-foreground">Recently Played</h3>
                  
                  <div className="space-y-3 font-mono">
                    {recentlyPlayed.map((track) => (
                      <div
                        key={track.id}
                        className="premium-card flex items-center justify-between group hover:bg-secondary/40 rounded-xl py-4 px-5 border border-border/80 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {track.imageUrl ? (
                            <img
                              src={track.imageUrl}
                              alt={track.name}
                              className="w-10 h-10 object-cover rounded-lg border border-border/30"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-secondary/60 rounded-lg flex items-center justify-center border border-border/30">
                              <Music className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-foreground text-sm uppercase leading-tight">
                              {track.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{track.artistName}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{track.playedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Spacer */}
            <div className="h-20" />
          </div>
        </main>
      </div>
    </div>
  )
}
