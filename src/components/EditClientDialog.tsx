import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useSessions, Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";
import { safeParseDateString, debugDate } from "@/lib/dateUtils";
import { useEditClientSessionCounts } from "@/hooks/useEditClientSessionCounts";
import EditClientPersonalInfo from "./EditClientPersonalInfo";
import EditClientPackagePricing from "./EditClientPackagePricing";
import EditClientTrainingDetails from "./EditClientTrainingDetails";
import EditClientSessionOverview from "./EditClientSessionOverview";

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
  const { packages } = usePackages();
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    package: client.package,
    price: client.price || 120,
    regularSlot: client.regular_slot,
    location: client.location || "",
    paymentType: client.payment_type || "Cash",
    birthday: client.birthday || ""
  });
  
  const { sessions } = useSessions();
  const [clientSessions, setClientSessions] = useState<Session[]>([]);
  
  // Use the hook with current form data
  const sessionCounts = useEditClientSessionCounts(client, clientSessions, formData.package);

  // Reset form data when dialog opens
  useEffect(() => {
    if (open) {
      console.log('=== EDIT CLIENT DIALOG OPENED ===');
      console.log('Client data:', client);
      
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        package: client.package,
        price: client.price || 120,
        regularSlot: client.regular_slot,
        location: client.location || "",
        paymentType: client.payment_type || "Cash",
        birthday: client.birthday || ""
      });
      
      // Filter and sort sessions
      const filteredSessions = sessions.filter(session => session.client_id === client.id);
      console.log('Filtered sessions:', filteredSessions);
      
      const sortedSessions = filteredSessions.sort((a, b) => {
        try {
          const dateA = safeParseDateString(a.date);
          const dateB = safeParseDateString(b.date);
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Error sorting sessions by date:', error);
          return 0;
        }
      });
      
      setClientSessions(sortedSessions);
      
      // Check if current price matches any package price
      const matchingPackage = packages.find(pkg => pkg.name === client.package);
      setIsCustomPrice(matchingPackage ? matchingPackage.price !== client.price : true);
    }
  }, [open, sessions, client, packages]);

  const handleFormDataChange = (field: string, value: string | number) => {
    console.log('Form data changing:', field, '=', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const handlePackageChange = (packageName: string) => {
    console.log('Package changed to:', packageName);
    const selectedPackage = packages.find(pkg => pkg.name === packageName);
    console.log('Selected package details:', selectedPackage);
    
    if (selectedPackage && !isCustomPrice) {
      setFormData(prev => ({
        ...prev,
        package: packageName,
        price: selectedPackage.price
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        package: packageName
      }));
    }
  };

  const handleCustomPriceToggle = () => {
    setIsCustomPrice(!isCustomPrice);
    if (!isCustomPrice) {
      return;
    } else {
      const selectedPackage = packages.find(pkg => pkg.name === formData.package);
      if (selectedPackage) {
        setFormData(prev => ({
          ...prev,
          price: selectedPackage.price
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Client - {formData.name}
          </DialogTitle>
        </DialogHeader>
        
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
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
            />

            <EditClientPackagePricing
              formData={{
                package: formData.package,
                price: formData.price
              }}
              isCustomPrice={isCustomPrice}
              onFormDataChange={handleFormDataChange}
              onPackageChange={handlePackageChange}
              onCustomPriceToggle={handleCustomPriceToggle}
            />

            <EditClientTrainingDetails
              formData={{
                paymentType: formData.paymentType,
                regularSlot: formData.regularSlot,
                location: formData.location
              }}
              onFormDataChange={handleFormDataChange}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                Save Changes
              </Button>
            </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
