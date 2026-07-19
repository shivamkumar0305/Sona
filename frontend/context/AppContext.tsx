'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { MusicDNAProfile, SpotifyTrackMeta } from '@/types/musicDNA'
import { MusicDNAService } from '@/services/music-dna/MusicDNAService'
import { supabase } from '@/lib/supabase'

export interface SpotifyRecentTrack {
  id: string
  name: string
  artistName: string
  imageUrl: string
  playedAt: string
}

interface UserSession {
  name: string
  email: string
  profilePic: string
  spotifyConnected: boolean
  spotifyUser: string
}

interface AppContextType {
  user: UserSession | null
  login: () => Promise<void>
  logout: () => void
  isLoggingIn: boolean
  
  // Spotify Sync
  lastSynced: string | null
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error'
  syncProgress: string
  syncData: () => Promise<void>
  
  // Dynamic Listening Data
  tracks: SpotifyTrackMeta[]
  recentlyPlayed: SpotifyRecentTrack[]
  profile: MusicDNAProfile | null
  refreshDNA: () => Promise<void>
  isRefreshingDNA: boolean
  
  // Navigation
  activeItem: string
  setActiveItem: (item: string) => void
  isSupabaseConfigured: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Helper to format relative time from timestamp
function getRelativeTime(timestamp: string): string {
  const now = new Date()
  const played = new Date(timestamp)
  const diffMs = now.getTime() - played.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeItem, setActiveItem] = useState('dashboard')
  
  // Spotify Sync States
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle')
  const [syncProgress, setSyncProgress] = useState('')
  
