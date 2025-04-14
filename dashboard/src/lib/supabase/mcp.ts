import { supabase } from './client';
import type { Database } from './types';

/**
 * Memory Context Provider (MCP) for Convoy
 * This module provides functions for retrieving context from the Convoy knowledge graph
 * and for storing and updating data in the Supabase database
 */

// Types for context retrieval
export type TaskContext = {
  task: Database['public']['Tables']['tasks']['Row'];
  milestone: Database['public']['Tables']['milestones']['Row'];
  project: Database['public']['Tables']['projects']['Row'];
  workspace: Database['public']['Tables']['workspaces']['Row'];
  parent_task?: Database['public']['Tables']['tasks']['Row'] | null;
  subtasks: Database['public']['Tables']['tasks']['Row'][];
  dependencies: Database['public']['Tables']['tasks']['Row'][];
  activities: Database['public']['Tables']['activity_feed']['Row'][];
  patterns: Database['public']['Tables']['patterns']['Row'][];
  best_practices: Database['public']['Tables']['best_practices']['Row'][];
  workflow: Database['public']['Tables']['workflows']['Row'];
};

/**
 * Retrieves complete context for a task from the knowledge graph
 * This is the main function used by AI agents to get context for the Memory Bank pattern
 * 
 * @param taskId The UUID of the task to retrieve context for
 * @returns Complete task context including all related entities
 */
export async function getTaskContext(taskId: string): Promise<TaskContext | null> {
  try {
    // Get the task with its milestone
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      console.error('Error fetching task:', taskError);
      return null;
    }
    
    // Get the milestone with its project
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', task.milestone_id)
      .single();
    
    if (milestoneError || !milestone) {
      console.error('Error fetching milestone:', milestoneError);
      return null;
    }
    
    // Get the project with its workspace
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', milestone.project_id)
      .single();
    
    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return null;
    }
    
    // Get the workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', project.workspace_id)
      .single();
    
    if (workspaceError || !workspace) {
      console.error('Error fetching workspace:', workspaceError);
      return null;
    }
    
    // Get parent task if exists
    let parent_task = null;
    if (task.parent_task_id) {
      const { data: parentTask, error: parentTaskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', task.parent_task_id)
        .single();
      
      if (!parentTaskError) {
        parent_task = parentTask;
      }
    }
    
    // Get subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', task.id);
    
    if (subtasksError) {
      console.error('Error fetching subtasks:', subtasksError);
      return null;
    }
    
    // Get dependencies
    const { data: taskDependencies, error: dependenciesError } = await supabase
      .from('task_dependencies')
      .select('depends_on_task_id')
      .eq('task_id', task.id);
    
    if (dependenciesError) {
      console.error('Error fetching dependencies:', dependenciesError);
      return null;
    }
    
    const dependencyIds = taskDependencies.map(dep => dep.depends_on_task_id);
    let dependencies: Database['public']['Tables']['tasks']['Row'][] = [];
    
    if (dependencyIds.length > 0) {
      const { data: dependencyTasks, error: dependencyTasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', dependencyIds);
      
      if (!dependencyTasksError && dependencyTasks) {
        dependencies = dependencyTasks;
      }
    }
    
    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return null;
    }
    
    // Get relevant patterns
    const { data: patterns, error: patternsError } = await supabase
      .from('patterns')
      .select('*')
      .or(`workspace_id.eq.${workspace.id},project_id.eq.${project.id},workspace_id.is.null,project_id.is.null`);
    
    if (patternsError) {
      console.error('Error fetching patterns:', patternsError);
      return null;
    }
    
    // Get relevant best practices
    const { data: bestPractices, error: bestPracticesError } = await supabase
      .from('best_practices')
      .select('*')
      .or(`workspace_id.eq.${workspace.id},project_id.eq.${project.id},workspace_id.is.null,project_id.is.null`);
    
    if (bestPracticesError) {
      console.error('Error fetching best practices:', bestPracticesError);
      return null;
    }
    
    // Get the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('name', 'Standard Development Workflow')
      .single();
    
    if (workflowError || !workflow) {
      console.error('Error fetching workflow:', workflowError);
      return null;
    }
    
    // Assemble and return the complete context
    return {
      task,
      milestone,
      project,
      workspace,
      parent_task,
      subtasks: subtasks || [],
      dependencies,
      activities: activities || [],
      patterns: patterns || [],
      best_practices: bestPractices || [],
      workflow
    };
  } catch (error) {
    console.error('Error retrieving task context:', error);
    return null;
  }
}

