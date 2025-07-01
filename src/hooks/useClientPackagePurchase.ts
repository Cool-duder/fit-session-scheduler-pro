
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/hooks/useClients';

export const useClientPackagePurchase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addPackageToClient = async (
    client: Client,
    packageData: {
      package_name: string;
      package_sessions: number;
      amount: number;
      payment_type: string;
    }
  ) => {
    setLoading(true);
    console.log('=== ADDING PACKAGE TO CLIENT ===');
    console.log('Client:', client.name, 'ID:', client.id);
    console.log('Package Data:', packageData);
    console.log('Current client sessions - Total:', client.total_sessions, 'Left:', client.sessions_left);
    
    try {
      // First, record the package purchase
      const purchaseResult = await supabase
        .from('package_purchases')
        .insert([{
          client_id: client.id,
          client_name: client.name,
          package_name: packageData.package_name,
          package_sessions: packageData.package_sessions,
          amount: packageData.amount,
          purchase_date: new Date().toISOString().split('T')[0],
          payment_type: packageData.payment_type,
          payment_status: 'completed',
          notes: 'Additional package purchase'
        }])
        .select()
        .single();

      if (purchaseResult.error) {
        console.error('Error recording package purchase:', purchaseResult.error);
        throw purchaseResult.error;
      }

      console.log('Package purchase recorded successfully:', purchaseResult.data);

      // Then, update the client's session counts
      const newTotalSessions = client.total_sessions + packageData.package_sessions;
      const newSessionsLeft = client.sessions_left + packageData.package_sessions;

      console.log('=== UPDATING CLIENT SESSION COUNTS ===');
      console.log('Adding sessions:', packageData.package_sessions);
      console.log('Old Total:', client.total_sessions, '-> New Total:', newTotalSessions);
      console.log('Old Left:', client.sessions_left, '-> New Left:', newSessionsLeft);

      const updateResult = await supabase
        .from('clients')
        .update({
          total_sessions: newTotalSessions,
          sessions_left: newSessionsLeft
        })
        .eq('id', client.id)
        .select()
        .single();

      if (updateResult.error) {
        console.error('Error updating client sessions:', updateResult.error);
        throw updateResult.error;
      }

      console.log('Client sessions updated successfully:', updateResult.data);
      console.log('Final session counts - Total:', updateResult.data.total_sessions, 'Left:', updateResult.data.sessions_left);

      toast({
        title: "Package Added Successfully",
        description: `Added ${packageData.package_sessions} sessions to ${client.name}'s account. New total: ${newTotalSessions} sessions`,
      });

      return { success: true, updatedClient: updateResult.data };
    } catch (error) {
      console.error('Error adding package to client:', error);
      toast({
        title: "Error",
        description: "Failed to add package to client. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    addPackageToClient,
    loading
  };
};
