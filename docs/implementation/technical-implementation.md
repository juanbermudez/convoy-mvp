---
title: Technical Implementation
description: Detailed technical implementation of the Convoy platform
---

# Technical Implementation

This document details the technical implementation of the Convoy platform, including the database schema, API architecture, and system components.

## System Architecture

Convoy uses a streamlined architecture with these key components:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│   AI Rules    │────►│  AI Assistant │────►│  Web Dashboard│
│               │     │               │     │               │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        │                     │                     │
        │                     ▼                     │
        │             ┌───────────────┐             │
        └────────────►│   Supabase    │◄────────────┘
                      │  Knowledge    │
                      │    Graph      │
                      └───────────────┘
```

### 1. AI Rules

AI rules are implemented as a carefully crafted prompt pattern that:
- Defines the Memory Bank pattern for context retrieval
- Structures the workflow stages and checkpoints
- Guides AI behavior and decision-making
- Ensures proper documentation of activities

### 2. AI Assistant

The AI assistant serves as the agent that:
- Follows the AI rules to execute tasks
- Retrieves context from the knowledge graph
- Presents work at human checkpoints
- Documents activities in the activity feed

### 3. Supabase Knowledge Graph

Supabase provides the storage layer that:
- Maintains the hierarchical structure (Workspace, Project, Milestone, Slice, Task)
- Stores implementation patterns and best practices
- Records all activities in an activity feed
- Tracks workflow state and checkpoints

### 4. Web Dashboard

A simple web interface built with:
- Next.js for the frontend framework
- shadcn/ui for UI components
- Supabase client for database access
- Authentication and permission management

## Database Schema

The knowledge graph is implemented in Supabase with this schema:

### Core Tables

#### Workspaces

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  overview TEXT,
  tech_stack JSONB,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX projects_workspace_id_idx ON projects(workspace_id);
```

#### Milestones

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX milestones_project_id_idx ON milestones(project_id);
```

#### Slices

```sql
CREATE TABLE slices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID REFERENCES milestones(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX slices_milestone_id_idx ON slices(milestone_id);
```

#### Tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slice_id UUID REFERENCES slices(id) NOT NULL,
  parent_task_id UUID REFERENCES tasks(id),
  title TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT DEFAULT 'standard_dev_workflow',
  current_stage TEXT DEFAULT 'PLAN',
  status TEXT DEFAULT 'PLANNED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX tasks_slice_id_idx ON tasks(slice_id);
CREATE INDEX tasks_parent_task_id_idx ON tasks(parent_task_id);
```

### Supporting Tables

#### Workflows

```sql
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The `stages` field contains a JSON structure like:

```json
[
  {
    "name": "PLAN",
    "description": "Create implementation plan",
    "is_checkpoint": false
  },
  {
    "name": "PLAN_REVIEW",
    "description": "Human review of implementation plan",
    "is_checkpoint": true,
    "checkpoint_type": "PLAN_REVIEW"
  },
  {
    "name": "IMPLEMENT",
    "description": "Execute implementation plan",
    "is_checkpoint": false
  },
  ...
]
```

#### Activity Feed

```sql
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  checkpoint_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX activity_feed_task_id_idx ON activity_feed(task_id);
CREATE INDEX activity_feed_created_at_idx ON activity_feed(created_at);
```

#### Patterns

```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  pattern_type TEXT NOT NULL,
  content TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX patterns_workspace_id_idx ON patterns(workspace_id);
CREATE INDEX patterns_project_id_idx ON patterns(project_id);
```

#### Best Practices

```sql
CREATE TABLE best_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX best_practices_workspace_id_idx ON best_practices(workspace_id);
CREATE INDEX best_practices_project_id_idx ON best_practices(project_id);
```

## API Implementation

### Key Supabase Functions

These functions handle the core operations in the Convoy system:

#### Task Context Retrieval

```javascript
export async function getTaskWithContext(taskId) {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  if (taskError) throw taskError;
  
  // Get slice
  const { data: slice } = await supabase
    .from('slices')
    .select('*')
    .eq('id', task.slice_id)
    .single();
  
  // Get milestone
  const { data: milestone } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', slice.milestone_id)
    .single();
  
  // Get project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', milestone.project_id)
    .single();
  
  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', project.workspace_id)
    .single();
  
  // Get relevant patterns
  const { data: patterns } = await supabase
    .from('patterns')
    .select('*')
    .or(`workspace_id.eq.${workspace.id},project_id.eq.${project.id}`);
  
  // Get relevant best practices
  const { data: bestPractices } = await supabase
    .from('best_practices')
    .select('*')
    .or(`workspace_id.eq.${workspace.id},project_id.eq.${project.id}`);
  
  // Get workflow
  const { data: workflow } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', task.workflow_type)
    .single();
  
  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Return the complete context
  return {
    task,
    slice,
    milestone,
    project,
    workspace,
    patterns,
    bestPractices,
    workflow,
    currentStage: workflow.stages.find(s => s.name === task.current_stage),
    recentActivity
  };
}
```

#### Record Activity

```javascript
export async function recordActivity({ taskId, type, content, createdBy }) {
  const { data, error } = await supabase
    .from('activity_feed')
    .insert({
      task_id: taskId,
      type,
      content,
      created_by: createdBy || 'AI'
    });
  
  if (error) throw error;
  return data;
}
```

#### Update Workflow Stage

```javascript
export async function updateWorkflowStage({ taskId, newStageName }) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      current_stage: newStageName,
      updated_at: new Date()
    })
    .eq('id', taskId);
  
  if (error) throw error;
  
  // Also record the stage transition in activity feed
  await recordActivity({
    taskId,
    type: 'STAGE_TRANSITION',
    content: `Moved to ${newStageName} stage`,
    createdBy: 'SYSTEM'
  });
  
  return data;
}
```

## Web Dashboard Implementation

The web dashboard consists of these key views:

### 1. Task Dashboard

- Displays tasks grouped by workflow stage
- Shows status and progress indicators
- Provides filtering and search capabilities

### 2. Task Detail View

- Shows complete task information and context
- Displays activity feed with chronological history
- Provides checkpoint approval interfaces

### 3. Knowledge Graph Explorer

- Visual representation of the entity relationships
- Interactive navigation of the hierarchy
- Filtering and search capabilities

### 4. Pattern Library

- Catalog of reusable implementation patterns
- Categorization and search functionality
- Pattern creation and editing interface

## Security Implementation

Security is implemented through Supabase with:

### 1. Authentication

- Email/password authentication
- Social login options (Google, GitHub)
- JWT token-based sessions

### 2. Authorization

- Row-level security policies on all tables
- Role-based access control
- Permission management for workspaces and projects

### 3. Data Protection

- Data encryption at rest
- Secure API endpoints
- Input validation and sanitization

## Deployment Architecture

The system is deployed with:

### 1. Frontend

- Vercel for Next.js hosting
- Edge caching for performance
- Analytics integration

### 2. Backend

- Supabase Cloud for database and authentication
- Edge functions for API endpoints
- Real-time subscriptions for live updates

### 3. AI Integration

- API connections to AI assistants
- Context formatting and transmission
- Response parsing and processing

## Performance Optimizations

The implementation includes these optimizations:

### 1. Database

- Indexes on frequently queried fields
- Efficient query patterns
- Connection pooling

### 2. Knowledge Graph Traversal

- Optimized context retrieval
- Batched queries
- Caching of frequently accessed contexts

### 3. User Interface

- Lazy loading of components
- Virtualized lists for large datasets
- Optimized asset delivery
