
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Cake, Gift } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import BirthdayEmailDialog from "./BirthdayEmailDialog";
import { Client } from "@/hooks/useClients";

interface BirthdayAlertProps {
  clients: Client[];
}

const BirthdayAlert = ({ clients }: BirthdayAlertProps) => {
  const getBirthdayStatus = (birthday?: string) => {
    if (!birthday) return null;
    
    try {
      const birthDate = parseISO(birthday);
      const today = new Date();
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (isToday(thisYearBirthday)) {
        return { status: 'today', text: 'Today!', color: 'bg-pink-500' };
      } else if (isTomorrow(thisYearBirthday)) {
        return { status: 'tomorrow', text: 'Tomorrow', color: 'bg-orange-500' };
      }
      
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 7) {
        return { status: 'soon', text: `In ${daysUntil} days`, color: 'bg-blue-500' };
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const clientsWithUpcomingBirthdays = clients
    .filter(client => {
      const birthdayStatus = getBirthdayStatus(client.birthday);
      return birthdayStatus !== null;
    })
    .sort((a, b) => {
      const statusA = getBirthdayStatus(a.birthday);
      const statusB = getBirthdayStatus(b.birthday);
      
      if (statusA?.status === 'today') return -1;
      if (statusB?.status === 'today') return 1;
      if (statusA?.status === 'tomorrow') return -1;
      if (statusB?.status === 'tomorrow') return 1;
      
      return 0;
    });

  if (clientsWithUpcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-700">
          <Cake className="w-5 h-5" />
          Upcoming Birthdays 🎉
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {clientsWithUpcomingBirthdays.slice(0, 3).map((client) => {
            const birthdayStatus = getBirthdayStatus(client.birthday);
            return (
              <div key={client.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(client.birthday!), 'MMM dd')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {birthdayStatus && (
                    <Badge className={`${birthdayStatus.color} text-white`}>
                      {birthdayStatus.text}
                    </Badge>
                  )}
                  <BirthdayEmailDialog 
                    client={client} 
                    trigger={
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                        <Gift className="w-3 h-3 mr-1" />
                        Send Wishes
                      </Button>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayAlert;
