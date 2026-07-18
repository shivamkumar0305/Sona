import { useState, useEffect, useCallback } from 'react';
import { MusicDNAProfile } from '@/types/musicDNA';
import { MusicDNAService } from '@/services/music-dna/MusicDNAService';

export function useMusicDNA(userId: string = 'demo-user-id') {
  const [profile, setProfile] = useState<MusicDNAProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data = await MusicDNAService.getProfile(userId);
      
      // If no profile exists yet, generate initial one from default/mock data
      if (!data) {
        const mockTracks = MusicDNAService.getMockListeningData();
        const baseDNA = MusicDNAService.calculateDNA(mockTracks);
        data = await MusicDNAService.saveProfile(userId, baseDNA);
      }
      
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching music profile DNA:', err);
      setError(err?.message || 'Failed to load Music DNA Profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refreshDNA = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Simulating a Spotify sync fetch
      const mockTracks = MusicDNAService.getMockListeningData();
      
      // Let's add slight variance to simulate new listening session updates
      const updatedTracks = mockTracks.map(t => ({
        ...t,
        playCount: t.playCount + Math.floor(Math.random() * 5) // Adds deterministic-feeling updates
      }));
      
      const newDNA = MusicDNAService.calculateDNA(updatedTracks);
      const data = await MusicDNAService.saveProfile(userId, newDNA);
      
      // Force UI delay for a premium feel, letting animations finish
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setProfile(data);
    } catch (err: any) {
      console.error('Error refreshing music profile DNA:', err);
      setError(err?.message || 'Failed to refresh Music DNA Profile');
    } finally {
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isRefreshing,
    error,
    refreshDNA,
    refetch: fetchProfile
  };
}
