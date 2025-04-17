import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * Database schema definition for WatermelonDB
 * This mirrors our Supabase schema structure
 */
export const schema = appSchema({
  version: 1,
  tables: [
    // Workspaces table
    tableSchema({
      name: 'workspaces',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Projects table
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'workspace_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'overview', type: 'string', isOptional: true },
        { name: 'tech_stack', type: 'string', isOptional: true }, // JSON stored as string
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Workstreams table
    tableSchema({
      name: 'workstreams',
      columns: [
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'progress', type: 'number' },
        { name: 'owner_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    
    // Milestones table
    tableSchema({
      name: 'milestones',
      columns: [
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'requirements', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'target_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Tasks table
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'workstream_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'title', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'priority', type: 'string', isIndexed: true },
        { name: 'owner_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'labels', type: 'string' }, // JSON string
        { name: 'relationships_json', type: 'string' }, // JSON string for quick reference
        { name: 'remote_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    
    // Task dependencies table
    tableSchema({
      name: 'task_dependencies',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'depends_on_task_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Activity feed table
    tableSchema({
      name: 'activity_feed',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'actor_id', type: 'string', isOptional: true },
        { name: 'activity_type', type: 'string', isIndexed: true },
        { name: 'details', type: 'string', isOptional: true }, // JSON stored as string
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'remote_id', type: 'string', isIndexed: true },
        { name: 'is_synced', type: 'boolean' },
      ]
    }),
    
    // Workflows table
    tableSchema({
      name: 'workflows',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'stages', type: 'string' }, // JSON stored as string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Patterns table
    tableSchema({
      name: 'patterns',
      columns: [
        { name: 'workspace_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'project_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'pattern_type', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' }, // JSON stored as string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Best practices table
    tableSchema({
      name: 'best_practices',
      columns: [
        { name: 'workspace_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'project_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' }, // JSON stored as string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'remote_id', type: 'string', isIndexed: true },
      ]
    }),
    
    // Relationships table
    tableSchema({
      name: 'relationships',
      columns: [
        { name: 'source_type', type: 'string', isIndexed: true },
        { name: 'source_id', type: 'string', isIndexed: true },
        { name: 'relationship_type', type: 'string', isIndexed: true },
        { name: 'target_type', type: 'string', isIndexed: true },
        { name: 'target_id', type: 'string', isIndexed: true },
        { name: 'metadata_json', type: 'string' }, // JSON string
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' }
      ]
    }),
    
    // Sync log table for tracking sync operations
    tableSchema({
      name: 'sync_log',
      columns: [
        { name: 'operation', type: 'string', isIndexed: true },
        { name: 'entity_type', type: 'string', isIndexed: true },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'error', type: 'string', isOptional: true },
        { name: 'timestamp', type: 'number', isIndexed: true },
      ]
    }),
  ]
});
