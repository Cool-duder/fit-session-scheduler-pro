
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Receipt, Edit2, Trash2, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { PackagePurchase } from "@/hooks/usePackagePurchases";

interface PackagePurchaseTableProps {
  purchases: PackagePurchase[];
  onEdit: (purchase: PackagePurchase) => void;
  onDelete: (purchaseId: string) => void;
}

const PackagePurchaseTable = ({ purchases, onEdit, onDelete }: PackagePurchaseTableProps) => {
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

  return (
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
                          onClick={() => onEdit(purchase)}
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
                                onClick={() => onDelete(purchase.id)}
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
  );
};

export default PackagePurchaseTable;
