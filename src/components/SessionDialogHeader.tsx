
import React from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";

interface SessionDialogHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onDeleteClick: () => void;
}

const SessionDialogHeader = ({ isEditing, onEditToggle, onDeleteClick }: SessionDialogHeaderProps) => {
  return (
    <DialogTitle className="flex items-center justify-between">
      Session Details
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditToggle}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteClick}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </DialogTitle>
  );
};

export default SessionDialogHeader;
