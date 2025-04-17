/**
 * WatermelonDB Schema Definitions
 * 
 * This file contains the schema definitions for the WatermelonDB models.
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Define column arrays first to avoid the columnArray.reduce error
const workspaceColumns = [
  { name: 'name', type: 'string', isIndexed: true },
  { name: 'description', type: 'string', isOptional: true },
  { name: 'remote_id', type: 'string', isOptional: true },
  { name: 'created_at', type: 'number' },
  { name: 'updated_at', type: 'number' }
];

const projectColumns = [
  { name: 'workspace_id', type: 'string', isIndexed: true },
  { name: 'name', type: 'string', isIndexed: true },
  { name: 'description', type: 'string', isOptional: true },
  { name: 'status', type: 'string', isIndexed: true },
  { name: 'target_date', type: 'number', isOptional: true },
  { name: 'remote_id', type: 'string', isOptional: true },
  { name: 'created_at', type: 'number' },
  { name: 'updated_at', type: 'number' }
];

const workstreamColumns = [
  { name: 'project_id', type: 'string', isIndexed: true },
  { name: 'name', type: 'string', isIndexed: true },
  { name: 'description', type: 'string', isOptional: true },
  { name: 'status', type: 'string', isIndexed: true },
  { name: 'progress', type: 'number' },
  { name: 'owner_id', type: 'string', isOptional: true, isIndexed: true },
  { name: 'remote_id', type: 'string', isOptional: true },
  { name: 'created_at', type: 'number' },
  { name: 'updated_at', type: 'number' }
];

const taskColumns = [
  { name: 'project_id', type: 'string', isIndexed: true },
  { name: 'workstream_id', type: 'string', isIndexed: true, isOptional: true },
  { name: 'title', type: 'string', isIndexed: true },
  { name: 'description', type: 'string', isOptional: true },
  { name: 'status', type: 'string', isIndexed: true },
  { name: 'priority', type: 'string', isIndexed: true },
  { name: 'owner_id', type: 'string', isOptional: true, isIndexed: true },
  { name: 'labels', type: 'string' }, // JSON string
  { name: 'relationships_json', type: 'string' }, // JSON string for quick reference
  { name: 'remote_id', type: 'string', isOptional: true },
  { name: 'created_at', type: 'number' },
  { name: 'updated_at', type: 'number' }
];

const relationshipColumns = [
  { name: 'source_type', type: 'string', isIndexed: true },
  { name: 'source_id', type: 'string', isIndexed: true },
  { name: 'relationship_type', type: 'string', isIndexed: true },
  { name: 'target_type', type: 'string', isIndexed: true },
  { name: 'target_id', type: 'string', isIndexed: true },
  { name: 'metadata_json', type: 'string' }, // JSON string
  { name: 'remote_id', type: 'string', isOptional: true },
  { name: 'created_at', type: 'number' }
];

/**
 * Workspace schema
 */
export const workspaceSchema = tableSchema({
  name: 'workspaces',
  columns: workspaceColumns
});

/**
 * Project schema
 */
export const projectSchema = tableSchema({
  name: 'projects',
  columns: projectColumns
});

/**
 * Workstream schema
 */
export const workstreamSchema = tableSchema({
  name: 'workstreams',
  columns: workstreamColumns
});

/**
 * Task schema
 */
export const taskSchema = tableSchema({
  name: 'tasks',
  columns: taskColumns
});

/**
 * Relationship schema
 */
export const relationshipSchema = tableSchema({
  name: 'relationships',
  columns: relationshipColumns
});

/**
 * Full database schema
 */
export const schema = appSchema({
  version: 1,
  tables: [
    workspaceSchema,
    projectSchema,
    workstreamSchema,
    taskSchema,
    relationshipSchema
  ]
});

export default schema;
