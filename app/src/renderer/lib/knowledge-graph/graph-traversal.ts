/**
 * Graph Traversal Utilities
 * 
 * This file contains functions for traversing the knowledge graph,
 * including upward traversal, downward traversal, and path finding.
 */

import { supabase } from '../supabase/client';
import {
  EntityType,
  RelationshipType,
  Relationship,
  TraversalResult,
  Path,
  TraversalOptions,
  PathFindingOptions,
  RelationshipError,
  RelationshipErrorType
} from './types';
import { findRelatedEntities, findReferencingEntities } from './relationship-manager';

/**
 * Traverse up the hierarchy from a given entity
 * 
 * @param entityType Type of the starting entity
 * @param entityId ID of the starting entity
 * @param options Traversal options
 * @returns Array of traversal results
 */
export async function traverseUpward(
  entityType: EntityType,
  entityId: string,
  options: TraversalOptions = {}
): Promise<TraversalResult[]> {
  const {
    maxDepth = 10,
    includeEntityData = false,
    relationshipTypes = [
      RelationshipType.TASK_BELONGS_TO_PROJECT,
      RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
      RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
      RelationshipType.PROJECT_BELONGS_TO_WORKSPACE
    ],
    targetEntityTypes
  } = options;

  // Results to return
  const results: TraversalResult[] = [];
  
  // Entities we've already processed to avoid cycles
  const visitedEntities = new Set<string>();
  
  // Add the starting entity
  const startEntity: TraversalResult = {
    entity_type: entityType,
    entity_id: entityId,
    depth: 0,
    path: []
  };
  
  if (includeEntityData) {
    startEntity.entity_data = await getEntityData(entityType, entityId);
  }
  
  results.push(startEntity);
  visitedEntities.add(`${entityType}-${entityId}`);
  
  // Queue for breadth-first traversal
  const queue: Array<[EntityType, string, number, Relationship[]]> = [
    [entityType, entityId, 0, []]
  ];
  
  while (queue.length > 0) {
    const [currentType, currentId, currentDepth, currentPath] = queue.shift()!;
    
    // Stop if we've reached the maximum depth
    if (currentDepth >= maxDepth) {
      continue;
    }
    
    // Get entities that the current entity belongs to (upward traversal)
    const relationships = await findRelatedEntities(
      currentType, 
      currentId, 
      undefined, // All relationship types
      undefined  // All target types
    );
    
    // Filter by relationship types if specified
    const filteredRelationships = relationships.filter(rel => 
      relationshipTypes.includes(rel.relationship_type) &&
      (!targetEntityTypes || targetEntityTypes.includes(rel.target_type))
    );
    
    for (const relationship of filteredRelationships) {
      const targetKey = `${relationship.target_type}-${relationship.target_id}`;
      
      // Skip if we've already visited this entity
      if (visitedEntities.has(targetKey)) {
        continue;
      }
      
      // Mark as visited
      visitedEntities.add(targetKey);
      
      // Add to results
      const newPath = [...currentPath, relationship];
      const targetEntity: TraversalResult = {
        entity_type: relationship.target_type,
        entity_id: relationship.target_id,
        depth: currentDepth + 1,
        path: newPath
      };
      
      if (includeEntityData) {
        targetEntity.entity_data = await getEntityData(relationship.target_type, relationship.target_id);
      }
      
      results.push(targetEntity);
      
      // Add to queue for further traversal
      queue.push([
        relationship.target_type,
        relationship.target_id,
        currentDepth + 1,
        newPath
      ]);
    }
  }
  
  return results;
}

/**
 * Traverse down the hierarchy from a given entity
 * 
 * @param entityType Type of the starting entity
 * @param entityId ID of the starting entity
 * @param options Traversal options
 * @returns Array of traversal results
 */
