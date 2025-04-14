import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation } from '@nozbe/watermelondb/decorators';

/**
 * BestPractice model for WatermelonDB
 * Represents a best practice guideline
 */
export default class BestPractice extends Model {
  static table = 'best_practices';
  
  static associations = {
    workspaces: { type: 'belongs_to', key: 'workspace_id' },
    projects: { type: 'belongs_to', key: 'project_id' },
  };

  @text('workspace_id') workspaceId;
  @text('project_id') projectId;
  @text('name') name;
  @text('description') description;
  @text('category') category;
  @field('content') content;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @text('remote_id') remoteId;

  @relation('workspaces', 'workspace_id') workspace;
  @relation('projects', 'project_id') project;

  /**
   * Parse the content from JSON string to object
   */
  get contentObject() {
    if (!this.content) return {};
    try {
      return JSON.parse(this.content);
    } catch (error) {
      console.error('Error parsing best practice content:', error);
      return {};
    }
  }

  /**
   * Get the scope of the best practice (global, workspace, or project)
   */
  get scope() {
    if (this.workspaceId && !this.projectId) {
      return 'workspace';
    } else if (this.projectId && !this.workspaceId) {
      return 'project';
    } else {
      return 'global';
    }
  }

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      workspace_id: this.workspaceId,
      project_id: this.projectId,
      name: this.name,
      description: this.description,
      category: this.category,
      content: this.contentObject,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase best practice object to a WatermelonDB-compatible format
   * @param supabaseBestPractice Best practice object from Supabase
   * @param localWorkspaceId Local workspace ID (optional)
   * @param localProjectId Local project ID (optional)
   */
  static fromSupabase(supabaseBestPractice, localWorkspaceId = null, localProjectId = null) {
    return {
      workspace_id: localWorkspaceId,
      project_id: localProjectId,
      name: supabaseBestPractice.name,
      description: supabaseBestPractice.description,
      category: supabaseBestPractice.category,
      content: JSON.stringify(supabaseBestPractice.content),
      created_at: new Date(supabaseBestPractice.created_at).getTime(),
      updated_at: new Date(supabaseBestPractice.updated_at).getTime(),
      remote_id: supabaseBestPractice.id,
    };
  }
}
