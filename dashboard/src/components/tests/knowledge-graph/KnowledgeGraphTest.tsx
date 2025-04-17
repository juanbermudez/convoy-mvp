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
import { AlertCircle, CheckCircle2, Database, RefreshCw, Server, Network } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Import database
import database, { initDatabase, sync, getLastSyncTimestamp } from '@/lib/watermelon/database';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Import models
import Workspace from '@/lib/watermelon/models/workspace';
import Project from '@/lib/watermelon/models/project';
import Workstream from '@/lib/watermelon/models/workstream';
import Task from '@/lib/watermelon/models/task';
import Relationship from '@/lib/watermelon/models/relationship';

// Import knowledge graph types and functions
import { EntityType, RelationshipType } from '@/lib/knowledge-graph/types';
import { Q } from '@nozbe/watermelondb';

export default function KnowledgeGraphTest() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState('Not initialized');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  
  const [newWorkstreamName, setNewWorkstreamName] = useState('');
  const [newWorkstreamDescription, setNewWorkstreamDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedTaskWorkstreamId, setSelectedTaskWorkstreamId] = useState<string | null>(null);
  const [selectedTaskProjectId, setSelectedTaskProjectId] = useState<string | null>(null);
  
  const [selectedSourceTaskId, setSelectedSourceTaskId] = useState<string | null>(null);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<string | null>(null);
  const [selectedTargetTaskId, setSelectedTargetTaskId] = useState<string | null>(null);
  
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [supabaseWorkspaces, setSupabaseWorkspaces] = useState<any[]>([]);
  const [supabaseProjects, setSupabaseProjects] = useState<any[]>([]);
  const [supabaseWorkstreams, setSupabaseWorkstreams] = useState<any[]>([]);
  const [supabaseTasks, setSupabaseTasks] = useState<any[]>([]);
  const [supabaseRelationships, setSupabaseRelationships] = useState<any[]>([]);
  
  const [taskContext, setTaskContext] = useState<any | null>(null);
  const [selectedContextTaskId, setSelectedContextTaskId] = useState<string | null>(null);
  
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
        const initialized = await initDatabase();
        setIsInitialized(initialized);
        setStatus(initialized ? 'Database initialized successfully' : 'Database initialization failed');
        
        // Update last sync time
        const timestamp = getLastSyncTimestamp();
        if (timestamp) {
          setLastSyncTime(new Date(timestamp).toLocaleString());
        }
        
        // Load data
        if (initialized) {
          await loadLocalData();
          
          // Load Supabase data if online
          if (navigator.onLine) {
            await fetchSupabaseData();
          }
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

  // Fetch Supabase data
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
      
      // Fetch workspaces
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
      
      setSupabaseWorkspaces(workspaces || []);
      
      // Fetch projects
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
      
      setSupabaseProjects(projects || []);
      
      // Fetch workstreams
      const { data: workstreams, error: workstreamsError } = await supabase
        .from('workstreams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (workstreamsError) {
        console.error('Error fetching workstreams:', workstreamsError);
        setStatus(`Error fetching workstreams: ${workstreamsError.message}`);
        setLoading(false);
        return;
      }
      
      setSupabaseWorkstreams(workstreams || []);
      
      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        setStatus(`Error fetching tasks: ${tasksError.message}`);
        setLoading(false);
        return;
      }
      
      setSupabaseTasks(tasks || []);
      
      // Fetch relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('relationships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (relationshipsError) {
        console.error('Error fetching relationships:', relationshipsError);
        setStatus(`Error fetching relationships: ${relationshipsError.message}`);
        setLoading(false);
        return;
      }
      
      setSupabaseRelationships(relationships || []);
      
      setStatus(`Supabase data fetched successfully`);
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error fetching Supabase data:', error);
      setStatus(`Unexpected error fetching Supabase data: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Load all data from WatermelonDB
  const loadLocalData = async () => {
    try {
      await loadWorkspaces();
      await loadProjects();
      await loadWorkstreams();
      await loadTasks();
      await loadRelationships();
      
      setStatus(`Loaded data from local database`);
      return true;
    } catch (error) {
      console.error('Failed to load local data:', error);
      setStatus(`Error loading local data: ${error}`);
      return false;
    }
  };

  // Load workspaces
  const loadWorkspaces = async () => {
    try {
      const workspaceCollection = database.get<Workspace>('workspaces');
      const allWorkspaces = await workspaceCollection.query().fetch();
      setWorkspaces(allWorkspaces);
      return allWorkspaces;
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      throw error;
    }
  };

  // Load projects
  const loadProjects = async () => {
    try {
      const projectCollection = database.get<Project>('projects');
      const allProjects = await projectCollection.query().fetch();
      setProjects(allProjects);
      return allProjects;
    } catch (error) {
      console.error('Failed to load projects:', error);
      throw error;
    }
  };

  // Load workstreams
  const loadWorkstreams = async () => {
    try {
      const workstreamCollection = database.get<Workstream>('workstreams');
      const allWorkstreams = await workstreamCollection.query().fetch();
      setWorkstreams(allWorkstreams);
      return allWorkstreams;
    } catch (error) {
      console.error('Failed to load workstreams:', error);
      throw error;
    }
  };

  // Load tasks
  const loadTasks = async () => {
    try {
      const taskCollection = database.get<Task>('tasks');
      const allTasks = await taskCollection.query().fetch();
      setTasks(allTasks);
      return allTasks;
    } catch (error) {
      console.error('Failed to load tasks:', error);
      throw error;
    }
  };

  // Load relationships
  const loadRelationships = async () => {
    try {
      const relationshipCollection = database.get<Relationship>('relationships');
      const allRelationships = await relationshipCollection.query().fetch();
      setRelationships(allRelationships);
      return allRelationships;
    } catch (error) {
      console.error('Failed to load relationships:', error);
      throw error;
    }
  };

  // Create workspace
  const createWorkspace = async () => {
    if (!newWorkspaceName) {
      setStatus('Workspace name is required');
      return;
    }

    try {
      setLoading(true);
      
      await database.write(async () => {
        const workspaceCollection = database.get<Workspace>('workspaces');
        await workspaceCollection.create((workspace) => {
          workspace.name = newWorkspaceName;
          workspace.description = newWorkspaceDescription;
        });
      });

      setStatus(`Workspace "${newWorkspaceName}" created successfully`);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      await loadWorkspaces();
      setLoading(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setStatus(`Error creating workspace: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Create project
  const createProject = async () => {
    if (!newProjectName || !selectedWorkspaceId) {
      setStatus('Project name and workspace selection are required');
      return;
    }

    try {
      setLoading(true);
      
      await database.write(async () => {
        const projectCollection = database.get<Project>('projects');
        await projectCollection.create((project) => {
          project.workspaceId = selectedWorkspaceId;
          project.name = newProjectName;
          project.description = newProjectDescription;
          project.status = 'active';
        });
      });

      setStatus(`Project "${newProjectName}" created successfully`);
      setNewProjectName('');
      setNewProjectDescription('');
      await loadProjects();
      setLoading(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      setStatus(`Error creating project: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Create workstream
  const createWorkstream = async () => {
    if (!newWorkstreamName || !selectedProjectId) {
      setStatus('Workstream name and project selection are required');
      return;
    }

    try {
      setLoading(true);
      
      await database.write(async () => {
        const workstreamCollection = database.get<Workstream>('workstreams');
        await workstreamCollection.create((workstream) => {
          workstream.projectId = selectedProjectId;
          workstream.name = newWorkstreamName;
          workstream.description = newWorkstreamDescription;
          workstream.status = 'active';
          workstream.progress = 0;
        });
      });

      setStatus(`Workstream "${newWorkstreamName}" created successfully`);
      setNewWorkstreamName('');
      setNewWorkstreamDescription('');
      await loadWorkstreams();
      setLoading(false);
    } catch (error) {
      console.error('Failed to create workstream:', error);
      setStatus(`Error creating workstream: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Create task
  const createTask = async () => {
    if (!newTaskTitle || !selectedTaskProjectId) {
      setStatus('Task title and project selection are required');
      return;
    }

    try {
      setLoading(true);
      
      await database.write(async () => {
        const taskCollection = database.get<Task>('tasks');
        await taskCollection.create((task) => {
          task.projectId = selectedTaskProjectId;
          task.workstreamId = selectedTaskWorkstreamId || undefined;
          task.title = newTaskTitle;
          task.description = newTaskDescription;
          task.status = 'to_do';
          task.priority = 'medium';
          task.labelsJson = JSON.stringify([]);
          task.relationshipsJson = JSON.stringify({});
        });
      });

      setStatus(`Task "${newTaskTitle}" created successfully`);
      setNewTaskTitle('');
      setNewTaskDescription('');
      await loadTasks();
      setLoading(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setStatus(`Error creating task: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Create relationship between tasks
  const createTaskRelationship = async () => {
    if (!selectedSourceTaskId || !selectedRelationshipType || !selectedTargetTaskId) {
      setStatus('Source task, relationship type, and target task are required');
      return;
    }

    try {
      setLoading(true);
      
      await database.write(async () => {
        const relationshipCollection = database.get<Relationship>('relationships');
        
        // Create the relationship
        await relationshipCollection.create((relationship) => {
          relationship.sourceType = EntityType.TASK;
          relationship.sourceId = selectedSourceTaskId;
          relationship.relationshipType = selectedRelationshipType;
          relationship.targetType = EntityType.TASK;
          relationship.targetId = selectedTargetTaskId;
          relationship.metadataJson = JSON.stringify({});
        });
        
        // If the relationship is bidirectional, create the inverse relationship
        if (selectedRelationshipType === RelationshipType.TASK_BLOCKS) {
          await relationshipCollection.create((relationship) => {
            relationship.sourceType = EntityType.TASK;
            relationship.sourceId = selectedTargetTaskId;
            relationship.relationshipType = RelationshipType.TASK_BLOCKED_BY;
            relationship.targetType = EntityType.TASK;
            relationship.targetId = selectedSourceTaskId;
            relationship.metadataJson = JSON.stringify({});
          });
        } else if (selectedRelationshipType === RelationshipType.TASK_BLOCKED_BY) {
          await relationshipCollection.create((relationship) => {
            relationship.sourceType = EntityType.TASK;
            relationship.sourceId = selectedTargetTaskId;
            relationship.relationshipType = RelationshipType.TASK_BLOCKS;
            relationship.targetType = EntityType.TASK;
            relationship.targetId = selectedSourceTaskId;
            relationship.metadataJson = JSON.stringify({});
          });
        } else if (selectedRelationshipType === RelationshipType.TASK_RELATED_TO) {
          // For TASK_RELATED_TO, create the inverse only if it doesn't create a duplicate
          if (selectedSourceTaskId !== selectedTargetTaskId) {
            await relationshipCollection.create((relationship) => {
              relationship.sourceType = EntityType.TASK;
              relationship.sourceId = selectedTargetTaskId;
              relationship.relationshipType = RelationshipType.TASK_RELATED_TO;
              relationship.targetType = EntityType.TASK;
              relationship.targetId = selectedSourceTaskId;
              relationship.metadataJson = JSON.stringify({});
            });
          }
        }
      });

      setStatus(`Relationship created successfully`);
      setSelectedSourceTaskId(null);
      setSelectedRelationshipType(null);
      setSelectedTargetTaskId(null);
      await loadRelationships();
      setLoading(false);
    } catch (error) {
      console.error('Failed to create relationship:', error);
      setStatus(`Error creating relationship: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Get task context (for knowledge graph demo)
  const getTaskContext = async () => {
    if (!selectedContextTaskId) {
      setStatus('Task selection is required');
      return;
    }

    try {
      setLoading(true);
      setStatus('Retrieving task context...');
      
      // Get the task
      const task = await database.get<Task>('tasks').find(selectedContextTaskId);
      
      // Get the project
      const project = await database.get<Project>('projects').find(task.projectId);
      
      // Get the workspace
      const workspace = await database.get<Workspace>('workspaces').find(project.workspaceId);
      
      // Get the workstream (if any)
      let workstream = null;
      if (task.workstreamId) {
        workstream = await database.get<Workstream>('workstreams').find(task.workstreamId);
      }
      
      // Get related tasks
      const relationshipsCollection = database.get<Relationship>('relationships');
      
      // Get tasks that this task blocks
      const blockingRelationships = await relationshipsCollection.query(
        Q.where('source_type', EntityType.TASK),
        Q.where('source_id', task.id),
        Q.where('relationship_type', RelationshipType.TASK_BLOCKS),
        Q.where('target_type', EntityType.TASK)
      ).fetch();
      
      const blockingTaskIds = blockingRelationships.map(rel => rel.targetId);
      const blockingTasks = await Promise.all(
        blockingTaskIds.map(id => database.get<Task>('tasks').find(id))
      );
      
      // Get tasks that block this task
      const blockedByRelationships = await relationshipsCollection.query(
        Q.where('source_type', EntityType.TASK),
        Q.where('source_id', task.id),
        Q.where('relationship_type', RelationshipType.TASK_BLOCKED_BY),
        Q.where('target_type', EntityType.TASK)
      ).fetch();
      
      const blockedByTaskIds = blockedByRelationships.map(rel => rel.targetId);
      const blockedByTasks = await Promise.all(
        blockedByTaskIds.map(id => database.get<Task>('tasks').find(id))
      );
      
      // Get related tasks
      const relatedRelationships = await relationshipsCollection.query(
        Q.where('source_type', EntityType.TASK),
        Q.where('source_id', task.id),
        Q.where('relationship_type', RelationshipType.TASK_RELATED_TO),
        Q.where('target_type', EntityType.TASK)
      ).fetch();
      
      const relatedTaskIds = relatedRelationships.map(rel => rel.targetId);
      const relatedTasks = await Promise.all(
        relatedTaskIds.map(id => database.get<Task>('tasks').find(id))
      );
      
      // Assemble the context
      const context = {
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority
        },
        project: {
          id: project.id,
          name: project.name,
          description: project.description
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description
        },
        workstream: workstream ? {
          id: workstream.id,
          name: workstream.name,
          description: workstream.description
        } : null,
        relationships: {
          blockingTasks: blockingTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status
          })),
          blockedByTasks: blockedByTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status
          })),
          relatedTasks: relatedTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status
          }))
        }
      };
      
      setTaskContext(context);
      setStatus('Task context retrieved successfully');
      setLoading(false);
    } catch (error) {
      console.error('Failed to get task context:', error);
      setStatus(`Error getting task context: ${error instanceof Error ? error.message : String(error)}`);
      setTaskContext(null);
      setLoading(false);
    }
  };

  // Delete a relationship
  const deleteRelationship = async (relationship: Relationship) => {
    try {
      setLoading(true);
      
      await database.write(async () => {
        await relationship.markAsDeleted();
      });
      
      setStatus(`Relationship deleted successfully`);
      await loadRelationships();
      setLoading(false);
    } catch (error) {
      console.error('Failed to delete relationship:', error);
      setStatus(`Error deleting relationship: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Delete an entity
  const deleteEntity = async (entity: any, type: string) => {
    try {
      setLoading(true);
      
      await database.write(async () => {
        await entity.markAsDeleted();
      });
      
      setStatus(`${type} deleted successfully`);
      
      // Reload the appropriate collection
      switch (type) {
        case 'Workspace':
          await loadWorkspaces();
          break;
        case 'Project':
          await loadProjects();
          break;
        case 'Workstream':
          await loadWorkstreams();
          break;
        case 'Task':
          await loadTasks();
          break;
        case 'Relationship':
          await loadRelationships();
          break;
      }
      
      setLoading(false);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      setStatus(`Error deleting ${type}: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  // Sync with Supabase
  const triggerSync = async () => {
    if (!navigator.onLine) {
      setStatus('Cannot sync while offline');
      return;
    }

    try {
      setLoading(true);
      setStatus('Starting sync process...');
      
      const success = await sync();
      
      if (success) {
        setStatus('Sync completed successfully');
        setLastSyncTime(new Date().toLocaleString());
        
        // Reload all data
        await loadLocalData();
        await fetchSupabaseData();
      } else {
        setStatus('Sync failed - see browser console for details');
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
      
      await loadLocalData();
      
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
      setStatus(`Error refreshing data: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Knowledge Graph Test</CardTitle>
              <CardDescription>Test the knowledge graph implementation with WatermelonDB</CardDescription>
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

      <Tabs defaultValue="entities">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="entities">
            <Database className="mr-2 h-4 w-4" /> Entities
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <Network className="mr-2 h-4 w-4" /> Relationships
          </TabsTrigger>
          <TabsTrigger value="context">
            <Server className="mr-2 h-4 w-4" /> Context Explorer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="entities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceName">Name</Label>
                    <Input
                      id="workspaceName"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Enter workspace name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspaceDescription">Description</Label>
                    <Input
                      id="workspaceDescription"
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
                <CardTitle>Create Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectWorkspace">Workspace</Label>
                    <Select
                      value={selectedWorkspaceId || ''}
                      onValueChange={setSelectedWorkspaceId}
                      disabled={loading || workspaces.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Workstream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workstreamProject">Project</Label>
                    <Select
                      value={selectedProjectId || ''}
                      onValueChange={setSelectedProjectId}
                      disabled={loading || projects.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workstreamName">Name</Label>
                    <Input
                      id="workstreamName"
                      value={newWorkstreamName}
                      onChange={(e) => setNewWorkstreamName(e.target.value)}
                      placeholder="Enter workstream name"
                      disabled={loading || !selectedProjectId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workstreamDescription">Description</Label>
                    <Input
                      id="workstreamDescription"
                      value={newWorkstreamDescription}
                      onChange={(e) => setNewWorkstreamDescription(e.target.value)}
                      placeholder="Enter workstream description"
                      disabled={loading || !selectedProjectId}
                    />
                  </div>
                  <Button 
                    onClick={createWorkstream} 
                    disabled={!isInitialized || !newWorkstreamName || !selectedProjectId || loading}
                    className="w-full"
                  >
                    Create Workstream
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskProject">Project</Label>
                    <Select
                      value={selectedTaskProjectId || ''}
                      onValueChange={setSelectedTaskProjectId}
                      disabled={loading || projects.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskWorkstream">Workstream (optional)</Label>
                    <Select
                      value={selectedTaskWorkstreamId || ''}
                      onValueChange={setSelectedTaskWorkstreamId}
                      disabled={loading || !selectedTaskProjectId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a workstream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {workstreams
                          .filter((w) => w.projectId === selectedTaskProjectId)
                          .map((workstream) => (
                            <SelectItem key={workstream.id} value={workstream.id}>
                              {workstream.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle">Title</Label>
                    <Input
                      id="taskTitle"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                      disabled={loading || !selectedTaskProjectId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDescription">Description</Label>
                    <Textarea
                      id="taskDescription"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Enter task description"
                      disabled={loading || !selectedTaskProjectId}
                    />
                  </div>
                  <Button 
                    onClick={createTask} 
                    disabled={!isInitialized || !newTaskTitle || !selectedTaskProjectId || loading}
                    className="w-full"
                  >
                    Create Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Workspaces</CardTitle>
                <CardDescription>Total: {workspaces.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {workspaces.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No workspaces found</div>
                  ) : (
                    workspaces.map((workspace) => (
                      <div key={workspace.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{workspace.name}</h3>
                            <p className="text-sm text-muted-foreground">{workspace.description}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>ID: {workspace.id}</p>
                              <p>Remote ID: {workspace.remoteId || 'Not synced'}</p>
                              <p>
                                Created: {workspace.createdAt?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEntity(workspace, 'Workspace')}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Total: {projects.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No projects found</div>
                  ) : (
                    projects.map((project) => {
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
                                <p>ID: {project.id}</p>
                                <p>Remote ID: {project.remoteId || 'Not synced'}</p>
                                <p>
                                  Created: {project.createdAt?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteEntity(project, 'Project')}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Workstreams</CardTitle>
                <CardDescription>Total: {workstreams.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {workstreams.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No workstreams found</div>
                  ) : (
                    workstreams.map((workstream) => {
                      const project = projects.find(p => p.id === workstream.projectId);
                      return (
                        <div key={workstream.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{workstream.name}</h3>
                              <p className="text-sm text-muted-foreground">{workstream.description}</p>
                              {project && (
                                <div className="text-xs mt-1">
                                  <Badge variant="outline">{project.name}</Badge>
                                </div>
                              )}
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>ID: {workstream.id}</p>
                                <p>Remote ID: {workstream.remoteId || 'Not synced'}</p>
                                <p>
                                  Created: {workstream.createdAt?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteEntity(workstream, 'Workstream')}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Total: {tasks.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No tasks found</div>
                  ) : (
                    tasks.map((task) => {
                      const project = projects.find(p => p.id === task.projectId);
                      const workstream = workstreams.find(w => w.id === task.workstreamId);
                      return (
                        <div key={task.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              <div className="flex space-x-2 text-xs mt-1">
                                {project && (
                                  <Badge variant="outline">{project.name}</Badge>
                                )}
                                {workstream && (
                                  <Badge variant="secondary">{workstream.name}</Badge>
                                )}
                                <Badge variant="default">{task.status}</Badge>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>ID: {task.id}</p>
                                <p>Remote ID: {task.remoteId || 'Not synced'}</p>
                                <p>
                                  Created: {task.createdAt?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteEntity(task, 'Task')}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="relationships">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Task Relationship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceTask">Source Task</Label>
                    <Select
                      value={selectedSourceTaskId || ''}
                      onValueChange={setSelectedSourceTaskId}
                      disabled={loading || tasks.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationshipType">Relationship Type</Label>
                    <Select
                      value={selectedRelationshipType || ''}
                      onValueChange={setSelectedRelationshipType}
                      disabled={loading || !selectedSourceTaskId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={RelationshipType.TASK_BLOCKS}>
                          Blocks
                        </SelectItem>
                        <SelectItem value={RelationshipType.TASK_BLOCKED_BY}>
                          Blocked By
                        </SelectItem>
                        <SelectItem value={RelationshipType.TASK_RELATED_TO}>
                          Related To
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetTask">Target Task</Label>
                    <Select
                      value={selectedTargetTaskId || ''}
                      onValueChange={setSelectedTargetTaskId}
                      disabled={loading || !selectedSourceTaskId || !selectedRelationshipType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks
                          .filter((t) => 
                            // Don't allow self-relationships for TASK_BLOCKS and TASK_BLOCKED_BY
                            t.id !== selectedSourceTaskId || 
                            selectedRelationshipType === RelationshipType.TASK_RELATED_TO
                          )
                          .map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={createTaskRelationship} 
                    disabled={!isInitialized || !selectedSourceTaskId || !selectedRelationshipType || !selectedTargetTaskId || loading}
                    className="w-full"
                  >
                    Create Relationship
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Relationships</CardTitle>
                <CardDescription>Total: {relationships.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {relationships.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No relationships found</div>
                  ) : (
                    relationships.map((relationship) => {
                      // Get source and target entity names
                      let sourceName = `${relationship.sourceType} (${relationship.sourceId})`;
                      let targetName = `${relationship.targetType} (${relationship.targetId})`;
                      
                      if (relationship.sourceType === EntityType.TASK) {
                        const task = tasks.find(t => t.id === relationship.sourceId);
                        if (task) {
                          sourceName = task.title;
                        }
                      }
                      
                      if (relationship.targetType === EntityType.TASK) {
                        const task = tasks.find(t => t.id === relationship.targetId);
                        if (task) {
                          targetName = task.title;
                        }
                      }
                      
                      return (
                        <div key={relationship.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{sourceName}</Badge>
                                <span className="text-sm">→</span>
                                <Badge variant="secondary">{relationship.relationshipType.replace(/_/g, ' ')}</Badge>
                                <span className="text-sm">→</span>
                                <Badge variant="outline">{targetName}</Badge>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>ID: {relationship.id}</p>
                                <p>Remote ID: {relationship.remoteId || 'Not synced'}</p>
                                <p>
                                  Created: {relationship.createdAt?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteRelationship(relationship)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="context">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Knowledge Graph Context Explorer</CardTitle>
                <CardDescription>Explore the context of a task</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contextTask">Select Task</Label>
                    <Select
                      value={selectedContextTaskId || ''}
                      onValueChange={setSelectedContextTaskId}
                      disabled={loading || tasks.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={getTaskContext} 
                    disabled={!isInitialized || !selectedContextTaskId || loading}
                    className="w-full"
                  >
                    Retrieve Context
                  </Button>
                </div>
                
                {taskContext && (
                  <div className="mt-6 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Task Context</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Task</h4>
                        <p className="text-sm">{taskContext.task.title}</p>
                        <p className="text-xs text-muted-foreground">{taskContext.task.description}</p>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant="outline">{taskContext.task.status}</Badge>
                          <Badge variant="outline">{taskContext.task.priority}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Project</h4>
                        <p className="text-sm">{taskContext.project.name}</p>
                        <p className="text-xs text-muted-foreground">{taskContext.project.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Workspace</h4>
                        <p className="text-sm">{taskContext.workspace.name}</p>
                        <p className="text-xs text-muted-foreground">{taskContext.workspace.description}</p>
                      </div>
                      
                      {taskContext.workstream && (
                        <div>
                          <h4 className="font-medium">Workstream</h4>
                          <p className="text-sm">{taskContext.workstream.name}</p>
                          <p className="text-xs text-muted-foreground">{taskContext.workstream.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium">Relationships</h4>
                        
                        {taskContext.relationships.blockingTasks.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium">Blocking</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {taskContext.relationships.blockingTasks.map((task: any) => (
                                <Badge key={task.id} variant="default">
                                  {task.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {taskContext.relationships.blockedByTasks.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium">Blocked By</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {taskContext.relationships.blockedByTasks.map((task: any) => (
                                <Badge key={task.id} variant="destructive">
                                  {task.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {taskContext.relationships.relatedTasks.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium">Related</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {taskContext.relationships.relatedTasks.map((task: any) => (
                                <Badge key={task.id} variant="secondary">
                                  {task.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {taskContext.relationships.blockingTasks.length === 0 &&
                         taskContext.relationships.blockedByTasks.length === 0 &&
                         taskContext.relationships.relatedTasks.length === 0 && (
                          <p className="text-sm text-muted-foreground">No relationships found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Context Demo</CardTitle>
                <CardDescription>Example of how an AI agent would use this context</CardDescription>
              </CardHeader>
              <CardContent>
                {taskContext ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTitle>Context Ready for AI</AlertTitle>
                      <AlertDescription>
                        This is the formatted context that would be provided to an AI agent.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="p-4 bg-slate-100 rounded-md">
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(taskContext, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h3 className="text-sm font-medium mb-2">Example AI Instructions</h3>
                      <div className="text-xs text-muted-foreground">
                        <p>
                          <span className="font-semibold">Task:</span> {taskContext.task.title}<br />
                          <span className="font-semibold">Project:</span> {taskContext.project.name}<br />
                          <span className="font-semibold">Workspace:</span> {taskContext.workspace.name}<br />
                          {taskContext.workstream && (
                            <><span className="font-semibold">Workstream:</span> {taskContext.workstream.name}<br /></>
                          )}
                        </p>
                        <p className="mt-2">
                          You are assisting with a task in the {taskContext.workspace.name} workspace, 
                          specifically for the {taskContext.project.name} project
                          {taskContext.workstream ? ` and ${taskContext.workstream.name} workstream` : ''}.
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">Task Details:</span><br />
                          {taskContext.task.description}
                        </p>
                        {(taskContext.relationships.blockingTasks.length > 0 || 
                          taskContext.relationships.blockedByTasks.length > 0) && (
                          <p className="mt-2">
                            <span className="font-semibold">Dependencies:</span><br />
                            {taskContext.relationships.blockingTasks.length > 0 && (
                              <>This task blocks: {taskContext.relationships.blockingTasks.map((t: any) => t.title).join(', ')}<br /></>
                            )}
                            {taskContext.relationships.blockedByTasks.length > 0 && (
                              <>This task is blocked by: {taskContext.relationships.blockedByTasks.map((t: any) => t.title).join(', ')}<br /></>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>Select a task and retrieve its context to see the AI demo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 space-y-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Knowledge Graph Test</AlertTitle>
          <AlertDescription>
            This test demonstrates the integration of WatermelonDB with the knowledge graph implementation.
            You can create entities, establish relationships between them, and explore the context
            that would be provided to AI agents.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Debug information and instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">How to Use This Test</h4>
              <p className="text-sm text-muted-foreground">
                1. Create workspaces, projects, workstreams, and tasks using the "Entities" tab<br />
                2. Establish relationships between tasks using the "Relationships" tab<br />
                3. Explore the context of a task using the "Context Explorer" tab<br />
                4. Sync with Supabase to persist your changes
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
                  Workspaces: {workspaces.length}
                </Badge>
                <Badge variant="outline">
                  Projects: {projects.length}
                </Badge>
                <Badge variant="outline">
                  Workstreams: {workstreams.length}
                </Badge>
                <Badge variant="outline">
                  Tasks: {tasks.length}
                </Badge>
                <Badge variant="outline">
                  Relationships: {relationships.length}
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
