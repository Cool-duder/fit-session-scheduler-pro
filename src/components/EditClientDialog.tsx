
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useClientPackagePurchase } from "@/hooks/useClientPackagePurchase";
import EditClientPersonalInfo from "./EditClientPersonalInfo";
import EditClientSessionOverview from "./EditClientSessionOverview";
import EditClientFormManager from "./EditClientFormManager";
import EditClientPackageManager from "./EditClientPackageManager";

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
    
    try {
      const result = await addPackageToClient(client, packageData);
      console.log('Add package result:', result);
      
      if (result.success) {
        console.log('Package added successfully, closing dialog and refreshing');
        setOpen(false);
        
        // Force a complete page refresh to ensure all data is updated
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error('Failed to add package:', result.error);
      }
    } catch (error) {
      console.error('Error in handleAddPackage:', error);
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
