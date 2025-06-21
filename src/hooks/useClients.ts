
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type Client = {
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
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          sessions_left: 10,
          total_sessions: 10,
          monthly_count: 0,
          join_date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (error) throw error
      
      setClients(prev => [...prev, data])
      toast({
        title: "Success",
        description: "Client added successfully",
      })
    } catch (error) {
      console.error('Error adding client:', error)
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return { clients, loading, addClient, refetch: fetchClients }
}
