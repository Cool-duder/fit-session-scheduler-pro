
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Edit2, Trash2, DollarSign, Calendar, Package } from "lucide-react";
import { usePackagePurchases, PackagePurchase } from "@/hooks/usePackagePurchases";
import { format } from "date-fns";

const PackagePurchaseManagement = () => {
  const [open, setOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PackagePurchase | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const { purchases, loading, editPurchase, deletePurchase } = usePackagePurchases();
  
  const [formData, setFormData] = useState({
    amount: 0,
    purchase_date: "",
    payment_type: "Cash",
    payment_status: "completed" as "pending" | "completed" | "failed",
    notes: ""
  });

  const resetForm = () => {
    setFormData({
      amount: 0,
      purchase_date: "",
      payment_type: "Cash",
      payment_status: "completed",
      notes: ""
    });
    setEditingPurchase(null);
    setShowEditForm(false);
  };

  const handleEdit = (purchase: PackagePurchase) => {
    setFormData({
      amount: purchase.amount,
      purchase_date: purchase.purchase_date,
      payment_type: purchase.payment_type,
      payment_status: purchase.payment_status,
      notes: purchase.notes || ""
    });
    setEditingPurchase(purchase);
    setShowEditForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchase) return;

    editPurchase(editingPurchase.id, {
      ...formData,
      amount: Number(formData.amount)
    });
    
    resetForm();
  };

  const handleDelete = (purchaseId: string) => {
    deletePurchase(purchaseId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, color: "text-green-700" },
      pending: { variant: "secondary" as const, color: "text-yellow-700" },
      failed: { variant: "destructive" as const, color: "text-red-700" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const totalRevenue = purchases
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = purchases
    .filter(p => p.payment_status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Package Purchase Records
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Package Purchase Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{purchases.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          {showEditForm && editingPurchase && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Purchase Record</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="purchase_date">Purchase Date</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_type">Payment Type</Label>
                      <Select value={formData.payment_type} onValueChange={(value) => setFormData({...formData, payment_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select value={formData.payment_status} onValueChange={(value: "pending" | "completed" | "failed") => setFormData({...formData, payment_status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Purchase
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Purchase Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Records ({purchases.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No purchase records found</p>
                  <p className="text-sm">Purchase records will appear here when packages are sold</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              {format(new Date(purchase.purchase_date), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{purchase.client_name}</TableCell>
                          <TableCell>{purchase.package_name}</TableCell>
                          <TableCell>{purchase.package_sessions}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-semibold text-green-600">
                              <DollarSign className="w-3 h-3" />
                              {purchase.amount}
                            </div>
                          </TableCell>
                          <TableCell>{purchase.payment_type}</TableCell>
                          <TableCell>{getStatusBadge(purchase.payment_status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(purchase)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Purchase Record</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this purchase record for {purchase.client_name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(purchase.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackagePurchaseManagement;
