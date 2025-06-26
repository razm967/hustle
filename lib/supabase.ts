import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage implementation using sessionStorage for tab isolation
const tabIsolatedStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, value)
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key)
    }
  }
}

// Client-side Supabase client with tab-isolated sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2, // Reduce event frequency
    },
    heartbeatIntervalMs: 30000, // Increase heartbeat interval to 30s
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000), // Exponential backoff with max 30s
    timeout: 20000, // Increase timeout to 20s
  },
  auth: {
    storage: tabIsolatedStorage, // Use sessionStorage for tab isolation
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
}) 

// Database types
export interface UserProfile {
  id: string
  email: string
  role: 'employer' | 'employee'
  full_name?: string
  created_at: string
  updated_at: string
} 