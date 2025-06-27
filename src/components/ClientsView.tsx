
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientsViewHeader from "./ClientsViewHeader";
import ClientsViewContent from "./ClientsViewContent";
import { useClients } from "@/hooks/useClients";

const ClientsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, loading, addClient, editClient, deleteClient, refetch } = useClients();

  console.log("ClientsView rendered - clients:", clients, "loading:", loading);

  const handleAddClient = (newClient: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => {
    addClient(newClient);
  };

  const handleEditClient = (clientId: string, updatedData: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => {
    editClient(clientId, updatedData);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    deleteClient(clientId, clientName);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 mb-4">
            Client Management
          </CardTitle>
          <ClientsViewHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clients={clients}
            onAddClient={handleAddClient}
            onImportSuccess={refetch}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <ClientsViewContent
            clients={filteredClients}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsView;
