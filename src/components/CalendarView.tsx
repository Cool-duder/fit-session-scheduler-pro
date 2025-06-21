import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addWeeks, subWeeks } from "date-fns";
import NewSessionDialog from "./NewSessionDialog";
import { useSessions } from "@/hooks/useSessions";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { sessions, loading, addSession, refetch } = useSessions();

  const handleAddSession = async (newSession: {
    client_id: string;
    client_name: string;
    date: string;
    time: string;
    duration: number;
    package: string;
  }) => {
    console.log('Adding new session:', newSession);
    await addSession({
      ...newSession,
      status: 'confirmed'
    });
    // Refetch sessions to ensure calendar updates
    await refetch();
  };

  const timeSlots = [
    "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
  ];

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const getSessionForTimeSlot = (date: Date, time: string) => {
    const session = sessions.find(session => {
      const sessionDate = new Date(session.date);
      const isDateMatch = isSameDay(sessionDate, date);
      const isTimeMatch = session.time === time;
      console.log('Checking session:', { 
        sessionDate: format(sessionDate, 'yyyy-MM-dd'), 
        checkDate: format(date, 'yyyy-MM-dd'),
        sessionTime: session.time,
        checkTime: time,
        isDateMatch,
        isTimeMatch,
        clientName: session.client_name
      });
      return isDateMatch && isTimeMatch;
    });
    return session;
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

  console.log('Current sessions:', sessions);

  return (
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
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[200px] text-center">
                {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart), 'MMM d, yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
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
            <div className="font-medium text-sm text-gray-500 p-2">Time</div>
            
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
                        <div className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-shadow ${
                          session.duration === 60 ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <div className="font-medium truncate">{session.client_name}</div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            {session.duration}min
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{session.location}</span>
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
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Monthly view coming soon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
