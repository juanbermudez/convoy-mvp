# Convoy Data Architecture Schema

This document provides detailed documentation for the database schema designed for the Convoy data architecture.

## Overview

The schema is designed to support a knowledge graph approach for efficient context retrieval. It follows a hierarchical structure while allowing for flexible relationships between entities:

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

## Core Tables

### Workspaces

The top-level organizational container.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Workspace name |
| description | TEXT | Optional description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_workspaces_name`: For searching by name

### Projects

Projects belong to workspaces and contain workstreams and tasks.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | Reference to parent workspace |
| name | TEXT | Project name |
| description | TEXT | Optional description |
| owner_id | UUID | Reference to owner user |
| status | project_status | Project status (enum) |
| target_date | TIMESTAMP | Target completion date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_projects_workspace_id`: For finding projects in a workspace
- `idx_projects_owner_id`: For finding projects by owner
- `idx_projects_status`: For filtering by status
- `idx_projects_name`: For searching by name

### Workstreams

Workstreams belong to projects and contain tasks.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | Reference to parent project |
| name | TEXT | Workstream name |
| description | TEXT | Optional description |
| owner_id | UUID | Reference to owner user |
| status | workstream_status | Workstream status (enum) |
| progress | FLOAT | Completion progress (0-1) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_workstreams_project_id`: For finding workstreams in a project
- `idx_workstreams_owner_id`: For finding workstreams by owner
- `idx_workstreams_status`: For filtering by status
- `idx_workstreams_name`: For searching by name

### Tasks

Tasks belong to projects and optionally to workstreams.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | Reference to parent project |
| workstream_id | UUID | Optional reference to parent workstream |
| title | TEXT | Task title |
| description | TEXT | Optional description |
| owner_id | UUID | Reference to owner user |
| status | task_status | Task status (enum) |
| priority | task_priority | Task priority (enum) |
| labels | JSONB | JSON array of labels |
| relationships | JSONB | Quick reference to relationships |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_tasks_project_id`: For finding tasks in a project
- `idx_tasks_workstream_id`: For finding tasks in a workstream
- `idx_tasks_owner_id`: For finding tasks by owner
- `idx_tasks_status`: For filtering by status
- `idx_tasks_priority`: For filtering by priority
- `idx_tasks_title`: For searching by title

### Relationships

