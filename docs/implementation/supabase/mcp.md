---
title: Memory Context Provider (MCP)
description: Documentation of the Memory Context Provider for retrieving AI context
---

# Memory Context Provider (MCP)

The Memory Context Provider (MCP) is a crucial component of the Convoy system that enables AI agents to retrieve and understand the complete context of a task. This document describes the MCP functions and how they work.

## Overview

The MCP provides a set of functions for retrieving hierarchical context from the Convoy knowledge graph. It traverses the relationships between entities (task → milestone → project → workspace) and assembles a comprehensive context object that includes all relevant information.

## Core Functionality

The MCP has three primary responsibilities:

1. **Context Retrieval**: Retrieving the complete context for a task
2. **Activity Tracking**: Recording activities related to tasks
3. **Data Access**: Providing utility functions for accessing related data

## Context Retrieval

The main function of the MCP is retrieving context for a task:

```typescript
async function getTaskContext(taskId: string): Promise<TaskContext | null>
```

This function fetches the complete context for a task, including:

- The task itself
- Its milestone
- The project the milestone belongs to
- The workspace the project belongs to
- The parent task (if applicable)
- Subtasks
- Task dependencies
- Recent activities
- Relevant patterns
- Relevant best practices
- The workflow definition

### TaskContext Type

The task context is returned as a structured object with this type:

```typescript
type TaskContext = {
  task: Task;
  milestone: Milestone;
  project: Project;
  workspace: Workspace;
  parent_task?: Task | null;
  subtasks: Task[];
  dependencies: Task[];
  activities: Activity[];
  patterns: Pattern[];
  best_practices: BestPractice[];
  workflow: Workflow;
};
```

### Context Assembly Process

The `getTaskContext` function performs the following steps:

1. Fetch the task by ID
2. Fetch the milestone the task belongs to
3. Fetch the project the milestone belongs to
4. Fetch the workspace the project belongs to
5. Fetch the parent task if applicable
6. Fetch all subtasks
7. Fetch all dependencies
8. Fetch recent activities
9. Fetch relevant patterns (global, workspace, and project)
10. Fetch relevant best practices (global, workspace, and project)
11. Fetch the workflow definition
12. Assemble and return the complete context object

This provides a comprehensive context that allows AI agents to understand the full picture of what they're working on.

## Activity Tracking

The MCP includes functions for tracking activities related to tasks:

```typescript
async function addTaskActivity(
  taskId: string,
  activityType: string,
  details?: any,
  actorId?: string
): Promise<Activity | null>
```

This function adds a new activity to the activity feed for a task. Activity types include:

- `STAGE_CHANGE`: When a task moves from one workflow stage to another
- `TASK_CREATED`: When a new task is created
- `TASK_UPDATED`: When a task is updated
- `DEPENDENCY_ADDED`: When a dependency is added to a task
- `DEPENDENCY_REMOVED`: When a dependency is removed from a task

### Stage Change Tracking

A special function is provided for updating task stages:

```typescript
async function updateTaskStage(
  taskId: string,
  newStage: string,
  actorId?: string
): Promise<Task | null>
```

This function updates the current stage of a task and automatically adds an activity to the activity feed tracking the stage change.

## Data Access Functions

The MCP also provides utility functions for retrieving hierarchical data:

```typescript
async function getWorkspaces(): Promise<Workspace[] | null>
async function getProjects(workspaceId: string): Promise<Project[] | null>
async function getMilestones(projectId: string): Promise<Milestone[] | null>
async function getTasks(milestoneId: string): Promise<Task[] | null>
```

These functions allow for traversing the knowledge graph hierarchy and retrieving data at each level.

## Usage Examples

### Retrieving Task Context

```typescript
import { getTaskContext } from '@/lib/supabase/mcp';

async function fetchTaskContext(taskId: string) {
  const context = await getTaskContext(taskId);
  
  if (context) {
    console.log('Task:', context.task.title);
    console.log('Milestone:', context.milestone.name);
    console.log('Project:', context.project.name);
    console.log('Workspace:', context.workspace.name);
    console.log('Activities:', context.activities.length);
    console.log('Patterns:', context.patterns.length);
    console.log('Best Practices:', context.best_practices.length);
  } else {
    console.error('Failed to retrieve context');
  }
}
```

### Updating Task Stage

```typescript
import { updateTaskStage } from '@/lib/supabase/mcp';

async function moveTaskToImplement(taskId: string) {
  const updatedTask = await updateTaskStage(taskId, 'IMPLEMENT');
  
  if (updatedTask) {
    console.log('Task moved to IMPLEMENT stage');
  } else {
    console.error('Failed to update task stage');
  }
}
```

### Adding Task Activity

```typescript
import { addTaskActivity } from '@/lib/supabase/mcp';

async function recordTaskComment(taskId: string, comment: string, userId: string) {
  await addTaskActivity(
    taskId,
    'COMMENT',
    {
      comment,
      timestamp: new Date().toISOString()
    },
    userId
  );
}
```

## Performance Considerations

The MCP performs multiple database queries to assemble the complete context for a task. To optimize performance:

1. **Indexes**: Ensure all foreign key columns have appropriate indexes
2. **Caching**: Consider implementing caching for frequently accessed contexts
3. **Pagination**: For activities, limit the number fetched (e.g., most recent 20)
4. **Selective Loading**: For large projects, consider loading some data lazily

## Error Handling

The MCP includes comprehensive error handling to ensure that failures in one part of the context retrieval process don't cause the entire operation to fail. Each step includes try/catch blocks and proper error logging.

If an error occurs during context retrieval, the function returns `null` and logs the error to the console.

## Future Enhancements

Potential future enhancements for the MCP include:

1. **Real-time updates**: Using Supabase real-time features to keep context up-to-date
2. **Context caching**: Implementing a caching layer to reduce database queries
3. **Selective context retrieval**: Adding options to retrieve only specific parts of the context
4. **Enhanced activity tracking**: More detailed activity tracking with user information

## Conclusion

The Memory Context Provider is a critical component of the Convoy system, enabling AI agents to retrieve comprehensive context for tasks. By traversing the knowledge graph hierarchy and assembling all relevant information, it provides the foundation for the Memory Bank pattern that powers Convoy's AI orchestration capabilities.
