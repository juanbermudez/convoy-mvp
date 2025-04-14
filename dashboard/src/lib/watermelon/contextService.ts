import { Q } from '@nozbe/watermelondb';
import database from './database';
import * as remoteContextService from '@/lib/supabase/contextService';
import { synchronize } from './sync';

/**
 * Local Context Service using WatermelonDB
 * This provides a local-first implementation of the Context Service
 */

/**
 * Task context type definition
 */
export type TaskContext = {
  task: any;
  milestone: any;
  project: any;
  workspace: any;
  parent_task?: any | null;
  subtasks: any[];
  dependencies: any[];
  activities: any[];
  patterns: any[];
  best_practices: any[];
  workflow: any;
};

/**
 * Retrieve task context from the local database with fallback to remote
 * @param taskId The UUID of the task to retrieve context for
 * @returns The complete task context or null if not found
 */
export async function getTaskContext(taskId: string): Promise<TaskContext | null> {
  console.log(`Getting context for task ${taskId} from local database...`);
  
  try {
    // First try to get the task from the local database
    const task = await getLocalTask(taskId);
    
    // If task doesn't exist locally, try to fetch from remote
    if (!task) {
      console.log('Task not found locally, falling back to remote...');
      return getRemoteTaskContext(taskId);
    }
    
    // Get the milestone
    const milestone = await task.milestone.fetch();
    if (!milestone) {
      console.log('Milestone not found locally, falling back to remote...');
      return getRemoteTaskContext(taskId);
    }
    
    // Get the project
    const project = await milestone.project.fetch();
    if (!project) {
      console.log('Project not found locally, falling back to remote...');
      return getRemoteTaskContext(taskId);
    }
    
    // Get the workspace
    const workspace = await project.workspace.fetch();
    if (!workspace) {
      console.log('Workspace not found locally, falling back to remote...');
      return getRemoteTaskContext(taskId);
    }
    
    // Get parent task if it exists
    let parentTask = null;
    if (task.parentTaskId) {
      parentTask = await task.parentTask.fetch();
    }
    
    // Get subtasks
    const subtasks = await task.subtasks.fetch();
    
    // Get dependencies
    const taskDependencies = await database.get('task_dependencies')
      .query(Q.where('task_id', task.id))
      .fetch();
    
    const dependencyIds = taskDependencies.map(dep => dep.dependsOnTaskId);
    let dependencies = [];
    
    if (dependencyIds.length > 0) {
      dependencies = await database.get('tasks')
        .query(Q.where('id', Q.oneOf(dependencyIds)))
        .fetch();
    }
    
    // Get activities
    const activities = await database.get('activity_feed')
      .query(
        Q.where('task_id', task.id),
        Q.sortBy('created_at', Q.desc),
        Q.take(20)
      )
      .fetch();
    
    // Get relevant patterns
    const patterns = await database.get('patterns')
      .query(
        Q.or(
          Q.where('workspace_id', workspace.id),
          Q.where('project_id', project.id),
          Q.and(
            Q.where('workspace_id', null),
            Q.where('project_id', null)
          )
        )
      )
      .fetch();
    
    // Get relevant best practices
    const bestPractices = await database.get('best_practices')
      .query(
        Q.or(
          Q.where('workspace_id', workspace.id),
          Q.where('project_id', project.id),
          Q.and(
            Q.where('workspace_id', null),
            Q.where('project_id', null)
          )
        )
      )
      .fetch();
    
    // Get the workflow
    const workflows = await database.get('workflows')
      .query(Q.where('name', 'Standard Development Workflow'))
      .fetch();
    
    const workflow = workflows.length > 0 ? workflows[0] : null;
    
    if (!workflow) {
      console.log('Workflow not found locally, falling back to remote...');
      return getRemoteTaskContext(taskId);
    }
    
    // Convert all models to plain objects
    const context: TaskContext = {
      task: modelToObject(task),
      milestone: modelToObject(milestone),
      project: modelToObject(project),
      workspace: modelToObject(workspace),
      parent_task: parentTask ? modelToObject(parentTask) : null,
      subtasks: subtasks.map(modelToObject),
      dependencies: dependencies.map(modelToObject),
      activities: activities.map(modelToObject),
      patterns: patterns.map(modelToObject),
      best_practices: bestPractices.map(modelToObject),
      workflow: modelToObject(workflow)
    };
    
    console.log('Successfully retrieved task context from local database');
    return context;
  } catch (error) {
    console.error('Error getting local task context:', error);
    
    // Fall back to remote if there's an error
    console.log('Falling back to remote due to error...');
    return getRemoteTaskContext(taskId);
  }
}

/**
 * Get a task by ID from the local database
 * @param taskId The UUID of the task to retrieve
 * @returns The task model or null if not found
 */
