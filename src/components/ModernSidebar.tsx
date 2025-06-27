
import React from "react";
import { Calendar, Users, BarChart3, MessageSquare, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModernSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ModernSidebar = ({ activeTab, onTabChange }: ModernSidebarProps) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-green-600' },
    { id: 'clients', label: 'Clients', icon: Users, color: 'text-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-600' },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare, color: 'text-pink-600' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">PT Manager</h2>
        <p className="text-sm text-gray-500 mt-1">Personal Training</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left font-medium",
                isActive 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "hover:bg-gray-50 text-gray-700"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : item.color)} />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default ModernSidebar;
