import { supabase } from '@/lib/supabase/client';
import database from '../database';
import { findLocalId, createRemoteToLocalIdMap } from './idMapping';
import SyncLog from '../models/syncLog';

import {
  Workspace,
  Project,
  Milestone,
  Task,
  TaskDependency,
  ActivityFeed,
  Workflow,
  Pattern,
  BestPractice
} from '../models';

/**
 * Pull changes from Supabase to WatermelonDB
 * @param lastSyncDate The timestamp of the last successful sync
 */
export async function pullChanges(lastSyncDate: number): Promise<boolean> {
  try {
    console.log('Starting pull sync...');
    const lastSyncDateISO = new Date(lastSyncDate).toISOString();
    
    // Pull data in the correct order to maintain relationships
    await pullWorkspaces(lastSyncDateISO);
    await pullProjects(lastSyncDateISO);
    await pullMilestones(lastSyncDateISO);
    await pullTasks(lastSyncDateISO);
    await pullTaskDependencies(lastSyncDateISO);
    await pullActivities(lastSyncDateISO);
    await pullWorkflows(lastSyncDateISO);
    await pullPatterns(lastSyncDateISO);
    await pullBestPractices(lastSyncDateISO);
    
    console.log('Pull sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error during pull sync:', error);
    return false;
  }
}

