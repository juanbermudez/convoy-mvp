/**
 * Knowledge Graph Module
 * 
 * This module exports all the functionality of the knowledge graph implementation.
 */

// Export types and interfaces
export * from './types';

// Export relationship management functions
export {
  createRelationship,
  findRelatedEntities,
  findReferencingEntities,
  getRelationship,
  updateRelationshipMetadata,
  deleteRelationship,
  deleteEntityRelationships,
  findRelationshipsBetweenEntities
} from './relationship-manager';

// Export graph traversal utilities
export {
  traverseUpward,
  traverseDownward,
  findPaths,
  findEntitiesInWorkspace,
  findEntityAncestry,
  findRelatedTasks
} from './graph-traversal';

// Export context retrieval functions
export {
  getTaskContext,
  getWorkstreamContext,
  getProjectContext,
  getWorkspaceContext,
  getAllContexts
} from './context-retrieval';
