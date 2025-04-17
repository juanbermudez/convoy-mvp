# Offline-First Data Integration Plan

## Overview

This document outlines the implementation plan for connecting the Convoy MVP dashboard to display real project and task data from Supabase while leveraging WatermelonDB for offline-first functionality. This integration will enable users to view and interact with data regardless of connectivity status, with seamless synchronization when connectivity is restored.

## Architecture

The architecture follows a layered approach to ensure separation of concerns and maintain code quality:

```
┌─────────────────────┐
│                     │
│  React Components   │
│                     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│                     │
│    Custom Hooks     │
│                     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│                     │
│    Repositories     │
│                     │
└─────────┬───────────┘
          │
          ▼
┌─────────┴───────────┐
│ WatermelonDB Models │◄────┐
└─────────┬───────────┘     │
          │                 │
          ▼                 │
┌─────────────────────┐     │
│                     │     │
│  Sync Coordinator   │─────┘
│                     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│                     │
│   Supabase Client   │
│                     │
└─────────────────────┘
```

## Implementation Details

### 1. WatermelonDB Schema

The WatermelonDB schema must precisely mirror our Supabase schema to ensure data consistency. We will implement the following models:

#### Workspace Model

```typescript
// /app/src/models/Workspace.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, text, children } from '@nozbe/watermelondb/decorators';

export default class Workspace extends Model {
  static table = 'workspaces';
  
  @text('name') name;
  @text('description') description;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  
  @children('projects') projects;
}
```

#### Project Model

```typescript
// /app/src/models/Project.ts
import { Model } from '@nozbe/watermelondb';
import { field, relation, date, text, children } from '@nozbe/watermelondb/decorators';

export default class Project extends Model {
  static table = 'projects';
  
  @text('name') name;
  @text('description') description;
  @text('status') status;
  @date('target_date') targetDate;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  
  @relation('workspaces', 'workspace_id') workspace;
  @children('workstreams') workstreams;
  @children('tasks') tasks;
}
```

#### Workstream Model

```typescript
// /app/src/models/Workstream.ts
import { Model } from '@nozbe/watermelondb';
import { field, relation, date, text, children } from '@nozbe/watermelondb/decorators';

export default class Workstream extends Model {
  static table = 'workstreams';
  
  @text('name') name;
  @text('description') description;
  @text('status') status;
  @field('progress') progress;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  
  @relation('projects', 'project_id') project;
  @children('tasks') tasks;
}
```

#### Task Model

```typescript
// /app/src/models/Task.ts
import { Model } from '@nozbe/watermelondb';
import { field, relation, date, text, json } from '@nozbe/watermelondb/decorators';

export default class Task extends Model {
  static table = 'tasks';
  
  @text('title') title;
  @text('description') description;
  @text('status') status;
  @text('priority') priority;
  @json('labels') labels;
  @json('relationships') relationships;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  
  @relation('projects', 'project_id') project;
  @relation('workstreams', 'workstream_id') workstream;
}
```

#### Relationship Model

```typescript
// /app/src/models/Relationship.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, text, json } from '@nozbe/watermelondb/decorators';

export default class Relationship extends Model {
  static table = 'relationships';
  
  @text('source_type') sourceType;
  @text('source_id') sourceId;
  @text('relationship_type') relationshipType;
  @text('target_type') targetType;
  @text('target_id') targetId;
  @json('metadata') metadata;
  @date('created_at') createdAt;
}
```

### 2. Database Schema Definition

We need to define the WatermelonDB schema that will be used to create the local database:

```typescript
// /app/src/models/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workspaces',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'workspace_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'target_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'workstreams',
      columns: [
        { name: 'project_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'progress', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'project_id', type: 'string' },
        { name: 'workstream_id', type: 'string', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'labels', type: 'string' }, // JSON stringified
        { name: 'relationships', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'relationships',
      columns: [
        { name: 'source_type', type: 'string' },
        { name: 'source_id', type: 'string' },
        { name: 'relationship_type', type: 'string' },
        { name: 'target_type', type: 'string' },
        { name: 'target_id', type: 'string' },
        { name: 'metadata', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
      ]
    }),
  ]
});
```

