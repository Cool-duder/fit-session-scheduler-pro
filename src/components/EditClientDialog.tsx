import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useSessions, Session } from "@/hooks/useSessions";
import { format } from "date-fns";
import PaymentTypeSelect from "./PaymentTypeSelect";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface EditClientDialogProps {
  client: Client;
  onEditClient: (clientId: string, updatedData: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
  }) => void;
}

const EditClientDialog = ({ client, onEditClient }: EditClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    package: client.package,
    price: client.price || (client.package.includes('60MIN Premium') ? 120 : 80),
    regularSlot: client.regular_slot,
    location: client.location || "",
    paymentType: client.payment_type || "Cash"
  });
  
  const { sessions } = useSessions();
  const [clientSessions, setClientSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (open) {
      // Filter sessions for this specific client
      const filteredSessions = sessions.filter(session => session.client_id === client.id);
      // Sort by date (most recent first)
      const sortedSessions = filteredSessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setClientSessions(sortedSessions);
    }
  }, [open, sessions, client.id]);

  const handlePackageChange = (packageType: string) => {
    const defaultPrice = packageType === "30MIN Standard" ? 80 : 120;
    setFormData({
      ...formData,
      package: packageType,
      price: defaultPrice
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onEditClient(client.id, {
        ...formData,
        regularSlot: formData.regularSlot,
        location: formData.location,
        paymentType: formData.paymentType
      });
      setOpen(false);
    }
  };

  const completedSessions = clientSessions.filter(session => 
    session.status === 'completed' || new Date(session.date) < new Date()
  ).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Client - {client.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Information Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter client's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="client@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-package">Package</Label>
                <select
                  id="edit-package"
                  value={formData.package}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="30MIN Standard">30MIN Standard</option>
                  <option value="60MIN Premium">60MIN Premium</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-price">Package Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="120"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <PaymentTypeSelect
                value={formData.paymentType}
                onChange={(value) => setFormData({...formData, paymentType: value})}
                label="Preferred Payment Method"
              />
              <div>
                <Label htmlFor="edit-regularSlot">Regular Time Slot</Label>
                <Input
                  id="edit-regularSlot"
                  value={formData.regularSlot}
                  onChange={(e) => setFormData({...formData, regularSlot: e.target.value})}
                  placeholder="e.g., Monday 09:00, Wed 10:30, Friday 2:00 PM"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter day and time (e.g., "Monday 09:00" or "Mon, Wed, Fri 9:00 AM")
                </p>
              </div>
              <div>
                <Label htmlFor="edit-location">Training Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Main Gym, Home Studio, Park"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the location where training sessions will take place
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Package & Session Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Package Information</h3>
            
            {/* Package Stats */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Package:</span>
                <Badge variant={client.package.includes('60MIN Premium') ? 'default' : 'secondary'}>
                  {client.package}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Preferred Payment:</span>
                <PaymentStatusBadge status="completed" paymentType={client.payment_type || 'Cash'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sessions Remaining:</span>
                <span className="font-bold text-green-600">{client.sessions_left}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Sessions:</span>
                <span className="font-medium">{client.total_sessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sessions Used:</span>
                <span className="font-medium text-blue-600">{client.total_sessions - client.sessions_left}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completed Sessions:</span>
                <span className="font-medium text-purple-600">{completedSessions}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${((client.total_sessions - client.sessions_left) / client.total_sessions) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(((client.total_sessions - client.sessions_left) / client.total_sessions) * 100)}% Complete
                </p>
              </div>
            </div>

            <Separator />

            {/* Session History */}
            <div>
              <h4 className="font-semibold mb-3">Session History ({clientSessions.length} sessions)</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-3">
                {clientSessions.length > 0 ? (
                  <div className="space-y-3">
                    {clientSessions.map((session, index) => (
                      <div key={session.id} className="bg-white border rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{client.total_sessions - client.sessions_left - index}</span>
                            <Badge 
                              variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {session.status}
                            </Badge>
                            {session.payment_status && (
                              <PaymentStatusBadge 
                                status={session.payment_status as 'pending' | 'completed' | 'failed'} 
                                paymentType={session.payment_type}
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(session.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(session.date), 'EEEE')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{session.time.substring(0, 5)} ({session.duration}min)</span>
                          </div>
                          {session.location && session.location !== 'TBD' && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span>{session.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sessions scheduled yet</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
