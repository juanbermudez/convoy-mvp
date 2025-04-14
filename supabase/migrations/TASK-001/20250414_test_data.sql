-- Test data for Convoy schema
-- Description: Sample data for testing the data architecture
-- Author: AI Assistant
-- Date: 2025-04-14

-- Sample workspace
INSERT INTO workspaces (id, name, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Convoy Development', 'Main workspace for Convoy development'),
  ('22222222-2222-2222-2222-222222222222', 'Personal Projects', 'Personal workspace for miscellaneous projects');

-- Sample projects
INSERT INTO projects (id, workspace_id, name, description, status, target_date)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Data Architecture', 'Implementing the data architecture for Convoy', 'active', '2025-04-21'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'UI Components', 'Building reusable UI components', 'active', '2025-04-28'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Learning Project', 'Personal learning project', 'active', '2025-05-15');

-- Sample workstreams
INSERT INTO workstreams (id, project_id, name, description, status, progress)
VALUES 
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Database Implementation', 'Implementing the database schema and queries', 'active', 0.25),
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'Local Storage', 'Implementing WatermelonDB for local storage', 'active', 0),
  ('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'Core Components', 'Building core UI components', 'active', 0.5);

-- Sample tasks
INSERT INTO tasks (id, project_id, workstream_id, title, description, status, priority)
VALUES 
  ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Database Schema Design', 'Design and implement the database schema', 'to_do', 'high'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Knowledge Graph Implementation', 'Implement the relationship graph structure', 'backlog', 'high'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Watermelon DB Model Creation', 'Create models for local storage', 'backlog', 'medium'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'Button Component', 'Create reusable button component', 'in_progress', 'medium'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', NULL, 'Project Planning', 'Plan the UI component library', 'completed', 'high'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', NULL, 'Research Topic', 'Research the main topic for the learning project', 'to_do', 'medium');

-- Sample task relationships (beyond the automatic ones)
INSERT INTO relationships (source_type, source_id, relationship_type, target_type, target_id)
VALUES 
  ('task', '99999999-9999-9999-9999-999999999999', 'task_blocks', 'task', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('task', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'task_blocks', 'task', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('task', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'task_related_to', 'task', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- Test queries to validate schema and relationships

-- Query 1: Get all tasks for a project including their workstream information
-- SELECT t.*, w.name as workstream_name 
-- FROM tasks t
-- LEFT JOIN workstreams w ON t.workstream_id = w.id
-- WHERE t.project_id = '33333333-3333-3333-3333-333333333333';

-- Query 2: Get all relationships for a task
-- SELECT r.* 
-- FROM relationships r
-- WHERE (r.source_type = 'task' AND r.source_id = '99999999-9999-9999-9999-999999999999')
-- OR (r.target_type = 'task' AND r.target_id = '99999999-9999-9999-9999-999999999999');

-- Query 3: Find all tasks that are blocked by a specific task
-- SELECT t.* 
-- FROM tasks t
-- JOIN relationships r ON t.id = r.target_id
-- WHERE r.source_id = '99999999-9999-9999-9999-999999999999'
-- AND r.relationship_type = 'task_blocks'
-- AND r.target_type = 'task';

-- Query 4: Find all tasks in a workspace (traversing the relationship graph)
-- WITH RECURSIVE workspace_entities AS (
--   -- Start with the workspace
--   SELECT 'workspace' as entity_type, id as entity_id, 0 as depth
--   FROM workspaces
--   WHERE id = '11111111-1111-1111-1111-111111111111'
--   
--   UNION ALL
--   
--   -- Add related entities
--   SELECT r.target_type, r.target_id, we.depth + 1
--   FROM relationships r
--   JOIN workspace_entities we ON r.source_type = we.entity_type AND r.source_id = we.entity_id
--   WHERE r.relationship_type IN ('workspace_contains_project', 'project_contains_workstream', 'project_contains_task', 'workstream_contains_task')
-- )
-- SELECT t.*
-- FROM workspace_entities we
-- JOIN tasks t ON we.entity_type = 'task' AND we.entity_id = t.id;
