# Offline-First Schema Updates

This document details the schema updates required to support our offline-first implementation using WatermelonDB synchronized with Supabase.

## Supabase Schema Updates

To fully support offline-first functionality with proper synchronization, we need to make several additions to our existing Supabase schema:

### 1. Soft Delete Support

To properly track deleted records, we need to add `deleted_at` columns to all of our tables:

```sql
-- Add deleted_at columns to existing tables
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for efficient querying of non-deleted records
CREATE INDEX IF NOT EXISTS idx_workspaces_not_deleted ON workspaces (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_not_deleted ON projects (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workstreams_not_deleted ON workstreams (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_not_deleted ON tasks (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_relationships_not_deleted ON relationships (id) WHERE deleted_at IS NULL;
```

### 2. Synchronization Metadata

To help with sync conflict resolution, we'll add additional metadata to our tables:

```sql
-- Add last_modified_by and client_version columns to all tables
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;

ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;

ALTER TABLE relationships ADD COLUMN IF NOT EXISTS last_modified_by TEXT;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS client_version INTEGER DEFAULT 1;
```

### 3. Sync History Table

Create a table to track synchronization history:

```sql
-- Create sync_history table
CREATE TABLE IF NOT EXISTS sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  user_id UUID, -- Will reference auth.users once auth is set up
  sync_type TEXT NOT NULL, -- 'pull', 'push', or 'full'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  records_pulled INTEGER DEFAULT 0,
  records_pushed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  error_message TEXT,
  client_info JSONB DEFAULT '{}'::jsonb -- To store client metadata like device, browser, etc.
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_sync_history_client_id ON sync_history(client_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON sync_history(status);
```

### 4. Function to Update Updated_at and Client_Version

```sql
-- Function to update updated_at, client_version, and last_modified_by
CREATE OR REPLACE FUNCTION update_record_metadata()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   NEW.client_version = COALESCE(OLD.client_version, 0) + 1;
   -- last_modified_by would typically come from the client
   -- but we'll leave it as is if it's already set
   NEW.last_modified_by = COALESCE(NEW.last_modified_by, OLD.last_modified_by);
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing triggers with our new function
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_workstreams_updated_at ON workstreams;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

CREATE TRIGGER update_workspaces_metadata
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_record_metadata();

CREATE TRIGGER update_projects_metadata
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_record_metadata();

CREATE TRIGGER update_workstreams_metadata
BEFORE UPDATE ON workstreams
FOR EACH ROW
EXECUTE FUNCTION update_record_metadata();

CREATE TRIGGER update_tasks_metadata
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_record_metadata();

CREATE TRIGGER update_relationships_metadata
BEFORE UPDATE ON relationships
FOR EACH ROW
EXECUTE FUNCTION update_record_metadata();
```

### 5. Update Functions and RLS Policies

If you're using Row Level Security and PostgreSQL functions for API access, they need to be updated to handle the new columns. For example:

```sql
-- Update any existing functions to handle soft deletes
CREATE OR REPLACE FUNCTION get_tasks_for_project(project_id UUID)
RETURNS SETOF tasks AS $$
  SELECT * FROM tasks 
  WHERE project_id = $1 
  AND deleted_at IS NULL
  ORDER BY updated_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update RLS policies to include deleted_at check
CREATE POLICY "Users can view non-deleted tasks" ON tasks
  FOR SELECT
  USING (deleted_at IS NULL);
```

## WatermelonDB Schema and Migrations

### 1. Schema Definition

Create a WatermelonDB schema file that matches our updated Supabase schema:

```typescript
// /app/src/models/schema.ts
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
```

### 2. Migration Strategy

For future schema changes, we'll need migration files. Here's a placeholder for the first migration:

```typescript
// /app/src/models/migrations.ts
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // We don't need any migrations for version 1, 
    // but this is where future migrations would go
    // {
    //   toVersion: 2,
    //   steps: [
    //     // Example future migrations
    //   ]
    // }
  ],
});
```

## Implementation Steps

1. **Create Supabase Migration**:
   - Create a SQL migration file with the schema changes above
   - Test the migration in a development environment
   - Apply the migration to production when ready

2. **Implement WatermelonDB Schema**:
   - Create the schema file as defined above
   - Set up the database initialization code
   - Test the schema with sample data

3. **Update Model Classes**:
   - Add support for the new fields in all model classes
   - Implement soft delete functionality
   - Add methods for sync-related operations

4. **Create Synchronization Service**:
   - Implement the sync service with proper conflict resolution
   - Add support for tracking sync history
   - Test synchronization with various scenarios

5. **Update UI Components**:
   - Add sync status indicators
   - Implement offline mode visual cues
   - Add manual sync triggers

## Testing Checklist

- [ ] Verify all schema changes are applied correctly
- [ ] Test soft delete functionality
- [ ] Verify sync metadata is tracked properly
- [ ] Test conflict resolution with concurrent edits
- [ ] Verify offline to online transition
- [ ] Test online to offline transition
- [ ] Verify data consistency after multiple sync cycles
- [ ] Test performance with large datasets

## Conclusion

These schema updates provide the foundation for a robust offline-first implementation. By adding support for soft deletes, synchronization metadata, and conflict resolution, we enable a seamless user experience regardless of connectivity status.

The changes are designed to be backward compatible with our existing codebase while providing the additional functionality needed for offline support. By following this migration plan, we can ensure a smooth transition to an offline-first architecture.
