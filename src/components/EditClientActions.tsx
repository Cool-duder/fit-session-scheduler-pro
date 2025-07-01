
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface EditClientActionsProps {
  onAddPackage: () => void;
  onCancel: () => void;
  onSave: () => void;
  packageLoading: boolean;
}

const EditClientActions = ({ onAddPackage, onCancel, onSave, packageLoading }: EditClientActionsProps) => {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onAddPackage}
        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 flex items-center gap-2"
        disabled={packageLoading}
      >
        <ShoppingCart className="h-4 w-4" />
        {packageLoading ? 'Adding...' : 'Add Package'}
      </Button>
      
      <div className="flex space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} className="px-6">
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditClientActions;
