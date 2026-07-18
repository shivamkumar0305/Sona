'use client'

import { useApp } from '@/context/AppContext'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'
import HeroCard from '@/components/hero-card'
import ContentGrid from '@/components/content-grid'
import ActivityChart from '@/components/activity-chart'
import GenreCards from '@/components/genre-cards'
import { ProfileView } from '@/components/music-dna/ProfileView'
import { LoginPage } from '@/components/auth/LoginPage'
import { motion } from 'framer-motion'
import { RefreshCw, Play, Disc, User, LogOut, CheckCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const {
    user,
    logout,
    activeItem,
    setActiveItem,
    tracks,
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

  // 1. Calculate dynamic statistics
  const uniqueArtists = new Set(tracks.map(t => t.artistId)).size
  const uniqueAlbums = new Set(tracks.map(t => t.albumId)).size
  const totalPlayCount = tracks.reduce((acc, t) => acc + t.playCount, 0)
  
  // Dynamic mapped Top Artists
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
  
  const dynamicTopArtists = Object.keys(artistMap)
    .map(id => ({
      id,
      name: artistMap[id].name,
      subtitle: artistMap[id].genre,
      count: `${artistMap[id].playCount} plays`
    }))
    .sort((a, b) => parseInt(b.count) - parseInt(a.count))
    .slice(0, 3)

  // Dynamic mapped Top Albums
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
  
  const dynamicTopAlbums = Object.keys(albumMap)
    .map(id => ({
      id,
      name: albumMap[id].name,
      subtitle: albumMap[id].artist,
      count: `${albumMap[id].playCount} plays`
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
      count: `${t.playCount} plays`
    }))

  // Dynamic mapped Recently Played
  const recentlyPlayedList = [...tracks]
    .slice(0, 3)
    .map((t, idx) => {
      const times = ['12 min ago', '2 hours ago', 'Yesterday']
      return {
        id: t.id,
        name: t.name,
        subtitle: t.artistName,
        count: times[idx] || 'Recently'
      }
    })

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
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">Settings</h2>
                  <p className="text-muted-foreground">Manage your Spotify account link, sync frequency, and data profile caches.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Account Information */}
                  <section className="premium-card space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <User className="w-5 h-5 text-accent" />
                      Account Connection
                    </h3>
                    
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Linked Account</span>
                        <span className="text-foreground font-bold">{user.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Email Address</span>
                        <span className="text-foreground">{user.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Spotify Username</span>
                        <span className="text-foreground lowercase">{user.spotifyUser}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Connection Status</span>
                        <span className="text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Connected
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={logout}
                      className="border border-destructive bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive font-mono font-bold text-xs uppercase tracking-wider w-full py-3 rounded-none flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Sona</span>
                    </Button>
                  </section>

                  {/* Sync and DNA controls */}
                  <section className="premium-card space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Database className="w-5 h-5 text-accent" />
                      Spotify Engine
                    </h3>

                    <div className="space-y-4">
                      {/* Spotify Data Sync */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-muted-foreground uppercase font-bold">Sync listening history</span>
                          <span className="text-muted-foreground">Last: {lastSynced || 'Never'}</span>
                        </div>
                        <Button
                          onClick={syncData}
                          disabled={syncStatus === 'syncing'}
                          className="border border-accent bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent font-mono font-bold text-xs uppercase tracking-wider w-full py-3 rounded-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {syncStatus === 'syncing' ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                <RefreshCw className="w-4 h-4" />
                              </motion.div>
                              <span>Syncing tracks...</span>
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
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-muted-foreground uppercase font-bold">Compute Music DNA</span>
                          <span className="text-muted-foreground">Cache: {profile ? 'Active' : 'Empty'}</span>
                        </div>
                        <Button
                          onClick={refreshDNA}
                          disabled={isRefreshingDNA}
                          className="border border-accent/60 bg-transparent hover:bg-accent/10 text-foreground font-mono font-bold text-xs uppercase tracking-wider w-full py-3 rounded-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isRefreshingDNA ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                <RefreshCw className="w-4 h-4" />
                              </motion.div>
                              <span>Recalculating DNA...</span>
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
            
            // DASHBOARD VIEW
            (
              <>
                {/* Dynamic Welcome section & Hero Card */}
                <div className="premium-card premium-gradient p-8 md:p-12 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  
                  <div className="relative z-10 space-y-4">
                    <p className="text-xs uppercase tracking-widest text-accent font-bold font-mono">
                      Connected to Spotify
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">
                      Hi, {user.name.split(' ')[0]}
                    </h2>
                    <p className="text-muted-foreground font-mono max-w-xl text-sm leading-relaxed">
                      Your Sona matrix has indexed {totalPlayCount} plays across {uniqueArtists} artists.
                      {lastSynced && ` Your dashboard was last synced with Spotify on ${lastSynced}.`}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6 pt-6 font-mono border-t border-border/30">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Unique Artists</p>
                        <p className="text-2xl font-bold text-foreground">{uniqueArtists}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Unique Albums</p>
                        <p className="text-2xl font-bold text-foreground">{uniqueAlbums}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Last Sync</p>
                        <p className="text-sm font-bold text-accent uppercase pt-1">{syncStatus === 'syncing' ? 'Syncing...' : lastSynced ? 'Completed' : 'Offline'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Chart */}
                <ActivityChart />

                {/* Genre Cards */}
                <GenreCards />

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
                  <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider font-mono">Recently Played</h3>
                  
                  <div className="space-y-2 font-mono">
                    {recentlyPlayedList.map((track) => (
                      <div
                        key={track.id}
                        className="premium-card flex items-center justify-between group hover:bg-card/80 cursor-pointer py-4"
                      >
                        <div>
                          <h4 className="font-bold text-foreground group-hover:text-accent transition-colors text-sm uppercase">
                            {track.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">{track.subtitle}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{track.count}</span>
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
