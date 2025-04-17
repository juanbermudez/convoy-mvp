import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workspaces',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true }, // For soft deletes
        { name: 'last_modified_by', type: 'string', isOptional: true },
        { name: 'client_version', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'workspace_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'target_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'last_modified_by', type: 'string', isOptional: true },
        { name: 'client_version', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'workstreams',
      columns: [
        { name: 'project_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'progress', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'last_modified_by', type: 'string', isOptional: true },
        { name: 'client_version', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'project_id', type: 'string' },
        { name: 'workstream_id', type: 'string', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'labels', type: 'string' }, // JSON stringified
        { name: 'relationships', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'last_modified_by', type: 'string', isOptional: true },
        { name: 'client_version', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'relationships',
      columns: [
        { name: 'source_type', type: 'string' },
        { name: 'source_id', type: 'string' },
        { name: 'relationship_type', type: 'string' },
        { name: 'target_type', type: 'string' },
        { name: 'target_id', type: 'string' },
        { name: 'metadata', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'last_modified_by', type: 'string', isOptional: true },
        { name: 'client_version', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'sync_metadata',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
});
