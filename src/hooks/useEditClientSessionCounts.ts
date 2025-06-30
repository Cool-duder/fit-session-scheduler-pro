
import { useState, useEffect } from "react";
import { Client } from "@/hooks/useClients";
import { Session } from "@/hooks/useSessions";
import { usePackages } from "@/hooks/usePackages";

interface SessionCounts {
  totalSessions: number;
  sessionsLeft: number;
  completedSessions: number;
  isPreview: boolean;
}

export const useEditClientSessionCounts = (
  client: Client,
  clientSessions: Session[],
  selectedPackage: string
) => {
  const { packages } = usePackages();
  const [sessionCounts, setSessionCounts] = useState<SessionCounts>({
    totalSessions: client.total_sessions,
    sessionsLeft: client.sessions_left,
    completedSessions: 0,
    isPreview: false
  });

  // Helper function to extract sessions from package string
  const getSessionsFromPackage = (packageStr: string) => {
    console.log('Getting sessions for package:', packageStr);
    const selectedPkg = packages.find(pkg => pkg.name === packageStr);
    if (selectedPkg) {
      console.log('Found matching package:', selectedPkg);
      return selectedPkg.sessions;
    }
    
    // Enhanced regex to handle different package naming patterns
    const patterns = [
      /^(\d+)x\s*PK/i,  // Matches "5x PK 30MIN", "10x PK 60MIN", etc.
      /^(\d+)x\s*\(/i,   // Matches "1x (30MIN)", "1x (60MIN)", etc.
      /^(\d+)x\s*/i      // Matches "10x 30MIN Basic", etc.
    ];
    
    for (const pattern of patterns) {
      const match = packageStr.match(pattern);
      if (match) {
        const sessions = parseInt(match[1]);
        console.log('Extracted sessions from regex:', sessions);
        return sessions;
      }
    }
    
    console.log('No match found, defaulting to 10 sessions');
    return 10; // Default fallback
  };

  useEffect(() => {
    const packageChanged = selectedPackage !== client.package;
    
    // Calculate how many sessions have been completed
    const completedSessions = clientSessions.filter(session => 
      session.status === 'completed' || new Date(session.date) < new Date()
    ).length;
    
    if (packageChanged) {
      // Package has changed - show preview calculations
      const newTotalSessions = getSessionsFromPackage(selectedPackage);
      const newSessionsLeft = Math.max(0, newTotalSessions - completedSessions);
      
      console.log('=== PACKAGE CHANGED - PREVIEW MODE ===');
      console.log('New package:', selectedPackage);
      console.log('New total sessions:', newTotalSessions);
      console.log('Completed sessions:', completedSessions);
      console.log('New sessions left:', newSessionsLeft);
      
      setSessionCounts({
        totalSessions: newTotalSessions,
        sessionsLeft: newSessionsLeft,
        completedSessions: completedSessions,
        isPreview: true
      });
    } else {
      // Package hasn't changed - show original client data
      console.log('=== PACKAGE UNCHANGED - ORIGINAL DATA ===');
      console.log('Original total sessions:', client.total_sessions);
      console.log('Original sessions left:', client.sessions_left);
      console.log('Completed sessions:', completedSessions);
      
      setSessionCounts({
        totalSessions: client.total_sessions,
        sessionsLeft: client.sessions_left,
        completedSessions: completedSessions,
        isPreview: false
      });
    }
  }, [selectedPackage, clientSessions, packages, client.package, client.total_sessions, client.sessions_left]);

  return sessionCounts;
};
