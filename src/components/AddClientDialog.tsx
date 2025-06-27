
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import PackageManagementDialog from "./PackageManagementDialog";

interface AddClientDialogProps {
  onAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
  }) => void;
}

const AddClientDialog = ({ onAddClient }: AddClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const { packages } = usePackages();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    package: "",
    price: 0,
    regularSlot: "",
    location: "",
    paymentType: "Cash"
  });

  const handlePackageChange = (packageName: string) => {
    const selectedPackage = packages.find(pkg => pkg.name === packageName);
    if (selectedPackage) {
      setFormData({
        ...formData,
        package: packageName,
        price: selectedPackage.price
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.package) {
      onAddClient({
        ...formData,
        regularSlot: formData.regularSlot,
        location: formData.location,
        paymentType: formData.paymentType
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        package: "",
        price: 0,
        regularSlot: "",
        location: "",
        paymentType: "Cash"
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter client's full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="client@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="package">Package & Price</Label>
              <PackageManagementDialog />
            </div>
            <Select value={formData.package} onValueChange={handlePackageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.name}>
                    {pkg.name} - ${pkg.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.package && (
              <p className="text-sm text-gray-600 mt-1">
                Price: ${formData.price}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="regularSlot">Regular Time Slot</Label>
            <Input
              id="regularSlot"
              value={formData.regularSlot}
              onChange={(e) => setFormData({...formData, regularSlot: e.target.value})}
              placeholder="e.g., Monday 09:00, Wed 10:30, Friday 2:00 PM"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter day and time (e.g., "Monday 09:00" or "Mon, Wed, Fri 9:00 AM")
            </p>
          </div>
          <div>
            <Label htmlFor="location">Training Location</Label>
            <Input
              id="location"
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
              Add Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
