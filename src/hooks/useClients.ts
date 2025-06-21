import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { addWeeks, format, parse, isValid } from 'date-fns'

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

  const createRecurringSessions = async (client: Client) => {
    if (!client.regular_slot || client.regular_slot === 'TBD') return

    try {
      // Parse the regular slot (e.g., "Monday 09:00" or "Mon, Wed, Fri 9:00 AM")
      const slots = client.regular_slot.split(',').map(slot => slot.trim())
      const sessions = []
      
      for (const slot of slots) {
        const parts = slot.split(' ')
        if (parts.length < 2) continue
        
        const dayName = parts[0]
        const timeStr = parts.slice(1).join(' ')
        
        // Convert day name to number (0 = Sunday, 1 = Monday, etc.)
        const dayMap: { [key: string]: number } = {
          'sunday': 0, 'sun': 0,
          'monday': 1, 'mon': 1,
          'tuesday': 2, 'tue': 2, 'tues': 2,
          'wednesday': 3, 'wed': 3,
          'thursday': 4, 'thu': 4, 'thurs': 4,
          'friday': 5, 'fri': 5,
          'saturday': 6, 'sat': 6
        }
        
        const dayOfWeek = dayMap[dayName.toLowerCase()]
        if (dayOfWeek === undefined) continue
        
        // Parse time (handle both 24h and 12h formats)
        let time24h = timeStr
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          try {
            const parsed = parse(timeStr, 'h:mm a', new Date())
            if (isValid(parsed)) {
              time24h = format(parsed, 'HH:mm')
            }
          } catch (e) {
            console.warn('Could not parse time:', timeStr)
            continue
          }
        }
        
        // Create 4 weeks of sessions starting from next occurrence of the day
        const today = new Date()
        const daysUntilNext = (dayOfWeek + 7 - today.getDay()) % 7 || 7
        let nextDate = new Date(today)
        nextDate.setDate(today.getDate() + daysUntilNext)
        
        // Create 4 sessions (1 month)
        for (let week = 0; week < 4; week++) {
          const sessionDate = addWeeks(nextDate, week)
          sessions.push({
            client_id: client.id,
            client_name: client.name,
            date: format(sessionDate, 'yyyy-MM-dd'),
            time: time24h,
            duration: client.package.includes('60min') ? 60 : 30,
            package: client.package,
            status: 'confirmed'
          })
        }
      }
      
      if (sessions.length > 0) {
        const { error } = await supabase
          .from('sessions')
          .insert(sessions)
        
        if (error) throw error
        
        toast({
          title: "Success",
          description: `Created ${sessions.length} recurring sessions for ${client.name}`,
        })
      }
    } catch (error) {
      console.error('Error creating recurring sessions:', error)
      toast({
        title: "Warning",
        description: "Client added but failed to create recurring sessions",
        variant: "destructive",
      })
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
      
      // Create recurring sessions if regular slot is specified
      await createRecurringSessions(data)
      
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

  const editClient = async (clientId: string, updatedData: {
    name: string;
    email: string;
    phone: string;
    package: string;
    regularSlot: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone,
          package: updatedData.package,
          regular_slot: updatedData.regularSlot
        })
        .eq('id', clientId)
        .select()
        .single()

      if (error) throw error
      
      setClients(prev => prev.map(client => 
        client.id === clientId ? data : client
      ))
      
      toast({
        title: "Success",
        description: "Client updated successfully",
      })
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      })
    }
  }

  const deleteClient = async (clientId: string, clientName: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      setClients(prev => prev.filter(client => client.id !== clientId))
      
      toast({
        title: "Success",
        description: `${clientName} has been deleted`,
      })
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return { clients, loading, addClient, editClient, deleteClient, refetch: fetchClients }
}
