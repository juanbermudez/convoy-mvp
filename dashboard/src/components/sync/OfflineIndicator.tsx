import React, { useState, useEffect } from 'react';
import { syncService } from '../../services/SyncService';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CloudOff } from 'lucide-react';

export function OfflineIndicator() {
  const [status, setStatus] = useState(syncService.getStatus());
  
  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.onSyncStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    
    // Clean up subscription when component unmounts
    return unsubscribe;
  }, []);
  
  // Only show when offline
  if (status.isOnline) {
    return null;
  }
  
  // Format the last sync time
  const formattedLastSync = status.lastSyncTime 
    ? formatDistanceToNow(status.lastSyncTime, { addSuffix: true }) 
    : 'never';
  
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <CloudOff size={16} className="text-amber-500" />
        <span className="ml-2 text-amber-700 text-sm whitespace-nowrap">Offline Mode</span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="border-amber-200 text-amber-600 text-xs ml-2">
              {status.lastSyncTime ? `Synced ${formattedLastSync}` : 'Never synced'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Working offline. Changes will sync when you reconnect.</p>
            {status.lastSyncTime && (
              <p className="text-xs mt-1">
                Last synced: {status.lastSyncTime.toLocaleString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
