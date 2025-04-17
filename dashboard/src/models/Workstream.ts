import { Model, Associations, Q } from '@nozbe/watermelondb';
import { lazy } from '@nozbe/watermelondb/decorators/lazy';

export default class Workstream extends Model {
  static table = 'workstreams';
  
  // Define associations
  static associations: Associations = {
    projects: { type: 'belongs_to', key: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'workstream_id' }
  };
  
  // Define getters
  get name(): string {
    return this._raw.name;
  }
  
  get description(): string | undefined {
    return this._raw.description;
  }
  
  get status(): string {
    return this._raw.status;
  }
  
  get progress(): number {
    return this._raw.progress;
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
  tasks = lazy(() => this.collections.get('tasks').query(Q.where('workstream_id', this.id)));
}
