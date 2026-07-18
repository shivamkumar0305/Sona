import { MusicDNAProfile, SpotifyTrackMeta } from '@/types/musicDNA';
import { supabase, LocalDBSimulator } from '@/lib/supabase';

// Helper to bound values between 0 and 100
function clamp(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export class MusicDNAService {
  /**
   * Generates a MusicDNAProfile based on Spotify metadata and listening history.
   */
  static calculateDNA(tracks: SpotifyTrackMeta[]): Omit<MusicDNAProfile, 'user_id' | 'updated_at'> {
    if (!tracks || tracks.length === 0) {
      return this.getDefaultDNA();
    }

    let totalEnergy = 0;
    let totalValence = 0;
    let totalAcousticness = 0;
    let totalDanceability = 0;
    let totalInstrumentalness = 0;
    let totalPopularity = 0;
    let totalTempo = 0;

    let hasAudioFeaturesCount = 0;
    let experimentalGenreCount = 0;
    let electronicGenreCount = 0;
    let atmosphericGenreCount = 0;
    let complexGenreCount = 0;
    let totalGenreCounts = 0;

    const uniqueTrackIds = new Set<string>();
    const uniqueAlbumIds = new Set<string>();
    const albumTrackCounts: { [albumId: string]: Set<string> } = {};
    const artistPlayCounts: { [artistId: string]: number } = {};
    let totalPlays = 0;

    tracks.forEach((track) => {
      totalPlays += track.playCount;
      uniqueTrackIds.add(track.id);
      
      if (track.albumId) {
        uniqueAlbumIds.add(track.albumId);
        if (!albumTrackCounts[track.albumId]) {
          albumTrackCounts[track.albumId] = new Set();
        }
        albumTrackCounts[track.albumId].add(track.id);
      }

      if (track.artistId) {
        artistPlayCounts[track.artistId] = (artistPlayCounts[track.artistId] || 0) + track.playCount;
      }

      totalPopularity += track.popularity * track.playCount;

      // Extract Audio Features
      if (track.audioFeatures) {
        hasAudioFeaturesCount += track.playCount;
        totalEnergy += (track.audioFeatures.energy ?? 0.5) * track.playCount;
        totalValence += (track.audioFeatures.valence ?? 0.5) * track.playCount;
        totalAcousticness += (track.audioFeatures.acousticness ?? 0.2) * track.playCount;
        totalDanceability += (track.audioFeatures.danceability ?? 0.5) * track.playCount;
        totalInstrumentalness += (track.audioFeatures.instrumentalness ?? 0.1) * track.playCount;
        totalTempo += (track.audioFeatures.tempo ?? 115) * track.playCount;
      }

      // Check genres
      if (track.genres) {
        track.genres.forEach((genre) => {
          totalGenreCounts += track.playCount;
          const g = genre.toLowerCase();
          
          if (
            g.includes('experimental') ||
            g.includes('avant-garde') ||
            g.includes('noise') ||
            g.includes('post-rock') ||
            g.includes('idm') ||
            g.includes('free jazz') ||
            g.includes('ambient')
          ) {
            experimentalGenreCount += track.playCount;
          }

          if (
            g.includes('electronic') ||
            g.includes('techno') ||
            g.includes('house') ||
            g.includes('edm') ||
            g.includes('electro') ||
            g.includes('synth') ||
            g.includes('ambient')
          ) {
            electronicGenreCount += track.playCount;
          }

          if (
            g.includes('ambient') ||
            g.includes('shoegaze') ||
            g.includes('dream pop') ||
            g.includes('atmospheric') ||
            g.includes('cinematic') ||
            g.includes('drone')
          ) {
            atmosphericGenreCount += track.playCount;
          }

          if (
            g.includes('prog') ||
            g.includes('math rock') ||
            g.includes('jazz') ||
            g.includes('classical') ||
            g.includes('complexity') ||
            g.includes('complex')
          ) {
            complexGenreCount += track.playCount;
          }
        });
      }
    });

    // Averaging calculations
    const weightTotal = hasAudioFeaturesCount || totalPlays;
    const avgEnergy = hasAudioFeaturesCount > 0 ? totalEnergy / hasAudioFeaturesCount : 0.5;
    const avgValence = hasAudioFeaturesCount > 0 ? totalValence / hasAudioFeaturesCount : 0.5;
    const avgAcousticness = hasAudioFeaturesCount > 0 ? totalAcousticness / hasAudioFeaturesCount : 0.25;
    const avgDanceability = hasAudioFeaturesCount > 0 ? totalDanceability / hasAudioFeaturesCount : 0.5;
    const avgInstrumentalness = hasAudioFeaturesCount > 0 ? totalInstrumentalness / hasAudioFeaturesCount : 0.15;
    const avgTempo = hasAudioFeaturesCount > 0 ? totalTempo / hasAudioFeaturesCount : 115;
    const avgPopularity = totalPopularity / totalPlays;

    // Numerical columns mappings
    const energyScore = clamp(avgEnergy * 100);
    const melancholyScore = clamp((1 - avgValence) * 100);
    const darknessScore = clamp((1 - (avgValence + avgEnergy) / 2) * 100);
    const acousticnessScore = clamp(avgAcousticness * 100);
    const electronicScore = clamp(
      (electronicGenreCount / Math.max(1, totalGenreCounts)) * 60 +
      (avgInstrumentalness > 0.4 && avgEnergy > 0.4 ? 20 : 0) +
      (hasAudioFeaturesCount > 0 && avgAcousticness < 0.2 ? 20 : 0)
    );
    const experimentalScore = clamp(
      (experimentalGenreCount / Math.max(1, totalGenreCounts)) * 80 +
      (100 - avgPopularity) * 0.2
    );
    const mainstreamScore = clamp(avgPopularity);
    const discoveryScore = clamp(
      (100 - avgPopularity) * 0.5 + 
      (uniqueTrackIds.size / Math.max(1, totalPlays)) * 50
    );

    // Replay behavior: unique tracks / total plays. High unique = low replay rate.
    const replayRateScore = clamp(
      (1 - (uniqueTrackIds.size / Math.max(1, totalPlays))) * 100
    );

    // Album vs Single Listener
    // If unique albums is low compared to track count, user tends to stream individual tracks
    // If user plays multiple tracks from the same album, it suggests album listening
    let totalAlbumCohesiveness = 0;
    let albumsWithMultiplePlays = 0;
    Object.keys(albumTrackCounts).forEach((albumId) => {
      const tracksPlayedInAlbum = albumTrackCounts[albumId].size;
      if (tracksPlayedInAlbum > 1) {
        albumsWithMultiplePlays++;
        totalAlbumCohesiveness += tracksPlayedInAlbum;
      }
    });

    const albumRatio = uniqueAlbumIds.size / Math.max(1, uniqueTrackIds.size);
    // Conservative heuristics: lower ratio of albums to tracks means user listens to tracks from SAME albums
    const albumScore = clamp(
      (albumsWithMultiplePlays > 0 ? 40 : 0) +
      (1 - Math.min(1, albumRatio)) * 60
    );
    const singleScore = clamp(100 - albumScore);

    const instrumentalScore = clamp(avgInstrumentalness * 100);
    const lyricalScore = clamp((1 - avgInstrumentalness) * 100);
    const danceabilityScore = clamp(avgDanceability * 100);
    const atmosphericScore = clamp(
      (atmosphericGenreCount / Math.max(1, totalGenreCounts)) * 50 +
      (avgAcousticness > 0.5 ? 20 : 0) +
      (avgInstrumentalness > 0.4 ? 30 : 0)
    );

    const complexityScore = clamp(
      (complexGenreCount / Math.max(1, totalGenreCounts)) * 40 +
      (avgTempo > 135 || avgTempo < 85 ? 30 : 0) +
      (experimentalScore > 50 ? 30 : 0)
    );

    // Tempo preference: low BPM (<95) = 20, mid (95-125) = 50, high (>125) = 80
    let tempoPref = 50;
    if (avgTempo < 95) {
      tempoPref = clamp(20 + (avgTempo / 95) * 20);
    } else if (avgTempo > 125) {
      tempoPref = clamp(70 + Math.min(30, ((avgTempo - 125) / 50) * 30));
    } else {
      tempoPref = clamp(40 + ((avgTempo - 95) / 30) * 30);
    }

    return {
      energy: energyScore,
      darkness: darknessScore,
      acousticness: acousticnessScore,
      electronic: electronicScore,
      experimental: experimentalScore,
      mainstream: mainstreamScore,
      discovery: discoveryScore,
      replay_rate: replayRateScore,
      album_listener: albumScore,
      single_listener: singleScore,
      instrumental: instrumentalScore,
      lyrical: lyricalScore,
      danceability: danceabilityScore,
      melancholy: melancholyScore,
      atmospheric: atmosphericScore,
      complexity: complexityScore,
      tempo_preference: tempoPref
    };
  }

  static getDefaultDNA(): Omit<MusicDNAProfile, 'user_id' | 'updated_at'> {
    return {
      energy: 58,
      darkness: 42,
      acousticness: 34,
      electronic: 45,
      experimental: 31,
      mainstream: 68,
      discovery: 54,
      replay_rate: 48,
      album_listener: 62,
      single_listener: 38,
      instrumental: 25,
      lyrical: 75,
      danceability: 64,
      melancholy: 46,
      atmospheric: 52,
      complexity: 38,
      tempo_preference: 54,
    };
  }

  /**
   * Sync/save music DNA to database or simulator cache
   */
  static async saveProfile(userId: string, profile: Omit<MusicDNAProfile, 'user_id' | 'updated_at'>): Promise<MusicDNAProfile> {
    const fullProfile = {
      ...profile,
      user_id: userId,
      updated_at: new Date().toISOString()
    } as MusicDNAProfile;

    if (supabase) {
      const { data, error } = await supabase
        .from('music_profiles')
        .upsert(fullProfile)
        .select()
        .single();
      if (!error && data) {
        return data as MusicDNAProfile;
      }
    }

    // Always fallback to simulated DB
    LocalDBSimulator.saveProfile(userId, fullProfile);
    return fullProfile;
  }

  /**
   * Fetch current user profile
   */
  static async getProfile(userId: string): Promise<MusicDNAProfile | null> {
    if (supabase) {
      const { data } = await supabase
        .from('music_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) return data as MusicDNAProfile;
    }

    return LocalDBSimulator.getProfile(userId);
  }

  /**
   * Mock Spotify Listening Data provider
   */
  static getMockListeningData(): SpotifyTrackMeta[] {
    return [
      {
        id: 'track1',
        name: 'Neon Horizon',
        popularity: 78,
        albumId: 'album1',
        albumName: 'Digital Ethereal',
        artistId: 'artist1',
        artistName: 'Luminous Wave',
        genres: ['electronic', 'synthwave', 'ambient electronic'],
        playCount: 15,
        audioFeatures: { energy: 0.72, acousticness: 0.12, instrumentalness: 0.65, danceability: 0.68, valence: 0.58, tempo: 122 }
      },
      {
        id: 'track2',
        name: 'Silica Waves',
        popularity: 42,
        albumId: 'album2',
        albumName: 'Midnight Echoes',
        artistId: 'artist2',
        artistName: 'Jazz Collective',
        genres: ['jazz', 'cool jazz', 'instrumental jazz'],
        playCount: 12,
        audioFeatures: { energy: 0.38, acousticness: 0.88, instrumentalness: 0.85, danceability: 0.45, valence: 0.42, tempo: 88 }
      },
      {
        id: 'track3',
        name: 'Fractal Dream',
        popularity: 56,
        albumId: 'album3',
        albumName: 'Neon Horizons',
        artistId: 'artist3',
        artistName: 'Sonic Dream',
        genres: ['indie rock', 'dream pop', 'shoegaze', 'post-rock'],
        playCount: 9,
        audioFeatures: { energy: 0.62, acousticness: 0.32, instrumentalness: 0.22, danceability: 0.51, valence: 0.34, tempo: 118 }
      },
      {
        id: 'track4',
        name: 'Late Night Transit',
        popularity: 81,
        albumId: 'album1',
        albumName: 'Digital Ethereal',
        artistId: 'artist1',
        artistName: 'Luminous Wave',
        genres: ['electronic', 'synthwave', 'ambient electronic'],
        playCount: 18,
        audioFeatures: { energy: 0.68, acousticness: 0.15, instrumentalness: 0.70, danceability: 0.72, valence: 0.48, tempo: 120 }
      },
      {
        id: 'track5',
        name: 'Dissonance Theory',
        popularity: 28,
        albumId: 'album4',
        albumName: 'Out of Bounds',
        artistId: 'artist4',
        artistName: 'The Glitch',
        genres: ['experimental electronic', 'idm', 'noise'],
        playCount: 7,
        audioFeatures: { energy: 0.85, acousticness: 0.05, instrumentalness: 0.80, danceability: 0.58, valence: 0.21, tempo: 140 }
      },
      {
        id: 'track6',
        name: 'Echoes in the Dark',
        popularity: 64,
        albumId: 'album5',
        albumName: 'Lunar Spheres',
        artistId: 'artist5',
        artistName: 'Stella Nova',
        genres: ['ambient', 'drone', 'atmospheric'],
        playCount: 11,
        audioFeatures: { energy: 0.22, acousticness: 0.92, instrumentalness: 0.90, danceability: 0.25, valence: 0.15, tempo: 72 }
      },
      {
        id: 'track7',
        name: 'Folkways',
        popularity: 61,
        albumId: 'album6',
        albumName: 'Pine & Needle',
        artistId: 'artist6',
        artistName: 'Arthur Greenwood',
        genres: ['folk', 'acoustic', 'singer-songwriter'],
        playCount: 6,
        audioFeatures: { energy: 0.41, acousticness: 0.85, instrumentalness: 0.01, danceability: 0.48, valence: 0.65, tempo: 92 }
      }
    ];
  }
}
