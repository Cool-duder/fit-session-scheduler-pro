import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Phone, Mail, Calendar, Package, Trash2, Gift, Edit } from "lucide-react";
import EditClientDialog from "./EditClientDialog";
import PaymentStatusBadge from "./PaymentStatusBadge";
import BirthdayEmailDialog from "./BirthdayEmailDialog";
import { format, parseISO } from "date-fns";
import { Client } from "@/hooks/useClients";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientCardProps {
  client: Client;
  onEditClient: (clientId: string, updatedData: any) => void;
  onDeleteClient: (clientId: string, clientName: string) => void;
}

const ClientCard = ({ client, onEditClient, onDeleteClient }: ClientCardProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card className="hover:shadow-md transition-shadow border border-gray-100">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header with Avatar and Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
                  <Badge 
                    variant={client.package.includes('60MIN Premium') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    <Package className="w-2 h-2 mr-1" />
                    {client.package.includes('10x') ? '10x' : client.package.includes('5x') ? '5x' : client.package}
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-1">
                <EditClientDialog client={client} onEditClient={onEditClient} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
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
                        onClick={() => onDeleteClient(client.id, client.name)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-3 h-3 flex-shrink-0 text-blue-500" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="w-3 h-3 flex-shrink-0 text-green-500" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-3 h-3 flex-shrink-0 text-purple-500" />
                <span>Regular slot: {client.regular_slot}</span>
              </div>
              {client.birthday && (
                <div className="flex items-center gap-2 text-xs text-pink-600">
                  <Gift className="w-3 h-3 flex-shrink-0" />
                  <span>Birthday: {format(parseISO(client.birthday), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-600">{client.sessions_left}</div>
                <div className="text-xs text-blue-600">Sessions Left</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-lg font-bold text-green-600">{client.monthly_count}</div>
                <div className="text-xs text-green-600">This Month</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">${client.price || 120}</div>
                <div className="text-xs text-purple-600">Package</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{client.total_sessions - client.sessions_left}/{client.total_sessions}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${((client.total_sessions - client.sessions_left) / client.total_sessions) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Payment Status and Birthday Button */}
            <div className="flex items-center justify-between">
              <PaymentStatusBadge 
                status="completed" 
                paymentType={client.payment_type || 'Cash'} 
              />
              {client.birthday && (
                <BirthdayEmailDialog 
                  client={client} 
                  trigger={
                    <Button 
                      size="sm" 
                      className="bg-pink-500 hover:bg-pink-600 text-xs px-2 py-1 h-7"
                    >
                      <Gift className="w-3 h-3 mr-1" />
                      Birthday
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop version - keep existing code
  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left section - Avatar and basic info */}
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm flex-shrink-0">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{client.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Regular slot: {client.regular_slot}</span>
                </div>
                {client.birthday && (
                  <div className="flex items-center gap-1 text-sm text-pink-600">
                    <Gift className="w-4 h-4 flex-shrink-0" />
                    <span>Birthday: {format(parseISO(client.birthday), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <PaymentStatusBadge 
                  status="completed" 
                  paymentType={client.payment_type || 'Cash'} 
                />
              </div>
            </div>
          </div>
          
          {/* Right section - Package info and actions */}
          <div className="flex items-start gap-4">
            <div className="text-right space-y-3">
              <Badge 
                variant={client.package.includes('60MIN Premium') ? 'default' : 'secondary'}
                className="mb-2"
              >
                <Package className="w-3 h-3 mr-1" />
                {client.package}
              </Badge>
              
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4 text-right">
                  <span className="text-gray-600">Sessions left:</span>
                  <span className="font-medium">{client.sessions_left}/{client.total_sessions}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                  <span className="text-gray-600">This month:</span>
                  <span className="font-medium text-blue-600">{client.monthly_count}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                  <span className="text-gray-600">Package price:</span>
                  <span className="font-medium text-green-600">${client.price || 120}</span>
                </div>
              </div>
              
              <div className="w-32">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${((client.total_sessions - client.sessions_left) / client.total_sessions) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                <EditClientDialog client={client} onEditClient={onEditClient} />
                
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
                        onClick={() => onDeleteClient(client.id, client.name)}
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
};

export default ClientCard;
