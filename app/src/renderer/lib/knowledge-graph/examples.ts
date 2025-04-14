/**
 * Knowledge Graph Usage Examples
 * 
 * This file contains examples of how to use the knowledge graph implementation.
 * These examples are for documentation purposes and are not used in the actual application.
 */

import { supabase } from '../supabase/client';
import {
  EntityType,
  RelationshipType,
  createRelationship,
  findRelatedEntities,
  findReferencingEntities,
  traverseUpward,
  traverseDownward,
  findPaths,
  getTaskContext,
  getProjectContext,
  getWorkspaceContext
} from './index';

/**
 * Example: Create project hierarchy with relationships
 */
export async function exampleCreateProjectHierarchy() {
  // Create workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .insert({
      name: 'Example Workspace',
      description: 'A workspace for examples'
    })
    .select()
    .single();
  
  // Create project
  const { data: project } = await supabase
    .from('projects')
    .insert({
      workspace_id: workspace.id,
      name: 'Example Project',
      description: 'A project for examples',
      status: 'active'
    })
    .select()
    .single();
  
  // Create workstream
  const { data: workstream } = await supabase
    .from('workstreams')
    .insert({
      project_id: project.id,
      name: 'Example Workstream',
      description: 'A workstream for examples',
      status: 'active',
      progress: 0
    })
    .select()
    .single();
  
  // Create tasks
  const { data: task1 } = await supabase
    .from('tasks')
    .insert({
      project_id: project.id,
      workstream_id: workstream.id,
      title: 'Example Task 1',
      description: 'The first example task',
      status: 'to_do',
      priority: 'medium',
      labels: []
    })
    .select()
    .single();
  
  const { data: task2 } = await supabase
    .from('tasks')
    .insert({
      project_id: project.id,
      workstream_id: workstream.id,
      title: 'Example Task 2',
      description: 'The second example task',
      status: 'to_do',
      priority: 'medium',
      labels: []
    })
    .select()
    .single();
  
  // Create relationships
  
  // Workspace contains project
  await createRelationship({
    source_type: EntityType.WORKSPACE,
    source_id: workspace.id,
    relationship_type: RelationshipType.WORKSPACE_CONTAINS_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: project.id
  });
  
  // Project belongs to workspace
  await createRelationship({
    source_type: EntityType.PROJECT,
    source_id: project.id,
    relationship_type: RelationshipType.PROJECT_BELONGS_TO_WORKSPACE,
    target_type: EntityType.WORKSPACE,
    target_id: workspace.id
  });
  
  // Project contains workstream
  await createRelationship({
    source_type: EntityType.PROJECT,
    source_id: project.id,
    relationship_type: RelationshipType.PROJECT_CONTAINS_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: workstream.id
  });
  
  // Workstream belongs to project
  await createRelationship({
    source_type: EntityType.WORKSTREAM,
    source_id: workstream.id,
    relationship_type: RelationshipType.WORKSTREAM_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: project.id
  });
  
  // Project contains tasks
  await createRelationship({
    source_type: EntityType.PROJECT,
    source_id: project.id,
    relationship_type: RelationshipType.PROJECT_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: task1.id
  });
  
  await createRelationship({
    source_type: EntityType.PROJECT,
    source_id: project.id,
    relationship_type: RelationshipType.PROJECT_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: task2.id
  });
  
  // Tasks belong to project
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task1.id,
    relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: project.id
  });
  
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task2.id,
    relationship_type: RelationshipType.TASK_BELONGS_TO_PROJECT,
    target_type: EntityType.PROJECT,
    target_id: project.id
  });
  
  // Workstream contains tasks
  await createRelationship({
    source_type: EntityType.WORKSTREAM,
    source_id: workstream.id,
    relationship_type: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: task1.id
  });
  
  await createRelationship({
    source_type: EntityType.WORKSTREAM,
    source_id: workstream.id,
    relationship_type: RelationshipType.WORKSTREAM_CONTAINS_TASK,
    target_type: EntityType.TASK,
    target_id: task2.id
  });
  
  // Tasks belong to workstream
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task1.id,
    relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: workstream.id
  });
  
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task2.id,
    relationship_type: RelationshipType.TASK_BELONGS_TO_WORKSTREAM,
    target_type: EntityType.WORKSTREAM,
    target_id: workstream.id
  });
  
  // Task 1 blocks Task 2
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task1.id,
    relationship_type: RelationshipType.TASK_BLOCKS,
    target_type: EntityType.TASK,
    target_id: task2.id
  });
  
  // Task 2 is blocked by Task 1
  await createRelationship({
    source_type: EntityType.TASK,
    source_id: task2.id,
    relationship_type: RelationshipType.TASK_BLOCKED_BY,
    target_type: EntityType.TASK,
    target_id: task1.id
  });
  
  return {
    workspace,
    project,
    workstream,
    task1,
    task2
  };
}

