import React, { useState, useEffect } from 'react';
import { syncService, SyncStatus as SyncStatusType } from '../../services/SyncService';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';

export function SyncStatus() {
  const [status, setStatus] = useState<SyncStatusType>(syncService.getStatus());
  
  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.onSyncStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    
    // Clean up subscription when component unmounts
    return unsubscribe;
  }, []);
  
  // Format the last sync time
  const formattedLastSync = status.lastSyncTime 
    ? formatDistanceToNow(status.lastSyncTime, { addSuffix: true }) 
    : 'never';
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center">
              {status.isOnline ? (
                <div className="relative">
                  <Cloud size={16} className="text-green-500" />
                  <Check size={10} className="text-green-500 absolute -bottom-1 -right-1" />
                </div>
              ) : (
                <CloudOff size={16} className="text-amber-500" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {status.isOnline ? 'Online' : 'Offline'} Mode
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground">
              {status.lastSyncTime ? (
                <Check size={14} className="text-green-500 inline mr-1" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500 inline mr-1" />
              )}
              Last synced: {formattedLastSync}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              {status.lastSyncTime ? (
                <>
                  <p>Last synchronized: {formattedLastSync}</p>
                  <p className="text-xs text-muted-foreground">
                    {status.lastSyncTime.toLocaleString()}
                  </p>
                </>
              ) : (
                <p>No synchronization has occurred yet</p>
              )}
              {status.error && (
                <p className="text-destructive mt-1">
                  Error: {status.error.message}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => syncService.sync()}
        disabled={status.syncInProgress || !status.isOnline}
        className="px-2 h-8"
      >
        <RefreshCw 
          size={14} 
          className={`${status.syncInProgress ? 'animate-spin' : ''}`} 
        />
        <span className="ml-1">Sync</span>
      </Button>
    </div>
  );
}
