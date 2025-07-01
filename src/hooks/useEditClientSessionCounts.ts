
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

  // Helper function to get sessions from package
  const getSessionsFromPackage = (packageStr: string) => {
    console.log('Getting sessions for package:', packageStr);
    
    // First try to find exact match in packages
    const selectedPkg = packages.find(pkg => pkg.name === packageStr);
    if (selectedPkg) {
      console.log('Found matching package:', selectedPkg);
      return selectedPkg.sessions;
    }
    
    // Enhanced regex patterns for package parsing
    const patterns = [
      /^(\d+)x\s*PK/i,  // Matches "5x PK 30MIN", "10x PK 60MIN", etc.
      /^(\d+)x\s*\(/i,   // Matches "1x (30MIN)", "1x (60MIN)", etc.
      /^(\d+)x\s*/i      // Matches "10x 30MIN Basic", etc.
    ];
    
    for (const pattern of patterns) {
      const match = packageStr.match(pattern);
      if (match) {
        const sessions = parseInt(match[1]);
        console.log('Extracted sessions from regex:', sessions, 'for package:', packageStr);
        return sessions;
      }
    }
    
    console.log('No match found for package:', packageStr, 'defaulting to 1 session');
    return 1; // Default fallback
  };

  useEffect(() => {
    console.log('=== SESSION COUNTS UPDATE ===');
    console.log('Client:', client.name);
    console.log('Client package:', client.package);
    console.log('Selected package:', selectedPackage);
    console.log('Client sessions:', clientSessions.length);
    console.log('Client total_sessions from DB:', client.total_sessions);
    console.log('Client sessions_left from DB:', client.sessions_left);
    
    // Calculate completed sessions
    const completedSessions = clientSessions.filter(session => 
      session.status === 'completed' || new Date(session.date) < new Date()
    ).length;
    
    console.log('Completed sessions:', completedSessions);
    
    // Check if package has changed
    const packageChanged = selectedPackage !== client.package;
    console.log('Package changed:', packageChanged);
    
    if (packageChanged) {
      // Package has changed - calculate new values
      const newTotalSessions = getSessionsFromPackage(selectedPackage);
      const newSessionsLeft = Math.max(0, newTotalSessions - completedSessions);
      
      console.log('=== PACKAGE CHANGED - NEW CALCULATIONS ===');
      console.log('New total sessions:', newTotalSessions);
      console.log('New sessions left:', newSessionsLeft);
      
      setSessionCounts({
        totalSessions: newTotalSessions,
        sessionsLeft: newSessionsLeft,
        completedSessions: completedSessions,
        isPreview: true
      });
    } else {
      // Package hasn't changed - use the actual database values
      console.log('=== USING DATABASE VALUES ===');
      console.log('DB total sessions:', client.total_sessions);
      console.log('DB sessions left:', client.sessions_left);
      
      setSessionCounts({
        totalSessions: client.total_sessions,
        sessionsLeft: client.sessions_left,
        completedSessions: completedSessions,
        isPreview: false
      });
    }
  }, [selectedPackage, clientSessions, packages, client.package, client.total_sessions, client.sessions_left, client.name]);

  return sessionCounts;
};