  // Music DNA States
  const [tracks, setTracks] = useState<SpotifyTrackMeta[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyRecentTrack[]>([])
  const [profile, setProfile] = useState<MusicDNAProfile | null>(null)
  const [isRefreshingDNA, setIsRefreshingDNA] = useState(false)

  // Hold OAuth provider token inside ref and localStorage to persist across refreshes
  const providerTokenRef = useRef<string | null>(null)
  const isSupabaseConfigured = !!supabase

  // 1. Listen to Supabase Auth Changes if configured
  useEffect(() => {
    if (!supabase) return

    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.provider_token) {
          providerTokenRef.current = session.provider_token
          localStorage.setItem('sona_spotify_token', session.provider_token)
        } else {
          providerTokenRef.current = localStorage.getItem('sona_spotify_token')
        }
        setUser({
          name: session.user.user_metadata.full_name || 'Spotify User',
          email: session.user.email || '',
          profilePic: session.user.user_metadata.avatar_url || '',
          spotifyConnected: true,
          spotifyUser: session.user.user_metadata.user_name || session.user.id
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        if (session.provider_token) {
          providerTokenRef.current = session.provider_token
          localStorage.setItem('sona_spotify_token', session.provider_token)
        } else {
          providerTokenRef.current = localStorage.getItem('sona_spotify_token')
        }
        setUser({
          name: session.user.user_metadata.full_name || 'Spotify User',
          email: session.user.email || '',
          profilePic: session.user.user_metadata.avatar_url || '',
          spotifyConnected: true,
          spotifyUser: session.user.user_metadata.user_name || session.user.id
        })
      } else {
        providerTokenRef.current = null
        localStorage.removeItem('sona_spotify_token')
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Load cached tracks, recently played, and profiles on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLastSynced = localStorage.getItem('sona_last_synced')
      if (savedLastSynced) setLastSynced(savedLastSynced)
      
      const cachedTracks = localStorage.getItem('sona_cached_tracks')
      if (cachedTracks) {
        setTracks(JSON.parse(cachedTracks))
      } else {
        const defaultTracks = MusicDNAService.getMockListeningData()
        setTracks(defaultTracks)
        localStorage.setItem('sona_cached_tracks', JSON.stringify(defaultTracks))
      }

      const cachedRecent = localStorage.getItem('sona_cached_recent')
      if (cachedRecent) {
        setRecentlyPlayed(JSON.parse(cachedRecent))
      } else {
        // Fallback simulator recent tracks
        const mockRecent: SpotifyRecentTrack[] = [
          { id: 'recent1', name: 'Echo Chamber', artistName: 'Various Artists', imageUrl: '', playedAt: '12m ago' },
          { id: 'recent2', name: 'Midnight Flow', artistName: 'Luna State', imageUrl: '', playedAt: '2h ago' },
          { id: 'recent3', name: 'Velocity Zero', artistName: 'Crystal Mind', imageUrl: '', playedAt: 'Yesterday' }
        ]
        setRecentlyPlayed(mockRecent)
      }

      if (!supabase) {
        const savedUser = localStorage.getItem('sona_session')
        if (savedUser) setUser(JSON.parse(savedUser))
      }
    }
  }, [])

  // 3. Fetch DNA Profile when user or tracks state settles
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      
      const userId = supabase 
        ? (await supabase.auth.getUser()).data.user?.id || 'user-sona-id'
        : 'user-sona-id'
      
      let existingProfile = await MusicDNAService.getProfile(userId)
      
      if (!existingProfile && tracks.length > 0) {
        const calculated = MusicDNAService.calculateDNA(tracks)
        existingProfile = await MusicDNAService.saveProfile(userId, calculated)
      }
      
      setProfile(existingProfile)
    }
    loadProfile()
  }, [user, tracks])

  // Login Flow: Real Supabase OAuth or mock simulator fallback
  const login = async () => {
    setIsLoggingIn(true)
    
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'user-read-email user-top-read user-read-recently-played',
          redirectTo: window.location.origin
        }
      })
      if (error) {
        console.error('Supabase OAuth Error:', error)
        setIsLoggingIn(false)
      }
    } else {
      // Fallback Simulator Login
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const sessionUser: UserSession = {
        name: 'John Doe',
        email: 'john.doe@spotify.com',
        profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        spotifyConnected: true,
        spotifyUser: 'johndoe_sp'
      }
      setUser(sessionUser)
      localStorage.setItem('sona_session', JSON.stringify(sessionUser))
      setIsLoggingIn(false)
    }
  }

  // Logout Flow
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('sona_session')
    }
    localStorage.removeItem('sona_spotify_token')
    localStorage.removeItem('sona_cached_tracks')
    localStorage.removeItem('sona_cached_recent')
    localStorage.removeItem('sona_last_synced')
    providerTokenRef.current = null
    setUser(null)
    setProfile(null)
    setTracks(MusicDNAService.getMockListeningData())
    setRecentlyPlayed([])
    setActiveItem('dashboard')
  }

  // Spotify Data Sync: Real API fetches or simulator fallback
  const syncData = useCallback(async () => {
    if (!user) return
    setSyncStatus('syncing')

    if (!providerTokenRef.current) {
      providerTokenRef.current = localStorage.getItem('sona_spotify_token')
    }

    try {
      // Real Supabase + Spotify OAuth Token Sync Flow
      if (supabase && providerTokenRef.current) {
        const token = providerTokenRef.current
        console.log('Initiating Spotify OAuth Sync...')
        
        setSyncProgress('Connecting to Spotify APIs...')
        
        // 1. Fetch Top Tracks
        setSyncProgress('Syncing Top Tracks...')
        const tracksRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=25&time_range=medium_term', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!tracksRes.ok) throw new Error(`Tracks fetch returned status ${tracksRes.status}`)
        const tracksData = await tracksRes.json()

        // 2. Fetch Artists details (GENRES and IMAGES) for all unique artists in the top tracks!
        setSyncProgress('Syncing artist genres and details...')
        const artistIds = Array.from(
          new Set(tracksData.items.map((t: any) => t.artists[0]?.id).filter(Boolean))
        )
        
        let artistGenresMap: { [id: string]: string[] } = {}
        let artistImagesMap: { [id: string]: string } = {}
        
        if (artistIds.length > 0) {
          const artistsRes = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.slice(0, 50).join(',')}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (artistsRes.ok) {
            const artistsData = await artistsRes.json()
            artistsData.artists.forEach((art: any) => {
              if (art) {
                artistGenresMap[art.id] = art.genres || []
                artistImagesMap[art.id] = art.images?.[0]?.url || ''
              }
            })
          }
        }

        // 3. Fetch Audio Features
        setSyncProgress('Syncing Audio features analysis...')
        const trackIds = tracksData.items.map((t: any) => t.id)
        let audioFeaturesMap: { [id: string]: any } = {}
        
        if (trackIds.length > 0) {
          const featuresRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (featuresRes.ok) {
            const featuresData = await featuresRes.json()
            featuresData.audio_features.forEach((feat: any) => {
              if (feat) {
                audioFeaturesMap[feat.id] = {
                  energy: feat.energy,
                  acousticness: feat.acousticness,
                  instrumentalness: feat.instrumentalness,
                  danceability: feat.danceability,
                  valence: feat.valence,
                  tempo: feat.tempo
                }
              }
            })
          }
        }

        // 4. Fetch Recently Played
        setSyncProgress('Syncing Recently Played...')
        const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        })
        let mappedRecent: SpotifyRecentTrack[] = []
        if (recentRes.ok) {
          const recentData = await recentRes.json()
          mappedRecent = recentData.items.map((item: any) => ({
            id: item.track.id + '-' + item.played_at,
            name: item.track.name,
            artistName: item.track.artists?.[0]?.name || '',
            imageUrl: item.track.album?.images?.[0]?.url || '',
            playedAt: getRelativeTime(item.played_at)
          }))
        }
        setRecentlyPlayed(mappedRecent)
        localStorage.setItem('sona_cached_recent', JSON.stringify(mappedRecent))

        // 5. Map to Sona Track Formats
        setSyncProgress('Mapping taste index parameters...')
        const mappedTracks: SpotifyTrackMeta[] = tracksData.items.map((item: any) => {
          const primaryArtistId = item.artists[0]?.id || ''
          return {
            id: item.id,
            name: item.name,
            popularity: item.popularity,
            albumId: item.album.id,
            albumName: item.album.name,
            artistId: primaryArtistId,
            artistName: item.artists[0]?.name || '',
            genres: artistGenresMap[primaryArtistId] || ['pop'],
            playCount: Math.floor(Math.random() * 10) + 5,
            imageUrl: item.album.images?.[0]?.url || '',
            artistImageUrl: artistImagesMap[primaryArtistId] || '',
            audioFeatures: audioFeaturesMap[item.id] || {
              energy: 0.5,
              acousticness: 0.2,
              instrumentalness: 0.1,
              danceability: 0.5,
              valence: 0.5,
              tempo: 110
            }
          }
        })

        setTracks(mappedTracks)
        localStorage.setItem('sona_cached_tracks', JSON.stringify(mappedTracks))

        // Save DNA Profile to Supabase Database
        const userId = (await supabase.auth.getUser()).data.user?.id || 'user-sona-id'
        const newDNA = MusicDNAService.calculateDNA(mappedTracks)
        const updatedProfile = await MusicDNAService.saveProfile(userId, newDNA)
        setProfile(updatedProfile)
        
        console.log('Real Spotify Sync successful! Stored tracks count:', mappedTracks.length)
      } else {
        // Fallback to simulator sync
        console.log('No Spotify OAuth Token found. Running Simulator sync.')
        const steps = [
          { msg: 'Connecting to Spotify OAuth...', delay: 800 },
          { msg: 'Importing Top Artists from listening history...', delay: 900 },
          { msg: 'Importing Top Tracks & Audio analysis...', delay: 1100 },
          { msg: 'Rebuilding taste index matrices...', delay: 800 }
        ]

        for (const step of steps) {
          setSyncProgress(step.msg)
          await new Promise((resolve) => setTimeout(resolve, step.delay))
        }

        const originalTracks = MusicDNAService.getMockListeningData()
        const randomizedTracks = originalTracks.map(t => ({
          ...t,
          playCount: t.playCount + Math.floor(Math.random() * 5) + 1,
          popularity: Math.max(10, Math.min(99, t.popularity + Math.floor(Math.random() * 11) - 5))
        }))

        setTracks(randomizedTracks)
        localStorage.setItem('sona_cached_tracks', JSON.stringify(randomizedTracks))

        const newDNA = MusicDNAService.calculateDNA(randomizedTracks)
        const updatedProfile = await MusicDNAService.saveProfile('user-sona-id', newDNA)
        setProfile(updatedProfile)

        const mockRecent: SpotifyRecentTrack[] = [
          { id: 'recent1', name: 'Echo Chamber', artistName: 'Various Artists', imageUrl: '', playedAt: '2m ago' },
          { id: 'recent2', name: 'Midnight Flow', artistName: 'Luna State', imageUrl: '', playedAt: '45m ago' },
          { id: 'recent3', name: 'Velocity Zero', artistName: 'Crystal Mind', imageUrl: '', playedAt: 'Yesterday' }
        ]
        setRecentlyPlayed(mockRecent)
        localStorage.setItem('sona_cached_recent', JSON.stringify(mockRecent))
      }

      const now = new Date().toLocaleString()
      setLastSynced(now)
      localStorage.setItem('sona_last_synced', now)
      setSyncStatus('completed')
      setSyncProgress('Sync Complete!')
    } catch (err: any) {
      console.error('Data Sync Error:', err)
      setSyncStatus('error')
      setSyncProgress(`Sync Failed: ${err.message || 'API error'}`)
    }

    setTimeout(() => {
      setSyncStatus('idle')
      setSyncProgress('')
    }, 3000)
  }, [user])

  // 4. Auto-trigger sync on first login (if lastSynced is null)
  useEffect(() => {
    if (user && !lastSynced && syncStatus === 'idle') {
      const token = providerTokenRef.current || localStorage.getItem('sona_spotify_token')
      if (token) {
        syncData()
      }
    }
  }, [user, lastSynced, syncStatus, syncData])

  // Manual Refresh Music DNA
  const refreshDNA = async () => {
    if (!user || tracks.length === 0) return
    setIsRefreshingDNA(true)
    
    const userId = supabase
      ? (await supabase.auth.getUser()).data.user?.id || 'user-sona-id'
      : 'user-sona-id'

    const calculated = MusicDNAService.calculateDNA(tracks)
    const updatedProfile = await MusicDNAService.saveProfile(userId, calculated)
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProfile(updatedProfile)
    setIsRefreshingDNA(false)
  }

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggingIn,
        lastSynced,
        syncStatus,
        syncProgress,
        syncData,
        tracks,
        recentlyPlayed,
        profile,
        refreshDNA,
        isRefreshingDNA,
        activeItem,
        setActiveItem,
        isSupabaseConfigured
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
