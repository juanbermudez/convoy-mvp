---
title: Supabase Data Operations
description: Documentation of common data operations for the Convoy database
---

# Supabase Data Operations

This document describes the data operation functions provided for working with the Convoy database. These functions provide a convenient and consistent way to create, read, update, and delete data in the database.

## Overview

The data operations module provides a set of functions for common operations on Convoy entities, including:

- Creating entities
- Updating entities
- Deleting entities
- Retrieving entities and collections

All functions include proper type definitions and error handling, making them safe and easy to use in your application.

## Workspace Operations

### Creating a Workspace

```typescript
import { createWorkspace } from '@/lib/supabase/dataOperations';

async function createNewWorkspace() {
  const workspace = await createWorkspace({
    name: 'New Workspace',
    description: 'A new development workspace'
  });
  
  if (workspace) {
    console.log('Created workspace:', workspace.id);
  } else {
    console.error('Failed to create workspace');
  }
}
```

### Updating a Workspace

```typescript
import { updateWorkspace } from '@/lib/supabase/dataOperations';

async function updateWorkspaceName(id: string, newName: string) {
  const workspace = await updateWorkspace(id, {
    name: newName,
    updated_at: new Date().toISOString()
  });
  
  if (workspace) {
    console.log('Updated workspace:', workspace.name);
  } else {
    console.error('Failed to update workspace');
  }
}
```

### Deleting a Workspace

```typescript
import { deleteWorkspace } from '@/lib/supabase/dataOperations';

async function removeWorkspace(id: string) {
  const success = await deleteWorkspace(id);
  
  if (success) {
    console.log('Workspace deleted successfully');
  } else {
    console.error('Failed to delete workspace');
  }
}
```

## Project Operations

### Creating a Project

```typescript
import { createProject } from '@/lib/supabase/dataOperations';

async function createNewProject(workspaceId: string) {
  const project = await createProject({
    workspace_id: workspaceId,
    name: 'New Project',
    description: 'A new project in the workspace',
    tech_stack: {
      frontend: ['React', 'TypeScript'],
      backend: ['Node.js', 'Express']
    }
  });
  
  if (project) {
    console.log('Created project:', project.id);
  } else {
    console.error('Failed to create project');
  }
}
```

### Updating a Project

```typescript
import { updateProject } from '@/lib/supabase/dataOperations';

async function updateProjectStatus(id: string, newStatus: string) {
  const project = await updateProject(id, {
    status: newStatus,
    updated_at: new Date().toISOString()
  });
  
  if (project) {
    console.log('Updated project status:', project.status);
  } else {
    console.error('Failed to update project');
  }
}
```

### Deleting a Project

```typescript
import { deleteProject } from '@/lib/supabase/dataOperations';

async function removeProject(id: string) {
  const success = await deleteProject(id);
  
  if (success) {
    console.log('Project deleted successfully');
  } else {
    console.error('Failed to delete project');
  }
}
```

## Milestone Operations

### Creating a Milestone

```typescript
import { createMilestone } from '@/lib/supabase/dataOperations';

async function createNewMilestone(projectId: string) {
  const milestone = await createMilestone({
    project_id: projectId,
    name: 'New Milestone',
    description: 'A new milestone for the project',
    requirements: 'Complete the core functionality',
    status: 'PLANNED',
    target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
  });
  
  if (milestone) {
    console.log('Created milestone:', milestone.id);
  } else {
    console.error('Failed to create milestone');
  }
}
```

### Updating a Milestone

```typescript
import { updateMilestone } from '@/lib/supabase/dataOperations';

async function updateMilestoneStatus(id: string, newStatus: string) {
  const milestone = await updateMilestone(id, {
    status: newStatus,
    updated_at: new Date().toISOString()
  });
  
  if (milestone) {
    console.log('Updated milestone status:', milestone.status);
  } else {
    console.error('Failed to update milestone');
  }
}
```

### Deleting a Milestone

```typescript
import { deleteMilestone } from '@/lib/supabase/dataOperations';

async function removeMilestone(id: string) {
  const success = await deleteMilestone(id);
  
  if (success) {
    console.log('Milestone deleted successfully');
  } else {
    console.error('Failed to delete milestone');
  }
}
```

## Task Operations

### Creating a Task

```typescript
import { createTaskWithActivity } from '@/lib/supabase/dataOperations';

async function createNewTask(milestoneId: string, parentTaskId?: string) {
  const task = await createTaskWithActivity({
    milestone_id: milestoneId,
    parent_task_id: parentTaskId || null,
    title: 'New Task',
    description: 'A new task for the milestone',
    current_stage: 'PLAN',
    status: 'TODO'
  });
  
  if (task) {
    console.log('Created task:', task.id);
  } else {
    console.error('Failed to create task');
  }
}
```

### Managing Task Dependencies

```typescript
import { addTaskDependency, removeTaskDependency } from '@/lib/supabase/dataOperations';

// Add a dependency between tasks
async function addDependency(taskId: string, dependsOnTaskId: string) {
  const success = await addTaskDependency(taskId, dependsOnTaskId);
  
  if (success) {
    console.log('Added task dependency');
  } else {
    console.error('Failed to add task dependency');
  }
}

// Remove a dependency between tasks
async function removeDependency(taskId: string, dependsOnTaskId: string) {
  const success = await removeTaskDependency(taskId, dependsOnTaskId);
  
  if (success) {
    console.log('Removed task dependency');
  } else {
    console.error('Failed to remove task dependency');
  }
}
```

## Workflow Operations

