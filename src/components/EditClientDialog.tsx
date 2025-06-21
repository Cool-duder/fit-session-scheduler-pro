import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { Client } from "@/hooks/useClients";

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
  }) => void;
}

const EditClientDialog = ({ client, onEditClient }: EditClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    package: client.package,
    price: client.price || (client.package.includes('60min') ? 120 : 80),
    regularSlot: client.regular_slot,
    location: client.location || ""
  });

  const handlePackageChange = (packageType: string) => {
    const defaultPrice = packageType === "30min Standard" ? 80 : 120;
    setFormData({
      ...formData,
      package: packageType,
      price: defaultPrice
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onEditClient(client.id, {
        ...formData,
        regularSlot: formData.regularSlot,
        location: formData.location
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
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter client's full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="client@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-package">Package</Label>
            <select
              id="edit-package"
              value={formData.package}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="30min Standard">30min Standard</option>
              <option value="60min Premium">60min Premium</option>
            </select>
          </div>
          <div>
            <Label htmlFor="edit-price">Package Price ($)</Label>
            <Input
              id="edit-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              placeholder="120"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-regularSlot">Regular Time Slot</Label>
            <Input
              id="edit-regularSlot"
              value={formData.regularSlot}
              onChange={(e) => setFormData({...formData, regularSlot: e.target.value})}
              placeholder="e.g., Monday 09:00, Wed 10:30, Friday 2:00 PM"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter day and time (e.g., "Monday 09:00" or "Mon, Wed, Fri 9:00 AM")
            </p>
          </div>
          <div>
            <Label htmlFor="edit-location">Training Location</Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Main Gym, Home Studio, Park"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the location where training sessions will take place
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
