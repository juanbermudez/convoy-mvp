# Convoy Offline-First Architecture

This directory contains the WatermelonDB integration for Convoy's offline-first architecture. It provides local-first data access with seamless synchronization to Supabase.

## Overview

The offline-first architecture consists of the following components:

1. **WatermelonDB**: Local database that mirrors our Supabase schema
2. **Sync Engine**: Bidirectional synchronization between local and remote databases
3. **Local Context Service**: Local-first implementation of our Context Service API
4. **Database Models**: WatermelonDB models that match our Supabase schema

## Directory Structure

```
/watermelon
├── database.ts           # Database setup and initialization
├── contextService.ts     # Local-first Context Service implementation
├── models/               # WatermelonDB models
│   ├── workspace.ts      # Workspace model
│   ├── project.ts        # Project model
│   ├── milestone.ts      # Milestone model
│   ├── task.ts           # Task model
│   ├── ... (other models)
│   └── index.ts          # Model exports
├── sync/                 # Synchronization logic
│   ├── pullSync.ts       # Pull changes from Supabase
│   ├── pushSync.ts       # Push changes to Supabase
│   ├── idMapping.ts      # Map local and remote IDs
│   ├── synchronize.ts    # Sync orchestration
│   └── index.ts          # Sync exports
└── README.md             # This documentation file
```

## Key Features

### Local-First Data Access

The architecture prioritizes local data access, providing several benefits:

- **Performance**: Local queries are significantly faster than remote API calls
- **Offline Capability**: Works without an internet connection
- **Resilience**: Continues working during network interruptions
- **Reduced Server Load**: Many operations are handled locally

### Smart Synchronization

The sync engine handles bidirectional synchronization:

- **Pull Sync**: Fetches changes from Supabase to local database
- **Push Sync**: Sends local changes to Supabase
- **Efficient Transfer**: Only syncs changed data
- **Conflict Resolution**: Handles conflicts between local and remote changes

### Transparent API

The local Context Service implements the same API as the remote service:

```typescript
// The API remains the same, but data comes from local database
import { getTaskContext } from '@/lib/watermelon/contextService';

async function getContext(taskId) {
  const context = await getTaskContext(taskId);
  // Use context...
}
```

This makes it easy to adopt the offline-first approach without changing existing code.

## How It Works

### Database Models

WatermelonDB models mirror our Supabase schema:

```typescript
// Example Task model
class Task extends Model {
  static table = 'tasks';
  
  static associations = {
    milestones: { type: 'belongs_to', key: 'milestone_id' },
    tasks: { type: 'belongs_to', key: 'parent_task_id' },
    subtasks: { type: 'has_many', foreignKey: 'parent_task_id' },
    activity_feed: { type: 'has_many', foreignKey: 'task_id' },
  };

  @text('milestone_id') milestoneId;
  @text('parent_task_id') parentTaskId;
  @text('title') title;
  @text('description') description;
  @text('current_stage') currentStage;
  @text('status') status;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @date('completion_date') completionDate;
  @text('remote_id') remoteId;
  @bool('is_synced') isSynced;
  @text('sync_status') syncStatus;
  
  // ... relationships and methods
}
```

### Synchronization

The sync process follows these steps:

1. **Push Phase**: Send local changes to Supabase
2. **Pull Phase**: Fetch remote changes to local database
3. **Conflict Resolution**: Apply resolution strategies when conflicts occur

### Local Context Service

The Local Context Service retrieves data from WatermelonDB with fallback to Supabase:

```typescript
export async function getTaskContext(taskId: string): Promise<TaskContext | null> {
  try {
    // First try to get the task from the local database
    const task = await getLocalTask(taskId);
    
    // If task doesn't exist locally, try to fetch from remote
    if (!task) {
      return getRemoteTaskContext(taskId);
    }
    
    // Continue retrieving related data locally...
    
  } catch (error) {
    // Fall back to remote on error
    return getRemoteTaskContext(taskId);
  }
}
```

## Usage

### Initialization

Initialize the database when the application starts:

```typescript
import { initDatabase } from '@/lib/watermelon';

// In your app initialization code
await initDatabase();
```

### Using the Context Service

Use the local Context Service just like the remote one:

```typescript
import * as contextService from '@/lib/watermelon/contextService';

// Get task context
const context = await contextService.getTaskContext(taskId);

// Update task stage
await contextService.updateTaskStage(taskId, 'IMPLEMENT');

// Create a new task
await contextService.createTask({ 
  milestone_id: milestoneId,
  title: 'New Task',
  // ...
});
```

### Manual Synchronization

Trigger manual synchronization when needed:

```typescript
import { sync } from '@/lib/watermelon';

// Sync data
await sync();
```

## Conclusion

The WatermelonDB integration provides Convoy with a robust offline-first architecture that significantly improves performance and reliability. By prioritizing local data access and implementing smart synchronization, it creates a seamless user experience regardless of network connectivity.
