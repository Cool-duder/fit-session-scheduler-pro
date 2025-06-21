
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
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
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
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          ...sessionData,
          status: 'confirmed'
        }])
        .select()
        .single()

      if (error) throw error
      
      setSessions(prev => [...prev, data])
      toast({
        title: "Success",
        description: "Session scheduled successfully",
      })
    } catch (error) {
      console.error('Error adding session:', error)
      toast({
        title: "Error",
        description: "Failed to schedule session",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return { sessions, loading, addSession, refetch: fetchSessions }
}