async function getLocalTask(taskId: string): Promise<any | null> {
  try {
    // First try to find by local ID
    try {
      return await database.get('tasks').find(taskId);
    } catch (error) {
      // If not found by local ID, try by remote ID
      const tasks = await database.get('tasks')
        .query(Q.where('remote_id', taskId))
        .fetch();
      
      return tasks.length > 0 ? tasks[0] : null;
    }
  } catch (error) {
    console.error('Error getting local task:', error);
    return null;
  }
}

/**
 * Fall back to remote context service
 * @param taskId The UUID of the task to retrieve context for
 * @returns The complete task context from the remote service
 */
async function getRemoteTaskContext(taskId: string): Promise<TaskContext | null> {
  console.log('Getting task context from remote...');
  
  try {
    // Get context from remote
    const remoteContext = await remoteContextService.getTaskContext(taskId);
    
    if (!remoteContext) {
      console.log('Task not found in remote');
      return null;
    }
    
    // Trigger a sync to ensure we have the latest data
    setTimeout(async () => {
      console.log('Triggering sync after remote context retrieval...');
      await synchronize();
    }, 0);
    
    return remoteContext;
  } catch (error) {
    console.error('Error getting remote task context:', error);
    return null;
  }
}

/**
 * Convert a WatermelonDB model to a plain object
 * @param model The WatermelonDB model to convert
 * @returns A plain JavaScript object
 */
function modelToObject(model: any): any {
  if (!model) return null;
  
  const obj = {
    id: model.id,
    ...model._raw,
  };
  
  // Parse JSON fields
  if (model.techStackObject) {
    obj.tech_stack = model.techStackObject;
  }
  
  if (model.stagesObject) {
    obj.stages = model.stagesObject;
  }
  
  if (model.detailsObject) {
    obj.details = model.detailsObject;
  }
  
  if (model.contentObject) {
    obj.content = model.contentObject;
  }
  
  // Convert timestamps to ISO strings
  if (model._raw.created_at) {
    obj.created_at = new Date(model._raw.created_at).toISOString();
  }
  
  if (model._raw.updated_at) {
    obj.updated_at = new Date(model._raw.updated_at).toISOString();
  }
  
  if (model._raw.target_date) {
    obj.target_date = new Date(model._raw.target_date).toISOString();
  }
  
  if (model._raw.completion_date) {
    obj.completion_date = new Date(model._raw.completion_date).toISOString();
  }
  
  return obj;
}

/**
 * Add a new activity to the activity feed for a task
 * @param taskId The UUID of the task to add activity for
 * @param activityType The type of activity
 * @param details Optional details about the activity
 * @param actorId Optional UUID of the user who performed the activity
 * @returns The newly created activity or null if there was an error
 */
