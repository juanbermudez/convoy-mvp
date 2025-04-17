/**
 * Workstream Model
 * 
 * Represents a workstream in the Convoy data architecture.
 */

import { Model } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { Query, Q } from '@nozbe/watermelondb';

/**
 * Workstream model class
 */
export default class Workstream extends Model {
  /** Table name */
  static table = 'workstreams';
  
  /** Associations with other models */
  static associations: Associations = {
    project: { type: 'belongs_to', key: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'workstream_id' }
  };
  
  /** Parent project ID */
  get projectId(): string { return this.getField('project_id') }
  set projectId(value: string) { this.setField('project_id', value) }
  
  /** Workstream name */
  get name(): string { return this.getField('name') }
  set name(value: string) { this.setField('name', value) }
  
  /** Optional workstream description */
  get description(): string | undefined { return this.getField('description') }
  set description(value: string | undefined) { this.setField('description', value) }
  
  /** Workstream status */
  get status(): string { return this.getField('status') }
  set status(value: string) { this.setField('status', value) }
  
  /** Progress (0-1 float) */
  get progress(): number { return this.getField('progress') }
  set progress(value: number) { this.setField('progress', value) }
  
  /** Optional owner ID */
  get ownerId(): string | undefined { return this.getField('owner_id') }
  set ownerId(value: string | undefined) { this.setField('owner_id', value) }
  
  /** Remote ID (UUID in Supabase) */
  get remoteId(): string | undefined { return this.getField('remote_id') }
  set remoteId(value: string | undefined) { this.setField('remote_id', value) }
  
  /** Creation timestamp */
  get createdAt(): Date { return new Date(this.getField('created_at')) }
  
  /** Last update timestamp */
  get updatedAt(): Date { return new Date(this.getField('updated_at')) }
  
  /** Parent project relation */
  get project() {
    return this.collections.get('projects').findAndObserve(this.projectId)
  }
  
  /** Tasks in this workstream */
  get tasks() {
    return this.collections.get('tasks').query(Q.where('workstream_id', this.id))
  }
  
  /**
   * Prepare the workstream for sync with Supabase
   * @returns Object formatted for Supabase insert/update
   */
  prepareForSync(): Record<string, any> {
    return {
      id: this.remoteId || undefined,
      project_id: this.collections.get('projects')
        .findAndObserve(this.projectId)
        .remoteId,
      name: this.name,
      description: this.description || null,
      status: this.status,
      progress: this.progress,
      owner_id: this.ownerId || null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
  
  /**
   * Update the workstream from Supabase data
   * 
   * @param remoteData Data from Supabase
   * @param projectMap Map of remote project IDs to local IDs
   * @returns Batch of update actions
   */
  updateFromRemote(
    remoteData: Record<string, any>,
    projectMap: Map<string, string>
  ): any[] {
    const localProjectId = projectMap.get(remoteData.project_id);
    
    if (!localProjectId) {
      throw new Error(
        `Cannot update workstream: project with remote ID ${remoteData.project_id} not found`
      );
    }
    
    return [
      this.prepareUpdate(workstream => {
        workstream.projectId = localProjectId;
        workstream.name = remoteData.name;
        workstream.description = remoteData.description || undefined;
        workstream.status = remoteData.status;
        workstream.progress = remoteData.progress;
        workstream.ownerId = remoteData.owner_id || undefined;
        workstream.remoteId = remoteData.id;
      })
    ];
  }
}

// Need this import for Typescript
import Project from './project';
import { Relation } from '@nozbe/watermelondb';
