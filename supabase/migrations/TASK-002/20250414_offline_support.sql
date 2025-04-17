-- Migration: 20250414_offline_support.sql
-- Description: Add support for offline-first functionality
-- Author: AI Assistant
-- Date: 2025-04-14

-- Add deleted_at columns to existing tables for soft delete support
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

-- Add synchronization metadata to all tables
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

-- Create sync_history table to track synchronization
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

-- Create indexes for efficient querying of sync history
CREATE INDEX IF NOT EXISTS idx_sync_history_client_id ON sync_history(client_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON sync_history(status);

-- Create function to update metadata (updated_at, client_version, last_modified_by)
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

-- Update any existing functions to handle soft deletes
-- Example function to get tasks for a project
CREATE OR REPLACE FUNCTION get_tasks_for_project(project_id UUID)
RETURNS SETOF tasks AS $$
  SELECT * FROM tasks 
  WHERE project_id = $1 
  AND deleted_at IS NULL
  ORDER BY updated_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Example function to get workstreams for a project
CREATE OR REPLACE FUNCTION get_workstreams_for_project(project_id UUID)
RETURNS SETOF workstreams AS $$
  SELECT * FROM workstreams 
  WHERE project_id = $1 
  AND deleted_at IS NULL
  ORDER BY updated_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN workspaces.deleted_at IS 'Timestamp when the record was soft-deleted';
COMMENT ON COLUMN workspaces.last_modified_by IS 'Identifier of the client or user who last modified the record';
COMMENT ON COLUMN workspaces.client_version IS 'Version counter for conflict resolution';

COMMENT ON TABLE sync_history IS 'History of synchronization operations between clients and server';
