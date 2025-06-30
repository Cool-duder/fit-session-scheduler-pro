
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { usePackagePurchases, PackagePurchase } from "@/hooks/usePackagePurchases";
import PackagePurchaseRevenueSummary from "./PackagePurchaseRevenueSummary";
import PackagePurchaseEditForm from "./PackagePurchaseEditForm";
import PackagePurchaseTable from "./PackagePurchaseTable";

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

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          <PackagePurchaseRevenueSummary purchases={purchases} />

          {showEditForm && editingPurchase && (
            <PackagePurchaseEditForm
              editingPurchase={editingPurchase}
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          )}
          
          <PackagePurchaseTable 
            purchases={purchases}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackagePurchaseManagement;
