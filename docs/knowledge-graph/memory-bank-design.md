---
title: Memory Bank Design
description: Detailed design of the Convoy Memory Bank implementation
---

# Memory Bank Design

## Overview

The Convoy Memory Bank is a structured knowledge retrieval system inspired by the [Cline Memory Bank pattern](https://docs.cline.bot/improving-your-prompting-skills/cline-memory-bank) but optimized for AI-driven software development. It stores project information, task context, workflows, and development patterns in a way that both AI agents and humans can efficiently access and utilize.

## Design Philosophy

Our Memory Bank design follows these core principles:

1. **Context-Centric**: Organize information around the context needed for specific tasks
2. **Hierarchical**: Structure information in meaningful hierarchies that reflect project organization
3. **Knowledge as Prompts**: Store information in formats optimized for AI prompt engineering
4. **Human-AI Collaboration**: Support both AI consumption and human review/editing
5. **Evolution-Ready**: Start simple but design for future growth and sophistication

## Memory Bank Structure

```
MEMORY_BANK
│
├── WORKSPACE/                 # Top-level organizational container
│   ├── metadata               # Name, description, created date
│   ├── patterns/              # Workspace-level patterns
│   ├── best-practices/        # Workspace-level best practices
│   │
│   └── PROJECT/               # Major development initiative (maps to Linear projects)
│       ├── metadata           # Name, description, status, dates
│       ├── overview           # Project overview, goals, architecture
│       ├── patterns/          # Project-specific patterns
│       ├── tech-stack/        # Technologies and tools used
│       │
│       └── MILESTONE/         # Key deliverable checkpoint
│           ├── metadata       # Name, description, target date
│           ├── requirements   # Success criteria and requirements
│           │
│           └── TASK/          # Individual work items (maps to Linear issues)
│               ├── metadata   # Title, description, status, priority
│               ├── workflow   # Current workflow stage and history
│               ├── activity/  # Chronological record of activities
│               └── SUBTASK/   # Child tasks (parent-child relationship)
│                   ├── metadata
│                   ├── workflow
│                   └── activity/
```

This structure aligns with our hierarchical organization by using parent-child task relationships rather than separate "slices". This provides better organizational benefit while leveraging Linear's native support for task hierarchies.

## Knowledge Types

The Memory Bank stores several types of knowledge:

1. **Structural Information**:
   - Workspace/Project/Milestone/Task hierarchy
   - Task dependencies and relationships
   - Task status and workflow stage

2. **Contextual Information**:
   - Project overviews and goals
   - Task descriptions and requirements
   - Technical constraints and decisions

3. **Pattern Knowledge**:
   - Reusable development patterns
   - Architectural patterns
   - UI/UX patterns
   - Code patterns

4. **Procedural Knowledge**:
   - Workflow definitions
   - Best practices
   - Validation procedures
   - Development processes

5. **Historical Knowledge**:
   - Activity records
   - Past decisions
   - Previous implementations
   - Plan revisions

## Storage Format

All knowledge is stored in formats optimized for both AI consumption and human readability:

1. **Markdown for Textual Content**:
   - Structured with clear headings
   - Uses lists and tables for organization
   - Includes code blocks with syntax highlighting
   - Follows consistent patterns for similar content types

2. **JSON for Structured Data**:
   - Status, metadata, and relationships
   - Configuration information
   - Statistical data

3. **YAML for Configuration**:
   - Workflow definitions
   - Pattern templates
   - Rule configurations

## AI Retrieval Mechanisms

When an AI agent needs to retrieve context for a task, it follows this process:

1. **Start with Task Context**:
   ```
   Task ID: [id]
   Title: [title]
   Description: [description]
   Current Workflow Stage: [stage]
   Status: [status]
   ```

2. **Follow Hierarchical Links**:
   ```
   Part of: Task [parent_task_id] (if a subtask)
   Within Milestone: [milestone_name]
   Within Project: [project_name]
   Within Workspace: [workspace_name]
   ```

3. **Retrieve Activity History**:
   ```
   Recent Activities:
   - [timestamp]: [activity_type] - [description]
   - [timestamp]: [activity_type] - [description]
   ```

4. **Apply Relevant Patterns**:
   ```
   Relevant Patterns:
   - [pattern_name]: [pattern_description]
   - [pattern_name]: [pattern_description]
   ```

5. **Apply Best Practices**:
   ```
   Relevant Best Practices:
   - [practice_name]: [practice_description]
   - [practice_name]: [practice_description]
   ```

## Cline Rule Integration

To integrate with Cline, we use rules that trigger the appropriate memory retrieval:

```
# This is a prompt, not executable code

When working on a task, you should:

1. Identify the task's context in the hierarchy:
   - What project does it belong to?
   - What milestone does it belong to?
   - Is it a subtask of another task?

2. Retrieve the full context by mentally traversing:
   Task → Parent Task (if applicable) → Milestone → Project → Workspace

3. Review the relevant activity history:
   - What has already happened with this task?
   - What decisions have been made?
   - What is the current workflow stage?

4. Look for applicable patterns and best practices:
   - Are there project-specific patterns to follow?
   - What best practices apply to this kind of work?

5. Apply the appropriate workflow for the current stage:
   - PLAN: Create an implementation strategy
   - PLAN_REVIEW: Await human approval
   - IMPLEMENT: Execute the plan
   - VALIDATE: Verify the implementation
   - CODE_REVIEW: Await human approval
   - COMMIT: Finalize changes
```

## Implementation with Supabase

The Memory Bank is implemented using Supabase with a schema that reflects our hierarchical structure:

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

## Example Knowledge Retrieval

When an AI assistant is working on a task, it would access context like this:

```markdown
# Task Context for Task ID: task-123

## Task Information
- **Title**: Implement User Authentication API
- **Description**: Create a REST API endpoint for user authentication using JWT tokens
- **Current Stage**: PLAN
- **Status**: IN_PROGRESS
- **Part of**: Project "Convoy MVP" > Milestone "Auth System v1"

## Project Overview
Convoy MVP is an AI orchestration platform that enhances developer productivity through structured workflows and knowledge graphs. The platform will coordinate AI agents within a human-supervised development process.

## Tech Stack
- Backend: Node.js with Express
- Database: PostgreSQL via Supabase
- Authentication: JWT with Supabase Auth

## Relevant Patterns
- **API Endpoint Pattern**: Standard structure for REST API endpoints with validation, error handling, and response formatting
- **JWT Auth Pattern**: Implementation pattern for JWT-based authentication with refresh tokens

## Relevant Best Practices
- **API Security**: All endpoints must implement proper validation and rate limiting
- **Code Style**: Follow ESLint configuration with Prettier formatting
- **Testing**: Unit tests with Jest, minimum 80% coverage

## Activity History
- 2023-04-10 09:15: TASK_CREATED - Task created by John Doe
- 2023-04-10 15:30: STAGE_TRANSITION - Moved to PLAN stage
```

## Future Evolution

This Memory Bank design is intentionally simplified for our MVP but designed to evolve in these directions:

1. **Semantic Retrieval**: Enhanced context retrieval using embedding-based semantic search
2. **Knowledge Graphs**: Explicit representation of relationships between different knowledge entities
3. **Automated Updates**: Automatic updates to the knowledge graph based on activity
4. **Learning Mechanisms**: Improving patterns based on successful implementations
5. **Multi-Agent Collaboration**: Supporting multiple AI agents collaborating on related tasks

By starting with this approach, we create a foundation that can grow more sophisticated while maintaining the core benefits of structured context retrieval for AI agents.
