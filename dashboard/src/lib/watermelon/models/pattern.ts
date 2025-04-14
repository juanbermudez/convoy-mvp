import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation } from '@nozbe/watermelondb/decorators';

/**
 * Pattern model for WatermelonDB
 * Represents a reusable implementation pattern
 */
export default class Pattern extends Model {
  static table = 'patterns';
  
  static associations = {
    workspaces: { type: 'belongs_to', key: 'workspace_id' },
    projects: { type: 'belongs_to', key: 'project_id' },
  };

  @text('workspace_id') workspaceId;
  @text('project_id') projectId;
  @text('name') name;
  @text('description') description;
  @text('pattern_type') patternType;
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
      console.error('Error parsing pattern content:', error);
      return {};
    }
  }

  /**
   * Get the scope of the pattern (global, workspace, or project)
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
      pattern_type: this.patternType,
      content: this.contentObject,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase pattern object to a WatermelonDB-compatible format
   * @param supabasePattern Pattern object from Supabase
   * @param localWorkspaceId Local workspace ID (optional)
   * @param localProjectId Local project ID (optional)
   */
  static fromSupabase(supabasePattern, localWorkspaceId = null, localProjectId = null) {
    return {
      workspace_id: localWorkspaceId,
      project_id: localProjectId,
      name: supabasePattern.name,
      description: supabasePattern.description,
      pattern_type: supabasePattern.pattern_type,
      content: JSON.stringify(supabasePattern.content),
      created_at: new Date(supabasePattern.created_at).getTime(),
      updated_at: new Date(supabasePattern.updated_at).getTime(),
      remote_id: supabasePattern.id,
    };
  }
}
