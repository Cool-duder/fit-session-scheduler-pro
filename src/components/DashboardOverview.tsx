
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
import { format, parseISO, isSameDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const { clients, loading: clientsLoading, addClient } = useClients();
  const { sessions, loading: sessionsLoading } = useSessions();
  const { payments, loading: paymentsLoading } = usePayments();
  const isMobile = useIsMobile();

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
    return isSameDay(sessionDate, today);
  });

  // Calculate today's revenue from payments made today
  const todaysRevenue = React.useMemo(() => {
    const today = new Date();
    return payments.reduce((sum, payment) => {
      if (payment.payment_date) {
        const paymentDate = new Date(payment.payment_date);
        if (isSameDay(paymentDate, today)) {
          const amount = Number(payment.amount) || 0;
          return sum + amount;
        }
      }
      return sum;
    }, 0);
  }, [payments]);

  // Calculate total revenue from both payments and client packages
  const totalRevenue = React.useMemo(() => {
    const paymentsRevenue = payments.reduce((sum, payment) => {
      const amount = Number(payment.amount) || 0;
      return sum + amount;
    }, 0);
    
    const packageRevenue = clients.reduce((sum, client) => {
      const amount = Number(client.price) || 0;
      return sum + amount;
    }, 0);
    
    return paymentsRevenue + packageRevenue;
  }, [payments, clients]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
        {/* Total Clients */}
        <Card className="bg-white">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 ml-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card className="bg-white">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{todaySessions.length}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3 ml-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="bg-white">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${todaysRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3 ml-3">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-white">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {clients.length > 0 && (
                    <p>{clients.length} package{clients.length !== 1 ? 's' : ''}</p>
                  )}
                  {payments.length > 0 && (
                    <p>{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <div className="bg-purple-100 rounded-lg p-3 ml-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="bg-white">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3 ml-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Information and Today's Schedule */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Client Information */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className={isMobile ? "pb-2" : "pb-4"}>
            <div className="flex items-center justify-between">
              <CardTitle className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Client Information</CardTitle>
              <AddClientDialog onAddClient={handleAddClient} />
            </div>
          </CardHeader>
          <CardContent className={isMobile ? "pt-0 px-4 pb-4" : "pt-0"}>
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
                clients.slice(0, isMobile ? 3 : 4).map((client) => (
                  <div key={client.id} className={`bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${isMobile ? 'p-3' : 'p-4'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className={`border-2 border-white shadow-sm flex-shrink-0 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
                          <AvatarFallback className={`bg-blue-100 text-blue-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className={`font-medium text-gray-900 truncate ${isMobile ? 'text-sm' : ''}`}>{client.name}</h3>
                          <div className={`flex items-center gap-1 text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            <Package className={`flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                            <span className="truncate">{client.package}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-medium text-blue-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {client.sessions_left} left
                        </div>
                      </div>
                    </div>
                    
                    <div className={`space-y-2 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                      <div className={`grid grid-cols-1 gap-1 text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        <div className="flex items-center gap-2">
                          <Mail className={`flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className={`flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                          <span>{client.phone}</span>
                        </div>
                        {client.birthday && (
                          <div className="flex items-center gap-2 text-pink-600">
                            <Gift className={`flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                            <span>Birthday: {format(parseISO(client.birthday), 'MMM dd')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {clients.length > (isMobile ? 3 : 4) && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('clients')}
                    className={`w-full ${isMobile ? 'text-xs' : 'text-sm'}`}
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
          <CardHeader className={isMobile ? "pb-2" : "pb-4"}>
            <CardTitle className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "pt-0 px-4 pb-4" : "pt-0"}>
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
                  <div key={session.id} className={`bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${isMobile ? 'p-3' : 'p-4'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className={`border-2 border-white shadow-sm flex-shrink-0 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
                          <AvatarFallback className={`bg-green-100 text-green-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {session.client_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className={`font-medium text-gray-900 truncate ${isMobile ? 'text-sm' : ''}`}>{session.client_name}</h3>
                          <div className={`flex items-center gap-1 text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            <span className="truncate">{session.package}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className={`px-2 py-0.5 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          {session.duration} min
                        </Badge>
                      </div>
                    </div>
                    
                    <div className={`space-y-1 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                      <div className={`grid grid-cols-1 gap-1 text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className={`flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                          <span>{session.time.substring(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
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
                    className={`w-full ${isMobile ? 'text-xs' : 'text-sm'}`}
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