The core of the knowledge graph approach, defining relationships between entities.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| source_type | entity_type | Type of source entity (enum) |
| source_id | UUID | ID of source entity |
| relationship_type | relationship_type | Type of relationship (enum) |
| target_type | entity_type | Type of target entity (enum) |
| target_id | UUID | ID of target entity |
| metadata | JSONB | Additional relationship data |
| created_at | TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_relationships_source`: For finding relationships from a source
- `idx_relationships_target`: For finding relationships to a target
- `idx_relationships_type`: For filtering by relationship type

**Constraints:**
- Unique constraint on (source_type, source_id, relationship_type, target_type, target_id)

## Enum Types

### entity_type
- `workspace`
- `project`
- `workstream`
- `task`

### relationship_type
- `workspace_contains_project`
- `project_belongs_to_workspace`
- `project_contains_workstream`
- `project_contains_task`
- `workstream_belongs_to_project`
- `workstream_contains_task`
- `task_belongs_to_project`
- `task_belongs_to_workstream`
- `task_blocks`
- `task_blocked_by`
- `task_related_to`

### project_status
- `active`
- `completed`
- `archived`
- `on_hold`

### workstream_status
- `active`
- `completed`
- `archived`
- `on_hold`

### task_status
- `backlog`
- `to_do`
- `in_progress`
- `review`
- `completed`

### task_priority
- `low`
- `medium`
- `high`
- `urgent`

## Triggers and Functions

### update_updated_at_column()
Automatically updates the `updated_at` timestamp when a record is modified.

### create_entity_relationships()
Automatically creates relationships when entities are created:
- When a project is created, it creates bidirectional relationships with its workspace
- When a workstream is created, it creates bidirectional relationships with its project
- When a task is created, it creates bidirectional relationships with its project and optionally its workstream

### update_entity_relationships()
Updates relationships when entity references change (e.g., when a task's workstream changes).

## Common Query Patterns

### Getting Context for an Entity

To get the complete context for an entity, you can traverse the knowledge graph in both directions:

```sql
-- Get context for a task
WITH RECURSIVE task_context AS (
  -- Start with the task
  SELECT 'task' as entity_type, id as entity_id, title as name, 0 as depth
  FROM tasks
  WHERE id = '[TASK_ID]'
  
  UNION ALL
  
  -- Add related entities (upward traversal)
  SELECT r.target_type, r.target_id, 
    CASE 
      WHEN r.target_type = 'project' THEN (SELECT name FROM projects WHERE id = r.target_id)
      WHEN r.target_type = 'workstream' THEN (SELECT name FROM workstreams WHERE id = r.target_id)
      WHEN r.target_type = 'workspace' THEN (SELECT name FROM workspaces WHERE id = r.target_id)
      WHEN r.target_type = 'task' THEN (SELECT title FROM tasks WHERE id = r.target_id)
    END as name,
    tc.depth + 1
  FROM relationships r
  JOIN task_context tc ON r.source_type = tc.entity_type AND r.source_id = tc.entity_id
  WHERE r.relationship_type IN ('task_belongs_to_project', 'task_belongs_to_workstream', 'project_belongs_to_workspace')
)
SELECT * FROM task_context;
```

### Finding All Related Tasks

To find all tasks related to a specific task:

```sql
-- Find all related tasks
SELECT t.* 
FROM tasks t
JOIN relationships r ON t.id = r.target_id
WHERE r.source_id = '[TASK_ID]'
AND r.source_type = 'task'
AND r.target_type = 'task';
```

### Finding Tasks in a Workspace

To find all tasks in a workspace by traversing the relationship graph:

```sql
WITH RECURSIVE workspace_entities AS (
  -- Start with the workspace
  SELECT 'workspace' as entity_type, id as entity_id, 0 as depth
  FROM workspaces
  WHERE id = '[WORKSPACE_ID]'
  
  UNION ALL
  
  -- Add related entities
  SELECT r.target_type, r.target_id, we.depth + 1
  FROM relationships r
  JOIN workspace_entities we ON r.source_type = we.entity_type AND r.source_id = we.entity_id
  WHERE r.relationship_type IN ('workspace_contains_project', 'project_contains_workstream', 'project_contains_task', 'workstream_contains_task')
)
SELECT t.*
FROM workspace_entities we
JOIN tasks t ON we.entity_type = 'task' AND we.entity_id = t.id;
```

## Performance Considerations

1. **Indexing Strategy**:
   - Indexes are created on all foreign keys
   - Composite indexes are used for relationship traversal
   - Text indexes for name/title fields for search functionality

2. **Recursive Queries**:
   - Recursive CTEs can be used for traversing the relationship graph
   - Depth limits should be considered for very large graphs
   - Performance testing with large datasets is recommended

3. **Relationship Maintenance**:
   - Triggers maintain the consistency of the relationship graph
   - When entities are deleted, CASCADE actions ensure referential integrity
   - Updating relationships is handled by triggers to maintain bidirectional links

## Future Enhancements

1. **Vector Embeddings**:
   - Add a vector field to entities for semantic search capabilities
   - Create GIN indexes for efficient vector similarity search
   - Implement hybrid search combining graph traversal and vector similarity

2. **Temporal Relationships**:
   - Add support for time-based relationships
   - Implement versioning for historical context

3. **Relationship Weights**:
   - Add weight or strength fields to relationships
   - Implement prioritization based on relationship strength

## Migration Guide

1. **Initial Setup**:
   ```sql
   -- Run the main migration script
   \i 20250414_convoy_schema.sql
   ```

2. **Test Data**:
   ```sql
   -- Load test data (optional)
   \i 20250414_test_data.sql
   ```

3. **Rollback**:
   ```sql
   -- If needed, run the rollback script
   \i 20250414_convoy_schema_rollback.sql
   ```

## Conclusion

This schema design provides a solid foundation for the Convoy data architecture, supporting the knowledge graph approach for context retrieval. The design aligns with Linear's organizational model while providing the flexibility needed for AI-powered project management.
