# Knowledge Graph Implementation

This module implements the relationship graph structure for the Convoy data architecture, providing efficient context retrieval for AI agents and UI components.

## Overview

The knowledge graph implementation consists of:

1. **Types and Interfaces**: Definitions for entity types, relationship types, and related data structures
2. **Relationship Management**: Functions for creating, reading, updating, and deleting relationships
3. **Graph Traversal**: Utilities for traversing the relationship graph in different ways
4. **Context Retrieval**: High-level functions for retrieving comprehensive context for different entity types

## API Reference

### Entity and Relationship Types

```typescript
enum EntityType {
  WORKSPACE = 'workspace',
  PROJECT = 'project',
  WORKSTREAM = 'workstream',
  TASK = 'task'
}

enum RelationshipType {
  // Workspace relationships
  WORKSPACE_CONTAINS_PROJECT = 'workspace_contains_project',
  PROJECT_BELONGS_TO_WORKSPACE = 'project_belongs_to_workspace',
  
  // Project relationships
  PROJECT_CONTAINS_WORKSTREAM = 'project_contains_workstream',
  PROJECT_CONTAINS_TASK = 'project_contains_task',
  
  // Workstream relationships
  WORKSTREAM_BELONGS_TO_PROJECT = 'workstream_belongs_to_project',
  WORKSTREAM_CONTAINS_TASK = 'workstream_contains_task',
  
  // Task relationships
  TASK_BELONGS_TO_PROJECT = 'task_belongs_to_project',
  TASK_BELONGS_TO_WORKSTREAM = 'task_belongs_to_workstream',
  
  // Dependency relationships
  TASK_BLOCKS = 'task_blocks',
  TASK_BLOCKED_BY = 'task_blocked_by',
  TASK_RELATED_TO = 'task_related_to'
}
```

### Relationship Management

#### Creating a Relationship

```typescript
import { createRelationship, EntityType, RelationshipType } from '@/lib/knowledge-graph';

// Create a relationship
await createRelationship({
  source_type: EntityType.TASK,
  source_id: 'task-123',
  relationship_type: RelationshipType.TASK_BLOCKS,
  target_type: EntityType.TASK,
  target_id: 'task-456',
  metadata: { reason: 'Dependent on completion' }
});
```

#### Finding Related Entities

```typescript
import { findRelatedEntities, EntityType, RelationshipType } from '@/lib/knowledge-graph';

// Find all entities related to a task
const relationships = await findRelatedEntities(
  EntityType.TASK,
  'task-123'
);

// Find tasks blocked by this task
const blockingRelationships = await findRelatedEntities(
  EntityType.TASK,
  'task-123',
  RelationshipType.TASK_BLOCKS,
  EntityType.TASK
);
```

#### Finding Referencing Entities

```typescript
import { findReferencingEntities, EntityType } from '@/lib/knowledge-graph';

// Find entities that reference a project
const relationships = await findReferencingEntities(
  EntityType.PROJECT,
  'project-123'
);
```

#### Updating and Deleting Relationships

```typescript
import {
  getRelationship,
  updateRelationshipMetadata,
  deleteRelationship
} from '@/lib/knowledge-graph';

// Get a relationship by ID
const relationship = await getRelationship('relationship-123');

// Update relationship metadata
await updateRelationshipMetadata('relationship-123', {
  priority: 'high',
  notes: 'Updated relationship'
});

// Delete a relationship
await deleteRelationship('relationship-123');
```

### Graph Traversal

#### Traversing Up the Hierarchy

```typescript
import { traverseUpward, EntityType } from '@/lib/knowledge-graph';

// Get ancestry of a task (task -> workstream -> project -> workspace)
const results = await traverseUpward(
  EntityType.TASK,
  'task-123',
  {
    maxDepth: 3,
    includeEntityData: true
  }
);
```

#### Traversing Down the Hierarchy

```typescript
import { traverseDownward, EntityType } from '@/lib/knowledge-graph';

// Get all entities in a workspace (workspace -> projects -> workstreams -> tasks)
const results = await traverseDownward(
  EntityType.WORKSPACE,
  'workspace-123',
  {
    maxDepth: 3,
    includeEntityData: true
  }
);
```

#### Finding Paths Between Entities

