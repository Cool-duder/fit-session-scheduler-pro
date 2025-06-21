
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'undefined')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey || 'undefined')
  
  // Provide a more helpful error message
  throw new Error(`
    Supabase configuration is missing. Please ensure:
    1. You've connected to Supabase via the green button in the top right
    2. Your environment variables are properly set
    3. Try refreshing the page after connecting to Supabase
    
    Missing: ${!supabaseUrl ? 'VITE_SUPABASE_URL ' : ''}${!supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''}
  `)
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