export async function traverseDownward(
  entityType: EntityType,
  entityId: string,
  options: TraversalOptions = {}
): Promise<TraversalResult[]> {
  const {
    maxDepth = 10,
    includeEntityData = false,
    relationshipTypes = [
      RelationshipType.WORKSPACE_CONTAINS_PROJECT,
      RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
      RelationshipType.PROJECT_CONTAINS_TASK,
      RelationshipType.WORKSTREAM_CONTAINS_TASK
    ],
    targetEntityTypes
  } = options;

  // Results to return
  const results: TraversalResult[] = [];
  
  // Entities we've already processed to avoid cycles
  const visitedEntities = new Set<string>();
  
  // Add the starting entity
  const startEntity: TraversalResult = {
    entity_type: entityType,
    entity_id: entityId,
    depth: 0,
    path: []
  };
  
  if (includeEntityData) {
    startEntity.entity_data = await getEntityData(entityType, entityId);
  }
  
  results.push(startEntity);
  visitedEntities.add(`${entityType}-${entityId}`);
  
  // Queue for breadth-first traversal
  const queue: Array<[EntityType, string, number, Relationship[]]> = [
    [entityType, entityId, 0, []]
  ];
  
  while (queue.length > 0) {
    const [currentType, currentId, currentDepth, currentPath] = queue.shift()!;
    
    // Stop if we've reached the maximum depth
    if (currentDepth >= maxDepth) {
      continue;
    }
    
    // Get entities that belong to the current entity (downward traversal)
    const relationships = await findReferencingEntities(
      currentType,
      currentId,
      undefined, // All relationship types
      undefined  // All source types
    );
    
    // Filter by relationship types if specified
    const filteredRelationships = relationships.filter(rel => 
      relationshipTypes.includes(rel.relationship_type) &&
      (!targetEntityTypes || targetEntityTypes.includes(rel.source_type))
    );
    
    for (const relationship of filteredRelationships) {
      const sourceKey = `${relationship.source_type}-${relationship.source_id}`;
      
      // Skip if we've already visited this entity
      if (visitedEntities.has(sourceKey)) {
        continue;
      }
      
      // Mark as visited
      visitedEntities.add(sourceKey);
      
      // Add to results
      const newPath = [...currentPath, relationship];
      const sourceEntity: TraversalResult = {
        entity_type: relationship.source_type,
        entity_id: relationship.source_id,
        depth: currentDepth + 1,
        path: newPath
      };
      
      if (includeEntityData) {
        sourceEntity.entity_data = await getEntityData(relationship.source_type, relationship.source_id);
      }
      
      results.push(sourceEntity);
      
      // Add to queue for further traversal
      queue.push([
        relationship.source_type,
        relationship.source_id,
        currentDepth + 1,
        newPath
      ]);
    }
  }
  
  return results;
}

/**
 * Find paths between two entities
 * 
 * @param sourceType Type of the source entity
 * @param sourceId ID of the source entity
 * @param targetType Type of the target entity
 * @param targetId ID of the target entity
 * @param options Path finding options
 * @returns Array of paths
 */