### 3. Database Initialization

We need to initialize WatermelonDB with our schema and models:

```typescript
// /app/src/models/index.ts
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import Workspace from './Workspace';
import Project from './Project';
import Workstream from './Workstream';
import Task from './Task';
import Relationship from './Relationship';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // enable JSI for better performance (optional)
  onSetUpError: error => {
    // Handle DB setup errors
    console.error('Database setup error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    Workspace,
    Project,
    Workstream,
    Task,
    Relationship
  ],
});

// Export collections for easier access
export const workspaces = database.collections.get('workspaces');
export const projects = database.collections.get('projects');
export const workstreams = database.collections.get('workstreams');
export const tasks = database.collections.get('tasks');
export const relationships = database.collections.get('relationships');
```

### 4. Synchronization Service

The Synchronization Service will handle data flow between Supabase and WatermelonDB:

```typescript
// /app/src/services/SyncService.ts
import { database } from '../models';
import { supabase } from '../lib/supabase';
import { synchronize } from '@nozbe/watermelondb/sync';

export class SyncService {
  // Track online status
  private _isOnline = navigator.onLine;
  private _syncInProgress = false;
  private _lastSyncTime = null;
  private _syncListeners = [];
  
  constructor() {
    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
  }
  
  private handleOnlineStatusChange() {
    const wasOnline = this._isOnline;
    this._isOnline = navigator.onLine;
    
    // If we just came back online, trigger a sync
    if (!wasOnline && this._isOnline) {
      this.sync().catch(console.error);
    }
    
    // Notify listeners
    this._syncListeners.forEach(listener => {
      listener({
        isOnline: this._isOnline,
        syncInProgress: this._syncInProgress,
        lastSyncTime: this._lastSyncTime
      });
    });
  }
  
  // Subscribe to sync status changes
  public onSyncStatusChange(listener) {
    this._syncListeners.push(listener);
    return () => {
      this._syncListeners = this._syncListeners.filter(l => l !== listener);
    };
  }
  
  // Main sync function
  public async sync() {
    if (this._syncInProgress || !this._isOnline) {
      return;
    }
    
    try {
      this._syncInProgress = true;
      this.notifySyncStatusChange();
      
      // Use WatermelonDB's synchronize function
      await synchronize({
        database,
        pullChanges: async ({ lastPulledAt }) => {
          // Fetch changes from Supabase since lastPulledAt
          const workspaceChanges = await this.fetchWorkspaceChanges(lastPulledAt);
          const projectChanges = await this.fetchProjectChanges(lastPulledAt);
          const workstreamChanges = await this.fetchWorkstreamChanges(lastPulledAt);
          const taskChanges = await this.fetchTaskChanges(lastPulledAt);
          const relationshipChanges = await this.fetchRelationshipChanges(lastPulledAt);
          
          return {
            changes: {
              workspaces: workspaceChanges,
              projects: projectChanges,
              workstreams: workstreamChanges,
              tasks: taskChanges,
              relationships: relationshipChanges,
            },
            timestamp: Date.now()
          };
        },
        pushChanges: async ({ changes }) => {
          // Push local changes to Supabase
          await this.pushWorkspaceChanges(changes.workspaces);
          await this.pushProjectChanges(changes.projects);
          await this.pushWorkstreamChanges(changes.workstreams);
          await this.pushTaskChanges(changes.tasks);
          await this.pushRelationshipChanges(changes.relationships);
        },
        migrationsEnabledAtVersion: 1,
      });
      
      this._lastSyncTime = new Date();
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      this._syncInProgress = false;
      this.notifySyncStatusChange();
    }
  }
  
  // Notify all listeners of sync status change
  private notifySyncStatusChange() {
    this._syncListeners.forEach(listener => {
      listener({
        isOnline: this._isOnline,
        syncInProgress: this._syncInProgress,
        lastSyncTime: this._lastSyncTime
      });
    });
  }
  
  // Implementation of fetch and push methods for each table
  private async fetchWorkspaceChanges(lastPulledAt) {
    // Convert timestamp to ISO string for Supabase
    const lastPulledAtISO = lastPulledAt ? new Date(lastPulledAt).toISOString() : null;
    
    // Fetch created and updated records
    const { data: created, error: createdError } = await supabase
      .from('workspaces')
      .select('*')
      .gt('created_at', lastPulledAtISO || '1970-01-01T00:00:00Z');
    
    if (createdError) throw createdError;
    
    const { data: updated, error: updatedError } = await supabase
      .from('workspaces')
      .select('*')
      .gt('updated_at', lastPulledAtISO || '1970-01-01T00:00:00Z')
      .lte('created_at', lastPulledAtISO || new Date().toISOString());
    
    if (updatedError) throw updatedError;
    
    // Fetch deleted records (this requires a 'deleted_at' column in Supabase)
    const { data: deleted, error: deletedError } = await supabase
      .from('workspaces')
      .select('id')
      .not('deleted_at', 'is', null)
      .gt('deleted_at', lastPulledAtISO || '1970-01-01T00:00:00Z');
    
    if (deletedError) throw deletedError;
    
    return {
      created: this.transformSupabaseRecords(created),
      updated: this.transformSupabaseRecords(updated),
      deleted: deleted.map(record => record.id)
    };
  }
  
  // Similar fetchChanges methods for other tables...
  
  private async pushWorkspaceChanges({ created, updated, deleted }) {
    // Push created records
    if (created.length > 0) {
      const { error } = await supabase
        .from('workspaces')
        .insert(created.map(this.transformWatermelonRecord));
      
      if (error) throw error;
    }
    
    // Push updated records
    for (const record of updated) {
      const { error } = await supabase
        .from('workspaces')
        .update(this.transformWatermelonRecord(record))
        .eq('id', record.id);
      
      if (error) throw error;
    }
    
    // Handle deleted records
    for (const id of deleted) {
      // Option 1: Hard delete
      /*
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);
      */
      
      // Option 2: Soft delete (requires deleted_at column)
      const { error } = await supabase
        .from('workspaces')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    }
  }
  
  // Similar pushChanges methods for other tables...
  
  // Helper methods for data transformation
  private transformSupabaseRecords(records) {
    return records.map(record => ({
      id: record.id,
      ...record,
      _status: 'synced'
    }));
  }
  
  private transformWatermelonRecord(record) {
    // Clone record to avoid modifying the original
    const result = { ...record };
    
    // Remove WatermelonDB specific fields
    delete result._status;
    delete result._changed;
    
    return result;
  }
}

// Export singleton instance
export const syncService = new SyncService();
```

