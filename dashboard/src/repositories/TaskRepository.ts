import { database, tasks } from '../models';
import { syncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';
import Task from '../models/Task';
import { Observable } from 'rxjs';

// Interface for task filters
export interface TaskFilters {
  projectId?: string;
  workstreamId?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export class TaskRepository {
  // Get all tasks with optional filters
  async getTasks(filters: TaskFilters = {}) {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Build query conditions
      const conditions = [Q.where('deleted_at', null)];
      
      // Add filter conditions
      if (filters.projectId) {
        conditions.push(Q.where('project_id', filters.projectId));
      }
      
      if (filters.workstreamId) {
        conditions.push(Q.where('workstream_id', filters.workstreamId));
      }
      
      if (filters.status) {
        conditions.push(Q.where('status', filters.status));
      }
      
      if (filters.priority) {
        conditions.push(Q.where('priority', filters.priority));
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        conditions.push(
          Q.or(
            Q.where('title', Q.like(`%${search}%`)),
            Q.where('description', Q.like(`%${search}%`))
          )
        );
      }
      
      // Return data from local database with filters
      return await tasks.query(...conditions).fetch();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }
  
  // Get task by ID
  async getTaskById(id: string) {
    try {
      const task = await tasks.find(id);
      
      // If the task is deleted, act as if it doesn't exist
      if (task.deletedAt) {
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
  }) {
    try {
      let newTask;
      
      await database.write(async () => {
        newTask = await tasks.create(task => {
          task.title = data.title;
          task.description = data.description || '';
          task.status = data.status || 'backlog';
          task.priority = data.priority || 'medium';
          if (data.ownerId) task.ownerId = data.ownerId;
          task.labels = data.labels || [];
          
          // This is a field that comes from the relation decorator
          // but TypeScript doesn't recognize it directly
          // @ts-ignore
          task.project.id = data.projectId;
          
          // Set workstream if provided
          if (data.workstreamId) {
            // @ts-ignore
            task.workstream.id = data.workstreamId;
          }
        });
      });
      
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
  }) {
    try {
      const task = await this.getTaskById(id);
      
      await database.write(async () => {
        await task.update(t => {
          if (data.title !== undefined) t.title = data.title;
          if (data.description !== undefined) t.description = data.description;
          if (data.status !== undefined) t.status = data.status;
          if (data.priority !== undefined) t.priority = data.priority;
          if (data.ownerId !== undefined) t.ownerId = data.ownerId;
          if (data.labels !== undefined) t.labels = data.labels;
          
          // Updating project relation requires special handling
          if (data.projectId !== undefined) {
            // @ts-ignore
            t.project.id = data.projectId;
          }
          
          // Updating workstream relation requires special handling
          if (data.workstreamId !== undefined) {
            if (data.workstreamId === null) {
              // Remove workstream relationship
              // @ts-ignore
              t.workstream.id = null;
            } else {
              // Set workstream relationship
              // @ts-ignore
              t.workstream.id = data.workstreamId;
            }
          }
        });
      });
      
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
  async deleteTask(id: string) {
    try {
      const task = await this.getTaskById(id);
      
      await database.write(async () => {
        // Soft delete by updating the deletedAt field
        await task.update(t => {
          t.deletedAt = new Date();
        });
      });
      
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
  
  // Observe all tasks
  observeTasks(filters: TaskFilters = {}): Observable<Task[]> {
    // Build query conditions
    const conditions = [Q.where('deleted_at', null)];
    
    // Add filter conditions
    if (filters.projectId) {
      conditions.push(Q.where('project_id', filters.projectId));
    }
    
    if (filters.workstreamId) {
      conditions.push(Q.where('workstream_id', filters.workstreamId));
    }
    
    if (filters.status) {
      conditions.push(Q.where('status', filters.status));
    }
    
    if (filters.priority) {
      conditions.push(Q.where('priority', filters.priority));
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      conditions.push(
        Q.or(
          Q.where('title', Q.like(`%${search}%`)),
          Q.where('description', Q.like(`%${search}%`))
        )
      );
    }
    
    return tasks.query(...conditions).observe();
  }
  
  // Observe a specific task
  observeTask(id: string): Observable<Task> {
    return tasks.findAndObserve(id);
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
