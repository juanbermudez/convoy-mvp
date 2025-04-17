-- Add deleted_at columns to tables for soft deletion
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE workstreams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add last_modified_by and client_version columns
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

-- Create sync_history table
CREATE TABLE IF NOT EXISTS sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  user_id UUID,
  sync_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  records_pulled INTEGER DEFAULT 0,
  records_pushed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  error_message TEXT,
  client_info JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_history_client_id ON sync_history(client_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON sync_history(status);

-- Create indexes for soft deletes
CREATE INDEX IF NOT EXISTS idx_workspaces_not_deleted ON workspaces (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_not_deleted ON projects (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workstreams_not_deleted ON workstreams (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_not_deleted ON tasks (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_relationships_not_deleted ON relationships (id) WHERE deleted_at IS NULL;
