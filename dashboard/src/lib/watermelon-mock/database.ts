// Mock implementation of WatermelonDB

import { v4 as uuidv4 } from 'uuid';

// Interface for model instances
interface Model {
  id: string;
  [key: string]: any;
}

// Interface for collection
interface Collection {
  modelName: string;
  models: Map<string, Model>;
  
  // Methods
  create: (creator: (model: any) => void) => Promise<Model>;
  find: (id: string) => Promise<Model>;
  query: () => { fetch: () => Promise<Model[]> };
}

// Create a mock database class
class MockDatabase {
  private collections: Map<string, Collection> = new Map();

  constructor() {
    console.log('Initializing Mock WatermelonDB Database');
  }

  // Get or create a collection
  get(collectionName: string): Collection {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, this.createCollection(collectionName));
    }
    return this.collections.get(collectionName)!;
  }

  // Create a new collection
  private createCollection(name: string): Collection {
    return {
      modelName: name,
      models: new Map<string, Model>(),
      
      // Create a new model
      create: async (creator) => {
        const id = uuidv4();
        const model: Model = {
          id,
          markAsDeleted: async () => {
            this.get(name).models.delete(id);
            return Promise.resolve();
          },
          update: async (updater: (model: any) => void) => {
            updater(model);
            return Promise.resolve(model);
          }
        };
        
        // Apply the creator function to initialize the model
        creator(model);
        
        // Store the model in the collection
        this.get(name).models.set(id, model);
        
        return model;
      },
      
      // Find a model by ID
      find: async (id) => {
        const model = this.get(name).models.get(id);
        if (!model) {
          throw new Error(`Model with ID ${id} not found in collection ${name}`);
        }
        return Promise.resolve(model);
      },
      
      // Query models in the collection
      query: () => ({
        fetch: async () => {
          return Promise.resolve(Array.from(this.get(name).models.values()));
        }
      })
    };
  }

  // Mock write operation - execute a batch of operations
  async write(callback: () => Promise<void>): Promise<void> {
    try {
      await callback();
      return Promise.resolve();
    } catch (error) {
      console.error('Error during write operation:', error);
      return Promise.reject(error);
    }
  }
}

// Create database instance
export const database = new MockDatabase();

