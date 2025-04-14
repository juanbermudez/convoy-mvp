/**
 * Relationship Manager
 * 
 * This file contains functions for managing relationships in the knowledge graph,
 * including creating, reading, updating, and deleting relationships.
 */

import { supabase } from '../supabase/client';
import {
  EntityType,
  RelationshipType,
  Relationship,
  CreateRelationshipInput,
  RelationshipError,
  RelationshipErrorType
} from './types';

/**
 * Create a relationship between two entities
 * 
 * @param input The relationship to create
 * @returns The created relationship
 * @throws RelationshipError if validation fails or the relationship cannot be created
 */
export async function createRelationship(
  input: CreateRelationshipInput
): Promise<Relationship> {
  try {
    // Validate input
    validateRelationshipInput(input);

    // Check if relationship already exists to prevent duplicates
    const existing = await findExistingRelationship(
      input.source_type,
      input.source_id,
      input.relationship_type,
      input.target_type,
      input.target_id
    );

    if (existing) {
      throw new RelationshipError(
        'Relationship already exists',
        RelationshipErrorType.DUPLICATE,
        { relationship: existing }
      );
    }

    // Insert the relationship
    const { data, error } = await supabase.from('relationships').insert({
      source_type: input.source_type,
      source_id: input.source_id,
      relationship_type: input.relationship_type,
      target_type: input.target_type,
      target_id: input.target_id,
      metadata: input.metadata || {}
    }).select().single();

    if (error) {
      throw new RelationshipError(
        `Failed to create relationship: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    // Create inverse relationship if needed
    await createInverseRelationshipIfNeeded(data);

    return data as Relationship;
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error creating relationship: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Find relationships where the given entity is the source
 * 
 * @param sourceType Type of the source entity
 * @param sourceId ID of the source entity
 * @param relationshipType Optional filter for relationship type
 * @param targetType Optional filter for target entity type
 * @returns Array of relationships
 */
export async function findRelatedEntities(
  sourceType: EntityType,
  sourceId: string,
  relationshipType?: RelationshipType,
  targetType?: EntityType
): Promise<Relationship[]> {
  try {
    let query = supabase
      .from('relationships')
      .select('*')
      .eq('source_type', sourceType)
      .eq('source_id', sourceId);

    if (relationshipType) {
      query = query.eq('relationship_type', relationshipType);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { data, error } = await query;

    if (error) {
      throw new RelationshipError(
        `Failed to find related entities: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    return data as Relationship[];
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error finding related entities: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Find relationships where the given entity is the target
 * 
 * @param targetType Type of the target entity
 * @param targetId ID of the target entity
 * @param relationshipType Optional filter for relationship type
 * @param sourceType Optional filter for source entity type
 * @returns Array of relationships
 */
export async function findReferencingEntities(
  targetType: EntityType,
  targetId: string,
  relationshipType?: RelationshipType,
  sourceType?: EntityType
): Promise<Relationship[]> {
  try {
    let query = supabase
      .from('relationships')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (relationshipType) {
      query = query.eq('relationship_type', relationshipType);
    }

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    const { data, error } = await query;

    if (error) {
      throw new RelationshipError(
        `Failed to find referencing entities: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    return data as Relationship[];
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error finding referencing entities: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Get a specific relationship by ID
 * 
 * @param relationshipId ID of the relationship to retrieve
 * @returns The relationship if found, null otherwise
 */
export async function getRelationship(relationshipId: string): Promise<Relationship | null> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new RelationshipError(
        `Failed to get relationship: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    return data as Relationship;
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error getting relationship: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Update the metadata of a relationship
 * 
 * @param relationshipId ID of the relationship to update
 * @param metadata New metadata (will be merged with existing metadata)
 * @returns The updated relationship
 * @throws RelationshipError if the relationship is not found or cannot be updated
 */
export async function updateRelationshipMetadata(
  relationshipId: string,
  metadata: Record<string, any>
): Promise<Relationship> {
  try {
    // Get the existing relationship
    const existing = await getRelationship(relationshipId);
    if (!existing) {
      throw new RelationshipError(
        `Relationship not found: ${relationshipId}`,
        RelationshipErrorType.NOT_FOUND
      );
    }

    // Merge the new metadata with existing metadata
    const mergedMetadata = { ...existing.metadata, ...metadata };

    // Update the relationship
    const { data, error } = await supabase
      .from('relationships')
      .update({ metadata: mergedMetadata })
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) {
      throw new RelationshipError(
        `Failed to update relationship metadata: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    return data as Relationship;
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error updating relationship metadata: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Delete a relationship by ID
 * 
 * @param relationshipId ID of the relationship to delete
 * @returns true if the relationship was deleted, false if it wasn't found
 * @throws RelationshipError if the relationship cannot be deleted
 */
export async function deleteRelationship(relationshipId: string): Promise<boolean> {
  try {
    // Get the relationship to delete
    const relationship = await getRelationship(relationshipId);
    if (!relationship) {
      return false; // Relationship not found
    }

    // Delete the relationship
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      throw new RelationshipError(
        `Failed to delete relationship: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    // Delete inverse relationship if needed
    await deleteInverseRelationshipIfNeeded(relationship);

    return true;
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error deleting relationship: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

/**
 * Delete all relationships for an entity
 * 
 * @param entityType Type of the entity
 * @param entityId ID of the entity
 * @returns Number of relationships deleted
 */
export async function deleteEntityRelationships(
  entityType: EntityType,
  entityId: string
): Promise<number> {
  try {
    // Get all relationships where this entity is the source or target
    const sourceRels = await findRelatedEntities(entityType, entityId);
    const targetRels = await findReferencingEntities(entityType, entityId);
    
    // Delete each relationship
    let deletedCount = 0;
    
    // Process source relationships
    for (const rel of sourceRels) {
      await supabase.from('relationships').delete().eq('id', rel.id);
      deletedCount++;
    }
    
    // Process target relationships
    for (const rel of targetRels) {
      await supabase.from('relationships').delete().eq('id', rel.id);
      deletedCount++;
    }
    
    return deletedCount;
  } catch (error) {
    throw new RelationshipError(
      `Failed to delete entity relationships: ${error.message}`,
      RelationshipErrorType.DATABASE_ERROR,
      { error }
    );
  }
}

/**
 * Find all relationships between two entities
 * 
 * @param entity1Type Type of the first entity
 * @param entity1Id ID of the first entity
 * @param entity2Type Type of the second entity
 * @param entity2Id ID of the second entity
 * @returns Array of relationships
 */
export async function findRelationshipsBetweenEntities(
  entity1Type: EntityType,
  entity1Id: string,
  entity2Type: EntityType,
  entity2Id: string
): Promise<Relationship[]> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .or(`and(source_type.eq.${entity1Type},source_id.eq.${entity1Id},target_type.eq.${entity2Type},target_id.eq.${entity2Id}),and(source_type.eq.${entity2Type},source_id.eq.${entity2Id},target_type.eq.${entity1Type},target_id.eq.${entity1Id})`);

    if (error) {
      throw new RelationshipError(
        `Failed to find relationships between entities: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    return data as Relationship[];
  } catch (error) {
    if (error instanceof RelationshipError) {
      throw error;
    }
    throw new RelationshipError(
      `Unexpected error finding relationships between entities: ${error.message}`,
      RelationshipErrorType.UNKNOWN_ERROR,
      { error }
    );
  }
}

// Helper functions

/**
 * Validate a relationship input
 * 
 * @param input The relationship input to validate
 * @throws RelationshipError if validation fails
 */
function validateRelationshipInput(input: CreateRelationshipInput): void {
  // Check required fields
  if (!input.source_type || !input.source_id || !input.relationship_type || !input.target_type || !input.target_id) {
    throw new RelationshipError(
      'Missing required fields for relationship',
      RelationshipErrorType.VALIDATION_ERROR,
      { input }
    );
  }

  // Check that source and target are not the same entity
  if (input.source_type === input.target_type && input.source_id === input.target_id) {
    throw new RelationshipError(
      'Source and target cannot be the same entity',
      RelationshipErrorType.VALIDATION_ERROR,
      { input }
    );
  }

  // Validate relationship type is appropriate for entity types
  validateRelationshipTypeForEntities(input.relationship_type, input.source_type, input.target_type);
}

/**
 * Validate that the relationship type is appropriate for the given entity types
 * 
 * @param relationshipType The relationship type to validate
 * @param sourceType The source entity type
 * @param targetType The target entity type
 * @throws RelationshipError if validation fails
 */
function validateRelationshipTypeForEntities(
  relationshipType: RelationshipType,
  sourceType: EntityType,
  targetType: EntityType
): void {
  // Define valid entity type combinations for each relationship type
  const validCombinations: Record<RelationshipType, Array<[EntityType, EntityType]>> = {
    [RelationshipType.WORKSPACE_CONTAINS_PROJECT]: [[EntityType.WORKSPACE, EntityType.PROJECT]],
    [RelationshipType.PROJECT_BELONGS_TO_WORKSPACE]: [[EntityType.PROJECT, EntityType.WORKSPACE]],
    [RelationshipType.PROJECT_CONTAINS_WORKSTREAM]: [[EntityType.PROJECT, EntityType.WORKSTREAM]],
    [RelationshipType.PROJECT_CONTAINS_TASK]: [[EntityType.PROJECT, EntityType.TASK]],
    [RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT]: [[EntityType.WORKSTREAM, EntityType.PROJECT]],
    [RelationshipType.WORKSTREAM_CONTAINS_TASK]: [[EntityType.WORKSTREAM, EntityType.TASK]],
    [RelationshipType.TASK_BELONGS_TO_PROJECT]: [[EntityType.TASK, EntityType.PROJECT]],
    [RelationshipType.TASK_BELONGS_TO_WORKSTREAM]: [[EntityType.TASK, EntityType.WORKSTREAM]],
    [RelationshipType.TASK_BLOCKS]: [[EntityType.TASK, EntityType.TASK]],
    [RelationshipType.TASK_BLOCKED_BY]: [[EntityType.TASK, EntityType.TASK]],
    [RelationshipType.TASK_RELATED_TO]: [[EntityType.TASK, EntityType.TASK]],
  };

  // Check if the combination is valid
  const isValid = validCombinations[relationshipType]?.some(
    ([validSource, validTarget]) => sourceType === validSource && targetType === validTarget
  );

  if (!isValid) {
    throw new RelationshipError(
      `Invalid entity types for relationship type ${relationshipType}`,
      RelationshipErrorType.VALIDATION_ERROR,
      { relationshipType, sourceType, targetType }
    );
  }
}

/**
 * Find an existing relationship with the given parameters
 * 
 * @param sourceType Type of the source entity
 * @param sourceId ID of the source entity
 * @param relationshipType Type of the relationship
 * @param targetType Type of the target entity
 * @param targetId ID of the target entity
 * @returns The relationship if found, null otherwise
 */
async function findExistingRelationship(
  sourceType: EntityType,
  sourceId: string,
  relationshipType: RelationshipType,
  targetType: EntityType,
  targetId: string
): Promise<Relationship | null> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .eq('relationship_type', relationshipType)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle();

    if (error) {
      throw new RelationshipError(
        `Failed to find existing relationship: ${error.message}`,
        RelationshipErrorType.DATABASE_ERROR,
        { error }
      );
    }

    return data as Relationship;
  } catch (error) {
    throw new RelationshipError(
      `Error checking for existing relationship: ${error.message}`,
      RelationshipErrorType.DATABASE_ERROR,
      { error }
    );
  }
}

/**
 * Create the inverse relationship if needed for bidirectional relationships
 * 
 * @param relationship The relationship that may need an inverse
 */
async function createInverseRelationshipIfNeeded(relationship: Relationship): Promise<void> {
  // Define inverse relationships
  const inverseRelationships: Partial<Record<RelationshipType, RelationshipType>> = {
    [RelationshipType.WORKSPACE_CONTAINS_PROJECT]: RelationshipType.PROJECT_BELONGS_TO_WORKSPACE,
    [RelationshipType.PROJECT_BELONGS_TO_WORKSPACE]: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
    [RelationshipType.PROJECT_CONTAINS_WORKSTREAM]: RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
    [RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT]: RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
    [RelationshipType.PROJECT_CONTAINS_TASK]: RelationshipType.TASK_BELONGS_TO_PROJECT,
    [RelationshipType.TASK_BELONGS_TO_PROJECT]: RelationshipType.PROJECT_CONTAINS_TASK,
    [RelationshipType.WORKSTREAM_CONTAINS_TASK]: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    [RelationshipType.TASK_BELONGS_TO_WORKSTREAM]: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    [RelationshipType.TASK_BLOCKS]: RelationshipType.TASK_BLOCKED_BY,
    [RelationshipType.TASK_BLOCKED_BY]: RelationshipType.TASK_BLOCKS,
    // TASK_RELATED_TO is symmetric, so it will map to itself
    [RelationshipType.TASK_RELATED_TO]: RelationshipType.TASK_RELATED_TO,
  };

  const inverseType = inverseRelationships[relationship.relationship_type];
  if (!inverseType) {
    return; // No inverse needed
  }

  // For symmetric relationships (like TASK_RELATED_TO), avoid creating duplicates
  if (relationship.relationship_type === inverseType) {
    // Check if the inverse already exists
    const existing = await findExistingRelationship(
      relationship.target_type,
      relationship.target_id,
      inverseType,
      relationship.source_type,
      relationship.source_id
    );
    if (existing) {
      return; // Inverse already exists
    }
  }

  // Create the inverse relationship
  try {
    await supabase.from('relationships').insert({
      source_type: relationship.target_type,
      source_id: relationship.target_id,
      relationship_type: inverseType,
      target_type: relationship.source_type,
      target_id: relationship.source_id,
      metadata: relationship.metadata
    });
  } catch (error) {
    console.error('Failed to create inverse relationship:', error);
    // Don't throw here to avoid failing the original relationship creation
  }
}

/**
 * Delete the inverse relationship if needed for bidirectional relationships
 * 
 * @param relationship The relationship whose inverse may need to be deleted
 */
async function deleteInverseRelationshipIfNeeded(relationship: Relationship): Promise<void> {
  // Define inverse relationships (same mapping as in createInverseRelationshipIfNeeded)
  const inverseRelationships: Partial<Record<RelationshipType, RelationshipType>> = {
    [RelationshipType.WORKSPACE_CONTAINS_PROJECT]: RelationshipType.PROJECT_BELONGS_TO_WORKSPACE,
    [RelationshipType.PROJECT_BELONGS_TO_WORKSPACE]: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
    [RelationshipType.PROJECT_CONTAINS_WORKSTREAM]: RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
    [RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT]: RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
    [RelationshipType.PROJECT_CONTAINS_TASK]: RelationshipType.TASK_BELONGS_TO_PROJECT,
    [RelationshipType.TASK_BELONGS_TO_PROJECT]: RelationshipType.PROJECT_CONTAINS_TASK,
    [RelationshipType.WORKSTREAM_CONTAINS_TASK]: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    [RelationshipType.TASK_BELONGS_TO_WORKSTREAM]: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    [RelationshipType.TASK_BLOCKS]: RelationshipType.TASK_BLOCKED_BY,
    [RelationshipType.TASK_BLOCKED_BY]: RelationshipType.TASK_BLOCKS,
    [RelationshipType.TASK_RELATED_TO]: RelationshipType.TASK_RELATED_TO,
  };

  const inverseType = inverseRelationships[relationship.relationship_type];
  if (!inverseType) {
    return; // No inverse needed
  }

  try {
    // Find the inverse relationship
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('source_type', relationship.target_type)
      .eq('source_id', relationship.target_id)
      .eq('relationship_type', inverseType)
      .eq('target_type', relationship.source_type)
      .eq('target_id', relationship.source_id)
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to find inverse relationship:', error);
      return;
    }

    // Delete the inverse relationship
    await supabase.from('relationships').delete().eq('id', data.id);
  } catch (error) {
    console.error('Failed to delete inverse relationship:', error);
    // Don't throw here to avoid failing the original relationship deletion
  }
}
