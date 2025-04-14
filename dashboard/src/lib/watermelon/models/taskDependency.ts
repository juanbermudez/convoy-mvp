import { Model } from '@nozbe/watermelondb';
import { text, date, relation } from '@nozbe/watermelondb/decorators';

/**
 * TaskDependency model for WatermelonDB
 * Represents a dependency between two tasks
 */
export default class TaskDependency extends Model {
  static table = 'task_dependencies';
  
  static associations = {
    tasks: { type: 'belongs_to', key: 'task_id' },
    depends_on_tasks: { type: 'belongs_to', key: 'depends_on_task_id' },
  };

  @text('task_id') taskId;
  @text('depends_on_task_id') dependsOnTaskId;
  @date('created_at') createdAt;
  @text('remote_id') remoteId;

  @relation('tasks', 'task_id') task;
  @relation('tasks', 'depends_on_task_id') dependsOnTask;

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      task_id: this.taskId,
      depends_on_task_id: this.dependsOnTaskId,
      created_at: new Date(this.createdAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase task dependency object to a WatermelonDB-compatible format
   * @param supabaseDependency Task dependency object from Supabase
   * @param localTaskId Local task ID
   * @param localDependsOnTaskId Local depends on task ID
   */
  static fromSupabase(supabaseDependency, localTaskId, localDependsOnTaskId) {
    return {
      task_id: localTaskId,
      depends_on_task_id: localDependsOnTaskId,
      created_at: new Date(supabaseDependency.created_at).getTime(),
      remote_id: supabaseDependency.id,
    };
  }
}
