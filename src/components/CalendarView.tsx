import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Clock, MapPin, Download } from "lucide-react";
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
  };

  const getSessionForTimeSlot = (date: Date, time: string) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    
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
    
    const session = sessions.find(session => {
      // Normalize session date - ensure consistent date format
      const sessionDate = new Date(session.date);
      const sessionDateStr = format(sessionDate, 'yyyy-MM-dd');
      
      // Convert database time format (HH:MM:SS) to comparison format (HH:MM)
      const sessionTime = session.time.substring(0, 5); // Extract HH:MM from HH:MM:SS
      
      const isDateMatch = sessionDateStr === targetDateStr;
      const isTimeMatch = sessionTime === targetTime24;
      
      return isDateMatch && isTimeMatch;
    });
    
    return session;
  };

  const getSessionsForDay = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    
    return sessions.filter(session => {
      // Normalize session date - ensure consistent date format
      const sessionDate = new Date(session.date);
      const sessionDateStr = format(sessionDate, 'yyyy-MM-dd');
      
      const isMatch = sessionDateStr === targetDateStr;
      return isMatch;
    });
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="px-3"
                >
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToICalendar}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Calendar
                </Button>
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
                        {daySessions.map((session) => (
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
                            <Badge 
                              variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-xs px-1.5 py-0.5 h-4 leading-none"
                            >
                              {session.status}
                            </Badge>
                          </div>
                        ))}
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
