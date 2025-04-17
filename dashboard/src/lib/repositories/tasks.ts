/**
 * Tasks repository for handling task data access
 */

import { query, getById, add, update, softDelete, stores } from '../db/client';
import { syncService } from '../db/sync';
import { v4 as uuidv4 } from 'uuid';

// Task interface
export interface Task {
  id: string;
  project_id: string;
  workstream_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  owner_id?: string;
  labels?: string; // JSON stringified
  relationships?: string; // JSON stringified
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_modified_by?: string;
  client_version?: number;
}

// Interface for task filters
export interface TaskFilters {
  projectId?: string;
  workstreamId?: string;
  status?: string;
  priority?: string;
  search?: string;
}

class TaskRepository {
  // Get all tasks with optional filters
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Build query filters
      const queryFilters: Record<string, any> = {};
      
      if (filters.projectId) {
        queryFilters.project_id = filters.projectId;
      }
      
      if (filters.workstreamId) {
        queryFilters.workstream_id = filters.workstreamId;
      }
      
      if (filters.status) {
        queryFilters.status = filters.status;
      }
      
      if (filters.priority) {
        queryFilters.priority = filters.priority;
      }
      
      // Get tasks from IndexedDB
      let tasks = await query<Task>(stores.tasks, queryFilters);
      
      // Handle search (client-side filtering)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(search) || 
          (task.description || '').toLowerCase().includes(search)
        );
      }
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }
  
  // Get task by ID
  async getTaskById(id: string): Promise<Task> {
    try {
      const task = await getById<Task>(stores.tasks, id);
      
      if (!task || task.deleted_at) {
        throw new Error(`Task ${id} not found`);
      }
      
      return task;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new task
  async createTask(data: {
    projectId: string;
    workstreamId?: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    ownerId?: string;
    labels?: any[];
  }): Promise<Task> {
    try {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: uuidv4(),
        project_id: data.projectId,
        workstream_id: data.workstreamId,
        title: data.title,
        description: data.description || '',
        status: data.status || 'backlog',
        priority: data.priority || 'medium',
        owner_id: data.ownerId,
        labels: data.labels ? JSON.stringify(data.labels) : '[]',
        relationships: '{}',
        created_at: now,
        updated_at: now,
        last_modified_by: syncService.getStatus().isOnline ? 'server' : 'local',
        client_version: 1
      };
      
      // Add to IndexedDB
      await add<Task>(stores.tasks, newTask);
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
  
  // Update a task
  async updateTask(id: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    ownerId?: string | null;
    projectId?: string;
    workstreamId?: string | null;
    labels?: any[];
  }): Promise<Task> {
    try {
      // Get current task
      const task = await this.getTaskById(id);
      
      // Update fields
      if (data.title !== undefined) task.title = data.title;
      if (data.description !== undefined) task.description = data.description;
      if (data.status !== undefined) task.status = data.status;
      if (data.priority !== undefined) task.priority = data.priority;
      if (data.ownerId !== undefined) task.owner_id = data.ownerId || undefined;
      if (data.projectId !== undefined) task.project_id = data.projectId;
      if (data.workstreamId !== undefined) task.workstream_id = data.workstreamId || undefined;
      if (data.labels !== undefined) task.labels = JSON.stringify(data.labels);
      
      // Update metadata
      task.updated_at = new Date().toISOString();
      task.last_modified_by = syncService.getStatus().isOnline ? 'server' : 'local';
      task.client_version = (task.client_version || 0) + 1;
      
      // Update in IndexedDB
      await update<Task>(stores.tasks, task);
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return task;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a task
  async deleteTask(id: string): Promise<boolean> {
    try {
      // Soft delete in IndexedDB
      await softDelete(stores.tasks, id);
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }
  
  // Subscribe to changes (simplified version)
  observeTasks(callback: (tasks: Task[]) => void, filters: TaskFilters = {}) {
    // This is a simplified implementation
    // In a real app, we would use a proper observable pattern
    
    // Initial load
    this.getTasks(filters).then(callback).catch(console.error);
    
    // Poll for changes every 2 seconds
    const intervalId = setInterval(() => {
      this.getTasks(filters).then(callback).catch(console.error);
    }, 2000);
    
    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }
  
  // Subscribe to a single task
  observeTask(callback: (task: Task | null) => void, id: string) {
    // This is a simplified implementation
    
    // Initial load
    this.getTaskById(id).then(callback).catch(error => {
      console.error(error);
      callback(null);
    });
    
    // Poll for changes every 2 seconds
    const intervalId = setInterval(() => {
      this.getTaskById(id).then(callback).catch(error => {
        console.error(error);
        callback(null);
      });
    }, 2000);
    
    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
