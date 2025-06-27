
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
  Package
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useSessions } from "@/hooks/useSessions";
import { usePayments } from "@/hooks/usePayments";
import AddClientDialog from "./AddClientDialog";

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
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Client Information</CardTitle>
              <AddClientDialog onAddClient={handleAddClient} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientsLoading ? (
                <div className="text-center py-4">Loading clients...</div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No clients added yet</p>
                  <p className="text-sm">Add your first client to get started</p>
                </div>
              ) : (
                clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        <Package className="w-3 h-3 mr-1" />
                        {client.package}
                      </Badge>
                      <p className="text-sm text-gray-600">{client.sessions_left} sessions left</p>
                    </div>
                  </div>
                ))
              )}
              
              {clients.length > 5 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('clients')}
                    className="w-full"
                  >
                    View All Clients ({clients.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="text-center py-4">Loading sessions...</div>
              ) : todaySessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No sessions scheduled for today</p>
                </div>
              ) : (
                todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {session.client_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{session.client_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {session.time}
                          <MapPin className="w-4 h-4 ml-2" />
                          {session.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{session.duration} min</Badge>
                      <p className="text-sm text-gray-600 mt-1">{session.package}</p>
                    </div>
                  </div>
                ))
              )}
              
              {todaySessions.length > 0 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('calendar')}
                    className="w-full"
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
