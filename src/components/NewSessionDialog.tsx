import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, User, MapPin } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { usePackages } from "@/hooks/usePackages";
import { formatForDatabase, debugDate } from "@/lib/dateUtils";

interface NewSessionDialogProps {
  onAddSession: (session: {
    client_id: string;
    client_name: string;
    date: string;
    time: string;
    duration: number;
    package: string;
    location?: string;
  }) => void;
}

const NewSessionDialog = ({ onAddSession }: NewSessionDialogProps) => {
  const [open, setOpen] = useState(false);
  const { clients, loading } = useClients();
  const { packages } = usePackages();
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    date: "",
    time: "",
    duration: 60,
    package: "",
    location: ""
  });

  // Generate time slots from 5:00AM to 10:30PM in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Stop after 10:30PM (22:30) - don't include anything past this
        if (hour === 22 && minute === 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const displayTime = formatTimeForDisplay(hour, minute);
          slots.push({ value: timeString, label: displayTime });
          break; // Exit the inner loop after 10:30 PM
        }
        if (hour === 22 && minute > 30) break; // Safety check
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeForDisplay(hour, minute);
        slots.push({ value: timeString, label: displayTime });
      }
      if (hour === 22) break; // Exit the outer loop after processing 10 PM hour
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

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      // Find matching package to get duration
      const matchingPackage = packages.find(pkg => pkg.name === selectedClient.package);
      const duration = matchingPackage ? matchingPackage.duration : 60;
      
      setFormData({
        ...formData,
        client_id: clientId,
        client_name: selectedClient.name,
        package: selectedClient.package,
        duration: duration,
        location: selectedClient.location || "",
        // Keep existing time and date values - don't reset them
      });
    }
  };

  const getSelectedClientSessionInfo = () => {
    const selectedClient = clients.find(c => c.id === formData.client_id);
    if (selectedClient) {
      const sessionsUsed = selectedClient.total_sessions - selectedClient.sessions_left;
      return {
        current: sessionsUsed + 1, // +1 for the session being scheduled
        total: selectedClient.total_sessions,
        remaining: selectedClient.sessions_left - 1 // -1 for the session being scheduled
      };
    }
    return null;
  };

  const sessionInfo = getSelectedClientSessionInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.client_id || !formData.date || !formData.time) {
      console.error('Missing required fields:', { 
        client_id: formData.client_id, 
        date: formData.date, 
        time: formData.time 
      });
      return;
    }

    console.log('=== NEW SESSION SUBMISSION ===');
    debugDate('Form date input', formData.date);
    
    try {
      // Use the new date utility to format the date properly
      const formattedDate = formatForDatabase(formData.date);
      debugDate('Final formatted date', formattedDate);
      
      console.log('Submitting session with data:', {
        ...formData,
        date: formattedDate
      });
      
      onAddSession({
        client_id: formData.client_id,
        client_name: formData.client_name,
        date: formattedDate,
        time: formData.time,
        duration: formData.duration,
        package: formData.package,
        location: formData.location
      });
      
      setFormData({
        client_id: "",
        client_name: "",
        date: "",
        time: "",
        duration: 60,
        package: "",
        location: ""
      });
      setOpen(false);
    } catch (error) {
      console.error('Error formatting date for submission:', error);
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Schedule New Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Select Client
            </Label>
            <Select onValueChange={handleClientSelect} value={formData.client_id}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>No clients found</SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center justify-between w-full min-w-[250px]">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({client.package})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {sessionInfo && (
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md font-medium">
                  Session {sessionInfo.current} of {sessionInfo.total}
                </div>
                <div className="text-gray-600">
                  ({sessionInfo.remaining} remaining)
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  console.log('Date input changed to:', e.target.value);
                  debugDate('Date input change', e.target.value);
                  setFormData({...formData, date: e.target.value});
                }}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <Select 
                onValueChange={(value) => {
                  console.log('Time selected:', value);
                  setFormData({...formData, time: value});
                }} 
                value={formData.time}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Training location (optional)"
              className="h-11"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
              Schedule Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSessionDialog;
