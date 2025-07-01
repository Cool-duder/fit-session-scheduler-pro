
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useEditClientDialogHandlers } from "./EditClientDialogHandlers";
import EditClientDialogContent from "./EditClientDialogContent";

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
  const {
    open,
    setOpen,
    packageLoading,
    handleSubmit,
    handleAddPackage,
    handlePackageDeleted,
    handlePackageEdited
  } = useEditClientDialogHandlers({ client, onEditClient });

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
        
        <EditClientDialogContent
          client={client}
          isOpen={open}
          onSubmit={handleSubmit}
          onAddPackage={handleAddPackage}
          onPackageDeleted={handlePackageDeleted}
          onPackageEdited={handlePackageEdited}
          packageLoading={packageLoading}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
