/**
 * Workspace Model
 * 
 * Represents a workspace in the Convoy data architecture.
 */

import { Model } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { Query, Q } from '@nozbe/watermelondb';

/**
 * Workspace model class
 */
export default class Workspace extends Model {
  /** Table name */
  static table = 'workspaces';
  
  /** Associations with other models */
  static associations: Associations = {
    projects: { type: 'has_many', foreignKey: 'workspace_id' }
  };
  
  // Properties - these work with the generated getters/setters
  get name(): string { return this.getField('name') }
  set name(value: string) { return this.setField('name', value) }
  
  get description(): string | undefined { return this.getField('description') }
  set description(value: string | undefined) { return this.setField('description', value) }
  
  get remoteId(): string | undefined { return this.getField('remote_id') }
  set remoteId(value: string | undefined) { return this.setField('remote_id', value) }
  
  get createdAt(): Date { return new Date(this.getField('created_at')) }
  
  get updatedAt(): Date { return new Date(this.getField('updated_at')) }
  
  // Associations
  get projects(): Query { return this.collections.get('projects').query(Q.where('workspace_id', this.id)) }
  
  /**
   * Prepare the workspace for sync with Supabase
   * @returns Object formatted for Supabase insert/update
   */
  prepareForSync(): Record<string, any> {
    return {
      id: this.remoteId || undefined,
      name: this.name,
      description: this.description || null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
  
  /**
   * Update the workspace from Supabase data
   * 
   * @param remoteData Data from Supabase
   * @returns Batch of update actions
   */
  updateFromRemote(remoteData: Record<string, any>): any[] {
    return [
      this.prepareUpdate(workspace => {
        workspace.name = remoteData.name;
        workspace.description = remoteData.description || undefined;
        // Keep createdAt from local if it exists
        workspace.remoteId = remoteData.id;
      })
    ];
  }
}
