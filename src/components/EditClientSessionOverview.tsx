
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, MapPin, DollarSign, Gift, CreditCard } from "lucide-react";
import { Session } from "@/hooks/useSessions";
import { format } from "date-fns";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { formatForDisplay, debugDate } from "@/lib/dateUtils";

interface SessionCounts {
  totalSessions: number;
  sessionsLeft: number;
  completedSessions: number;
  isPreview: boolean;
}

interface EditClientSessionOverviewProps {
  formData: {
    birthday: string;
    paymentType: string;
  };
  sessionCounts: SessionCounts;
  clientSessions: Session[];
}

const EditClientSessionOverview = ({ formData, sessionCounts, clientSessions }: EditClientSessionOverviewProps) => {
  // Helper function to format time from 24-hour to 12-hour format
  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to safely format session dates
  const formatSessionDate = (dateString: string) => {
    try {
      debugDate('Formatting session date', dateString);
      return formatForDisplay(dateString, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting session date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Session Overview
      </h3>
      
      {/* Client Stats */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-4 mb-6">
        {formData.birthday && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Birthday:</span>
            <div className="flex items-center gap-2 text-pink-600">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">{format(new Date(formData.birthday), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">Payment Method:</span>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <PaymentStatusBadge status="completed" paymentType={formData.paymentType} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{sessionCounts.sessionsLeft}</div>
            <div className="text-xs text-green-700 font-medium">Session Left</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{sessionCounts.totalSessions}</div>
            <div className="text-xs text-blue-700 font-medium">Total Session</div>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-bold text-purple-600">{sessionCounts.completedSessions} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
              style={{ 
                width: `${sessionCounts.totalSessions > 0 ? ((sessionCounts.totalSessions - sessionCounts.sessionsLeft) / sessionCounts.totalSessions) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {sessionCounts.totalSessions > 0 ? Math.round(((sessionCounts.totalSessions - sessionCounts.sessionsLeft) / sessionCounts.totalSessions) * 100) : 0}% Complete
          </p>
        </div>
      </div>

      {/* Session History */}
      <div className="mt-6">
        <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Sessions ({clientSessions.length} total)
        </h4>
        <ScrollArea className="h-80 w-full border rounded-lg bg-white">
          {clientSessions.length > 0 ? (
            <div className="p-4 space-y-3">
              {clientSessions.slice(0, 10).map((session, index) => (
                <div key={session.id} className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={session.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {session.status}
                      </Badge>
                      {session.payment_status && (
                        <PaymentStatusBadge 
                          status={session.payment_status as 'pending' | 'completed' | 'failed'} 
                          paymentType={session.payment_type}
                        />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {formatSessionDate(session.date)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime12Hour(session.time.substring(0, 5))}</span>
                      </div>
                      {session.location && session.location !== 'TBD' && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-24">{session.location}</span>
                        </div>
                      )}
                    </div>
                    {session.price && (
                      <div className="flex items-center gap-1 font-medium text-green-600">
                        <DollarSign className="w-3 h-3" />
                        <span>${session.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">No sessions yet</p>
              <p className="text-sm">Sessions will appear here once scheduled</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default EditClientSessionOverview;
