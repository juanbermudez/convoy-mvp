import { supabase } from './client';
import type { Database } from './types';
import { addTaskActivity } from './contextService';

// Types for inserting and updating workspace data
type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert'];
type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update'];

// Types for inserting and updating project data
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

// Types for inserting and updating milestone data
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
type MilestoneUpdate = Database['public']['Tables']['milestones']['Update'];

// Types for inserting and updating task data
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

/**
 * Creates a new workspace
 * @param workspace The workspace data to insert
 * @returns The newly created workspace or null if there was an error
 */
export async function createWorkspace(workspace: WorkspaceInsert) {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .insert(workspace)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating workspace:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating workspace:', error);
    return null;
  }
}

/**
 * Updates an existing workspace
 * @param id The UUID of the workspace to update
 * @param workspace The updated workspace data
 * @returns The updated workspace or null if there was an error
 */
export async function updateWorkspace(id: string, workspace: WorkspaceUpdate) {
  try {
    // Make sure updated_at is set
    if (!workspace.updated_at) {
      workspace.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('workspaces')
      .update(workspace)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating workspace:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return null;
  }
}

/**
 * Deletes a workspace and all of its associated data
 * @param id The UUID of the workspace to delete
 * @returns True if the workspace was deleted successfully, false otherwise
 */
export async function deleteWorkspace(id: string) {
  try {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting workspace:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
}

/**
 * Creates a new project
 * @param project The project data to insert
 * @returns The newly created project or null if there was an error
 */
export async function createProject(project: ProjectInsert) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

/**
 * Updates an existing project
 * @param id The UUID of the project to update
 * @param project The updated project data
 * @returns The updated project or null if there was an error
 */
export async function updateProject(id: string, project: ProjectUpdate) {
  try {
    // Make sure updated_at is set
    if (!project.updated_at) {
      project.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
}

/**
 * Deletes a project and all of its associated data
 * @param id The UUID of the project to delete
 * @returns True if the project was deleted successfully, false otherwise
 */
export async function deleteProject(id: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

/**
 * Creates a new milestone
 * @param milestone The milestone data to insert
 * @returns The newly created milestone or null if there was an error
 */
export async function createMilestone(milestone: MilestoneInsert) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating milestone:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating milestone:', error);
    return null;
  }
}

/**
 * Updates an existing milestone
 * @param id The UUID of the milestone to update
 * @param milestone The updated milestone data
 * @returns The updated milestone or null if there was an error
 */
export async function updateMilestone(id: string, milestone: MilestoneUpdate) {
  try {
    // Make sure updated_at is set
    if (!milestone.updated_at) {
      milestone.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('milestones')
      .update(milestone)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating milestone:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating milestone:', error);
    return null;
  }
}

/**
 * Deletes a milestone and all of its associated data
 * @param id The UUID of the milestone to delete
 * @returns True if the milestone was deleted successfully, false otherwise
 */
export async function deleteMilestone(id: string) {
  try {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting milestone:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return false;
  }
}

/**
 * Creates a new task with an initial activity log entry
 * @param task The task data to insert
 * @returns The newly created task or null if there was an error
 */
export async function createTaskWithActivity(task: TaskInsert) {
  try {
    // Create the task
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
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
    console.error('Error creating task with activity:', error);
    return null;
  }
}

/**
 * Add a dependency between two tasks
 * @param taskId The UUID of the task that depends on another
 * @param dependsOnTaskId The UUID of the task that is depended upon
 * @returns True if the dependency was added successfully, false otherwise
 */
export async function addTaskDependency(taskId: string, dependsOnTaskId: string) {
  try {
    const { error } = await supabase
      .from('task_dependencies')
      .insert({
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId
      });
    
    if (error) {
      console.error('Error adding task dependency:', error);
      return false;
    }
    
    // Add activity for dependency creation
    await addTaskActivity(
      taskId,
      'DEPENDENCY_ADDED',
      {
        depends_on_task_id: dependsOnTaskId,
        timestamp: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error adding task dependency:', error);
    return false;
  }
}

/**
 * Remove a dependency between two tasks
 * @param taskId The UUID of the task that depends on another
 * @param dependsOnTaskId The UUID of the task that is depended upon
 * @returns True if the dependency was removed successfully, false otherwise
 */
export async function removeTaskDependency(taskId: string, dependsOnTaskId: string) {
  try {
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .match({
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId
      });
    
    if (error) {
      console.error('Error removing task dependency:', error);
      return false;
    }
    
    // Add activity for dependency removal
    await addTaskActivity(
      taskId,
      'DEPENDENCY_REMOVED',
      {
        depends_on_task_id: dependsOnTaskId,
        timestamp: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error removing task dependency:', error);
    return false;
  }
}

/**
 * Get a list of all workflows
 * @returns An array of workflows or null if there was an error
 */
export async function getWorkflows() {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching workflows:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return null;
  }
}

/**
 * Get a workflow by ID
 * @param id The UUID of the workflow to retrieve
 * @returns The workflow or null if there was an error or it doesn't exist
 */
export async function getWorkflowById(id: string) {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return null;
  }
}

/**
 * Get all patterns for a workspace, project, or global patterns
 * @param workspaceId Optional workspace ID to filter by
 * @param projectId Optional project ID to filter by
 * @returns An array of patterns or null if there was an error
 */
export async function getPatterns(workspaceId?: string, projectId?: string) {
  try {
    let query = supabase
      .from('patterns')
      .select('*');
    
    if (workspaceId && projectId) {
      // Get patterns for workspace, project, and global
      query = query.or(`workspace_id.eq.${workspaceId},project_id.eq.${projectId},workspace_id.is.null,project_id.is.null`);
    } else if (workspaceId) {
      // Get patterns for workspace and global
      query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null,project_id.is.null`);
    } else if (projectId) {
      // Get patterns for project and global
      query = query.or(`project_id.eq.${projectId},workspace_id.is.null,project_id.is.null`);
    } else {
      // Get only global patterns
      query = query.is('workspace_id', null).is('project_id', null);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching patterns:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return null;
  }
}

/**
 * Get all best practices for a workspace, project, or global best practices
 * @param workspaceId Optional workspace ID to filter by
 * @param projectId Optional project ID to filter by
 * @returns An array of best practices or null if there was an error
 */
export async function getBestPractices(workspaceId?: string, projectId?: string) {
  try {
    let query = supabase
      .from('best_practices')
      .select('*');
    
    if (workspaceId && projectId) {
      // Get best practices for workspace, project, and global
      query = query.or(`workspace_id.eq.${workspaceId},project_id.eq.${projectId},workspace_id.is.null,project_id.is.null`);
    } else if (workspaceId) {
      // Get best practices for workspace and global
      query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null,project_id.is.null`);
    } else if (projectId) {
      // Get best practices for project and global
      query = query.or(`project_id.eq.${projectId},workspace_id.is.null,project_id.is.null`);
    } else {
      // Get only global best practices
      query = query.is('workspace_id', null).is('project_id', null);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching best practices:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching best practices:', error);
    return null;
  }
}

/**
 * Create a new pattern
 * @param pattern The pattern data to insert
 * @returns The newly created pattern or null if there was an error
 */
export async function createPattern(pattern: Database['public']['Tables']['patterns']['Insert']) {
  try {
    const { data, error } = await supabase
      .from('patterns')
      .insert(pattern)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating pattern:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating pattern:', error);
    return null;
  }
}

/**
 * Create a new best practice
 * @param bestPractice The best practice data to insert
 * @returns The newly created best practice or null if there was an error
 */
export async function createBestPractice(bestPractice: Database['public']['Tables']['best_practices']['Insert']) {
  try {
    const { data, error } = await supabase
      .from('best_practices')
      .insert(bestPractice)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating best practice:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating best practice:', error);
    return null;
  }
}

// Export a default object with all functions
export default {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createProject,
  updateProject,
  deleteProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  createTaskWithActivity,
  addTaskDependency,
  removeTaskDependency,
  getWorkflows,
  getWorkflowById,
  getPatterns,
  getBestPractices,
  createPattern,
  createBestPractice
};
