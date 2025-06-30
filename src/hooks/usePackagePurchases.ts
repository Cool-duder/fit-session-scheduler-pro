
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PackagePurchase {
  id: string;
  client_id: string;
  client_name: string;
  package_name: string;
  package_sessions: number;
  amount: number;
  purchase_date: string;
  payment_type: string;
  payment_status: 'pending' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePackagePurchases = () => {
  const [purchases, setPurchases] = useState<PackagePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('package_purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching package purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch package purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPurchase = async (purchaseData: {
    client_id: string;
    client_name: string;
    package_name: string;
    package_sessions: number;
    amount: number;
    purchase_date?: string;
    payment_type?: string;
    payment_status?: 'pending' | 'completed' | 'failed';
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('package_purchases')
        .insert([purchaseData])
        .select()
        .single();

      if (error) throw error;

      setPurchases(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Package purchase recorded successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding package purchase:', error);
      toast({
        title: "Error",
        description: "Failed to record package purchase",
        variant: "destructive",
      });
      throw error;
    }
  };

  const editPurchase = async (purchaseId: string, updatedData: Partial<PackagePurchase>) => {
    try {
      const { data, error } = await supabase
        .from('package_purchases')
        .update(updatedData)
        .eq('id', purchaseId)
        .select()
        .single();

      if (error) throw error;

      setPurchases(prev => prev.map(purchase => 
        purchase.id === purchaseId ? data : purchase
      ));

      toast({
        title: "Success",
        description: "Purchase record updated successfully",
      });
    } catch (error) {
      console.error('Error updating package purchase:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase record",
        variant: "destructive",
      });
    }
  };

  const deletePurchase = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from('package_purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      setPurchases(prev => prev.filter(purchase => purchase.id !== purchaseId));
      toast({
        title: "Success",
        description: "Purchase record deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting package purchase:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase record",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    loading,
    addPurchase,
    editPurchase,
    deletePurchase,
    refetch: fetchPurchases
  };
};
