---
id: TASK-003
name: Watermelon DB Model Creation
description: Create WatermelonDB models for local storage based on the database schema
created_at: 2025-04-14
updated_at: 2025-04-14
status: to-do
priority: medium
assigned_to: 
project_id: PROJ-003
project_name: Data Architecture Implementation
parent_id: INIT-001
parent_name: Convoy Development
dependencies: [TASK-001, TASK-002]
blocked_by: []
blocks: [TASK-004]
estimated_hours: 6
---

# Watermelon DB Model Creation

## Task Description

Create WatermelonDB models for local storage based on the database schema created in TASK-001. These models should integrate with the knowledge graph implementation from TASK-002, allowing for efficient local storage, querying, and synchronization with the remote database.

## Objectives

- Create WatermelonDB model definitions for all entity types (workspaces, projects, workstreams, tasks)
- Implement a relationship model for the knowledge graph
- Ensure models have proper associations defined
- Develop a model for synchronization with Supabase
- Create a test component to demonstrate the local storage functionality

## Requirements

1. The models must include:
   - All required fields from the database schema
   - Proper type definitions
   - Relationships between models
   - Methods for common operations

2. The implementation must support:
   - Creating and updating entities in local storage
   - Querying entities based on relationships
   - Maintaining bidirectional relationships
   - Efficient retrieval of related entities

3. Technical requirements:
   - Use TypeScript for all model definitions
   - Follow WatermelonDB best practices
   - Ensure compatibility with the existing sync mechanism
   - Implement comprehensive error handling

## Technical Approach

1. Create model definitions for all entity types
2. Define model schemas for WatermelonDB
3. Implement relationship associations
4. Create helper functions for common operations
5. Update mock database implementation for testing
6. Create a test component to demonstrate functionality

## Implementation Details

### Model Definitions

Each entity type will have a corresponding WatermelonDB model:

```typescript
// Workspace model
class Workspace extends Model {
  static table = 'workspaces';
  static associations = {
    projects: { type: 'has_many', foreignKey: 'workspace_id' }
  };
  
  @field('name') name!: string;
  @field('description') description?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  
  @children('projects') projects!: Query<Project>;
}

// Project model
class Project extends Model {
  static table = 'projects';
  static associations = {
    workspace: { type: 'belongs_to', key: 'workspace_id' },
    workstreams: { type: 'has_many', foreignKey: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'project_id' }
  };
  
  @field('workspace_id') workspaceId!: string;
  @field('name') name!: string;
  @field('description') description?: string;
  @field('status') status!: string;
  @field('target_date') targetDate?: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  
  @relation('workspaces', 'workspace_id') workspace!: Relation<Workspace>;
  @children('workstreams') workstreams!: Query<Workstream>;
  @children('tasks') tasks!: Query<Task>;
}

// Workstream model
class Workstream extends Model {
  static table = 'workstreams';
  static associations = {
    project: { type: 'belongs_to', key: 'project_id' },
    tasks: { type: 'has_many', foreignKey: 'workstream_id' }
  };
  
  @field('project_id') projectId!: string;
  @field('name') name!: string;
  @field('description') description?: string;
  @field('status') status!: string;
  @field('progress') progress!: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  
  @relation('projects', 'project_id') project!: Relation<Project>;
  @children('tasks') tasks!: Query<Task>;
}

// Task model
class Task extends Model {
  static table = 'tasks';
  static associations = {
    project: { type: 'belongs_to', key: 'project_id' },
    workstream: { type: 'belongs_to', key: 'workstream_id' }
  };
  
  @field('project_id') projectId!: string;
  @field('workstream_id') workstreamId?: string;
  @field('title') title!: string;
  @field('description') description?: string;
  @field('status') status!: string;
  @field('priority') priority!: string;
  @field('labels') labels!: string; // JSON string
  @field('relationships') relationships!: string; // JSON string
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  
  @relation('projects', 'project_id') project!: Relation<Project>;
  @relation('workstreams', 'workstream_id') workstream?: Relation<Workstream>;
}

// Relationship model
class Relationship extends Model {
  static table = 'relationships';
  
  @field('source_type') sourceType!: string;
  @field('source_id') sourceId!: string;
  @field('relationship_type') relationshipType!: string;
  @field('target_type') targetType!: string;
  @field('target_id') targetId!: string;
  @field('metadata') metadata!: string; // JSON string
  @field('created_at') createdAt!: number;
}
```

