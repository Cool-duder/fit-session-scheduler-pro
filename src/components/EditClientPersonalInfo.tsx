
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface EditClientPersonalInfoProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    birthday: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditClientPersonalInfo = ({ formData, onFormDataChange, onSubmit }: EditClientPersonalInfoProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
      <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </h3>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => onFormDataChange('name', e.target.value)}
              placeholder="Enter client's full name"
              className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange('email', e.target.value)}
                placeholder="client@email.com"
                className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => onFormDataChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="edit-birthday" className="text-sm font-medium text-gray-700">Birthday (Optional)</Label>
            <Input
              id="edit-birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => onFormDataChange('birthday', e.target.value)}
              className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditClientPersonalInfo;
