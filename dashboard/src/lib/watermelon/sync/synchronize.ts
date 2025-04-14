import { pullChanges } from './pullSync';
import { pushChanges } from './pushSync';
import SyncLog from '../models/syncLog';
import database from '../database';

// Track last sync timestamp
let lastSyncTimestamp = 0;
let syncInProgress = false;

// Sync events
export const SyncEvents = {
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  PULL_STARTED: 'pull_started',
  PULL_COMPLETED: 'pull_completed',
  PULL_FAILED: 'pull_failed',
  PUSH_STARTED: 'push_started',
  PUSH_COMPLETED: 'push_completed',
  PUSH_FAILED: 'push_failed',
};

// Event listeners
const listeners = new Map();

/**
 * Main synchronization function
 * Orchestrates both pull and push operations
 */
export async function synchronize(): Promise<boolean> {
  // Prevent concurrent sync operations
  if (syncInProgress) {
    console.log('Sync already in progress, skipping...');
    return false;
  }
  
  syncInProgress = true;
  emitSyncEvent(SyncEvents.SYNC_STARTED);
  
  try {
    console.log('Starting synchronization...');
    
    // First push local changes to remote
    emitSyncEvent(SyncEvents.PUSH_STARTED);
    const pushSuccess = await pushChanges();
    
    if (pushSuccess) {
      emitSyncEvent(SyncEvents.PUSH_COMPLETED);
    } else {
      emitSyncEvent(SyncEvents.PUSH_FAILED);
      console.warn('Push operation failed, continuing with pull...');
    }
    
    // Then pull remote changes to local
    emitSyncEvent(SyncEvents.PULL_STARTED);
    const pullSuccess = await pullChanges(lastSyncTimestamp);
    
    if (pullSuccess) {
      emitSyncEvent(SyncEvents.PULL_COMPLETED);
      // Update last sync timestamp only if pull was successful
      lastSyncTimestamp = Date.now();
    } else {
      emitSyncEvent(SyncEvents.PULL_FAILED);
      console.warn('Pull operation failed');
    }
    
    // Clean up old sync logs
    await SyncLog.cleanupOldLogs(database);
    
    // Sync is considered successful if either push or pull succeeded
    const syncSuccess = pushSuccess || pullSuccess;
    if (syncSuccess) {
      console.log('Synchronization completed successfully');
      emitSyncEvent(SyncEvents.SYNC_COMPLETED);
    } else {
      console.error('Synchronization failed completely');
      emitSyncEvent(SyncEvents.SYNC_FAILED);
    }
    
    syncInProgress = false;
    return syncSuccess;
  } catch (error) {
    console.error('Error during synchronization:', error);
    emitSyncEvent(SyncEvents.SYNC_FAILED, error);
    syncInProgress = false;
    return false;
  }
}

/**
 * Add a listener for sync events
 * @param event The event to listen for
 * @param callback The callback function
 */
export function addSyncListener(event: string, callback: Function): void {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }
  
  const eventListeners = listeners.get(event);
  eventListeners.push(callback);
}

/**
 * Remove a listener for sync events
 * @param event The event to stop listening for
 * @param callback The callback function to remove
 */
export function removeSyncListener(event: string, callback: Function): void {
  if (!listeners.has(event)) {
    return;
  }
  
  const eventListeners = listeners.get(event);
  const index = eventListeners.indexOf(callback);
  
  if (index !== -1) {
    eventListeners.splice(index, 1);
  }
}

/**
 * Emit a sync event
 * @param event The event to emit
 * @param data Optional data to pass to listeners
 */
function emitSyncEvent(event: string, data?: any): void {
  if (!listeners.has(event)) {
    return;
  }
  
  const eventListeners = listeners.get(event);
  for (const listener of eventListeners) {
    try {
      listener(data);
    } catch (error) {
      console.error(`Error in sync event listener for ${event}:`, error);
    }
  }
}

/**
 * Get the timestamp of the last successful sync
 */
export function getLastSyncTimestamp(): number {
  return lastSyncTimestamp;
}

/**
 * Check if a sync is currently in progress
 */
export function isSyncInProgress(): boolean {
  return syncInProgress;
}

/**
 * Manually set the last sync timestamp
 * This is useful for testing or initializing the sync process
 * @param timestamp The timestamp to set
 */
export function setLastSyncTimestamp(timestamp: number): void {
  lastSyncTimestamp = timestamp;
}

/**
 * Get sync status information
 */
export function getSyncStatus(): { 
  lastSync: number, 
  inProgress: boolean 
} {
  return {
    lastSync: lastSyncTimestamp,
    inProgress: syncInProgress
  };
}
