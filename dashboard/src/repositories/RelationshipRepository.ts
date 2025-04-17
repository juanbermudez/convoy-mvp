import { database, relationships } from '../models';
import { syncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';
import Relationship from '../models/Relationship';

// Entity type enum
export enum EntityType {
  Workspace = 'workspace',
  Project = 'project',
  Workstream = 'workstream',
  Task = 'task'
}

// Relationship type enum
export enum RelationshipType {
  WorkspaceContainsProject = 'workspace_contains_project',
  ProjectBelongsToWorkspace = 'project_belongs_to_workspace',
  ProjectContainsWorkstream = 'project_contains_workstream',
  ProjectContainsTask = 'project_contains_task',
  WorkstreamBelongsToProject = 'workstream_belongs_to_project',
  WorkstreamContainsTask = 'workstream_contains_task',
  TaskBelongsToProject = 'task_belongs_to_project',
  TaskBelongsToWorkstream = 'task_belongs_to_workstream',
  TaskBlocks = 'task_blocks',
  TaskBlockedBy = 'task_blocked_by',
  TaskRelatedTo = 'task_related_to'
}

// Interface for relationship filters
interface RelationshipFilters {
  sourceType?: EntityType;
  sourceId?: string;
  relationshipType?: RelationshipType;
  targetType?: EntityType;
  targetId?: string;
}

export class RelationshipRepository {
  // Get relationships with filters
  async getRelationships(filters: RelationshipFilters = {}) {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Build query conditions
      const conditions = [Q.where('deleted_at', null)];
      
      // Add filter conditions
      if (filters.sourceType) {
        conditions.push(Q.where('source_type', filters.sourceType));
      }
      
      if (filters.sourceId) {
        conditions.push(Q.where('source_id', filters.sourceId));
      }
      
      if (filters.relationshipType) {
        conditions.push(Q.where('relationship_type', filters.relationshipType));
      }
      
      if (filters.targetType) {
        conditions.push(Q.where('target_type', filters.targetType));
      }
      
      if (filters.targetId) {
        conditions.push(Q.where('target_id', filters.targetId));
      }
      
      // Return data from local database with filters
      return await relationships.query(...conditions).fetch();
    } catch (error) {
      console.error('Error fetching relationships:', error);
      throw error;
    }
  }
  
  // Get relationships for an entity (source)
  async getRelationshipsForSource(entityType: EntityType, entityId: string) {
    return this.getRelationships({
      sourceType: entityType,
      sourceId: entityId
    });
  }
  
  // Get relationships for an entity (target)
  async getRelationshipsForTarget(entityType: EntityType, entityId: string) {
    return this.getRelationships({
      targetType: entityType,
      targetId: entityId
    });
  }
  
  // Get all relationships for an entity (both source and target)
  async getAllRelationshipsForEntity(entityType: EntityType, entityId: string) {
    try {
      const sourceRelationships = await this.getRelationshipsForSource(entityType, entityId);
      const targetRelationships = await this.getRelationshipsForTarget(entityType, entityId);
      
      // Combine and deduplicate relationships
      const allRelationships = [...sourceRelationships, ...targetRelationships];
      const uniqueIds = new Set();
      
      return allRelationships.filter(relationship => {
        if (uniqueIds.has(relationship.id)) {
          return false;
        }
        uniqueIds.add(relationship.id);
        return true;
      });
    } catch (error) {
      console.error(`Error fetching all relationships for ${entityType} ${entityId}:`, error);
      throw error;
    }
  }
  
  // Create a new relationship
  async createRelationship(data: {
    sourceType: EntityType;
    sourceId: string;
    relationshipType: RelationshipType;
    targetType: EntityType;
    targetId: string;
    metadata?: any;
  }) {
    try {
      // Check if relationship already exists
      const existingRelationships = await this.getRelationships({
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        relationshipType: data.relationshipType,
        targetType: data.targetType,
        targetId: data.targetId
      });
      
      if (existingRelationships.length > 0) {
        // Relationship already exists, return the existing one
        return existingRelationships[0];
      }
      
      let newRelationship: Relationship;
      
      await database.write(async () => {
        newRelationship = await relationships.create(relationship => {
          relationship.sourceType = data.sourceType;
          relationship.sourceId = data.sourceId;
          relationship.relationshipType = data.relationshipType;
          relationship.targetType = data.targetType;
          relationship.targetId = data.targetId;
          relationship.metadata = data.metadata || {};
        });
      });
      
      // For some relationship types, create the reciprocal relationship
      if (data.relationshipType === RelationshipType.TaskBlocks) {
        // Create the reciprocal "blocked by" relationship
        await this.createRelationship({
          sourceType: data.targetType,
          sourceId: data.targetId,
          relationshipType: RelationshipType.TaskBlockedBy,
          targetType: data.sourceType,
          targetId: data.sourceId,
          metadata: data.metadata
        });
      }
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return newRelationship;
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  }
  
  // Delete a relationship
  async deleteRelationship(id: string) {
    try {
      const relationship = await relationships.find(id);
      
      // Get relationship data before deleting
      const { sourceType, sourceId, relationshipType, targetType, targetId } = relationship;
      
      await database.write(async () => {
        // Soft delete by updating the deletedAt field
        await relationship.update(r => {
          r.deletedAt = new Date();
        });
      });
      
      // For some relationship types, also delete the reciprocal relationship
      if (relationshipType === RelationshipType.TaskBlocks) {
        // Find and delete the reciprocal "blocked by" relationship
        const reciprocalRelationships = await this.getRelationships({
          sourceType: targetType,
          sourceId: targetId,
          relationshipType: RelationshipType.TaskBlockedBy,
          targetType: sourceType,
          targetId: sourceId
        });
        
        if (reciprocalRelationships.length > 0) {
          for (const reciprocal of reciprocalRelationships) {
            await this.deleteRelationship(reciprocal.id);
          }
        }
      }
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting relationship ${id}:`, error);
      throw error;
    }
  }
  
  // Update a relationship's metadata
  async updateRelationshipMetadata(id: string, metadata: any) {
    try {
      const relationship = await relationships.find(id);
      
      await database.write(async () => {
        await relationship.update(r => {
          r.metadata = metadata;
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return relationship;
    } catch (error) {
      console.error(`Error updating relationship ${id}:`, error);
      throw error;
    }
  }
  
  // Observe relationships with filters
  observeRelationships(filters: RelationshipFilters = {}): Observable<Relationship[]> {
    // Build query conditions
    const conditions = [Q.where('deleted_at', null)];
    
    // Add filter conditions
    if (filters.sourceType) {
      conditions.push(Q.where('source_type', filters.sourceType));
    }
    
    if (filters.sourceId) {
      conditions.push(Q.where('source_id', filters.sourceId));
    }
    
    if (filters.relationshipType) {
      conditions.push(Q.where('relationship_type', filters.relationshipType));
    }
    
    if (filters.targetType) {
      conditions.push(Q.where('target_type', filters.targetType));
    }
    
    if (filters.targetId) {
      conditions.push(Q.where('target_id', filters.targetId));
    }
    
    return relationships.query(...conditions).observe();
  }
  
  // Observe relationships for an entity (source)
  observeRelationshipsForSource(entityType: EntityType, entityId: string): Observable<Relationship[]> {
    return this.observeRelationships({
      sourceType: entityType,
      sourceId: entityId
    });
  }
  
  // Observe relationships for an entity (target)
  observeRelationshipsForTarget(entityType: EntityType, entityId: string): Observable<Relationship[]> {
    return this.observeRelationships({
      targetType: entityType,
      targetId: entityId
    });
  }
}

// Export singleton instance
export const relationshipRepository = new RelationshipRepository();
