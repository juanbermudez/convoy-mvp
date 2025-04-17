---
id: PROJ-003
name: Data Architecture Implementation
description: Detailed implementation plan for the Convoy data architecture
created_at: 2025-04-14
updated_at: 2025-04-14
status: active
parent_id: INIT-001
parent_name: Convoy Development
---

# Data Architecture Implementation Plan

## 1. Project Structure Overview

This implementation plan outlines the approach for creating a comprehensive data architecture for the Convoy system, with a focus on workspaces, projects, workstreams, and tasks. The architecture will use a knowledge graph approach to provide consistent and deterministic context retrieval for AI agents.

## 2. Entity Hierarchy

The data architecture will follow this hierarchical structure:

```
[Workspace]
     │
     └──► [Project] ────┐
              │         │
              ├──► [Workstream] ─┐
              │         │        │
              │         ▼        │
              │     [Task] ◄─────┘
              │
              └──► [Task]
```

Key relationships:
- Every workspace contains multiple projects
- Every project belongs to one workspace
- Every workstream belongs to one project
- Every task belongs to one project
- Tasks may optionally belong to a workstream

## 3. Database Schema Implementation

### 3.1 Core Tables

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
```

### 3.2 Relationship Table for Knowledge Graph

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

-- Create indexes for efficient traversal
CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

## 4. Knowledge Graph Implementation

### 4.1 Relationship Types

```typescript
enum RelationshipType {
  // Workspace relationships
  WORKSPACE_CONTAINS_PROJECT = 'workspace_contains_project',
  
  // Project relationships
  PROJECT_BELONGS_TO_WORKSPACE = 'project_belongs_to_workspace',
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
  TASK_RELATED_TO = 'task_related_to',
}
```

### 4.2 Relationship Management Functions

```typescript
// Create a relationship
async function createRelationship(
  sourceType: EntityType,
  sourceId: string,
  relationshipType: RelationshipType,
  targetType: EntityType,
  targetId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await supabase
    .from('relationships')
    .insert({
      source_type: sourceType,
      source_id: sourceId,
      relationship_type: relationshipType,
      target_type: targetType,
      target_id: targetId,
      metadata
    });
    
  // If bidirectional relationship, create inverse
  if (relationshipType === RelationshipType.TASK_BLOCKS) {
    await createRelationship(
      targetType,
      targetId,
      RelationshipType.TASK_BLOCKED_BY,
      sourceType,
      sourceId,
      metadata
    );
  }
}

// Find related entities
async function findRelatedEntities(
  sourceType: EntityType,
  sourceId: string,
  relationshipType?: RelationshipType,
  targetType?: EntityType
): Promise<Relationship[]> {
  // Implementation details
}

// Find referencing entities
async function findReferencingEntities(
  targetType: EntityType,
  targetId: string,
  relationshipType?: RelationshipType,
  sourceType?: EntityType
): Promise<Relationship[]> {
  // Implementation details
}
```

## 5. Watermelon DB Implementation

### 5.1 Model Definitions

```typescript
// Project model
export default class ProjectModel {
  static table = 'projects';
  
  id: string = '';
  workspaceId: string = '';
  name: string = '';
  description: string = '';
  ownerId: string = '';
  status: string = '';
  targetDate: number = 0;
  createdAt: number = 0;
  updatedAt: number = 0;
  remoteId: string = '';
  
  // Methods similar to existing models
}

// Workstream model
export default class WorkstreamModel {
  static table = 'workstreams';
  
  id: string = '';
  projectId: string = '';
  name: string = '';
  description: string = '';
  ownerId: string = '';
  status: string = '';
  progress: number = 0;
  createdAt: number = 0;
  updatedAt: number = 0;
  remoteId: string = '';
  
  // Methods similar to existing models
}

// Task model
export default class TaskModel {
  static table = 'tasks';
  
  id: string = '';
  projectId: string = ''; // Required
  workstreamId: string = ''; // Optional
  title: string = '';
  description: string = '';
  ownerId: string = '';
  status: string = '';
  priority: string = '';
  labels: string = '[]'; // JSON string
  relationships: string = '{}'; // JSON string
  createdAt: number = 0;
  updatedAt: number = 0;
  remoteId: string = '';
  
  // Methods similar to existing models
}

// Relationship model
export default class RelationshipModel {
  static table = 'relationships';
  
  id: string = '';
  sourceType: string = '';
  sourceId: string = '';
  relationshipType: string = '';
  targetType: string = '';
  targetId: string = '';
  metadata: string = '{}'; // JSON string
  createdAt: number = 0;
  remoteId: string = '';
  
