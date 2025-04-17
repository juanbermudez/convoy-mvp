/**
 * Relationship Model
 * 
 * Represents a relationship in the knowledge graph.
 */

import { Model } from '@nozbe/watermelondb';
import { EntityType, RelationshipType } from '../../knowledge-graph/types';

/**
 * Relationship model class
 */
export default class Relationship extends Model {
  /** Table name */
  static table = 'relationships';
  
  /** Source entity type */
  get sourceType(): string { return this.getField('source_type') }
  set sourceType(value: string) { this.setField('source_type', value) }
  
  /** Source entity ID */
  get sourceId(): string { return this.getField('source_id') }
  set sourceId(value: string) { this.setField('source_id', value) }
  
  /** Relationship type */
  get relationshipType(): string { return this.getField('relationship_type') }
  set relationshipType(value: string) { this.setField('relationship_type', value) }
  
  /** Target entity type */
  get targetType(): string { return this.getField('target_type') }
  set targetType(value: string) { this.setField('target_type', value) }
  
  /** Target entity ID */
  get targetId(): string { return this.getField('target_id') }
  set targetId(value: string) { this.setField('target_id', value) }
  
  /** Metadata (JSON string) */
  get metadataJson(): string { return this.getField('metadata_json') }
  set metadataJson(value: string) { this.setField('metadata_json', value) }
  
  /** Remote ID (UUID in Supabase) */
  get remoteId(): string | undefined { return this.getField('remote_id') }
  set remoteId(value: string | undefined) { this.setField('remote_id', value) }
  
  /** Creation timestamp */
  get createdAt(): Date { return new Date(this.getField('created_at')) }
  
  /**
   * Get source entity type as enum
   */
  get sourceEntityType(): EntityType {
    return this.sourceType as EntityType;
  }
  
  /**
   * Get relationship type as enum
   */
  get relationshipTypeEnum(): RelationshipType {
    return this.relationshipType as RelationshipType;
  }
  
  /**
   * Get target entity type as enum
   */
  get targetEntityType(): EntityType {
    return this.targetType as EntityType;
  }
  
  /**
   * Get parsed metadata
   */
  get metadata(): Record<string, any> {
    try {
      return JSON.parse(this.metadataJson);
    } catch (error) {
      return {};
    }
  }
  
  /**
   * Set metadata
   */
  set metadata(metadata: Record<string, any>) {
    this.metadataJson = JSON.stringify(metadata);
  }
  
  /**
   * Prepare the relationship for sync with Supabase
   * 
   * Note: This intentionally does not attempt to map local IDs to remote IDs,
   * as relationships should be synced after all other entities.
   * 
   * @returns Object formatted for Supabase insert/update
   */
  prepareForSync(): Record<string, any> {
    return {
      id: this.remoteId || undefined,
      source_type: this.sourceType,
      source_id: this.getRemoteId(this.sourceType, this.sourceId),
      relationship_type: this.relationshipType,
      target_type: this.targetType,
      target_id: this.getRemoteId(this.targetType, this.targetId),
      metadata: JSON.parse(this.metadataJson),
      created_at: this.createdAt.toISOString()
    };
  }
  
  /**
   * Update the relationship from Supabase data
   * 
   * @param remoteData Data from Supabase
   * @param entityMaps Maps of remote entity IDs to local IDs
   * @returns Batch of update actions
   */
  updateFromRemote(
    remoteData: Record<string, any>,
    entityMaps: Record<string, Map<string, string>>
  ): any[] {
    // Get the appropriate map for the source entity type
    const sourceMap = entityMaps[remoteData.source_type];
    if (!sourceMap) {
      throw new Error(
        `Cannot update relationship: no map for source type ${remoteData.source_type}`
      );
    }
    
    // Map the remote source ID to a local source ID
    const localSourceId = sourceMap.get(remoteData.source_id);
    if (!localSourceId) {
      throw new Error(
        `Cannot update relationship: ${remoteData.source_type} with remote ID ` +
        `${remoteData.source_id} not found`
      );
    }
    
    // Get the appropriate map for the target entity type
    const targetMap = entityMaps[remoteData.target_type];
    if (!targetMap) {
      throw new Error(
        `Cannot update relationship: no map for target type ${remoteData.target_type}`
      );
    }
    
    // Map the remote target ID to a local target ID
    const localTargetId = targetMap.get(remoteData.target_id);
    if (!localTargetId) {
      throw new Error(
        `Cannot update relationship: ${remoteData.target_type} with remote ID ` +
        `${remoteData.target_id} not found`
      );
    }
    
    return [
      this.prepareUpdate(relationship => {
        relationship.sourceType = remoteData.source_type;
        relationship.sourceId = localSourceId;
        relationship.relationshipType = remoteData.relationship_type;
        relationship.targetType = remoteData.target_type;
        relationship.targetId = localTargetId;
        relationship.metadataJson = JSON.stringify(remoteData.metadata || {});
        relationship.remoteId = remoteData.id;
      })
    ];
  }
  
  /**
   * Helper to get the remote ID for an entity
   * 
   * @param entityType Entity type
   * @param localId Local entity ID
   * @returns Remote entity ID, or local ID if not found
   */
  private getRemoteId(entityType: string, localId: string): string {
    try {
      const collection = this.collection.database.get(
        entityType === 'task' ? 'tasks' :
        entityType === 'workstream' ? 'workstreams' :
        entityType === 'project' ? 'projects' :
        entityType === 'workspace' ? 'workspaces' :
        ''
      );
      
      if (!collection) {
        return localId;
      }
      
      const entity = collection.findAndObserve(localId);
      return entity.remoteId || localId;
    } catch (error) {
      return localId;
    }
  }
}