### Getting Workflows

```typescript
import { getWorkflows, getWorkflowById } from '@/lib/supabase/dataOperations';

// Get all workflows
async function fetchAllWorkflows() {
  const workflows = await getWorkflows();
  
  if (workflows) {
    console.log('Found', workflows.length, 'workflows');
    return workflows;
  } else {
    console.error('Failed to fetch workflows');
    return [];
  }
}

// Get a specific workflow
async function fetchWorkflow(id: string) {
  const workflow = await getWorkflowById(id);
  
  if (workflow) {
    console.log('Found workflow:', workflow.name);
    return workflow;
  } else {
    console.error('Failed to fetch workflow');
    return null;
  }
}
```

## Pattern Operations

### Getting Patterns

```typescript
import { getPatterns } from '@/lib/supabase/dataOperations';

// Get global patterns
async function fetchGlobalPatterns() {
  const patterns = await getPatterns();
  
  if (patterns) {
    console.log('Found', patterns.length, 'global patterns');
    return patterns;
  } else {
    console.error('Failed to fetch patterns');
    return [];
  }
}

// Get workspace-specific patterns
async function fetchWorkspacePatterns(workspaceId: string) {
  const patterns = await getPatterns(workspaceId);
  
  if (patterns) {
    console.log('Found', patterns.length, 'patterns for workspace');
    return patterns;
  } else {
    console.error('Failed to fetch patterns');
    return [];
  }
}

// Get project-specific patterns
async function fetchProjectPatterns(projectId: string) {
  const patterns = await getPatterns(undefined, projectId);
  
  if (patterns) {
    console.log('Found', patterns.length, 'patterns for project');
    return patterns;
  } else {
    console.error('Failed to fetch patterns');
    return [];
  }
}
```

### Creating a Pattern

```typescript
import { createPattern } from '@/lib/supabase/dataOperations';

async function createNewPattern(workspaceId: string) {
  const pattern = await createPattern({
    workspace_id: workspaceId,
    name: 'API Error Handling Pattern',
    description: 'Standard pattern for handling API errors',
    pattern_type: 'CODE',
    content: {
      language: 'typescript',
      code: `// Error handling pattern
export function handleApiError(error: any): ApiErrorResponse {
  if (error.response) {
    // Server responded with an error
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors || []
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'No response received from server',
      errors: []
    };
  } else {
    // Error in setting up the request
    return {
      status: 0,
      message: error.message || 'Unknown error occurred',
      errors: []
    };
  }
}`
    }
  });
  
  if (pattern) {
    console.log('Created pattern:', pattern.id);
  } else {
    console.error('Failed to create pattern');
  }
}
```

## Best Practice Operations

### Getting Best Practices

```typescript
import { getBestPractices } from '@/lib/supabase/dataOperations';

// Get all best practices for a workspace
async function fetchWorkspaceBestPractices(workspaceId: string) {
  const bestPractices = await getBestPractices(workspaceId);
  
  if (bestPractices) {
    console.log('Found', bestPractices.length, 'best practices');
    return bestPractices;
  } else {
    console.error('Failed to fetch best practices');
    return [];
  }
}
```

### Creating a Best Practice

```typescript
import { createBestPractice } from '@/lib/supabase/dataOperations';

async function createNewBestPractice(workspaceId: string) {
  const bestPractice = await createBestPractice({
    workspace_id: workspaceId,
    name: 'API Documentation',
    description: 'Best practices for documenting APIs',
    category: 'DOCUMENTATION',
    content: {
      guidelines: [
        'Document all endpoints with descriptions, parameters, and responses',
        'Include example requests and responses',
        'Document error codes and messages',
        'Keep documentation up-to-date with code changes',
        'Use standardized format for consistency'
      ],
      examples: {
        good: '/**\n * Get user by ID\n * @param {string} id - User ID\n * @returns {Promise<User>} - User object\n * @throws {ApiError} - If user not found\n */\nfunction getUserById(id: string): Promise<User> { ... }',
        bad: 'function getUser(id) { ... }'
      }
    }
  });
  
  if (bestPractice) {
    console.log('Created best practice:', bestPractice.id);
  } else {
    console.error('Failed to create best practice');
  }
}
```

## Error Handling

All data operation functions include proper error handling. They will:

1. Catch any exceptions thrown during the operation
2. Log errors to the console
3. Return `null` or `false` to indicate failure

This approach allows you to handle errors gracefully in your application code and provide appropriate feedback to users.

## Transaction Support

For operations that need to update multiple related records, consider using Supabase transactions to ensure data integrity.

```typescript
import { supabase } from '@/lib/supabase/client';

async function complexOperation() {
  // Start a transaction
  const { error } = await supabase.rpc('begin');
  if (error) {
    console.error('Failed to start transaction');
    return false;
  }
  
  try {
    // Multiple operations...
    // If any operation fails, the entire transaction will be rolled back
    
    // Commit the transaction
    const { error: commitError } = await supabase.rpc('commit');
    if (commitError) {
      throw commitError;
    }
    
    return true;
  } catch (error) {
    // Roll back the transaction on error
    await supabase.rpc('rollback');
    console.error('Transaction rolled back:', error);
    return false;
  }
}
```

## Conclusion

The data operations module provides a comprehensive set of functions for working with the Convoy database. By using these functions, you can ensure that data operations are consistent, properly typed, and include appropriate error handling.

These operations support the Memory Bank pattern by providing a reliable foundation for storing and retrieving the knowledge graph data that powers AI context retrieval.
