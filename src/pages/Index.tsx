
import React, { useState } from "react";
import ModernSidebar from "@/components/ModernSidebar";
import DashboardOverview from "@/components/DashboardOverview";
import CalendarView from "@/components/CalendarView";
import ClientsView from "@/components/ClientsView";
import MessagingCenter from "@/components/MessagingCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const isMobile = useIsMobile();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'calendar':
        return <CalendarView />;
      case 'clients':
        return <ClientsView />;
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Analytics</CardTitle>
              <CardDescription>
                Track your business performance and client progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon!</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'messaging':
        return <MessagingCenter />;
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModernSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className={cn(
        "flex-1 flex flex-col",
        isMobile ? "pt-14" : ""
      )}>
        <main className={cn(
          "flex-1 overflow-auto",
          isMobile ? "p-4" : "p-8"
        )}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
