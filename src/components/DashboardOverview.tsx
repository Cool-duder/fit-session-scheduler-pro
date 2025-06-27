
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  MapPin,
  Mail,
  Phone,
  Package,
  Gift
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useSessions } from "@/hooks/useSessions";
import { usePayments } from "@/hooks/usePayments";
import AddClientDialog from "./AddClientDialog";
import { format, parseISO } from "date-fns";

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const { clients, loading: clientsLoading, addClient } = useClients();
  const { sessions, loading: sessionsLoading } = useSessions();
  const { payments, loading: paymentsLoading } = usePayments();

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

  // Get today's sessions
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{todaySessions.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Client Information</CardTitle>
              <AddClientDialog onAddClient={handleAddClient} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {clientsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No clients added yet</p>
                  <p className="text-sm text-gray-400">Add your first client to get started</p>
                </div>
              ) : (
                clients.slice(0, 4).map((client) => (
                  <div key={client.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col space-y-3">
                      {/* Top row - Avatar and Name */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package className="w-3 h-3" />
                            <span>{client.package}</span>
                            <span className="mx-1">•</span>
                            <span className="font-medium text-blue-600">{client.sessions_left} left</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                        {client.birthday && (
                          <div className="flex items-center gap-2 text-pink-600">
                            <Gift className="w-3 h-3 flex-shrink-0" />
                            <span>Birthday: {format(parseISO(client.birthday), 'MMM dd')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {clients.length > 4 && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('clients')}
                    className="w-full text-sm"
                  >
                    View All Clients ({clients.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading sessions...</p>
                </div>
              ) : todaySessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No sessions scheduled today</p>
                  <p className="text-sm text-gray-400">Your schedule is clear</p>
                </div>
              ) : (
                todaySessions.map((session) => (
                  <div key={session.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col space-y-3">
                      {/* Top row - Avatar and Client Name */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-green-100 text-green-600 font-medium">
                            {session.client_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{session.client_name}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="truncate">{session.package}</span>
                            <span className="mx-1">•</span>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {session.duration} min
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Session Details */}
                      <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{session.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {todaySessions.length > 0 && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('calendar')}
                    className="w-full text-sm"
                  >
                    View Full Calendar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
