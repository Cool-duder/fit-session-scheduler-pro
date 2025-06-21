import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Phone, Mail, Calendar, Package } from "lucide-react";

const ClientsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock clients data
  const clients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      package: "60min Premium",
      sessionsLeft: 7,
      totalSessions: 10,
      monthlyCount: 8,
      regularSlot: "Mon, Wed, Fri 9:00 AM",
      joinDate: "2024-01-15",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1 (555) 234-5678",
      package: "30min Standard",
      sessionsLeft: 3,
      totalSessions: 10,
      monthlyCount: 12,
      regularSlot: "Tue, Thu 10:30 AM",
      joinDate: "2024-02-20",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma.davis@email.com",
      phone: "+1 (555) 345-6789",
      package: "60min Premium",
      sessionsLeft: 9,
      totalSessions: 10,
      monthlyCount: 6,
      regularSlot: "Mon, Wed 2:00 PM",
      joinDate: "2024-03-10",
      avatar: "/api/placeholder/40/40"
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Management</CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
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
                        <AvatarImage src={client.avatar} alt={client.name} />
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
                          Regular slot: {client.regularSlot}
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
                          <span className="font-medium">{client.sessionsLeft}/{client.totalSessions}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">This month:</span>
                          <span className="font-medium text-blue-600">{client.monthlyCount}</span>
                        </div>
                      </div>
                      
                      {/* Progress bar for sessions */}
                      <div className="w-32">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((client.totalSessions - client.sessionsLeft) / client.totalSessions) * 100}%` 
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
