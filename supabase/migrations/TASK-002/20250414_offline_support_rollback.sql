-- Rollback: 20250414_offline_support_rollback.sql
-- Description: Rollback offline-first functionality changes
-- Author: AI Assistant
-- Date: 2025-04-14

-- Drop sync_history table
DROP TABLE IF EXISTS sync_history;

-- Drop indexes for non-deleted records
DROP INDEX IF EXISTS idx_workspaces_not_deleted;
DROP INDEX IF EXISTS idx_projects_not_deleted;
DROP INDEX IF EXISTS idx_workstreams_not_deleted;
DROP INDEX IF EXISTS idx_tasks_not_deleted;
DROP INDEX IF EXISTS idx_relationships_not_deleted;

-- Drop new triggers
DROP TRIGGER IF EXISTS update_workspaces_metadata ON workspaces;
DROP TRIGGER IF EXISTS update_projects_metadata ON projects;
DROP TRIGGER IF EXISTS update_workstreams_metadata ON workstreams;
DROP TRIGGER IF EXISTS update_tasks_metadata ON tasks;
DROP TRIGGER IF EXISTS update_relationships_metadata ON relationships;

-- Drop the update_record_metadata function
DROP FUNCTION IF EXISTS update_record_metadata();

-- Restore original trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Restore original triggers
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workstreams_updated_at
BEFORE UPDATE ON workstreams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Drop modified functions
DROP FUNCTION IF EXISTS get_tasks_for_project(UUID);
DROP FUNCTION IF EXISTS get_workstreams_for_project(UUID);

-- Recreate the original functions (if they existed)
CREATE OR REPLACE FUNCTION get_tasks_for_project(project_id UUID)
RETURNS SETOF tasks AS $$
  SELECT * FROM tasks 
  WHERE project_id = $1 
  ORDER BY updated_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_workstreams_for_project(project_id UUID)
RETURNS SETOF workstreams AS $$
  SELECT * FROM workstreams 
  WHERE project_id = $1 
  ORDER BY updated_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Remove columns
ALTER TABLE workspaces DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE workspaces DROP COLUMN IF EXISTS last_modified_by;
ALTER TABLE workspaces DROP COLUMN IF EXISTS client_version;

ALTER TABLE projects DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE projects DROP COLUMN IF EXISTS last_modified_by;
ALTER TABLE projects DROP COLUMN IF EXISTS client_version;

ALTER TABLE workstreams DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE workstreams DROP COLUMN IF EXISTS last_modified_by;
ALTER TABLE workstreams DROP COLUMN IF EXISTS client_version;

ALTER TABLE tasks DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE tasks DROP COLUMN IF EXISTS last_modified_by;
ALTER TABLE tasks DROP COLUMN IF EXISTS client_version;

ALTER TABLE relationships DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE relationships DROP COLUMN IF EXISTS last_modified_by;
ALTER TABLE relationships DROP COLUMN IF EXISTS client_version;
