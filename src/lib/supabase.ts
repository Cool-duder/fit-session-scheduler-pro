
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable')
  throw new Error('Supabase URL is required. Please check your environment variables.')
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable')
  throw new Error('Supabase Anonymous Key is required. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          package: string
          sessions_left: number
          total_sessions: number
          monthly_count: number
          regular_slot: string
          join_date: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          package: string
          sessions_left?: number
          total_sessions?: number
          monthly_count?: number
          regular_slot?: string
          join_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          package?: string
          sessions_left?: number
          total_sessions?: number
          monthly_count?: number
          regular_slot?: string
          join_date?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          client_id: string
          client_name: string
          date: string
          time: string
          duration: number
          package: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          client_name: string
          date: string
          time: string
          duration: number
          package: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          client_name?: string
          date?: string
          time?: string
          duration?: number
          package?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}
