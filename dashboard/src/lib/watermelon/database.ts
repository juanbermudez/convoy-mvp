/**
 * WatermelonDB Database Configuration
 * 
 * This file sets up the WatermelonDB database for the Convoy data architecture.
 */

// Import the appropriate adapter for browser environments
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { appSchema, tableSchema } from '@nozbe/watermelondb';
import { schema as originalSchema } from './models/schema'; // Import from models/schema, not schemas
import { AllModels } from './models';
import { supabase } from '../supabase/client';
import { EntityType, RelationshipType } from '../knowledge-graph/types';

// Make sure we have a properly formatted schema with an array for tables
// Use custom schema definition if the imported one has issues
const schema = (() => {
  try {
    // Check if the imported schema is valid
    if (originalSchema && 
        typeof originalSchema === 'object' && 
        originalSchema.version && 
        Array.isArray(originalSchema.tables)) {
      console.log('Using imported schema');
      return originalSchema;
    } else {
      // Create a fallback schema
      console.log('Creating fallback schema');
      return appSchema({
        version: 1,
        tables: [
          tableSchema({
            name: 'workspaces',
            columns: [
              { name: 'name', type: 'string', isIndexed: true },
              { name: 'description', type: 'string', isOptional: true },
              { name: 'remote_id', type: 'string', isOptional: true },
              { name: 'created_at', type: 'number' },
              { name: 'updated_at', type: 'number' }
            ]
          }),
          tableSchema({
            name: 'projects',
            columns: [
              { name: 'workspace_id', type: 'string', isIndexed: true },
              { name: 'name', type: 'string', isIndexed: true },
              { name: 'description', type: 'string', isOptional: true },
              { name: 'status', type: 'string', isIndexed: true },
              { name: 'target_date', type: 'number', isOptional: true },
              { name: 'remote_id', type: 'string', isOptional: true },
              { name: 'created_at', type: 'number' },
              { name: 'updated_at', type: 'number' }
            ]
          }),
          tableSchema({
            name: 'workstreams',
            columns: [
              { name: 'project_id', type: 'string', isIndexed: true },
              { name: 'name', type: 'string', isIndexed: true },
              { name: 'description', type: 'string', isOptional: true },
              { name: 'status', type: 'string', isIndexed: true },
              { name: 'progress', type: 'number' },
              { name: 'owner_id', type: 'string', isOptional: true, isIndexed: true },
              { name: 'remote_id', type: 'string', isOptional: true },
              { name: 'created_at', type: 'number' },
              { name: 'updated_at', type: 'number' }
            ]
          }),
          tableSchema({
            name: 'tasks',
            columns: [
              { name: 'project_id', type: 'string', isIndexed: true },
              { name: 'workstream_id', type: 'string', isIndexed: true, isOptional: true },
              { name: 'title', type: 'string', isIndexed: true },
              { name: 'description', type: 'string', isOptional: true },
              { name: 'status', type: 'string', isIndexed: true },
              { name: 'priority', type: 'string', isIndexed: true },
              { name: 'owner_id', type: 'string', isOptional: true, isIndexed: true },
              { name: 'labels', type: 'string' },
              { name: 'relationships_json', type: 'string' },
              { name: 'remote_id', type: 'string', isOptional: true },
              { name: 'created_at', type: 'number' },
              { name: 'updated_at', type: 'number' }
            ]
          }),
          tableSchema({
            name: 'relationships',
            columns: [
              { name: 'source_type', type: 'string', isIndexed: true },
              { name: 'source_id', type: 'string', isIndexed: true },
              { name: 'relationship_type', type: 'string', isIndexed: true },
              { name: 'target_type', type: 'string', isIndexed: true },
              { name: 'target_id', type: 'string', isIndexed: true },
              { name: 'metadata_json', type: 'string' },
              { name: 'remote_id', type: 'string', isOptional: true },
              { name: 'created_at', type: 'number' }
            ]
          })
        ]
      });
    }
  } catch (e) {
    console.error('Error initializing schema:', e);
    // Return a minimal schema to allow the app to continue
    return appSchema({
      version: 1,
      tables: [
        tableSchema({
          name: 'workspaces',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' }
          ]
        })
      ]
    });
  }
})();

/**
 * Create the database adapter
 */
