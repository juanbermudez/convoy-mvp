/**
 * Context Retrieval Functions
 * 
 * This file contains high-level functions for retrieving context for different entity types.
 * These functions combine the relationship management and graph traversal utilities to provide
 * comprehensive context for AI agents and UI components.
 */

import { supabase } from '../supabase/client';
import {
  EntityType,
  RelationshipType,
  TaskContext,
  WorkstreamContext,
  ProjectContext,
  WorkspaceContext,
  RelationshipError,
  RelationshipErrorType
} from './types';
import { traverseUpward, traverseDownward, findRelatedTasks } from './graph-traversal';

/**
 * Get comprehensive context for a task
 * 
 * @param taskId ID of the task
 * @returns Task context including parent entities and related tasks
 */
export async function getTaskContext(taskId: string): Promise<TaskContext> {
  try {
    // Get the task data
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (taskError) {
      throw new RelationshipError(
        `Failed to get task data: ${taskError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: taskError }
      );
    }
    
    // Get parent entities using upward traversal
    const upwardResults = await traverseUpward(
      EntityType.TASK,
      taskId,
      {
        maxDepth: 3,
        includeEntityData: true
      }
    );
    
    // Extract parent entities from results
    let project = null;
    let workstream = null;
    let workspace = null;
    
    for (const result of upwardResults) {
      if (result.entity_type === EntityType.PROJECT && result.entity_data) {
        project = result.entity_data;
      } else if (result.entity_type === EntityType.WORKSTREAM && result.entity_data) {
        workstream = result.entity_data;
      } else if (result.entity_type === EntityType.WORKSPACE && result.entity_data) {
        workspace = result.entity_data;
      }
    }
    
    // Get related tasks
    const relatedTasksResult = await findRelatedTasks(taskId);
    
    // Assemble and return the context
    return {
      task,
      project,
      workstream,
      workspace,
      related_tasks: relatedTasksResult.relatedTasks,
      blocked_by_tasks: relatedTasksResult.blockedByTasks,
      blocking_tasks: relatedTasksResult.blockingTasks
    };
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Failed to get task context: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Get comprehensive context for a workstream
 * 
 * @param workstreamId ID of the workstream
 * @returns Workstream context including parent entities and tasks
 */
export async function getWorkstreamContext(workstreamId: string): Promise<WorkstreamContext> {
  try {
    // Get the workstream data
    const { data: workstream, error: workstreamError } = await supabase
      .from('workstreams')
      .select('*')
      .eq('id', workstreamId)
      .single();
    
    if (workstreamError) {
      throw new RelationshipError(
        `Failed to get workstream data: ${workstreamError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: workstreamError }
      );
    }
    
    // Get parent entities using upward traversal
    const upwardResults = await traverseUpward(
      EntityType.WORKSTREAM,
      workstreamId,
      {
        maxDepth: 2,
        includeEntityData: true
      }
    );
    
    // Extract parent entities from results
    let project = null;
    let workspace = null;
    
    for (const result of upwardResults) {
      if (result.entity_type === EntityType.PROJECT && result.entity_data) {
        project = result.entity_data;
      } else if (result.entity_type === EntityType.WORKSPACE && result.entity_data) {
        workspace = result.entity_data;
      }
    }
    
    // Get tasks in the workstream using downward traversal
    const downwardResults = await traverseDownward(
      EntityType.WORKSTREAM,
      workstreamId,
      {
        maxDepth: 1,
        includeEntityData: true,
        relationshipTypes: [RelationshipType.WORKSTREAM_CONTAINS_TASK],
        targetEntityTypes: [EntityType.TASK]
      }
    );
    
    // Extract tasks from results
    const tasks = downwardResults
      .filter(result => result.entity_type === EntityType.TASK && result.entity_data)
      .map(result => result.entity_data);
    
    // Assemble and return the context
    return {
      workstream,
      project,
      workspace,
      tasks
    };
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Failed to get workstream context: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Get comprehensive context for a project
 * 
 * @param projectId ID of the project
 * @returns Project context including parent workspace, workstreams, and tasks
 */
export async function getProjectContext(projectId: string): Promise<ProjectContext> {
  try {
    // Get the project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectError) {
      throw new RelationshipError(
        `Failed to get project data: ${projectError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: projectError }
      );
    }
    
    // Get parent workspace using upward traversal
    const upwardResults = await traverseUpward(
      EntityType.PROJECT,
      projectId,
      {
        maxDepth: 1,
        includeEntityData: true,
        relationshipTypes: [RelationshipType.PROJECT_BELONGS_TO_WORKSPACE],
        targetEntityTypes: [EntityType.WORKSPACE]
      }
    );
    
    // Extract workspace from results
    let workspace = null;
    
    for (const result of upwardResults) {
      if (result.entity_type === EntityType.WORKSPACE && result.entity_data) {
        workspace = result.entity_data;
        break;
      }
    }
    
    // Get workstreams in the project using downward traversal
    const workstreamResults = await traverseDownward(
      EntityType.PROJECT,
      projectId,
      {
        maxDepth: 1,
        includeEntityData: true,
        relationshipTypes: [RelationshipType.PROJECT_CONTAINS_WORKSTREAM],
        targetEntityTypes: [EntityType.WORKSTREAM]
      }
    );
    
    // Extract workstreams from results
    const workstreams = workstreamResults
      .filter(result => result.entity_type === EntityType.WORKSTREAM && result.entity_data)
      .map(result => result.entity_data);
    
    // Get tasks in the project using downward traversal
    const taskResults = await traverseDownward(
      EntityType.PROJECT,
      projectId,
      {
        maxDepth: 1,
        includeEntityData: true,
        relationshipTypes: [RelationshipType.PROJECT_CONTAINS_TASK],
        targetEntityTypes: [EntityType.TASK]
      }
    );
    
    // Extract tasks from results
    const tasks = taskResults
      .filter(result => result.entity_type === EntityType.TASK && result.entity_data)
      .map(result => result.entity_data);
    
    // Assemble and return the context
    return {
      project,
      workspace,
      workstreams,
      tasks
    };
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Failed to get project context: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Get comprehensive context for a workspace
 * 
 * @param workspaceId ID of the workspace
 * @returns Workspace context including projects, workstreams, and tasks
 */
export async function getWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
  try {
    // Get the workspace data
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
    
    if (workspaceError) {
      throw new RelationshipError(
        `Failed to get workspace data: ${workspaceError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: workspaceError }
      );
    }
    
    // Get projects in the workspace using downward traversal
    const projectResults = await traverseDownward(
      EntityType.WORKSPACE,
      workspaceId,
      {
        maxDepth: 1,
        includeEntityData: true,
        relationshipTypes: [RelationshipType.WORKSPACE_CONTAINS_PROJECT],
        targetEntityTypes: [EntityType.PROJECT]
      }
    );
    
    // Extract projects from results
    const projects = projectResults
      .filter(result => result.entity_type === EntityType.PROJECT && result.entity_data)
      .map(result => result.entity_data);
    
    // Get workstreams and tasks using a second level of traversal
    let workstreams: any[] = [];
    let tasks: any[] = [];
    
    // For each project, get its workstreams and tasks
    for (const project of projects) {
      // Get workstreams
      const workstreamResults = await traverseDownward(
        EntityType.PROJECT,
        project.id,
        {
          maxDepth: 1,
          includeEntityData: true,
          relationshipTypes: [RelationshipType.PROJECT_CONTAINS_WORKSTREAM],
          targetEntityTypes: [EntityType.WORKSTREAM]
        }
      );
      
      workstreams = [
        ...workstreams,
        ...workstreamResults
          .filter(result => result.entity_type === EntityType.WORKSTREAM && result.entity_data)
          .map(result => result.entity_data)
      ];
      
      // Get tasks
      const taskResults = await traverseDownward(
        EntityType.PROJECT,
        project.id,
        {
          maxDepth: 1,
          includeEntityData: true,
          relationshipTypes: [RelationshipType.PROJECT_CONTAINS_TASK],
          targetEntityTypes: [EntityType.TASK]
        }
      );
      
      tasks = [
        ...tasks,
        ...taskResults
          .filter(result => result.entity_type === EntityType.TASK && result.entity_data)
          .map(result => result.entity_data)
      ];
    }
    
    // Assemble and return the context
    return {
      workspace,
      projects,
      workstreams,
      tasks
    };
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Failed to get workspace context: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Get all contexts for AI
 * 
 * This function retrieves all context information needed for AI context
 * understanding, including workspaces, projects, workstreams, and tasks.
 * 
 * @returns Object with all contexts
 */
export async function getAllContexts(): Promise<{
  workspaces: any[];
  projects: any[];
  workstreams: any[];
  tasks: any[];
}> {
  try {
    // Get all workspaces
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*');
    
    if (workspacesError) {
      throw new RelationshipError(
        `Failed to get workspaces: ${workspacesError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: workspacesError }
      );
    }
    
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      throw new RelationshipError(
        `Failed to get projects: ${projectsError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: projectsError }
      );
    }
    
    // Get all workstreams
    const { data: workstreams, error: workstreamsError } = await supabase
      .from('workstreams')
      .select('*');
    
    if (workstreamsError) {
      throw new RelationshipError(
        `Failed to get workstreams: ${workstreamsError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: workstreamsError }
      );
    }
    
    // Get all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      throw new RelationshipError(
        `Failed to get tasks: ${tasksError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: tasksError }
      );
    }
    
    // Get all relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('relationships')
      .select('*');
    
    if (relationshipsError) {
      throw new RelationshipError(
        `Failed to get relationships: ${relationshipsError.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error: relationshipsError }
      );
    }
    
    // Enrich entities with their relationships for faster context access
    const enrichedTasks = tasks.map(task => {
      const taskRelationships = relationships.filter(
        rel => (rel.source_type === EntityType.TASK && rel.source_id === task.id) ||
              (rel.target_type === EntityType.TASK && rel.target_id === task.id)
      );
      
      return {
        ...task,
        relationships: taskRelationships
      };
    });
    
    return {
      workspaces,
      projects,
      workstreams,
      tasks: enrichedTasks
    };
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Failed to get all contexts: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}
