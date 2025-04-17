import { Model, Associations, Q } from '@nozbe/watermelondb';
import { lazy } from '@nozbe/watermelondb/decorators/lazy';

export default class Project extends Model {
  static table = 'projects';
  
  // Define associations
  static associations: Associations = {
    workspaces: { type: 'belongs_to', key: 'workspace_id' },
    workstreams: { type: 'has_many', foreignKey: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'project_id' }
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
  
  get targetDate(): Date | undefined {
    return this._raw.target_date ? new Date(this._raw.target_date) : undefined;
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
  workspace = lazy(() => this.collections.get('workspaces').findAndObserve(this._raw.workspace_id));
  workstreams = lazy(() => this.collections.get('workstreams').query(Q.where('project_id', this.id)));
  tasks = lazy(() => this.collections.get('tasks').query(Q.where('project_id', this.id)));
}
