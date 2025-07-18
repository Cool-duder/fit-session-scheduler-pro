
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Clock, MessageSquare, Users, Mail, CheckCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { useSessions } from "@/hooks/useSessions";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MessagingCenter = () => {
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [messageTemplate, setMessageTemplate] = useState(
    "Hi {clientName}! {messageType} you have a {duration}-minute training session scheduled for {sessionDate} at {time}. See you soon! 💪"
  );
  const [sendingEmails, setSendingEmails] = useState(false);
  const [sentEmails, setSentEmails] = useState<Set<number>>(new Set());
  const { sessions, loading } = useSessions();
  const { clients } = useClients();
  const { toast } = useToast();

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get today's and tomorrow's dates
  const today = new Date();
  const tomorrow = addDays(new Date(), 1);
  const todayDateString = format(today, 'yyyy-MM-dd');
  const tomorrowDateString = format(tomorrow, 'yyyy-MM-dd');

  // Helper function to get client email by client_id
  const getClientEmail = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.email || 'no-email@example.com';
  };

  // Filter sessions for today and tomorrow and add real email addresses
  const todaySessions = sessions
    .filter(session => session.date === todayDateString)
    .map((session, index) => ({
      id: parseInt(session.id.slice(0, 8), 16), // Convert UUID to number for UI
      clientName: session.client_name,
      time: session.time.substring(0, 5), // Remove seconds
      time12Hour: convertTo12Hour(session.time.substring(0, 5)), // Convert to 12-hour format
      duration: session.duration,
      email: getClientEmail(session.client_id), // Use real email from clients table
      sent: sentEmails.has(parseInt(session.id.slice(0, 8), 16)),
      sessionType: 'today' as const,
      date: todayDateString,
      client_id: session.client_id
    }));

  const tomorrowSessions = sessions
    .filter(session => session.date === tomorrowDateString)
    .map((session, index) => ({
      id: parseInt(session.id.slice(0, 8), 16) + 1000, // Offset to avoid ID conflicts
      clientName: session.client_name,
      time: session.time.substring(0, 5), // Remove seconds
      time12Hour: convertTo12Hour(session.time.substring(0, 5)), // Convert to 12-hour format
      duration: session.duration,
      email: getClientEmail(session.client_id), // Use real email from clients table
      sent: sentEmails.has(parseInt(session.id.slice(0, 8), 16) + 1000),
      sessionType: 'tomorrow' as const,
      date: tomorrowDateString,
      client_id: session.client_id
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

  const generateEmailMessage = (session: any) => {
    const messageType = session.sessionType === 'today' 
      ? 'Just a reminder that' 
      : 'Just a friendly reminder that';
    
    const sessionDate = session.sessionType === 'today' ? 'today' : 'tomorrow';

    return messageTemplate
      .replace('{clientName}', session.clientName)
      .replace('{messageType}', messageType)
      .replace('{sessionDate}', sessionDate)
      .replace('{duration}', session.duration.toString())
      .replace('{time}', session.time12Hour);
  };

  const generateSubject = (session: any) => {
    const sessionDate = session.sessionType === 'today' ? 'Today' : 'Tomorrow';
    return `Training Session Reminder - ${sessionDate} at ${session.time12Hour}`;
  };

  const handleSendEmails = async () => {
    if (selectedClients.length === 0) return;

    setSendingEmails(true);
    const selectedSessions = allSessions.filter(s => selectedClients.includes(s.id));
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const session of selectedSessions) {
        try {
          const { error } = await supabase.functions.invoke('send-email', {
            body: {
              to: session.email,
              subject: generateSubject(session),
              message: generateEmailMessage(session),
              clientName: session.clientName,
              isHtml: false
            }
          });

          if (error) {
            console.error('Error sending email to', session.email, ':', error);
            errorCount++;
          } else {
            console.log('Email sent successfully to', session.email);
            setSentEmails(prev => new Set(prev).add(session.id));
            successCount++;
          }
        } catch (error) {
          console.error('Error sending email to', session.email, ':', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Emails Sent Successfully! ✅",
          description: `${successCount} email${successCount > 1 ? 's' : ''} sent successfully${errorCount > 0 ? `. ${errorCount} failed to send.` : '.'}`,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Email Sending Failed",
          description: `Failed to send ${errorCount} email${errorCount > 1 ? 's' : ''}. Please try again.`,
          variant: "destructive",
        });
      }

      setSelectedClients([]);
    } catch (error) {
      console.error('Error in email sending process:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmails(false);
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
            <p className="text-xs text-muted-foreground">Successfully sent</p>
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
            <Mail className="w-5 h-5" />
            Client Email Notifications
          </CardTitle>
          <p className="text-sm text-gray-600">
            Send automated email reminders from frequencyfitness@gmail.com for today's and tomorrow's sessions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Template */}
          <div>
            <label className="text-sm font-medium mb-2 block">Email Message Template</label>
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
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                            session.sent ? 'bg-green-50 border-green-200' : 'bg-blue-50'
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
                                {session.time12Hour} ({session.duration} min) - Today
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {session.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {session.sent ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
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
                            session.sent ? 'bg-green-50 border-green-200' : 'bg-white'
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
                                {session.time12Hour} ({session.duration} min) - Tomorrow
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {session.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {session.sent ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
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
              <label className="text-sm font-medium mb-2 block">Email Preview</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-2">Sample email for {allSessions.find(s => selectedClients.includes(s.id))?.clientName}:</div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>From:</strong> Frequency Fitness &lt;frequencyfitness@gmail.com&gt;
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {generateSubject(allSessions.find(s => selectedClients.includes(s.id)))}
                </div>
                <p className="text-sm italic">
                  {generateEmailMessage(allSessions.find(s => selectedClients.includes(s.id)))}
                </p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSendEmails}
              disabled={selectedClients.length === 0 || sendingEmails}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingEmails ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Emails ({selectedClients.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingCenter;
