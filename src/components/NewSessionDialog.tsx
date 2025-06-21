
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
    package: "60min Premium"
  });

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setFormData({
        ...formData,
        client_id: clientId,
        client_name: selectedClient.name,
        package: selectedClient.package,
        duration: selectedClient.package.includes('60min') ? 60 : 30
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.client_id && formData.date && formData.time) {
      onAddSession({
        client_id: formData.client_id,
        client_name: formData.client_name,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        package: formData.package
      });
      setFormData({
        client_id: "",
        client_name: "",
        date: "",
        time: "",
        duration: 60,
        package: "60min Premium"
      });
      setOpen(false);
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
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
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
