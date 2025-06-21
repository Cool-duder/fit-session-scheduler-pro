
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type Session = {
  id: string
  client_id: string
  client_name: string
  date: string
  time: string
  duration: number
  package: string
  status: string
  location?: string
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      console.log('Fetched sessions:', data)
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addSession = async (sessionData: Omit<Session, 'id'>) => {
    try {
      console.log('Adding session to database:', sessionData)
      
      // Ensure time is in the correct format (HH:MM:SS)
      let formattedTime = sessionData.time;
      if (sessionData.time.length === 5) {
        formattedTime = sessionData.time + ':00'; // Add seconds if not present
      }
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          client_id: sessionData.client_id,
          client_name: sessionData.client_name,
          date: sessionData.date,
          time: formattedTime,
          duration: sessionData.duration,
          package: sessionData.package,
          status: sessionData.status || 'confirmed',
          location: sessionData.location || 'TBD'
        }])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Session added successfully:', data)
      setSessions(prev => [...prev, data])
      toast({
        title: "Success",
        description: "Session scheduled successfully",
      })
      
      return data
    } catch (error) {
      console.error('Error adding session:', error)
      toast({
        title: "Error",
        description: "Failed to schedule session",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return { sessions, loading, addSession, refetch: fetchSessions }
}
