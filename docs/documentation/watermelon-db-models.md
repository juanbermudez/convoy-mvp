# WatermelonDB Models Documentation

This document provides information about the WatermelonDB models implementation for the Convoy application. The implementation allows for efficient local storage, querying, and synchronization with the remote Supabase database.

## Model Overview

The database design follows a hierarchical structure:

- **Workspaces** - Top-level containers for projects
- **Projects** - Containers for workstreams and tasks
- **Workstreams** - Logical groupings of tasks within a project
- **Tasks** - Individual work items
- **Relationships** - Connections between entities in the knowledge graph

## Model Definitions

### Workspace

The `Workspace` model represents a top-level organizational container.

Key properties:
- `name` - The name of the workspace
- `description` - Optional description
- `remoteId` - UUID in Supabase for synchronization

Relationships:
- `projects` - One-to-many relationship with Project entities

### Project

The `Project` model represents a project within a workspace.

Key properties:
- `workspaceId` - Reference to the parent workspace
- `name` - The name of the project
- `description` - Optional description
- `status` - Current status (e.g., "active", "completed")
- `targetDate` - Optional target completion date
- `remoteId` - UUID in Supabase for synchronization

Relationships:
- `workspace` - Many-to-one relationship with Workspace
- `workstreams` - One-to-many relationship with Workstream entities
- `tasks` - One-to-many relationship with Task entities

### Workstream

The `Workstream` model represents a logical grouping of tasks within a project.

Key properties:
- `projectId` - Reference to the parent project
- `name` - The name of the workstream
- `description` - Optional description
- `status` - Current status (e.g., "in_progress", "completed")
- `progress` - Float value representing completion (0.0 to 1.0)
- `ownerId` - Optional reference to the owner
- `remoteId` - UUID in Supabase for synchronization

Relationships:
- `project` - Many-to-one relationship with Project
- `tasks` - One-to-many relationship with Task entities

### Task

The `Task` model represents an individual work item within a project or workstream.

Key properties:
- `projectId` - Reference to the parent project
- `workstreamId` - Optional reference to the parent workstream
- `title` - The title of the task
- `description` - Optional description
- `status` - Current status (e.g., "todo", "in_progress", "done")
- `priority` - Priority level (e.g., "low", "medium", "high")
- `ownerId` - Optional reference to the owner
- `labelsJson` - JSON string of labels
- `relationshipsJson` - JSON string of relationship references
- `remoteId` - UUID in Supabase for synchronization

Relationships:
- `project` - Many-to-one relationship with Project
- `workstream` - Optional many-to-one relationship with Workstream
- `blockingTasks` - Lazy query for tasks blocked by this task
- `blockedByTasks` - Lazy query for tasks that block this task
- `relatedTasks` - Lazy query for tasks related to this task

### Relationship

The `Relationship` model represents a connection between entities in the knowledge graph.

Key properties:
- `sourceType` - Entity type of the source (e.g., "task", "workstream")
- `sourceId` - ID of the source entity
- `relationshipType` - Type of relationship (e.g., "task_blocks", "task_related_to")
- `targetType` - Entity type of the target
- `targetId` - ID of the target entity
- `metadataJson` - JSON string of additional metadata
- `remoteId` - UUID in Supabase for synchronization

## Schema Definitions

The schema definitions map the model properties to database columns. Each schema includes appropriate indexing to optimize query performance.

## Database Operations

### Initialization

The `initDatabase()` function initializes the WatermelonDB database and checks for the existence of required Supabase tables, creating them if they don't exist.

### Synchronization

The `sync()` function handles bidirectional synchronization between the local WatermelonDB database and the remote Supabase database:

1. **Push Local Changes to Supabase**:
   - Maps local IDs to remote IDs
   - Pushes new or modified entities to Supabase
   - Handles parent-child relationships properly

2. **Pull Supabase Changes to Local DB**:
   - Updates existing local entities with remote changes
   - Creates new local entities from remote data
   - Maps remote IDs to local IDs for relationships

## Knowledge Graph Integration

The implementation integrates with the knowledge graph through the Relationship model. Tasks can have various relationships with other tasks, such as:

- `TASK_BLOCKS` - Indicates that one task blocks another
- `TASK_BLOCKED_BY` - Indicates that one task is blocked by another
- `TASK_RELATED_TO` - Indicates that tasks are related
- `TASK_PARENT_OF` - Indicates a parent-child relationship
- `TASK_CHILD_OF` - Indicates a child-parent relationship

Similar relationship types exist for workstreams and projects.

## Example Usage

### Creating a Workspace

```typescript
await database.write(async () => {
  const workspace = await database.get('workspaces').create(w => {
    w.name = 'Development';
    w.description = 'Software development workspace';
  });
});
```

### Creating a Project in a Workspace

```typescript
await database.write(async () => {
  const project = await database.get('projects').create(p => {
    p.workspaceId = workspace.id;
    p.name = 'Mobile App';
    p.description = 'Mobile application development';
    p.status = 'active';
  });
});
```

### Creating a Task in a Project

```typescript
await database.write(async () => {
  const task = await database.get('tasks').create(t => {
    t.projectId = project.id;
    t.workstreamId = workstream.id; // Optional
    t.title = 'Implement login screen';
    t.description = 'Create the login screen UI and functionality';
    t.status = 'todo';
    t.priority = 'high';
    t.labelsJson = JSON.stringify(['ui', 'auth']);
    t.relationshipsJson = JSON.stringify({});
  });
});
```

### Creating a Relationship Between Tasks

```typescript
await database.write(async () => {
  await database.get('relationships').create(r => {
    r.sourceType = EntityType.TASK;
    r.sourceId = task1.id;
    r.relationshipType = RelationshipType.TASK_BLOCKS;
    r.targetType = EntityType.TASK;
    r.targetId = task2.id;
    r.metadataJson = JSON.stringify({ reason: 'Task 1 must be completed first' });
  });
});
```

### Querying Related Tasks

```typescript
// Get tasks that are blocked by a specific task
const blockingTasksRels = await task.blockingTasks.fetch();

// Get the actual task objects
const blockingTaskIds = blockingTasksRels.map(r => r.targetId);
const blockingTasks = await database.get('tasks')
  .query(Q.where('id', Q.oneOf(blockingTaskIds)))
  .fetch();
```

## Synchronization

To synchronize the local database with Supabase:

```typescript
// Sync the database
const success = await sync();

if (success) {
  console.log('Sync completed successfully');
} else {
  console.error('Sync failed');
}
```

## Best Practices

1. **Always Use Transactions**: Use `database.write(async () => { ... })` for all write operations to ensure data consistency.

2. **Query Optimization**: Use appropriate query methods and indexes to optimize performance.

3. **Batch Operations**: Batch related operations together to minimize transaction overhead.

4. **Error Handling**: Implement proper error handling for database operations, especially for synchronization.

5. **Relationship Management**: Keep relationship data consistent with entity data.

6. **Synchronization Frequency**: Synchronize at appropriate intervals based on network availability and user activity.

## Limitations and Considerations

1. **Offline First**: The implementation is designed for offline-first operation. All operations work locally first and then synchronize with the server.

2. **Conflict Resolution**: The current implementation uses a "last write wins" approach for conflict resolution during synchronization.

3. **Relationship Synchronization**: Relationships are synchronized after all entities to ensure that entity mappings are available.

4. **Performance**: For large datasets, consider implementing pagination or limiting the scope of synchronization.

5. **Storage Limits**: Be aware of local storage limits on different devices and platforms.
