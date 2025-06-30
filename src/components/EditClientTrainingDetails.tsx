
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import PaymentTypeSelect from "./PaymentTypeSelect";

interface EditClientTrainingDetailsProps {
  formData: {
    paymentType: string;
    regularSlot: string;
    location: string;
  };
  onFormDataChange: (field: string, value: string) => void;
}

const EditClientTrainingDetails = ({ formData, onFormDataChange }: EditClientTrainingDetailsProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
      <h4 className="text-xl font-semibold text-purple-900 mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Training Details
      </h4>
      
      <div className="space-y-4">
        <PaymentTypeSelect
          value={formData.paymentType}
          onChange={(value) => onFormDataChange('paymentType', value)}
          label="Preferred Payment Method"
        />
        <div>
          <Label htmlFor="edit-regularSlot" className="text-sm font-medium text-gray-700">Regular Time Slot</Label>
          <Input
            id="edit-regularSlot"
            value={formData.regularSlot}
            onChange={(e) => onFormDataChange('regularSlot', e.target.value)}
            placeholder="e.g., Monday 09:00, Wed 10:30, Friday 2:00 PM"
            className="mt-1 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
        <div>
          <Label htmlFor="edit-location" className="text-sm font-medium text-gray-700">Training Location</Label>
          <Input
            id="edit-location"
            value={formData.location}
            onChange={(e) => onFormDataChange('location', e.target.value)}
            placeholder="e.g., Main Gym, Home Studio, Central Park"
            className="mt-1 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
      </div>
    </div>
  );
};

export default EditClientTrainingDetails;
