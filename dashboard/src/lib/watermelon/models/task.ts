import { Model } from '@nozbe/watermelondb';
import { field, text, date, bool, relation, children } from '@nozbe/watermelondb/decorators';

/**
 * Task model for WatermelonDB
 * Represents a task within a milestone
 */
export default class Task extends Model {
  static table = 'tasks';
  
  static associations = {
    milestones: { type: 'belongs_to', key: 'milestone_id' },
    tasks: { type: 'belongs_to', key: 'parent_task_id' },
    subtasks: { type: 'has_many', foreignKey: 'parent_task_id' },
    activity_feed: { type: 'has_many', foreignKey: 'task_id' },
    task_dependencies: { type: 'has_many', foreignKey: 'task_id' },
  };

  @text('milestone_id') milestoneId;
  @text('parent_task_id') parentTaskId;
  @text('title') title;
  @text('description') description;
  @text('current_stage') currentStage;
  @text('status') status;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @date('completion_date') completionDate;
  @text('remote_id') remoteId;
  @bool('is_synced') isSynced;
  @text('sync_status') syncStatus;

  @relation('milestones', 'milestone_id') milestone;
  @relation('tasks', 'parent_task_id') parentTask;
  @children('tasks') subtasks;
  @children('activity_feed') activities;
  @children('task_dependencies') dependencies;

  /**
   * Get dependency tasks
   * This is a helper method to get the actual task objects that this task depends on
   */
  async getDependencyTasks() {
    const dependencies = await this.dependencies.fetch();
    const dependsOnTaskIds = dependencies.map((dep) => dep.dependsOnTaskId);
    
    if (dependsOnTaskIds.length === 0) {
      return [];
    }
    
    return this.collections.get('tasks').query(
      Q.where('id', Q.oneOf(dependsOnTaskIds))
    ).fetch();
  }

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      milestone_id: this.milestoneId,
      parent_task_id: this.parentTaskId,
      title: this.title,
      description: this.description,
      current_stage: this.currentStage,
      status: this.status,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
      completion_date: this.completionDate ? new Date(this.completionDate).toISOString() : null,
    };
  }

  /**
   * Convert a Supabase task object to a WatermelonDB-compatible format
   * @param supabaseTask Task object from Supabase
   * @param localMilestoneId Local milestone ID
   * @param localParentTaskId Local parent task ID (optional)
   */
  static fromSupabase(supabaseTask, localMilestoneId, localParentTaskId = null) {
    return {
      milestone_id: localMilestoneId,
      parent_task_id: localParentTaskId,
      title: supabaseTask.title,
      description: supabaseTask.description,
      current_stage: supabaseTask.current_stage,
      status: supabaseTask.status,
      created_at: new Date(supabaseTask.created_at).getTime(),
      updated_at: new Date(supabaseTask.updated_at).getTime(),
      completion_date: supabaseTask.completion_date ? new Date(supabaseTask.completion_date).getTime() : null,
      remote_id: supabaseTask.id,
      is_synced: true,
      sync_status: 'synced',
    };
  }
}

// Import Q for queries - needs to be after the class definition to avoid circular dependencies
import { Q } from '@nozbe/watermelondb';
