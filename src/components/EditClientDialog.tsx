
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useClientPackagePurchase } from "@/hooks/useClientPackagePurchase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditClientPersonalInfo from "./EditClientPersonalInfo";
import EditClientSessionOverview from "./EditClientSessionOverview";
import EditClientFormManager from "./EditClientFormManager";
import EditClientPackageManager from "./EditClientPackageManager";
import EditClientPackageHistory from "./EditClientPackageHistory";

interface EditClientDialogProps {
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

const EditClientDialog = ({ client, onEditClient }: EditClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const { addPackageToClient, loading: packageLoading } = useClientPackagePurchase();
  const { toast } = useToast();

  const handleSubmit = (formData: any) => {
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
        
        // Close the dialog after a short delay to show the updated data
        setTimeout(() => {
          setOpen(false);
        }, 1000);
      } else {
        console.error('Failed to add package:', result.error);
      }
    } catch (error) {
      console.error('Error in handleAddPackage:', error);
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

      toast({
        title: "Package Deleted",
        description: `Removed ${deletedSessions} sessions from ${client.name}'s account`,
      });
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

      toast({
        title: "Package Updated",
        description: sessionDifference > 0 
          ? `Added ${sessionDifference} sessions to ${client.name}'s account`
          : `Removed ${Math.abs(sessionDifference)} sessions from ${client.name}'s account`,
      });
    } catch (error) {
      console.error('Error updating client after package edit:', error);
      toast({
        title: "Error",
        description: "Failed to update session counts after package edit",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Client - {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <EditClientFormManager client={client} isOpen={open}>
          {({ formData, isCustomPrice, clientSessions, sessionCounts, onFormDataChange, onPackageChange, onCustomPriceToggle }) => (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                <EditClientPersonalInfo
                  formData={{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    birthday: formData.birthday
                  }}
                  onFormDataChange={onFormDataChange}
                  onSubmit={() => handleSubmit(formData)}
                />

                {/* Package History */}
                <EditClientPackageHistory
                  client={client}
                  onPackageDeleted={handlePackageDeleted}
                  onPackageEdited={handlePackageEdited}
                />

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSubmit(formData)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Middle Column - Package Management */}
              <div className="space-y-6">
                <EditClientPackageManager
                  client={client}
                  formData={{
                    package: formData.package,
                    price: formData.price,
                    paymentType: formData.paymentType,
                    regularSlot: formData.regularSlot,
                    location: formData.location
                  }}
                  isCustomPrice={isCustomPrice}
                  sessionCounts={sessionCounts}
                  onFormDataChange={onFormDataChange}
                  onPackageChange={onPackageChange}
                  onCustomPriceToggle={onCustomPriceToggle}
                  onAddPackage={handleAddPackage}
                  packageLoading={packageLoading}
                />
              </div>

              {/* Right Column - Session Overview */}
              <div className="space-y-6">
                <EditClientSessionOverview
                  formData={{
                    birthday: formData.birthday,
                    paymentType: formData.paymentType
                  }}
                  sessionCounts={sessionCounts}
                  clientSessions={clientSessions}
                />
              </div>
            </div>
          )}
        </EditClientFormManager>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
