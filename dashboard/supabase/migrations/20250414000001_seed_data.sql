-- Insert schema version
INSERT INTO schema_versions (version, description)
VALUES ('20250414000001', 'Seed initial data');

-- Seed standard workflow
INSERT INTO workflows (id, name, description, stages)
VALUES (
  'c8bfae5c-8338-4ab5-aaee-e9242d3ccdc1',
  'Standard Development Workflow',
  'A six-stage workflow with human checkpoints for plan and code review',
  '{
    "stages": [
      {
        "name": "PLAN",
        "description": "Analyze task and create implementation plan",
        "order": 1,
        "is_checkpoint": false
      },
      {
        "name": "PLAN_REVIEW",
        "description": "Human review of implementation plan",
        "order": 2,
        "is_checkpoint": true
      },
      {
        "name": "IMPLEMENT",
        "description": "Implement the approved plan",
        "order": 3,
        "is_checkpoint": false
      },
      {
        "name": "VALIDATE",
        "description": "Validate the implementation against requirements",
        "order": 4,
        "is_checkpoint": false
      },
      {
        "name": "CODE_REVIEW",
        "description": "Human review of implementation",
        "order": 5,
        "is_checkpoint": true
      },
      {
        "name": "COMMIT",
        "description": "Commit the validated and approved implementation",
        "order": 6,
        "is_checkpoint": false
      }
    ]
  }'::jsonb
);

-- Seed sample workspace
INSERT INTO workspaces (id, name, description)
VALUES (
  '8d093708-3e78-4ba6-b78e-f63e8fa1aa8b',
  'Convoy Development',
  'Development workspace for the Convoy project'
);

-- Seed sample project
INSERT INTO projects (id, workspace_id, name, description, overview, tech_stack)
VALUES (
  'f4e1c87d-0c13-4b2f-a39c-b381dab8992e',
  '8d093708-3e78-4ba6-b78e-f63e8fa1aa8b',
  'Supabase Integration',
  'Integration of Supabase for the Convoy knowledge graph',
  'This project involves setting up the foundational database infrastructure for Convoy using Supabase with declarative schemas.',
  '{
    "backend": ["Supabase", "PostgreSQL"],
    "frontend": ["React", "TypeScript"],
    "tools": ["Git", "Supabase CLI"]
  }'::jsonb
);

-- Seed sample milestone
INSERT INTO milestones (id, project_id, name, description, requirements, status)
VALUES (
  'a3c2e78f-b59d-47ed-a1ec-3a9f20c167e6',
  'f4e1c87d-0c13-4b2f-a39c-b381dab8992e',
  'Initial Supabase Integration',
  'Set up initial Supabase integration and database schema',
  'Create database schema, implement MCP client, test context retrieval',
  'IN_PROGRESS'
);

-- Seed sample tasks
INSERT INTO tasks (id, milestone_id, title, description, current_stage, status)
VALUES (
  '2d7b6c5a-e1d4-4f2b-9e8c-d0a9b3c7e8f6',
  'a3c2e78f-b59d-47ed-a1ec-3a9f20c167e6',
  'Supabase Project Setup',
  'Set up the Supabase project and initial configuration',
  'COMMIT',
  'DONE'
);

INSERT INTO tasks (id, milestone_id, title, description, current_stage, status)
VALUES (
  '3e8d7f6b-f2e1-5g3c-0f9d-e4a8b7c6d5e4',
  'a3c2e78f-b59d-47ed-a1ec-3a9f20c167e6',
  'Implement Core Database Schema',
  'Create the core database tables and relationships',
  'IMPLEMENT',
  'IN_PROGRESS'
);

INSERT INTO tasks (id, milestone_id, parent_task_id, title, description, current_stage, status)
VALUES (
  '4f9e8d7c-g3h2-6i1j-0k9l-m8n7o6p5q4r',
  'a3c2e78f-b59d-47ed-a1ec-3a9f20c167e6',
  '3e8d7f6b-f2e1-5g3c-0f9d-e4a8b7c6d5e4',
  'Create Table Indexes',
  'Implement indexes for efficient querying',
  'PLAN',
  'TODO'
);

-- Seed task dependencies
INSERT INTO task_dependencies (task_id, depends_on_task_id)
VALUES (
  '3e8d7f6b-f2e1-5g3c-0f9d-e4a8b7c6d5e4',
  '2d7b6c5a-e1d4-4f2b-9e8c-d0a9b3c7e8f6'
);

INSERT INTO task_dependencies (task_id, depends_on_task_id)
VALUES (
  '4f9e8d7c-g3h2-6i1j-0k9l-m8n7o6p5q4r',
  '3e8d7f6b-f2e1-5g3c-0f9d-e4a8b7c6d5e4'
);

-- Seed activity feed
INSERT INTO activity_feed (task_id, activity_type, details)
VALUES (
  '2d7b6c5a-e1d4-4f2b-9e8c-d0a9b3c7e8f6',
  'STAGE_CHANGE',
  '{"from_stage": "PLAN", "to_stage": "PLAN_REVIEW", "timestamp": "2025-04-14T10:00:00Z"}'::jsonb
);

INSERT INTO activity_feed (task_id, activity_type, details)
VALUES (
  '2d7b6c5a-e1d4-4f2b-9e8c-d0a9b3c7e8f6',
  'STAGE_CHANGE',
  '{"from_stage": "PLAN_REVIEW", "to_stage": "IMPLEMENT", "timestamp": "2025-04-14T11:00:00Z"}'::jsonb
);

INSERT INTO activity_feed (task_id, activity_type, details)
VALUES (
  '3e8d7f6b-f2e1-5g3c-0f9d-e4a8b7c6d5e4',
  'STAGE_CHANGE',
  '{"from_stage": "PLAN", "to_stage": "PLAN_REVIEW", "timestamp": "2025-04-14T14:00:00Z"}'::jsonb
);

-- Seed sample pattern
INSERT INTO patterns (workspace_id, name, description, pattern_type, content)
VALUES (
  '8d093708-3e78-4ba6-b78e-f63e8fa1aa8b',
  'Database Access Pattern',
  'Standard pattern for accessing the database from React components',
  'CODE',
  '{
    "language": "typescript",
    "code": "// Database Access Pattern\nasync function fetchEntityById<T>(table: string, id: string): Promise<T | null> {\n  const { data, error } = await supabase\n    .from(table)\n    .select(\"*\")\n    .eq(\"id\", id)\n    .single();\n  \n  if (error) {\n    console.error(`Error fetching ${table}:`, error);\n    return null;\n  }\n  \n  return data as T;\n}"
  }'::jsonb
);

-- Seed sample best practice
INSERT INTO best_practices (workspace_id, name, description, category, content)
VALUES (
  '8d093708-3e78-4ba6-b78e-f63e8fa1aa8b',
  'Query Optimization',
  'Best practices for optimizing database queries',
  'DATABASE',
  '{
    "guidelines": [
      "Always use indexes for frequently queried fields",
      "Limit the columns selected to only what is needed",
      "Use appropriate join types based on data relationships",
      "Implement pagination for large result sets",
      "Use parameterized queries to prevent SQL injection"
    ],
    "examples": {
      "good": "await supabase.from(\"tasks\").select(\"id, title, status\").eq(\"milestone_id\", milestoneId).limit(10)",
      "bad": "await supabase.from(\"tasks\").select(\"*\")"
    }
  }'::jsonb
);