const adapter = new LokiJSAdapter({
  schema,
  // Use in-memory adapter for browser environment
  useInMemory: true,
  // Use localStorage for persistence
  useLocalStorage: true,
  // Don't use web worker in development
  useWebWorker: false,
  // Use the recommended configuration for newer versions of WatermelonDB
  // (this is a performance optimization for IndexedDB)
  useIncrementalIndexedDB: true,
});

/**
 * Create the database instance
 */
export const database = new Database({
  adapter,
  modelClasses: AllModels,
});

/**
 * Initialize the database
 * 
 * @returns Promise that resolves to true if successful
 */
export async function initDatabase(): Promise<boolean> {
  try {
    console.log('Initializing WatermelonDB database...');
    
    // Make sure the schemas are properly registered - protect against errors
    if (schema && schema.tables && Array.isArray(schema.tables)) {
      console.log('Registered schemas:', schema.tables.map(table => table.name));
    } else {
      console.log('Schema structure is not as expected:', JSON.stringify(schema));
    }
    
    // Log the database configuration
    console.log('Database adapter:', adapter.constructor.name);
    
    // Check if Supabase tables exist
    try {
      await checkSupabaseTables();
    } catch (supabaseError) {
      console.error('Error checking Supabase tables, continuing anyway:', supabaseError);
      // Don't let Supabase errors block local database initialization
    }
    
    console.log('WatermelonDB database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize WatermelonDB database:', error);
    return false;
  }
}

/**
 * Check if Supabase tables exist and create them if they don't
 */
async function checkSupabaseTables(): Promise<void> {
  try {
    // Check if tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error checking Supabase tables:', error);
      return;
    }
    
    const existingTables = new Set(tables?.map(t => t.table_name) || []);
    
    // Create tables if they don't exist
    const requiredTables = [
      'workspaces',
      'projects',
      'workstreams',
      'tasks',
      'relationships'
    ];
    
    for (const table of requiredTables) {
      if (!existingTables.has(table)) {
        console.log(`Creating ${table} table in Supabase...`);
        await createSupabaseTable(table);
      }
    }
  } catch (error) {
    console.error('Error checking/creating Supabase tables:', error);
  }
}

/**
 * Create a Supabase table if it doesn't exist
 * 
 * @param tableName Table name
 */
