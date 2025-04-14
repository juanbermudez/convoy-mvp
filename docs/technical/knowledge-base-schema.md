---
title: Knowledge Base Schema
description: Database schema for the Convoy knowledge base
---

# Knowledge Base Schema

## Overview

This document outlines the database schema for the Convoy knowledge base, which implements the Memory Bank pattern. The schema is designed to store project context, task information, activities, and development patterns in a structured format that can be efficiently queried by AI agents.

## Schema Design Principles

The schema follows these core principles:

1. **Hierarchical Organization**: Structures data in a natural hierarchy from workspace to tasks
2. **Relationship Clarity**: Makes relationships explicit through foreign keys
3. **Historical Tracking**: Records all activities and changes
4. **Pattern Storage**: Enables storage and retrieval of reusable patterns
5. **AI Optimized**: Structured for efficient AI context retrieval

## Core Tables

### Workspaces

The top-level organizational unit containing projects.

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Projects

Major development initiatives within a workspace. Maps to Linear projects.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  overview TEXT,           -- Detailed project overview in markdown
  tech_stack JSONB,        -- Technology stack as structured JSON
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Milestones

Key deliverable checkpoints within a project. Maps to Linear milestones.

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  requirements TEXT,        -- Success criteria and requirements
  target_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tasks

Individual work items. Maps to Linear issues. Can have parent-child relationships.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id),  -- For subtasks
  title TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT DEFAULT 'standard_dev_workflow',
  current_stage TEXT DEFAULT 'PLAN',
  status TEXT DEFAULT 'PLANNED',
  priority TEXT DEFAULT 'MEDIUM',
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Activity Tracking

### Activity Feed

Records all actions taken on tasks, creating a chronological history.

```sql
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,          -- Activity type (e.g., PLAN_CREATED, STAGE_TRANSITION)
  content TEXT,                -- Activity content (can be JSON string)
  checkpoint_type TEXT,        -- For checkpoint activities
  reference_id UUID,           -- Optional reference to related entity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL     -- Who/what created this activity (AI or human)
);
```

### Task Dependencies

Records dependencies between tasks.

```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)  -- Prevent duplicate dependencies
);
```

## Knowledge and Patterns

### Workflows

Defines workflow stages and transitions.

```sql
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL,       -- JSON array of workflow stages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Patterns

Reusable development patterns that can be applied across tasks.

```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  pattern_type TEXT NOT NULL,  -- Type of pattern (ARCHITECTURE, CODE, UI, etc.)
  content TEXT,                -- Pattern content (usually markdown)
  workspace_id UUID REFERENCES workspaces(id),  -- NULL for global patterns
  project_id UUID REFERENCES projects(id),      -- NULL for workspace-wide patterns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Best Practices

Development best practices and standards.

```sql
CREATE TABLE best_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,               -- Practice category (CODE, TESTING, etc.)
  workspace_id UUID REFERENCES workspaces(id),  -- NULL for global practices
  project_id UUID REFERENCES projects(id),      -- NULL for workspace-wide practices
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Standard Workflow Definition

The standard development workflow is defined as a JSON structure:

```json
{
  "stages": [
    {
      "name": "PLAN",
      "description": "Analyze task and create implementation plan",
      "order": 1,
      "is_checkpoint": false
    },
    {
      "name": "PLAN_REVIEW",
      "description": "Human review of the implementation plan",
      "order": 2,
      "is_checkpoint": true,
      "checkpoint_type": "PLAN_REVIEW"
    },
    {
      "name": "IMPLEMENT",
      "description": "Execute the approved plan",
      "order": 3,
      "is_checkpoint": false
    },
    {
      "name": "VALIDATE",
      "description": "Verify implementation through tests and validation",
      "order": 4,
      "is_checkpoint": false
    },
    {
      "name": "CODE_REVIEW",
      "description": "Human review of the implemented code",
      "order": 5,
      "is_checkpoint": true,
      "checkpoint_type": "CODE_REVIEW"
    },
    {
      "name": "COMMIT",
      "description": "Prepare and execute commit",
      "order": 6,
      "is_checkpoint": false
    }
  ]
}
```

## Indexes for Performance

```sql
-- Create indexes for foreign key columns
CREATE INDEX tasks_milestone_id_idx ON tasks (milestone_id);
CREATE INDEX tasks_parent_task_id_idx ON tasks (parent_task_id);
CREATE INDEX milestones_project_id_idx ON milestones (project_id);
CREATE INDEX projects_workspace_id_idx ON projects (workspace_id);
CREATE INDEX activity_feed_task_id_idx ON activity_feed (task_id);
CREATE INDEX task_dependencies_task_id_idx ON task_dependencies (task_id);
CREATE INDEX task_dependencies_depends_on_task_id_idx ON task_dependencies (depends_on_task_id);
CREATE INDEX patterns_workspace_id_idx ON patterns (workspace_id);
CREATE INDEX patterns_project_id_idx ON patterns (project_id);
CREATE INDEX best_practices_workspace_id_idx ON best_practices (workspace_id);
CREATE INDEX best_practices_project_id_idx ON best_practices (project_id);
```

## Context Retrieval Process

When an AI agent needs context for a task, it follows this conceptual process:

1. **Start with the Task**: Get the specific task details
2. **Follow Relationships**: Traverse up to milestone, project, and workspace
3. **Get Activity History**: Retrieve recent activities for the task
4. **Find Dependencies**: Check for task dependencies and dependents
5. **Gather Patterns**: Find applicable patterns and best practices
6. **Assemble Context**: Combine all information into a complete context

## Supabase Implementation

This schema is designed to be implemented in Supabase, which provides PostgreSQL database capabilities. The process for retrieving complete task context might look like this:

```javascript
async function getTaskContext(taskId) {
  // Get the task with its milestone
  const { data: task } = await supabase
    .from('tasks')
    .select('*, milestones(*)')
    .eq('id', taskId)
    .single();
  
  // Get the project with its workspace
  const { data: project } = await supabase
    .from('projects')
    .select('*, workspaces(*)')
    .eq('id', task.milestones.project_id)
    .single();
  
  // Get recent activity
  const { data: activities } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Get relevant patterns
  const { data: patterns } = await supabase
    .from('patterns')
    .select('*')
    .or(`workspace_id.eq.${project.workspaces.id},project_id.eq.${project.id}`);
  
  // Assemble and return complete context
  return {
    task,
    milestone: task.milestones,
    project,
    workspace: project.workspaces,
    activities,
    patterns
  };
}
```

## Implementation Notes

1. **JSON/JSONB Columns**: Some columns use JSONB for flexible structured data storage. This is particularly useful for workflow stages and technology stack information.

2. **Relationships**: The schema uses explicit foreign key relationships to maintain data integrity and enable efficient joins.

3. **Task Hierarchies**: Tasks can have parent-child relationships, enabling the organization of work into main tasks and subtasks.

4. **Pattern Scoping**: Patterns and best practices can be scoped to different levels (global, workspace, project) with NULL values indicating broader scope.

5. **Activity Feed**: The activity feed serves as an audit trail and provides historical context for AI agents.

6. **UUID Primary Keys**: UUIDs are used as primary keys to avoid collisions and enable distributed systems.

This schema provides a solid foundation for the Convoy knowledge base, supporting the Memory Bank pattern and efficient context retrieval for AI agents. It balances simplicity with the necessary structure to capture hierarchical relationships and historical activity.
