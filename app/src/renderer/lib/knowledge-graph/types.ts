/**
 * Knowledge Graph Types
 * 
 * This file contains type definitions for the knowledge graph implementation,
 * including entity types, relationship types, and related interfaces.
 */

/**
 * Types of entities that can participate in relationships
 */
export enum EntityType {
  WORKSPACE = 'workspace',
  PROJECT = 'project',
  WORKSTREAM = 'workstream',
  TASK = 'task'
}

/**
 * Types of relationships between entities
 */
export enum RelationshipType {
  // Workspace relationships
  WORKSPACE_CONTAINS_PROJECT = 'workspace_contains_project',
  PROJECT_BELONGS_TO_WORKSPACE = 'project_belongs_to_workspace',
  
  // Project relationships
  PROJECT_CONTAINS_WORKSTREAM = 'project_contains_workstream',
  PROJECT_CONTAINS_TASK = 'project_contains_task',
  
  // Workstream relationships
  WORKSTREAM_BELONGS_TO_PROJECT = 'workstream_belongs_to_project',
  WORKSTREAM_CONTAINS_TASK = 'workstream_contains_task',
  
  // Task relationships
  TASK_BELONGS_TO_PROJECT = 'task_belongs_to_project',
  TASK_BELONGS_TO_WORKSTREAM = 'task_belongs_to_workstream',
  
  // Dependency relationships
  TASK_BLOCKS = 'task_blocks',
  TASK_BLOCKED_BY = 'task_blocked_by',
  TASK_RELATED_TO = 'task_related_to'
}

/**
 * Represents a relationship between two entities
 */
export interface Relationship {
  id: string;
  source_type: EntityType;
  source_id: string;
  relationship_type: RelationshipType;
  target_type: EntityType;
  target_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Represents the input for creating a new relationship
 */
export interface CreateRelationshipInput {
  source_type: EntityType;
  source_id: string;
  relationship_type: RelationshipType;
  target_type: EntityType;
  target_id: string;
  metadata?: Record<string, any>;
}

/**
 * Basic entity interfaces
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace extends BaseEntity {
  name: string;
  description?: string;
}

export interface Project extends BaseEntity {
  workspace_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  status: string;
  target_date?: string;
}

export interface Workstream extends BaseEntity {
  project_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  status: string;
  progress: number;
}

export interface Task extends BaseEntity {
  project_id: string;
  workstream_id?: string;
  title: string;
  description?: string;
  owner_id?: string;
  status: string;
  priority: string;
  labels: any[];
  relationships: Record<string, any>;
}

/**
 * Result of a graph traversal operation
 */
export interface TraversalResult {
  entity_type: EntityType;
  entity_id: string;
  entity_data?: any;  // The actual entity data if available
  depth: number;
  path: Relationship[];  // The path of relationships traversed to reach this entity
}

/**
 * Represents a path between two entities
 */
export interface Path {
  relationships: Relationship[];
  length: number;
}

/**
 * Context interfaces for different entity types
 */
export interface TaskContext {
  task: Task;
  project?: Project;
  workstream?: Workstream;
  workspace?: Workspace;
  related_tasks?: Task[];
  blocked_by_tasks?: Task[];
  blocking_tasks?: Task[];
}

export interface WorkstreamContext {
  workstream: Workstream;
  project?: Project;
  workspace?: Workspace;
  tasks?: Task[];
}

export interface ProjectContext {
  project: Project;
  workspace?: Workspace;
  workstreams?: Workstream[];
  tasks?: Task[];
}

export interface WorkspaceContext {
  workspace: Workspace;
  projects?: Project[];
  workstreams?: Workstream[];
  tasks?: Task[];
}

/**
 * Error types for relationship operations
 */
export enum RelationshipErrorType {
  VALIDATION_ERROR = 'validation_error',
  NOT_FOUND = 'not_found',
  DUPLICATE = 'duplicate',
  DATABASE_ERROR = 'database_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Error class for relationship operations
 */
export class RelationshipError extends Error {
  type: RelationshipErrorType;
  details?: any;

  constructor(message: string, type: RelationshipErrorType, details?: any) {
    super(message);
    this.name = 'RelationshipError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Options for graph traversal
 */
export interface TraversalOptions {
  maxDepth?: number;
  includeEntityData?: boolean;
  relationshipTypes?: RelationshipType[];
  targetEntityTypes?: EntityType[];
}

/**
 * Options for finding paths
 */
export interface PathFindingOptions {
  maxDepth?: number;
  maxPaths?: number;
  relationshipTypes?: RelationshipType[];
}
