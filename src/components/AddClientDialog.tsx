import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2 } from "lucide-react";

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
  const [editingPrices, setEditingPrices] = useState(false);
  const [packageOptions, setPackageOptions] = useState([
    { value: "5x 30MIN Standard", label: "5x 30MIN Standard", price: 400, sessions: 5 },
    { value: "10x 30MIN Standard", label: "10x 30MIN Standard", price: 800, sessions: 10 },
    { value: "5x 60MIN Premium", label: "5x 60MIN Premium", price: 600, sessions: 5 },
    { value: "10x 60MIN Premium", label: "10x 60MIN Premium", price: 1200, sessions: 10 }
  ]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    package: "10x 60MIN Premium",
    price: 1200,
    regularSlot: "",
    location: "",
    paymentType: "Cash"
  });

  const handlePackageChange = (packageValue: string) => {
    const selectedPackage = packageOptions.find(pkg => pkg.value === packageValue);
    if (selectedPackage) {
      setFormData({
        ...formData,
        package: packageValue,
        price: selectedPackage.price
      });
    }
  };

  const handlePackagePriceUpdate = (packageValue: string, newPrice: number) => {
    setPackageOptions(prev => 
      prev.map(pkg => 
        pkg.value === packageValue 
          ? { ...pkg, price: newPrice }
          : pkg
      )
    );
    
    // Update form data if this is the currently selected package
    if (formData.package === packageValue) {
      setFormData(prev => ({ ...prev, price: newPrice }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
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
        package: "10x 60MIN Premium",
        price: packageOptions.find(pkg => pkg.value === "10x 60MIN Premium")?.price || 1200,
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
        
        {editingPrices ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Package Prices</h3>
              <Button 
                variant="outline" 
                onClick={() => setEditingPrices(false)}
              >
                Done
              </Button>
            </div>
            
            {packageOptions.map((pkg) => (
              <div key={pkg.value} className="flex items-center space-x-4">
                <Label className="w-24 font-medium">{pkg.label}</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <Input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => handlePackagePriceUpdate(pkg.value, Number(e.target.value))}
                    className="w-32"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPrices(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit Prices
                </Button>
              </div>
              <Select value={formData.package} onValueChange={handlePackageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packageOptions.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      {pkg.label} - ${pkg.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