### Schema Definitions

```typescript
// Schema definitions
export const workspaceSchema = tableSchema({
  name: 'workspaces',
  columns: {
    name: { type: 'string', isIndexed: true },
    description: { type: 'string', isOptional: true },
    created_at: { type: 'number' },
    updated_at: { type: 'number' }
  }
});

export const projectSchema = tableSchema({
  name: 'projects',
  columns: {
    workspace_id: { type: 'string', isIndexed: true },
    name: { type: 'string', isIndexed: true },
    description: { type: 'string', isOptional: true },
    status: { type: 'string', isIndexed: true },
    target_date: { type: 'number', isOptional: true },
    created_at: { type: 'number' },
    updated_at: { type: 'number' }
  }
});

export const workstreamSchema = tableSchema({
  name: 'workstreams',
  columns: {
    project_id: { type: 'string', isIndexed: true },
    name: { type: 'string', isIndexed: true },
    description: { type: 'string', isOptional: true },
    status: { type: 'string', isIndexed: true },
    progress: { type: 'number' },
    created_at: { type: 'number' },
    updated_at: { type: 'number' }
  }
});

export const taskSchema = tableSchema({
  name: 'tasks',
  columns: {
    project_id: { type: 'string', isIndexed: true },
    workstream_id: { type: 'string', isIndexed: true, isOptional: true },
    title: { type: 'string', isIndexed: true },
    description: { type: 'string', isOptional: true },
    status: { type: 'string', isIndexed: true },
    priority: { type: 'string', isIndexed: true },
    labels: { type: 'string' }, // JSON string
    relationships: { type: 'string' }, // JSON string
    created_at: { type: 'number' },
    updated_at: { type: 'number' }
  }
});

export const relationshipSchema = tableSchema({
  name: 'relationships',
  columns: {
    source_type: { type: 'string', isIndexed: true },
    source_id: { type: 'string', isIndexed: true },
    relationship_type: { type: 'string', isIndexed: true },
    target_type: { type: 'string', isIndexed: true },
    target_id: { type: 'string', isIndexed: true },
    metadata: { type: 'string' }, // JSON string
    created_at: { type: 'number' }
  }
});
```

### Database Initialization

```typescript
// Database schema
export const schema = {
  version: 1,
  tables: [
    workspaceSchema,
    projectSchema,
    workstreamSchema,
    taskSchema,
    relationshipSchema
  ]
};

// Database initialization
export const database = new Database({
  adapter: new SQLiteAdapter({
    schema
  }),
  modelClasses: [
    Workspace,
    Project,
    Workstream,
    Task,
    Relationship
  ]
});
```

## Testing Approach

1. Create a dedicated test component showing:
   - Creating and querying workspaces, projects, workstreams, and tasks
   - Establishing relationships between entities
   - Traversing the relationship graph
   - Syncing with Supabase

2. Validate that:
   - All model operations work correctly
   - Relationships are properly maintained
   - Data can be efficiently queried
   - Local state persists across sessions

## Completion Criteria

- All model definitions are complete and functional
- Schema definitions match the database schema from TASK-001
- Relationship associations work correctly
- The test component demonstrates the functionality
- Documentation is complete and comprehensive

## Notes

- The WatermelonDB implementation should use the mock database for development and testing
- The models should be compatible with both the mock implementation and the real WatermelonDB
- Consider performance implications for large datasets
- Document any limitations or considerations for the sync mechanism