### 5. Data Access Layer (Repositories)

The Repository pattern provides a clean interface for accessing and manipulating data:

```typescript
// /app/src/repositories/WorkspaceRepository.ts
import { workspaces } from '../models';
import { syncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';

export class WorkspaceRepository {
  // Get all workspaces
  async getWorkspaces() {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Return data from local database
      return await workspaces.query().fetch();
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }
  
  // Get workspace by ID
  async getWorkspaceById(id) {
    try {
      return await workspaces.find(id);
    } catch (error) {
      console.error(`Error fetching workspace ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new workspace
  async createWorkspace(data) {
    try {
      let newWorkspace;
      
      await database.action(async () => {
        newWorkspace = await workspaces.create(workspace => {
          workspace.name = data.name;
          workspace.description = data.description || '';
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return newWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }
  
  // Update a workspace
  async updateWorkspace(id, data) {
    try {
      const workspace = await workspaces.find(id);
      
      await database.action(async () => {
        await workspace.update(workspace => {
          workspace.name = data.name;
          workspace.description = data.description || workspace.description;
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return workspace;
    } catch (error) {
      console.error(`Error updating workspace ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a workspace
  async deleteWorkspace(id) {
    try {
      const workspace = await workspaces.find(id);
      
      await database.action(async () => {
        await workspace.markAsDeleted();
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting workspace ${id}:`, error);
      throw error;
    }
  }
  
  // Observe workspaces (for real-time updates)
  observeWorkspaces(callback) {
    return workspaces.query().observe().subscribe(callback);
  }
  
  // Observe a specific workspace
  observeWorkspace(id, callback) {
    return workspaces.findAndObserve(id).subscribe(callback);
  }
}

// Export singleton instance
export const workspaceRepository = new WorkspaceRepository();
```

Similar repository implementations will be needed for Projects, Workstreams, Tasks, and Relationships.

### 6. React Hooks

Custom React hooks will provide a simple interface for components to access data:

```typescript
// /app/src/hooks/useWorkspaces.ts
import { useState, useEffect } from 'react';
import { workspaceRepository } from '../repositories/WorkspaceRepository';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let subscription;
    
    const loadWorkspaces = async () => {
      try {
        setLoading(true);
        
        // Get initial data
        const initialWorkspaces = await workspaceRepository.getWorkspaces();
        setWorkspaces(initialWorkspaces);
        
        // Subscribe to changes
        subscription = workspaceRepository.observeWorkspaces(updatedWorkspaces => {
          setWorkspaces(updatedWorkspaces);
        });
      } catch (err) {
        console.error('Error in useWorkspaces:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkspaces();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  return { workspaces, loading, error };
}
```

```typescript
// /app/src/hooks/useWorkspace.ts
import { useState, useEffect } from 'react';
import { workspaceRepository } from '../repositories/WorkspaceRepository';

export function useWorkspace(id) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let subscription;
    
    const loadWorkspace = async () => {
      if (!id) {
        setWorkspace(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get initial data
        const initialWorkspace = await workspaceRepository.getWorkspaceById(id);
        setWorkspace(initialWorkspace);
        
        // Subscribe to changes
        subscription = workspaceRepository.observeWorkspace(id, updatedWorkspace => {
          setWorkspace(updatedWorkspace);
        });
      } catch (err) {
        console.error(`Error in useWorkspace for ID ${id}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkspace();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id]);
  
  return { workspace, loading, error };
}
```

Similar hooks will be created for Projects, Workstreams, Tasks, and Relationships.

### 7. Connectivity and Sync Status Component

```typescript
// /app/src/components/SyncStatus.tsx
import React, { useState, useEffect } from 'react';
import { syncService } from '../services/SyncService';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { 
  CloudCheck, 
  CloudOff, 
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';

export function SyncStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    syncInProgress: false,
    lastSyncTime: null
  });
  
  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.onSyncStatusChange(newStatus => {
      setStatus(newStatus);
    });
    
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
                <CloudCheck size={16} className="text-green-500" />
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
```

### 8. Updated Projects Component

```typescript
// /app/src/features/projects/index.tsx
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Breadcrumb } from '@/components/breadcrumb';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { ProjectsDialogs } from './components/projects-dialogs';
import ProjectsProvider from './context/projects-context';
import { useProjects } from '@/hooks/useProjects';
import { SyncStatus } from '@/components/SyncStatus';
import { ProjectsSkeleton } from './components/projects-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Projects() {
  const { projects, loading, error } = useProjects();
  
  return (
    <ProjectsProvider>
      <div id="content" className="border rounded-lg overflow-hidden">
        <Header fixed>
          <div className="flex flex-1 w-full items-center justify-between">
            <Breadcrumb 
              items={[
                { label: 'Home' },
                { label: 'Projects' }
              ]} 
            />
            <SyncStatus />
          </div>
        </Header>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {loading ? (
              <ProjectsSkeleton />
            ) : error ? (
              <Alert variant="destructive" className="mx-4 my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'An error occurred while loading projects.'}
                </AlertDescription>
              </Alert>
            ) : (
              <DataTable data={projects} columns={columns} />
            )}
          </div>
        </Main>
      </div>

      <ProjectsDialogs />
    </ProjectsProvider>
  );
}
```

### 9. Updated Tasks Component

```typescript
// /app/src/features/tasks/index.tsx
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Breadcrumb } from '@/components/breadcrumb';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { TasksDialogs } from './components/tasks-dialogs';
import TasksProvider from './context/tasks-context';
import { useTasks } from '@/hooks/useTasks';
import { SyncStatus } from '@/components/SyncStatus';
import { TasksSkeleton } from './components/tasks-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TaskFilters } from './components/task-filters';
import { useState } from 'react';

export default function Tasks() {
  const [filters, setFilters] = useState({
    projectId: null,
    workstreamId: null,
    status: null,
    priority: null,
  });
  
  const { tasks, loading, error } = useTasks(filters);
  
  return (
    <TasksProvider>
      <div id="content" className="border rounded-lg overflow-hidden">
        <Header fixed>
          <div className="flex flex-1 w-full items-center justify-between">
            <Breadcrumb 
              items={[
                { label: 'Home' },
                { label: 'Tasks' }
              ]} 
            />
            <SyncStatus />
          </div>
        </Header>
        
        <div className="px-4 py-2 border-b">
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {loading ? (
              <TasksSkeleton />
            ) : error ? (
              <Alert variant="destructive" className="mx-4 my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'An error occurred while loading tasks.'}
                </AlertDescription>
              </Alert>
            ) : (
              <DataTable data={tasks} columns={columns} />
            )}
          </div>
        </Main>
      </div>

      <TasksDialogs />
    </TasksProvider>
  );
}
```

## Integration Considerations

### 1. Performance Optimization

To ensure optimal performance with potentially large datasets:

- Implement pagination in both UI components and data access layers
- Use query batching for large synchronization operations
- Implement lazy loading for relationship data
- Consider data denormalization for frequently accessed information
- Add indexes to WatermelonDB for common query patterns

### 2. Error Handling

A robust error handling strategy is essential for offline-first applications:

- Implement retry logic for synchronization failures
- Provide clear user feedback for sync errors
- Store failed operations for later retry
- Log diagnostic information for debugging
- Add telemetry for monitoring sync health in production

### 3. Data Conflicts

Conflict resolution strategy:

- Use timestamp-based "last write wins" for simple conflicts
- Implement three-way merging for complex data structures
- Provide manual conflict resolution UI for critical data
- Keep audit trail of conflict resolutions
- Use optimistic UI updates with rollback capability

### 4. Testing Strategy

The testing approach should include:

- Unit tests for repository and service layers
- Integration tests for synchronization logic
- UI tests for component rendering and interaction
- Offline mode simulation tests
- Performance tests with large datasets
- Network condition simulation (slow, intermittent)

## Impact Analysis

### 1. Existing Components

All components that currently use mock data will need to be updated:

- Replace hardcoded data with hooks (useProjects, useTasks, etc.)
- Add loading and error states
- Ensure components handle null/undefined data gracefully
- Update styling for different data states

### 2. User Experience Changes

The user experience will be enhanced with:

- Offline capability indication
- Sync status information
- Manual sync trigger
- Improved data freshness
- Consistent performance regardless of network status

### 3. Technical Debt Considerations

To minimize technical debt:

- Document all synchronization edge cases
- Create comprehensive test coverage
- Establish clear patterns for offline data access
- Document the synchronization flow for future developers
- Implement proper telemetry for monitoring

## Deployment Considerations

When deploying this implementation:

1. Database migrations may be needed for soft delete support
2. WatermelonDB requires proper initialization at app startup
3. Ensure proper caching headers are set for API responses
4. Consider versioning strategy for schema changes
5. Implement analytics for tracking sync success rates

## Conclusion

This implementation plan provides a comprehensive approach to integrating our dashboard with Supabase and WatermelonDB for offline-first functionality. By following this architecture, we can ensure a seamless user experience regardless of connectivity status while maintaining data integrity and performance.

The layered architecture ensures separation of concerns and makes the codebase maintainable and extensible. The synchronization service provides robust data flow between local and remote databases, with proper error handling and conflict resolution.

By implementing this plan, we will achieve our goal of enabling the dashboard to display real data from Supabase while providing offline capabilities and real-time updates.
