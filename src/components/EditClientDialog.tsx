import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Calendar, Clock, MapPin, DollarSign, Gift } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useSessions, Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";
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
    birthday?: string;
  }) => void;
}

const EditClientDialog = ({ client, onEditClient }: EditClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const { packages } = usePackages();
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    package: client.package,
    price: client.price || 120,
    regularSlot: client.regular_slot,
    location: client.location || "",
    paymentType: client.payment_type || "Cash",
    birthday: client.birthday || ""
  });
  
  const { sessions } = useSessions();
  const [clientSessions, setClientSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (open) {
      const filteredSessions = sessions.filter(session => session.client_id === client.id);
      const sortedSessions = filteredSessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setClientSessions(sortedSessions);
      
      // Check if current price matches any package price
      const matchingPackage = packages.find(pkg => pkg.name === client.package);
      setIsCustomPrice(matchingPackage ? matchingPackage.price !== client.price : true);
    }
  }, [open, sessions, client.id, packages, client.package, client.price]);

  const handlePackageChange = (packageName: string) => {
    const selectedPackage = packages.find(pkg => pkg.name === packageName);
    if (selectedPackage && !isCustomPrice) {
      setFormData(prev => ({
        ...prev,
        package: packageName,
        price: selectedPackage.price
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        package: packageName
      }));
    }
  };

  const handleCustomPriceToggle = () => {
    setIsCustomPrice(!isCustomPrice);
    if (!isCustomPrice) {
      // When enabling custom price, keep current price
      return;
    } else {
      // When disabling custom price, revert to package price
      const selectedPackage = packages.find(pkg => pkg.name === formData.package);
      if (selectedPackage) {
        setFormData(prev => ({
          ...prev,
          price: selectedPackage.price
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onEditClient(client.id, {
        ...formData,
        regularSlot: formData.regularSlot,
        location: formData.location,
        paymentType: formData.paymentType,
        birthday: formData.birthday || undefined
      });
      setOpen(false);
    }
  };

  const completedSessions = clientSessions.filter(session => 
    session.status === 'completed' || new Date(session.date) < new Date()
  ).length;

  const selectedPackage = packages.find(pkg => pkg.name === formData.package);

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
          <DialogTitle>Edit Client - {formData.name}</DialogTitle>
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
                <Label htmlFor="edit-birthday">Birthday</Label>
                <Input
                  id="edit-birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                  placeholder="Select birthday"
                />
              </div>
              
              {/* Enhanced Package & Pricing Section */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <h4 className="font-medium text-blue-900">Package & Pricing</h4>
                
                <div>
                  <Label htmlFor="edit-package">Select Package</Label>
                  <Select value={formData.package} onValueChange={handlePackageChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a package" />
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
                </div>

                {/* Custom Price Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom-price"
                    checked={isCustomPrice}
                    onChange={handleCustomPriceToggle}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="custom-price" className="text-sm">
                    Use custom price (override package price)
                  </Label>
                </div>

                {/* Price Input */}
                <div>
                  <Label htmlFor="edit-price">
                    {isCustomPrice ? "Custom Price" : "Package Price"}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                      className={`pl-10 ${!isCustomPrice ? 'bg-gray-100' : 'bg-white'}`}
                      placeholder="Session price"
                      disabled={!isCustomPrice}
                    />
                  </div>
                  {!isCustomPrice && selectedPackage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Using standard package price: ${selectedPackage.price}
                    </p>
                  )}
                </div>
                
                {/* Live Preview of Selected Package */}
                {selectedPackage && (
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant={formData.package.includes('60MIN') ? 'default' : 'secondary'}>
                        {formData.package}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className={`flex items-center gap-1 font-bold ${isCustomPrice ? 'text-orange-600' : 'text-green-600'}`}>
                          <DollarSign className="w-4 h-4" />
                          <span>${formData.price}</span>
                        </div>
                        {isCustomPrice && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedPackage.sessions} sessions × {selectedPackage.duration} minutes
                    </div>
                    {isCustomPrice && (
                      <div className="text-xs text-orange-600 mt-1">
                        Standard price: ${selectedPackage.price} → Custom: ${formData.price}
                      </div>
                    )}
                  </div>
                )}
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
              </div>
              <div>
                <Label htmlFor="edit-location">Training Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Main Gym, Home Studio, Park"
                />
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

          {/* Session Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Session Overview</h3>
            
            {/* Session Stats */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {formData.birthday && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Birthday:</span>
                  <div className="flex items-center gap-1 text-pink-600">
                    <Gift className="w-3 h-3" />
                    <span className="text-sm">{format(new Date(formData.birthday), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Method:</span>
                <PaymentStatusBadge status="completed" paymentType={formData.paymentType} />
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
              <h4 className="font-semibold mb-3">Recent Sessions ({clientSessions.length} total)</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-3">
                {clientSessions.length > 0 ? (
                  <div className="space-y-3">
                    {clientSessions.slice(0, 8).map((session, index) => (
                      <div key={session.id} className="bg-white border rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
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
                            {format(new Date(session.date), 'MMM d')}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{session.time.substring(0, 5)}</span>
                          </div>
                          {session.location && session.location !== 'TBD' && (
                            <div className="flex items-center gap-1">
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
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
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
