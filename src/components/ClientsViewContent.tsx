
import React from "react";
import ClientCard from "./ClientCard";
import ClientsViewEmpty from "./ClientsViewEmpty";
import { Client } from "@/hooks/useClients";

interface ClientsViewContentProps {
  clients: Client[];
  onEditClient: (clientId: string, updatedData: any) => void;
  onDeleteClient: (clientId: string, clientName: string) => void;
}

const ClientsViewContent = ({ clients, onEditClient, onDeleteClient }: ClientsViewContentProps) => {
  if (clients.length === 0) {
    return <ClientsViewEmpty />;
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={(client) => onEditClient(client.id, client)}
          onDelete={(clientId) => onDeleteClient(clientId, client.name)}
        />
      ))}
    </div>
  );
};

export default ClientsViewContent;
