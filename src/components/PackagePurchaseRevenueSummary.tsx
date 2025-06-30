
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package } from "lucide-react";
import { PackagePurchase } from "@/hooks/usePackagePurchases";

interface PackagePurchaseRevenueSummaryProps {
  purchases: PackagePurchase[];
}

const PackagePurchaseRevenueSummary = ({ purchases }: PackagePurchaseRevenueSummaryProps) => {
  const totalRevenue = purchases
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = purchases
    .filter(p => p.payment_status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
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
  );
};

export default PackagePurchaseRevenueSummary;
