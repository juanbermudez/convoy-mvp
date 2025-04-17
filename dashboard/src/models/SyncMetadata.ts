import { Model } from '@nozbe/watermelondb';

export default class SyncMetadata extends Model {
  static table = 'sync_metadata';
  
  // Define getters instead of using decorators
  get key(): string {
    return this._raw.key;
  }
  
  get value(): string {
    return this._raw.value;
  }
  
  get updatedAt(): Date {
    return new Date(this._raw.updated_at);
  }
}
