-- Migration: 20250414_convoy_schema.sql
-- Description: Implement the Convoy data architecture schema
-- Author: AI Assistant
-- Date: 2025-04-14

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS AND TYPES

-- Entity type enum for relationship table
CREATE TYPE entity_type AS ENUM (
  'workspace',
  'project',
  'workstream',
  'task'
);

-- Relationship type enum
CREATE TYPE relationship_type AS ENUM (
  'workspace_contains_project',
  'project_belongs_to_workspace',
  'project_contains_workstream',
  'project_contains_task',
  'workstream_belongs_to_project',
  'workstream_contains_task',
  'task_belongs_to_project',
  'task_belongs_to_workstream',
  'task_blocks',
  'task_blocked_by',
  'task_related_to'
);

-- Status enums for different entities
CREATE TYPE project_status AS ENUM (
  'active',
  'completed',
  'archived',
  'on_hold'
);

CREATE TYPE workstream_status AS ENUM (
  'active',
  'completed',
  'archived',
  'on_hold'
);

CREATE TYPE task_status AS ENUM (
  'backlog',
  'to_do',
  'in_progress',
  'review',
  'completed'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- CORE TABLES

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID, -- Will reference auth.users once auth is set up
  status project_status NOT NULL DEFAULT 'active',
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workstreams table
CREATE TABLE IF NOT EXISTS workstreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID, -- Will reference auth.users once auth is set up
  status workstream_status NOT NULL DEFAULT 'active',
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES workstreams(id) ON DELETE SET NULL, -- Optional reference
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID, -- Will reference auth.users once auth is set up
  status task_status NOT NULL DEFAULT 'backlog',
  priority task_priority NOT NULL DEFAULT 'medium',
  labels JSONB DEFAULT '[]'::jsonb,
  relationships JSONB DEFAULT '{}'::jsonb, -- For quick reference to relationships
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships table for knowledge graph
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type entity_type NOT NULL,
  source_id UUID NOT NULL,
  relationship_type relationship_type NOT NULL,
  target_type entity_type NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Enforce uniqueness of relationships
  UNIQUE(source_type, source_id, relationship_type, target_type, target_id)
);

-- INDEXES

-- Workspace indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_name ON workspaces(name);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- Workstream indexes
CREATE INDEX IF NOT EXISTS idx_workstreams_project_id ON workstreams(project_id);
CREATE INDEX IF NOT EXISTS idx_workstreams_owner_id ON workstreams(owner_id);
CREATE INDEX IF NOT EXISTS idx_workstreams_status ON workstreams(status);
CREATE INDEX IF NOT EXISTS idx_workstreams_name ON workstreams(name);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workstream_id ON tasks(workstream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);

-- Relationship indexes for efficient traversal
CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);

-- COMMENTS
COMMENT ON TABLE workspaces IS 'Top-level organizational containers';
COMMENT ON TABLE projects IS 'Projects belong to workspaces and contain workstreams and tasks';
COMMENT ON TABLE workstreams IS 'Workstreams belong to projects and contain tasks';
COMMENT ON TABLE tasks IS 'Tasks belong to projects and optionally to workstreams';
COMMENT ON TABLE relationships IS 'Knowledge graph relationships between entities';

-- FUNCTIONS

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamp
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

-- Function to automatically create relationships when entities are created
CREATE OR REPLACE FUNCTION create_entity_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- If a project is created, create relationship with its workspace
  IF TG_TABLE_NAME = 'projects' AND TG_OP = 'INSERT' THEN
    INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
    VALUES ('project', NEW.id, 'project_belongs_to_workspace', 'workspace', NEW.workspace_id);
    
    INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
    VALUES ('workspace', NEW.workspace_id, 'workspace_contains_project', 'project', NEW.id);
  
  -- If a workstream is created, create relationship with its project
  ELSIF TG_TABLE_NAME = 'workstreams' AND TG_OP = 'INSERT' THEN
    INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
    VALUES ('workstream', NEW.id, 'workstream_belongs_to_project', 'project', NEW.project_id);
    
    INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
    VALUES ('project', NEW.project_id, 'project_contains_workstream', 'workstream', NEW.id);
  
  -- If a task is created, create relationships
  ELSIF TG_TABLE_NAME = 'tasks' AND TG_OP = 'INSERT' THEN
    -- Task always belongs to a project
    INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
    VALUES ('task', NEW.id, 'task_belongs_to_project', 'project', NEW.project_id);
    
    INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
    VALUES ('project', NEW.project_id, 'project_contains_task', 'task', NEW.id);
    
    -- If task belongs to a workstream, create that relationship too
    IF NEW.workstream_id IS NOT NULL THEN
      INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
      VALUES ('task', NEW.id, 'task_belongs_to_workstream', 'workstream', NEW.workstream_id);
      
      INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
      VALUES ('workstream', NEW.workstream_id, 'workstream_contains_task', 'task', NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic relationship creation
CREATE TRIGGER create_project_relationships
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION create_entity_relationships();

CREATE TRIGGER create_workstream_relationships
AFTER INSERT ON workstreams
FOR EACH ROW
EXECUTE FUNCTION create_entity_relationships();

CREATE TRIGGER create_task_relationships
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION create_entity_relationships();

-- Function to update relationships when entities are updated
CREATE OR REPLACE FUNCTION update_entity_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- If a task's workstream changes
  IF TG_TABLE_NAME = 'tasks' AND OLD.workstream_id IS DISTINCT FROM NEW.workstream_id THEN
    -- Remove old workstream relationship if it existed
    IF OLD.workstream_id IS NOT NULL THEN
      DELETE FROM relationships 
      WHERE (source_type = 'task' AND source_id = NEW.id AND relationship_type = 'task_belongs_to_workstream')
      OR (target_type = 'task' AND target_id = NEW.id AND relationship_type = 'workstream_contains_task');
    END IF;
    
    -- Add new workstream relationship if it exists
    IF NEW.workstream_id IS NOT NULL THEN
      INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
      VALUES ('task', NEW.id, 'task_belongs_to_workstream', 'workstream', NEW.workstream_id);
      
      INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
      VALUES ('workstream', NEW.workstream_id, 'workstream_contains_task', 'task', NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for relationship updates
CREATE TRIGGER update_task_relationships
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_entity_relationships();
