
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
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
  const { clients, refetch: refetchClients } = useClients();
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
      
      // Refresh client data to ensure session counts are accurate
      await refetchClients();
      
      setCurrentSession({
        ...session,
        ...updatedSessionData,
        time: formData.time.length === 5 ? formData.time + ':00' : formData.time
      });
      
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (session) {
      await onDelete(session.id, session.client_id);
      // Refresh client data to ensure session counts are accurate
      await refetchClients();
      setShowDeleteAlert(false);
      onOpenChange(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Get session count for display
  const getSessionCount = () => {
    if (!session) return null;
    
    const client = clients.find(c => c.id === session.client_id);
    if (!client) return null;
    
    const sessionsUsed = client.total_sessions - client.sessions_left;
    return {
      current: sessionsUsed,
      total: client.total_sessions
    };
  };

  const sessionCount = getSessionCount();

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
          
          {sessionCount && (
            <div className="px-6 -mt-2 mb-4">
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium inline-block">
                Session {sessionCount.current} of {sessionCount.total}
              </div>
            </div>
          )}
          
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
