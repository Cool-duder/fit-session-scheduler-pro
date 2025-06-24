
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth } from "date-fns";
import NewSessionDialog from "./NewSessionDialog";
import SessionDialog from "./SessionDialog";
import { useSessions, Session } from "@/hooks/useSessions";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const { sessions, loading, addSession, updateSession, deleteSession, refetch } = useSessions();

  const handleAddSession = async (newSession: {
    client_id: string;
    client_name: string;
    date: string;
    time: string;
    duration: number;
    package: string;
    location?: string;
  }) => {
    console.log('Adding new session:', newSession);
    await addSession({
      ...newSession,
      status: 'confirmed',
      location: newSession.location || 'TBD'
    });
    // Refetch sessions to ensure calendar updates
    await refetch();
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => {
    await updateSession(sessionId, updates);
    await refetch();
  };

  const handleDeleteSession = async (sessionId: string, clientId: string) => {
    await deleteSession(sessionId, clientId);
    await refetch();
  };

  const timeSlots = [
    "05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
  ];

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Month view calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const getSessionForTimeSlot = (date: Date, time: string) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    
    const session = sessions.find(session => {
      // Normalize session date - handle both Date objects and string dates
      let sessionDateStr: string;
      if (typeof session.date === 'string') {
        // If it's already a string, use it as is (assuming it's in YYYY-MM-DD format)
        sessionDateStr = session.date.split('T')[0]; // Remove time part if present
      } else {
        // If it's a Date object, format it
        sessionDateStr = format(new Date(session.date), 'yyyy-MM-dd');
      }
      
      // Convert database time format (HH:MM:SS) to calendar time format (HH:MM)
      const sessionTime = session.time.substring(0, 5); // Extract HH:MM from HH:MM:SS
      
      const isDateMatch = sessionDateStr === targetDateStr;
      const isTimeMatch = sessionTime === time;
      
      console.log('Checking session match:', { 
        sessionDateStr,
        targetDateStr,
        sessionTime: sessionTime,
        targetTime: time,
        isDateMatch,
        isTimeMatch,
        clientName: session.client_name,
        location: session.location
      });
      
      return isDateMatch && isTimeMatch;
    });
    
    return session;
  };

  const getSessionsForDay = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    
    return sessions.filter(session => {
      // Normalize session date - handle both Date objects and string dates
      let sessionDateStr: string;
      if (typeof session.date === 'string') {
        sessionDateStr = session.date.split('T')[0]; // Remove time part if present
      } else {
        sessionDateStr = format(new Date(session.date), 'yyyy-MM-dd');
      }
      
      const isMatch = sessionDateStr === targetDateStr;
      console.log('Day session check:', { sessionDateStr, targetDateStr, isMatch, clientName: session.client_name, location: session.location });
      return isMatch;
    });
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="text-center">Loading schedule...</div>
        </CardContent>
      </Card>
    );
  }

  console.log('Current sessions for calendar:', sessions);

  return (
    <>
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Training Schedule
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-[200px] text-center">
                  {viewMode === 'week' 
                    ? `${format(weekStart, 'MMM d')} - ${format(endOfWeek(weekStart), 'MMM d, yyyy')}`
                    : format(currentDate, 'MMMM yyyy')
                  }
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <NewSessionDialog onAddSession={handleAddSession} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'week' && (
            <div className="grid grid-cols-8 gap-2">
              {/* Time column header */}
              <div className="font-medium text-sm text-gray-500 p-2">
                <div>5AM - 10:30PM</div>
                <div className="text-xs">New York Time</div>
              </div>
              
              {/* Day headers */}
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center p-2 border-b">
                  <div className="font-medium">{format(day, 'EEE')}</div>
                  <div className={`text-sm ${isSameDay(day, new Date()) ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
              
              {/* Time slots and sessions */}
              {timeSlots.map((time) => (
                <div key={time} className="contents">
                  <div className="text-xs text-gray-500 p-2 border-r">{time}</div>
                  {weekDays.map((day) => {
                    const session = getSessionForTimeSlot(day, time);
                    return (
                      <div key={`${day.toISOString()}-${time}`} className="min-h-[50px] border-r border-b p-1">
                        {session && (
                          <div 
                            className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-shadow ${
                              session.duration === 60 ? 'bg-blue-100 hover:bg-blue-200' : 'bg-green-100 hover:bg-green-200'
                            }`}
                            onClick={() => handleSessionClick(session)}
                          >
                            <div className="font-medium truncate">{session.client_name}</div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              {session.duration}min
                            </div>
                            {session.location && session.location !== 'TBD' && (
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate text-xs">{session.location}</span>
                              </div>
                            )}
                            <Badge 
                              variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                              className="mt-1 text-xs"
                            >
                              {session.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-sm text-gray-600 border-b">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {monthDays.map((day) => {
                const daySessions = getSessionsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`min-h-[100px] p-2 border border-gray-100 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow ${
                            session.duration === 60 ? 'bg-blue-100 hover:bg-blue-200' : 'bg-green-100 hover:bg-green-200'
                          }`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <div className="font-medium truncate">{session.client_name}</div>
                          <div className="text-gray-600">
                            {session.time.substring(0, 5)} ({session.duration}min)
                          </div>
                          {session.location && session.location !== 'TBD' && (
                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                              <MapPin className="w-2 h-2" />
                              <span className="truncate text-xs">{session.location}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionDialog
        session={selectedSession}
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        onUpdate={handleUpdateSession}
        onDelete={handleDeleteSession}
      />
    </>
  );
};

export default CalendarView;
