import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Calendar, Clock, MapPin, DollarSign, Gift, User, Package, CreditCard } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { useSessions, Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";
import { format } from "date-fns";
import PaymentTypeSelect from "./PaymentTypeSelect";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { safeParseDateString, formatForDisplay, debugDate } from "@/lib/dateUtils";

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
  const [sessionCounts, setSessionCounts] = useState({
    totalSessions: client.total_sessions,
    sessionsLeft: client.sessions_left,
    completedSessions: 0
  });

  // Helper function to extract sessions from package string
  const getSessionsFromPackage = (packageStr: string) => {
    const match = packageStr.match(/(\d+)x/);
    return match ? parseInt(match[1]) : 10;
  };

  // Calculate session counts whenever package or sessions change
  useEffect(() => {
    const selectedPackage = packages.find(pkg => pkg.name === formData.package);
    const dynamicTotalSessions = selectedPackage ? selectedPackage.sessions : getSessionsFromPackage(formData.package);
    
    // Calculate how many sessions have been used from the current client's package
    const completedSessions = clientSessions.filter(session => 
      session.status === 'completed' || new Date(session.date) < new Date()
    ).length;
    
    // If the package hasn't changed, use the actual client data
    // If the package has changed, calculate what the new values would be
    const displayTotalSessions = formData.package === client.package ? client.total_sessions : dynamicTotalSessions;
    const displaySessionsLeft = formData.package === client.package ? client.sessions_left : Math.max(0, dynamicTotalSessions - completedSessions);

    setSessionCounts({
      totalSessions: displayTotalSessions,
      sessionsLeft: displaySessionsLeft,
      completedSessions: completedSessions
    });

    // Debug logging
    console.log('=== SESSION COUNTS UPDATE ===');
    console.log('Current package:', formData.package);
    console.log('Original package:', client.package);
    console.log('Selected package object:', selectedPackage);
    console.log('Dynamic total sessions:', dynamicTotalSessions);
    console.log('Completed sessions:', completedSessions);
    console.log('Display total sessions:', displayTotalSessions);
    console.log('Display sessions left:', displaySessionsLeft);
    console.log('Package changed:', formData.package !== client.package);
  }, [formData.package, clientSessions, packages, client.package, client.total_sessions, client.sessions_left]);

  useEffect(() => {
    if (open) {
      console.log('=== EDIT CLIENT DIALOG SESSIONS ===');
      const filteredSessions = sessions.filter(session => session.client_id === client.id);
      console.log('Filtered sessions:', filteredSessions);
      
      // Sort sessions by date (newest first) with proper date parsing
      const sortedSessions = filteredSessions.sort((a, b) => {
        try {
          debugDate('Session A date', a.date);
          debugDate('Session B date', b.date);
          
          const dateA = safeParseDateString(a.date);
          const dateB = safeParseDateString(b.date);
          
          console.log('Comparing dates:', dateA, 'vs', dateB);
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Error sorting sessions by date:', error);
          return 0;
        }
      });
      
      console.log('Sorted sessions:', sortedSessions);
      setClientSessions(sortedSessions);
      
      // Check if current price matches any package price
      const matchingPackage = packages.find(pkg => pkg.name === client.package);
      setIsCustomPrice(matchingPackage ? matchingPackage.price !== client.price : true);
    }
  }, [open, sessions, client.id, packages, client.package, client.price]);

  const handlePackageChange = (packageName: string) => {
    console.log('Package changed to:', packageName);
    const selectedPackage = packages.find(pkg => pkg.name === packageName);
    console.log('Selected package details:', selectedPackage);
    
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

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to safely format session dates
  const formatSessionDate = (dateString: string) => {
    try {
      debugDate('Formatting session date', dateString);
      return formatForDisplay(dateString, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting session date:', error);
      return 'Invalid Date';
    }
  };

  const selectedPackage = packages.find(pkg => pkg.name === formData.package);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Client - {formData.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Left Column - Client Information Form */}
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter client's full name"
                      className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="client@email.com"
                        className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-birthday" className="text-sm font-medium text-gray-700">Birthday (Optional)</Label>
                    <Input
                      id="edit-birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                      className="mt-1 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Package & Pricing Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h4 className="text-xl font-semibold text-green-900 mb-6 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package & Pricing
              </h4>
              
              <div className="space-y-5">
                <div>
                  <Label htmlFor="edit-package" className="text-sm font-medium text-gray-700">Training Package</Label>
                  <Select value={formData.package} onValueChange={handlePackageChange}>
                    <SelectTrigger className="mt-1 bg-white border-gray-200 focus:border-green-400">
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {packages.map((pkg) => (
                        <SelectItem 
                          key={pkg.id} 
                          value={pkg.name}
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                        >
                          <div className="flex items-center justify-between w-full min-w-[300px] py-2">
                            <span className="font-semibold text-gray-900 text-base">{pkg.name}</span>
                            <div className="flex items-center gap-1 font-bold text-green-600 text-lg">
                              <DollarSign className="w-5 h-5" />
                              <span>${pkg.price}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Price Toggle */}
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="custom-price"
                    checked={isCustomPrice}
                    onChange={handleCustomPriceToggle}
                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <Label htmlFor="custom-price" className="text-sm font-medium text-gray-700">
                    Override with custom price
                  </Label>
                </div>

                {/* Price Input */}
                <div>
                  <Label htmlFor="edit-price" className="text-sm font-medium text-gray-700">
                    {isCustomPrice ? "Custom Price" : "Package Price"}
                  </Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                      className={`pl-10 ${!isCustomPrice ? 'bg-gray-50 text-gray-600' : 'bg-white'} border-gray-200 focus:border-green-400`}
                      placeholder="Session price"
                      disabled={!isCustomPrice}
                    />
                  </div>
                  {!isCustomPrice && selectedPackage && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Standard package price: ${selectedPackage.price}
                    </p>
                  )}
                  {isCustomPrice && selectedPackage && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Custom override (standard: ${selectedPackage.price})
                    </p>
                  )}
                </div>
                
                {/* Package Preview Card */}
                {selectedPackage && (
                  <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant={formData.package.includes('60MIN') ? 'default' : 'secondary'} className="text-sm">
                        {formData.package}
                      </Badge>
                      <div className={`flex items-center gap-1 font-bold text-lg ${isCustomPrice ? 'text-orange-600' : 'text-green-600'}`}>
                        <DollarSign className="w-5 h-5" />
                        <span>${formData.price}</span>
                        {isCustomPrice && (
                          <Badge variant="outline" className="text-xs ml-2 text-orange-600 border-orange-300">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedPackage.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedPackage.sessions} sessions</span>
                      </div>
                    </div>
                    
                    {isCustomPrice && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Price difference: {formData.price > selectedPackage.price ? '+' : ''}${formData.price - selectedPackage.price}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Training Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <h4 className="text-xl font-semibold text-purple-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Training Details
              </h4>
              
              <div className="space-y-4">
                <PaymentTypeSelect
                  value={formData.paymentType}
                  onChange={(value) => setFormData({...formData, paymentType: value})}
                  label="Preferred Payment Method"
                />
                <div>
                  <Label htmlFor="edit-regularSlot" className="text-sm font-medium text-gray-700">Regular Time Slot</Label>
                  <Input
                    id="edit-regularSlot"
                    value={formData.regularSlot}
                    onChange={(e) => setFormData({...formData, regularSlot: e.target.value})}
                    placeholder="e.g., Monday 09:00, Wed 10:30, Friday 2:00 PM"
                    className="mt-1 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location" className="text-sm font-medium text-gray-700">Training Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Main Gym, Home Studio, Central Park"
                    className="mt-1 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Right Column - Session Overview */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Overview
              </h3>
              
              {/* Client Stats */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-4 mb-6">
                {formData.birthday && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Birthday:</span>
                    <div className="flex items-center gap-2 text-pink-600">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm font-medium">{format(new Date(formData.birthday), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <PaymentStatusBadge status="completed" paymentType={formData.paymentType} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{sessionCounts.sessionsLeft}</div>
                    <div className="text-xs text-green-700 font-medium">Sessions Left</div>
                    {formData.package !== client.package && (
                      <div className="text-xs text-orange-500 mt-1">*Preview</div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{sessionCounts.totalSessions}</div>
                    <div className="text-xs text-blue-700 font-medium">Total Sessions</div>
                    {formData.package !== client.package && (
                      <div className="text-xs text-orange-500 mt-1">*Preview</div>
                    )}
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-purple-600">{sessionCounts.completedSessions} completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ 
                        width: `${((sessionCounts.totalSessions - sessionCounts.sessionsLeft) / sessionCounts.totalSessions) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {Math.round(((sessionCounts.totalSessions - sessionCounts.sessionsLeft) / sessionCounts.totalSessions) * 100)}% Complete
                    {formData.package !== client.package && (
                      <span className="text-orange-500"> (Preview)</span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Session History */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Sessions ({clientSessions.length} total)
                </h4>
                <ScrollArea className="h-80 w-full border rounded-lg bg-white">
                  {clientSessions.length > 0 ? (
                    <div className="p-4 space-y-3">
                      {clientSessions.slice(0, 10).map((session, index) => (
                        <div key={session.id} className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start mb-3">
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
                            <div className="text-sm font-medium text-gray-600">
                              {formatSessionDate(session.date)}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime12Hour(session.time.substring(0, 5))}</span>
                              </div>
                              {session.location && session.location !== 'TBD' && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-24">{session.location}</span>
                                </div>
                              )}
                            </div>
                            {session.price && (
                              <div className="flex items-center gap-1 font-medium text-green-600">
                                <DollarSign className="w-3 h-3" />
                                <span>${session.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-base font-medium">No sessions yet</p>
                      <p className="text-sm">Sessions will appear here once scheduled</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
