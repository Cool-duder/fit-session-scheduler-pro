
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User, Calendar, Package, MapPin, Phone, Mail, Gift } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { format } from "date-fns";
import EditClientDialog from "./EditClientDialog";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientCard = ({ client, onEdit, onDelete }: ClientCardProps) => {
  console.log('ClientCard rendered for client:', client.name, 'Sessions:', {
    total: client.total_sessions,
    left: client.sessions_left
  });
  
  const isBirthdayToday = () => {
    if (!client.birthday) return false;
    const today = new Date();
    const birthday = new Date(client.birthday);
    return today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();
  };

  const getSessionsLeftColor = (sessionsLeft: number) => {
    if (sessionsLeft <= 0) return "text-red-600 bg-red-50";
    if (sessionsLeft <= 3) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const handleEditClient = (clientId: string, updatedData: any) => {
    console.log('Edit client called from ClientCard:', clientId, updatedData);
    // Create a proper Client object with updated data
    const updatedClient = {
      ...client,
      ...updatedData,
      // Ensure these fields are properly mapped
      regular_slot: updatedData.regularSlot || client.regular_slot,
      payment_type: updatedData.paymentType || client.payment_type,
    };
    console.log('Updated client object:', updatedClient);
    onEdit(updatedClient);
  };

  // Ensure we display valid session counts
  const totalSessions = client.total_sessions || 0;
  const sessionsLeft = client.sessions_left || 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {client.name}
                {isBirthdayToday() && (
                  <Gift className="w-4 h-4 text-pink-500" />
                )}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-32">{client.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{client.phone}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <EditClientDialog
              client={client}
              onEditClient={handleEditClient}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(client.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Joined: {format(new Date(client.join_date), 'MMM dd, yyyy')}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              ${client.price}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {client.location || 'TBD'}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {client.payment_type}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {sessionsLeft} Left - {totalSessions} Total - {client.package}
              </span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionsLeftColor(sessionsLeft)}`}>
              {sessionsLeft === 0 ? 'No sessions' : `${sessionsLeft} left`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
