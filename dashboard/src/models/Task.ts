import { Model, Associations } from '@nozbe/watermelondb';
import { lazy } from '@nozbe/watermelondb/decorators/lazy';

export default class Task extends Model {
  static table = 'tasks';
  
  // Define associations
  static associations: Associations = {
    projects: { type: 'belongs_to', key: 'project_id' },
    workstreams: { type: 'belongs_to', key: 'workstream_id' }
  };
  
  // Define getters
  get title(): string {
    return this._raw.title;
  }
  
  get description(): string | undefined {
    return this._raw.description;
  }
  
  get status(): string {
    return this._raw.status;
  }
  
  get priority(): string {
    return this._raw.priority;
  }
  
  get labels(): any[] {
    return JSON.parse(this._raw.labels || '[]');
  }
  
  get relationships(): any {
    return JSON.parse(this._raw.relationships || '{}');
  }
  
  get ownerId(): string | undefined {
    return this._raw.owner_id;
  }
  
  get createdAt(): Date {
    return new Date(this._raw.created_at);
  }
  
  get updatedAt(): Date {
    return new Date(this._raw.updated_at);
  }
  
  get deletedAt(): Date | undefined {
    return this._raw.deleted_at ? new Date(this._raw.deleted_at) : undefined;
  }
  
  get lastModifiedBy(): string | undefined {
    return this._raw.last_modified_by;
  }
  
  get clientVersion(): number | undefined {
    return this._raw.client_version;
  }
  
  // Define relations using lazy
  project = lazy(() => this.collections.get('projects').findAndObserve(this._raw.project_id));
  workstream = lazy(() => {
    const workstreamId = this._raw.workstream_id;
    return workstreamId 
      ? this.collections.get('workstreams').findAndObserve(workstreamId)
      : null;
  });
}
