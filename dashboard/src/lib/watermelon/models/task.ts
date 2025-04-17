/**
 * Task Model
 * 
 * Represents a task in the Convoy data architecture.
 */

import { Model } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { Q } from '@nozbe/watermelondb';

/**
 * Task model class
 */
export default class Task extends Model {
  /** Table name */
  static table = 'tasks';
  
  /** Associations with other models */
  static associations: Associations = {
    project: { type: 'belongs_to', key: 'project_id' },
    workstream: { type: 'belongs_to', key: 'workstream_id' }
  };
  
  /** Parent project ID */
  get projectId(): string { return this.getField('project_id') }
  set projectId(value: string) { this.setField('project_id', value) }
  
  /** Optional parent workstream ID */
  get workstreamId(): string | undefined { return this.getField('workstream_id') }
  set workstreamId(value: string | undefined) { this.setField('workstream_id', value) }
  
  /** Task title */
  get title(): string { return this.getField('title') }
  set title(value: string) { this.setField('title', value) }
  
  /** Optional task description */
  get description(): string | undefined { return this.getField('description') }
  set description(value: string | undefined) { this.setField('description', value) }
  
  /** Task status */
  get status(): string { return this.getField('status') }
  set status(value: string) { this.setField('status', value) }
  
  /** Task priority */
  get priority(): string { return this.getField('priority') }
  set priority(value: string) { this.setField('priority', value) }
  
  /** Optional owner ID */
  get ownerId(): string | undefined { return this.getField('owner_id') }
  set ownerId(value: string | undefined) { this.setField('owner_id', value) }
  
  /** Labels (JSON string) */
  get labelsJson(): string { return this.getField('labels') }
  set labelsJson(value: string) { this.setField('labels', value) }
  
  /** Relationships reference (JSON string) */
  get relationshipsJson(): string { return this.getField('relationships_json') }
  set relationshipsJson(value: string) { this.setField('relationships_json', value) }
  
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
  
  /** Optional parent workstream relation */
  get workstream() {
    return this.workstreamId 
      ? this.collections.get('workstreams').findAndObserve(this.workstreamId)
      : null
  }
  
  /** 
   * Get parsed labels
   */
  get labels(): string[] {
    try {
      return JSON.parse(this.labelsJson);
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Set labels
   */
  set labels(labels: string[]) {
    this.labelsJson = JSON.stringify(labels);
  }
  
  /**
   * Get parsed relationships reference
   */
  get relationships(): Record<string, any> {
    try {
      return JSON.parse(this.relationshipsJson);
    } catch (error) {
      return {};
    }
  }
  
  /**
   * Set relationships reference
   */
  set relationships(relationships: Record<string, any>) {
    this.relationshipsJson = JSON.stringify(relationships);
  }
  
  /**
   * Get tasks that are blocked by this task (lazy query)
   */
  get blockingTasks() {
    return this.collections
      .get('relationships')
      .query(
        Q.where('source_type', 'task'),
        Q.where('source_id', this.id),
        Q.where('relationship_type', 'task_blocks')
      )
  }
  
  /**
   * Get tasks that block this task (lazy query)
   */
  get blockedByTasks() {
    return this.collections
      .get('relationships')
      .query(
        Q.where('source_type', 'task'),
        Q.where('source_id', this.id),
        Q.where('relationship_type', 'task_blocked_by')
      )
  }
  
  /**
   * Get tasks that are related to this task (lazy query)
   */
  get relatedTasks() {
    return this.collections
      .get('relationships')
      .query(
        Q.where('source_type', 'task'),
        Q.where('source_id', this.id),
        Q.where('relationship_type', 'task_related_to')
      )
  }
  
  /**
   * Prepare the task for sync with Supabase
   * @returns Object formatted for Supabase insert/update
   */
  prepareForSync(): Record<string, any> {
    return {
      id: this.remoteId || undefined,
      project_id: this.collections.get('projects')
        .findAndObserve(this.projectId)
        .remoteId,
      workstream_id: this.workstreamId
        ? this.collections.get('workstreams')
            .findAndObserve(this.workstreamId)
            .remoteId
        : null,
      title: this.title,
      description: this.description || null,
      status: this.status,
      priority: this.priority,
      owner_id: this.ownerId || null,
      labels: JSON.parse(this.labelsJson),
      relationships: JSON.parse(this.relationshipsJson),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
  
  /**
   * Update the task from Supabase data
   * 
   * @param remoteData Data from Supabase
   * @param projectMap Map of remote project IDs to local IDs
   * @param workstreamMap Map of remote workstream IDs to local IDs
   * @returns Batch of update actions
   */
  updateFromRemote(
    remoteData: Record<string, any>,
    projectMap: Map<string, string>,
    workstreamMap: Map<string, string>
  ): any[] {
    const localProjectId = projectMap.get(remoteData.project_id);
    
    if (!localProjectId) {
      throw new Error(
        `Cannot update task: project with remote ID ${remoteData.project_id} not found`
      );
    }
    
    // Optional workstream mapping
    let localWorkstreamId;
    if (remoteData.workstream_id) {
      localWorkstreamId = workstreamMap.get(remoteData.workstream_id);
      
      if (!localWorkstreamId) {
        console.warn(
          `Workstream with remote ID ${remoteData.workstream_id} not found, ` +
          `setting workstream to null for task ${remoteData.id}`
        );
      }
    }
    
    return [
      this.prepareUpdate(task => {
        task.projectId = localProjectId;
        task.workstreamId = localWorkstreamId;
        task.title = remoteData.title;
        task.description = remoteData.description || undefined;
        task.status = remoteData.status;
        task.priority = remoteData.priority;
        task.ownerId = remoteData.owner_id || undefined;
        task.labelsJson = JSON.stringify(remoteData.labels || []);
        task.relationshipsJson = JSON.stringify(remoteData.relationships || {});
        task.remoteId = remoteData.id;
      })
    ];
  }
}

// Need these imports for Typescript
import Project from './project';
import Workstream from './workstream';
import { Relation } from '@nozbe/watermelondb';