export async function findPaths(
  sourceType: EntityType,
  sourceId: string,
  targetType: EntityType,
  targetId: string,
  options: PathFindingOptions = {}
): Promise<Path[]> {
  const {
    maxDepth = 5,
    maxPaths = 10,
    relationshipTypes
  } = options;

  // Target key for comparison
  const targetKey = `${targetType}-${targetId}`;
  
  // Results to return
  const paths: Path[] = [];
  
  // Entities we've already processed to avoid cycles
  const visitedEntities = new Set<string>();
  visitedEntities.add(`${sourceType}-${sourceId}`);
  
  // Queue for breadth-first traversal, storing [entityType, entityId, path]
  const queue: Array<[EntityType, string, Relationship[]]> = [
    [sourceType, sourceId, []]
  ];
  
  while (queue.length > 0 && paths.length < maxPaths) {
    const [currentType, currentId, currentPath] = queue.shift()!;
    
    // Stop if we've reached the maximum depth
    if (currentPath.length >= maxDepth) {
      continue;
    }
    
    // Check outgoing relationships
    const outgoingRelationships = await findRelatedEntities(
      currentType,
      currentId,
      undefined, // All relationship types
      undefined  // All target types
    );
    
    // Filter by relationship types if specified
    const filteredOutgoing = relationshipTypes
      ? outgoingRelationships.filter(rel => relationshipTypes.includes(rel.relationship_type))
      : outgoingRelationships;
    
    for (const relationship of filteredOutgoing) {
      const newPath = [...currentPath, relationship];
      const targetKey = `${relationship.target_type}-${relationship.target_id}`;
      
      // Check if we've found a path to the target
      if (relationship.target_type === targetType && relationship.target_id === targetId) {
        paths.push({
          relationships: newPath,
          length: newPath.length
        });
        
        // Stop if we've found enough paths
        if (paths.length >= maxPaths) {
          break;
        }
        
        continue; // Don't continue traversal from the target
      }
      
      // Skip if we've already visited this entity
      if (visitedEntities.has(targetKey)) {
        continue;
      }
      
      // Mark as visited
      visitedEntities.add(targetKey);
      
      // Add to queue for further traversal
      queue.push([
        relationship.target_type,
        relationship.target_id,
        newPath
      ]);
    }
    
    // Check incoming relationships
    const incomingRelationships = await findReferencingEntities(
      currentType,
      currentId,
      undefined, // All relationship types
      undefined  // All source types
    );
    
    // Filter by relationship types if specified
    const filteredIncoming = relationshipTypes
      ? incomingRelationships.filter(rel => relationshipTypes.includes(rel.relationship_type))
      : incomingRelationships;
    
    for (const relationship of filteredIncoming) {
      const newPath = [...currentPath, relationship];
      const sourceKey = `${relationship.source_type}-${relationship.source_id}`;
      
      // Check if we've found a path to the target
      if (relationship.source_type === targetType && relationship.source_id === targetId) {
        paths.push({
          relationships: newPath,
          length: newPath.length
        });
        
        // Stop if we've found enough paths
        if (paths.length >= maxPaths) {
          break;
        }
        
        continue; // Don't continue traversal from the target
      }
      
      // Skip if we've already visited this entity
      if (visitedEntities.has(sourceKey)) {
        continue;
      }
      
      // Mark as visited
      visitedEntities.add(sourceKey);
      
      // Add to queue for further traversal
      queue.push([
        relationship.source_type,
        relationship.source_id,
        newPath
      ]);
    }
  }
  
  // Sort paths by length (shortest first)
  paths.sort((a, b) => a.length - b.length);
  
  return paths.slice(0, maxPaths);
}

/**
 * Get the full data for an entity by type and ID
 * 
 * @param entityType Type of the entity
 * @param entityId ID of the entity
 * @returns The entity data if found, null otherwise
 */
async function getEntityData(entityType: EntityType, entityId: string): Promise<any | null> {
  try {
    let table: string;
    
    switch (entityType) {
      case EntityType.WORKSPACE:
        table = 'workspaces';
        break;
      case EntityType.PROJECT:
        table = 'projects';
        break;
      case EntityType.WORKSTREAM:
        table = 'workstreams';
        break;
      case EntityType.TASK:
        table = 'tasks';
        break;
      default:
        throw new RelationshipError(
          `Unknown entity type: ${entityType}`,
          RelationshipErrorType.VALIDATION_ERROR
        );
    }
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', entityId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching entity data for ${entityType} ${entityId}:`, error);
    return null; // Return null instead of throwing to avoid breaking traversal
  }
}

/**
 * Find all entities of a specific type within a workspace
 * 
 * @param workspaceId ID of the workspace
 * @param entityType Type of entities to find
 * @param options Traversal options
 * @returns Array of entities
 */
