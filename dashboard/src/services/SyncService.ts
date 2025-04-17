import { database, syncMetadata } from '../models';
import { supabase } from '../lib/supabase/client';
import { synchronize } from '@nozbe/watermelondb/sync';
import { v4 as uuidv4 } from 'uuid';

// Type for sync status subscribers
type SyncStatusListener = (status: SyncStatus) => void;

// Type for sync status
export interface SyncStatus {
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime: Date | null;
  error: Error | null;
}

// Type for sync history entry
interface SyncHistoryEntry {
  id: string;
  clientId: string;
  userId: string | null;
  syncType: 'pull' | 'push' | 'full';
  startedAt: Date;
  completedAt: Date | null;
  recordsPulled: number;
  recordsPushed: number;
  status: 'in_progress' | 'completed' | 'failed';
  errorMessage: string | null;
  clientInfo: Record<string, any>;
}

class SyncService {
  // Track online status
  private _isOnline: boolean = navigator.onLine;
  private _syncInProgress: boolean = false;
  private _lastSyncTime: Date | null = null;
  private _error: Error | null = null;
  private _syncListeners: SyncStatusListener[] = [];
  private _clientId: string;
  private _lastPulledAt: number | null = null;
  
  constructor() {
    // Generate a unique client ID or get from storage
    this._clientId = localStorage.getItem('syncClientId') || uuidv4();
    localStorage.setItem('syncClientId', this._clientId);
    
    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
    
    // Try to get the last sync time from localStorage
    const lastSyncTimeStr = localStorage.getItem('lastSyncTime');
    if (lastSyncTimeStr) {
      this._lastSyncTime = new Date(lastSyncTimeStr);
    }
    
    // Try to get the last pulled timestamp from the database
    this.loadLastPulledAt();
    
    // If we're online, schedule a sync after initialization
    if (this._isOnline) {
      setTimeout(() => {
        this.sync().catch(console.error);
      }, 1000);
    }
  }
  
  // Load last pulled at timestamp from local database
  private async loadLastPulledAt() {
    try {
      const lastPulledAtRecord = await syncMetadata.find('last_pulled_at');
      if (lastPulledAtRecord) {
        this._lastPulledAt = parseInt(lastPulledAtRecord.value, 10);
      }
    } catch (error) {
      console.log('No previous sync timestamp found');
    }
  }
  
  // Save last pulled at timestamp to local database
  private async saveLastPulledAt(timestamp: number) {
    try {
      await database.write(async () => {
        try {
          const record = await syncMetadata.find('last_pulled_at');
          await record.update(rec => {
            rec.value = timestamp.toString();
          });
        } catch (error) {
          await syncMetadata.create(record => {
            record._raw.id = 'last_pulled_at';
            record.key = 'last_pulled_at';
            record.value = timestamp.toString();
          });
        }
      });
      this._lastPulledAt = timestamp;
    } catch (error) {
      console.error('Failed to save sync timestamp', error);
    }
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
  
  // Subscribe to sync status changes
  public onSyncStatusChange(listener: SyncStatusListener) {
    this._syncListeners.push(listener);
    // Immediately notify with current status
    listener(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      this._syncListeners = this._syncListeners.filter(l => l !== listener);
    };
  }
  
  // Get current sync status
  public getStatus(): SyncStatus {
    return {
      isOnline: this._isOnline,
      syncInProgress: this._syncInProgress,
      lastSyncTime: this._lastSyncTime,
      error: this._error
    };
  }
  
  // Notify all listeners of sync status change
  private notifySyncStatusChange() {
    const status = this.getStatus();
    this._syncListeners.forEach(listener => {
      listener(status);
    });
  }
  
  // Create a sync history entry in Supabase
  private async createSyncHistoryEntry(type: 'pull' | 'push' | 'full'): Promise<string> {
    try {
      const entry: Omit<SyncHistoryEntry, 'id' | 'completedAt'> = {
        clientId: this._clientId,
        userId: (await supabase.auth.getUser()).data.user?.id || null,
        syncType: type,
        startedAt: new Date(),
        recordsPulled: 0,
        recordsPushed: 0,
        status: 'in_progress',
        errorMessage: null,
        clientInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: Date.now()
        }
      };
      
      const { data, error } = await supabase
        .from('sync_history')
        .insert(entry)
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create sync history entry', error);
      return uuidv4(); // Fallback ID
    }
  }
  
