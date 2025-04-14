import { Model } from '@nozbe/watermelondb';
import { field, text, date, children } from '@nozbe/watermelondb/decorators';

/**
 * Workspace model for WatermelonDB
 * Represents a top-level organizational container
 */
export default class Workspace extends Model {
  static table = 'workspaces';
  
  static associations = {
    projects: { type: 'has_many', foreignKey: 'workspace_id' },
    patterns: { type: 'has_many', foreignKey: 'workspace_id' },
    best_practices: { type: 'has_many', foreignKey: 'workspace_id' },
  };

  @text('name') name;
  @text('description') description;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @text('remote_id') remoteId;

  @children('projects') projects;
  @children('patterns') patterns;
  @children('best_practices') bestPractices;

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      name: this.name,
      description: this.description,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase workspace object to a WatermelonDB-compatible format
   * @param supabaseWorkspace Workspace object from Supabase
   */
  static fromSupabase(supabaseWorkspace) {
    return {
      name: supabaseWorkspace.name,
      description: supabaseWorkspace.description,
      created_at: new Date(supabaseWorkspace.created_at).getTime(),
      updated_at: new Date(supabaseWorkspace.updated_at).getTime(),
      remote_id: supabaseWorkspace.id,
    };
  }
}
