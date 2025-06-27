
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PaymentStatusBadgeProps {
  status: 'pending' | 'completed' | 'failed';
  paymentType?: string;
}

const PaymentStatusBadge = ({ status, paymentType }: PaymentStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPaymentIcon = (type?: string) => {
    switch (type) {
      case 'Cash': return '💵';
      case 'Venmo': return '💳';
      case 'Check': return '🏦';
      case 'Zelle': return '📱';
      default: return '';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {paymentType && getPaymentIcon(paymentType)} {status}
    </Badge>
  );
};

export default PaymentStatusBadge;
