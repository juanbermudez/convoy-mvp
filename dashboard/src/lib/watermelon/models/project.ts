/**
 * Project Model
 * 
 * Represents a project in the Convoy data architecture.
 */

import { Model } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { Query, Q } from '@nozbe/watermelondb';

/**
 * Project model class
 */
export default class Project extends Model {
  /** Table name */
  static table = 'projects';
  
  /** Associations with other models */
  static associations: Associations = {
    workspace: { type: 'belongs_to', key: 'workspace_id' },
    workstreams: { type: 'has_many', foreignKey: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'project_id' }
  };
  
  /** Parent workspace ID */
  get workspaceId(): string { return this.getField('workspace_id') }
  set workspaceId(value: string) { this.setField('workspace_id', value) }
  
  /** Project name */
  get name(): string { return this.getField('name') }
  set name(value: string) { this.setField('name', value) }
  
  /** Optional project description */
  get description(): string | undefined { return this.getField('description') }
  set description(value: string | undefined) { this.setField('description', value) }
  
  /** Project status */
  get status(): string { return this.getField('status') }
  set status(value: string) { this.setField('status', value) }
  
  /** Optional target date (timestamp) */
  get targetDate(): number | undefined { return this.getField('target_date') }
  set targetDate(value: number | undefined) { this.setField('target_date', value) }
  
  /** Remote ID (UUID in Supabase) */
  get remoteId(): string | undefined { return this.getField('remote_id') }
  set remoteId(value: string | undefined) { this.setField('remote_id', value) }
  
  /** Creation timestamp */
  get createdAt(): Date { return new Date(this.getField('created_at')) }
  
  /** Last update timestamp */
  get updatedAt(): Date { return new Date(this.getField('updated_at')) }
  
  /** Parent workspace relation */
  get workspace() { 
    return this.collections.get('workspaces').findAndObserve(this.workspaceId) 
  }
  
  /** Workstreams in this project */
  get workstreams() { 
    return this.collections.get('workstreams').query(Q.where('project_id', this.id))
  }
  
  /** Tasks directly in this project */
  get tasks() { 
    return this.collections.get('tasks').query(Q.where('project_id', this.id))
  }
  
  /**
   * Prepare the project for sync with Supabase
   * @returns Object formatted for Supabase insert/update
   */
  prepareForSync(): Record<string, any> {
    return {
      id: this.remoteId || undefined,
      workspace_id: this.collections.get('workspaces')
        .findAndObserve(this.workspaceId)
        .remoteId,
      name: this.name,
      description: this.description || null,
      status: this.status,
      target_date: this.targetDate ? new Date(this.targetDate).toISOString() : null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
  
  /**
   * Update the project from Supabase data
   * 
   * @param remoteData Data from Supabase
   * @param workspaceMap Map of remote workspace IDs to local IDs
   * @returns Batch of update actions
   */
  updateFromRemote(
    remoteData: Record<string, any>,
    workspaceMap: Map<string, string>
  ): any[] {
    const localWorkspaceId = workspaceMap.get(remoteData.workspace_id);
    
    if (!localWorkspaceId) {
      throw new Error(
        `Cannot update project: workspace with remote ID ${remoteData.workspace_id} not found`
      );
    }
    
    return [
      this.prepareUpdate(project => {
        project.workspaceId = localWorkspaceId;
        project.name = remoteData.name;
        project.description = remoteData.description || undefined;
        project.status = remoteData.status;
        project.targetDate = remoteData.target_date 
          ? new Date(remoteData.target_date).getTime()
          : undefined;
        project.remoteId = remoteData.id;
      })
    ];
  }
}

// Need this import for Typescript
import Workspace from './workspace';
import { Relation } from '@nozbe/watermelondb';
