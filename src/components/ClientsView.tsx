
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Phone, Mail, Calendar, Package, Trash2, Gift, Cake } from "lucide-react";
import AddClientDialog from "./AddClientDialog";
import EditClientDialog from "./EditClientDialog";
import PaymentStatusBadge from "./PaymentStatusBadge";
import BirthdayEmailDialog from "./BirthdayEmailDialog";
import { useClients } from "@/hooks/useClients";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

const ClientsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, loading, addClient, editClient, deleteClient } = useClients();

  const handleAddClient = (newClient: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => {
    addClient(newClient);
  };

  const handleEditClient = (clientId: string, updatedData: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => {
    editClient(clientId, updatedData);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    deleteClient(clientId, clientName);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBirthdayStatus = (birthday?: string) => {
    if (!birthday) return null;
    
    try {
      const birthDate = parseISO(birthday);
      const today = new Date();
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (isToday(thisYearBirthday)) {
        return { status: 'today', text: 'Today!', color: 'bg-pink-500' };
      } else if (isTomorrow(thisYearBirthday)) {
        return { status: 'tomorrow', text: 'Tomorrow', color: 'bg-orange-500' };
      }
      
      // Check if birthday is within next 7 days
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 7) {
        return { status: 'soon', text: `In ${daysUntil} days`, color: 'bg-blue-500' };
      }
      
      return null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="text-center">Loading clients...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Management</CardTitle>
            <AddClientDialog onAddClient={handleAddClient} />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredClients.map((client) => {
              const birthdayStatus = getBirthdayStatus(client.birthday);
              
              return (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              {birthdayStatus && (
                                <Badge className={`${birthdayStatus.color} text-white`}>
                                  <Cake className="w-3 h-3 mr-1" />
                                  {birthdayStatus.text}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {client.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {client.phone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Regular slot: {client.regular_slot}
                          </div>
                          {client.birthday && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Gift className="w-4 h-4" />
                              Birthday: {format(parseISO(client.birthday), 'MMM dd')}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <PaymentStatusBadge 
                              status="completed" 
                              paymentType={client.payment_type || 'Cash'} 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="text-right space-y-2">
                          <Badge 
                            variant={client.package.includes('60MIN Premium') ? 'default' : 'secondary'}
                            className="mb-2"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            {client.package}
                          </Badge>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Sessions left:</span>
                              <span className="font-medium">{client.sessions_left}/{client.total_sessions}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">This month:</span>
                              <span className="font-medium text-blue-600">{client.monthly_count}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Package price:</span>
                              <span className="font-medium text-green-600">${client.price || 120}</span>
                            </div>
                          </div>
                          
                          <div className="w-32">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${((client.total_sessions - client.sessions_left) / client.total_sessions) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            <EditClientDialog client={client} onEditClient={handleEditClient} />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {client.name}? This will also delete all their scheduled sessions. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClient(client.id, client.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          {client.birthday && (
                            <BirthdayEmailDialog 
                              client={client} 
                              trigger={
                                <Button 
                                  size="sm" 
                                  className="bg-pink-500 hover:bg-pink-600 text-xs px-2 py-1 h-8"
                                >
                                  <Gift className="w-3 h-3 mr-1" />
                                  Birthday
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsView;
