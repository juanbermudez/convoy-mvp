import { Model } from '@nozbe/watermelondb';
import { field, text, date, bool, relation } from '@nozbe/watermelondb/decorators';

/**
 * ActivityFeed model for WatermelonDB
 * Represents an activity in a task's activity feed
 */
export default class ActivityFeed extends Model {
  static table = 'activity_feed';
  
  static associations = {
    tasks: { type: 'belongs_to', key: 'task_id' },
  };

  @text('task_id') taskId;
  @text('actor_id') actorId;
  @text('activity_type') activityType;
  @field('details') details;
  @date('created_at') createdAt;
  @text('remote_id') remoteId;
  @bool('is_synced') isSynced;

  @relation('tasks', 'task_id') task;

  /**
   * Parse the details from JSON string to object
   */
  get detailsObject() {
    if (!this.details) return {};
    try {
      return JSON.parse(this.details);
    } catch (error) {
      console.error('Error parsing activity details:', error);
      return {};
    }
  }

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      task_id: this.taskId,
      actor_id: this.actorId,
      activity_type: this.activityType,
      details: this.detailsObject,
      created_at: new Date(this.createdAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase activity object to a WatermelonDB-compatible format
   * @param supabaseActivity Activity object from Supabase
   * @param localTaskId Local task ID
   */
  static fromSupabase(supabaseActivity, localTaskId) {
    return {
      task_id: localTaskId,
      actor_id: supabaseActivity.actor_id,
      activity_type: supabaseActivity.activity_type,
      details: JSON.stringify(supabaseActivity.details),
      created_at: new Date(supabaseActivity.created_at).getTime(),
      remote_id: supabaseActivity.id,
      is_synced: true,
    };
  }
}
