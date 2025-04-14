---
title: Memory Bank Pattern
description: Core Memory Bank concept and implementation for Convoy
---

# Memory Bank Pattern

## Overview

The Convoy Memory Bank is a structured system designed to store and retrieve project information in a way that's optimized for AI agent consumption. It follows a knowledge graph approach that connects entities and concepts in a meaningful way, making context retrieval efficient for AI agents.

## Memory Bank Structure

```
MEMORY_BANK
│
├── WORKSPACE/                  # Top-level organizational container
│   ├── metadata                # Workspace name, description, created date
│   ├── patterns/               # Workspace-level patterns
│   └── best-practices/         # Workspace-level best practices
│
├── PROJECTS/                   # Project-specific information
│   └── {project_id}/           # Individual project container
│       ├── metadata            # Project name, description, created date
│       ├── context             # High-level project context, goals, constraints
│       ├── workflows/          # Project-specific workflows
│       ├── tasks/              # Tasks for this project
│       └── history/            # Activity history
│
├── WORKFLOWS/                  # Reusable workflow definitions
│   ├── software-development    # Standard software dev workflow
│   ├── bug-fixing              # Bug fixing workflow
│   └── feature-implementation  # Feature implementation workflow
│
├── PATTERNS/                   # Reusable implementation patterns
│   ├── ui-components          # Common UI component patterns
│   ├── api-endpoints          # API endpoint patterns
│   └── database-models        # Database model patterns
│
└── BEST_PRACTICES/            # Coding standards and best practices
    ├── code-style             # Code style guidelines
    ├── testing                # Testing guidelines
    └── documentation          # Documentation guidelines
```

## Memory Bank Rules

The following rules govern how the AI agent interacts with the Memory Bank:

```
# This is a prompt pattern, not executable code

When working on a task, you should:

1. Retrieve relevant project data:
   - Project metadata and context
   - Parent information (workspace, milestone)
   - Task details and requirements

2. Retrieve workflow information:
   - Current workflow stage
   - Stage requirements and expectations
   - Next stage in the sequence

3. Find applicable patterns and best practices:
   - Patterns relevant to the current task
   - Best practices for this type of work
   - Previous similar implementations

4. Check recent activity:
   - Previous decisions on this task
   - Recent changes or updates
   - Human feedback from checkpoints

5. Assemble complete context before starting work

When at a checkpoint:
1. Pause for human review
2. Generate appropriate summary based on checkpoint type
3. Present clear approve/revise options
4. Wait for explicit human approval before proceeding
```

## Memory Retrieval Mechanisms

The Memory Bank uses three primary retrieval mechanisms:

1. **Direct Retrieval**: Fetching specific data by path/id (e.g., `PROJECT[project-123].overview.mission`)
2. **Relevant Retrieval**: Using semantic search to find the most relevant information (e.g., `getRelevantPatterns(PROJECT[project-123], "authentication")`)
3. **Contextual Assembly**: Combining various elements to create a comprehensive context for a task

## Implementation with Supabase

In the simplified implementation, the Memory Bank is implemented using Supabase with the following schema:

```sql
-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  overview TEXT,
  tech_stack JSONB,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID REFERENCES milestones(id),
  parent_task_id UUID REFERENCES tasks(id),
  title TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT DEFAULT 'standard_dev_workflow',
  current_stage TEXT DEFAULT 'PLAN',
  status TEXT DEFAULT 'PLANNED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Feed
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id),
  type TEXT NOT NULL,
  content TEXT,
  checkpoint_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Workflows
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB
);

-- Patterns
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  pattern_type TEXT NOT NULL,
  content TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Best Practices
CREATE TABLE best_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## AI Context Retrieval

When a task is assigned to the AI agent, the following context structure is provided:

```markdown
# Task Context for: [Task Title]

## Task Information
- **ID**: [task_id]
- **Title**: [task_title]
- **Description**: [task_description]
- **Current Stage**: [current_stage_name]
- **Status**: [task_status]

## Hierarchical Context
- **Workspace**: [workspace_name]
- **Project**: [project_name]
- **Milestone**: [milestone_name]
- **Parent Task**: [parent_task_title] (if applicable)

## Project Overview
[project_overview_text]

## Relevant Patterns
- **[pattern_name]**: [pattern_description]
- **[pattern_name]**: [pattern_description]

## Relevant Best Practices
- **[practice_name]**: [practice_description]
- **[practice_name]**: [practice_description]

## Recent Activity
- [timestamp]: [activity_type] - [activity_description]
- [timestamp]: [activity_type] - [activity_description]
```

This Memory Bank structure provides a comprehensive but simplified approach to managing project context, workflows, and best practices in a way that's optimized for AI consumption while allowing for human oversight through the checkpoint system.
