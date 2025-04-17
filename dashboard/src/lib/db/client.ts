/**
 * Simple IndexedDB client for offline storage
 * This provides a lightweight alternative to WatermelonDB while we resolve dependency issues
 */

const DB_NAME = 'convoy-mvp';
const DB_VERSION = 1;

// Define object stores (tables)
const STORES = {
  workspaces: 'workspaces',
  projects: 'projects',
  workstreams: 'workstreams',
  tasks: 'tasks',
  relationships: 'relationships',
  syncMetadata: 'sync_metadata'
};

// Initialize IndexedDB
async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error('Failed to open database'));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.workspaces)) {
        const workspacesStore = db.createObjectStore(STORES.workspaces, { keyPath: 'id' });
        workspacesStore.createIndex('name', 'name', { unique: false });
        workspacesStore.createIndex('deleted_at', 'deleted_at', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.projects)) {
        const projectsStore = db.createObjectStore(STORES.projects, { keyPath: 'id' });
        projectsStore.createIndex('workspace_id', 'workspace_id', { unique: false });
        projectsStore.createIndex('name', 'name', { unique: false });
        projectsStore.createIndex('status', 'status', { unique: false });
        projectsStore.createIndex('deleted_at', 'deleted_at', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.workstreams)) {
        const workstreamsStore = db.createObjectStore(STORES.workstreams, { keyPath: 'id' });
        workstreamsStore.createIndex('project_id', 'project_id', { unique: false });
        workstreamsStore.createIndex('name', 'name', { unique: false });
        workstreamsStore.createIndex('status', 'status', { unique: false });
        workstreamsStore.createIndex('deleted_at', 'deleted_at', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.tasks)) {
        const tasksStore = db.createObjectStore(STORES.tasks, { keyPath: 'id' });
        tasksStore.createIndex('project_id', 'project_id', { unique: false });
        tasksStore.createIndex('workstream_id', 'workstream_id', { unique: false });
        tasksStore.createIndex('title', 'title', { unique: false });
        tasksStore.createIndex('status', 'status', { unique: false });
        tasksStore.createIndex('priority', 'priority', { unique: false });
        tasksStore.createIndex('deleted_at', 'deleted_at', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.relationships)) {
        const relationshipsStore = db.createObjectStore(STORES.relationships, { keyPath: 'id' });
        relationshipsStore.createIndex('source_type', 'source_type', { unique: false });
        relationshipsStore.createIndex('source_id', 'source_id', { unique: false });
        relationshipsStore.createIndex('relationship_type', 'relationship_type', { unique: false });
        relationshipsStore.createIndex('target_type', 'target_type', { unique: false });
        relationshipsStore.createIndex('target_id', 'target_id', { unique: false });
        relationshipsStore.createIndex('deleted_at', 'deleted_at', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.syncMetadata)) {
        db.createObjectStore(STORES.syncMetadata, { keyPath: 'key' });
      }
    };
  });
}

// Basic CRUD operations for any store
export async function getAll<T>(storeName: string, query?: { index?: string; value?: any }): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    let request;
    if (query && query.index && query.value !== undefined) {
      const index = store.index(query.index);
      request = index.getAll(query.value);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => {
      resolve(request.result);
      db.close();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to get records from ${storeName}`));
      db.close();
    };
  });
}

export async function getById<T>(storeName: string, id: string): Promise<T | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
      db.close();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to get record ${id} from ${storeName}`));
      db.close();
    };
  });
}

export async function add<T extends { id: string }>(storeName: string, data: T): Promise<T> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Ensure created_at and updated_at are set
    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }
    if (!data.updated_at) {
      data.updated_at = new Date().toISOString();
    }
    
    const request = store.add(data);
    
    request.onsuccess = () => {
      resolve(data);
      db.close();
    };
    
    request.onerror = (event) => {
      reject(new Error(`Failed to add record to ${storeName}: ${(event.target as IDBRequest).error}`));
      db.close();
    };
  });
}

export async function update<T extends { id: string }>(storeName: string, data: T): Promise<T> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Update the updated_at timestamp
    data.updated_at = new Date().toISOString();
    
    const request = store.put(data);
    
    request.onsuccess = () => {
      resolve(data);
      db.close();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to update record in ${storeName}`));
      db.close();
    };
  });
}

export async function softDelete(storeName: string, id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const data = getRequest.result;
      if (data) {
        data.deleted_at = new Date().toISOString();
        data.updated_at = new Date().toISOString();
        
        const updateRequest = store.put(data);
        
        updateRequest.onsuccess = () => {
          resolve();
          db.close();
        };
        
        updateRequest.onerror = () => {
          reject(new Error(`Failed to soft delete record ${id} from ${storeName}`));
          db.close();
        };
      } else {
        reject(new Error(`Record ${id} not found in ${storeName}`));
        db.close();
      }
    };
    
    getRequest.onerror = () => {
      reject(new Error(`Failed to get record ${id} from ${storeName} for soft delete`));
      db.close();
    };
  });
}

export async function hardDelete(storeName: string, id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
      db.close();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to delete record ${id} from ${storeName}`));
      db.close();
    };
  });
}

export async function query<T>(
  storeName: string,
  filters: { [index: string]: any } = {}
): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      let results = request.result;
      
      // Apply filters (this is simplified; in a real app you would use indexes)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          results = results.filter(item => item[key] === value);
        }
      });
      
      // Filter out soft-deleted items by default
      if (filters.deleted_at === undefined) {
        results = results.filter(item => !item.deleted_at);
      }
      
      resolve(results);
      db.close();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to query records from ${storeName}`));
      db.close();
    };
  });
}

// Export stores for convenience
export const stores = STORES;

// Export a function to clear the database (for testing)
export async function clearDatabase(): Promise<void> {
  const db = await openDatabase();
  db.close();
  
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => {
      resolve();
    };
    
    deleteRequest.onerror = () => {
      reject(new Error('Failed to delete database'));
    };
  });
}

// Initialize the database when this module is imported
openDatabase().then(() => {
  console.log('IndexedDB initialized');
}).catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});
