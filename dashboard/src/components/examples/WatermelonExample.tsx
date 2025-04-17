/**
 * Watermelon Example Component
 * 
 * This component demonstrates how to use the WatermelonDB models
 * in a real application component.
 */

import React, { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { Workspace, Project, Task } from '../../lib/watermelon/models';
import { EntityType, RelationshipType } from '../../lib/knowledge-graph/types';

/**
 * Component props
 */
interface WatermelonExampleProps {
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  activeWorkspaceId?: string;
}

/**
 * Base component (unwrapped)
 */
function WatermelonExampleComponent({
  workspaces,
  projects,
  tasks,
  activeWorkspaceId,
}: WatermelonExampleProps) {
  const database = useDatabase();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    activeWorkspaceId || null
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  
  /**
   * Filter projects by selected workspace
   */
  const filteredProjects = selectedWorkspaceId
    ? projects.filter(p => p.workspaceId === selectedWorkspaceId)
    : projects;
  
  /**
   * Filter tasks by selected project
   */
  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : tasks;
  
  /**
   * Handle workspace selection
   */
  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedProjectId(null); // Reset project selection
    setSelectedTaskId(null); // Reset task selection
  };
  
  /**
   * Handle project selection
   */
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedTaskId(null); // Reset task selection
  };
  
  /**
   * Handle task selection
   */
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    
    // Populate form with selected task data
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description || '');
      setTaskPriority(task.priority);
    }
  };
  
  /**
   * Create a new task
   */
  const handleCreateTask = async () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }
    
    if (!taskTitle) {
      alert('Task title is required');
      return;
    }
    
    try {
      await database.write(async () => {
        const task = await database.get('tasks').create(t => {
          t.projectId = selectedProjectId;
          t.title = taskTitle;
          t.description = taskDescription || undefined;
          t.status = 'todo';
          t.priority = taskPriority;
          t.labelsJson = JSON.stringify([]);
          t.relationshipsJson = JSON.stringify({});
        });
        
        setSelectedTaskId(task.id);
        
        // Reset form
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('medium');
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error.message}`);
    }
  };
  
  /**
   * Update an existing task
   */
  const handleUpdateTask = async () => {
    if (!selectedTaskId) {
      alert('Please select a task first');
      return;
    }
    
    if (!taskTitle) {
      alert('Task title is required');
      return;
    }
    
    try {
      await database.write(async () => {
        const task = await database.get('tasks').find(selectedTaskId);
        
        await task.update(t => {
          t.title = taskTitle;
          t.description = taskDescription || undefined;
          t.priority = taskPriority;
        });
      });
      
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(`Error updating task: ${error.message}`);
    }
  };
  
  /**
   * Delete a task
   */
  const handleDeleteTask = async () => {
    if (!selectedTaskId) {
      alert('Please select a task first');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await database.write(async () => {
        const task = await database.get('tasks').find(selectedTaskId);
        await task.markAsDeleted();
      });
      
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`Error deleting task: ${error.message}`);
    }
  };
  
  /**
   * Create a relationship between two tasks
   */
  const handleCreateRelationship = async () => {
    if (!selectedTaskId) {
      alert('Please select a task first');
      return;
    }
    
    // Find another task in the same project
    const otherTasks = filteredTasks.filter(t => t.id !== selectedTaskId);
    
    if (otherTasks.length === 0) {
      alert('No other tasks available to create a relationship');
      return;
    }
    
    // For demo purposes, just use the first other task
    const targetTaskId = otherTasks[0].id;
    
    try {
      await database.write(async () => {
        await database.get('relationships').create(r => {
          r.sourceType = EntityType.TASK;
          r.sourceId = selectedTaskId;
          r.relationshipType = RelationshipType.TASK_BLOCKS;
          r.targetType = EntityType.TASK;
          r.targetId = targetTaskId;
          r.metadataJson = JSON.stringify({
            created_at: new Date().toISOString(),
            reason: 'Created via example component'
          });
        });
      });
      
      alert(`Relationship created: Task ${selectedTaskId} blocks Task ${targetTaskId}`);
    } catch (error) {
      console.error('Error creating relationship:', error);
      alert(`Error creating relationship: ${error.message}`);
    }
  };
  
  return (
    <div className="watermelon-example">
      <h1>WatermelonDB Example</h1>
      
      <div className="example-content" style={{ display: 'flex', gap: '20px' }}>
        {/* Entity Selection Section */}
        <div className="entity-selection" style={{ flex: 1 }}>
          <h2>Entities</h2>
          
          {/* Workspaces */}
          <div className="entity-section">
            <h3>Workspaces</h3>
            {workspaces.length === 0 ? (
              <p>No workspaces found</p>
            ) : (
              <ul className="entity-list">
                {workspaces.map(workspace => (
                  <li 
                    key={workspace.id}
                    className={selectedWorkspaceId === workspace.id ? 'selected' : ''}
                    onClick={() => handleSelectWorkspace(workspace.id)}
                  >
                    {workspace.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Projects */}
          <div className="entity-section">
            <h3>Projects</h3>
            {filteredProjects.length === 0 ? (
              <p>No projects found</p>
            ) : (
              <ul className="entity-list">
                {filteredProjects.map(project => (
                  <li
                    key={project.id}
                    className={selectedProjectId === project.id ? 'selected' : ''}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    {project.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Tasks */}
          <div className="entity-section">
            <h3>Tasks</h3>
            {filteredTasks.length === 0 ? (
              <p>No tasks found</p>
            ) : (
              <ul className="entity-list">
                {filteredTasks.map(task => (
                  <li
                    key={task.id}
                    className={selectedTaskId === task.id ? 'selected' : ''}
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <div className="task-title">{task.title}</div>
                    <div className="task-status">{task.status}</div>
                    <div className="task-priority">{task.priority}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Task Form Section */}
        <div className="task-form" style={{ flex: 1 }}>
          <h2>Task Form</h2>
          
          <div className="form-group">
            <label htmlFor="taskTitle">Title</label>
            <input
              id="taskTitle"
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder="Task description"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="taskPriority">Priority</label>
            <select
              id="taskPriority"
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button
              onClick={handleCreateTask}
              disabled={!selectedProjectId || !taskTitle}
            >
              Create Task
            </button>
            
            <button
              onClick={handleUpdateTask}
              disabled={!selectedTaskId || !taskTitle}
            >
              Update Task
            </button>
            
            <button
              onClick={handleDeleteTask}
              disabled={!selectedTaskId}
            >
              Delete Task
            </button>
            
            <button
              onClick={handleCreateRelationship}
              disabled={!selectedTaskId || filteredTasks.length < 2}
            >
              Create Relationship
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced component with WatermelonDB observables
 */
export const WatermelonExample = withObservables(['activeWorkspaceId'], ({ database, activeWorkspaceId }) => {
  return {
    workspaces: database.get('workspaces').query(),
    projects: database.get('projects').query(),
    tasks: database.get('tasks').query(Q.where('status', Q.notEq('archived'))),
    activeWorkspaceId,
  };
})(WatermelonExampleComponent);

export default WatermelonExample;
