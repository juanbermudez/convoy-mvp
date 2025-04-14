/**
 * Tests for Relationship Manager
 * 
 * This file contains tests for the relationship management functions.
 */

import {
  createRelationship,
  findRelatedEntities,
  findReferencingEntities,
  getRelationship,
  updateRelationshipMetadata,
  deleteRelationship,
  deleteEntityRelationships,
  findRelationshipsBetweenEntities
} from '../relationship-manager';
import { EntityType, RelationshipType, RelationshipError, RelationshipErrorType } from '../types';
import { setupMockSupabase, FIXTURE_IDS } from './test-fixtures';

// Set up the mock Supabase client
jest.mock('../supabase/client');
setupMockSupabase();

describe('Relationship Manager', () => {
  beforeEach(() => {
    // Reset the mock database before each test
    setupMockSupabase();
  });
  
  describe('createRelationship', () => {
    it('should create a relationship successfully', async () => {
      const input = {
        source_type: EntityType.TASK,
        source_id: FIXTURE_IDS.tasks.task1,
        relationship_type: RelationshipType.TASK_RELATED_TO,
        target_type: EntityType.TASK,
        target_id: FIXTURE_IDS.tasks.task3,
        metadata: { reason: 'testing' }
      };
      
      const result = await createRelationship(input);
      
      expect(result).toBeDefined();
      expect(result.source_type).toBe(input.source_type);
      expect(result.source_id).toBe(input.source_id);
      expect(result.relationship_type).toBe(input.relationship_type);
      expect(result.target_type).toBe(input.target_type);
      expect(result.target_id).toBe(input.target_id);
      expect(result.metadata).toEqual(input.metadata);
    });
    
    it('should throw an error when creating a duplicate relationship', async () => {
      const input = {
        source_type: EntityType.TASK,
        source_id: FIXTURE_IDS.tasks.task1,
        relationship_type: RelationshipType.TASK_BLOCKS,
        target_type: EntityType.TASK,
        target_id: FIXTURE_IDS.tasks.task2
      };
      
      // This relationship already exists in the test fixtures
      await expect(createRelationship(input)).rejects.toThrow(RelationshipError);
    });
    
    it('should throw an error when source and target are the same entity', async () => {
      const input = {
        source_type: EntityType.TASK,
        source_id: FIXTURE_IDS.tasks.task1,
        relationship_type: RelationshipType.TASK_RELATED_TO,
        target_type: EntityType.TASK,
        target_id: FIXTURE_IDS.tasks.task1
      };
      
      await expect(createRelationship(input)).rejects.toThrow(RelationshipError);
    });
    
    it('should throw an error when relationship type is invalid for entity types', async () => {
      const input = {
        source_type: EntityType.TASK,
        source_id: FIXTURE_IDS.tasks.task1,
        relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
        target_type: EntityType.TASK,
        target_id: FIXTURE_IDS.tasks.task2
      };
      
      await expect(createRelationship(input)).rejects.toThrow(RelationshipError);
    });
  });
  
  describe('findRelatedEntities', () => {
    it('should find entities related to a given entity', async () => {
      const relationships = await findRelatedEntities(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1
      );
      
      expect(relationships).toHaveLength(3); // Task belongs to project, workstream, and blocks task2
      
      // Check that we have the expected relationship types
      const relationshipTypes = relationships.map(r => r.relationship_type);
      expect(relationshipTypes).toContain(RelationshipType.TASK_BELONGS_TO_PROJECT);
      expect(relationshipTypes).toContain(RelationshipType.TASK_BELONGS_TO_WORKSTREAM);
      expect(relationshipTypes).toContain(RelationshipType.TASK_BLOCKS);
    });
    
    it('should filter by relationship type', async () => {
      const relationships = await findRelatedEntities(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        RelationshipType.TASK_BLOCKS
      );
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].relationship_type).toBe(RelationshipType.TASK_BLOCKS);
      expect(relationships[0].target_id).toBe(FIXTURE_IDS.tasks.task2);
    });
    
    it('should filter by target type', async () => {
      const relationships = await findRelatedEntities(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        undefined,
        EntityType.TASK
      );
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].target_type).toBe(EntityType.TASK);
    });
  });
  
  describe('findReferencingEntities', () => {
    it('should find entities that reference a given entity', async () => {
      const relationships = await findReferencingEntities(
        EntityType.PROJECT,
        FIXTURE_IDS.projects.project1
      );
      
      // Should find tasks and workstreams that belong to this project
      expect(relationships.length).toBeGreaterThan(0);
      
      // Check that we have the expected relationship types
      const relationshipTypes = relationships.map(r => r.relationship_type);
      expect(relationshipTypes).toContain(RelationshipType.TASK_BELONGS_TO_PROJECT);
      expect(relationshipTypes).toContain(RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT);
    });
    
    it('should filter by relationship type', async () => {
      const relationships = await findReferencingEntities(
        EntityType.PROJECT,
        FIXTURE_IDS.projects.project1,
        RelationshipType.TASK_BELONGS_TO_PROJECT
      );
      
      expect(relationships.length).toBeGreaterThan(0);
      relationships.forEach(r => {
        expect(r.relationship_type).toBe(RelationshipType.TASK_BELONGS_TO_PROJECT);
      });
    });
    
    it('should filter by source type', async () => {
      const relationships = await findReferencingEntities(
        EntityType.PROJECT,
        FIXTURE_IDS.projects.project1,
        undefined,
        EntityType.TASK
      );
      
      expect(relationships.length).toBeGreaterThan(0);
      relationships.forEach(r => {
        expect(r.source_type).toBe(EntityType.TASK);
      });
    });
  });
  
  describe('getRelationship', () => {
    it('should get a relationship by ID', async () => {
      // This assumes the first relationship in the fixtures has a known ID
      const mockRelationshipId = '1'; // This would be a real ID in a real test
      
      // Mock implementation for this test
      const mockGet = jest.fn().mockResolvedValue({
        data: {
          id: mockRelationshipId,
          source_type: EntityType.WORKSPACE,
          source_id: FIXTURE_IDS.workspaces.workspace1,
          relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
          target_type: EntityType.PROJECT,
          target_id: FIXTURE_IDS.projects.project1,
          metadata: {},
          created_at: '2025-04-14T12:00:00Z'
        },
        error: null
      });
      
      jest.spyOn(global, 'getRelationship' as any).mockImplementation(mockGet);
      
      const relationship = await getRelationship(mockRelationshipId);
      
      expect(relationship).toBeDefined();
      expect(relationship?.id).toBe(mockRelationshipId);
    });
    
    it('should return null for non-existent relationship ID', async () => {
      // Mock implementation for this test
      const mockGet = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      
      jest.spyOn(global, 'getRelationship' as any).mockImplementation(mockGet);
      
      const relationship = await getRelationship('non-existent-id');
      
      expect(relationship).toBeNull();
    });
  });
  
  describe('updateRelationshipMetadata', () => {
    it('should update relationship metadata', async () => {
      // Mock implementation for this test
      const mockRelationshipId = '1';
      const mockRelationship = {
        id: mockRelationshipId,
        source_type: EntityType.WORKSPACE,
        source_id: FIXTURE_IDS.workspaces.workspace1,
        relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
        target_type: EntityType.PROJECT,
        target_id: FIXTURE_IDS.projects.project1,
        metadata: { existing: 'value' },
        created_at: '2025-04-14T12:00:00Z'
      };
      
      const mockGet = jest.fn().mockResolvedValue(mockRelationship);
      jest.spyOn(global, 'getRelationship' as any).mockImplementation(mockGet);
      
      const mockUpdate = jest.fn().mockResolvedValue({
        data: {
          ...mockRelationship,
          metadata: { existing: 'value', new: 'value' }
        },
        error: null
      });
      
      jest.spyOn(global, 'updateRelationshipMetadata' as any).mockImplementation(mockUpdate);
      
      const updatedRelationship = await updateRelationshipMetadata(mockRelationshipId, { new: 'value' });
      
      expect(updatedRelationship).toBeDefined();
      expect(updatedRelationship.metadata).toEqual({ existing: 'value', new: 'value' });
    });
    
    it('should throw an error for non-existent relationship', async () => {
      // Mock implementation for this test
      const mockGet = jest.fn().mockResolvedValue(null);
      jest.spyOn(global, 'getRelationship' as any).mockImplementation(mockGet);
      
      await expect(updateRelationshipMetadata('non-existent-id', { test: 'value' }))
        .rejects.toThrow(RelationshipError);
    });
  });
  
  describe('deleteRelationship', () => {
    it('should delete a relationship and return true', async () => {
      // Mock implementation for this test
      const mockRelationshipId = '1';
      const mockRelationship = {
        id: mockRelationshipId,
        source_type: EntityType.TASK,
        source_id: FIXTURE_IDS.tasks.task1,
        relationship_type: RelationshipType.TASK_BLOCKS,
        target_type: EntityType.TASK,
        target_id: FIXTURE_IDS.tasks.task2,
        metadata: {},
        created_at: '2025-04-14T12:00:00Z'
      };
      
      const mockGet = jest.fn().mockResolvedValue(mockRelationship);
      jest.spyOn(global, 'getRelationship' as any).mockImplementation(mockGet);
      
      const mockDelete = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });
      
      jest.spyOn(global, 'deleteRelationship' as any).mockImplementation(mockDelete);
      
      const result = await deleteRelationship(mockRelationshipId);
      
      expect(result).toBe(true);
    });
    
    it('should return false for non-existent relationship', async () => {
      // Mock implementation for this test
      const mockGet = jest.fn().mockResolvedValue(null);
      jest.spyOn(global, 'getRelationship' as any).mockImplementation(mockGet);
      
      const result = await deleteRelationship('non-existent-id');
      
      expect(result).toBe(false);
    });
  });
  
  describe('findRelationshipsBetweenEntities', () => {
    it('should find all relationships between two entities', async () => {
      // Mock implementation for this test
      const mockFind = jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            source_type: EntityType.TASK,
            source_id: FIXTURE_IDS.tasks.task1,
            relationship_type: RelationshipType.TASK_BLOCKS,
            target_type: EntityType.TASK,
            target_id: FIXTURE_IDS.tasks.task2,
            metadata: {},
            created_at: '2025-04-14T12:00:00Z'
          },
          {
            id: '2',
            source_type: EntityType.TASK,
            source_id: FIXTURE_IDS.tasks.task2,
            relationship_type: RelationshipType.TASK_BLOCKED_BY,
            target_type: EntityType.TASK,
            target_id: FIXTURE_IDS.tasks.task1,
            metadata: {},
            created_at: '2025-04-14T12:00:00Z'
          }
        ],
        error: null
      });
      
      jest.spyOn(global, 'findRelationshipsBetweenEntities' as any).mockImplementation(mockFind);
      
      const relationships = await findRelationshipsBetweenEntities(
        EntityType.TASK,
        FIXTURE_IDS.tasks.task1,
        EntityType.TASK,
        FIXTURE_IDS.tasks.task2
      );
      
      expect(relationships).toHaveLength(2);
      
      // Check that we have the expected relationship types
      const relationshipTypes = relationships.map(r => r.relationship_type);
      expect(relationshipTypes).toContain(RelationshipType.TASK_BLOCKS);
      expect(relationshipTypes).toContain(RelationshipType.TASK_BLOCKED_BY);
    });
  });
});
