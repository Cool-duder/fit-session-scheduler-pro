
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload } from "lucide-react";
import AddClientDialog from "./AddClientDialog";
import PackageManagementDialog from "./PackageManagementDialog";
import PackagePurchaseManagement from "./PackagePurchaseManagement";
import { Client } from "@/hooks/useClients";

interface ClientsViewHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clients: Client[];
  onAddClient: (clientData: any) => void;
  onImportSuccess: () => void;
}

const ClientsViewHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  clients, 
  onAddClient, 
  onImportSuccess 
}: ClientsViewHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <AddClientDialog onAddClient={onAddClient} />

        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Clients
        </Button>

        <PackageManagementDialog />
        
        <PackagePurchaseManagement />
      </div>

      {/* Client Count Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Total Clients</h3>
            <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Active client accounts in your system</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsViewHeader;
