
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
import { Phone, Mail, Calendar, Package, Trash2, Gift } from "lucide-react";
import EditClientDialog from "./EditClientDialog";
import PaymentStatusBadge from "./PaymentStatusBadge";
import BirthdayEmailDialog from "./BirthdayEmailDialog";
import { format, parseISO } from "date-fns";
import { Client } from "@/hooks/useClients";

interface ClientCardProps {
  client: Client;
  onEditClient: (clientId: string, updatedData: any) => void;
  onDeleteClient: (clientId: string, clientName: string) => void;
}

const ClientCard = ({ client, onEditClient, onDeleteClient }: ClientCardProps) => {
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