export async function addTaskActivity(
  taskId: string,
  activityType: string,
  details?: any,
  actorId?: string
): Promise<any | null> {
  console.log(`Adding activity ${activityType} for task ${taskId} to local database...`);
  
  try {
    // Get the task from the local database
    const task = await getLocalTask(taskId);
    
    if (!task) {
      console.log('Task not found locally, falling back to remote...');
      return remoteContextService.addTaskActivity(taskId, activityType, details, actorId);
    }
    
    // Create the activity in the local database
    let newActivity;
    
    await database.write(async () => {
      newActivity = await database.get('activity_feed').create(record => {
        record.taskId = task.id;
        record.actorId = actorId || null;
        record.activityType = activityType;
        record.details = JSON.stringify(details || {});
        record.createdAt = Date.now();
        record.isSynced = false;
      });
    });
    
    console.log('Activity added to local database');
    return modelToObject(newActivity);
  } catch (error) {
    console.error('Error adding activity to local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.addTaskActivity(taskId, activityType, details, actorId);
  }
}

/**
 * Update the current stage of a task and add an activity to the activity feed
 * @param taskId The UUID of the task to update
 * @param newStage The new stage to set
 * @param actorId Optional UUID of the user who performed the stage change
 * @returns The updated task or null if there was an error
 */
export async function updateTaskStage(
  taskId: string,
  newStage: string,
  actorId?: string
): Promise<any | null> {
  console.log(`Updating task ${taskId} stage to ${newStage} in local database...`);
  
  try {
    // Get the task from the local database
    const task = await getLocalTask(taskId);
    
    if (!task) {
      console.log('Task not found locally, falling back to remote...');
      return remoteContextService.updateTaskStage(taskId, newStage, actorId);
    }
    
    // Get the current stage
    const currentStage = task.currentStage;
    
    // Update the task
    await database.write(async () => {
      await task.update(record => {
        record.currentStage = newStage;
        record.updatedAt = Date.now();
        record.isSynced = false;
        record.syncStatus = 'pending';
      });
    });
    
    // Add an activity for the stage change
    await addTaskActivity(
      taskId,
      'STAGE_CHANGE',
      {
        from_stage: currentStage,
        to_stage: newStage,
        timestamp: new Date().toISOString()
      },
      actorId
    );
    
    console.log('Task stage updated in local database');
    return modelToObject(task);
  } catch (error) {
    console.error('Error updating task stage in local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.updateTaskStage(taskId, newStage, actorId);
  }
}

/**
 * Creates a new task in the database
 * @param taskData The task data to insert
 * @returns The newly created task or null if there was an error
 */
export async function createTask(taskData: any): Promise<any | null> {
  console.log('Creating task in local database...');
  
  try {
    // First, check if the milestone exists locally
    const milestones = await database.get('milestones')
      .query(Q.where('remote_id', taskData.milestone_id))
      .fetch();
    
    if (milestones.length === 0) {
      console.log('Milestone not found locally, falling back to remote...');
      return remoteContextService.createTask(taskData);
    }
    
    const localMilestoneId = milestones[0].id;
    
    // Check if parent task exists locally
    let localParentTaskId = null;
    
    if (taskData.parent_task_id) {
      const parentTasks = await database.get('tasks')
        .query(Q.where('remote_id', taskData.parent_task_id))
        .fetch();
      
      if (parentTasks.length > 0) {
        localParentTaskId = parentTasks[0].id;
      }
    }
    
    // Create the task in the local database
    let newTask;
    
    await database.write(async () => {
      newTask = await database.get('tasks').create(record => {
        record.milestoneId = localMilestoneId;
        record.parentTaskId = localParentTaskId;
        record.title = taskData.title;
        record.description = taskData.description;
        record.currentStage = taskData.current_stage || 'PLAN';
        record.status = taskData.status || 'TODO';
        record.createdAt = Date.now();
        record.updatedAt = Date.now();
        record.completionDate = null;
        record.isSynced = false;
        record.syncStatus = 'pending';
      });
    });
    
    // Add activity for task creation
    await addTaskActivity(
      newTask.id,
      'TASK_CREATED',
      {
        milestone_id: taskData.milestone_id,
        parent_task_id: taskData.parent_task_id,
        timestamp: new Date().toISOString()
      }
    );
    
    console.log('Task created in local database');
    return modelToObject(newTask);
  } catch (error) {
    console.error('Error creating task in local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.createTask(taskData);
  }
}

/**
 * Updates an existing task in the database
 * @param taskId The UUID of the task to update
 * @param taskData The updated task data
 * @returns The updated task or null if there was an error
 */
export async function updateTask(taskId: string, taskData: any): Promise<any | null> {
  console.log(`Updating task ${taskId} in local database...`);
  
  try {
    // Get the task from the local database
    const task = await getLocalTask(taskId);
    
    if (!task) {
      console.log('Task not found locally, falling back to remote...');
      return remoteContextService.updateTask(taskId, taskData);
    }
    
    // Update the task
    await database.write(async () => {
      await task.update(record => {
        // Update fields that are present in taskData
        if (taskData.title !== undefined) record.title = taskData.title;
        if (taskData.description !== undefined) record.description = taskData.description;
        if (taskData.current_stage !== undefined) record.currentStage = taskData.current_stage;
        if (taskData.status !== undefined) record.status = taskData.status;
        if (taskData.completion_date !== undefined) {
          record.completionDate = taskData.completion_date ? 
            new Date(taskData.completion_date).getTime() : null;
        }
        
        // Always update the updated_at timestamp
        record.updatedAt = Date.now();
        record.isSynced = false;
        record.syncStatus = 'pending';
      });
    });
    
    // Add activity for task update
    await addTaskActivity(
      taskId,
      'TASK_UPDATED',
      {
        updated_fields: Object.keys(taskData),
        timestamp: new Date().toISOString()
      }
    );
    
    console.log('Task updated in local database');
    return modelToObject(task);
  } catch (error) {
    console.error('Error updating task in local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.updateTask(taskId, taskData);
  }
}

/**
 * Retrieves all workspaces from the database
 * @returns An array of workspaces or null if there was an error
 */
export async function getWorkspaces(): Promise<any[] | null> {
  console.log('Getting workspaces from local database...');
  
  try {
    // Get workspaces from local database
    const workspaces = await database.get('workspaces')
      .query()
      .fetch();
    
    if (workspaces.length === 0) {
      console.log('No workspaces found locally, falling back to remote...');
      
      // Try to pull from remote
      const remoteWorkspaces = await remoteContextService.getWorkspaces();
      
      // Trigger a sync
      setTimeout(async () => {
        console.log('Triggering sync after remote workspace retrieval...');
        await synchronize();
      }, 0);
      
      return remoteWorkspaces;
    }
    
    console.log(`Found ${workspaces.length} workspaces in local database`);
    return workspaces.map(modelToObject);
  } catch (error) {
    console.error('Error getting workspaces from local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.getWorkspaces();
  }
}

/**
 * Retrieves all projects for a workspace
 * @param workspaceId The UUID of the workspace to get projects for
 * @returns An array of projects or null if there was an error
 */
export async function getProjects(workspaceId: string): Promise<any[] | null> {
  console.log(`Getting projects for workspace ${workspaceId} from local database...`);
  
  try {
    // Find the workspace in the local database
    const workspace = await database.get('workspaces')
      .query(Q.or(
        Q.where('id', workspaceId),
        Q.where('remote_id', workspaceId)
      ))
      .fetch();
    
    if (workspace.length === 0) {
      console.log('Workspace not found locally, falling back to remote...');
      return remoteContextService.getProjects(workspaceId);
    }
    
    const localWorkspaceId = workspace[0].id;
    
    // Get projects from local database
    const projects = await database.get('projects')
      .query(Q.where('workspace_id', localWorkspaceId))
      .fetch();
    
    if (projects.length === 0) {
      console.log('No projects found locally, falling back to remote...');
      
      // Try to pull from remote
      const remoteProjects = await remoteContextService.getProjects(workspaceId);
      
      // Trigger a sync
      setTimeout(async () => {
        console.log('Triggering sync after remote project retrieval...');
        await synchronize();
      }, 0);
      
      return remoteProjects;
    }
    
    console.log(`Found ${projects.length} projects in local database`);
    return projects.map(modelToObject);
  } catch (error) {
    console.error('Error getting projects from local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.getProjects(workspaceId);
  }
}

/**
 * Retrieves all milestones for a project
 * @param projectId The UUID of the project to get milestones for
 * @returns An array of milestones or null if there was an error
 */
export async function getMilestones(projectId: string): Promise<any[] | null> {
  console.log(`Getting milestones for project ${projectId} from local database...`);
  
  try {
    // Find the project in the local database
    const project = await database.get('projects')
      .query(Q.or(
        Q.where('id', projectId),
        Q.where('remote_id', projectId)
      ))
      .fetch();
    
    if (project.length === 0) {
      console.log('Project not found locally, falling back to remote...');
      return remoteContextService.getMilestones(projectId);
    }
    
    const localProjectId = project[0].id;
    
    // Get milestones from local database
    const milestones = await database.get('milestones')
      .query(Q.where('project_id', localProjectId))
      .fetch();
    
    if (milestones.length === 0) {
      console.log('No milestones found locally, falling back to remote...');
      
      // Try to pull from remote
      const remoteMilestones = await remoteContextService.getMilestones(projectId);
      
      // Trigger a sync
      setTimeout(async () => {
        console.log('Triggering sync after remote milestone retrieval...');
        await synchronize();
      }, 0);
      
      return remoteMilestones;
    }
    
    console.log(`Found ${milestones.length} milestones in local database`);
    return milestones.map(modelToObject);
  } catch (error) {
    console.error('Error getting milestones from local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.getMilestones(projectId);
  }
}

/**
 * Retrieves all tasks for a milestone
 * @param milestoneId The UUID of the milestone to get tasks for
 * @returns An array of tasks or null if there was an error
 */
export async function getTasks(milestoneId: string): Promise<any[] | null> {
  console.log(`Getting tasks for milestone ${milestoneId} from local database...`);
  
  try {
    // Find the milestone in the local database
    const milestone = await database.get('milestones')
      .query(Q.or(
        Q.where('id', milestoneId),
        Q.where('remote_id', milestoneId)
      ))
      .fetch();
    
    if (milestone.length === 0) {
      console.log('Milestone not found locally, falling back to remote...');
      return remoteContextService.getTasks(milestoneId);
    }
    
    const localMilestoneId = milestone[0].id;
    
    // Get tasks from local database
    const tasks = await database.get('tasks')
      .query(Q.where('milestone_id', localMilestoneId))
      .fetch();
    
    if (tasks.length === 0) {
      console.log('No tasks found locally, falling back to remote...');
      
      // Try to pull from remote
      const remoteTasks = await remoteContextService.getTasks(milestoneId);
      
      // Trigger a sync
      setTimeout(async () => {
        console.log('Triggering sync after remote task retrieval...');
        await synchronize();
      }, 0);
      
      return remoteTasks;
    }
    
    console.log(`Found ${tasks.length} tasks in local database`);
    return tasks.map(modelToObject);
  } catch (error) {
    console.error('Error getting tasks from local database:', error);
    
    // Fall back to remote
    console.log('Falling back to remote due to error...');
    return remoteContextService.getTasks(milestoneId);
  }
}

// Export functions that match the remote Context Service API
export default {
  getTaskContext,
  addTaskActivity,
  updateTaskStage,
  createTask,
  updateTask,
  getWorkspaces,
  getProjects,
  getMilestones,
  getTasks
};
