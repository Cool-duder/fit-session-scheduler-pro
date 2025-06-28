
import React from "react";
import { Button } from "@/components/ui/button";

interface SessionDialogActionsProps {
  onCancel: () => void;
  onSave: () => void;
}

const SessionDialogActions = ({ onCancel, onSave }: SessionDialogActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
        Save Changes
      </Button>
    </div>
  );
};

export default SessionDialogActions;
