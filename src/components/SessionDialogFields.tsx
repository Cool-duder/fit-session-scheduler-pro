
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";

interface SessionDialogFieldsProps {
  currentSession: Session;
  isEditing: boolean;
  formData: {
    date: string;
    time: string;
    duration: number;
    location: string;
    status: string;
    package: string;
    price: number;
  };
  onFormDataChange: (updates: Partial<typeof formData>) => void;
  onPackageChange: (packageName: string) => void;
}

const SessionDialogFields = ({ 
  currentSession, 
  isEditing, 
  formData, 
  onFormDataChange, 
  onPackageChange 
}: SessionDialogFieldsProps) => {
  const { packages } = usePackages();

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

  return (
    <div className="space-y-4">
      <div>
        <Label>Client</Label>
        <div className="p-2 bg-gray-50 rounded">{currentSession.client_name}</div>
      </div>
      
      <div>
        <Label htmlFor="date">Date</Label>
        {isEditing ? (
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onFormDataChange({ date: e.target.value })}
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{new Date(currentSession.date).toLocaleDateString()}</div>
        )}
      </div>
      
      <div>
        <Label htmlFor="time">Time</Label>
        {isEditing ? (
          <Select onValueChange={(value) => onFormDataChange({ time: value })} value={formData.time}>
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
            {generateTimeSlots().find(slot => slot.value === currentSession.time.substring(0, 5))?.label || currentSession.time.substring(0, 5)}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="package">Package</Label>
        {isEditing ? (
          <Select onValueChange={onPackageChange} value={formData.package}>
            <SelectTrigger>
              <SelectValue placeholder="Select package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.name}>
                  <div className="flex justify-between items-center w-full">
                    <span>{pkg.name}</span>
                    <span className="ml-4 font-semibold text-green-600">${pkg.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="p-2 bg-gray-50 rounded">{currentSession.package}</div>
        )}
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        {isEditing ? (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => onFormDataChange({ price: parseInt(e.target.value) || 0 })}
              className="pl-10"
              placeholder="Session price"
            />
          </div>
        ) : (
          <div className="p-2 bg-gray-50 rounded">${currentSession.price || 120}</div>
        )}
      </div>
      
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        {isEditing ? (
          <Select onValueChange={(value) => onFormDataChange({ duration: parseInt(value) })} value={formData.duration.toString()}>
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
          <div className="p-2 bg-gray-50 rounded">{currentSession.duration} minutes</div>
        )}
      </div>
      
      <div>
        <Label htmlFor="location">Location</Label>
        {isEditing ? (
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onFormDataChange({ location: e.target.value })}
            placeholder="Training location"
          />
        ) : (
          <div className="p-2 bg-gray-50 rounded">{currentSession.location || 'TBD'}</div>
        )}
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        {isEditing ? (
          <Select onValueChange={(value) => onFormDataChange({ status: value })} value={formData.status}>
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
          <div className="p-2 bg-gray-50 rounded capitalize">{currentSession.status}</div>
        )}
      </div>
    </div>
  );
};

export default SessionDialogFields;
