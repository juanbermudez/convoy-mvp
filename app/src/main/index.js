const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, we'll load from the Vite dev server
  if (process.env.NODE_ENV === 'development') {
    // Load from the Vite dev server
    const devServerURL = 'http://localhost:5173';
    mainWindow.loadURL(devServerURL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
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

// Window control handlers
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

// Mock handlers for testing
ipcMain.handle('projects:getAll', async () => {
  return [
    {
      id: '1',
      name: 'Convoy MVP',
      description: 'AI orchestration platform MVP development',
      createdAt: '2025-03-15T12:00:00Z',
      updatedAt: '2025-04-10T15:30:00Z',
    },
    {
      id: '2',
      name: 'UI Migration',
      description: 'Migrate from Tremor UI to shadcn/ui',
      createdAt: '2025-04-01T09:15:00Z',
      updatedAt: '2025-04-12T14:20:00Z',
    }
  ];
});

ipcMain.handle('tasks:getAll', async () => {
  return [
    {
      id: '1',
      projectId: '1',
      title: 'Setup project structure',
      description: 'Create initial project structure and configuration',
      status: 'completed',
      createdAt: '2025-03-16T10:00:00Z',
      updatedAt: '2025-03-18T14:30:00Z',
    },
    {
      id: '2',
      projectId: '1',
      title: 'Implement core components',
      description: 'Create the core UI components for the MVP',
      status: 'in-progress',
      createdAt: '2025-03-20T09:15:00Z',
      updatedAt: '2025-04-10T16:45:00Z',
    }
  ];
});

ipcMain.handle('activities:getAll', async () => {
  return [
    {
      id: '1',
      type: 'task-created',
      taskId: '1',
      projectId: '1',
      timestamp: '2025-03-16T10:00:00Z',
      message: 'Task "Setup project structure" created',
    },
    {
      id: '2',
      type: 'task-completed',
      taskId: '1',
      projectId: '1',
      timestamp: '2025-03-18T14:30:00Z',
      message: 'Task "Setup project structure" completed',
    }
  ];
});