  // Methods similar to existing models
}
```

### 5.2 Database Initialization

```typescript
// Initialize database tables
export async function initDatabase(): Promise<boolean> {
  try {
    // Create tables if they don't exist
    const collections = [
      'workspaces',
      'projects',
      'workstreams',
      'tasks',
      'relationships'
    ];
    
    // Check if tables exist and create them if needed
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}
```

## 6. Bidirectional Sync Implementation

### 6.1 Enhanced Sync Function

```typescript
// Bidirectional sync function
export async function sync(): Promise<boolean> {
  try {
    // Phase 1: Push local changes to Supabase
    await pushWorkspacesToSupabase();
    await pushProjectsToSupabase();
    await pushWorkstreamsToSupabase();
    await pushTasksToSupabase();
    await pushRelationshipsToSupabase();
    
    // Phase 2: Pull Supabase changes to local DB
    await pullWorkspacesFromSupabase();
    await pullProjectsFromSupabase();
    await pullWorkstreamsFromSupabase();
    await pullTasksFromSupabase();
    await pullRelationshipsFromSupabase();
    
    // Update sync timestamp
    localStorage.setItem('lastSyncTimestamp', Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
}
```

### 6.2 Entity-Specific Sync Functions

Functions will be implemented for each entity type to handle the specific requirements for bidirectional synchronization:

- `pushWorkspacesToSupabase()`
- `pullWorkspacesFromSupabase()`
- `pushProjectsToSupabase()`
- `pullProjectsFromSupabase()`
- `pushWorkstreamsToSupabase()`
- `pullWorkstreamsFromSupabase()`
- `pushTasksToSupabase()`
- `pullTasksFromSupabase()`
- `pushRelationshipsToSupabase()`
- `pullRelationshipsFromSupabase()`

## 7. AI Context Providers

### 7.1 Context Retrieval Functions

```typescript
// Get context for AI assistant
async function getAIContext(
  contextType: 'workspace' | 'project' | 'workstream' | 'task',
  entityId: string
): Promise<AIContext> {
  switch (contextType) {
    case 'workspace':
      return getWorkspaceContext(entityId);
    case 'project':
      return getProjectContext(entityId);
    case 'workstream':
      return getWorkstreamContext(entityId);
    case 'task':
      return getTaskContext(entityId);
    default:
      throw new Error(`Unsupported context type: ${contextType}`);
  }
}

// Get project context
async function getProjectContext(projectId: string): Promise<ProjectContext> {
  // Implementation details
}

// Get workstream context
async function getWorkstreamContext(workstreamId: string): Promise<WorkstreamContext> {
  // Implementation details
}

// Get task context
async function getTaskContext(taskId: string): Promise<TaskContext> {
  // Implementation details
}
```

### 7.2 Query Interface

```typescript
// AI query interface for finding entities
class ConvoyAIQueryInterface {
  // Find projects matching criteria
  async findProjects(criteria: Record<string, any>): Promise<Project[]> {
    // Implementation details
  }
  
  // Find workstreams matching criteria
  async findWorkstreams(criteria: Record<string, any>): Promise<Workstream[]> {
    // Implementation details
  }
  
  // Find tasks matching criteria
  async findTasks(criteria: Record<string, any>): Promise<Task[]> {
    // Implementation details
  }
}
```

## 8. Implementation Phases

### Phase 1: Database Schema Implementation
1. Create Supabase tables for workspaces, projects, workstreams, tasks
2. Create relationship table with appropriate indexes
3. Test basic CRUD operations on all tables

### Phase 2: Knowledge Graph Implementation
1. Implement relationship types
2. Create functions for relationship management
3. Build graph traversal utilities
4. Test relationship creation and queries

### Phase 3: Watermelon DB Implementation
1. Create model definitions for all entities
2. Implement database initialization
3. Test local storage operations

### Phase 4: Sync Implementation
1. Develop bidirectional sync for all entities
2. Implement conflict resolution strategies
3. Test sync operations with different scenarios

### Phase 5: AI Context Providers
1. Create context retrieval functions
2. Implement query interface
3. Test AI context retrieval accuracy and performance

### Phase 6: Testing and Documentation
1. Comprehensive testing of all components
2. Documentation of schema, APIs, and usage patterns
3. Performance optimization

## 9. Testing Strategy

### 9.1 Unit Tests
- Test individual functions for relationship management
- Test model operations in Watermelon DB
- Test sync functions for each entity type

### 9.2 Integration Tests
- Test bidirectional sync end-to-end
- Test knowledge graph traversal with complex relationships
- Test AI context providers with various scenarios

### 9.3 Performance Tests
- Test with large datasets
- Measure query response times
- Optimize indexes and query patterns

## 10. Future Enhancements

### 10.1 Embedding Integration
- Add vector embeddings for semantic search
- Implement hybrid retrieval combining graph and vector search
- Optimize for performance with large datasets

### 10.2 Advanced Relationship Types
- Add more specialized relationship types
- Implement weighted relationships
- Support temporal relationships

### 10.3 Enhanced Context Retrieval
- Add context prioritization based on relevance
- Implement context caching for performance
- Support multi-hop relationship queries

## Conclusion

This implementation plan provides a comprehensive approach to creating a data architecture that supports workspace, project, workstream, and task management with a knowledge graph for efficient context retrieval. The architecture aligns with Linear's organizational model while providing the foundation for AI-powered project management in Convoy.
