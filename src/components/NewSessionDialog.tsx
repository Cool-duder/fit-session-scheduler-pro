
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useClients } from "@/hooks/useClients";

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
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    date: "",
    time: "",
    duration: 60,
    package: "60min Premium",
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
      setFormData({
        ...formData,
        client_id: clientId,
        client_name: selectedClient.name,
        package: selectedClient.package,
        duration: selectedClient.package.includes('60min') ? 60 : 30,
        location: selectedClient.location || ""
      });
    }
  };

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

    // Validate date format
    const dateObj = new Date(formData.date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', formData.date);
      return;
    }

    console.log('Submitting session with data:', formData);
    
    onAddSession({
      client_id: formData.client_id,
      client_name: formData.client_name,
      date: formData.date, // Keep as YYYY-MM-DD format from input
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
      package: "60min Premium",
      location: ""
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client">Select Client</Label>
            <Select onValueChange={handleClientSelect} value={formData.client_id}>
              <SelectTrigger>
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
                      {client.name} ({client.package})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                console.log('Date input changed:', e.target.value);
                setFormData({...formData, date: e.target.value});
              }}
              min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Select onValueChange={(value) => {
              console.log('Time selected:', value);
              setFormData({...formData, time: value});
            }} value={formData.time}>
              <SelectTrigger>
                <SelectValue placeholder="Select time (5:00 AM - 10:30 PM)" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Training location (optional)"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Schedule Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSessionDialog;
