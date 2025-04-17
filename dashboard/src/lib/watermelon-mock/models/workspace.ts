// Mock Workspace model for WatermelonDB

export default class WorkspaceModel {
  static table = 'workspaces';
  
  // Define schema fields
  id: string = '';
  name: string = '';
  description: string = '';
  createdAt: number = 0;
  updatedAt: number = 0;
  remoteId: string = '';
  
  // Mock methods
  update(callback: (model: WorkspaceModel) => void): Promise<WorkspaceModel> {
    callback(this);
    return Promise.resolve(this);
  }
  
  markAsDeleted(): Promise<void> {
    return Promise.resolve();
  }
  
  // Mock relationships
  projects() {
    return {
      fetch: () => Promise.resolve([])
    };
  }
}
