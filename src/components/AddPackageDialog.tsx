
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import { Client } from "@/hooks/useClients";

interface AddPackageDialogProps {
  client: Client;
  onAddPackage: (packageData: {
    package_name: string;
    package_sessions: number;
    amount: number;
    payment_type: string;
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPackageDialog = ({ client, onAddPackage, open, onOpenChange }: AddPackageDialogProps) => {
  const { packages } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState("");
  const [customPrice, setCustomPrice] = useState(0);
  const [paymentType, setPaymentType] = useState("Cash");
  const [isCustomPrice, setIsCustomPrice] = useState(false);

  const selectedPackageData = packages.find(pkg => pkg.name === selectedPackage);

  const handleSubmit = () => {
    if (!selectedPackage || !selectedPackageData) return;

    const finalPrice = isCustomPrice ? customPrice : selectedPackageData.price;

    onAddPackage({
      package_name: selectedPackage,
      package_sessions: selectedPackageData.sessions,
      amount: finalPrice,
      payment_type: paymentType
    });

    // Reset form
    setSelectedPackage("");
    setCustomPrice(0);
    setPaymentType("Cash");
    setIsCustomPrice(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add Package - {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="package-select">Select Package</Label>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.name}>
                    {pkg.name} - ${pkg.price} ({pkg.sessions} sessions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPackageData && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm">
                <p><strong>Sessions:</strong> {selectedPackageData.sessions}</p>
                <p><strong>Duration:</strong> {selectedPackageData.duration} minutes</p>
                <p><strong>Default Price:</strong> ${selectedPackageData.price}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="custom-price"
              checked={isCustomPrice}
              onChange={(e) => setIsCustomPrice(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="custom-price">Use custom price</Label>
          </div>

          {isCustomPrice && (
            <div>
              <Label htmlFor="custom-price-input">Custom Price ($)</Label>
              <Input
                id="custom-price-input"
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                placeholder="Enter custom price"
              />
            </div>
          )}

          <div>
            <Label htmlFor="payment-type">Payment Type</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Bit">Bit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedPackage}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Package
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPackageDialog;
