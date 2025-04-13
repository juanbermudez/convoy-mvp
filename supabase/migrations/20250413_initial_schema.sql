-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks (inspired by Linear)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  assignee_id UUID, -- Will reference auth.users(id) when Supabase Auth is enabled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Workflow Stages
CREATE TABLE workflow_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_checkpoint BOOLEAN DEFAULT FALSE,
  checkpoint_artifact_type TEXT, -- e.g., 'PLAN_REVIEW', 'CODE_REVIEW', 'FUNCTIONALITY_REVIEW'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Rules
CREATE TABLE project_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_content TEXT NOT NULL, -- JSON or structured rule content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Feed Items
CREATE TABLE activity_feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID, -- Will reference auth.users(id) when Supabase Auth is enabled
  agent_id TEXT, -- For AI-generated events
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL, -- e.g., 'TASK_CREATED', 'STATUS_CHANGED', 'AI_COMMENT', 'USER_COMMENT'
  content TEXT NOT NULL
);

-- Insert some initial data

-- Default organization
INSERT INTO organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization');

-- Default workflow
INSERT INTO workflows (id, name, description, project_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Standard Development Workflow',
  'Default workflow for software development projects',
  NULL -- This is a global workflow template
);

-- Default workflow stages
INSERT INTO workflow_stages (workflow_id, name, order_index, is_checkpoint, checkpoint_artifact_type)
VALUES
('00000000-0000-0000-0000-000000000001', 'Planning', 1, true, 'PLAN_REVIEW'),
('00000000-0000-0000-0000-000000000001', 'Development', 2, false, NULL),
('00000000-0000-0000-0000-000000000001', 'Code Review', 3, true, 'CODE_REVIEW'),
('00000000-0000-0000-0000-000000000001', 'Testing', 4, false, NULL),
('00000000-0000-0000-0000-000000000001', 'Deployment', 5, true, 'FUNCTIONALITY_REVIEW'),
('00000000-0000-0000-0000-000000000001', 'Completed', 6, false, NULL);
