import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import schema from './schema';
import migrations from './migrations';
import Workspace from './Workspace';
import Project from './Project';
import Workstream from './Workstream';
import Task from './Task';
import Relationship from './Relationship';
import SyncMetadata from './SyncMetadata';

// Use LokiJS adapter for browser environments
const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false, // Set to true in production for better performance
  useIncrementalIndexedDB: true,
  onQuotaExceededError: error => {
    console.error('LokiJS quota exceeded', error);
  },
  onSetUpError: error => {
    console.error('LokiJS setup error', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Workspace,
    Project,
    Workstream,
    Task,
    Relationship,
    SyncMetadata
  ],
});

// Export collections for easier access
export const workspaces = database.collections.get('workspaces');
export const projects = database.collections.get('projects');
export const workstreams = database.collections.get('workstreams');
export const tasks = database.collections.get('tasks');
export const relationships = database.collections.get('relationships');
export const syncMetadata = database.collections.get('sync_metadata');

// Add typing for TypeScript
declare module '@nozbe/watermelondb/Collection' {
  interface CollectionMap {
    workspaces: Workspace;
    projects: Project;
    workstreams: Workstream;
    tasks: Task;
    relationships: Relationship;
    sync_metadata: SyncMetadata;
  }
}
