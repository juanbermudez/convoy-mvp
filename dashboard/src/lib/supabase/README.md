# Convoy Supabase Integration

This directory contains the Supabase integration for the Convoy knowledge graph. It provides the database structure and access functions that power the Memory Bank pattern.

## Overview

The Convoy knowledge graph is implemented in Supabase using a structured approach with the following components:

1. **Database Schema**: PostgreSQL tables with relationships defining the knowledge graph structure
2. **Supabase Client**: A configured client for connecting to the Supabase project
3. **Memory Context Provider (MCP)**: Functions for retrieving context from the knowledge graph
4. **Data Operations**: Utility functions for common database operations
5. **Type Definitions**: TypeScript types for database tables and operations

## Directory Structure

```
/supabase
├── client.ts           # Supabase client configuration
├── mcp.ts              # Memory Context Provider functions
├── dataOperations.ts   # Common data operation functions
├── types.ts            # TypeScript type definitions
└── README.md           # This documentation file
```

## Getting Started

To use the Supabase integration, you need to:

1. Install the Supabase client library: `npm install @supabase/supabase-js`
2. Set up environment variables for Supabase connection:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Core Components

### Supabase Client

The `client.ts` file provides a configured Supabase client for connecting to your project:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default supabase;
```

### Memory Context Provider (MCP)

The `mcp.ts` file provides functions for retrieving comprehensive context from the knowledge graph:

```typescript
import { getTaskContext } from '@/lib/supabase/mcp';

// Example usage
async function fetchTaskContext(taskId: string) {
  const context = await getTaskContext(taskId);
  
  if (context) {
    console.log('Task:', context.task.title);
    console.log('Milestone:', context.milestone.name);
    console.log('Project:', context.project.name);
    console.log('Workspace:', context.workspace.name);
  }
}
```

### Data Operations

The `dataOperations.ts` file provides utility functions for common database operations:

```typescript
import { createWorkspace, createProject, createMilestone } from '@/lib/supabase/dataOperations';

// Example usage
async function setupNewProject() {
  // Create a workspace
  const workspace = await createWorkspace({
    name: 'New Workspace',
    description: 'A new development workspace'
  });
  
  if (workspace) {
    // Create a project in the workspace
    const project = await createProject({
      workspace_id: workspace.id,
      name: 'New Project',
      description: 'A new project in the workspace'
    });
    
    if (project) {
      // Create a milestone in the project
      const milestone = await createMilestone({
        project_id: project.id,
        name: 'Initial Milestone',
        status: 'PLANNED'
      });
    }
  }
}
```

## Type Definitions

The `types.ts` file provides TypeScript type definitions for database tables and operations. These types ensure that all database operations are properly typed and catch errors at compile time.

## React Integration

To use the Supabase integration in React components, use the provided hooks in the `/hooks` directory:

```typescript
import { useMemoryBank } from '@/hooks/useMemoryBank';

function TaskComponent({ taskId }: { taskId: string }) {
  const { context, isLoading, error, refreshContext } = useMemoryBank(taskId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!context) return <div>No context found</div>;
  
  return (
    <div>
      <h1>{context.task.title}</h1>
      <p>Stage: {context.task.current_stage}</p>
      <p>Milestone: {context.milestone.name}</p>
      <p>Project: {context.project.name}</p>
      <p>Workspace: {context.workspace.name}</p>
    </div>
  );
}
```

## Testing

To test the Supabase integration, navigate to the `/tests/supabase` route in the dashboard. This provides test components for verifying the connection and context retrieval.

## Documentation

For more detailed documentation, refer to the following:

- [Supabase Integration Overview](/docs/implementation/supabase/overview.md)
- [Database Schema](/docs/implementation/supabase/schema.md)
- [MCP Functions](/docs/implementation/supabase/mcp.md)
- [Data Operations](/docs/implementation/supabase/data-operations.md)
- [React Hooks](/docs/implementation/supabase/hooks.md)

## Future Enhancements

Planned enhancements for the Supabase integration include:

1. Real-time updates using Supabase's realtime features
2. Enhanced authentication and authorization
3. Optimized context retrieval with caching
4. Additional database indexes for performance
5. Extended query capabilities for complex filtering

## Contributing

When contributing to the Supabase integration, please follow these guidelines:

1. Use the declarative schema approach for all database changes
2. Include proper TypeScript types for all functions and entities
3. Implement comprehensive error handling
4. Document all functions and types
5. Write tests for new functionality
