import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Edit3 } from "lucide-react";
import { Session } from "@/hooks/useSessions";

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
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 60,
    location: "",
    status: "confirmed"
  });

  React.useEffect(() => {
    if (session) {
      setFormData({
        date: session.date,
        time: session.time.substring(0, 5), // Remove seconds for display
        duration: session.duration,
        location: session.location || "",
        status: session.status
      });
    }
  }, [session]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeForDisplay(hour, minute);
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const formatTimeForDisplay = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const timeSlots = generateTimeSlots();

  const handleSave = async () => {
    if (session) {
      console.log('Saving session updates:', formData);
      await onUpdate(session.id, {
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        status: formData.status
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

  if (!session) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Session Details
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <div className="p-2 bg-gray-50 rounded">{session.client_name}</div>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              {isEditing ? (
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">{new Date(session.date).toLocaleDateString()}</div>
              )}
            </div>
            
            <div>
              <Label htmlFor="time">Time</Label>
              {isEditing ? (
                <Select onValueChange={(value) => setFormData({...formData, time: value})} value={formData.time}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {generateTimeSlots().map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  {generateTimeSlots().find(slot => slot.value === formData.time)?.label || formData.time}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              {isEditing ? (
                <Select onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})} value={formData.duration.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded">{session.duration} minutes</div>
              )}
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Training location"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">{session.location || 'TBD'}</div>
              )}
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select onValueChange={(value) => setFormData({...formData, status: value})} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded capitalize">{session.status}</div>
              )}
            </div>
            
            <div>
              <Label>Package</Label>
              <div className="p-2 bg-gray-50 rounded">{session.package}</div>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This will add one session back to {session.client_name}'s package.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionDialog;
