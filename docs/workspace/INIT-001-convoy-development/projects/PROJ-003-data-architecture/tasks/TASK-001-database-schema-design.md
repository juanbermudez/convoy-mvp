---
id: TASK-001
name: Database Schema Design
description: Design and implement the database schema for workspaces, projects, workstreams, and tasks
created_at: 2025-04-14
updated_at: 2025-04-14
status: to-do
priority: high
assigned_to: 
project_id: PROJ-003
project_name: Data Architecture Implementation
parent_id: INIT-001
parent_name: Convoy Development
dependencies: []
blocked_by: []
blocks: [TASK-002, TASK-003]
estimated_hours: 8
---

# Database Schema Design

## Task Description

Design and implement the database schema for workspaces, projects, workstreams, and tasks in Supabase. This includes creating the necessary tables, relationships, constraints, and indexes to support the knowledge graph architecture.

## Objectives

- Create a comprehensive database schema that aligns with Linear's organizational model
- Implement tables for workspaces, projects, workstreams, and tasks
- Create a relationship table to support the knowledge graph approach
- Implement appropriate indexes for efficient querying
- Ensure the schema supports the requirements for AI context retrieval

## Requirements

1. The schema must support the entity hierarchy:
   - Workspaces contain projects
   - Projects contain workstreams and/or tasks
   - Workstreams contain tasks
   - Tasks must belong to a project, and optionally to a workstream

2. The relationship table must support:
   - Different entity types as source and target
   - Different relationship types
   - Metadata for relationship properties
   - Efficient traversal in both directions

3. Core tables must include:
   - UUID primary keys
   - Created/updated timestamps
   - Appropriate foreign key relationships
   - Status fields for workflow management
   - Description fields for context

4. Indexes must be created for:
   - Foreign key relationships
   - Frequently queried fields
   - Relationship traversal

## Technical Approach

1. Use Supabase's SQL editor to create the tables
2. Implement the following tables:
   - `workspaces`
   - `projects`
   - `workstreams`
   - `tasks`
   - `relationships`

3. Create appropriate indexes for efficiency

4. Test the schema with sample data

5. Document the schema design and query patterns

## Implementation Details

### Workspace Table

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Project Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  status TEXT NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### Workstream Table

```sql
CREATE TABLE workstreams (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  status TEXT NOT NULL,
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workstreams_project_id ON workstreams(project_id);
CREATE INDEX idx_workstreams_owner_id ON workstreams(owner_id);
CREATE INDEX idx_workstreams_status ON workstreams(status);
```

### Task Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  workstream_id UUID REFERENCES workstreams(id), -- Optional reference
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  status TEXT NOT NULL,
  priority TEXT,
  labels JSONB DEFAULT '[]'::jsonb,
  relationships JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_workstream_id ON tasks(workstream_id);
CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### Relationship Table

```sql
CREATE TABLE relationships (
  id UUID PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  relationship_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Enforce uniqueness of relationships
  UNIQUE(source_type, source_id, relationship_type, target_type, target_id)
);

CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

## Completion Criteria

- All tables are created in Supabase
- Indexes are created for efficient querying
- The schema is validated with sample data
- Documentation of the schema is complete
- The design supports the requirements for knowledge graph traversal

## Notes

- The schema should be flexible enough to support future enhancements
- Consider the impact on sync performance when designing the schema
- Ensure the schema can efficiently support AI context retrieval
- Document any decisions or trade-offs made during the design process
