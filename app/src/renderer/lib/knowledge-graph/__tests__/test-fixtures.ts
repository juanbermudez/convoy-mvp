/**
 * Test Fixtures for Knowledge Graph Tests
 * 
 * This file contains test data and utilities for testing the knowledge graph implementation.
 */

import { EntityType, RelationshipType } from '../types';

// Mock entity IDs
export const FIXTURE_IDS = {
  workspaces: {
    workspace1: '11111111-1111-1111-1111-111111111111',
    workspace2: '22222222-2222-2222-2222-222222222222'
  },
  projects: {
    project1: '33333333-3333-3333-3333-333333333333',
    project2: '44444444-4444-4444-4444-444444444444',
    project3: '55555555-5555-5555-5555-555555555555'
  },
  workstreams: {
    workstream1: '66666666-6666-6666-6666-666666666666',
    workstream2: '77777777-7777-7777-7777-777777777777',
    workstream3: '88888888-8888-8888-8888-888888888888'
  },
  tasks: {
    task1: '99999999-9999-9999-9999-999999999999',
    task2: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    task3: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    task4: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    task5: 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  }
};

// Mock entity data
export const MOCK_ENTITIES = {
  workspaces: [
    {
      id: FIXTURE_IDS.workspaces.workspace1,
      name: 'Convoy Development',
      description: 'Main workspace for Convoy development',
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.workspaces.workspace2,
      name: 'Personal Projects',
      description: 'Personal workspace for miscellaneous projects',
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    }
  ],
  projects: [
    {
      id: FIXTURE_IDS.projects.project1,
      workspace_id: FIXTURE_IDS.workspaces.workspace1,
      name: 'Data Architecture',
      description: 'Implementing the data architecture for Convoy',
      status: 'active',
      target_date: '2025-04-21T00:00:00Z',
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.projects.project2,
      workspace_id: FIXTURE_IDS.workspaces.workspace1,
      name: 'UI Components',
      description: 'Building reusable UI components',
      status: 'active',
      target_date: '2025-04-28T00:00:00Z',
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.projects.project3,
      workspace_id: FIXTURE_IDS.workspaces.workspace2,
      name: 'Learning Project',
      description: 'Personal learning project',
      status: 'active',
      target_date: '2025-05-15T00:00:00Z',
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    }
  ],
  workstreams: [
    {
      id: FIXTURE_IDS.workstreams.workstream1,
      project_id: FIXTURE_IDS.projects.project1,
      name: 'Database Implementation',
      description: 'Implementing the database schema and queries',
      status: 'active',
      progress: 0.25,
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.workstreams.workstream2,
      project_id: FIXTURE_IDS.projects.project1,
      name: 'Local Storage',
      description: 'Implementing WatermelonDB for local storage',
      status: 'active',
      progress: 0,
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.workstreams.workstream3,
      project_id: FIXTURE_IDS.projects.project2,
      name: 'Core Components',
      description: 'Building core UI components',
      status: 'active',
      progress: 0.5,
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    }
  ],
  tasks: [
    {
      id: FIXTURE_IDS.tasks.task1,
      project_id: FIXTURE_IDS.projects.project1,
      workstream_id: FIXTURE_IDS.workstreams.workstream1,
      title: 'Database Schema Design',
      description: 'Design and implement the database schema',
      status: 'to_do',
      priority: 'high',
      labels: [],
      relationships: {},
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.tasks.task2,
      project_id: FIXTURE_IDS.projects.project1,
      workstream_id: FIXTURE_IDS.workstreams.workstream1,
      title: 'Knowledge Graph Implementation',
      description: 'Implement the relationship graph structure',
      status: 'backlog',
      priority: 'high',
      labels: [],
      relationships: {},
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.tasks.task3,
      project_id: FIXTURE_IDS.projects.project1,
      workstream_id: FIXTURE_IDS.workstreams.workstream2,
      title: 'Watermelon DB Model Creation',
      description: 'Create models for local storage',
      status: 'backlog',
      priority: 'medium',
      labels: [],
      relationships: {},
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.tasks.task4,
      project_id: FIXTURE_IDS.projects.project2,
      workstream_id: FIXTURE_IDS.workstreams.workstream3,
      title: 'Button Component',
      description: 'Create reusable button component',
      status: 'in_progress',
      priority: 'medium',
      labels: [],
      relationships: {},
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    },
    {
      id: FIXTURE_IDS.tasks.task5,
      project_id: FIXTURE_IDS.projects.project2,
      workstream_id: null,
      title: 'Project Planning',
      description: 'Plan the UI component library',
      status: 'completed',
      priority: 'high',
      labels: [],
      relationships: {},
      created_at: '2025-04-14T12:00:00Z',
      updated_at: '2025-04-14T12:00:00Z'
    }
  ]
};

