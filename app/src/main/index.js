const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { ConvoyOrchestrator } = require('./orchestrator');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Initialize the orchestrator
const orchestrator = new ConvoyOrchestrator();

let mainWindow;

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Initialize the orchestrator
  await orchestrator.initialize().catch(err => {
    console.error('Failed to initialize orchestrator:', err);
  });

  // In production, load the bundled app file
  // For development, load from a local server or file path
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set up IPC handlers for communication with the renderer process

// Configuration handling
ipcMain.handle('convoy:getConfig', async () => {
  return orchestrator.config;
});

ipcMain.handle('convoy:saveConfig', async (event, config) => {
  return await orchestrator.saveConfiguration(config);
});

// Project management
ipcMain.handle('convoy:getProjects', async () => {
  return await orchestrator.getProjects();
});

ipcMain.handle('convoy:createProject', async (event, projectData) => {
  return await orchestrator.createProject(projectData);
});

// Task management
ipcMain.handle('convoy:getTasks', async (event, projectId) => {
  return await orchestrator.getTasks(projectId);
});

ipcMain.handle('convoy:getTask', async (event, taskId) => {
  return await orchestrator.getTask(taskId);
});

ipcMain.handle('convoy:updateTaskStatus', async (event, taskId, status) => {
  return await orchestrator.updateTaskStatus(taskId, status);
});

// AI Planning
ipcMain.handle('convoy:planProject', async (event, projectId, description) => {
  return await orchestrator.planProject(projectId, description);
});

// Activity Feed
ipcMain.handle('convoy:getActivityFeed', async (event, taskId) => {
  return await orchestrator.getActivityFeed(taskId);
});

ipcMain.handle('convoy:logActivity', async (event, activityData) => {
  return await orchestrator.logActivity(activityData);
});

// Checkpoint management
ipcMain.handle('convoy:checkTaskCheckpoint', async (event, taskId) => {
  return await orchestrator.checkTaskCheckpoint(taskId);
});

ipcMain.handle('convoy:generateCheckpointSummary', async (event, taskId, checkpointType) => {
  return await orchestrator.generateCheckpointSummary(taskId, checkpointType);
});

ipcMain.handle('convoy:processCheckpointFeedback', async (event, taskId, feedbackContent, approved) => {
  return await orchestrator.processCheckpointFeedback(taskId, feedbackContent, approved);
});

// Cline Integration (placeholder for Phase 3)
ipcMain.handle('convoy:initializeCline', async () => {
  return await orchestrator.initializeCline();
});
