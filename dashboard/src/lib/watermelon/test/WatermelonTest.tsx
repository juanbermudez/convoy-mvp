/**
 * WatermelonDB Test Component
 * 
 * This component demonstrates the functionality of WatermelonDB models
 * with the knowledge graph implementation.
 */

import React, { useEffect, useState } from 'react';
import { database, initDatabase, sync } from '../database';
import { Workspace, Project, Workstream, Task, Relationship } from '../models';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { withObservables } from '@nozbe/watermelondb/react';
import { EntityType, RelationshipType } from '../../knowledge-graph/types';

/**
 * Test component props
 */
interface TestComponentProps {
  workspaces: Workspace[];
  projects: Project[];
  workstreams: Workstream[];
  tasks: Task[];
  relationships: Relationship[];
}

/**
 * WatermelonDB Test Component - Unwrapped
 */
function WatermelonTestComponent({
  workspaces,
  projects,
  workstreams,
  tasks,
  relationships,
}: TestComponentProps) {
  const database = useDatabase();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Initializing...');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedWorkstream, setSelectedWorkstream] = useState<Workstream | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  /**
   * Initialize the database on component mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setMessage('Initializing database...');
        
        await initDatabase();
        setInitialized(true);
        setMessage('Database initialized successfully');
        
        // Check if we have any data
        const workspaceCount = await database.get('workspaces').query().fetchCount();
        
        if (workspaceCount === 0) {
          // Create test data if none exists
          setMessage('Creating test data...');
          await createTestData();
          setMessage('Test data created successfully');
        } else {
          setMessage(`Database contains ${workspaceCount} workspaces`);
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        setMessage(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  /**
   * Create test data
   */
  const createTestData = async () => {
    try {
      await database.write(async () => {
        // Create a workspace
        const workspace = await database.get('workspaces').create(w => {
          w.name = 'Test Workspace';
          w.description = 'A test workspace for WatermelonDB';
        });
        
        // Create a project
        const project = await database.get('projects').create(p => {
          p.workspaceId = workspace.id;
          p.name = 'Test Project';
          p.description = 'A test project for WatermelonDB';
          p.status = 'active';
        });
        
        // Create a workstream
        const workstream = await database.get('workstreams').create(w => {
          w.projectId = project.id;
          w.name = 'Test Workstream';
          w.description = 'A test workstream for WatermelonDB';
          w.status = 'in_progress';
          w.progress = 0.5;
        });
        
        // Create a task in the workstream
        const task1 = await database.get('tasks').create(t => {
          t.projectId = project.id;
          t.workstreamId = workstream.id;
          t.title = 'Test Task 1';
          t.description = 'A test task for WatermelonDB';
          t.status = 'todo';
          t.priority = 'medium';
          t.labelsJson = JSON.stringify(['test', 'demo']);
          t.relationshipsJson = JSON.stringify({});
        });
        
        // Create a second task
        const task2 = await database.get('tasks').create(t => {
          t.projectId = project.id;
          t.workstreamId = workstream.id;
          t.title = 'Test Task 2';
          t.description = 'Another test task for WatermelonDB';
          t.status = 'in_progress';
          t.priority = 'high';
          t.labelsJson = JSON.stringify(['test', 'important']);
          t.relationshipsJson = JSON.stringify({});
        });
        
        // Create a relationship between tasks
        await database.get('relationships').create(r => {
          r.sourceType = EntityType.TASK;
          r.sourceId = task1.id;
          r.relationshipType = RelationshipType.TASK_BLOCKS;
          r.targetType = EntityType.TASK;
          r.targetId = task2.id;
          r.metadataJson = JSON.stringify({ reason: 'Task 1 must be completed first' });
        });
      });
    } catch (error) {
      console.error('Error creating test data:', error);
      throw error;
    }
  };

  /**
   * Sync with Supabase
   */
  const handleSync = async () => {
    try {
      setLoading(true);
      setMessage('Syncing with Supabase...');
      
      const success = await sync();
      
      setMessage(success ? 'Sync completed successfully' : 'Sync failed');
    } catch (error) {
      console.error('Sync failed:', error);
      setMessage(`Sync error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new task
   */
  const handleCreateTask = async () => {
    if (!selectedProject) {
      setMessage('Please select a project first');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('Creating a new task...');
      
      await database.write(async () => {
        const task = await database.get('tasks').create(t => {
          t.projectId = selectedProject.id;
          t.workstreamId = selectedWorkstream?.id;
          t.title = `New Task ${Date.now()}`;
          t.description = 'A new task created from the test component';
          t.status = 'todo';
          t.priority = 'medium';
          t.labelsJson = JSON.stringify(['new', 'test']);
          t.relationshipsJson = JSON.stringify({});
        });
        
        setMessage(`Task ${task.title} created successfully`);
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setMessage(`Error creating task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a task status
   */
  const handleUpdateTaskStatus = async () => {
    if (!selectedTask) {
      setMessage('Please select a task first');
      return;
    }
    
    try {
      setLoading(true);
      setMessage(`Updating task ${selectedTask.title}...`);
      
      await database.write(async () => {
        await selectedTask.update(t => {
          // Toggle between 'todo' and 'done'
          t.status = t.status === 'todo' ? 'done' : 'todo';
        });
        
        setMessage(`Task ${selectedTask.title} updated successfully`);
      });
    } catch (error) {
      console.error('Error updating task:', error);
      setMessage(`Error updating task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async () => {
    if (!selectedTask) {
      setMessage('Please select a task first');
      return;
    }
    
    try {
      setLoading(true);
      setMessage(`Deleting task ${selectedTask.title}...`);
      
      await database.write(async () => {
        await selectedTask.markAsDeleted();
      });
      
      setSelectedTask(null);
      setMessage('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      setMessage(`Error deleting task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a relationship between tasks
   */
  const handleCreateRelationship = async () => {
    if (!selectedTask) {
      setMessage('Please select a task first');
      return;
    }
    
    // Find another task to create a relationship with
    const otherTasks = tasks.filter(t => t.id !== selectedTask.id);
    
    if (otherTasks.length === 0) {
      setMessage('No other tasks available to create a relationship');
      return;
    }
    
    const targetTask = otherTasks[0];
    
    try {
      setLoading(true);
      setMessage(`Creating relationship between tasks...`);
      
      await database.write(async () => {
        // Create a "blocks" relationship
        await database.get('relationships').create(r => {
          r.sourceType = EntityType.TASK;
          r.sourceId = selectedTask.id;
          r.relationshipType = RelationshipType.TASK_BLOCKS;
          r.targetType = EntityType.TASK;
          r.targetId = targetTask.id;
          r.metadataJson = JSON.stringify({ 
            created_at: new Date().toISOString(),
            reason: 'Created from test component' 
          });
        });
      });
      
      setMessage(`Relationship created: ${selectedTask.title} blocks ${targetTask.title}`);
    } catch (error) {
      console.error('Error creating relationship:', error);
      setMessage(`Error creating relationship: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Display related tasks
   */
  const showRelatedTasks = async () => {
    if (!selectedTask) {
      setMessage('Please select a task first');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('Finding related tasks...');
      
      // Get tasks that are blocked by this task
      const blockingTasksRels = await selectedTask.blockingTasks.fetch();
      const blockedByTasksRels = await selectedTask.blockedByTasks.fetch();
      
      // Get the actual task objects
      const getTasksFromRels = async (rels) => {
        const taskIds = rels.map(r => r.targetId);
        return await database.get('tasks').query(Q.where('id', Q.oneOf(taskIds))).fetch();
      };
      
      const blockingTasks = await getTasksFromRels(blockingTasksRels);
      const blockedByTasks = await getTasksFromRels(blockedByTasksRels);
      
      const blockingTasksStr = blockingTasks.map(t => t.title).join(', ') || 'None';
      const blockedByTasksStr = blockedByTasks.map(t => t.title).join(', ') || 'None';
      
      setMessage(
        `Related tasks for ${selectedTask.title}:\n` +
        `- Blocks: ${blockingTasksStr}\n` +
        `- Blocked by: ${blockedByTasksStr}`
      );
    } catch (error) {
      console.error('Error finding related tasks:', error);
      setMessage(`Error finding related tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>WatermelonDB Test Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleSync} 
          disabled={loading || !initialized}
          style={{ padding: '8px 16px' }}
        >
          Sync with Supabase
        </button>
        
        <button 
          onClick={handleCreateTask} 
          disabled={loading || !selectedProject}
          style={{ padding: '8px 16px' }}
        >
          Create Task
        </button>
        
        <button 
          onClick={handleUpdateTaskStatus} 
          disabled={loading || !selectedTask}
          style={{ padding: '8px 16px' }}
        >
          Toggle Task Status
        </button>
        
        <button 
          onClick={handleDeleteTask} 
          disabled={loading || !selectedTask}
          style={{ padding: '8px 16px' }}
        >
          Delete Task
        </button>
        
        <button 
          onClick={handleCreateRelationship} 
          disabled={loading || !selectedTask || tasks.length < 2}
          style={{ padding: '8px 16px' }}
        >
          Create Relationship
        </button>
        
        <button 
          onClick={showRelatedTasks} 
          disabled={loading || !selectedTask}
          style={{ padding: '8px 16px' }}
        >
          Show Related Tasks
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Workspaces */}
        <div style={{ flex: 1 }}>
          <h2>Workspaces</h2>
          {workspaces.length === 0 ? (
            <p>No workspaces found</p>
          ) : (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {workspaces.map(workspace => (
                <li 
                  key={workspace.id} 
                  onClick={() => setSelectedWorkspace(workspace)}
                  style={{ 
                    padding: '8px',
                    backgroundColor: selectedWorkspace?.id === workspace.id ? '#e0e0ff' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <div><strong>{workspace.name}</strong></div>
                  <div style={{ fontSize: '0.8em' }}>{workspace.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Projects */}
        <div style={{ flex: 1 }}>
          <h2>Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found</p>
          ) : (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {projects.map(project => (
                <li 
                  key={project.id} 
                  onClick={() => setSelectedProject(project)}
                  style={{ 
                    padding: '8px',
                    backgroundColor: selectedProject?.id === project.id ? '#e0ffe0' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <div><strong>{project.name}</strong></div>
                  <div style={{ fontSize: '0.8em' }}>{project.description}</div>
                  <div style={{ fontSize: '0.8em' }}>Status: {project.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Workstreams */}
        <div style={{ flex: 1 }}>
          <h2>Workstreams</h2>
          {workstreams.length === 0 ? (
            <p>No workstreams found</p>
          ) : (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {workstreams.map(workstream => (
                <li 
                  key={workstream.id} 
                  onClick={() => setSelectedWorkstream(workstream)}
                  style={{ 
                    padding: '8px',
                    backgroundColor: selectedWorkstream?.id === workstream.id ? '#fff0e0' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <div><strong>{workstream.name}</strong></div>
                  <div style={{ fontSize: '0.8em' }}>{workstream.description}</div>
                  <div style={{ fontSize: '0.8em' }}>Status: {workstream.status}</div>
                  <div style={{ fontSize: '0.8em' }}>Progress: {Math.round(workstream.progress * 100)}%</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Tasks */}
        <div style={{ flex: 1 }}>
          <h2>Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks found</p>
          ) : (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {tasks.map(task => (
                <li 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  style={{ 
                    padding: '8px',
                    backgroundColor: selectedTask?.id === task.id ? '#ffe0e0' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <div><strong>{task.title}</strong></div>
                  <div style={{ fontSize: '0.8em' }}>{task.description}</div>
                  <div style={{ fontSize: '0.8em' }}>Status: {task.status}</div>
                  <div style={{ fontSize: '0.8em' }}>Priority: {task.priority}</div>
                  <div style={{ fontSize: '0.8em' }}>
                    Labels: {task.labels.join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {relationships.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Relationships</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Source</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Relationship</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Target</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map(rel => (
                <tr key={rel.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {rel.sourceType}/{rel.sourceId}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {rel.relationshipType}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {rel.targetType}/{rel.targetId}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {JSON.stringify(rel.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Entity type to collection name mapping
 */
const entityToCollection = {
  [EntityType.WORKSPACE]: 'workspaces',
  [EntityType.PROJECT]: 'projects',
  [EntityType.WORKSTREAM]: 'workstreams',
  [EntityType.TASK]: 'tasks',
};

/**
 * Enhanced test component with WatermelonDB observables
 */
const enhance = withObservables([], () => {
  // Use the database from the import instead of the prop
  return {
    workspaces: database.get('workspaces').query(),
    projects: database.get('projects').query(),
    workstreams: database.get('workstreams').query(),
    tasks: database.get('tasks').query(),
    relationships: database.get('relationships').query(),
  };
});

/**
 * Wrapped WatermelonDB Test Component
 */
export const WatermelonTest = enhance(WatermelonTestComponent);

export default WatermelonTest;
