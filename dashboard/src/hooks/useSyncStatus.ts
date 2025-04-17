import { useState, useEffect, useCallback } from 'react';
import { syncService, SyncStatus } from '../services/SyncService';

interface UseSyncStatusResult {
  status: SyncStatus;
  triggerSync: () => Promise<void>;
}

export function useSyncStatus(): UseSyncStatusResult {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  
  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.onSyncStatusChange(newStatus => {
      setStatus(newStatus);
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
  
  // Function to trigger sync
  const triggerSync = useCallback(async () => {
    if (!status.isOnline || status.syncInProgress) {
      return;
    }
    
    try {
      await syncService.sync();
    } catch (error) {
      console.error('Error triggering sync:', error);
    }
  }, [status.isOnline, status.syncInProgress]);
  
  return { status, triggerSync };
}