async function createSupabaseTable(tableName: string): Promise<void> {
  let query = '';
  
  switch (tableName) {
    case 'workspaces':
      query = `
        CREATE TABLE IF NOT EXISTS workspaces (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      break;
    
    case 'projects':
      query = `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY,
          workspace_id UUID REFERENCES workspaces(id),
          name TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL,
          target_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
      `;
      break;
    
    case 'workstreams':
      query = `
        CREATE TABLE IF NOT EXISTS workstreams (
          id UUID PRIMARY KEY,
          project_id UUID REFERENCES projects(id),
          name TEXT NOT NULL,
          description TEXT,
          owner_id UUID,
          status TEXT NOT NULL,
          progress FLOAT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_workstreams_project_id ON workstreams(project_id);
      `;
      break;
    
    case 'tasks':
      query = `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY,
          project_id UUID NOT NULL REFERENCES projects(id),
          workstream_id UUID REFERENCES workstreams(id),
          title TEXT NOT NULL,
          description TEXT,
          owner_id UUID,
          status TEXT NOT NULL,
          priority TEXT,
          labels JSONB DEFAULT '[]'::jsonb,
          relationships JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_workstream_id ON tasks(workstream_id);
      `;
      break;
    
    case 'relationships':
      query = `
        CREATE TABLE IF NOT EXISTS relationships (
          id UUID PRIMARY KEY,
          source_type TEXT NOT NULL,
          source_id UUID NOT NULL,
          relationship_type TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_id UUID NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Enforce uniqueness of relationships
          UNIQUE(source_type, source_id, relationship_type, target_type, target_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_type, source_id);
        CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_type, target_id);
        CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);
      `;
      break;
    
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
  
  try {
    // Execute the query
    const { error } = await supabase.rpc('execute_sql', { sql_query: query });
    
    if (error) {
      console.error(`Error creating ${tableName} table:`, error);
      
      // Try direct SQL as fallback
      await supabase.rpc('execute_sql', { sql_query: query });
    }
  } catch (error) {
    console.error(`Error creating ${tableName} table:`, error);
    throw error;
  }
}

/**
 * Get last sync timestamp from localStorage
 * 
 * @returns Timestamp in milliseconds or 0 if never synced
 */
export function getLastSyncTimestamp(): number {
  const timestamp = localStorage.getItem('convoy_last_sync_timestamp');
  return timestamp ? parseInt(timestamp, 10) : 0;
}

/**
 * Set last sync timestamp in localStorage
 * 
 * @param timestamp Timestamp in milliseconds
 */
export function setLastSyncTimestamp(timestamp: number): void {
  localStorage.setItem('convoy_last_sync_timestamp', timestamp.toString());
}

/**
 * Maps of local to remote IDs and vice versa
 */
interface IdMaps {
  workspaces: {
    localToRemote: Map<string, string>;
    remoteToLocal: Map<string, string>;
  };
  projects: {
    localToRemote: Map<string, string>;
    remoteToLocal: Map<string, string>;
  };
  workstreams: {
    localToRemote: Map<string, string>;
    remoteToLocal: Map<string, string>;
  };
  tasks: {
    localToRemote: Map<string, string>;
    remoteToLocal: Map<string, string>;
  };
}

/**
 * Build maps of local to remote IDs and vice versa
 * 
 * @returns Maps of local to remote IDs and vice versa
 */
async function buildIdMaps(): Promise<IdMaps> {
  const workspaces = await database.get('workspaces').query().fetch();
  const projects = await database.get('projects').query().fetch();
  const workstreams = await database.get('workstreams').query().fetch();
  const tasks = await database.get('tasks').query().fetch();
  
  const maps: IdMaps = {
    workspaces: {
      localToRemote: new Map(),
      remoteToLocal: new Map()
    },
    projects: {
      localToRemote: new Map(),
      remoteToLocal: new Map()
    },
    workstreams: {
      localToRemote: new Map(),
      remoteToLocal: new Map()
    },
    tasks: {
      localToRemote: new Map(),
      remoteToLocal: new Map()
    }
  };
  
  // Build workspace maps
  for (const workspace of workspaces) {
    if (workspace.remoteId) {
      maps.workspaces.localToRemote.set(workspace.id, workspace.remoteId);
      maps.workspaces.remoteToLocal.set(workspace.remoteId, workspace.id);
    }
  }
  
  // Build project maps
  for (const project of projects) {
    if (project.remoteId) {
      maps.projects.localToRemote.set(project.id, project.remoteId);
      maps.projects.remoteToLocal.set(project.remoteId, project.id);
    }
  }
  
  // Build workstream maps
  for (const workstream of workstreams) {
    if (workstream.remoteId) {
      maps.workstreams.localToRemote.set(workstream.id, workstream.remoteId);
      maps.workstreams.remoteToLocal.set(workstream.remoteId, workstream.id);
    }
  }
  
  // Build task maps
  for (const task of tasks) {
    if (task.remoteId) {
      maps.tasks.localToRemote.set(task.id, task.remoteId);
      maps.tasks.remoteToLocal.set(task.remoteId, task.id);
    }
  }
  
  return maps;
}

/**
 * Sync the local database with Supabase
 * 
 * @returns Promise that resolves to true if sync was successful
 */
export async function sync(): Promise<boolean> {
  try {
    console.log('Starting database sync...');
    
    // Build ID maps
    const idMaps = await buildIdMaps();
    
    // PHASE 1: Push local changes to Supabase
    await pushLocalChangesToSupabase(idMaps);
    
    // PHASE 2: Pull Supabase changes to local DB
    await pullSupabaseChangesToLocal(idMaps);
    
    // Update sync timestamp
    setLastSyncTimestamp(Date.now());
    
    console.log('Database sync completed successfully');
    return true;
  } catch (error) {
    console.error('Database sync failed:', error);
    return false;
  }
}

/**
 * Push local changes to Supabase
 * 
 * @param idMaps Maps of local to remote IDs and vice versa
 */
async function pushLocalChangesToSupabase(idMaps: IdMaps): Promise<void> {
  console.log('Pushing local changes to Supabase...');
  
  // Push workspaces
  console.log('Syncing workspaces...');
  const workspaces = await database.get('workspaces').query().fetch();
  
  for (const workspace of workspaces) {
    try {
      // Skip if this workspace already has a remote ID
      if (workspace.remoteId) {
        continue;
      }
      
      // Prepare workspace data for Supabase
      const supabaseData = {
        name: workspace.name,
        description: workspace.description || null,
        created_at: workspace.createdAt.toISOString(),
        updated_at: workspace.updatedAt.toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('workspaces')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) {
        console.error('Error pushing workspace to Supabase:', error);
        continue;
      }
      
      // Update the local workspace with the remote ID
      await database.write(async () => {
        await workspace.update(w => {
          w.remoteId = data.id;
        });
      });
      
      // Update ID maps
      idMaps.workspaces.localToRemote.set(workspace.id, data.id);
      idMaps.workspaces.remoteToLocal.set(data.id, workspace.id);
      
      console.log(`Pushed workspace ${workspace.name} to Supabase`);
    } catch (error) {
      console.error(`Error pushing workspace ${workspace.id} to Supabase:`, error);
    }
  }
  
  // Push projects
  console.log('Syncing projects...');
  const projects = await database.get('projects').query().fetch();
  
  for (const project of projects) {
    try {
      // Skip if this project already has a remote ID
      if (project.remoteId) {
        continue;
      }
      
      // Get the workspace remote ID
      const workspaceRemoteId = idMaps.workspaces.localToRemote.get(project.workspaceId);
      if (!workspaceRemoteId) {
        console.warn(`Cannot push project ${project.name}: workspace not synced`);
        continue;
      }
      
      // Prepare project data for Supabase
      const supabaseData = {
        workspace_id: workspaceRemoteId,
        name: project.name,
        description: project.description || null,
        status: project.status,
        target_date: project.targetDate 
          ? new Date(project.targetDate).toISOString()
          : null,
        created_at: project.createdAt.toISOString(),
        updated_at: project.updatedAt.toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) {
        console.error('Error pushing project to Supabase:', error);
        continue;
      }
      
      // Update the local project with the remote ID
      await database.write(async () => {
        await project.update(p => {
          p.remoteId = data.id;
        });
      });
      
      // Update ID maps
      idMaps.projects.localToRemote.set(project.id, data.id);
      idMaps.projects.remoteToLocal.set(data.id, project.id);
      
      console.log(`Pushed project ${project.name} to Supabase`);
    } catch (error) {
      console.error(`Error pushing project ${project.id} to Supabase:`, error);
    }
  }
  
  // Push workstreams
  console.log('Syncing workstreams...');
  const workstreams = await database.get('workstreams').query().fetch();
  
  for (const workstream of workstreams) {
    try {
      // Skip if this workstream already has a remote ID
      if (workstream.remoteId) {
        continue;
      }
      
      // Get the project remote ID
      const projectRemoteId = idMaps.projects.localToRemote.get(workstream.projectId);
      if (!projectRemoteId) {
        console.warn(`Cannot push workstream ${workstream.name}: project not synced`);
        continue;
      }
      
      // Prepare workstream data for Supabase
      const supabaseData = {
        project_id: projectRemoteId,
        name: workstream.name,
        description: workstream.description || null,
        owner_id: workstream.ownerId || null,
        status: workstream.status,
        progress: workstream.progress,
        created_at: workstream.createdAt.toISOString(),
        updated_at: workstream.updatedAt.toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('workstreams')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) {
        console.error('Error pushing workstream to Supabase:', error);
        continue;
      }
      
      // Update the local workstream with the remote ID
      await database.write(async () => {
        await workstream.update(w => {
          w.remoteId = data.id;
        });
      });
      
      // Update ID maps
      idMaps.workstreams.localToRemote.set(workstream.id, data.id);
      idMaps.workstreams.remoteToLocal.set(data.id, workstream.id);
      
      console.log(`Pushed workstream ${workstream.name} to Supabase`);
    } catch (error) {
      console.error(`Error pushing workstream ${workstream.id} to Supabase:`, error);
    }
  }
  
  // Push tasks
  console.log('Syncing tasks...');
  const tasks = await database.get('tasks').query().fetch();
  
  for (const task of tasks) {
    try {
      // Skip if this task already has a remote ID
      if (task.remoteId) {
        continue;
      }
      
      // Get the project remote ID
      const projectRemoteId = idMaps.projects.localToRemote.get(task.projectId);
      if (!projectRemoteId) {
        console.warn(`Cannot push task ${task.title}: project not synced`);
        continue;
      }
      
      // Get the workstream remote ID if it exists
      let workstreamRemoteId = null;
      if (task.workstreamId) {
        workstreamRemoteId = idMaps.workstreams.localToRemote.get(task.workstreamId);
        if (!workstreamRemoteId) {
          console.warn(`Workstream for task ${task.title} not synced, continuing anyway`);
        }
      }
      
      // Prepare task data for Supabase
      const supabaseData = {
        project_id: projectRemoteId,
        workstream_id: workstreamRemoteId,
        title: task.title,
        description: task.description || null,
        owner_id: task.ownerId || null,
        status: task.status,
        priority: task.priority,
        labels: JSON.parse(task.labelsJson || '[]'),
        relationships: JSON.parse(task.relationshipsJson || '{}'),
        created_at: task.createdAt.toISOString(),
        updated_at: task.updatedAt.toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) {
        console.error('Error pushing task to Supabase:', error);
        continue;
      }
      
      // Update the local task with the remote ID
      await database.write(async () => {
        await task.update(t => {
          t.remoteId = data.id;
        });
      });
      
      // Update ID maps
      idMaps.tasks.localToRemote.set(task.id, data.id);
      idMaps.tasks.remoteToLocal.set(data.id, task.id);
      
      console.log(`Pushed task ${task.title} to Supabase`);
    } catch (error) {
      console.error(`Error pushing task ${task.id} to Supabase:`, error);
    }
  }
  
  // Push relationships
  console.log('Syncing relationships...');
  const relationships = await database.get('relationships').query().fetch();
  
  for (const relationship of relationships) {
    try {
      // Skip if this relationship already has a remote ID
      if (relationship.remoteId) {
        continue;
      }
      
      // Get the remote IDs for source and target
      const sourceRemoteId = getRemoteId(
        relationship.sourceType as EntityType,
        relationship.sourceId,
        idMaps
      );
      
      const targetRemoteId = getRemoteId(
        relationship.targetType as EntityType,
        relationship.targetId,
        idMaps
      );
      
      // Skip if we couldn't get remote IDs
      if (!sourceRemoteId || !targetRemoteId) {
        console.warn(`Cannot push relationship: source or target not synced`);
        continue;
      }
      
      // Prepare relationship data for Supabase
      const supabaseData = {
        source_type: relationship.sourceType,
        source_id: sourceRemoteId,
        relationship_type: relationship.relationshipType,
        target_type: relationship.targetType,
        target_id: targetRemoteId,
        metadata: JSON.parse(relationship.metadataJson || '{}'),
        created_at: relationship.createdAt.toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('relationships')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) {
        // If the error is a uniqueness violation, that's fine - the relationship already exists
        if (error.code === '23505') {
          console.log(`Relationship already exists in Supabase, skipping`);
          continue;
        }
        
        console.error('Error pushing relationship to Supabase:', error);
        continue;
      }
      
      // Update the local relationship with the remote ID
      await database.write(async () => {
        await relationship.update(r => {
          r.remoteId = data.id;
        });
      });
      
      console.log(`Pushed relationship to Supabase`);
    } catch (error) {
      console.error(`Error pushing relationship ${relationship.id} to Supabase:`, error);
    }
  }
}

/**
 * Pull Supabase changes to local DB
 * 
 * @param idMaps Maps of local to remote IDs and vice versa
 */
async function pullSupabaseChangesToLocal(idMaps: IdMaps): Promise<void> {
  console.log('Pulling Supabase changes to local DB...');
  
  // Get all entities from Supabase
  const { data: workspaces, error: workspacesError } = await supabase
    .from('workspaces')
    .select('*');
  
  if (workspacesError) {
    console.error('Error fetching workspaces from Supabase:', workspacesError);
    return;
  }
  
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');
  
  if (projectsError) {
    console.error('Error fetching projects from Supabase:', projectsError);
    return;
  }
  
  const { data: workstreams, error: workstreamsError } = await supabase
    .from('workstreams')
    .select('*');
  
  if (workstreamsError) {
    console.error('Error fetching workstreams from Supabase:', workstreamsError);
    return;
  }
  
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*');
  
  if (tasksError) {
    console.error('Error fetching tasks from Supabase:', tasksError);
    return;
  }
  
  const { data: relationships, error: relationshipsError } = await supabase
    .from('relationships')
    .select('*');
  
  if (relationshipsError) {
    console.error('Error fetching relationships from Supabase:', relationshipsError);
    return;
  }
  
  // Create or update workspaces
  console.log('Syncing workspaces from Supabase...');
  for (const remoteWorkspace of workspaces) {
    try {
      // Check if we already have this workspace locally
      const localId = idMaps.workspaces.remoteToLocal.get(remoteWorkspace.id);
      
      if (localId) {
        // Update existing workspace
        const localWorkspace = await database.get('workspaces').find(localId);
        
        // Skip if the local workspace is more recent
        const remoteUpdatedAt = new Date(remoteWorkspace.updated_at).getTime();
        if (localWorkspace.updatedAt.getTime() >= remoteUpdatedAt) {
          continue;
        }
        
        // Update the local workspace
        await database.write(async () => {
          await localWorkspace.update(w => {
            w.name = remoteWorkspace.name;
            w.description = remoteWorkspace.description || undefined;
            // Don't update createdAt, as the local one may be more accurate
          });
        });
        
        console.log(`Updated local workspace ${localWorkspace.name} from Supabase`);
      } else {
        // Create new local workspace
        await database.write(async () => {
          const workspace = await database.get('workspaces').create(w => {
            w.name = remoteWorkspace.name;
            w.description = remoteWorkspace.description || undefined;
            w.remoteId = remoteWorkspace.id;
            w.createdAt = new Date(remoteWorkspace.created_at);
            w.updatedAt = new Date(remoteWorkspace.updated_at);
          });
          
          // Update ID maps
          idMaps.workspaces.localToRemote.set(workspace.id, remoteWorkspace.id);
          idMaps.workspaces.remoteToLocal.set(remoteWorkspace.id, workspace.id);
        });
        
        console.log(`Created local workspace ${remoteWorkspace.name} from Supabase`);
      }
    } catch (error) {
      console.error(`Error syncing workspace ${remoteWorkspace.id} from Supabase:`, error);
    }
  }
  
  // Create or update projects
  console.log('Syncing projects from Supabase...');
  for (const remoteProject of projects) {
    try {
      // Check if the workspace exists locally
      const localWorkspaceId = idMaps.workspaces.remoteToLocal.get(remoteProject.workspace_id);
      
      if (!localWorkspaceId) {
        console.warn(`Cannot sync project ${remoteProject.name}: workspace not found locally`);
        continue;
      }
      
      // Check if we already have this project locally
      const localId = idMaps.projects.remoteToLocal.get(remoteProject.id);
      
      if (localId) {
        // Update existing project
        const localProject = await database.get('projects').find(localId);
        
        // Skip if the local project is more recent
        const remoteUpdatedAt = new Date(remoteProject.updated_at).getTime();
        if (localProject.updatedAt.getTime() >= remoteUpdatedAt) {
          continue;
        }
        
        // Update the local project
        await database.write(async () => {
          await localProject.update(p => {
            p.workspaceId = localWorkspaceId;
            p.name = remoteProject.name;
            p.description = remoteProject.description || undefined;
            p.status = remoteProject.status;
            p.targetDate = remoteProject.target_date
              ? new Date(remoteProject.target_date).getTime()
              : undefined;
            // Don't update createdAt, as the local one may be more accurate
          });
        });
        
        console.log(`Updated local project ${localProject.name} from Supabase`);
      } else {
        // Create new local project
        await database.write(async () => {
          const project = await database.get('projects').create(p => {
            p.workspaceId = localWorkspaceId;
            p.name = remoteProject.name;
            p.description = remoteProject.description || undefined;
            p.status = remoteProject.status;
            p.targetDate = remoteProject.target_date
              ? new Date(remoteProject.target_date).getTime()
              : undefined;
            p.remoteId = remoteProject.id;
            p.createdAt = new Date(remoteProject.created_at);
            p.updatedAt = new Date(remoteProject.updated_at);
          });
          
          // Update ID maps
          idMaps.projects.localToRemote.set(project.id, remoteProject.id);
          idMaps.projects.remoteToLocal.set(remoteProject.id, project.id);
        });
        
        console.log(`Created local project ${remoteProject.name} from Supabase`);
      }
    } catch (error) {
      console.error(`Error syncing project ${remoteProject.id} from Supabase:`, error);
    }
  }
  
  // Create or update workstreams
  console.log('Syncing workstreams from Supabase...');
  for (const remoteWorkstream of workstreams) {
    try {
      // Check if the project exists locally
      const localProjectId = idMaps.projects.remoteToLocal.get(remoteWorkstream.project_id);
      
      if (!localProjectId) {
        console.warn(`Cannot sync workstream ${remoteWorkstream.name}: project not found locally`);
        continue;
      }
      
      // Check if we already have this workstream locally
      const localId = idMaps.workstreams.remoteToLocal.get(remoteWorkstream.id);
      
      if (localId) {
        // Update existing workstream
        const localWorkstream = await database.get('workstreams').find(localId);
        
        // Skip if the local workstream is more recent
        const remoteUpdatedAt = new Date(remoteWorkstream.updated_at).getTime();
        if (localWorkstream.updatedAt.getTime() >= remoteUpdatedAt) {
          continue;
        }
        
        // Update the local workstream
        await database.write(async () => {
          await localWorkstream.update(w => {
            w.projectId = localProjectId;
            w.name = remoteWorkstream.name;
            w.description = remoteWorkstream.description || undefined;
            w.status = remoteWorkstream.status;
            w.progress = remoteWorkstream.progress;
            w.ownerId = remoteWorkstream.owner_id || undefined;
            // Don't update createdAt, as the local one may be more accurate
          });
        });
        
        console.log(`Updated local workstream ${localWorkstream.name} from Supabase`);
      } else {
        // Create new local workstream
        await database.write(async () => {
          const workstream = await database.get('workstreams').create(w => {
            w.projectId = localProjectId;
            w.name = remoteWorkstream.name;
            w.description = remoteWorkstream.description || undefined;
            w.status = remoteWorkstream.status;
            w.progress = remoteWorkstream.progress;
            w.ownerId = remoteWorkstream.owner_id || undefined;
            w.remoteId = remoteWorkstream.id;
            w.createdAt = new Date(remoteWorkstream.created_at);
            w.updatedAt = new Date(remoteWorkstream.updated_at);
          });
          
          // Update ID maps
          idMaps.workstreams.localToRemote.set(workstream.id, remoteWorkstream.id);
          idMaps.workstreams.remoteToLocal.set(remoteWorkstream.id, workstream.id);
        });
        
        console.log(`Created local workstream ${remoteWorkstream.name} from Supabase`);
      }
    } catch (error) {
      console.error(`Error syncing workstream ${remoteWorkstream.id} from Supabase:`, error);
    }
  }
  
  // Create or update tasks
  console.log('Syncing tasks from Supabase...');
  for (const remoteTask of tasks) {
    try {
      // Check if the project exists locally
      const localProjectId = idMaps.projects.remoteToLocal.get(remoteTask.project_id);
      
      if (!localProjectId) {
        console.warn(`Cannot sync task ${remoteTask.title}: project not found locally`);
        continue;
      }
      
      // Check if the workstream exists locally (if specified)
      let localWorkstreamId = undefined;
      if (remoteTask.workstream_id) {
        localWorkstreamId = idMaps.workstreams.remoteToLocal.get(remoteTask.workstream_id);
        
        if (!localWorkstreamId) {
          console.warn(`Workstream for task ${remoteTask.title} not found locally, continuing anyway`);
        }
      }
      
      // Check if we already have this task locally
      const localId = idMaps.tasks.remoteToLocal.get(remoteTask.id);
      
      if (localId) {
        // Update existing task
        const localTask = await database.get('tasks').find(localId);
        
        // Skip if the local task is more recent
        const remoteUpdatedAt = new Date(remoteTask.updated_at).getTime();
        if (localTask.updatedAt.getTime() >= remoteUpdatedAt) {
          continue;
        }
        
        // Update the local task
        await database.write(async () => {
          await localTask.update(t => {
            t.projectId = localProjectId;
            t.workstreamId = localWorkstreamId;
            t.title = remoteTask.title;
            t.description = remoteTask.description || undefined;
            t.status = remoteTask.status;
            t.priority = remoteTask.priority;
            t.ownerId = remoteTask.owner_id || undefined;
            t.labelsJson = JSON.stringify(remoteTask.labels || []);
            t.relationshipsJson = JSON.stringify(remoteTask.relationships || {});
            // Don't update createdAt, as the local one may be more accurate
          });
        });
        
        console.log(`Updated local task ${localTask.title} from Supabase`);
      } else {
        // Create new local task
        await database.write(async () => {
          const task = await database.get('tasks').create(t => {
            t.projectId = localProjectId;
            t.workstreamId = localWorkstreamId;
            t.title = remoteTask.title;
            t.description = remoteTask.description || undefined;
            t.status = remoteTask.status;
            t.priority = remoteTask.priority;
            t.ownerId = remoteTask.owner_id || undefined;
            t.labelsJson = JSON.stringify(remoteTask.labels || []);
            t.relationshipsJson = JSON.stringify(remoteTask.relationships || {});
            t.remoteId = remoteTask.id;
            t.createdAt = new Date(remoteTask.created_at);
            t.updatedAt = new Date(remoteTask.updated_at);
          });
          
          // Update ID maps
          idMaps.tasks.localToRemote.set(task.id, remoteTask.id);
          idMaps.tasks.remoteToLocal.set(remoteTask.id, task.id);
        });
        
        console.log(`Created local task ${remoteTask.title} from Supabase`);
      }
    } catch (error) {
      console.error(`Error syncing task ${remoteTask.id} from Supabase:`, error);
    }
  }
  
  // Create relationships
  console.log('Syncing relationships from Supabase...');
  
  // Create entity type to ID map lookup
  const entityMaps = {
    workspace: idMaps.workspaces.remoteToLocal,
    project: idMaps.projects.remoteToLocal,
    workstream: idMaps.workstreams.remoteToLocal,
    task: idMaps.tasks.remoteToLocal
  };
  
  // Get existing relationships
  const existingRelationships = await database.get('relationships').query().fetch();
  const existingRelationshipKeys = new Set();
  
  for (const rel of existingRelationships) {
    const key = `${rel.sourceType}-${rel.sourceId}-${rel.relationshipType}-${rel.targetType}-${rel.targetId}`;
    existingRelationshipKeys.add(key);
  }
  
  // Process remote relationships
  for (const remoteRelationship of relationships) {
    try {
      // Map remote IDs to local IDs
      const localSourceId = getLocalId(
        remoteRelationship.source_type as EntityType,
        remoteRelationship.source_id,
        entityMaps
      );
      
      const localTargetId = getLocalId(
        remoteRelationship.target_type as EntityType,
        remoteRelationship.target_id,
        entityMaps
      );
      
      // Skip if we couldn't map IDs
      if (!localSourceId || !localTargetId) {
        console.warn(
          `Cannot sync relationship: source or target not found locally ` +
          `(${remoteRelationship.source_type}/${remoteRelationship.source_id} -> ` +
          `${remoteRelationship.target_type}/${remoteRelationship.target_id})`
        );
        continue;
      }
      
      // Check if this relationship already exists locally
      const relationshipKey = `${remoteRelationship.source_type}-${localSourceId}-${remoteRelationship.relationship_type}-${remoteRelationship.target_type}-${localTargetId}`;
      
      if (existingRelationshipKeys.has(relationshipKey)) {
        // Skip - we already have this relationship
        continue;
      }
      
      // Create the relationship locally
      await database.write(async () => {
        await database.get('relationships').create(r => {
          r.sourceType = remoteRelationship.source_type;
          r.sourceId = localSourceId;
          r.relationshipType = remoteRelationship.relationship_type;
          r.targetType = remoteRelationship.target_type;
          r.targetId = localTargetId;
          r.metadataJson = JSON.stringify(remoteRelationship.metadata || {});
          r.remoteId = remoteRelationship.id;
          r.createdAt = new Date(remoteRelationship.created_at);
        });
      });
      
      console.log(`Created local relationship from Supabase`);
    } catch (error) {
      console.error(`Error syncing relationship ${remoteRelationship.id} from Supabase:`, error);
    }
  }
}

/**
 * Helper to get the remote ID for an entity
 * 
 * @param entityType Entity type
 * @param localId Local entity ID
 * @param idMaps Maps of local to remote IDs and vice versa
 * @returns Remote entity ID or null if not found
 */
function getRemoteId(
  entityType: EntityType,
  localId: string,
  idMaps: IdMaps
): string | null {
  switch (entityType) {
    case EntityType.WORKSPACE:
      return idMaps.workspaces.localToRemote.get(localId) || null;
    case EntityType.PROJECT:
      return idMaps.projects.localToRemote.get(localId) || null;
    case EntityType.WORKSTREAM:
      return idMaps.workstreams.localToRemote.get(localId) || null;
    case EntityType.TASK:
      return idMaps.tasks.localToRemote.get(localId) || null;
    default:
      return null;
  }
}

/**
 * Helper to get the local ID for an entity
 * 
 * @param entityType Entity type
 * @param remoteId Remote entity ID
 * @param entityMaps Maps of remote to local IDs by entity type
 * @returns Local entity ID or null if not found
 */
function getLocalId(
  entityType: EntityType,
  remoteId: string,
  entityMaps: Record<string, Map<string, string>>
): string | null {
  const map = entityMaps[entityType];
  return map ? map.get(remoteId) || null : null;
}

export default database;
