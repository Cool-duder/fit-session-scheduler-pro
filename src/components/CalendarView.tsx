import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Clock, MapPin, Download, ArrowLeft } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth, parseISO } from "date-fns";
import NewSessionDialog from "./NewSessionDialog";
import SessionDialog from "./SessionDialog";
import { useSessions, Session } from "@/hooks/useSessions";
import { useClients } from "@/hooks/useClients";
import { useIsMobile } from "@/hooks/use-mobile";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [todayPopoverOpen, setTodayPopoverOpen] = useState(false);
  const [showMobileAgenda, setShowMobileAgenda] = useState(false);
  const { sessions, loading, addSession, updateSession, deleteSession, refetch } = useSessions();
  const { clients, refetch: refetchClients } = useClients();
  const isMobile = useIsMobile();

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
    // Refresh both sessions and clients to ensure counts are accurate
    await Promise.all([refetch(), refetchClients()]);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => {
    await updateSession(sessionId, updates);
    // Refresh both sessions and clients to ensure counts are accurate
    await Promise.all([refetch(), refetchClients()]);
  };

  const handleDeleteSession = async (sessionId: string, clientId: string) => {
    await deleteSession(sessionId, clientId);
    // Refresh both sessions and clients to ensure counts are accurate
    await Promise.all([refetch(), refetchClients()]);
  };

  const formatTimeForDisplay = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 30) break;
        const displayTime = formatTimeForDisplay(hour, minute);
        slots.push(displayTime);
      }
    }
    return slots;
  };

  const getSessionCount = (session: Session) => {
    const client = clients.find(c => c.id === session.client_id);
    if (!client) return null;
    
    // Calculate sessions used by counting completed sessions up to this date
    const clientSessions = sessions
      .filter(s => s.client_id === session.client_id)
      .filter(s => new Date(s.date) <= new Date(session.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
    
    const sessionIndex = clientSessions.findIndex(s => s.id === session.id);
    const currentSessionNumber = sessionIndex >= 0 ? sessionIndex + 1 : clientSessions.length + 1;
    
    return {
      current: currentSessionNumber,
      total: client.total_sessions
    };
  };

  const timeSlots = generateTimeSlots();

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

  const goToToday = () => {
    setCurrentDate(new Date());
    if (isMobile) {
      setShowMobileAgenda(true);
    }
  };

  // Get today's appointments - Fixed date parsing
  const getTodaysAppointments = () => {
    const today = new Date();
    console.log('Today date:', today);
    
    return sessions
      .filter(session => {
        // Parse the session date properly
        const sessionDate = parseISO(session.date);
        console.log(`Comparing session date: ${session.date} (parsed: ${sessionDate}) with today: ${today} for session:`, session);
        return isSameDay(sessionDate, today);
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getSessionForTimeSlot = (date: Date, time: string) => {
    console.log(`Looking for session on ${format(date, 'yyyy-MM-dd')} at ${time}`);
    
    // Convert display time (like "5:00 AM") back to 24-hour format for comparison
    const convertDisplayTimeTo24Hour = (displayTime: string) => {
      const [timePart, period] = displayTime.split(' ');
      const [hourStr, minuteStr] = timePart.split(':');
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const targetTime24 = convertDisplayTimeTo24Hour(time);
    console.log(`Converted ${time} to ${targetTime24}`);
    
    const session = sessions.find(session => {
      // Parse the session date properly using parseISO
      const sessionDate = parseISO(session.date);
      
      // Convert database time format (HH:MM:SS) to comparison format (HH:MM)
      const sessionTime = session.time.substring(0, 5); // Extract HH:MM from HH:MM:SS
      
      const isDateMatch = isSameDay(sessionDate, date);
      const isTimeMatch = sessionTime === targetTime24;
      
      console.log(`Session ${session.id}: Date ${format(sessionDate, 'yyyy-MM-dd')} vs ${format(date, 'yyyy-MM-dd')} (${isDateMatch}), Time ${sessionTime} vs ${targetTime24} (${isTimeMatch})`);
      
      return isDateMatch && isTimeMatch;
    });
    
    if (session) {
      console.log(`Found matching session:`, session);
    }
    
    return session;
  };

  const getSessionsForDay = (date: Date) => {
    console.log(`Getting sessions for day: ${format(date, 'yyyy-MM-dd')}`);
    
    const daySessions = sessions.filter(session => {
      // Parse the session date properly using parseISO
      const sessionDate = parseISO(session.date);
      
      const isMatch = isSameDay(sessionDate, date);
      console.log(`Session ${session.id}: ${format(sessionDate, 'yyyy-MM-dd')} vs ${format(date, 'yyyy-MM-dd')} = ${isMatch}`);
      return isMatch;
    });
    
    console.log(`Found ${daySessions.length} sessions for ${format(date, 'yyyy-MM-dd')}:`, daySessions);
    return daySessions;
  };

  const exportToICalendar = () => {
    const icalEvents = sessions.map(session => {
      const sessionDate = new Date(session.date);
      const [hours, minutes] = session.time.split(':').map(Number);
      const startDateTime = new Date(sessionDate);
      startDateTime.setHours(hours, minutes, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + session.duration);

      const formatICalDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      return [
        'BEGIN:VEVENT',
        `UID:${session.id}@trainingapp.com`,
        `DTSTART:${formatICalDate(startDateTime)}`,
        `DTEND:${formatICalDate(endDateTime)}`,
        `SUMMARY:Training Session - ${session.client_name}`,
        `DESCRIPTION:Duration: ${session.duration} minutes\\nPackage: ${session.package}\\nStatus: ${session.status}${session.location ? `\\nLocation: ${session.location}` : ''}`,
        session.location && session.location !== 'TBD' ? `LOCATION:${session.location}` : '',
        'END:VEVENT'
      ].filter(Boolean).join('\r\n');
    }).join('\r\n');

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Training App//Training Sessions//EN',
      'CALSCALE:GREGORIAN',
      icalEvents,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'training-schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading schedule...</div>
        </CardContent>
      </Card>
    );
  }

  const todaysAppointments = getTodaysAppointments();

  // Mobile Agenda View
  if (isMobile && showMobileAgenda) {
    return (
      <>
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileAgenda(false)}
                  className="h-9 w-9 p-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Today's Schedule
                </CardTitle>
              </div>
              <NewSessionDialog onAddSession={handleAddSession} />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {todaysAppointments.length > 0 ? (
              <div className="space-y-4">
                {todaysAppointments.map((session) => {
                  const sessionCount = getSessionCount(session);
                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                        session.duration === 60 
                          ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100' 
                          : 'bg-green-50 border-l-green-500 hover:bg-green-100'
                      }`}
                      onClick={() => handleSessionClick(session)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {session.client_name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.time.substring(0, 5)} ({session.duration}min)</span>
                          </div>
                          {session.location && session.location !== 'TBD' && (
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{session.location}</span>
                            </div>
                          )}
                          {sessionCount && (
                            <div className="text-sm text-gray-600 mt-2 font-medium bg-white px-2 py-1 rounded inline-block">
                              Session {sessionCount.current} of {sessionCount.total}
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 bg-white px-3 py-1 rounded">
                        {session.package}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No appointments scheduled for today</p>
                <p className="text-sm mt-2">Enjoy your free time!</p>
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
  }

  return (
    <>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Training Schedule
            </CardTitle>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg min-w-[220px] text-center text-gray-800">
                  {viewMode === 'week' 
                    ? `${format(weekStart, 'MMM d')} - ${format(endOfWeek(weekStart), 'MMM d, yyyy')}`
                    : format(currentDate, 'MMMM yyyy')
                  }
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <Popover open={todayPopoverOpen} onOpenChange={setTodayPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="px-3"
                      >
                        Today
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="center">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Today's Appointments ({todaysAppointments.length})
                          </h4>
                          {todaysAppointments.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {todaysAppointments.map((session) => (
                                <div
                                  key={session.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {session.client_name}
                                    </div>
                                    <div className="text-gray-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{session.time.substring(0, 5)} ({session.duration}min)</span>
                                    </div>
                                    {session.location && session.location !== 'TBD' && (
                                      <div className="text-gray-600 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-xs">{session.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  <Badge 
                                    variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {session.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No appointments scheduled for today</p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="px-3"
                  >
                    Today
                  </Button>
                )}
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="min-w-[70px]"
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="min-w-[70px]"
                >
                  Month
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToICalendar}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Calendar
                  </Button>
                )}
                <NewSessionDialog onAddSession={handleAddSession} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {viewMode === 'week' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-8 bg-gray-50">
                {/* Time column header */}
                <div className="p-4 border-r border-gray-200 bg-white">
                  <div className="text-sm font-medium text-gray-700">Eastern Time</div>
                  <div className="text-xs text-gray-500 mt-1">5:00 AM - 10:30 PM</div>
                </div>
                
                {/* Day headers */}
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="font-semibold text-gray-900">{format(day, 'EEE')}</div>
                    <div className={`text-sm mt-1 w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      isSameDay(day, new Date()) 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'text-gray-600'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Time slots and sessions */}
              <div className="bg-white">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                    <div className="p-3 text-xs text-gray-500 border-r border-gray-100 bg-gray-50/50 font-medium">
                      {time}
                    </div>
                    {weekDays.map((day) => {
                      const session = getSessionForTimeSlot(day, time);
                      const sessionCount = session ? getSessionCount(session) : null;
                      return (
                        <div key={`${day.toISOString()}-${time}`} className="min-h-[60px] border-r border-gray-100 last:border-r-0 p-1 overflow-hidden">
                          {session && (
                            <div 
                              className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between overflow-hidden ${
                                session.duration === 60 
                                  ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                                  : 'bg-green-50 hover:bg-green-100 border border-green-200'
                              }`}
                              onClick={() => handleSessionClick(session)}
                            >
                              <div className="flex-1 min-h-0">
                                <div className="font-semibold text-gray-900 truncate text-xs leading-tight mb-1">
                                  {session.client_name}
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                  <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="text-xs truncate">{session.duration}min</span>
                                </div>
                                {session.location && session.location !== 'TBD' && (
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate text-xs">{session.location}</span>
                                  </div>
                                )}
                                {sessionCount && (
                                  <div className="text-xs text-gray-600 mb-1 font-medium">
                                    {sessionCount.current} of {sessionCount.total}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0 mt-1">
                                <Badge 
                                  variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                                  className="text-xs px-1.5 py-0.5 h-5 text-xs leading-none"
                                >
                                  {session.status}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {viewMode === 'month' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const daySessions = getSessionsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`min-h-[120px] p-2 border-r border-b border-gray-100 last:border-r-0 overflow-hidden ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {daySessions.map((session) => {
                          const sessionCount = getSessionCount(session);
                          return (
                            <div
                              key={session.id}
                              className={`text-xs p-2 rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 overflow-hidden ${
                                session.duration === 60 
                                  ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                                  : 'bg-green-50 hover:bg-green-100 border border-green-200'
                              }`}
                              onClick={() => handleSessionClick(session)}
                            >
                              <div className="font-semibold truncate text-gray-900 mb-1 text-xs leading-tight">
                                {session.client_name}
                              </div>
                              <div className="text-gray-600 mb-1 text-xs truncate">
                                {session.time.substring(0, 5)} ({session.duration}min)
                              </div>
                              {session.location && session.location !== 'TBD' && (
                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                  <MapPin className="w-2 h-2 flex-shrink-0" />
                                  <span className="truncate text-xs">{session.location}</span>
                                </div>
                              )}
                              {sessionCount && (
                                <div className="text-xs text-gray-600 mb-1 font-medium">
                                  {sessionCount.current} of {sessionCount.total}
                                </div>
                              )}
                              <Badge 
                                variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                                className="text-xs px-1.5 py-0.5 h-4 leading-none"
                              >
                                {session.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
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
