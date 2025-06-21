import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Clock, MessageSquare, Users } from "lucide-react";
import { format, addHours } from "date-fns";

const MessagingCenter = () => {
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [messageTemplate, setMessageTemplate] = useState(
    "Hi {clientName}! Just a friendly reminder that you have a {duration}-minute training session scheduled for today at {time}. See you soon! 💪"
  );

  // Mock today's sessions for messaging
  const todaySessions = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      time: "09:00",
      duration: 60,
      phone: "+1 (555) 123-4567",
      sent: false
    },
    {
      id: 2,
      clientName: "Mike Chen",
      time: "10:30",
      duration: 30,
      phone: "+1 (555) 234-5678",
      sent: true
    },
    {
      id: 3,
      clientName: "Emma Davis",
      time: "14:00",
      duration: 60,
      phone: "+1 (555) 345-6789",
      sent: false
    },
    {
      id: 4,
      clientName: "John Smith",
      time: "16:00",
      duration: 30,
      phone: "+1 (555) 456-7890",
      sent: false
    }
  ];

  const handleClientSelect = (clientId: number, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = () => {
    const unsentSessions = todaySessions.filter(session => !session.sent);
    if (selectedClients.length === unsentSessions.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(unsentSessions.map(session => session.id));
    }
  };

  const generatePreview = (session: any) => {
    return messageTemplate
      .replace('{clientName}', session.clientName)
      .replace('{duration}', session.duration.toString())
      .replace('{time}', session.time);
  };

  const handleSendMessages = () => {
    console.log('Sending messages to clients:', selectedClients);
    // Here you would integrate with SMS/messaging service
    alert(`Messages sent to ${selectedClients.length} clients!`);
    setSelectedClients([]);
  };

  const unsentSessions = todaySessions.filter(session => !session.sent);
  const sentCount = todaySessions.filter(session => session.sent).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">Total scheduled</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
            <p className="text-xs text-muted-foreground">Already notified</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unsentSessions.length}</div>
            <p className="text-xs text-muted-foreground">Need notification</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Daily Client Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Template */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message Template</label>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="min-h-[100px]"
              placeholder="Customize your daily reminder message..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Use {"{clientName}"}, {"{time}"}, and {"{duration}"} as placeholders
            </p>
          </div>

          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Select Clients to Notify</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={unsentSessions.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                {selectedClients.length === unsentSessions.length ? 'Deselect All' : 'Select All Pending'}
              </Button>
            </div>

            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    session.sent ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedClients.includes(session.id)}
                      onCheckedChange={(checked) => handleClientSelect(session.id, checked as boolean)}
                      disabled={session.sent}
                    />
                    <div>
                      <div className="font-medium">{session.clientName}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {session.time} ({session.duration} min)
                      </div>
                      <div className="text-xs text-gray-500">{session.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.sent ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Sent
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Preview */}
          {selectedClients.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Message Preview</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-2">Sample message for {todaySessions.find(s => selectedClients.includes(s.id))?.clientName}:</div>
                <p className="text-sm italic">
                  {generatePreview(todaySessions.find(s => selectedClients.includes(s.id)))}
                </p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSendMessages}
              disabled={selectedClients.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Messages ({selectedClients.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingCenter;
