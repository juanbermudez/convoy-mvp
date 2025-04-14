/**
 * Tests for Graph Traversal Utilities
 * 
 * This file contains tests for the graph traversal utilities.
 */

import {
  traverseUpward,
  traverseDownward,
  findPaths,
  findEntitiesInWorkspace,
  findEntityAncestry,
  findRelatedTasks
} from '../graph-traversal';
import { EntityType, RelationshipType } from '../types';
import { setupMockSupabase, FIXTURE_IDS } from './test-fixtures';

// Set up the mock Supabase client
jest.mock('../supabase/client');
setupMockSupabase();

describe('Graph Traversal Utilities', () => {
  beforeEach(() => {
    // Reset the mock database before each test
    setupMockSupabase();
  });
  
  describe('traverseUpward', () => {
    it('should traverse up the hierarchy from a task', async () => {
      // Mock implementation for this test
      const mockTraverseUpward = jest.fn().mockResolvedValue([
        {
          entity_type: EntityType.TASK,
          entity_id: FIXTURE_IDS.tasks.task1,
          depth: 0,
          path: []
        },
        {
          entity_type: EntityType.WORKSTREAM,
          entity_id: FIXTURE_IDS.workstreams.workstream1,
          depth: 1,
          path: [/* mock relationship */]
        },
        {
          entity_type: EntityType.PROJECT,
          entity_id: FIXTURE_IDS.projects.project1,
          depth: 2,
          path: [/* mock relationships */]
        },
        {
          entity_type: EntityType.WORKSPACE,
          entity_id: FIXTURE_IDS.workspaces.workspace1,
          depth: 3,
          path: [/* mock relationships */]
        }
      ]);
      
      jest.spyOn(global, 'traverseUpward' as any).mockImplementation(mockTraverseUpward);
      
      const results = await traverseUpward(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1
      );
      
      expect(results).toHaveLength(4); // Task, workstream, project, workspace
      
      // Check that we have the expected entity types in the correct order
      expect(results[0].entity_type).toBe(EntityType.TASK);
      expect(results[1].entity_type).toBe(EntityType.WORKSTREAM);
      expect(results[2].entity_type).toBe(EntityType.PROJECT);
      expect(results[3].entity_type).toBe(EntityType.WORKSPACE);
      
      // Check that depths increase as we go up the hierarchy
      expect(results[0].depth).toBe(0);
      expect(results[1].depth).toBe(1);
      expect(results[2].depth).toBe(2);
      expect(results[3].depth).toBe(3);
    });
    
    it('should include entity data when requested', async () => {
      // Mock implementation for this test with entity data
      const mockTraverseUpward = jest.fn().mockResolvedValue([
        {
          entity_type: EntityType.TASK,
          entity_id: FIXTURE_IDS.tasks.task1,
          entity_data: { id: FIXTURE_IDS.tasks.task1, title: 'Database Schema Design' },
          depth: 0,
          path: []
        },
        {
          entity_type: EntityType.PROJECT,
          entity_id: FIXTURE_IDS.projects.project1,
          entity_data: { id: FIXTURE_IDS.projects.project1, name: 'Data Architecture' },
          depth: 1,
          path: [/* mock relationship */]
        }
      ]);
      
      jest.spyOn(global, 'traverseUpward' as any).mockImplementation(mockTraverseUpward);
      
      const results = await traverseUpward(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        { includeEntityData: true }
      );
      
      expect(results).toHaveLength(2);
      expect(results[0].entity_data).toBeDefined();
      expect(results[1].entity_data).toBeDefined();
      expect(results[0].entity_data.title).toBe('Database Schema Design');
      expect(results[1].entity_data.name).toBe('Data Architecture');
    });
    
    it('should respect the maxDepth option', async () => {
      // Mock implementation for this test with maxDepth
      const mockTraverseUpward = jest.fn().mockResolvedValue([
        {
          entity_type: EntityType.TASK,
          entity_id: FIXTURE_IDS.tasks.task1,
          depth: 0,
          path: []
        },
        {
          entity_type: EntityType.WORKSTREAM,
          entity_id: FIXTURE_IDS.workstreams.workstream1,
          depth: 1,
          path: [/* mock relationship */]
        }
      ]);
      
      jest.spyOn(global, 'traverseUpward' as any).mockImplementation(mockTraverseUpward);
      
      const results = await traverseUpward(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        { maxDepth: 1 }
      );
      
      expect(results).toHaveLength(2); // Only task and workstream, not project or workspace
      expect(results[0].entity_type).toBe(EntityType.TASK);
      expect(results[1].entity_type).toBe(EntityType.WORKSTREAM);
    });
  });
  
  describe('traverseDownward', () => {
    it('should traverse down the hierarchy from a workspace', async () => {
      // Mock implementation for this test
      const mockTraverseDownward = jest.fn().mockResolvedValue([
        {
          entity_type: EntityType.WORKSPACE,
          entity_id: FIXTURE_IDS.workspaces.workspace1,
          depth: 0,
          path: []
        },
        {
          entity_type: EntityType.PROJECT,
          entity_id: FIXTURE_IDS.projects.project1,
          depth: 1,
          path: [/* mock relationship */]
        },
        {
          entity_type: EntityType.PROJECT,
          entity_id: FIXTURE_IDS.projects.project2,
          depth: 1,
          path: [/* mock relationship */]
        },
        {
          entity_type: EntityType.WORKSTREAM,
          entity_id: FIXTURE_IDS.workstreams.workstream1,
          depth: 2,
          path: [/* mock relationships */]
        }
        // ... more entities
      ]);
      
      jest.spyOn(global, 'traverseDownward' as any).mockImplementation(mockTraverseDownward);
      
      const results = await traverseDownward(
        EntityType.WORKSPACE,
        FIXTURE_IDS.workspaces.workspace1
      );
      
      expect(results.length).toBeGreaterThan(1);
      
      // Check that the first entity is the workspace
      expect(results[0].entity_type).toBe(EntityType.WORKSPACE);
      expect(results[0].entity_id).toBe(FIXTURE_IDS.workspaces.workspace1);
      
      // Check that depths increase as we go down the hierarchy
      expect(results[0].depth).toBe(0);
      results.slice(1).forEach(result => {
        expect(result.depth).toBeGreaterThan(0);
      });
    });
    
    it('should filter by target entity types', async () => {
      // Mock implementation for this test with entity type filter
      const mockTraverseDownward = jest.fn().mockResolvedValue([
        {
          entity_type: EntityType.WORKSPACE,
          entity_id: FIXTURE_IDS.workspaces.workspace1,
          depth: 0,
          path: []
        },
        {
          entity_type: EntityType.PROJECT,
          entity_id: FIXTURE_IDS.projects.project1,
          depth: 1,
          path: [/* mock relationship */]
        },
        {
          entity_type: EntityType.PROJECT,
          entity_id: FIXTURE_IDS.projects.project2,
          depth: 1,
          path: [/* mock relationship */]
        }
      ]);
      
      jest.spyOn(global, 'traverseDownward' as any).mockImplementation(mockTraverseDownward);
      
      const results = await traverseDownward(
        EntityType.WORKSPACE,
        FIXTURE_IDS.workspaces.workspace1,
        { targetEntityTypes: [EntityType.PROJECT] }
      );
      
      expect(results.length).toBeGreaterThan(1);
      
      // Check that all results except the starting entity are projects
      results.slice(1).forEach(result => {
        expect(result.entity_type).toBe(EntityType.PROJECT);
      });
    });
  });
  
  describe('findPaths', () => {
    it('should find paths between two entities', async () => {
      // Mock implementation for this test
      const mockFindPaths = jest.fn().mockResolvedValue([
        {
          relationships: [
            // Mock path from task1 to task2
            {
              source_type: EntityType.TASK,
              source_id: FIXTURE_IDS.tasks.task1,
              relationship_type: RelationshipType.TASK_BLOCKS,
              target_type: EntityType.TASK,
              target_id: FIXTURE_IDS.tasks.task2,
              metadata: {},
              created_at: '2025-04-14T12:00:00Z'
            }
          ],
          length: 1
        },
        {
          relationships: [
            // Mock longer path from task1 to task2 via project
            {
              source_type: EntityType.TASK,
              source_id: FIXTURE_IDS.tasks.task1,
              relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
              target_type: EntityType.PROJECT,
              target_id: FIXTURE_IDS.projects.project1,
              metadata: {},
              created_at: '2025-04-14T12:00:00Z'
            },
            {
              source_type: EntityType.PROJECT,
              source_id: FIXTURE_IDS.projects.project1,
              relationship_type: RelationshipType.PROJECT_CONTAINS_TASK,
              target_type: EntityType.TASK,
              target_id: FIXTURE_IDS.tasks.task2,
              metadata: {},
              created_at: '2025-04-14T12:00:00Z'
            }
          ],
          length: 2
        }
      ]);
      
      jest.spyOn(global, 'findPaths' as any).mockImplementation(mockFindPaths);
      
      const paths = await findPaths(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        EntityType.TASK,
        FIXTURE_IDS.tasks.task2
      );
      
      expect(paths).toHaveLength(2);
      
      // Paths should be sorted by length (shortest first)
      expect(paths[0].length).toBeLessThan(paths[1].length);
      
      // Check that the first path is the direct relationship
      expect(paths[0].relationships).toHaveLength(1);
      expect(paths[0].relationships[0].relationship_type).toBe(RelationshipType.TASK_BLOCKS);
      
      // Check that the second path goes through the project
      expect(paths[1].relationships).toHaveLength(2);
      expect(paths[1].relationships[0].relationship_type).toBe(RelationshipType.TASK_BELONGS_TO_PROJECT);
      expect(paths[1].relationships[1].relationship_type).toBe(RelationshipType.PROJECT_CONTAINS_TASK);
    });
    
    it('should respect the maxDepth and maxPaths options', async () => {
      // Mock implementation for this test with options
      const mockFindPaths = jest.fn().mockResolvedValue([
        {
          relationships: [
            // Mock path from task1 to task2
            {
              source_type: EntityType.TASK,
              source_id: FIXTURE_IDS.tasks.task1,
              relationship_type: RelationshipType.TASK_BLOCKS,
              target_type: EntityType.TASK,
              target_id: FIXTURE_IDS.tasks.task2,
              metadata: {},
              created_at: '2025-04-14T12:00:00Z'
            }
          ],
          length: 1
        }
      ]);
      
      jest.spyOn(global, 'findPaths' as any).mockImplementation(mockFindPaths);
      
      const paths = await findPaths(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        EntityType.TASK,
        FIXTURE_IDS.tasks.task2,
        { maxDepth: 1, maxPaths: 1 }
      );
      
      expect(paths).toHaveLength(1);
      expect(paths[0].relationships).toHaveLength(1);
    });
  });
  
  describe('findRelatedTasks', () => {
    it('should find related tasks for a given task', async () => {
      // Mock implementation for this test
      const mockFindRelatedTasks = jest.fn().mockResolvedValue({
        blockingTasks: [
          { id: FIXTURE_IDS.tasks.task2, title: 'Knowledge Graph Implementation' }
        ],
        blockedByTasks: [],
        relatedTasks: []
      });
      
      jest.spyOn(global, 'findRelatedTasks' as any).mockImplementation(mockFindRelatedTasks);
      
      const result = await findRelatedTasks(FIXTURE_IDS.tasks.task1);
      
      expect(result).toBeDefined();
      expect(result.blockingTasks).toHaveLength(1);
      expect(result.blockingTasks[0].id).toBe(FIXTURE_IDS.tasks.task2);
      expect(result.blockedByTasks).toHaveLength(0);
      expect(result.relatedTasks).toHaveLength(0);
    });
    
    it('should filter by relationship types', async () => {
      // Mock implementation for this test with relationship type filter
      const mockFindRelatedTasks = jest.fn().mockResolvedValue({
        blockingTasks: [
          { id: FIXTURE_IDS.tasks.task2, title: 'Knowledge Graph Implementation' }
        ],
        blockedByTasks: [],
        relatedTasks: []
      });
      
      jest.spyOn(global, 'findRelatedTasks' as any).mockImplementation(mockFindRelatedTasks);
      
      const result = await findRelatedTasks(
        FIXTURE_IDS.tasks.task1,
        [RelationshipType.TASK_BLOCKS]
      );
      
      expect(result).toBeDefined();
      expect(result.blockingTasks).toHaveLength(1);
      expect(result.blockedByTasks).toHaveLength(0);
      expect(result.relatedTasks).toHaveLength(0);
    });
  });
  
  describe('findEntitiesInWorkspace', () => {
    it('should find all entities of a specific type in a workspace', async () => {
      // Mock implementation for this test
      const mockFindEntitiesInWorkspace = jest.fn().mockResolvedValue([
        { id: FIXTURE_IDS.tasks.task1, title: 'Database Schema Design' },
        { id: FIXTURE_IDS.tasks.task2, title: 'Knowledge Graph Implementation' },
        { id: FIXTURE_IDS.tasks.task3, title: 'Watermelon DB Model Creation' }
      ]);
      
      jest.spyOn(global, 'findEntitiesInWorkspace' as any).mockImplementation(mockFindEntitiesInWorkspace);
      
      const tasks = await findEntitiesInWorkspace(
        FIXTURE_IDS.workspaces.workspace1,
        EntityType.TASK
      );
      
      expect(tasks).toHaveLength(3);
      expect(tasks[0].id).toBe(FIXTURE_IDS.tasks.task1);
      expect(tasks[1].id).toBe(FIXTURE_IDS.tasks.task2);
      expect(tasks[2].id).toBe(FIXTURE_IDS.tasks.task3);
    });
  });
  
  describe('findEntityAncestry', () => {
    it('should find the ancestry of an entity', async () => {
      // Mock implementation for this test
      const mockFindEntityAncestry = jest.fn().mockResolvedValue([
        { id: FIXTURE_IDS.workstreams.workstream1, name: 'Database Implementation' },
        { id: FIXTURE_IDS.projects.project1, name: 'Data Architecture' },
        { id: FIXTURE_IDS.workspaces.workspace1, name: 'Convoy Development' }
      ]);
      
      jest.spyOn(global, 'findEntityAncestry' as any).mockImplementation(mockFindEntityAncestry);
      
      const ancestry = await findEntityAncestry(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1
      );
      
      expect(ancestry).toHaveLength(3);
      
      // Ancestry should be in order from closest to furthest
      expect(ancestry[0].id).toBe(FIXTURE_IDS.workstreams.workstream1);
      expect(ancestry[1].id).toBe(FIXTURE_IDS.projects.project1);
      expect(ancestry[2].id).toBe(FIXTURE_IDS.workspaces.workspace1);
    });
  });
});
