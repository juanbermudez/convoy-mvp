/**
 * Knowledge Graph Type Definitions
 * 
 * This file defines the types used in the knowledge graph implementation.
 */

/**
 * Entity types in the knowledge graph
 */
export enum EntityType {
  WORKSPACE = 'workspace',
  PROJECT = 'project',
  WORKSTREAM = 'workstream',
  TASK = 'task',
}

/**
 * Relationship types in the knowledge graph
 */
export enum RelationshipType {
  // Task relationships
  TASK_BLOCKS = 'task_blocks',
  TASK_BLOCKED_BY = 'task_blocked_by',
  TASK_RELATED_TO = 'task_related_to',
  TASK_PARENT_OF = 'task_parent_of',
  TASK_CHILD_OF = 'task_child_of',
  
  // Workstream relationships
  WORKSTREAM_DEPENDS_ON = 'workstream_depends_on',
  WORKSTREAM_DEPENDENCY_OF = 'workstream_dependency_of',
  WORKSTREAM_RELATED_TO = 'workstream_related_to',
  
  // Project relationships
  PROJECT_DEPENDS_ON = 'project_depends_on',
  PROJECT_DEPENDENCY_OF = 'project_dependency_of',
  PROJECT_RELATED_TO = 'project_related_to',
}

/**
 * Relationship definition
 */
export interface Relationship {
  sourceType: EntityType;
  sourceId: string;
  relationshipType: RelationshipType;
  targetType: EntityType;
  targetId: string;
  metadata?: Record<string, any>;
}

/**
 * Knowledge graph node
 */
export interface Node {
  id: string;
  type: EntityType;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Knowledge graph edge
 */
export interface Edge {
  id: string;
  source: string;
  sourceType: EntityType;
  target: string;
  targetType: EntityType;
  type: RelationshipType;
  metadata?: Record<string, any>;
}

/**
 * Knowledge graph
 */
export interface KnowledgeGraph {
  nodes: Node[];
  edges: Edge[];
}
