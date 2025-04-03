import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type OfflineIndicatorProps = {
  isUsingFallback: boolean;
};

export function OfflineIndicator({ isUsingFallback }: OfflineIndicatorProps) {
  if (!isUsingFallback) return null;
  
  return (
    <Card className="bg-amber-50 border-amber-200 mb-4">
      <CardContent className="p-3 flex items-center gap-2">
        <AlertTriangle className="text-amber-500 h-5 w-5" />
        <p className="text-amber-800 text-sm">
          Operating in offline mode with demo data. Some features may be limited.
        </p>
      </CardContent>
    </Card>
  );
} 