import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Plus, Edit2, Trash2 } from "lucide-react";
import { usePackages, Package } from "@/hooks/usePackages";

const PackageManagementDialog = () => {
  const [open, setOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { packages, addPackage, editPackage, deletePackage } = usePackages();
  
  const [formData, setFormData] = useState({
    name: "",
    sessions: 1,
    duration: 30,
    price: 80
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sessions: 1,
      duration: 30,
      price: 80
    });
    setEditingPackage(null);
    setShowAddForm(false);
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      name: pkg.name,
      sessions: pkg.sessions,
      duration: pkg.duration,
      price: pkg.price
    });
    setEditingPackage(pkg);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.sessions < 1 || formData.price < 0) return;

    if (editingPackage) {
      editPackage(editingPackage.id, formData);
    } else {
      addPackage(formData);
    }
    
    resetForm();
  };

  const handleDelete = (packageId: string) => {
    deletePackage(packageId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Manage Packages
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Package Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add/Edit Package Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPackage ? 'Edit Package' : 'Create New Package'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="package-name">Package Name</Label>
                    <Input
                      id="package-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., 5x PK 30MIN"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sessions">Sessions</Label>
                      <Input
                        id="sessions"
                        type="number"
                        value={formData.sessions}
                        onChange={(e) => setFormData({...formData, sessions: Number(e.target.value)})}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select 
                        value={formData.duration.toString()} 
                        onValueChange={(value) => setFormData({...formData, duration: Number(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Add Package Button */}
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Package
            </Button>
          )}
          
          {/* Existing Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Packages</h3>
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{pkg.name}</h4>
                        <p className="text-sm text-gray-600">
                          {pkg.sessions} sessions × {pkg.duration} minutes - ${pkg.price}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Package</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(pkg.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageManagementDialog;