export async function findEntitiesInWorkspace(
  workspaceId: string,
  entityType: EntityType,
  options: TraversalOptions = {}
): Promise<any[]> {
  // Use downward traversal to find all entities in the workspace
  const results = await traverseDownward(
    EntityType.WORKSPACE,
    workspaceId,
    {
      ...options,
      includeEntityData: true,
      targetEntityTypes: [entityType]
    }
  );
  
  // Filter results to only include the requested entity type
  return results
    .filter(result => result.entity_type === entityType)
    .map(result => result.entity_data)
    .filter(data => data !== null);
}

/**
 * Find the ancestry of an entity (all entities it belongs to)
 * 
 * @param entityType Type of the entity
 * @param entityId ID of the entity
 * @param options Traversal options
 * @returns Array of entities in ancestry order (immediate parent first)
 */
export async function findEntityAncestry(
  entityType: EntityType,
  entityId: string,
  options: TraversalOptions = {}
): Promise<any[]> {
  // Use upward traversal to find the ancestry
  const results = await traverseUpward(
    entityType,
    entityId,
    {
      ...options,
      includeEntityData: true
    }
  );
  
  // Remove the entity itself from results
  const ancestry = results.filter(result => 
    !(result.entity_type === entityType && result.entity_id === entityId)
  );
  
  // Sort by depth (closest ancestors first)
  ancestry.sort((a, b) => a.depth - b.depth);
  
  return ancestry.map(result => result.entity_data).filter(data => data !== null);
}

/**
 * Find all related tasks for a given task
 * 
 * @param taskId ID of the task
 * @param relationshipTypes Types of relationships to consider
 * @returns Object with blockingTasks, blockedByTasks, and relatedTasks
 */
export async function findRelatedTasks(
  taskId: string,
  relationshipTypes: RelationshipType[] = [
    RelationshipType.TASK_BLOCKS,
    RelationshipType.TASK_BLOCKED_BY,
    RelationshipType.TASK_RELATED_TO
  ]
): Promise<{
  blockingTasks: any[];
  blockedByTasks: any[];
  relatedTasks: any[];
}> {
  const result = {
    blockingTasks: [],
    blockedByTasks: [],
    relatedTasks: []
  };
  
  // Get all outgoing relationships
  const outgoing = await findRelatedEntities(
    EntityType.TASK,
    taskId,
    undefined,
    EntityType.TASK
  );
  
  // Get all incoming relationships
  const incoming = await findReferencingEntities(
    EntityType.TASK,
    taskId,
    undefined,
    EntityType.TASK
  );
  
  // Process outgoing relationships
  for (const rel of outgoing) {
    if (!relationshipTypes.includes(rel.relationship_type)) {
      continue;
    }
    
    const taskData = await getEntityData(EntityType.TASK, rel.target_id);
    if (!taskData) {
      continue;
    }
    
    if (rel.relationship_type === RelationshipType.TASK_BLOCKS) {
      result.blockingTasks.push(taskData);
    } else if (rel.relationship_type === RelationshipType.TASK_BLOCKED_BY) {
      result.blockedByTasks.push(taskData);
    } else if (rel.relationship_type === RelationshipType.TASK_RELATED_TO) {
      result.relatedTasks.push(taskData);
    }
  }
  
  // Process incoming relationships
  for (const rel of incoming) {
    if (!relationshipTypes.includes(rel.relationship_type)) {
      continue;
    }
    
    const taskData = await getEntityData(EntityType.TASK, rel.source_id);
    if (!taskData) {
      continue;
    }
    
    if (rel.relationship_type === RelationshipType.TASK_BLOCKS) {
      result.blockedByTasks.push(taskData);
    } else if (rel.relationship_type === RelationshipType.TASK_BLOCKED_BY) {
      result.blockingTasks.push(taskData);
    } else if (rel.relationship_type === RelationshipType.TASK_RELATED_TO) {
      result.relatedTasks.push(taskData);
    }
  }
  
  return result;
}
