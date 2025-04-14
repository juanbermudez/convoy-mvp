-- Rollback: 20250414_convoy_schema.sql
-- Description: Rollback the Convoy data architecture schema
-- Author: AI Assistant
-- Date: 2025-04-14

-- Drop triggers
DROP TRIGGER IF EXISTS update_task_relationships ON tasks;
DROP TRIGGER IF EXISTS create_task_relationships ON tasks;
DROP TRIGGER IF EXISTS create_workstream_relationships ON workstreams;
DROP TRIGGER IF EXISTS create_project_relationships ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_workstreams_updated_at ON workstreams;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;

-- Drop functions
DROP FUNCTION IF EXISTS update_entity_relationships();
DROP FUNCTION IF EXISTS create_entity_relationships();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_relationships_type;
DROP INDEX IF EXISTS idx_relationships_target;
DROP INDEX IF EXISTS idx_relationships_source;
DROP INDEX IF EXISTS idx_tasks_title;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_owner_id;
DROP INDEX IF EXISTS idx_tasks_workstream_id;
DROP INDEX IF EXISTS idx_tasks_project_id;
DROP INDEX IF EXISTS idx_workstreams_name;
DROP INDEX IF EXISTS idx_workstreams_status;
DROP INDEX IF EXISTS idx_workstreams_owner_id;
DROP INDEX IF EXISTS idx_workstreams_project_id;
DROP INDEX IF EXISTS idx_projects_name;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_owner_id;
DROP INDEX IF EXISTS idx_projects_workspace_id;
DROP INDEX IF EXISTS idx_workspaces_name;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS relationships;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS workstreams;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS workspaces;

-- Drop types
DROP TYPE IF EXISTS task_priority;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS workstream_status;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS relationship_type;
DROP TYPE IF EXISTS entity_type;
