
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Phone, Mail, Calendar, Package } from "lucide-react";
import AddClientDialog from "./AddClientDialog";
import { useClients } from "@/hooks/useClients";

const ClientsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, loading, addClient } = useClients();

  const handleAddClient = (newClient: {
    name: string;
    email: string;
    phone: string;
    package: string;
    regularSlot: string;
  }) => {
    addClient({
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      package: newClient.package,
      sessions_left: 10,
      total_sessions: 10,
      monthly_count: 0,
      regular_slot: newClient.regularSlot || "TBD",
      join_date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredClients.map((client) => (
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
                          <h3 className="font-semibold text-lg">{client.name}</h3>
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
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <Badge 
                        variant={client.package.includes('60min') ? 'default' : 'secondary'}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsView;