/**
 * Adds a new activity to the activity feed for a task
 * 
 * @param taskId The UUID of the task to add activity for
 * @param activityType The type of activity (e.g., 'STAGE_CHANGE', 'COMMENT', etc.)
 * @param details Optional details about the activity
 * @param actorId Optional UUID of the user who performed the activity
 * @returns The newly created activity or null if there was an error
 */
export async function addTaskActivity(
  taskId: string,
  activityType: string,
  details?: any,
  actorId?: string
): Promise<Database['public']['Tables']['activity_feed']['Row'] | null> {
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        task_id: taskId,
        activity_type: activityType,
        details: details || null,
        actor_id: actorId || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding task activity:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding task activity:', error);
    return null;
  }
}

/**
 * Updates the current stage of a task and adds an activity to the activity feed
 * 
 * @param taskId The UUID of the task to update
 * @param newStage The new stage to set
 * @param actorId Optional UUID of the user who performed the stage change
 * @returns The updated task or null if there was an error
 */
export async function updateTaskStage(
  taskId: string,
  newStage: string,
  actorId?: string
): Promise<Database['public']['Tables']['tasks']['Row'] | null> {
  try {
    // First, get the current stage of the task
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('current_stage')
      .eq('id', taskId)
      .single();
    
    if (fetchError || !currentTask) {
      console.error('Error fetching current task stage:', fetchError);
      return null;
    }
    
    const currentStage = currentTask.current_stage;
    
    // Update the task stage
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({ 
        current_stage: newStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();
    
    if (updateError || !updatedTask) {
      console.error('Error updating task stage:', updateError);
      return null;
    }
    
    // Add activity for the stage change
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
    
    return updatedTask;
  } catch (error) {
    console.error('Error updating task stage:', error);
    return null;
  }
}

/**
 * Creates a new task in the database
 * 
 * @param taskData The task data to insert
 * @returns The newly created task or null if there was an error
 */
export async function createTask(
  taskData: Database['public']['Tables']['tasks']['Insert']
): Promise<Database['public']['Tables']['tasks']['Row'] | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    
    // Add activity for task creation
    await addTaskActivity(
      data.id,
      'TASK_CREATED',
      {
        milestone_id: data.milestone_id,
        parent_task_id: data.parent_task_id,
        timestamp: new Date().toISOString()
      }
    );
    
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

/**
 * Updates an existing task in the database
 * 
 * @param taskId The UUID of the task to update
 * @param taskData The updated task data
 * @returns The updated task or null if there was an error
 */
export async function updateTask(
  taskId: string,
  taskData: Partial<Database['public']['Tables']['tasks']['Update']>
): Promise<Database['public']['Tables']['tasks']['Row'] | null> {
  try {
    // Make sure updated_at is set
    if (!taskData.updated_at) {
      taskData.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return null;
    }
    
    // Add activity for task update
    await addTaskActivity(
      taskId,
      'TASK_UPDATED',
      {
        updated_fields: Object.keys(taskData),
        timestamp: new Date().toISOString()
      }
    );
    
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

/**
 * Retrieves all workspaces from the database
 * 
 * @returns An array of workspaces or null if there was an error
 */
export async function getWorkspaces(): Promise<Database['public']['Tables']['workspaces']['Row'][] | null> {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching workspaces:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return null;
  }
}

/**
 * Retrieves all projects for a workspace
 * 
 * @param workspaceId The UUID of the workspace to get projects for
 * @returns An array of projects or null if there was an error
 */
export async function getProjects(workspaceId: string): Promise<Database['public']['Tables']['projects']['Row'][] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');
    
    if (error) {
      console.error('Error fetching projects:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

/**
 * Retrieves all milestones for a project
 * 
 * @param projectId The UUID of the project to get milestones for
 * @returns An array of milestones or null if there was an error
 */
export async function getMilestones(projectId: string): Promise<Database['public']['Tables']['milestones']['Row'][] | null> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error('Error fetching milestones:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return null;
  }
}

/**
 * Retrieves all tasks for a milestone
 * 
 * @param milestoneId The UUID of the milestone to get tasks for
 * @returns An array of tasks or null if there was an error
 */
export async function getTasks(milestoneId: string): Promise<Database['public']['Tables']['tasks']['Row'][] | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('milestone_id', milestoneId)
      .order('title');
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
}

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