/**
 * Example: Traverse the relationship graph
 */
export async function exampleTraverseGraph() {
  // Create example hierarchy
  const { workspace, project, workstream, task1, task2 } = await exampleCreateProjectHierarchy();
  
  // Traverse up from task to workspace
  console.log('Traversing up from task to workspace:');
  const upwardResults = await traverseUpward(
    EntityType.TASK,
    task1.id,
    { includeEntityData: true }
  );
  
  upwardResults.forEach(result => {
    console.log(`${result.entity_type} (${result.entity_id}): ${result.entity_data?.name || result.entity_data?.title}`);
  });
  
  // Traverse down from workspace to tasks
  console.log('\nTraversing down from workspace to tasks:');
  const downwardResults = await traverseDownward(
    EntityType.WORKSPACE,
    workspace.id,
    { includeEntityData: true }
  );
  
  downwardResults.forEach(result => {
    console.log(`${result.entity_type} (${result.entity_id}): ${result.entity_data?.name || result.entity_data?.title}`);
  });
  
  // Find paths between task1 and task2
  console.log('\nFinding paths between task1 and task2:');
  const paths = await findPaths(
    EntityType.TASK,
    task1.id,
    EntityType.TASK,
    task2.id
  );
  
  paths.forEach((path, index) => {
    console.log(`Path ${index + 1} (length: ${path.length}):`);
    path.relationships.forEach(rel => {
      console.log(`  ${rel.source_type} (${rel.source_id}) --[${rel.relationship_type}]--> ${rel.target_type} (${rel.target_id})`);
    });
  });
  
  // Find related entities
  console.log('\nFinding entities related to task1:');
  const relatedEntities = await findRelatedEntities(
    EntityType.TASK,
    task1.id
  );
  
  relatedEntities.forEach(rel => {
    console.log(`${rel.source_type} (${rel.source_id}) --[${rel.relationship_type}]--> ${rel.target_type} (${rel.target_id})`);
  });
  
  // Find referencing entities
  console.log('\nFinding entities referencing project:');
  const referencingEntities = await findReferencingEntities(
    EntityType.PROJECT,
    project.id
  );
  
  referencingEntities.forEach(rel => {
    console.log(`${rel.source_type} (${rel.source_id}) --[${rel.relationship_type}]--> ${rel.target_type} (${rel.target_id})`);
  });
  
  return {
    workspace,
    project,
    workstream,
    task1,
    task2
  };
}

/**
 * Example: Get context for AI
 */
export async function exampleGetContext() {
  // Create example hierarchy
  const { workspace, project, workstream, task1, task2 } = await exampleCreateProjectHierarchy();
  
  // Get task context
  console.log('Getting task context:');
  const taskContext = await getTaskContext(task1.id);
  console.log(JSON.stringify(taskContext, null, 2));
  
  // Get project context
  console.log('\nGetting project context:');
  const projectContext = await getProjectContext(project.id);
  console.log(JSON.stringify(projectContext, null, 2));
  
  // Get workspace context
  console.log('\nGetting workspace context:');
  const workspaceContext = await getWorkspaceContext(workspace.id);
  console.log(JSON.stringify(workspaceContext, null, 2));
  
  return {
    task1Context: taskContext,
    projectContext,
    workspaceContext
  };
}

/**
 * Example: Using context for AI assistance
 */
export async function exampleAIContextProvider(taskId: string) {
  // Get comprehensive task context
  const context = await getTaskContext(taskId);
  
  // Format for AI consumption
  return {
    systemInstructions: `
      You are assisting with a task in the ${context.workspace?.name || 'unknown'} workspace.
      The task is part of the ${context.project?.name || 'unknown'} project${context.workstream ? ` and the ${context.workstream.name} workstream` : ''}.
      
      Project Description: ${context.project?.description || 'No description'}
      ${context.workstream ? `Workstream Description: ${context.workstream.description || 'No description'}` : ''}
      
      Task Details:
      - Title: ${context.task.title}
      - Description: ${context.task.description || 'No description'}
      - Status: ${context.task.status}
      - Priority: ${context.task.priority}
      
      ${context.blocking_tasks?.length ? `This task blocks ${context.blocking_tasks.length} other tasks.` : ''}
      ${context.blocked_by_tasks?.length ? `This task is blocked by ${context.blocked_by_tasks.length} other tasks.` : ''}
      ${context.related_tasks?.length ? `This task is related to ${context.related_tasks.length} other tasks.` : ''}
      
      Use this context to help the user with their task.
    `.trim(),
    
    userContext: {
      workspace: context.workspace ? {
        id: context.workspace.id,
        name: context.workspace.name
      } : null,
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
      task: {
        id: context.task.id,
        title: context.task.title,
        description: context.task.description,
        status: context.task.status,
        priority: context.task.priority
      },
      relatedTasks: {
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
    }
  };
}
