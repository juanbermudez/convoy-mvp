import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './models/schema';
import { synchronize } from './sync/synchronize';

// Import all models
import WorkspaceModel from './models/workspace';
import ProjectModel from './models/project';
import MilestoneModel from './models/milestone';
import TaskModel from './models/task';
import TaskDependencyModel from './models/taskDependency';
import ActivityFeedModel from './models/activityFeed';
import WorkflowModel from './models/workflow';
import PatternModel from './models/pattern';
import BestPracticeModel from './models/bestPractice';

// Create the adapter
const adapter = new SQLiteAdapter({
  schema,
  // Optional database name, defaults to 'watermelon'
  dbName: 'convoy',
  // Optional migrations
  migrations: [],
  // Optional logging function
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

// Create the database
export const database = new Database({
  adapter,
  modelClasses: [
    WorkspaceModel,
    ProjectModel,
    MilestoneModel,
    TaskModel,
    TaskDependencyModel,
    ActivityFeedModel,
    WorkflowModel,
    PatternModel,
    BestPracticeModel,
  ],
});

// Configure sync settings
let lastSyncTimestamp = 0;
const syncInterval = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize the database
 * This function should be called when the application starts
 */
export async function initDatabase() {
  try {
    console.log('Initializing WatermelonDB database...');
    
    // Perform initial sync if we have no data
    const workspaces = await database.get('workspaces').query().fetch();
    
    if (workspaces.length === 0) {
      console.log('No workspaces found, performing initial sync...');
      await synchronize();
      lastSyncTimestamp = Date.now();
    }
    
    // Set up periodic sync
    setInterval(async () => {
      try {
        // Only sync if we're online
        if (navigator.onLine) {
          console.log('Performing periodic sync...');
          await synchronize();
          lastSyncTimestamp = Date.now();
        }
      } catch (error) {
        console.error('Periodic sync error:', error);
      }
    }, syncInterval);
    
    console.log('WatermelonDB database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

/**
 * Manually trigger synchronization
 */
export async function sync() {
  try {
    if (navigator.onLine) {
      await synchronize();
      lastSyncTimestamp = Date.now();
      return true;
    } else {
      console.warn('Cannot sync while offline');
      return false;
    }
  } catch (error) {
    console.error('Manual sync error:', error);
    return false;
  }
}

/**
 * Get the timestamp of the last successful sync
 */
export function getLastSyncTimestamp() {
  return lastSyncTimestamp;
}

export default database;
