
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const PaymentTypeSelect = ({ value, onChange, label = "Payment Type", required = false }: PaymentTypeSelectProps) => {
  const paymentTypes = [
    { value: 'Cash', label: '💵 Cash' },
    { value: 'Venmo', label: '💳 Venmo' },
    { value: 'Check', label: '🏦 Check' },
    { value: 'Zelle', label: '📱 Zelle' }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="payment-type">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment type" />
        </SelectTrigger>
        <SelectContent>
          {paymentTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentTypeSelect;
