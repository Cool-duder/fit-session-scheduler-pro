
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
      
      // First, get the current sessions_left for the client
      const { data: clientData, error: clientFetchError } = await supabase
        .from('clients')
        .select('sessions_left')
        .eq('id', sessionData.client_id)
        .single()

      if (clientFetchError) {
        console.error('Error fetching client data:', clientFetchError)
        throw new Error('Failed to fetch client information')
      }

      if (clientData.sessions_left <= 0) {
        throw new Error('Client has no sessions left in their package')
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
      
      // Deduct one session from client's sessions_left
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          sessions_left: clientData.sessions_left - 1
        })
        .eq('id', sessionData.client_id)

      if (updateError) {
        console.error('Error updating client sessions:', updateError)
        // If we can't update the client, we should delete the session we just created
        await supabase.from('sessions').delete().eq('id', data.id)
        throw new Error('Failed to update client session count')
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
        description: error instanceof Error ? error.message : "Failed to schedule session",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateSession = async (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => {
    try {
      console.log('Updating session:', sessionId, updates)
      
      // Format time if provided
      if (updates.time && updates.time.length === 5) {
        updates.time = updates.time + ':00'
      }
      
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error
      
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? data : session
      ))
      
      toast({
        title: "Success",
        description: "Session updated successfully",
      })
      
      return data
    } catch (error) {
      console.error('Error updating session:', error)
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteSession = async (sessionId: string, clientId: string) => {
    try {
      console.log('Deleting session:', sessionId)
      
      // First, get the current sessions_left for the client
      const { data: clientData, error: clientFetchError } = await supabase
        .from('clients')
        .select('sessions_left')
        .eq('id', clientId)
        .single()

      if (clientFetchError) {
        console.error('Error fetching client data:', clientFetchError)
        throw new Error('Failed to fetch client information')
      }
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      
      // Add one session back to client's sessions_left
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          sessions_left: clientData.sessions_left + 1
        })
        .eq('id', clientId)

      if (updateError) {
        console.error('Error updating client sessions:', updateError)
        toast({
          title: "Warning",
          description: "Session deleted but failed to update client session count",
          variant: "destructive",
        })
      }
      
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      
      toast({
        title: "Success",
        description: "Session deleted and added back to package",
      })
    } catch (error) {
      console.error('Error deleting session:', error)
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return { sessions, loading, addSession, updateSession, deleteSession, refetch: fetchSessions }
}