```typescript
import { findPaths, EntityType } from '@/lib/knowledge-graph';

// Find paths between two tasks
const paths = await findPaths(
  EntityType.TASK,
  'task-123',
  EntityType.TASK,
  'task-456',
  {
    maxDepth: 5,
    maxPaths: 3
  }
);
```

#### Finding Related Tasks

```typescript
import { findRelatedTasks } from '@/lib/knowledge-graph';

// Find all tasks related to a specific task
const {
  blockingTasks,   // Tasks that this task blocks
  blockedByTasks,  // Tasks that block this task
  relatedTasks     // Tasks that are related to this task
} = await findRelatedTasks('task-123');
```

### Context Retrieval

#### Getting Task Context

```typescript
import { getTaskContext } from '@/lib/knowledge-graph';

// Get comprehensive context for a task
const context = await getTaskContext('task-123');

// Context includes:
// - task: Task details
// - project: Parent project
// - workstream: Parent workstream (if any)
// - workspace: Parent workspace
// - related_tasks: Related tasks
// - blocked_by_tasks: Tasks that block this task
// - blocking_tasks: Tasks that this task blocks
```

#### Getting Project Context

```typescript
import { getProjectContext } from '@/lib/knowledge-graph';

// Get comprehensive context for a project
const context = await getProjectContext('project-123');

// Context includes:
// - project: Project details
// - workspace: Parent workspace
// - workstreams: Workstreams in this project
// - tasks: Tasks in this project
```

#### Getting Workspace Context

```typescript
import { getWorkspaceContext } from '@/lib/knowledge-graph';

// Get comprehensive context for a workspace
const context = await getWorkspaceContext('workspace-123');

// Context includes:
// - workspace: Workspace details
// - projects: Projects in this workspace
// - workstreams: Workstreams in this workspace
// - tasks: Tasks in this workspace
```

#### Getting All Contexts for AI

```typescript
import { getAllContexts } from '@/lib/knowledge-graph';

// Get all contexts for AI
const {
  workspaces,
  projects,
  workstreams,
  tasks
} = await getAllContexts();
```

## Performance Considerations

### Optimizing Graph Traversal

1. **Use Depth Limits**: Always specify a reasonable `maxDepth` value when traversing the graph to prevent performance issues with deep hierarchies.

```typescript
const results = await traverseUpward(EntityType.TASK, 'task-123', { maxDepth: 3 });
```

2. **Filter By Entity Type**: When only interested in specific entity types, use the `targetEntityTypes` option to reduce the amount of data processed.

```typescript
const results = await traverseDownward(
  EntityType.WORKSPACE,
  'workspace-123',
  {
    targetEntityTypes: [EntityType.TASK],
    maxDepth: 3
  }
);
```

3. **Limit Entity Data**: Only include entity data when needed using the `includeEntityData` option.

```typescript
const results = await traverseUpward(
  EntityType.TASK,
  'task-123',
  { includeEntityData: false }
);
```

### Caching Strategies

For frequently accessed contexts, consider implementing caching:

```typescript
// Example of a simple cache implementation
const contextCache = new Map();

async function getCachedTaskContext(taskId) {
  const cacheKey = `task-context-${taskId}`;
  
  if (contextCache.has(cacheKey)) {
    return contextCache.get(cacheKey);
  }
  
  const context = await getTaskContext(taskId);
  contextCache.set(cacheKey, context);
  
  return context;
}
```

## Error Handling

The knowledge graph implementation provides specialized error types for better error handling:

