const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'convoy', 
  {
    // Configuration
    getConfig: () => ipcRenderer.invoke('convoy:getConfig'),
    saveConfig: (config) => ipcRenderer.invoke('convoy:saveConfig', config),
    
    // Project Management
    getProjects: () => ipcRenderer.invoke('convoy:getProjects'),
    createProject: (projectData) => ipcRenderer.invoke('convoy:createProject', projectData),
    
    // Task Management
    getTasks: (projectId) => ipcRenderer.invoke('convoy:getTasks', projectId),
    getTask: (taskId) => ipcRenderer.invoke('convoy:getTask', taskId),
    updateTaskStatus: (taskId, status) => ipcRenderer.invoke('convoy:updateTaskStatus', taskId, status),
    
    // AI Planning
    planProject: (projectId, description) => ipcRenderer.invoke('convoy:planProject', projectId, description),
    
    // Activity Feed
    getActivityFeed: (taskId) => ipcRenderer.invoke('convoy:getActivityFeed', taskId),
    logActivity: (activityData) => ipcRenderer.invoke('convoy:logActivity', activityData),
    
    // Checkpoint Management
    checkTaskCheckpoint: (taskId) => ipcRenderer.invoke('convoy:checkTaskCheckpoint', taskId),
    generateCheckpointSummary: (taskId, checkpointType) => 
      ipcRenderer.invoke('convoy:generateCheckpointSummary', taskId, checkpointType),
    processCheckpointFeedback: (taskId, feedbackContent, approved) => 
      ipcRenderer.invoke('convoy:processCheckpointFeedback', taskId, feedbackContent, approved),
    
    // Cline Integration (placeholder for Phase 3)
    initializeCline: () => ipcRenderer.invoke('convoy:initializeCline')
  }
);
