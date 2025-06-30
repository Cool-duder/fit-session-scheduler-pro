
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { usePackages } from '@/hooks/usePackages'

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
  created_at: string
  price?: number
  location?: string
  payment_type?: string
  birthday?: string
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { packages } = usePackages()

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get sessions count from package name
  const getSessionsFromPackage = (packageName: string) => {
    const packageData = packages.find(pkg => pkg.name === packageName)
    if (packageData) {
      return packageData.sessions
    }
    
    // Fallback to regex parsing
    const patterns = [
      /^(\d+)x\s*PK/i,
      /^(\d+)x\s*\(/i,
      /^(\d+)x\s*/i
    ]
    
    for (const pattern of patterns) {
      const match = packageName.match(pattern)
      if (match) {
        return parseInt(match[1])
      }
    }
    
    return 1
  }

  // Helper function to record package purchase
  const recordPackagePurchase = async (clientData: any, isNewClient: boolean = false) => {
    try {
      const packageData = packages.find(pkg => pkg.name === clientData.package)
      const packageSessions = getSessionsFromPackage(clientData.package)
      const amount = clientData.price || (packageData?.price || 0)

      // Only record if there's a meaningful amount
      if (amount > 0) {
        const { error } = await supabase
          .from('package_purchases')
          .insert([{
            client_id: clientData.id,
            client_name: clientData.name,
            package_name: clientData.package,
            package_sessions: packageSessions,
            amount: amount,
            purchase_date: new Date().toISOString().split('T')[0],
            payment_type: clientData.payment_type || 'Cash',
            payment_status: 'completed',
            notes: isNewClient ? 'Initial package purchase' : 'Package change/upgrade'
          }])

        if (error) {
          console.error('Error recording package purchase:', error)
        } else {
          console.log('Package purchase recorded successfully')
        }
      }
    } catch (error) {
      console.error('Error in recordPackagePurchase:', error)
    }
  }

  const addClient = async (clientData: {
    name: string
    email: string
    phone: string
    package: string
    price: number
    regularSlot: string
    location: string
    paymentType: string
    birthday?: string
  }) => {
    try {
      const sessions = getSessionsFromPackage(clientData.package)
      
      const newClientData = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        package: clientData.package,
        price: clientData.price,
        regular_slot: clientData.regularSlot,
        location: clientData.location,
        payment_type: clientData.paymentType,
        birthday: clientData.birthday || null,
        total_sessions: sessions,
        sessions_left: sessions,
        monthly_count: 0
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([newClientData])
        .select()
        .single()

      if (error) throw error

      // Record the package purchase
      await recordPackagePurchase({ ...data, id: data.id }, true)

      // Insert new client in alphabetical order
      setClients(prev => {
        const updated = [...prev, data]
        return updated.sort((a, b) => a.name.localeCompare(b.name))
      })
      
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
    name: string
    email: string
    phone: string
    package: string
    price: number
    regularSlot: string
    location: string
    paymentType: string
    birthday?: string
  }) => {
    try {
      // Get the current client data to check if package changed
      const currentClient = clients.find(c => c.id === clientId)
      const packageChanged = currentClient && currentClient.package !== updatedData.package
      
      let newSessionCounts = {}
      
      if (packageChanged) {
        const newTotalSessions = getSessionsFromPackage(updatedData.package)
        const completedSessions = currentClient ? currentClient.total_sessions - currentClient.sessions_left : 0
        const newSessionsLeft = Math.max(0, newTotalSessions - completedSessions)
        
        newSessionCounts = {
          total_sessions: newTotalSessions,
          sessions_left: newSessionsLeft
        }
      }

      const clientUpdateData = {
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        package: updatedData.package,
        price: updatedData.price,
        regular_slot: updatedData.regularSlot,
        location: updatedData.location,
        payment_type: updatedData.paymentType,
        birthday: updatedData.birthday || null,
        ...newSessionCounts
      }

      const { data, error } = await supabase
        .from('clients')
        .update(clientUpdateData)
        .eq('id', clientId)
        .select()
        .single()

      if (error) throw error

      // Record package purchase if package changed
      if (packageChanged) {
        await recordPackagePurchase({ ...data, id: clientId }, false)
      }

      // Update client and maintain alphabetical order
      setClients(prev => {
        const updated = prev.map(client => 
          client.id === clientId ? data : client
        )
        return updated.sort((a, b) => a.name.localeCompare(b.name))
      })

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
        description: `Client ${clientName} deleted successfully`,
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

  return {
    clients,
    loading,
    addClient,
    editClient,
    deleteClient,
    refetch: fetchClients
  }
}
