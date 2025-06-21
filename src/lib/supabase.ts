import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

// Create a placeholder client if variables are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration is missing. Please connect to Supabase using the green button in the top right.')
    // Return a mock client that won't break the app
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

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
