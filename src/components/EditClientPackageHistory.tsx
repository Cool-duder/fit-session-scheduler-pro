
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Package, Calendar, DollarSign } from "lucide-react";
import { usePackagePurchases, PackagePurchase } from "@/hooks/usePackagePurchases";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/hooks/useClients";
import { format } from "date-fns";

interface EditClientPackageHistoryProps {
  client: Client;
  onPackageDeleted: (deletedSessions: number) => void;
  onPackageEdited: (sessionDifference: number) => void;
}

const EditClientPackageHistory = ({ client, onPackageDeleted, onPackageEdited }: EditClientPackageHistoryProps) => {
  const { purchases, loading, editPurchase, deletePurchase, refetch } = usePackagePurchases();
  const { toast } = useToast();
  const [clientPurchases, setClientPurchases] = useState<PackagePurchase[]>([]);
  const [editingPurchase, setEditingPurchase] = useState<PackagePurchase | null>(null);
  const [editForm, setEditForm] = useState({
    package_name: '',
    package_sessions: 0,
    amount: 0,
    payment_type: 'Cash'
  });

  useEffect(() => {
    const filtered = purchases.filter(purchase => purchase.client_id === client.id);
    setClientPurchases(filtered);
  }, [purchases, client.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleEditPurchase = async () => {
    if (!editingPurchase) return;

    console.log('=== EDITING PACKAGE PURCHASE ===');
    console.log('Original purchase:', editingPurchase);
    console.log('New data:', editForm);

    const originalSessions = editingPurchase.package_sessions;
    const newSessions = editForm.package_sessions;
    const sessionDifference = newSessions - originalSessions;

    console.log('Session difference:', sessionDifference);

    try {
      await editPurchase(editingPurchase.id, {
        package_name: editForm.package_name,
        package_sessions: editForm.package_sessions,
        amount: editForm.amount,
        payment_type: editForm.payment_type
      });

      // Notify parent component about the session change
      if (sessionDifference !== 0) {
        onPackageEdited(sessionDifference);
      }

      setEditingPurchase(null);
      toast({
        title: "Success",
        description: `Package updated. ${sessionDifference > 0 ? 'Added' : 'Removed'} ${Math.abs(sessionDifference)} sessions.`,
      });
    } catch (error) {
      console.error('Error editing purchase:', error);
    }
  };

  const handleDeletePurchase = async (purchase: PackagePurchase) => {
    console.log('=== DELETING PACKAGE PURCHASE ===');
    console.log('Purchase to delete:', purchase);
    console.log('Sessions to deduct:', purchase.package_sessions);

    try {
      await deletePurchase(purchase.id);
      
      // Notify parent component about the deleted sessions
      onPackageDeleted(purchase.package_sessions);

      toast({
        title: "Success",
        description: `Package deleted. Removed ${purchase.package_sessions} sessions from account.`,
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  const openEditDialog = (purchase: PackagePurchase) => {
    setEditingPurchase(purchase);
    setEditForm({
      package_name: purchase.package_name,
      package_sessions: purchase.package_sessions,
      amount: purchase.amount,
      payment_type: purchase.payment_type
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading package history...</div>;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Training Package History ({clientPurchases.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientPurchases.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-medium">No packages purchased yet</p>
            <p className="text-sm">Package purchases will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-60 w-full">
            <div className="space-y-3">
              {clientPurchases.map((purchase) => (
                <div key={purchase.id} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{purchase.package_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {purchase.package_sessions} sessions
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-bold text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span>${purchase.amount}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(purchase)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Training Package</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-package-name">Package Name</Label>
                              <Input
                                id="edit-package-name"
                                value={editForm.package_name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, package_name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-sessions">Number of Sessions</Label>
                              <Input
                                id="edit-sessions"
                                type="number"
                                min="1"
                                value={editForm.package_sessions}
                                onChange={(e) => setEditForm(prev => ({ ...prev, package_sessions: parseInt(e.target.value) || 0 }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-amount">Amount</Label>
                              <Input
                                id="edit-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-payment-type">Payment Type</Label>
                              <Select 
                                value={editForm.payment_type} 
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, payment_type: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                                  <SelectItem value="Venmo">Venmo</SelectItem>
                                  <SelectItem value="Zelle">Zelle</SelectItem>
                                  <SelectItem value="Check">Check</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditingPurchase(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleEditPurchase}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Training Package</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this package purchase? This will remove {purchase.package_sessions} sessions from the client's account. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePurchase(purchase)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Package
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Badge variant="secondary" className="text-xs">
                      {purchase.payment_type}
                    </Badge>
                    <Badge 
                      variant={purchase.payment_status === 'completed' ? 'default' : 'outline'} 
                      className="text-xs"
                    >
                      {purchase.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default EditClientPackageHistory;
