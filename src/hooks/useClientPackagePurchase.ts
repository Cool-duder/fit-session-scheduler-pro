
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
    try {
      console.log('Adding package to client:', client.name, packageData);

      // First, record the package purchase
      const { error: purchaseError } = await supabase
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
        }]);

      if (purchaseError) {
        console.error('Error recording package purchase:', purchaseError);
        throw purchaseError;
      }

      // Then, update the client's session counts
      const newTotalSessions = client.total_sessions + packageData.package_sessions;
      const newSessionsLeft = client.sessions_left + packageData.package_sessions;

      const { error: updateError } = await supabase
        .from('clients')
        .update({
          total_sessions: newTotalSessions,
          sessions_left: newSessionsLeft
        })
        .eq('id', client.id);

      if (updateError) {
        console.error('Error updating client sessions:', updateError);
        throw updateError;
      }

      console.log(`Successfully added ${packageData.package_sessions} sessions to ${client.name}`);
      console.log(`New totals: ${newTotalSessions} total, ${newSessionsLeft} remaining`);

      toast({
        title: "Package Added Successfully",
        description: `Added ${packageData.package_sessions} sessions to ${client.name}'s account`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding package to client:', error);
      toast({
        title: "Error",
        description: "Failed to add package to client",
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
