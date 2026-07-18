export interface MusicDNAProfile {
  user_id: string;
  updated_at: string;
  energy: number; // 0 - 100
  darkness: number; // 0 - 100
  acousticness: number; // 0 - 100
  electronic: number; // 0 - 100
  experimental: number; // 0 - 100
  mainstream: number; // 0 - 100
  discovery: number; // 0 - 100
  replay_rate: number; // 0 - 100
  album_listener: number; // 0 - 100
  single_listener: number; // 0 - 100
  instrumental: number; // 0 - 100
  lyrical: number; // 0 - 100
  danceability: number; // 0 - 100
  melancholy: number; // 0 - 100
  atmospheric: number; // 0 - 100
  complexity: number; // 0 - 100
  tempo_preference: number; // 0 - 100
}

export interface SpotifyTrackMeta {
  id: string;
  name: string;
  popularity: number;
  albumId: string;
  albumName: string;
  artistId: string;
  artistName: string;
  genres: string[];
  playCount: number;
  // Optional audio features if Spotify returns them
  audioFeatures?: {
    energy?: number; // 0 to 1
    acousticness?: number; // 0 to 1
    instrumentalness?: number; // 0 to 1
    danceability?: number; // 0 to 1
    valence?: number; // 0 to 1 (high valence = happy, low valence = sad/melancholic)
    tempo?: number; // BPM
  };
}

export interface ListeningHabitInsight {
  id: string;
  title: string;
  percentage: number;
  shortExplanation: string;
}

export interface TasteSummaryData {
  paragraphs: string[];
}

export interface TopGenreData {
  name: string;
  percentage: number;
  playCount: number;
}

export interface TopArtistData {
  id: string;
  name: string;
  subtitle: string; // e.g. genre or status
  count: string; // e.g. "342 plays"
  playCount: number;
}

export interface TopAlbumData {
  id: string;
  name: string;
  subtitle: string; // e.g. artist name
  count: string; // e.g. "45 plays"
  playCount: number;
}
