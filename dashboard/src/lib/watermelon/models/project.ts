import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation, children } from '@nozbe/watermelondb/decorators';

/**
 * Project model for WatermelonDB
 * Represents a project within a workspace
 */
export default class Project extends Model {
  static table = 'projects';
  
  static associations = {
    workspaces: { type: 'belongs_to', key: 'workspace_id' },
    milestones: { type: 'has_many', foreignKey: 'project_id' },
    patterns: { type: 'has_many', foreignKey: 'project_id' },
    best_practices: { type: 'has_many', foreignKey: 'project_id' },
  };

  @text('workspace_id') workspaceId;
  @text('name') name;
  @text('description') description;
  @text('overview') overview;
  @field('tech_stack') techStack;
  @text('status') status;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @text('remote_id') remoteId;

  @relation('workspaces', 'workspace_id') workspace;
  @children('milestones') milestones;
  @children('patterns') patterns;
  @children('best_practices') bestPractices;

  /**
   * Parse the tech stack from JSON string to object
   */
  get techStackObject() {
    if (!this.techStack) return {};
    try {
      return JSON.parse(this.techStack);
    } catch (error) {
      console.error('Error parsing tech stack:', error);
      return {};
    }
  }

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      workspace_id: this.workspaceId,
      name: this.name,
      description: this.description,
      overview: this.overview,
      tech_stack: this.techStackObject,
      status: this.status,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase project object to a WatermelonDB-compatible format
   * @param supabaseProject Project object from Supabase
   * @param localWorkspaceId Local workspace ID
   */
  static fromSupabase(supabaseProject, localWorkspaceId) {
    return {
      workspace_id: localWorkspaceId,
      name: supabaseProject.name,
      description: supabaseProject.description,
      overview: supabaseProject.overview,
      tech_stack: JSON.stringify(supabaseProject.tech_stack),
      status: supabaseProject.status,
      created_at: new Date(supabaseProject.created_at).getTime(),
      updated_at: new Date(supabaseProject.updated_at).getTime(),
      remote_id: supabaseProject.id,
    };
  }
}
