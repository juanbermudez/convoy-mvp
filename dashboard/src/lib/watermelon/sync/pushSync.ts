import { supabase } from '@/lib/supabase/client';
import database from '../database';
import { findRemoteId } from './idMapping';
import SyncLog from '../models/syncLog';
import { Q } from '@nozbe/watermelondb';

/**
 * Push changes from WatermelonDB to Supabase
 */
export async function pushChanges(): Promise<boolean> {
  try {
    console.log('Starting push sync...');
    
    // Push data in the correct order to maintain relationships
    await pushTasks();
    await pushActivities();
    
    console.log('Push sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error during push sync:', error);
    return false;
  }
}

/**
 * Push task changes to Supabase
 */
async function pushTasks(): Promise<void> {
  try {
    // Get tasks that need to be synced
    const tasksToSync = await database.get('tasks').query(
      Q.where('is_synced', false)
    ).fetch();
    
    if (tasksToSync.length === 0) {
      console.log('No tasks to push');
      return;
    }
    
    console.log(`Pushing ${tasksToSync.length} tasks...`);
    
    for (const task of tasksToSync) {
      try {
        // Check if this is a new task or an update
        const remoteId = task.remoteId;
        
        if (remoteId) {
          // Get remote IDs for related entities
          const milestonRemoteId = await findRemoteId('milestones', task.milestoneId);
          const parentTaskRemoteId = task.parentTaskId ? 
            await findRemoteId('tasks', task.parentTaskId) : null;
          
          if (!milestonRemoteId) {
            console.warn(`Cannot find remote milestone for task ${task.id}`);
            task.update(record => {
              record.syncStatus = 'error';
            });
            continue;
          }
          
          // Update existing task
          const { error } = await supabase
            .from('tasks')
            .update({
              milestone_id: milestonRemoteId,
              parent_task_id: parentTaskRemoteId,
              title: task.title,
              description: task.description,
              current_stage: task.currentStage,
              status: task.status,
              completion_date: task.completionDate ? 
                new Date(task.completionDate).toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', remoteId);
          
          if (error) {
            throw error;
          }
          
          // Update task sync status
          await database.write(async () => {
            await task.update(record => {
              record.isSynced = true;
              record.syncStatus = 'synced';
            });
          });
          
          await SyncLog.success(database, 'push-update', 'task', remoteId);
        } else {
          // Get remote IDs for related entities
          const milestoneRemoteId = await findRemoteId('milestones', task.milestoneId);
          const parentTaskRemoteId = task.parentTaskId ? 
            await findRemoteId('tasks', task.parentTaskId) : null;
          
          if (!milestoneRemoteId) {
            console.warn(`Cannot find remote milestone for task ${task.id}`);
            task.update(record => {
              record.syncStatus = 'error';
            });
            continue;
          }
          
          // Create new task
          const { data, error } = await supabase
            .from('tasks')
            .insert({
              milestone_id: milestoneRemoteId,
              parent_task_id: parentTaskRemoteId,
              title: task.title,
              description: task.description,
              current_stage: task.currentStage,
              status: task.status,
              completion_date: task.completionDate ? 
                new Date(task.completionDate).toISOString() : null,
              created_at: new Date(task.createdAt).toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) {
            throw error;
          }
          
          // Update task with remote ID
          await database.write(async () => {
            await task.update(record => {
              record.remoteId = data.id;
              record.isSynced = true;
              record.syncStatus = 'synced';
            });
          });
          
          await SyncLog.success(database, 'push-create', 'task', data.id);
        }
      } catch (taskError) {
        console.error(`Error pushing task ${task.id}:`, taskError);
        await SyncLog.failure(database, 'push', 'task', task.id, taskError);
        
        // Update task sync status
        await database.write(async () => {
          await task.update(record => {
            record.syncStatus = 'error';
          });
        });
      }
    }
    
    console.log('Tasks push completed');
  } catch (error) {
    console.error('Error pushing tasks:', error);
    throw error;
  }
}

/**
 * Push activity changes to Supabase
 */
async function pushActivities(): Promise<void> {
  try {
    // Get activities that need to be synced
    const activitiesToSync = await database.get('activity_feed').query(
      Q.where('is_synced', false)
    ).fetch();
    
    if (activitiesToSync.length === 0) {
      console.log('No activities to push');
      return;
    }
    
    console.log(`Pushing ${activitiesToSync.length} activities...`);
    
    for (const activity of activitiesToSync) {
      try {
        // Get remote ID for related task
        const taskRemoteId = await findRemoteId('tasks', activity.taskId);
        
        if (!taskRemoteId) {
          console.warn(`Cannot find remote task for activity ${activity.id}`);
          activity.update(record => {
            record.isSynced = false;
          });
          continue;
        }
        
        // Create new activity (activities are append-only)
        const { data, error } = await supabase
          .from('activity_feed')
          .insert({
            task_id: taskRemoteId,
            actor_id: activity.actorId,
            activity_type: activity.activityType,
            details: JSON.parse(activity.details || '{}'),
            created_at: new Date(activity.createdAt).toISOString()
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Update activity with remote ID
        await database.write(async () => {
          await activity.update(record => {
            record.remoteId = data.id;
            record.isSynced = true;
          });
        });
        
        await SyncLog.success(database, 'push-create', 'activity', data.id);
      } catch (activityError) {
        console.error(`Error pushing activity ${activity.id}:`, activityError);
        await SyncLog.failure(database, 'push', 'activity', activity.id, activityError);
      }
    }
    
    console.log('Activities push completed');
  } catch (error) {
    console.error('Error pushing activities:', error);
    throw error;
  }
}

/**
 * Queue an offline operation for later synchronization
 * @param operationType The type of operation (create, update, delete)
 * @param tableName The table name
 * @param record The record to sync
 * @param changes The changes to apply (for update operations)
 */
export async function queueOfflineOperation(
  operationType: 'create' | 'update' | 'delete',
  tableName: string,
  record: any,
  changes?: any
): Promise<void> {
  try {
    // For create/update operations, mark the record as not synced
    if (operationType === 'create' || operationType === 'update') {
      if (record.update) {
        await database.write(async () => {
          await record.update(r => {
            r.isSynced = false;
            r.syncStatus = 'pending';
          });
        });
      }
    }
    
    // For delete operations, we'll need to implement a separate queue
    if (operationType === 'delete') {
      // For this initial implementation, we're only handling create/update
      console.warn('Delete operations not implemented in offline queue');
    }
    
    // Log the operation
    await SyncLog.success(
      database, 
      `queue-${operationType}`, 
      tableName, 
      record.id
    );
  } catch (error) {
    console.error('Error queueing offline operation:', error);
    await SyncLog.failure(
      database, 
      `queue-${operationType}`, 
      tableName, 
      record.id,
      error
    );
  }
}
