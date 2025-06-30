
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Gift, User, Package, CreditCard, Clock, Calendar } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";

interface EditClientPackagePricingProps {
  formData: {
    package: string;
    price: number;
  };
  isCustomPrice: boolean;
  onFormDataChange: (field: string, value: string | number) => void;
  onPackageChange: (packageName: string) => void;
  onCustomPriceToggle: () => void;
}

const EditClientPackagePricing = ({ 
  formData, 
  isCustomPrice, 
  onFormDataChange, 
  onPackageChange, 
  onCustomPriceToggle 
}: EditClientPackagePricingProps) => {
  const { packages } = usePackages();
  const selectedPackage = packages.find(pkg => pkg.name === formData.package);

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
      <h4 className="text-xl font-semibold text-green-900 mb-6 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Package & Pricing
      </h4>
      
      <div className="space-y-5">
        <div>
          <Label htmlFor="edit-package" className="text-sm font-medium text-gray-700">Training Package</Label>
          <Select value={formData.package} onValueChange={onPackageChange}>
            <SelectTrigger className="mt-1 bg-white border-gray-200 focus:border-green-400">
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {packages.map((pkg) => (
                <SelectItem 
                  key={pkg.id} 
                  value={pkg.name}
                  className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                >
                  <div className="flex items-center justify-between w-full min-w-[300px] py-2">
                    <span className="font-semibold text-gray-900 text-base">{pkg.name}</span>
                    <div className="flex items-center gap-1 font-bold text-green-600 text-lg">
                      <DollarSign className="w-5 h-5" />
                      <span>${pkg.price}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Price Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="custom-price"
            checked={isCustomPrice}
            onChange={onCustomPriceToggle}
            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <Label htmlFor="custom-price" className="text-sm font-medium text-gray-700">
            Override with custom price
          </Label>
        </div>

        {/* Price Input */}
        <div>
          <Label htmlFor="edit-price" className="text-sm font-medium text-gray-700">
            {isCustomPrice ? "Custom Price" : "Package Price"}
          </Label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => onFormDataChange('price', parseInt(e.target.value) || 0)}
              className={`pl-10 ${!isCustomPrice ? 'bg-gray-50 text-gray-600' : 'bg-white'} border-gray-200 focus:border-green-400`}
              placeholder="Session price"
              disabled={!isCustomPrice}
            />
          </div>
          {!isCustomPrice && selectedPackage && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Standard package price: ${selectedPackage.price}
            </p>
          )}
          {isCustomPrice && selectedPackage && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Custom override (standard: ${selectedPackage.price})
            </p>
          )}
        </div>
        
        {/* Package Preview Card */}
        {selectedPackage && (
          <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <Badge variant={formData.package.includes('60MIN') ? 'default' : 'secondary'} className="text-sm">
                {formData.package}
              </Badge>
              <div className={`flex items-center gap-1 font-bold text-lg ${isCustomPrice ? 'text-orange-600' : 'text-green-600'}`}>
                <DollarSign className="w-5 h-5" />
                <span>${formData.price}</span>
                {isCustomPrice && (
                  <Badge variant="outline" className="text-xs ml-2 text-orange-600 border-orange-300">
                    Custom
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{selectedPackage.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{selectedPackage.sessions} sessions</span>
              </div>
            </div>
            
            {isCustomPrice && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Price difference: {formData.price > selectedPackage.price ? '+' : ''}${formData.price - selectedPackage.price}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditClientPackagePricing;
