import { Model } from '@nozbe/watermelondb';

export default class Relationship extends Model {
  static table = 'relationships';
  
  // Define getters instead of using decorators
  get sourceType(): string {
    return this._raw.source_type;
  }
  
  get sourceId(): string {
    return this._raw.source_id;
  }
  
  get relationshipType(): string {
    return this._raw.relationship_type;
  }
  
  get targetType(): string {
    return this._raw.target_type;
  }
  
  get targetId(): string {
    return this._raw.target_id;
  }
  
  get metadata(): any {
    return JSON.parse(this._raw.metadata || '{}');
  }
  
  get createdAt(): Date {
    return new Date(this._raw.created_at);
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
}
