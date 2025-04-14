-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema version tracking table
CREATE TABLE IF NOT EXISTS schema_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Insert initial schema version
INSERT INTO schema_versions (version, description)
VALUES ('20250414000000', 'Initial schema creation');

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  overview TEXT,
  tech_stack JSONB,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'PLANNED',
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  current_stage TEXT DEFAULT 'PLAN',
  status TEXT DEFAULT 'TODO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE
);

-- Create task dependencies table
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate dependencies
  UNIQUE(task_id, depends_on_task_id),
  -- Prevent self-dependencies
  CHECK(task_id != depends_on_task_id)
);

-- Create activity feed table
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  actor_id UUID, -- Could reference a users table in the future
  activity_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patterns table
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pattern_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure patterns are scoped either globally (both null), to a workspace, or to a project
  CHECK (
    (workspace_id IS NULL AND project_id IS NULL) OR
    (workspace_id IS NOT NULL AND project_id IS NULL) OR
    (workspace_id IS NULL AND project_id IS NOT NULL)
  )
);

-- Create best practices table
CREATE TABLE best_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure best practices are scoped either globally, to a workspace, or to a project
  CHECK (
    (workspace_id IS NULL AND project_id IS NULL) OR
    (workspace_id IS NOT NULL AND project_id IS NULL) OR
    (workspace_id IS NULL AND project_id IS NOT NULL)
  )
);

-- Create indexes for foreign keys and frequently queried fields
CREATE INDEX projects_workspace_id_idx ON projects (workspace_id);
CREATE INDEX milestones_project_id_idx ON milestones (project_id);
CREATE INDEX tasks_milestone_id_idx ON tasks (milestone_id);
CREATE INDEX tasks_parent_task_id_idx ON tasks (parent_task_id);
CREATE INDEX task_dependencies_task_id_idx ON task_dependencies (task_id);
CREATE INDEX task_dependencies_depends_on_task_id_idx ON task_dependencies (depends_on_task_id);
CREATE INDEX activity_feed_task_id_idx ON activity_feed (task_id);
CREATE INDEX activity_feed_created_at_idx ON activity_feed (created_at);
CREATE INDEX patterns_workspace_id_idx ON patterns (workspace_id);
CREATE INDEX patterns_project_id_idx ON patterns (project_id);
CREATE INDEX best_practices_workspace_id_idx ON best_practices (workspace_id);
CREATE INDEX best_practices_project_id_idx ON best_practices (project_id);

-- Create indexes for search fields
CREATE INDEX workspaces_name_idx ON workspaces (name);
CREATE INDEX projects_name_idx ON projects (name);
CREATE INDEX milestones_name_idx ON milestones (name);
CREATE INDEX tasks_title_idx ON tasks (title);
CREATE INDEX tasks_status_idx ON tasks (status);
CREATE INDEX tasks_current_stage_idx ON tasks (current_stage);

-- Create GIN indexes for JSONB fields
CREATE INDEX workflows_stages_idx ON workflows USING GIN (stages);
CREATE INDEX patterns_content_idx ON patterns USING GIN (content);
CREATE INDEX best_practices_content_idx ON best_practices USING GIN (content);
