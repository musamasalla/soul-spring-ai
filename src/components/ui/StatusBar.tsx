import React from 'react';
import { WifiOff, Database, AlertCircle } from 'lucide-react';

interface StatusBarProps {
  isOffline: boolean;
  message?: string;
}

export function StatusBar({ isOffline, message }: StatusBarProps) {
  if (!isOffline) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-100 text-amber-900 py-1 px-4 flex items-center justify-center text-xs z-50 border-t border-amber-200">
      <div className="flex items-center gap-2 max-w-screen-lg mx-auto">
        {isOffline ? <WifiOff className="h-3 w-3" /> : <Database className="h-3 w-3" />}
        <span>
          {message || "Operating in offline mode. Some features may be limited."}
          {" "}
          <button 
            className="underline hover:text-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </span>
      </div>
    </div>
  );
} 