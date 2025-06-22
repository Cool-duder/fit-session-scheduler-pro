import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Clock, MessageSquare, Users } from "lucide-react";
import { format, addDays } from "date-fns";
import { useSessions } from "@/hooks/useSessions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MessagingCenter = () => {
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [messageTemplate, setMessageTemplate] = useState(
    "Hi {clientName}! {messageType} you have a {duration}-minute training session scheduled for {sessionDate} at {time}. See you soon! 💪"
  );
  const [sending, setSending] = useState(false);
  const { sessions, loading } = useSessions();
  const { toast } = useToast();

  // Get today's and tomorrow's dates
  const today = new Date();
  const tomorrow = addDays(new Date(), 1);
  const todayDateString = format(today, 'yyyy-MM-dd');
  const tomorrowDateString = format(tomorrow, 'yyyy-MM-dd');

  // Filter sessions for today and tomorrow and add mock phone numbers and sent status
  const todaySessions = sessions
    .filter(session => session.date === todayDateString)
    .map((session, index) => ({
      id: parseInt(session.id.slice(0, 8), 16), // Convert UUID to number for UI
      clientName: session.client_name,
      time: session.time.substring(0, 5), // Remove seconds
      duration: session.duration,
      phone: `+1 (555) ${String(123 + index).padStart(3, '0')}-${String(4567 + index).padStart(4, '0')}`, // Mock phone numbers
      sent: Math.random() > 0.7, // Randomly mark some as sent for demo
      sessionType: 'today' as const,
      date: todayDateString
    }));

  const tomorrowSessions = sessions
    .filter(session => session.date === tomorrowDateString)
    .map((session, index) => ({
      id: parseInt(session.id.slice(0, 8), 16) + 1000, // Offset to avoid ID conflicts
      clientName: session.client_name,
      time: session.time.substring(0, 5), // Remove seconds
      duration: session.duration,
      phone: `+1 (555) ${String(123 + index + 100).padStart(3, '0')}-${String(4567 + index).padStart(4, '0')}`, // Mock phone numbers
      sent: Math.random() > 0.7, // Randomly mark some as sent for demo
      sessionType: 'tomorrow' as const,
      date: tomorrowDateString
    }));

  const allSessions = [...todaySessions, ...tomorrowSessions];
  const unsentSessions = allSessions.filter(session => !session.sent);
  const sentCount = allSessions.filter(session => session.sent).length;

  const handleClientSelect = (clientId: number, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === unsentSessions.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(unsentSessions.map(session => session.id));
    }
  };

  const generatePreview = (session: any) => {
    const messageType = session.sessionType === 'today' 
      ? 'Just a reminder that' 
      : 'Just a friendly reminder that';
    
    const sessionDate = session.sessionType === 'today' 
      ? 'today' 
      : 'tomorrow';

    return messageTemplate
      .replace('{clientName}', session.clientName)
      .replace('{messageType}', messageType)
      .replace('{sessionDate}', sessionDate)
      .replace('{duration}', session.duration.toString())
      .replace('{time}', session.time);
  };

  const handleSendMessages = async () => {
    if (selectedClients.length === 0) return;

    setSending(true);
    console.log('Sending messages to clients:', selectedClients);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Send messages to selected clients
      for (const clientId of selectedClients) {
        const session = allSessions.find(s => s.id === clientId);
        if (!session) continue;

        const message = generatePreview(session);

        try {
          const { data, error } = await supabase.functions.invoke('send-sms', {
            body: {
              to: session.phone,
              message: message
            }
          });

          if (error) {
            console.error(`Failed to send SMS to ${session.clientName}:`, error);
            errorCount++;
          } else {
            console.log(`SMS sent successfully to ${session.clientName}`);
            successCount++;
          }
        } catch (error) {
          console.error(`Error sending SMS to ${session.clientName}:`, error);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Messages Sent",
          description: `Successfully sent ${successCount} message${successCount > 1 ? 's' : ''}`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Some Messages Failed",
          description: `${errorCount} message${errorCount > 1 ? 's' : ''} failed to send. Please check your SMS service configuration.`,
          variant: "destructive",
        });
      }

      if (successCount > 0) {
        setSelectedClients([]);
      }

    } catch (error) {
      console.error('Error in handleSendMessages:', error);
      toast({
        title: "Error",
        description: "Failed to send messages. Please check your SMS service configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {format(today, 'EEEE, MMM d')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tomorrowSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {format(tomorrow, 'EEEE, MMM d')}
            </p>
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
            Client Notifications
          </CardTitle>
          <p className="text-sm text-gray-600">
            Send reminders for today's and tomorrow's sessions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Template */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message Template</label>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="min-h-[100px]"
              placeholder="Customize your reminder message..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Use {"{clientName}"}, {"{messageType}"}, {"{sessionDate}"}, {"{time}"}, and {"{duration}"} as placeholders
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

            {allSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sessions scheduled for today or tomorrow</p>
                <p className="text-sm">Check back later or view the calendar to schedule sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Today's Sessions */}
                {todaySessions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Today's Sessions - {format(today, 'EEEE, MMMM d')}
                    </h4>
                    <div className="space-y-2">
                      {todaySessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            session.sent ? 'bg-gray-50 opacity-60' : 'bg-blue-50'
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
                                {session.time} ({session.duration} min) - Today
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
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                Pending - Today
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tomorrow's Sessions */}
                {tomorrowSessions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Tomorrow's Sessions - {format(tomorrow, 'EEEE, MMMM d')}
                    </h4>
                    <div className="space-y-2">
                      {tomorrowSessions.map((session) => (
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
                                {session.time} ({session.duration} min) - Tomorrow
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
                                Pending - Tomorrow
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Preview */}
          {selectedClients.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Message Preview</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-2">Sample message for {allSessions.find(s => selectedClients.includes(s.id))?.clientName}:</div>
                <p className="text-sm italic">
                  {generatePreview(allSessions.find(s => selectedClients.includes(s.id)))}
                </p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSendMessages}
              disabled={selectedClients.length === 0 || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? `Sending... (${selectedClients.length})` : `Send Messages (${selectedClients.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingCenter;
