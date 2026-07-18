'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { MusicDNAProfile, SpotifyTrackMeta } from '@/types/musicDNA'
import { MusicDNAService } from '@/services/music-dna/MusicDNAService'
import { supabase } from '@/lib/supabase'

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
  profile: MusicDNAProfile | null
  refreshDNA: () => Promise<void>
  isRefreshingDNA: boolean
  
  // Navigation
  activeItem: string
  setActiveItem: (item: string) => void
  isSupabaseConfigured: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

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
  const [profile, setProfile] = useState<MusicDNAProfile | null>(null)
  const [isRefreshingDNA, setIsRefreshingDNA] = useState(false)

  // Hold OAuth provider token inside ref
  const providerTokenRef = useRef<string | null>(null)
  const isSupabaseConfigured = !!supabase

  // 1. Listen to Supabase Auth Changes if configured
  useEffect(() => {
    if (!supabase) return

    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        providerTokenRef.current = session.provider_token || null
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
        providerTokenRef.current = session.provider_token || null
        setUser({
          name: session.user.user_metadata.full_name || 'Spotify User',
          email: session.user.email || '',
          profilePic: session.user.user_metadata.avatar_url || '',
          spotifyConnected: true,
          spotifyUser: session.user.user_metadata.user_name || session.user.id
        })
      } else {
        providerTokenRef.current = null
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Load cached tracks and profiles on mount (LocalStorage simulation fallback)
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
          scopes: 'user-top-read user-read-recently-played',
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
    setUser(null)
    setProfile(null)
    setActiveItem('dashboard')
  }

  // Spotify Data Sync: Real API fetches or simulator fallback
  const syncData = async () => {
    if (!user) return
    setSyncStatus('syncing')

    try {
      // Real Supabase + Spotify OAuth Token Sync Flow
      if (supabase && providerTokenRef.current) {
        const token = providerTokenRef.current
        
        setSyncProgress('Connecting to Spotify APIs...')
        
        // 1. Fetch Top Tracks
        setSyncProgress('Syncing Top Tracks...')
        const tracksRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=25&time_range=medium_term', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!tracksRes.ok) throw new Error('Spotify tracks sync failed')
        const tracksData = await tracksRes.json()
        
        // 2. Fetch Audio Features
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

        // 3. Fetch Top Artists
        setSyncProgress('Syncing Top Artists...')
        const artistsRes = await fetch('https://api.spotify.com/v1/me/top/artists?limit=15&time_range=medium_term', {
          headers: { Authorization: `Bearer ${token}` }
        })
        let artistGenresMap: { [name: string]: string[] } = {}
        if (artistsRes.ok) {
          const artistsData = await artistsRes.json()
          artistsData.items.forEach((artist: any) => {
            artistGenresMap[artist.name] = artist.genres || []
          })
        }

        // 4. Map to Sona Track Formats
        setSyncProgress('Mapping taste index parameters...')
        const mappedTracks: SpotifyTrackMeta[] = tracksData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          popularity: item.popularity,
          albumId: item.album.id,
          albumName: item.album.name,
          artistId: item.artists[0]?.id || '',
          artistName: item.artists[0]?.name || '',
          genres: artistGenresMap[item.artists[0]?.name] || ['pop'],
          playCount: Math.floor(Math.random() * 15) + 5, // Simulated count weighting
          audioFeatures: audioFeaturesMap[item.id] || {
            energy: 0.5,
            acousticness: 0.2,
            instrumentalness: 0.1,
            danceability: 0.5,
            valence: 0.5,
            tempo: 110
          }
        }))

        setTracks(mappedTracks)
        localStorage.setItem('sona_cached_tracks', JSON.stringify(mappedTracks))

        // Save DNA Profile to Supabase Database
        const userId = (await supabase.auth.getUser()).data.user?.id || 'user-sona-id'
        const newDNA = MusicDNAService.calculateDNA(mappedTracks)
        const updatedProfile = await MusicDNAService.saveProfile(userId, newDNA)
        setProfile(updatedProfile)
      } else {
        // Fallback to high-fidelity simulator sync if offline / keys missing
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
      }

      const now = new Date().toLocaleString()
      setLastSynced(now)
      localStorage.setItem('sona_last_synced', now)
      setSyncStatus('completed')
      setSyncProgress('Sync Complete!')
    } catch (err: any) {
      console.error('Data Sync Error:', err)
      setSyncStatus('error')
      setSyncProgress('Sync Failed. Check API configuration.')
    }

    setTimeout(() => {
      setSyncStatus('idle')
      setSyncProgress('')
    }, 3000)
  }

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
