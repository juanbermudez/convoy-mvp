'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Database, RefreshCw, Server } from 'lucide-react';
// Import from mock implementation instead
import database from '@/lib/watermelon-mock/database';
import { sync, getLastSyncTimestamp } from '@/lib/watermelon-mock/database';
import WorkspaceModel from '@/lib/watermelon-mock/models/workspace';
import ProjectModel from '@/lib/watermelon-mock/models/project';
import { initDatabase } from '@/lib/watermelon-mock/database';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export default function WatermelonDbTest() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState('Not initialized');
  const [workspaces, setWorkspaces] = useState<WorkspaceModel[]>([]);
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [supabaseWorkspaces, setSupabaseWorkspaces] = useState<any[]>([]);
  const [supabaseProjects, setSupabaseProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Initialize database when component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await initDatabase();
        setIsInitialized(true);
        setStatus('Database initialized successfully');
        
        // Update last sync time
        const timestamp = getLastSyncTimestamp();
        if (timestamp) {
          setLastSyncTime(new Date(timestamp).toLocaleString());
        }
        
        // Load data
        await loadWorkspaces();
        await loadProjects();
        
        // Load Supabase data if online
        if (navigator.onLine) {
          await fetchSupabaseData();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setStatus(`Error initializing database: ${error}`);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Enhanced Supabase data fetching with better error handling and logging
  const fetchSupabaseData = async () => {
    if (!navigator.onLine) {
      setStatus('Cannot fetch Supabase data while offline');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching data from Supabase...');
      
      // Test Supabase connection first
      const { data: connectionTest, error: connectionError } = await supabase.from('workspaces').select('count');
      
      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        setStatus(`Supabase connection error: ${connectionError.message}`);
        setLoading(false);
        return;
      }
      
      console.log('Supabase connection successful');
      
      // Fetch workspaces with detailed error logging
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (workspacesError) {
        console.error('Error fetching workspaces:', workspacesError);
        setStatus(`Error fetching workspaces: ${workspacesError.message}`);
        setLoading(false);
        return;
      }
      
      console.log(`Successfully fetched ${workspaces?.length || 0} workspaces from Supabase`);
      setSupabaseWorkspaces(workspaces || []);
      
      // Fetch projects with detailed error logging
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setStatus(`Error fetching projects: ${projectsError.message}`);
        setLoading(false);
        return;
      }
      
      console.log(`Successfully fetched ${projects?.length || 0} projects from Supabase`);
      setSupabaseProjects(projects || []);
      
      setStatus(`Supabase data fetched successfully: ${workspaces?.length || 0} workspaces, ${projects?.length || 0} projects`);
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error fetching Supabase data:', error);
      setStatus(`Unexpected error fetching Supabase data: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Load all workspaces from WatermelonDB
  const loadWorkspaces = async () => {
    try {
      const workspaceCollection = database.get<WorkspaceModel>('workspaces');
      const allWorkspaces = await workspaceCollection.query().fetch();
      setWorkspaces(allWorkspaces);
      setStatus(`Loaded ${allWorkspaces.length} workspaces from local database`);
      return allWorkspaces;
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setStatus(`Error loading workspaces: ${error}`);
      return [];
    }
  };

  // Load all projects from WatermelonDB
  const loadProjects = async () => {
    try {
      const projectCollection = database.get<ProjectModel>('projects');
      const allProjects = await projectCollection.query().fetch();
      setProjects(allProjects);
      setStatus(`Loaded ${allProjects.length} projects from local database`);
      return allProjects;
    } catch (error) {
      console.error('Failed to load projects:', error);
      setStatus(`Error loading projects: ${error}`);
      return [];
    }
  };

  // Enhanced workspace creation with better UUID generation and logging
  const createWorkspace = async () => {
    if (!newWorkspaceName) {
      setStatus('Workspace name is required');
      return;
    }

    try {
      setLoading(true);
      
      // Generate a consistent UUID for both local and remote storage
      const remoteId = uuidv4();
      console.log(`Creating workspace with remote ID: ${remoteId}`);
      
      await database.write(async () => {
        const workspaceCollection = database.get<WorkspaceModel>('workspaces');
        await workspaceCollection.create((workspace) => {
          workspace.name = newWorkspaceName;
          workspace.description = newWorkspaceDescription;
          workspace.createdAt = new Date().getTime();
          workspace.updatedAt = new Date().getTime();
          workspace.remoteId = remoteId;
        });
      });

      setStatus(`Workspace "${newWorkspaceName}" created successfully with ID ${remoteId}`);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      await loadWorkspaces();
      setLoading(false);
      
      // If online, try to push changes immediately
      if (navigator.onLine) {
        setStatus('Auto-syncing new workspace...');
        await triggerSync();
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setStatus(`Error creating workspace: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Enhanced project creation with better UUID handling and auto-sync
  const createProject = async () => {
    if (!newProjectName || !selectedWorkspaceId) {
      setStatus('Project name and workspace selection are required');
      return;
    }

    try {
      setLoading(true);
      
      // Find the workspace to get its remote ID
      const workspace = workspaces.find(w => w.id === selectedWorkspaceId);
      if (!workspace) {
        setStatus('Selected workspace not found');
        setLoading(false);
        return;
      }
      
      // Generate a consistent UUID for both local and remote storage
      const remoteId = uuidv4();
      console.log(`Creating project with remote ID: ${remoteId}, linked to workspace: ${workspace.name} (${workspace.remoteId})`);
      
      await database.write(async () => {
        const projectCollection = database.get<ProjectModel>('projects');
        await projectCollection.create((project) => {
          project.workspaceId = selectedWorkspaceId;
          project.name = newProjectName;
          project.description = newProjectDescription;
          project.overview = '';
          project.techStack = JSON.stringify(['React', 'TypeScript', 'WatermelonDB']);
          project.status = 'active';
          project.createdAt = new Date().getTime();
          project.updatedAt = new Date().getTime();
          project.remoteId = remoteId;
        });
      });

      setStatus(`Project "${newProjectName}" created successfully with ID ${remoteId}`);
      setNewProjectName('');
      setNewProjectDescription('');
      await loadProjects();
      setLoading(false);
      
      // If online, try to push changes immediately
      if (navigator.onLine) {
        setStatus('Auto-syncing new project...');
        await triggerSync();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setStatus(`Error creating project: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Delete a workspace
  const deleteWorkspace = async (workspace: WorkspaceModel) => {
    try {
      setLoading(true);
      await database.write(async () => {
        await workspace.markAsDeleted();
      });
      setStatus(`Workspace "${workspace.name}" deleted successfully`);
      await loadWorkspaces();
      setLoading(false);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      setStatus(`Error deleting workspace: ${error}`);
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (project: ProjectModel) => {
    try {
      setLoading(true);
      await database.write(async () => {
        await project.markAsDeleted();
      });
      setStatus(`Project "${project.name}" deleted successfully`);
      await loadProjects();
      setLoading(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setStatus(`Error deleting project: ${error}`);
      setLoading(false);
    }
  };

  // Enhanced sync with detailed logging and better error handling
  const triggerSync = async () => {
    if (!navigator.onLine) {
      setStatus('Cannot sync while offline');
      return;
    }

    try {
      setLoading(true);
      setStatus('Starting sync process...');
      
      console.log('Triggering sync process...');
      
      // Test Supabase connection first
      try {
        // First let's log the available methods on Supabase to help with debugging
        console.log('Supabase object:', typeof supabase);
        console.log('Available top-level methods:', Object.keys(supabase).join(', '));
        
        if (typeof supabase.from !== 'function') {
          console.error('Supabase client missing .from() method');
          setStatus('Sync failed: Supabase client API mismatch - missing .from() method');
          setLoading(false);
          return;
        }
        
        const workspacesQuery = supabase.from('workspaces');
        console.log('Workspaces query methods:', Object.keys(workspacesQuery).join(', '));
        
        // Simple connection test - just get a few records to verify connection works
        const { data: connectionTest, error: connectionError } = await supabase
          .from('workspaces')
          .select('*')
          .limit(1);
        
        if (connectionError) {
          console.error('Supabase connection error before sync:', connectionError);
          setStatus(`Sync failed: Cannot connect to Supabase - ${connectionError.message}`);
          setLoading(false);
          return;
        }
        
        console.log('Supabase connection verified, proceeding with sync');
        console.log('Sample data:', connectionTest);
      } catch (connectionTestError) {
        console.error('Error testing Supabase connection:', connectionTestError);
        setStatus(`Sync failed: Cannot establish Supabase connection - ${connectionTestError instanceof Error ? connectionTestError.message : String(connectionTestError)}`);
        setLoading(false);
        return;
      }
      
      // Perform the actual sync with better error trapping
      setStatus('Pushing local changes to remote...');
      try {
        const success = await sync();
        
        if (success) {
          console.log('Sync completed successfully');
          setStatus('Sync completed successfully');
          setLastSyncTime(new Date().toLocaleString());
          
          // Reload all data after successful sync
          console.log('Refreshing local and remote data after sync');
          await loadWorkspaces();
          await loadProjects();
          await fetchSupabaseData();
        } else {
          console.error('Sync returned false - check console for details');
          setStatus('Sync failed - see browser console for details');
        }
      } catch (syncError) {
        console.error('Exception during sync operation:', syncError);
        // More detailed error reporting
        if (syncError instanceof Error) {
          setStatus(`Sync error: ${syncError.name} - ${syncError.message}`);
        } else {
          setStatus(`Sync failed with unexpected error: ${String(syncError)}`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Exception during sync process:', error);
      setStatus(`Error during sync: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    try {
      setLoading(true);
      setStatus('Refreshing data...');
      
      await loadWorkspaces();
      await loadProjects();
      
      if (navigator.onLine) {
        await fetchSupabaseData();
      }
      
      const timestamp = getLastSyncTimestamp();
      if (timestamp) {
        setLastSyncTime(new Date(timestamp).toLocaleString());
      }
      
      setStatus('Data refreshed successfully');
      setLoading(false);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setStatus(`Error refreshing data: ${error}`);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>WatermelonDB Sync Test</CardTitle>
              <CardDescription>Test saving and retrieving data with WatermelonDB and Supabase</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
              <Badge variant={isInitialized ? "default" : "outline"}>
                {isInitialized ? "DB Initialized" : "Not Initialized"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Status:</span> <span>{status}</span>
            </div>
            {lastSyncTime && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">Last Sync:</span> <span>{lastSyncTime}</span>
              </div>
            )}
          </div>
          <div className="space-x-4">
            <Button
              onClick={refreshData}
              disabled={!isInitialized || loading}
              variant="outline"
              className="mr-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
            <Button 
              onClick={triggerSync} 
              disabled={!isInitialized || !isOnline || loading}
            >
              <Server className="mr-2 h-4 w-4" /> Trigger Sync
            </Button>
          </div>
          
          {loading && (
            <div className="mt-4">
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Loading...</AlertTitle>
                <AlertDescription>
                  Please wait while the operation completes.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="local">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="local">
            <Database className="mr-2 h-4 w-4" /> Local Database
          </TabsTrigger>
          <TabsTrigger value="remote" disabled={!isOnline}>
            <Server className="mr-2 h-4 w-4" /> Remote Database
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="local">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Enter workspace name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newWorkspaceDescription}
                      onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                      placeholder="Enter workspace description"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={createWorkspace} 
                    disabled={!isInitialized || !newWorkspaceName || loading}
                    className="w-full"
                  >
                    Create Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace">Workspace</Label>
                    <select
                      id="workspace"
                      className="w-full p-2 border rounded-md"
                      value={selectedWorkspaceId || ''}
                      onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                      disabled={loading || workspaces.length === 0}
                    >
                      <option value="">Select a workspace</option>
                      {workspaces.map((workspace) => (
                        <option key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Name</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      disabled={loading || !selectedWorkspaceId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Description</Label>
                    <Input
                      id="projectDescription"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                      disabled={loading || !selectedWorkspaceId}
                    />
                  </div>
                  <Button 
                    onClick={createProject} 
                    disabled={!isInitialized || !newProjectName || !selectedWorkspaceId || loading}
                    className="w-full"
                  >
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Local Workspaces</CardTitle>
                <CardDescription>Total: {workspaces.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {workspaces.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">No workspaces found</div>
                ) : (
                  <div className="space-y-4">
                    {workspaces.map((workspace) => (
                      <div key={workspace.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{workspace.name}</h3>
                            <p className="text-sm text-muted-foreground">{workspace.description}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>Local ID: {workspace.id}</p>
                              <p>Remote ID: {workspace.remoteId}</p>
                              <p>
                                Created: {new Date(workspace.createdAt).toLocaleString()}
                              </p>
                              <p>
                                Updated: {new Date(workspace.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteWorkspace(workspace)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Local Projects</CardTitle>
                <CardDescription>Total: {projects.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">No projects found</div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const workspace = workspaces.find(w => w.id === project.workspaceId);
                      return (
                        <div key={project.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{project.name}</h3>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              {workspace && (
                                <div className="text-xs mt-1">
                                  <Badge variant="outline">{workspace.name}</Badge>
                                </div>
                              )}
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>Local ID: {project.id}</p>
                                <p>Remote ID: {project.remoteId}</p>
                                <p>
                                  Created: {new Date(project.createdAt).toLocaleString()}
                                </p>
                                <p>
                                  Updated: {new Date(project.updatedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProject(project)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="remote">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Remote Workspaces</CardTitle>
                <CardDescription>Total: {supabaseWorkspaces.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {supabaseWorkspaces.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No remote workspaces found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supabaseWorkspaces.map((workspace) => (
                      <div key={workspace.id} className="p-4 border rounded-md">
                        <div>
                          <h3 className="font-medium">{workspace.name}</h3>
                          <p className="text-sm text-muted-foreground">{workspace.description}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>ID: {workspace.id}</p>
                            <p>
                              Created: {new Date(workspace.created_at).toLocaleString()}
                            </p>
                            <p>
                              Updated: {new Date(workspace.updated_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Remote Projects</CardTitle>
                <CardDescription>Total: {supabaseProjects.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {supabaseProjects.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No remote projects found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supabaseProjects.map((project) => {
                      const workspace = supabaseWorkspaces.find(w => w.id === project.workspace_id);
                      return (
                        <div key={project.id} className="p-4 border rounded-md">
                          <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                            {workspace && (
                              <div className="text-xs mt-1">
                                <Badge variant="outline">{workspace.name}</Badge>
                              </div>
                            )}
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>ID: {project.id}</p>
                              <p>
                                Created: {new Date(project.created_at).toLocaleString()}
                              </p>
                              <p>
                                Updated: {new Date(project.updated_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 space-y-4">
        <Alert variant="info" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Setup Required</AlertTitle>
          <AlertDescription>
            Before using this test page, you need to create the required tables in Supabase.
            Go to your Supabase dashboard SQL Editor and run the following SQL:
            <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto">
              {`-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
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

-- Enable row level security (optional, but recommended)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (for testing purposes)
CREATE POLICY "Allow all operations on workspaces" ON workspaces FOR ALL USING (true);
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);`}
            </pre>
          </AlertDescription>
        </Alert>
        <Alert variant={isInitialized ? "default" : "destructive"}>
          {isInitialized ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {isInitialized ? "Database Status: Ready" : "Database Status: Not Initialized"}
          </AlertTitle>
          <AlertDescription>
            {isInitialized
              ? "The WatermelonDB database is initialized and ready for testing."
              : "There was an issue initializing the WatermelonDB database."}
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Debug information and instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Sync Process</h4>
              <p className="text-sm text-muted-foreground">
                1. Create workspaces and projects locally<br />
                2. Click "Trigger Sync" to push to Supabase<br />
                3. Switch to "Remote Database" tab to verify<br />
                4. Check browser console (F12) for detailed logs
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Connection Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant={isOnline ? "success" : "destructive"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                <Badge variant={isInitialized ? "success" : "destructive"}>
                  {isInitialized ? "DB Initialized" : "DB Error"}
                </Badge>
                <Badge variant="outline">
                  Local Workspaces: {workspaces.length}
                </Badge>
                <Badge variant="outline">
                  Local Projects: {projects.length}
                </Badge>
                <Badge variant="outline">
                  Remote Workspaces: {supabaseWorkspaces.length}
                </Badge>
                <Badge variant="outline">
                  Remote Projects: {supabaseProjects.length}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Current Status</h4>
              <Alert variant="outline">
                <p className="text-sm break-words">{status}</p>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
