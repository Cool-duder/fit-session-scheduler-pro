
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type Payment = {
  id: string
  session_id?: string
  client_id: string
  client_name: string
  amount: number
  payment_type: 'Cash' | 'Venmo' | 'Check' | 'Zelle'
  payment_status: 'pending' | 'completed' | 'failed'
  payment_date?: string
  notes?: string
  created_at: string
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Type cast the data to ensure proper typing
      const typedData = (data || []).map(payment => ({
        ...payment,
        payment_type: payment.payment_type as 'Cash' | 'Venmo' | 'Check' | 'Zelle',
        payment_status: payment.payment_status as 'pending' | 'completed' | 'failed'
      }))
      
      setPayments(typedData)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single()

      if (error) throw error
      
      // Type cast the returned data
      const typedData = {
        ...data,
        payment_type: data.payment_type as 'Cash' | 'Venmo' | 'Check' | 'Zelle',
        payment_status: data.payment_status as 'pending' | 'completed' | 'failed'
      }
      
      setPayments(prev => [typedData, ...prev])
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
      
      return typedData
    } catch (error) {
      console.error('Error adding payment:', error)
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
      throw error
    }
  }

  const updatePayment = async (paymentId: string, updates: Partial<Omit<Payment, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single()

      if (error) throw error
      
      // Type cast the returned data
      const typedData = {
        ...data,
        payment_type: data.payment_type as 'Cash' | 'Venmo' | 'Check' | 'Zelle',
        payment_status: data.payment_status as 'pending' | 'completed' | 'failed'
      }
      
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? typedData : payment
      ))
      
      toast({
        title: "Success",
        description: "Payment updated successfully",
      })
      
      return typedData
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return { payments, loading, addPayment, updatePayment, refetch: fetchPayments }
}
