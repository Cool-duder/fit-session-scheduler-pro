
import React, { useState, useEffect } from "react";
import { Client } from "@/hooks/useClients";
import { useSessions, Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";
import { safeParseDateString } from "@/lib/dateUtils";
import { useEditClientSessionCounts } from "@/hooks/useEditClientSessionCounts";

interface EditClientFormManagerProps {
  client: Client;
  isOpen: boolean;
  children: (props: {
    formData: {
      name: string;
      email: string;
      phone: string;
      package: string;
      price: number;
      regularSlot: string;
      location: string;
      paymentType: string;
      birthday: string;
    };
    isCustomPrice: boolean;
    clientSessions: Session[];
    sessionCounts: any;
    onFormDataChange: (field: string, value: string | number) => void;
    onPackageChange: (packageName: string) => void;
    onCustomPriceToggle: () => void;
  }) => React.ReactNode;
}

const EditClientFormManager = ({ client, isOpen, children }: EditClientFormManagerProps) => {
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
    if (isOpen) {
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
  }, [isOpen, sessions, client, packages]);

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

  return (
    <>
      {children({
        formData,
        isCustomPrice,
        clientSessions,
        sessionCounts,
        onFormDataChange: handleFormDataChange,
        onPackageChange: handlePackageChange,
        onCustomPriceToggle: handleCustomPriceToggle
      })}
    </>
  );
};

export default EditClientFormManager;
