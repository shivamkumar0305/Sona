import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Export the real supabase client if environment variables exist, otherwise fallback to local database simulation
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// High fidelity Local Database simulator
export class LocalDBSimulator {
  private static STORAGE_KEY = 'sona_music_profiles';

  static getProfile(userId: string) {
    if (typeof window === 'undefined') return null;
    const profiles = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return profiles[userId] || null;
  }

  static saveProfile(userId: string, profile: any) {
    if (typeof window === 'undefined') return;
    const profiles = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    profiles[userId] = {
      ...profile,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    return profiles[userId];
  }
}
