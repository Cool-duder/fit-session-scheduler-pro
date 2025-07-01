
import React from "react";
import { Client } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import EditClientPersonalInfo from "./EditClientPersonalInfo";
import EditClientSessionOverview from "./EditClientSessionOverview";
import EditClientFormManager from "./EditClientFormManager";
import EditClientPackageManager from "./EditClientPackageManager";
import EditClientPackageHistory from "./EditClientPackageHistory";

interface EditClientDialogContentProps {
  client: Client;
  isOpen: boolean;
  onSubmit: (formData: any) => void;
  onAddPackage: (packageData: {
    package_name: string;
    package_sessions: number;
    amount: number;
    payment_type: string;
  }) => Promise<void>;
  onPackageDeleted: (deletedSessions: number) => Promise<void>;
  onPackageEdited: (sessionDifference: number) => Promise<void>;
  packageLoading: boolean;
  onClose: () => void;
}

const EditClientDialogContent = ({
  client,
  isOpen,
  onSubmit,
  onAddPackage,
  onPackageDeleted,
  onPackageEdited,
  packageLoading,
  onClose
}: EditClientDialogContentProps) => {
  return (
    <EditClientFormManager client={client} isOpen={isOpen}>
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
              onSubmit={() => onSubmit(formData)}
            />

            {/* Package History */}
            <EditClientPackageHistory
              client={client}
              onPackageDeleted={onPackageDeleted}
              onPackageEdited={onPackageEdited}
            />

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => onSubmit(formData)} 
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
              onAddPackage={onAddPackage}
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
  );
};

export default EditClientDialogContent;