// Mock relationship definitions (for creating test data)
export const MOCK_RELATIONSHIPS = [
  // Workspace-Project relationships
  {
    source_type: EntityType.WORKSPACE,
    source_id: FIXTURE_IDS.workspaces.workspace1,
    relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project1,
    relationship_type: RelationshipType.PROJECT_BELONGS_TO_WORKSPACE,
    target_type: EntityType.WORKSPACE,
    target_id: FIXTURE_IDS.workspaces.workspace1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSPACE,
    source_id: FIXTURE_IDS.workspaces.workspace1,
    relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project2,
    relationship_type: RelationshipType.PROJECT_BELONGS_TO_WORKSPACE,
    target_type: EntityType.WORKSPACE,
    target_id: FIXTURE_IDS.workspaces.workspace1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSPACE,
    source_id: FIXTURE_IDS.workspaces.workspace2,
    relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project3,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project3,
    relationship_type: RelationshipType.PROJECT_BELONGS_TO_WORKSPACE,
    target_type: EntityType.WORKSPACE,
    target_id: FIXTURE_IDS.workspaces.workspace2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  
  // Project-Workstream relationships
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project1,
    relationship_type: RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream1,
    relationship_type: RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project1,
    relationship_type: RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream2,
    relationship_type: RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project2,
    relationship_type: RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream3,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream3,
    relationship_type: RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  
  // Project-Task relationships
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project1,
    relationship_type: RelationshipType.PROJECT_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
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
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task2,
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
    target_id: FIXTURE_IDS.tasks.task3,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task3,
    relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project2,
    relationship_type: RelationshipType.PROJECT_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task4,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task4,
    relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.PROJECT,
    source_id: FIXTURE_IDS.projects.project2,
    relationship_type: RelationshipType.PROJECT_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task5,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task5,
    relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: FIXTURE_IDS.projects.project2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  
  // Workstream-Task relationships
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream1,
    relationship_type: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task1,
    relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream1,
    relationship_type: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task2,
    relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream2,
    relationship_type: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task3,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task3,
    relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.WORKSTREAM,
    source_id: FIXTURE_IDS.workstreams.workstream3,
    relationship_type: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task4,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task4,
    relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: FIXTURE_IDS.workstreams.workstream3,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  
  // Task dependency relationships
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task1,
    relationship_type: RelationshipType.TASK_BLOCKS,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task2,
    relationship_type: RelationshipType.TASK_BLOCKED_BY,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task1,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task2,
    relationship_type: RelationshipType.TASK_BLOCKS,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task3,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task3,
    relationship_type: RelationshipType.TASK_BLOCKED_BY,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task2,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task4,
    relationship_type: RelationshipType.TASK_RELATED_TO,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task5,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  },
  {
    source_type: EntityType.TASK,
    source_id: FIXTURE_IDS.tasks.task5,
    relationship_type: RelationshipType.TASK_RELATED_TO,
    target_type: EntityType.TASK,
    target_id: FIXTURE_IDS.tasks.task4,
    metadata: {},
    created_at: '2025-04-14T12:00:00Z'
  }
];

