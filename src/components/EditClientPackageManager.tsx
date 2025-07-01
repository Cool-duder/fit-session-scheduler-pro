import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, DollarSign, Calendar, Clock, Plus } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import { Client } from "@/hooks/useClients";
import EditClientPackagePricing from "./EditClientPackagePricing";
import EditClientTrainingDetails from "./EditClientTrainingDetails";
import AddPackageDialog from "./AddPackageDialog";

interface EditClientPackageManagerProps {
  client: Client;
  formData: {
    package: string;
    price: number;
    paymentType: string;
    regularSlot: string;
    location: string;
  };
  isCustomPrice: boolean;
  sessionCounts: any;
  onFormDataChange: (field: string, value: string | number) => void;
  onPackageChange: (packageName: string) => void;
  onCustomPriceToggle: () => void;
  onAddPackage: (packageData: {
    package_name: string;
    package_sessions: number;
    amount: number;
    payment_type: string;
  }) => void;
  packageLoading: boolean;
}

const EditClientPackageManager = ({
  client,
  formData,
  isCustomPrice,
  sessionCounts,
  onFormDataChange,
  onPackageChange,
  onCustomPriceToggle,
  onAddPackage,
  packageLoading
}: EditClientPackageManagerProps) => {
  const [addPackageDialogOpen, setAddPackageDialogOpen] = useState(false);
  const { packages } = usePackages();
  const selectedPackage = packages.find(pkg => pkg.name === formData.package);

  const handleAddPackage = async (packageData: {
    package_name: string;
    package_sessions: number;
    amount: number;
    payment_type: string;
  }) => {
    console.log('=== PACKAGE MANAGER: Handling add package ===');
    console.log('Package data:', packageData);
    
    try {
      await onAddPackage(packageData);
      console.log('Package added successfully from manager');
      setAddPackageDialogOpen(false);
    } catch (error) {
      console.error('Error adding package from manager:', error);
    }
  };

  const handleQuickPackageAdd = (pkg: any) => {
    console.log('=== QUICK PACKAGE ADD ===');
    console.log('Selected package:', pkg);
    setAddPackageDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Current Package Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Package Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessionCounts?.sessionsLeft || 0}</div>
              <div className="text-sm text-gray-600">Session Left</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessionCounts?.totalSessions || 0}</div>
              <div className="text-sm text-gray-600">Total Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{sessionCounts?.completedSessions || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${formData.price}</div>
              <div className="text-sm text-gray-600">Package Price</div>
            </div>
          </div>
          
          {selectedPackage && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-sm">
                  {formData.package}
                </Badge>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedPackage.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedPackage.sessions} sessions
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Package & Pricing
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Training Details
          </TabsTrigger>
          <TabsTrigger value="add-package" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Package
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="mt-6">
          <EditClientPackagePricing
            formData={{
              package: formData.package,
              price: formData.price
            }}
            isCustomPrice={isCustomPrice}
            onFormDataChange={onFormDataChange}
            onPackageChange={onPackageChange}
            onCustomPriceToggle={onCustomPriceToggle}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <EditClientTrainingDetails
            formData={{
              paymentType: formData.paymentType,
              regularSlot: formData.regularSlot,
              location: formData.location
            }}
            onFormDataChange={onFormDataChange}
          />
        </TabsContent>

        <TabsContent value="add-package" className="mt-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add Additional Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Add more sessions to {client.name}'s account. This will increase their total sessions and sessions remaining.
                </p>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Package Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {packages.slice(0, 4).map((pkg) => (
                      <Button
                        key={pkg.id}
                        variant="outline"
                        className="justify-between h-auto p-3 hover:bg-green-50 hover:border-green-300"
                        onClick={() => handleQuickPackageAdd(pkg)}
                        disabled={packageLoading}
                      >
                        <div className="text-left">
                          <div className="font-semibold">{pkg.name}</div>
                          <div className="text-sm text-gray-500">{pkg.sessions} sessions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">${pkg.price}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setAddPackageDialogOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={packageLoading}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {packageLoading ? 'Adding Package...' : 'Choose Package to Add'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddPackageDialog
        client={client}
        onAddPackage={handleAddPackage}
        open={addPackageDialogOpen}
        onOpenChange={setAddPackageDialogOpen}
      />
    </div>
  );
};

export default EditClientPackageManager;
