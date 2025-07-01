
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useClientPackagePurchase } from "@/hooks/useClientPackagePurchase";
import EditClientPersonalInfo from "./EditClientPersonalInfo";
import EditClientPackagePricing from "./EditClientPackagePricing";
import EditClientTrainingDetails from "./EditClientTrainingDetails";
import EditClientSessionOverview from "./EditClientSessionOverview";
import EditClientFormManager from "./EditClientFormManager";
import EditClientActions from "./EditClientActions";
import AddPackageDialog from "./AddPackageDialog";

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
  const [addPackageDialogOpen, setAddPackageDialogOpen] = useState(false);
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
    console.log('Adding package to client:', client.name, packageData);
    const result = await addPackageToClient(client, packageData);
    if (result.success) {
      console.log('Package added successfully, closing dialogs and refreshing...');
      // Close both dialogs
      setAddPackageDialogOpen(false);
      setOpen(false);
      // Force a page reload to ensure all data is refreshed
      window.location.reload();
    }
  };

  return (
    <>
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
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <User className="h-6 w-6" />
              Edit Client - {client.name}
            </DialogTitle>
          </DialogHeader>
          
          <EditClientFormManager client={client} isOpen={open}>
            {({ formData, isCustomPrice, clientSessions, sessionCounts, onFormDataChange, onPackageChange, onCustomPriceToggle }) => (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto max-h-[calc(95vh-120px)]">
                {/* Left Column - Client Information Form */}
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

                  <EditClientPackagePricing
                    formData={{
                      package: formData.package,
                      price: formData.price
                    }}
                    isCustomPrice={isCustomPrice}
                    onFormDataChange={onFormDataChange}
                    onPackageChange={onPackageChange}
                    onCustomPriceToggle={onCustomPriceToggle}
                  />

                  <EditClientTrainingDetails
                    formData={{
                      paymentType: formData.paymentType,
                      regularSlot: formData.regularSlot,
                      location: formData.location
                    }}
                    onFormDataChange={onFormDataChange}
                  />

                  <EditClientActions
                    onAddPackage={() => setAddPackageDialogOpen(true)}
                    onCancel={() => setOpen(false)}
                    onSave={() => handleSubmit(formData)}
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

      <AddPackageDialog
        client={client}
        onAddPackage={handleAddPackage}
        open={addPackageDialogOpen}
        onOpenChange={setAddPackageDialogOpen}
      />
    </>
  );
};

export default EditClientDialog;