/**
 * Pull workspaces from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullWorkspaces(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated workspaces from Supabase
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!workspaces || workspaces.length === 0) {
      console.log('No updated workspaces to pull');
      return;
    }
    
    console.log(`Pulling ${workspaces.length} workspaces...`);
    
    // Process each workspace
    await database.write(async () => {
      for (const workspace of workspaces) {
        try {
          // Check if the workspace already exists locally
          const localId = await findLocalId('workspaces', workspace.id);
          
          if (localId) {
            // Update existing workspace
            const localWorkspace = await database.get('workspaces').find(localId);
            await localWorkspace.update(record => {
              record.name = workspace.name;
              record.description = workspace.description;
              record.updatedAt = new Date(workspace.updated_at).getTime();
            });
            
            await SyncLog.success(database, 'pull-update', 'workspace', workspace.id);
          } else {
            // Create new workspace
            await database.get('workspaces').create(record => {
              record.name = workspace.name;
              record.description = workspace.description;
              record.createdAt = new Date(workspace.created_at).getTime();
              record.updatedAt = new Date(workspace.updated_at).getTime();
              record.remoteId = workspace.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'workspace', workspace.id);
          }
        } catch (workspaceError) {
          console.error(`Error processing workspace ${workspace.id}:`, workspaceError);
          await SyncLog.failure(database, 'pull', 'workspace', workspace.id, workspaceError);
        }
      }
    });
    
    console.log('Workspaces pull completed');
  } catch (error) {
    console.error('Error pulling workspaces:', error);
    throw error;
  }
}

/**
 * Pull projects from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullProjects(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated projects from Supabase
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!projects || projects.length === 0) {
      console.log('No updated projects to pull');
      return;
    }
    
    console.log(`Pulling ${projects.length} projects...`);
    
    // Get workspace ID mappings
    const workspaceIds = projects.map(project => project.workspace_id).filter(Boolean);
    const workspaceIdMap = await createRemoteToLocalIdMap('workspaces', workspaceIds);
    
    // Process each project
    await database.write(async () => {
      for (const project of projects) {
        try {
          // Skip if we can't map the workspace
          const localWorkspaceId = workspaceIdMap.get(project.workspace_id);
          if (!localWorkspaceId) {
            console.warn(`Cannot find local workspace for project ${project.id}`);
            continue;
          }
          
          // Check if the project already exists locally
          const localId = await findLocalId('projects', project.id);
          
          if (localId) {
            // Update existing project
            const localProject = await database.get('projects').find(localId);
            await localProject.update(record => {
              record.workspaceId = localWorkspaceId;
              record.name = project.name;
              record.description = project.description;
              record.overview = project.overview;
              record.techStack = JSON.stringify(project.tech_stack);
              record.status = project.status;
              record.updatedAt = new Date(project.updated_at).getTime();
            });
            
            await SyncLog.success(database, 'pull-update', 'project', project.id);
          } else {
            // Create new project
            await database.get('projects').create(record => {
              record.workspaceId = localWorkspaceId;
              record.name = project.name;
              record.description = project.description;
              record.overview = project.overview;
              record.techStack = JSON.stringify(project.tech_stack);
              record.status = project.status;
              record.createdAt = new Date(project.created_at).getTime();
              record.updatedAt = new Date(project.updated_at).getTime();
              record.remoteId = project.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'project', project.id);
          }
        } catch (projectError) {
          console.error(`Error processing project ${project.id}:`, projectError);
          await SyncLog.failure(database, 'pull', 'project', project.id, projectError);
        }
      }
    });
    
    console.log('Projects pull completed');
  } catch (error) {
    console.error('Error pulling projects:', error);
    throw error;
  }
}

/**
 * Pull milestones from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullMilestones(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated milestones from Supabase
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!milestones || milestones.length === 0) {
      console.log('No updated milestones to pull');
      return;
    }
    
    console.log(`Pulling ${milestones.length} milestones...`);
    
    // Get project ID mappings
    const projectIds = milestones.map(milestone => milestone.project_id).filter(Boolean);
    const projectIdMap = await createRemoteToLocalIdMap('projects', projectIds);
    
    // Process each milestone
    await database.write(async () => {
      for (const milestone of milestones) {
        try {
          // Skip if we can't map the project
          const localProjectId = projectIdMap.get(milestone.project_id);
          if (!localProjectId) {
            console.warn(`Cannot find local project for milestone ${milestone.id}`);
            continue;
          }
          
          // Check if the milestone already exists locally
          const localId = await findLocalId('milestones', milestone.id);
          
          if (localId) {
            // Update existing milestone
            const localMilestone = await database.get('milestones').find(localId);
            await localMilestone.update(record => {
              record.projectId = localProjectId;
              record.name = milestone.name;
              record.description = milestone.description;
              record.requirements = milestone.requirements;
              record.status = milestone.status;
              record.targetDate = milestone.target_date ? new Date(milestone.target_date).getTime() : null;
              record.updatedAt = new Date(milestone.updated_at).getTime();
            });
            
            await SyncLog.success(database, 'pull-update', 'milestone', milestone.id);
          } else {
            // Create new milestone
            await database.get('milestones').create(record => {
              record.projectId = localProjectId;
              record.name = milestone.name;
              record.description = milestone.description;
              record.requirements = milestone.requirements;
              record.status = milestone.status;
              record.targetDate = milestone.target_date ? new Date(milestone.target_date).getTime() : null;
              record.createdAt = new Date(milestone.created_at).getTime();
              record.updatedAt = new Date(milestone.updated_at).getTime();
              record.remoteId = milestone.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'milestone', milestone.id);
          }
        } catch (milestoneError) {
          console.error(`Error processing milestone ${milestone.id}:`, milestoneError);
          await SyncLog.failure(database, 'pull', 'milestone', milestone.id, milestoneError);
        }
      }
    });
    
    console.log('Milestones pull completed');
  } catch (error) {
    console.error('Error pulling milestones:', error);
    throw error;
  }
}

/**
 * Pull tasks from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullTasks(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated tasks from Supabase
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!tasks || tasks.length === 0) {
      console.log('No updated tasks to pull');
      return;
    }
    
    console.log(`Pulling ${tasks.length} tasks...`);
    
    // Get milestone ID mappings
    const milestoneIds = tasks.map(task => task.milestone_id).filter(Boolean);
    const milestoneIdMap = await createRemoteToLocalIdMap('milestones', milestoneIds);
    
    // Get parent task ID mappings
    const parentTaskIds = tasks.map(task => task.parent_task_id).filter(Boolean);
    const parentTaskIdMap = await createRemoteToLocalIdMap('tasks', parentTaskIds);
    
    // Process each task
    await database.write(async () => {
      for (const task of tasks) {
        try {
          // Skip if we can't map the milestone
          const localMilestoneId = milestoneIdMap.get(task.milestone_id);
          if (!localMilestoneId) {
            console.warn(`Cannot find local milestone for task ${task.id}`);
            continue;
          }
          
          // Map parent task ID if it exists
          const localParentTaskId = task.parent_task_id ? 
            parentTaskIdMap.get(task.parent_task_id) : null;
          
          // Check if the task already exists locally
          const localId = await findLocalId('tasks', task.id);
          
          if (localId) {
            // Update existing task
            const localTask = await database.get('tasks').find(localId);
            await localTask.update(record => {
              record.milestoneId = localMilestoneId;
              record.parentTaskId = localParentTaskId;
              record.title = task.title;
              record.description = task.description;
              record.currentStage = task.current_stage;
              record.status = task.status;
              record.completionDate = task.completion_date ? 
                new Date(task.completion_date).getTime() : null;
              record.updatedAt = new Date(task.updated_at).getTime();
              record.isSynced = true;
              record.syncStatus = 'synced';
            });
            
            await SyncLog.success(database, 'pull-update', 'task', task.id);
          } else {
            // Create new task
            await database.get('tasks').create(record => {
              record.milestoneId = localMilestoneId;
              record.parentTaskId = localParentTaskId;
              record.title = task.title;
              record.description = task.description;
              record.currentStage = task.current_stage;
              record.status = task.status;
              record.completionDate = task.completion_date ? 
                new Date(task.completion_date).getTime() : null;
              record.createdAt = new Date(task.created_at).getTime();
              record.updatedAt = new Date(task.updated_at).getTime();
              record.remoteId = task.id;
              record.isSynced = true;
              record.syncStatus = 'synced';
            });
            
            await SyncLog.success(database, 'pull-create', 'task', task.id);
          }
        } catch (taskError) {
          console.error(`Error processing task ${task.id}:`, taskError);
          await SyncLog.failure(database, 'pull', 'task', task.id, taskError);
        }
      }
    });
    
    console.log('Tasks pull completed');
  } catch (error) {
    console.error('Error pulling tasks:', error);
    throw error;
  }
}

/**
 * Pull task dependencies from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullTaskDependencies(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated task dependencies from Supabase
    const { data: dependencies, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .gt('created_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!dependencies || dependencies.length === 0) {
      console.log('No updated task dependencies to pull');
      return;
    }
    
    console.log(`Pulling ${dependencies.length} task dependencies...`);
    
    // Get task ID mappings
    const taskIds = [
      ...dependencies.map(dep => dep.task_id),
      ...dependencies.map(dep => dep.depends_on_task_id)
    ].filter(Boolean);
    
    const taskIdMap = await createRemoteToLocalIdMap('tasks', taskIds);
    
    // Process each dependency
    await database.write(async () => {
      for (const dependency of dependencies) {
        try {
          // Skip if we can't map the task IDs
          const localTaskId = taskIdMap.get(dependency.task_id);
          const localDependsOnTaskId = taskIdMap.get(dependency.depends_on_task_id);
          
          if (!localTaskId || !localDependsOnTaskId) {
            console.warn(`Cannot find local tasks for dependency ${dependency.id}`);
            continue;
          }
          
          // Check if the dependency already exists locally
          const localId = await findLocalId('task_dependencies', dependency.id);
          
          if (!localId) {
            // Only create if it doesn't exist (dependencies are immutable)
            await database.get('task_dependencies').create(record => {
              record.taskId = localTaskId;
              record.dependsOnTaskId = localDependsOnTaskId;
              record.createdAt = new Date(dependency.created_at).getTime();
              record.remoteId = dependency.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'task_dependency', dependency.id);
          }
        } catch (dependencyError) {
          console.error(`Error processing task dependency ${dependency.id}:`, dependencyError);
          await SyncLog.failure(database, 'pull', 'task_dependency', dependency.id, dependencyError);
        }
      }
    });
    
    console.log('Task dependencies pull completed');
  } catch (error) {
    console.error('Error pulling task dependencies:', error);
    throw error;
  }
}

/**
 * Pull activities from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullActivities(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated activities from Supabase
    const { data: activities, error } = await supabase
      .from('activity_feed')
      .select('*')
      .gt('created_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!activities || activities.length === 0) {
      console.log('No updated activities to pull');
      return;
    }
    
    console.log(`Pulling ${activities.length} activities...`);
    
    // Get task ID mappings
    const taskIds = activities.map(activity => activity.task_id).filter(Boolean);
    const taskIdMap = await createRemoteToLocalIdMap('tasks', taskIds);
    
    // Process each activity
    await database.write(async () => {
      for (const activity of activities) {
        try {
          // Skip if we can't map the task
          const localTaskId = taskIdMap.get(activity.task_id);
          if (!localTaskId) {
            console.warn(`Cannot find local task for activity ${activity.id}`);
            continue;
          }
          
          // Check if the activity already exists locally
          const localId = await findLocalId('activity_feed', activity.id);
          
          if (localId) {
            // Activities are generally immutable, but we'll update anyway just in case
            const localActivity = await database.get('activity_feed').find(localId);
            await localActivity.update(record => {
              record.taskId = localTaskId;
              record.actorId = activity.actor_id;
              record.activityType = activity.activity_type;
              record.details = JSON.stringify(activity.details);
              record.isSynced = true;
            });
            
            await SyncLog.success(database, 'pull-update', 'activity', activity.id);
          } else {
            // Create new activity
            await database.get('activity_feed').create(record => {
              record.taskId = localTaskId;
              record.actorId = activity.actor_id;
              record.activityType = activity.activity_type;
              record.details = JSON.stringify(activity.details);
              record.createdAt = new Date(activity.created_at).getTime();
              record.remoteId = activity.id;
              record.isSynced = true;
            });
            
            await SyncLog.success(database, 'pull-create', 'activity', activity.id);
          }
        } catch (activityError) {
          console.error(`Error processing activity ${activity.id}:`, activityError);
          await SyncLog.failure(database, 'pull', 'activity', activity.id, activityError);
        }
      }
    });
    
    console.log('Activities pull completed');
  } catch (error) {
    console.error('Error pulling activities:', error);
    throw error;
  }
}

/**
 * Pull workflows from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullWorkflows(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated workflows from Supabase
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!workflows || workflows.length === 0) {
      console.log('No updated workflows to pull');
      return;
    }
    
    console.log(`Pulling ${workflows.length} workflows...`);
    
    // Process each workflow
    await database.write(async () => {
      for (const workflow of workflows) {
        try {
          // Check if the workflow already exists locally
          const localId = await findLocalId('workflows', workflow.id);
          
          if (localId) {
            // Update existing workflow
            const localWorkflow = await database.get('workflows').find(localId);
            await localWorkflow.update(record => {
              record.name = workflow.name;
              record.description = workflow.description;
              record.stages = JSON.stringify(workflow.stages);
              record.updatedAt = new Date(workflow.updated_at).getTime();
            });
            
            await SyncLog.success(database, 'pull-update', 'workflow', workflow.id);
          } else {
            // Create new workflow
            await database.get('workflows').create(record => {
              record.name = workflow.name;
              record.description = workflow.description;
              record.stages = JSON.stringify(workflow.stages);
              record.createdAt = new Date(workflow.created_at).getTime();
              record.updatedAt = new Date(workflow.updated_at).getTime();
              record.remoteId = workflow.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'workflow', workflow.id);
          }
        } catch (workflowError) {
          console.error(`Error processing workflow ${workflow.id}:`, workflowError);
          await SyncLog.failure(database, 'pull', 'workflow', workflow.id, workflowError);
        }
      }
    });
    
    console.log('Workflows pull completed');
  } catch (error) {
    console.error('Error pulling workflows:', error);
    throw error;
  }
}

/**
 * Pull patterns from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullPatterns(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated patterns from Supabase
    const { data: patterns, error } = await supabase
      .from('patterns')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!patterns || patterns.length === 0) {
      console.log('No updated patterns to pull');
      return;
    }
    
    console.log(`Pulling ${patterns.length} patterns...`);
    
    // Get workspace and project ID mappings
    const workspaceIds = patterns.map(pattern => pattern.workspace_id).filter(Boolean);
    const workspaceIdMap = await createRemoteToLocalIdMap('workspaces', workspaceIds);
    
    const projectIds = patterns.map(pattern => pattern.project_id).filter(Boolean);
    const projectIdMap = await createRemoteToLocalIdMap('projects', projectIds);
    
    // Process each pattern
    await database.write(async () => {
      for (const pattern of patterns) {
        try {
          // Map workspace and project IDs if they exist
          const localWorkspaceId = pattern.workspace_id ? 
            workspaceIdMap.get(pattern.workspace_id) : null;
          
          const localProjectId = pattern.project_id ? 
            projectIdMap.get(pattern.project_id) : null;
          
          // Skip if we can't map the parent entities
          if ((pattern.workspace_id && !localWorkspaceId) || 
              (pattern.project_id && !localProjectId)) {
            console.warn(`Cannot find local parent entities for pattern ${pattern.id}`);
            continue;
          }
          
          // Check if the pattern already exists locally
          const localId = await findLocalId('patterns', pattern.id);
          
          if (localId) {
            // Update existing pattern
            const localPattern = await database.get('patterns').find(localId);
            await localPattern.update(record => {
              record.workspaceId = localWorkspaceId;
              record.projectId = localProjectId;
              record.name = pattern.name;
              record.description = pattern.description;
              record.patternType = pattern.pattern_type;
              record.content = JSON.stringify(pattern.content);
              record.updatedAt = new Date(pattern.updated_at).getTime();
            });
            
            await SyncLog.success(database, 'pull-update', 'pattern', pattern.id);
          } else {
            // Create new pattern
            await database.get('patterns').create(record => {
              record.workspaceId = localWorkspaceId;
              record.projectId = localProjectId;
              record.name = pattern.name;
              record.description = pattern.description;
              record.patternType = pattern.pattern_type;
              record.content = JSON.stringify(pattern.content);
              record.createdAt = new Date(pattern.created_at).getTime();
              record.updatedAt = new Date(pattern.updated_at).getTime();
              record.remoteId = pattern.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'pattern', pattern.id);
          }
        } catch (patternError) {
          console.error(`Error processing pattern ${pattern.id}:`, patternError);
          await SyncLog.failure(database, 'pull', 'pattern', pattern.id, patternError);
        }
      }
    });
    
    console.log('Patterns pull completed');
  } catch (error) {
    console.error('Error pulling patterns:', error);
    throw error;
  }
}

/**
 * Pull best practices from Supabase
 * @param lastSyncDateISO ISO string of the last sync date
 */
