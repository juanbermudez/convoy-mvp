const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // IPC communication
  invoke: (channel, ...args) => {
    // Whitelist channels to ensure only safe ones are used
    const validChannels = [
      'projects:getAll', 
      'projects:getById', 
      'projects:create', 
      'projects:update', 
      'projects:delete',
      'tasks:getAll', 
      'tasks:getById', 
      'tasks:getByProject', 
      'tasks:create', 
      'tasks:update', 
      'tasks:delete',
      'activities:getAll', 
      'activities:getByProject', 
      'activities:getByTask'
    ];
    
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  },
  
  on: (channel, callback) => {
    const validChannels = [
      'projects:updated',
      'tasks:updated',
      'activities:new'
    ];
    
    if (validChannels.includes(channel)) {
      // Convert callback to a wrapper that removes the event parameter
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      
      // Return a function to remove the listener
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },
  
  removeListener: (channel, callback) => {
    const validChannels = [
      'projects:updated',
      'tasks:updated',
      'activities:new'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
  
  send: (channel, ...args) => {
    const validChannels = [
      'log:info',
      'log:error'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  }
});

// Flag that the preload script has successfully loaded
console.log('Preload script loaded successfully');