  // Update a sync history entry in Supabase
  private async updateSyncHistoryEntry(
    id: string, 
    updates: Partial<Omit<SyncHistoryEntry, 'id' | 'clientId' | 'userId' | 'syncType' | 'startedAt'>>
  ) {
    try {
      const { error } = await supabase
        .from('sync_history')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to update sync history entry', error);
    }
  }
  
  // Check if schema is compatible
  private async checkSchemaCompatibility(): Promise<boolean> {
    try {
      // Check for sync_history table
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'sync_history');
        
      if (tablesError) {
        console.error('Error checking tables:', tablesError);
        return false;
      }
      
      const hasSyncHistory = tables && tables.length > 0;
      
      // Check for deleted_at column in workspaces
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'workspaces')
        .eq('table_schema', 'public')
        .eq('column_name', 'deleted_at');
        
      if (columnsError) {
        console.error('Error checking columns:', columnsError);
        return false;
      }
      
      const hasDeletedAt = columns && columns.length > 0;
      
      return hasSyncHistory && hasDeletedAt;
    } catch (error) {
      console.error('Error checking schema compatibility:', error);
      return false;
    }
  }
  
  // Auto-fix schema issues when detected
  private async fixSchema(): Promise<boolean> {
    console.log('Attempting to fix schema issues automatically...');
    
    try {
      // Migration statements to execute
      const migration = [
        // Add deleted_at columns
        `ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,
        `ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,
        `ALTER TABLE relationships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,

        // Add sync-related columns
        `ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_modified_by TEXT;`,
        `ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_modified_by TEXT;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;`,
        `ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS last_modified_by TEXT;`,
        `ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;`,
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_modified_by TEXT;`,
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;`,
        `ALTER TABLE relationships ADD COLUMN IF NOT EXISTS last_modified_by TEXT;`,
        `ALTER TABLE relationships ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;`,

        // Create sync_history table
        `CREATE TABLE IF NOT EXISTS sync_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id TEXT NOT NULL,
          user_id UUID,
          sync_type TEXT NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          records_pulled INTEGER DEFAULT 0,
          records_pushed INTEGER DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'in_progress',
          error_message TEXT,
          client_info JSONB DEFAULT '{}'::jsonb
        );`
      ];
      
      // Execute each statement
      for (const statement of migration) {
        try {
          console.log(`Executing: ${statement.substring(0, 80)}...`);
          
          const { error } = await supabase.rpc('execute_sql', { 
            sql_query: statement 
          });
          
          if (error) {
            console.error('Error executing SQL:', error);
            // Try direct query approach as fallback
            const { error: directError } = await supabase.from('_temp').select('*').limit(1);
            if (directError) {
              console.error('Direct query failed too:', directError);
            }
          }
        } catch (err) {
          console.error('Error executing migration statement:', err);
        }
      }
      
      // Verify the fix worked
      return await this.checkSchemaCompatibility();
      
    } catch (error) {
      console.error('Error fixing schema:', error);
      return false;
    }
  }
  
  // Main sync function
  public async sync(): Promise<void> {
    if (this._syncInProgress || !this._isOnline) {
      return;
    }
    
    let syncId: string | null = null;
    let recordsPulled = 0;
    let recordsPushed = 0;
    
    // Check if schema is compatible
    const isSchemaCompatible = await this.checkSchemaCompatibility();
    if (!isSchemaCompatible) {
      console.warn('Schema incompatibility detected. Attempting to fix schema...');
      
      // Try to fix the schema
      const fixSucceeded = await this.fixSchema();
      if (!fixSucceeded) {
        // If fix failed, stay in offline mode
        console.warn('Failed to fix schema. Running in offline-only mode.');
        this._error = new Error('Schema incompatibility detected. Database schema needs to be updated.');
        this.notifySyncStatusChange();
        return;
      }
      
      console.log('Schema successfully fixed! Continuing with sync.');
    }
    
    try {
      this._syncInProgress = true;
      this._error = null;
      this.notifySyncStatusChange();
      
      // Create sync history entry
      syncId = await this.createSyncHistoryEntry('full');
      
      // Use WatermelonDB's synchronize function
      const syncResult = await synchronize({
        database,
        pullChanges: async ({ lastPulledAt }) => {
          // Use the stored timestamp if available and valid
          const timestamp = this._lastPulledAt || lastPulledAt || 0;
          
          // Convert timestamp to ISO string for Supabase
          const lastPulledAtISO = new Date(timestamp).toISOString();
          
          // Log
          console.log(`Pulling changes since ${lastPulledAtISO}`);
          
          // Helper function to fetch changes with fallback to simple query if deleted_at column doesn't exist
          const fetchChanges = async (table: string): Promise<any[]> => {
            try {
              // Try with deleted_at column
              const { data, error } = await supabase
                .from(table)
                .select('*')
                .or(`updated_at.gt.${lastPulledAtISO},deleted_at.gt.${lastPulledAtISO}`);
              
              if (error) {
                // If error code indicates column doesn't exist, try fallback query
                if (error.code === '42703') { // Column does not exist
                  console.log(`${table} doesn't have deleted_at column, using fallback query`);
                  const { data: fallbackData, error: fallbackError } = await supabase
                    .from(table)
                    .select('*')
                    .gt('updated_at', lastPulledAtISO);
                  
                  if (fallbackError) throw fallbackError;
                  return fallbackData || [];
                } else {
                  throw error;
                }
              }
              
              return data || [];
            } catch (error) {
              console.error(`Error fetching ${table}:`, error);
              throw error;
            }
          };
          
          // Fetch workspaces
          const workspaces = await fetchChanges('workspaces');
          
          // Fetch projects
          const projects = await fetchChanges('projects');
          
          // Fetch workstreams
          const workstreams = await fetchChanges('workstreams');
          
          // Fetch tasks
          const tasks = await fetchChanges('tasks');
          
          // Fetch relationships (using created_at for relationships)
          let relationships: any[] = [];
          try {
            const { data, error } = await supabase
              .from('relationships')
              .select('*')
              .or(`created_at.gt.${lastPulledAtISO},deleted_at.gt.${lastPulledAtISO}`);
            
            if (error) {
              if (error.code === '42703') {
                // Fallback to just created_at
                const { data: fallbackData, error: fallbackError } = await supabase
                  .from('relationships')
                  .select('*')
                  .gt('created_at', lastPulledAtISO);
                
                if (fallbackError) throw fallbackError;
                relationships = fallbackData || [];
              } else {
                throw error;
              }
            } else {
              relationships = data || [];
            }
          } catch (error) {
            console.error('Error fetching relationships:', error);
            throw error;
          }
          
          // Count pulled records
          recordsPulled = (workspaces?.length || 0) + 
                         (projects?.length || 0) + 
                         (workstreams?.length || 0) + 
                         (tasks?.length || 0) + 
                         (relationships?.length || 0);
          
          // Helper function to safely filter deleted records
          const getDeletedAndUpdated = (records: any[]) => {
            // Check if deleted_at field exists in any record
            const hasDeletedAtField = records.length > 0 && records.some(r => 'deleted_at' in r);
            
            if (hasDeletedAtField) {
              // If deleted_at exists, filter normally
              return {
                deleted: records.filter(r => r.deleted_at !== null).map(r => r.id),
                updated: records.filter(r => r.deleted_at === null).map(r => this.transformSupabaseRecord(r))
              };
            } else {
              // If no deleted_at field, assume all records are updated
              return {
                deleted: [],
                updated: records.map(r => this.transformSupabaseRecord(r))
              };
            }
          };
          
          // Process records
          const { deleted: deletedWorkspaces, updated: updatedWorkspaces } = getDeletedAndUpdated(workspaces);
          const { deleted: deletedProjects, updated: updatedProjects } = getDeletedAndUpdated(projects);
          const { deleted: deletedWorkstreams, updated: updatedWorkstreams } = getDeletedAndUpdated(workstreams);
          const { deleted: deletedTasks, updated: updatedTasks } = getDeletedAndUpdated(tasks);
          const { deleted: deletedRelationships, updated: updatedRelationships } = getDeletedAndUpdated(relationships);
          
          // Current server timestamp
          const serverTimestamp = Date.now();
          
          // Save the timestamp for future syncs
          await this.saveLastPulledAt(serverTimestamp);
          
          return {
            changes: {
              workspaces: {
                created: updatedWorkspaces,
                updated: [],
                deleted: deletedWorkspaces
              },
              projects: {
                created: updatedProjects,
                updated: [],
                deleted: deletedProjects
              },
              workstreams: {
                created: updatedWorkstreams,
                updated: [],
                deleted: deletedWorkstreams
              },
              tasks: {
                created: updatedTasks,
                updated: [],
                deleted: deletedTasks
              },
              relationships: {
                created: updatedRelationships,
                updated: [],
                deleted: deletedRelationships
              }
            },
            timestamp: serverTimestamp
          };
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
          // Log
          console.log('Pushing local changes to server', changes);
          
          // Handle created records
          await this.pushCreatedRecords('workspaces', changes.workspaces.created);
          await this.pushCreatedRecords('projects', changes.projects.created);
          await this.pushCreatedRecords('workstreams', changes.workstreams.created);
          await this.pushCreatedRecords('tasks', changes.tasks.created);
          await this.pushCreatedRecords('relationships', changes.relationships.created);
          
          // Handle updated records
          await this.pushUpdatedRecords('workspaces', changes.workspaces.updated);
          await this.pushUpdatedRecords('projects', changes.projects.updated);
          await this.pushUpdatedRecords('workstreams', changes.workstreams.updated);
          await this.pushUpdatedRecords('tasks', changes.tasks.updated);
          await this.pushUpdatedRecords('relationships', changes.relationships.updated);
          
          // Handle deleted records
          await this.pushDeletedRecords('workspaces', changes.workspaces.deleted);
          await this.pushDeletedRecords('projects', changes.projects.deleted);
          await this.pushDeletedRecords('workstreams', changes.workstreams.deleted);
          await this.pushDeletedRecords('tasks', changes.tasks.deleted);
          await this.pushDeletedRecords('relationships', changes.relationships.deleted);
          
          // Count pushed records
          recordsPushed = 
            changes.workspaces.created.length + 
            changes.workspaces.updated.length + 
            changes.workspaces.deleted.length +
            changes.projects.created.length + 
            changes.projects.updated.length + 
            changes.projects.deleted.length +
            changes.workstreams.created.length + 
            changes.workstreams.updated.length + 
            changes.workstreams.deleted.length +
            changes.tasks.created.length + 
            changes.tasks.updated.length + 
            changes.tasks.deleted.length +
            changes.relationships.created.length + 
            changes.relationships.updated.length + 
            changes.relationships.deleted.length;
        },
        migrationsEnabledAtVersion: 1,
        conflictResolver: (table, local, remote) => {
          // Simple conflict resolution - server wins
          return { ...local, ...remote };
        },
      });
      
      // Update sync history entry
      if (syncId) {
        await this.updateSyncHistoryEntry(syncId, {
          completedAt: new Date(),
          recordsPulled,
          recordsPushed,
          status: 'completed'
        });
      }
      
      // Update last sync time
      this._lastSyncTime = new Date();
      localStorage.setItem('lastSyncTime', this._lastSyncTime.toISOString());
      
      console.log('Sync completed successfully', {
        recordsPulled,
        recordsPushed,
        timestamp: this._lastSyncTime
      });
      
      return syncResult;
    } catch (error) {
      console.error('Sync error:', error);
      this._error = error as Error;
      
      // Update sync history entry with error
      if (syncId) {
        await this.updateSyncHistoryEntry(syncId, {
          completedAt: new Date(),
          recordsPulled,
          recordsPushed,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      }
      
      throw error;
    } finally {
      this._syncInProgress = false;
      this.notifySyncStatusChange();
    }
  }
  
  // Transform Supabase record to WatermelonDB format
  private transformSupabaseRecord(record: any) {
    // Convert dates to timestamps
    const transformed = { ...record };
    
    // Convert created_at to timestamp if it exists and is a string
    if (transformed.created_at && typeof transformed.created_at === 'string') {
      transformed.created_at = new Date(transformed.created_at).getTime();
    }
    
    // Convert updated_at to timestamp if it exists and is a string
    if (transformed.updated_at && typeof transformed.updated_at === 'string') {
      transformed.updated_at = new Date(transformed.updated_at).getTime();
    }
    
    // Convert deleted_at to timestamp if it exists and is a string
    if (transformed.deleted_at && typeof transformed.deleted_at === 'string') {
      transformed.deleted_at = new Date(transformed.deleted_at).getTime();
    }
    
    // Convert target_date to timestamp if it exists and is a string
    if (transformed.target_date && typeof transformed.target_date === 'string') {
      transformed.target_date = new Date(transformed.target_date).getTime();
    }
    
    // Convert any JSON fields from strings to objects if needed
    if (transformed.labels && typeof transformed.labels === 'string') {
      try {
        transformed.labels = JSON.parse(transformed.labels);
      } catch (e) {
        transformed.labels = [];
      }
    }
    
    if (transformed.relationships && typeof transformed.relationships === 'string') {
      try {
        transformed.relationships = JSON.parse(transformed.relationships);
      } catch (e) {
        transformed.relationships = {};
      }
    }
    
    if (transformed.metadata && typeof transformed.metadata === 'string') {
      try {
        transformed.metadata = JSON.parse(transformed.metadata);
      } catch (e) {
        transformed.metadata = {};
      }
    }
    
    // Add _status field required by WatermelonDB
    transformed._status = 'synced';
    
    return transformed;
  }
  
  // Push created records to Supabase
  private async pushCreatedRecords(table: string, records: any[]) {
    if (!records.length) return;
    
    // Transform records for Supabase
    const transformedRecords = records.map(record => {
      const result = { ...record.raw };
      
      // Add client identifiers
      result.last_modified_by = this._clientId;
      
      // Convert timestamps to ISO strings
      if (result.created_at && typeof result.created_at === 'number') {
        result.created_at = new Date(result.created_at).toISOString();
      }
      
      if (result.updated_at && typeof result.updated_at === 'number') {
        result.updated_at = new Date(result.updated_at).toISOString();
      }
      
      if (result.target_date && typeof result.target_date === 'number') {
        result.target_date = new Date(result.target_date).toISOString();
      }
      
      // Convert JSON fields to strings if they're objects
      if (result.labels && typeof result.labels !== 'string') {
        result.labels = JSON.stringify(result.labels);
      }
      
      if (result.relationships && typeof result.relationships !== 'string') {
        result.relationships = JSON.stringify(result.relationships);
      }
      
      if (result.metadata && typeof result.metadata !== 'string') {
        result.metadata = JSON.stringify(result.metadata);
      }
      
      // Remove WatermelonDB specific fields
      delete result._status;
      delete result._changed;
      
      return result;
    });
    
    // Insert into Supabase in batches to avoid payload size limits
    const batchSize = 50;
    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(table)
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error pushing created ${table}:`, error);
        throw error;
      }
    }
  }
  
  // Push updated records to Supabase
  private async pushUpdatedRecords(table: string, records: any[]) {
    if (!records.length) return;
    
    // Handle each record individually to properly handle conflicts
    for (const record of records) {
      const result = { ...record.raw };
      
      // Add client identifiers
      result.last_modified_by = this._clientId;
      
      // Convert timestamps to ISO strings
      if (result.updated_at && typeof result.updated_at === 'number') {
        result.updated_at = new Date(result.updated_at).toISOString();
      }
      
      if (result.target_date && typeof result.target_date === 'number') {
        result.target_date = new Date(result.target_date).toISOString();
      }
      
      // Convert JSON fields to strings if they're objects
      if (result.labels && typeof result.labels !== 'string') {
        result.labels = JSON.stringify(result.labels);
      }
      
      if (result.relationships && typeof result.relationships !== 'string') {
        result.relationships = JSON.stringify(result.relationships);
      }
      
      if (result.metadata && typeof result.metadata !== 'string') {
        result.metadata = JSON.stringify(result.metadata);
      }
      
      // Remove WatermelonDB specific fields
      delete result._status;
      delete result._changed;
      
      // First get the current version from the server
      const { data: current, error: fetchError } = await supabase
        .from(table)
        .select('client_version')
        .eq('id', result.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error(`Error fetching ${table} for update:`, fetchError);
        continue;
      }
      
      // Only update if the server version is less than or equal to our version
      // This is a simple conflict resolution strategy - "last write wins"
      if (!current || (result.client_version || 0) >= (current.client_version || 0)) {
        const { error: updateError } = await supabase
          .from(table)
          .update(result)
          .eq('id', result.id);
        
        if (updateError) {
          console.error(`Error updating ${table}:`, updateError);
          // Continue with other records rather than failing completely
        }
      } else {
        console.log(`Skipping update for ${table} ${result.id} due to conflict resolution`);
      }
    }
  }
  
  // Push deleted records to Supabase (soft delete)
  private async pushDeletedRecords(table: string, recordIds: string[]) {
    if (!recordIds.length) return;
    
    // Handle deletes in batches
    const batchSize = 50;
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(table)
        .update({ 
          deleted_at: new Date().toISOString(),
          last_modified_by: this._clientId
        })
        .in('id', batch);
      
      if (error) {
        console.error(`Error soft-deleting ${table}:`, error);
        // Continue with other batches rather than failing completely
      }
    }
  }
}

// Create and export a singleton instance
export const syncService = new SyncService();
