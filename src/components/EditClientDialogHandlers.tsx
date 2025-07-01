
import { useState } from "react";
import { Client } from "@/hooks/useClients";
import { useClientPackagePurchase } from "@/hooks/useClientPackagePurchase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditClientDialogHandlersProps {
  client: Client;
  onEditClient: (clientId: string, updatedData: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => void;
}

export const useEditClientDialogHandlers = ({ client, onEditClient }: EditClientDialogHandlersProps) => {
  const [open, setOpen] = useState(false);
  const { addPackageToClient, loading: packageLoading } = useClientPackagePurchase();
  const { toast } = useToast();

  const handleSubmit = (formData: any) => {
    console.log('=== EDIT CLIENT DIALOG: Submitting form ===');
    console.log('Form data:', formData);
    
    if (formData.name && formData.email && formData.phone) {
      onEditClient(client.id, {
        ...formData,
        regularSlot: formData.regularSlot,
        location: formData.location,
        paymentType: formData.paymentType,
        birthday: formData.birthday || undefined
      });
      setOpen(false);
    }
  };

  const handleAddPackage = async (packageData: {
    package_name: string;
    package_sessions: number;
    amount: number;
    payment_type: string;
  }) => {
    console.log('=== EDIT CLIENT DIALOG: Adding package ===');
    console.log('Client:', client.name, 'ID:', client.id);
    console.log('Package data:', packageData);
    console.log('Current client sessions - Total:', client.total_sessions, 'Left:', client.sessions_left);
    
    try {
      const result = await addPackageToClient(client, packageData);
      console.log('Add package result:', result);
      
      if (result.success && result.updatedClient) {
        console.log('Package added successfully, updating client data');
        console.log('Updated client sessions - Total:', result.updatedClient.total_sessions, 'Left:', result.updatedClient.sessions_left);
        
        // Update the client data immediately to reflect the new session counts
        onEditClient(client.id, {
          name: result.updatedClient.name,
          email: result.updatedClient.email,
          phone: result.updatedClient.phone,
          package: result.updatedClient.package,
          price: result.updatedClient.price || client.price || 120,
          regularSlot: result.updatedClient.regular_slot,
          location: result.updatedClient.location || '',
          paymentType: result.updatedClient.payment_type || 'Cash',
          birthday: result.updatedClient.birthday || undefined
        });
        
        toast({
          title: "Package Added",
          description: `Successfully added ${packageData.package_sessions} sessions to ${client.name}'s account`,
        });
      } else {
        console.error('Failed to add package:', result.error);
        toast({
          title: "Error",
          description: "Failed to add package. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleAddPackage:', error);
      toast({
        title: "Error",
        description: "Failed to add package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePackageDeleted = async (deletedSessions: number) => {
    console.log('=== PACKAGE DELETED ===');
    console.log('Sessions to remove:', deletedSessions);
    console.log('Current client sessions - Total:', client.total_sessions, 'Left:', client.sessions_left);

    try {
      const newTotalSessions = Math.max(0, client.total_sessions - deletedSessions);
      const newSessionsLeft = Math.max(0, client.sessions_left - deletedSessions);

      console.log('New session counts - Total:', newTotalSessions, 'Left:', newSessionsLeft);

      const { error } = await supabase
        .from('clients')
        .update({
          total_sessions: newTotalSessions,
          sessions_left: newSessionsLeft
        })
        .eq('id', client.id);

      if (error) throw error;

      // Update the client data in the UI
      onEditClient(client.id, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        package: client.package,
        price: client.price || 120,
        regularSlot: client.regular_slot,
        location: client.location || '',
        paymentType: client.payment_type || 'Cash',
        birthday: client.birthday || undefined
      });

      console.log('Client session counts updated successfully');
    } catch (error) {
      console.error('Error updating client after package deletion:', error);
      toast({
        title: "Error",
        description: "Failed to update session counts after package deletion",
        variant: "destructive",
      });
    }
  };

  const handlePackageEdited = async (sessionDifference: number) => {
    console.log('=== PACKAGE EDITED ===');
    console.log('Session difference:', sessionDifference);
    console.log('Current client sessions - Total:', client.total_sessions, 'Left:', client.sessions_left);

    try {
      const newTotalSessions = Math.max(0, client.total_sessions + sessionDifference);
      const newSessionsLeft = Math.max(0, client.sessions_left + sessionDifference);

      console.log('New session counts - Total:', newTotalSessions, 'Left:', newSessionsLeft);

      const { error } = await supabase
        .from('clients')
        .update({
          total_sessions: newTotalSessions,
          sessions_left: newSessionsLeft
        })
        .eq('id', client.id);

      if (error) throw error;

      // Update the client data in the UI
      onEditClient(client.id, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        package: client.package,
        price: client.price || 120,
        regularSlot: client.regular_slot,
        location: client.location || '',
        paymentType: client.payment_type || 'Cash',
        birthday: client.birthday || undefined
      });

      console.log('Client session counts updated successfully after package edit');
    } catch (error) {
      console.error('Error updating client after package edit:', error);
      toast({
        title: "Error",
        description: "Failed to update session counts after package edit",
        variant: "destructive",
      });
    }
  };

  return {
    open,
    setOpen,
    packageLoading,
    handleSubmit,
    handleAddPackage,
    handlePackageDeleted,
    handlePackageEdited
  };
};