// Mock Supabase client for testing
export const mockSupabaseClient = {
  // Mock database tables
  tables: {
    workspaces: [...MOCK_ENTITIES.workspaces],
    projects: [...MOCK_ENTITIES.projects],
    workstreams: [...MOCK_ENTITIES.workstreams],
    tasks: [...MOCK_ENTITIES.tasks],
    relationships: [...MOCK_RELATIONSHIPS]
  },
  
  // Reset mock database to initial state
  resetMockDb() {
    this.tables = {
      workspaces: [...MOCK_ENTITIES.workspaces],
      projects: [...MOCK_ENTITIES.projects],
      workstreams: [...MOCK_ENTITIES.workstreams],
      tasks: [...MOCK_ENTITIES.tasks],
      relationships: [...MOCK_RELATIONSHIPS]
    };
  },
  
  // Mock Supabase from method
  from(table: string) {
    return {
      // Query builder methods
      _filters: {
        // Equality filters
        equals: [] as Array<{ column: string, value: any }>,
        // Other filters would be added here as needed
      },
      _select: '*',
      _single: false,
      _mayBeSingle: false,
      
      // Mock select method
      select(columns: string) {
        this._select = columns;
        return this;
      },
      
      // Mock equality filter
      eq(column: string, value: any) {
        this._filters.equals.push({ column, value });
        return this;
      },
      
      // Mock or filter for complex queries
      or(filterString: string) {
        // Simple implementation for testing
        // In a real mock, this would parse the filter string
        return this;
      },
      
      // Mock single result
      single() {
        this._single = true;
        return this;
      },
      
      // Mock maybeSingle result
      maybeSingle() {
        this._mayBeSingle = true;
        return this;
      },
      
      // Mock insert method
      async insert(data: any) {
        const mockDb = mockSupabaseClient.tables;
        
        // Add ID if not provided
        if (!data.id) {
          data.id = `mock-${Date.now()}`;
        }
        
        // Add timestamps if not provided
        if (!data.created_at) {
          data.created_at = new Date().toISOString();
        }
        
        // Add to mock database
        mockDb[table].push(data);
        
        return {
          data,
          error: null
        };
      },
      
      // Mock update method
      async update(data: any) {
        const mockDb = mockSupabaseClient.tables;
        let updatedData = null;
        
        // Apply filters
        const filtered = this._applyFilters(mockDb[table]);
        
        if (filtered.length > 0) {
          // Update the matching records
          mockDb[table] = mockDb[table].map(item => {
            if (filtered.some(f => f.id === item.id)) {
              updatedData = { ...item, ...data };
              return updatedData;
            }
            return item;
          });
        }
        
        return {
          data: this._formatResult(updatedData ? [updatedData] : []),
          error: null
        };
      },
      
      // Mock delete method
      async delete() {
        const mockDb = mockSupabaseClient.tables;
        
        // Apply filters
        const filtered = this._applyFilters(mockDb[table]);
        
        if (filtered.length > 0) {
          // Delete the matching records
          mockDb[table] = mockDb[table].filter(item => 
            !filtered.some(f => f.id === item.id)
          );
        }
        
        return {
          data: null,
          error: null
        };
      },
      
      // Execute the query
      async then() {
        const mockDb = mockSupabaseClient.tables;
        
        // Apply filters
        const filtered = this._applyFilters(mockDb[table]);
        
        return {
          data: this._formatResult(filtered),
          error: null
        };
      },
      
      // Apply all filters to the data
      _applyFilters(data: any[]) {
        let result = [...data];
        
        // Apply equality filters
        for (const filter of this._filters.equals) {
          result = result.filter(item => item[filter.column] === filter.value);
        }
        
        return result;
      },
      
      // Format the result based on query options
      _formatResult(data: any[]) {
        if (this._single) {
          return data.length > 0 ? data[0] : null;
        }
        
        if (this._mayBeSingle) {
          return data.length > 0 ? data[0] : null;
        }
        
        return data;
      }
    };
  }
};

// Helper to set up the mock Supabase client
export function setupMockSupabase() {
  // Reset the mock database
  mockSupabaseClient.resetMockDb();
  
  // Mock the Supabase client import
  jest.mock('../supabase/client', () => ({
    supabase: mockSupabaseClient
  }));
}
