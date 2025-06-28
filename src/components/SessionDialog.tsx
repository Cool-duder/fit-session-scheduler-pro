
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";
import SessionDialogHeader from "./SessionDialogHeader";
import SessionDialogFields from "./SessionDialogFields";
import SessionDialogActions from "./SessionDialogActions";
import DeleteSessionAlert from "./DeleteSessionAlert";

interface SessionDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => void;
  onDelete: (sessionId: string, clientId: string) => void;
}

const SessionDialog = ({ session, open, onOpenChange, onUpdate, onDelete }: SessionDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { packages } = usePackages();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 60,
    location: "",
    status: "confirmed",
    package: "",
    price: 120
  });
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  React.useEffect(() => {
    if (session) {
      setCurrentSession(session);
      setFormData({
        date: session.date,
        time: session.time.substring(0, 5),
        duration: session.duration,
        location: session.location || "",
        status: session.status,
        package: session.package,
        price: session.price || 120
      });
    }
  }, [session]);

  const handlePackageChange = (packageName: string) => {
    const selectedPackage = packages.find(pkg => pkg.name === packageName);
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        package: packageName,
        price: selectedPackage.price,
        duration: selectedPackage.duration
      }));
    }
  };

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (session) {
      console.log('Saving session updates:', formData);
      const updatedSessionData = {
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        status: formData.status,
        package: formData.package,
        price: formData.price
      };
      
      await onUpdate(session.id, updatedSessionData);
      
      setCurrentSession({
        ...session,
        ...updatedSessionData,
        time: formData.time.length === 5 ? formData.time + ':00' : formData.time
      });
      
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (session) {
      onDelete(session.id, session.client_id);
      setShowDeleteAlert(false);
      onOpenChange(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  if (!session || !currentSession) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <SessionDialogHeader
              isEditing={isEditing}
              onEditToggle={handleEditToggle}
              onDeleteClick={() => setShowDeleteAlert(true)}
            />
          </DialogHeader>
          
          <SessionDialogFields
            currentSession={currentSession}
            isEditing={isEditing}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onPackageChange={handlePackageChange}
          />
          
          {isEditing && (
            <SessionDialogActions
              onCancel={() => setIsEditing(false)}
              onSave={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteSessionAlert
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        clientName={currentSession.client_name}
        onConfirmDelete={handleDelete}
      />
    </>
  );
};

export default SessionDialog;