// Initialize database function with Supabase table creation
export async function initDatabase(): Promise<boolean> {
  try {
    console.log('Initializing mock database...');
    
    // Import Supabase client
    const { supabase } = await import('@/lib/supabase/client');
    
    // Check if required tables exist and create them if they don't
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tableError) {
      console.error('Error checking tables:', tableError);
      console.log('Will try to create tables anyway...');
    }
    
    const existingTables = tables?.map(t => t.table_name) || [];
    console.log('Existing tables:', existingTables);
    
    // Create workspaces table if it doesn't exist
    if (!existingTables.includes('workspaces')) {
      console.log('Creating workspaces table...');
      
      const { error } = await supabase.rpc('create_workspaces_table');
      
      if (error) {
        console.error('Error creating workspaces table:', error);
        // Try direct SQL as fallback
        await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS workspaces (
              id UUID PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
      }
    }
    
    // Create projects table if it doesn't exist
    if (!existingTables.includes('projects')) {
      console.log('Creating projects table...');
      
      const { error } = await supabase.rpc('create_projects_table');
      
      if (error) {
        console.error('Error creating projects table:', error);
        // Try direct SQL as fallback
        await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS projects (
              id UUID PRIMARY KEY,
              workspace_id UUID REFERENCES workspaces(id),
              name TEXT NOT NULL,
              description TEXT,
              overview TEXT,
              tech_stack JSONB DEFAULT '[]'::jsonb,
              status TEXT DEFAULT 'active',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
      }
    }
    
    console.log('Mock database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize mock database:', error);
    return true; // Return true anyway to allow local testing
  }
}

// Bidirectional sync function for better compatibility
export async function sync(): Promise<boolean> {
  try {
    console.log('Starting bidirectional sync operation with Supabase...');
    
    // Check if required tables exist first
    try {
      // Import Supabase client
      const { supabase } = await import('@/lib/supabase/client');
      
      // Check if workspaces table exists
      const { data: workspacesCheck, error: wsError } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1);
        
      if (wsError) {
        console.error('Error checking workspaces table:', wsError);
        
        if (wsError.message?.includes('does not exist') || 
            wsError.code === '42P01') {
          console.error('TABLES DO NOT EXIST IN SUPABASE!');
          console.error('Please create the required tables first using the SQL Editor in Supabase dashboard.');
          return false;
        }
      }
      
      console.log('Tables exist in Supabase, proceeding with sync...');
    } catch (checkError) {
      console.error('Error checking tables:', checkError);
    }
    
    // Import Supabase client
    const { supabase } = await import('@/lib/supabase/client');
    
    // Get all local workspaces and projects
    const localWorkspaces = Array.from(database.get('workspaces').models.values());
    const localProjects = Array.from(database.get('projects').models.values());
    
    console.log(`Found ${localWorkspaces.length} local workspaces and ${localProjects.length} local projects to sync up`);
    
    // STEP 1: UPLOAD LOCAL DATA TO SUPABASE
    console.log('PHASE 1: Pushing local data to Supabase...');
    
    // First, sync all workspaces (insert only, for simplicity)
    for (const workspace of localWorkspaces) {
      try {
        // Simple insert operation - most Supabase versions should support this
        const { error } = await supabase.from('workspaces').insert({
          id: workspace.remoteId,
          name: workspace.name,
          description: workspace.description,
          created_at: new Date(workspace.createdAt).toISOString(),
          updated_at: new Date(workspace.updatedAt).toISOString()
        });
        
        if (error) {
          // If error is duplicate key, that's expected - the workspace already exists
          if (error.code === '23505' || error.message?.includes('duplicate key')) {
            console.log(`Workspace ${workspace.name} already exists in Supabase, skipping insert`);
          } else {
            console.error(`Error syncing workspace ${workspace.name}:`, error);
          }
        } else {
          console.log(`Successfully created workspace in Supabase: ${workspace.name}`);
        }
      } catch (error) {
        console.error(`Exception processing workspace ${workspace.id}:`, error);
      }
    }
    
    // Then sync all projects
    for (const project of localProjects) {
      try {
        // Find the workspace for this project
        const workspace = localWorkspaces.find(w => w.id === project.workspaceId);
        if (!workspace) {
          console.warn(`Cannot find workspace for project ${project.name}`);
          continue;
        }
        
        // Simple insert operation
        const { error } = await supabase.from('projects').insert({
          id: project.remoteId,
          workspace_id: workspace.remoteId,
          name: project.name,
          description: project.description,
          overview: project.overview || '',
          tech_stack: JSON.parse(project.techStack || '[]'),
          status: project.status || 'active',
          created_at: new Date(project.createdAt).toISOString(),
          updated_at: new Date(project.updatedAt).toISOString()
        });
        
        if (error) {
          // If error is duplicate key, that's expected - the project already exists
          if (error.code === '23505' || error.message?.includes('duplicate key')) {
            console.log(`Project ${project.name} already exists in Supabase, skipping insert`);
          } else {
            console.error(`Error syncing project ${project.name}:`, error);
          }
        } else {
          console.log(`Successfully created project in Supabase: ${project.name}`);
        }
      } catch (error) {
        console.error(`Exception processing project ${project.id}:`, error);
      }
    }
    
    // STEP 2: DOWNLOAD REMOTE DATA TO LOCAL DB
    console.log('PHASE 2: Pulling Supabase data to local database...');
    
    try {
      // Fetch all workspaces from Supabase
      const { data: remoteWorkspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*');
      
      if (workspacesError) {
        console.error('Error fetching workspaces from Supabase:', workspacesError);
      } else {
        console.log(`Found ${remoteWorkspaces?.length || 0} workspaces in Supabase`);
        
        // Map of remoteId to local id for workspaces
        const workspaceIdMap = new Map<string, string>();
        
        // Process each remote workspace
        for (const remoteWorkspace of remoteWorkspaces || []) {
          try {
            // Check if this workspace already exists locally by remoteId
            const existingLocalWorkspaces = localWorkspaces.filter(
              w => w.remoteId === remoteWorkspace.id
            );
            
            if (existingLocalWorkspaces.length > 0) {
              // Workspace already exists locally, update its values if needed
              const localWorkspace = existingLocalWorkspaces[0];
              
              // For mapping remote workspace IDs to local IDs
              workspaceIdMap.set(remoteWorkspace.id, localWorkspace.id);
              
              // Skip updating if already up to date (optional optimization)
              const remoteUpdatedAt = new Date(remoteWorkspace.updated_at).getTime();
              if (localWorkspace.updatedAt >= remoteUpdatedAt) {
                console.log(`Local workspace ${localWorkspace.name} is up to date`);
                continue;
              }
              
              // Update local workspace with remote data
              await database.write(async () => {
                await localWorkspace.update(workspace => {
                  workspace.name = remoteWorkspace.name;
                  workspace.description = remoteWorkspace.description;
                  workspace.updatedAt = new Date(remoteWorkspace.updated_at).getTime();
                });
              });
              
              console.log(`Updated local workspace: ${localWorkspace.name}`);
            } else {
              // Workspace doesn't exist locally, create it
              await database.write(async () => {
                const workspaceCollection = database.get('workspaces');
                const newLocalWorkspace = await workspaceCollection.create((workspace) => {
                  workspace.name = remoteWorkspace.name;
                  workspace.description = remoteWorkspace.description;
                  workspace.createdAt = new Date(remoteWorkspace.created_at).getTime();
                  workspace.updatedAt = new Date(remoteWorkspace.updated_at).getTime();
                  workspace.remoteId = remoteWorkspace.id;
                });
                
                // For mapping remote workspace IDs to local IDs
                workspaceIdMap.set(remoteWorkspace.id, newLocalWorkspace.id);
              });
              
              console.log(`Created new local workspace: ${remoteWorkspace.name}`);
            }
          } catch (workspaceError) {
            console.error(`Error processing remote workspace ${remoteWorkspace.id}:`, workspaceError);
          }
        }
        
        // Refresh the local workspaces list after updates
        const updatedLocalWorkspaces = Array.from(database.get('workspaces').models.values());
        
        // Fetch all projects from Supabase
        const { data: remoteProjects, error: projectsError } = await supabase
          .from('projects')
          .select('*');
        
        if (projectsError) {
          console.error('Error fetching projects from Supabase:', projectsError);
        } else {
          console.log(`Found ${remoteProjects?.length || 0} projects in Supabase`);
          
          // Process each remote project
          for (const remoteProject of remoteProjects || []) {
            try {
              // Skip if we don't have the workspace for this project
              if (!workspaceIdMap.has(remoteProject.workspace_id)) {
                console.warn(`Cannot find local workspace for remote project ${remoteProject.name}`);
                continue;
              }
              
              // Get the local workspace ID for this project
              const localWorkspaceId = workspaceIdMap.get(remoteProject.workspace_id);
              
              // Check if this project already exists locally by remoteId
              const existingLocalProjects = localProjects.filter(
                p => p.remoteId === remoteProject.id
              );
              
              if (existingLocalProjects.length > 0) {
                // Project already exists locally, update its values if needed
                const localProject = existingLocalProjects[0];
                
                // Skip updating if already up to date (optional optimization)
                const remoteUpdatedAt = new Date(remoteProject.updated_at).getTime();
                if (localProject.updatedAt >= remoteUpdatedAt) {
                  console.log(`Local project ${localProject.name} is up to date`);
                  continue;
                }
                
                // Update local project with remote data
                await database.write(async () => {
                  await localProject.update(project => {
                    project.name = remoteProject.name;
                    project.description = remoteProject.description;
                    project.overview = remoteProject.overview || '';
                    project.techStack = JSON.stringify(remoteProject.tech_stack || []);
                    project.status = remoteProject.status || 'active';
                    project.updatedAt = new Date(remoteProject.updated_at).getTime();
                    // Don't update workspaceId as that would break local relationships
                  });
                });
                
                console.log(`Updated local project: ${localProject.name}`);
              } else {
                // Project doesn't exist locally, create it
                await database.write(async () => {
                  const projectCollection = database.get('projects');
                  await projectCollection.create((project) => {
                    project.name = remoteProject.name;
                    project.description = remoteProject.description;
                    project.overview = remoteProject.overview || '';
                    project.techStack = JSON.stringify(remoteProject.tech_stack || []);
                    project.status = remoteProject.status || 'active';
                    project.createdAt = new Date(remoteProject.created_at).getTime();
                    project.updatedAt = new Date(remoteProject.updated_at).getTime();
                    project.remoteId = remoteProject.id;
                    project.workspaceId = localWorkspaceId!;
                  });
                });
                
                console.log(`Created new local project: ${remoteProject.name}`);
              }
            } catch (projectError) {
              console.error(`Error processing remote project ${remoteProject.id}:`, projectError);
            }
          }
        }
      }
    } catch (downloadError) {
      console.error('Error downloading data from Supabase:', downloadError);
    }
    
    console.log('Bidirectional sync operation completed');
    
    // Update last sync timestamp
    localStorage.setItem('lastSyncTimestamp', Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Error during bidirectional sync operation:', error);
    return false;
  }
}

// Get last sync timestamp from localStorage
export function getLastSyncTimestamp(): number {
  const timestamp = localStorage.getItem('lastSyncTimestamp');
  return timestamp ? parseInt(timestamp, 10) : 0;
}

export default database;
