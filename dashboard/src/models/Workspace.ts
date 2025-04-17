import { Model, Associations, Q } from '@nozbe/watermelondb';
import { lazy } from '@nozbe/watermelondb/decorators/lazy';

export default class Workspace extends Model {
  static table = 'workspaces';
  
  // Define associations
  static associations: Associations = {
    projects: { type: 'has_many', foreignKey: 'workspace_id' }
  };
  
  // Define getters
  get name(): string {
    return this._raw.name;
  }
  
  get description(): string | undefined {
    return this._raw.description;
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
  projects = lazy(() => this.collections.get('projects').query(Q.where('workspace_id', this.id)));
}