async function pullBestPractices(lastSyncDateISO: string): Promise<void> {
  try {
    // Fetch updated best practices from Supabase
    const { data: bestPractices, error } = await supabase
      .from('best_practices')
      .select('*')
      .gt('updated_at', lastSyncDateISO);
    
    if (error) {
      throw error;
    }
    
    if (!bestPractices || bestPractices.length === 0) {
      console.log('No updated best practices to pull');
      return;
    }
    
    console.log(`Pulling ${bestPractices.length} best practices...`);
    
    // Get workspace and project ID mappings
    const workspaceIds = bestPractices.map(bp => bp.workspace_id).filter(Boolean);
    const workspaceIdMap = await createRemoteToLocalIdMap('workspaces', workspaceIds);
    
    const projectIds = bestPractices.map(bp => bp.project_id).filter(Boolean);
    const projectIdMap = await createRemoteToLocalIdMap('projects', projectIds);
    
    // Process each best practice
    await database.write(async () => {
      for (const bestPractice of bestPractices) {
        try {
          // Map workspace and project IDs if they exist
          const localWorkspaceId = bestPractice.workspace_id ? 
            workspaceIdMap.get(bestPractice.workspace_id) : null;
          
          const localProjectId = bestPractice.project_id ? 
            projectIdMap.get(bestPractice.project_id) : null;
          
          // Skip if we can't map the parent entities
          if ((bestPractice.workspace_id && !localWorkspaceId) || 
              (bestPractice.project_id && !localProjectId)) {
            console.warn(`Cannot find local parent entities for best practice ${bestPractice.id}`);
            continue;
          }
          
          // Check if the best practice already exists locally
          const localId = await findLocalId('best_practices', bestPractice.id);
          
          if (localId) {
            // Update existing best practice
            const localBestPractice = await database.get('best_practices').find(localId);
            await localBestPractice.update(record => {
              record.workspaceId = localWorkspaceId;
              record.projectId = localProjectId;
              record.name = bestPractice.name;
              record.description = bestPractice.description;
              record.category = bestPractice.category;
              record.content = JSON.stringify(bestPractice.content);
              record.updatedAt = new Date(bestPractice.updated_at).getTime();
            });
            
            await SyncLog.success(database, 'pull-update', 'best_practice', bestPractice.id);
          } else {
            // Create new best practice
            await database.get('best_practices').create(record => {
              record.workspaceId = localWorkspaceId;
              record.projectId = localProjectId;
              record.name = bestPractice.name;
              record.description = bestPractice.description;
              record.category = bestPractice.category;
              record.content = JSON.stringify(bestPractice.content);
              record.createdAt = new Date(bestPractice.created_at).getTime();
              record.updatedAt = new Date(bestPractice.updated_at).getTime();
              record.remoteId = bestPractice.id;
            });
            
            await SyncLog.success(database, 'pull-create', 'best_practice', bestPractice.id);
          }
        } catch (bestPracticeError) {
          console.error(`Error processing best practice ${bestPractice.id}:`, bestPracticeError);
          await SyncLog.failure(database, 'pull', 'best_practice', bestPractice.id, bestPracticeError);
        }
      }
    });
    
    console.log('Best practices pull completed');
  } catch (error) {
    console.error('Error pulling best practices:', error);
    throw error;
  }
}