```typescript
import { RelationshipError, RelationshipErrorType } from '@/lib/knowledge-graph';

try {
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: 'task-123',
    relationship_type: RelationshipType.TASK_BLOCKS,
    target_type: EntityType.TASK,
    target_id: 'task-123' // Same as source, which is invalid
  });
} catch (error) {
  if (error instanceof RelationshipError) {
    if (error.type === RelationshipErrorType.VALIDATION_ERROR) {
      console.error('Validation error:', error.message);
    } else if (error.type === RelationshipErrorType.DUPLICATE) {
      console.error('Duplicate relationship:', error.message);
    } else {
      console.error('Other relationship error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Common Usage Patterns

### Entity Creation with Relationships

When creating a new entity, you'll typically want to establish its relationships:

```typescript
// Create a new task in a project and workstream
async function createTaskWithRelationships(taskData, projectId, workstreamId) {
  // Create the task in the database
  const task = await createTask(taskData);
  
  // Create relationship with project
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task.id,
    relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: projectId
  });
  
  // Create relationship with workstream if provided
  if (workstreamId) {
    await createRelationship({
      source_type: EntityType.TASK,
      source_id: task.id,
      relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
      target_type: EntityType.WORKSTREAM,
      target_id: workstreamId
    });
  }
  
  return task;
}
```

### Entity Deletion with Relationships

When deleting an entity, you'll want to clean up its relationships:

```typescript
// Delete a task and all its relationships
async function deleteTaskWithRelationships(taskId) {
  // Delete all relationships
  await deleteEntityRelationships(EntityType.TASK, taskId);
  
  // Delete the task
  await deleteTask(taskId);
}
```

### Moving a Task Between Workstreams

```typescript
// Move a task to a different workstream
async function moveTaskToWorkstream(taskId, newWorkstreamId) {
  // Find current workstream relationship
  const workstreamRels = await findRelatedEntities(
    EntityType.TASK,
    taskId,
    RelationshipType.TASK_BELONGS_TO_WORKSTREAM
  );
  
  // Delete existing workstream relationship if it exists
  for (const rel of workstreamRels) {
    await deleteRelationship(rel.id);
  }
  
  // Create new workstream relationship
  if (newWorkstreamId) {
    await createRelationship({
      source_type: EntityType.TASK,
      source_id: taskId,
      relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
      target_type: EntityType.WORKSTREAM,
      target_id: newWorkstreamId
    });
  }
}
```

### Building an AI Context Provider

```typescript
// AI context provider for task input
async function getAIContextForTask(taskId) {
  // Get comprehensive task context
  const context = await getTaskContext(taskId);
  
  // Format for AI consumption
  return {
    task: {
      id: context.task.id,
      title: context.task.title,
      description: context.task.description,
      status: context.task.status,
      priority: context.task.priority
    },
    project: context.project ? {
      id: context.project.id,
      name: context.project.name,
      description: context.project.description
    } : null,
    workstream: context.workstream ? {
      id: context.workstream.id,
      name: context.workstream.name,
      description: context.workstream.description
    } : null,
    workspace: context.workspace ? {
      id: context.workspace.id,
      name: context.workspace.name
    } : null,
    dependencies: {
      blocking: context.blocking_tasks?.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status
      })) || [],
      blockedBy: context.blocked_by_tasks?.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status
      })) || [],
      related: context.related_tasks?.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status
      })) || []
    }
  };
}
```

## Future Enhancements

### Weighted Relationships

In the future, relationships could be enhanced with weights to indicate strength or importance:

```typescript
// Create a weighted relationship
await createRelationship({
  source_type: EntityType.TASK,
  source_id: 'task-123',
  relationship_type: RelationshipType.TASK_RELATED_TO,
  target_type: EntityType.TASK,
  target_id: 'task-456',
  metadata: {
    weight: 0.8, // High relevance
    reason: 'Strongly related'
  }
});
```

### Vector Embeddings Integration

The knowledge graph could be enhanced with vector embeddings for semantic search:

```typescript
// Conceptual example of hybrid retrieval
async function hybridContextRetrieval(query, entityType, entityId) {
  // Graph-based retrieval
  const graphResults = await traverseUpward(entityType, entityId, { includeEntityData: true });
  
  // Vector-based retrieval
  const vectorResults = await searchByEmbedding(query);
  
  // Combine results
  return mergeResults(graphResults, vectorResults);
}
```

### Temporal Relationships

Relationships could be enhanced with temporal information:

```typescript
// Create a temporal relationship
await createRelationship({
  source_type: EntityType.TASK,
  source_id: 'task-123',
  relationship_type: RelationshipType.TASK_BLOCKS,
  target_type: EntityType.TASK,
  target_id: 'task-456',
  metadata: {
    validFrom: '2025-04-14T00:00:00Z',
    validUntil: '2025-05-14T00:00:00Z'
  }
});
```

## Conclusion

The knowledge graph implementation provides a powerful foundation for context retrieval in the Convoy system. By leveraging the explicit relationships between entities, it enables efficient traversal of the entity hierarchy and provides comprehensive context for AI agents and UI components.
