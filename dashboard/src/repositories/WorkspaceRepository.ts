import { database, workspaces } from '../models';
import { syncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';
import Workspace from '../models/Workspace';

export class WorkspaceRepository {
  // Get all workspaces
  async getWorkspaces() {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Return data from local database (only non-deleted)
      return await workspaces.query(
        Q.where('deleted_at', null)
      ).fetch();
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }
  
  // Get workspace by ID
  async getWorkspaceById(id: string) {
    try {
      const workspace = await workspaces.find(id);
      
      // If the workspace is deleted, act as if it doesn't exist
      if (workspace.deletedAt) {
        throw new Error(`Workspace ${id} not found`);
      }
      
      return workspace;
    } catch (error) {
      console.error(`Error fetching workspace ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new workspace
  async createWorkspace(data: { name: string; description?: string }) {
    try {
      let newWorkspace: Workspace;
      
      await database.write(async () => {
        newWorkspace = await workspaces.create(workspace => {
          workspace.name = data.name;
          workspace.description = data.description || '';
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return newWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }
  
  // Update a workspace
  async updateWorkspace(id: string, data: { name?: string; description?: string }) {
    try {
      const workspace = await workspaces.find(id);
      
      // Check if workspace exists and is not deleted
      if (workspace.deletedAt) {
        throw new Error(`Workspace ${id} not found or is deleted`);
      }
      
      await database.write(async () => {
        await workspace.update(w => {
          if (data.name !== undefined) w.name = data.name;
          if (data.description !== undefined) w.description = data.description;
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return workspace;
    } catch (error) {
      console.error(`Error updating workspace ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a workspace
  async deleteWorkspace(id: string) {
    try {
      const workspace = await workspaces.find(id);
      
      await database.write(async () => {
        // Soft delete by updating the deletedAt field
        await workspace.update(w => {
          w.deletedAt = new Date();
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting workspace ${id}:`, error);
      throw error;
    }
  }
  
  // Observe all workspaces
  observeWorkspaces(): Observable<Workspace[]> {
    return workspaces.query(
      Q.where('deleted_at', null)
    ).observe();
  }
  
  // Observe a specific workspace
  observeWorkspace(id: string): Observable<Workspace> {
    return workspaces.findAndObserve(id);
  }
}

// Export singleton instance
export const workspaceRepository = new WorkspaceRepository();
