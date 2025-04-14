import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation, children } from '@nozbe/watermelondb/decorators';

/**
 * Milestone model for WatermelonDB
 * Represents a milestone within a project
 */
export default class Milestone extends Model {
  static table = 'milestones';
  
  static associations = {
    projects: { type: 'belongs_to', key: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'milestone_id' },
  };

  @text('project_id') projectId;
  @text('name') name;
  @text('description') description;
  @text('requirements') requirements;
  @text('status') status;
  @date('target_date') targetDate;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @text('remote_id') remoteId;

  @relation('projects', 'project_id') project;
  @children('tasks') tasks;

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      project_id: this.projectId,
      name: this.name,
      description: this.description,
      requirements: this.requirements,
      status: this.status,
      target_date: this.targetDate ? new Date(this.targetDate).toISOString() : null,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase milestone object to a WatermelonDB-compatible format
   * @param supabaseMilestone Milestone object from Supabase
   * @param localProjectId Local project ID
   */
  static fromSupabase(supabaseMilestone, localProjectId) {
    return {
      project_id: localProjectId,
      name: supabaseMilestone.name,
      description: supabaseMilestone.description,
      requirements: supabaseMilestone.requirements,
      status: supabaseMilestone.status,
      target_date: supabaseMilestone.target_date ? new Date(supabaseMilestone.target_date).getTime() : null,
      created_at: new Date(supabaseMilestone.created_at).getTime(),
      updated_at: new Date(supabaseMilestone.updated_at).getTime(),
      remote_id: supabaseMilestone.id,
    };
  }
}
