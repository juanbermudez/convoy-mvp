/**
 * Simple synchronization service for offline-first functionality
 * This provides a lightweight alternative while we resolve dependency issues
 */

import { getAll, getById, add, update, softDelete, query, stores } from './client';
import { supabase } from '../supabase/client';

// Define export type for sync status
export interface SyncStatus {
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime: Date | null;
  error: Error | null;
}

type SyncStatusListener = (status: SyncStatus) => void;

class SyncService {
  private _isOnline: boolean = navigator.onLine;
  private _syncInProgress: boolean = false;
  private _lastSyncTime: Date | null = null;
  private _error: Error | null = null;
  private _syncListeners: SyncStatusListener[] = [];
  private _clientId: string;
  
  constructor() {
    // Generate or retrieve client ID
    this._clientId = localStorage.getItem('syncClientId') || this.generateClientId();
    localStorage.setItem('syncClientId', this._clientId);
    
    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
    
    // Try to get the last sync time from localStorage
    const lastSyncTimeStr = localStorage.getItem('lastSyncTime');
    if (lastSyncTimeStr) {
      this._lastSyncTime = new Date(lastSyncTimeStr);
    }
    
    // If we're online, schedule a sync after initialization
    if (this._isOnline) {
      setTimeout(() => {
        this.sync().catch(console.error);
      }, 1000);
    }
  }
  
  private generateClientId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomStr}`;
  }
  
  private handleOnlineStatusChange() {
    const wasOnline = this._isOnline;
    this._isOnline = navigator.onLine;
    
    // If we just came back online, trigger a sync
    if (!wasOnline && this._isOnline) {
      this.sync().catch(console.error);
    }
    
    // Notify listeners
    this.notifySyncStatusChange();
  }
  
  public onSyncStatusChange(listener: SyncStatusListener) {
    this._syncListeners.push(listener);
    // Immediately notify with current status
    listener(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      this._syncListeners = this._syncListeners.filter(l => l !== listener);
    };
  }
  
  public getStatus(): SyncStatus {
    return {
      isOnline: this._isOnline,
      syncInProgress: this._syncInProgress,
      lastSyncTime: this._lastSyncTime,
      error: this._error
    };
  }
  
  private notifySyncStatusChange() {
    const status = this.getStatus();
    this._syncListeners.forEach(listener => {
      listener(status);
    });
  }
  
  public async sync(): Promise<void> {
    if (this._syncInProgress || !this._isOnline) {
      return;
    }
    
    this._syncInProgress = true;
    this._error = null;
    this.notifySyncStatusChange();
    
    try {
      // Get last sync time
      const lastSyncTimeISO = this._lastSyncTime 
        ? this._lastSyncTime.toISOString() 
        : '1970-01-01T00:00:00Z';
      
      // 1. Pull changes from server (simplified for MVP)
      await this.pullWorkspaces(lastSyncTimeISO);
      await this.pullProjects(lastSyncTimeISO);
      await this.pullWorkstreams(lastSyncTimeISO);
      await this.pullTasks(lastSyncTimeISO);
      
      // 2. Push local changes to server (simplified for MVP)
      await this.pushLocalChanges();
      
      // Update last sync time
      this._lastSyncTime = new Date();
      localStorage.setItem('lastSyncTime', this._lastSyncTime.toISOString());
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      this._error = error instanceof Error ? error : new Error(String(error));
    } finally {
      this._syncInProgress = false;
      this.notifySyncStatusChange();
    }
  }
  
  // Pull workspaces from server
  private async pullWorkspaces(since: string): Promise<void> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`updated_at.gt.${since},deleted_at.gt.${since}`);
    
    if (error) throw error;
    
    // Process each workspace
    for (const workspace of data || []) {
      const existingWorkspace = await getById(stores.workspaces, workspace.id);
      
      if (workspace.deleted_at) {
        // If deleted on server, soft delete locally
        if (existingWorkspace) {
          await softDelete(stores.workspaces, workspace.id);
        }
      } else if (!existingWorkspace) {
        // If new, add locally
        await add(stores.workspaces, workspace);
      } else {
        // If updated, update locally
        // We could check timestamps here for conflict resolution
        await update(stores.workspaces, workspace);
      }
    }
  }
  
  // Pull projects from server
  private async pullProjects(since: string): Promise<void> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`updated_at.gt.${since},deleted_at.gt.${since}`);
    
    if (error) throw error;
    
    // Process each project
    for (const project of data || []) {
      const existingProject = await getById(stores.projects, project.id);
      
      if (project.deleted_at) {
        // If deleted on server, soft delete locally
        if (existingProject) {
          await softDelete(stores.projects, project.id);
        }
      } else if (!existingProject) {
        // If new, add locally
        await add(stores.projects, project);
      } else {
        // If updated, update locally
        await update(stores.projects, project);
      }
    }
  }
  
  // Pull workstreams from server
  private async pullWorkstreams(since: string): Promise<void> {
    const { data, error } = await supabase
      .from('workstreams')
      .select('*')
      .or(`updated_at.gt.${since},deleted_at.gt.${since}`);
    
    if (error) throw error;
    
    // Process each workstream
    for (const workstream of data || []) {
      const existingWorkstream = await getById(stores.workstreams, workstream.id);
      
      if (workstream.deleted_at) {
        // If deleted on server, soft delete locally
        if (existingWorkstream) {
          await softDelete(stores.workstreams, workstream.id);
        }
      } else if (!existingWorkstream) {
        // If new, add locally
        await add(stores.workstreams, workstream);
      } else {
        // If updated, update locally
        await update(stores.workstreams, workstream);
      }
    }
  }
  
  // Pull tasks from server
  private async pullTasks(since: string): Promise<void> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`updated_at.gt.${since},deleted_at.gt.${since}`);
    
    if (error) throw error;
    
    // Process each task
    for (const task of data || []) {
      const existingTask = await getById(stores.tasks, task.id);
      
      if (task.deleted_at) {
        // If deleted on server, soft delete locally
        if (existingTask) {
          await softDelete(stores.tasks, task.id);
        }
      } else if (!existingTask) {
        // If new, add locally
        await add(stores.tasks, task);
      } else {
        // If updated, update locally
        await update(stores.tasks, task);
      }
    }
  }
  
  // Push local changes to server (simplified for MVP)
  private async pushLocalChanges(): Promise<void> {
    // In a real implementation, we would track local changes and push them
    // For this MVP, we skip this part for simplicity
    console.log('Pushing local changes is not implemented in this simplified version');
  }
}

// Create and export singleton instance
export const syncService = new SyncService();
