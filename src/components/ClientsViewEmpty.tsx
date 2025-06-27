
import React from "react";
import { Users } from "lucide-react";

const ClientsViewEmpty = () => {
  return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No clients added yet</p>
      <p className="text-sm text-gray-400">Add your first client to get started</p>
    </div>
  );
};

export default ClientsViewEmpty;
