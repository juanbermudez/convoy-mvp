/**
 * Mock data for testing the UI
 * This provides temporary data to test components without needing a real backend
 */

import { invoke, on, send } from './lib/ipc';

// Mock projects
const mockProjects = [
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
  },
  {
    id: '3',
    name: 'Documentation',
    description: 'Create comprehensive documentation for the platform',
    createdAt: '2025-04-05T11:45:00Z',
    updatedAt: '2025-04-11T16:40:00Z',
  },
];

// Mock tasks
const mockTasks = [
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
  },
  {
    id: '3',
    projectId: '2',
    title: 'Create component library',
    description: 'Set up shadcn/ui components and styling',
    status: 'in-progress',
    createdAt: '2025-04-02T11:30:00Z',
    updatedAt: '2025-04-12T13:20:00Z',
  },
];

// Mock activities
const mockActivities = [
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
  },
  {
    id: '3',
    type: 'task-created',
    taskId: '2',
    projectId: '1',
    timestamp: '2025-03-20T09:15:00Z',
    message: 'Task "Implement core components" created',
  },
];

// Mock IPC handlers
const mockHandlers: Record<string, ((...args: any[]) => any)> = {
  // Project handlers
  'projects:getAll': () => [...mockProjects],
  'projects:getById': (id: string) => mockProjects.find(p => p.id === id),
  'projects:create': (project: any) => {
    const newProject = {
      id: String(mockProjects.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...project,
    };
    mockProjects.push(newProject);
    return newProject;
  },
  'projects:update': (project: any) => {
    const index = mockProjects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      mockProjects[index] = {
        ...mockProjects[index],
        ...project,
        updatedAt: new Date().toISOString(),
      };
      return mockProjects[index];
    }
    return null;
  },
  'projects:delete': (id: string) => {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index >= 0) {
      mockProjects.splice(index, 1);
    }
    return null;
  },

  // Task handlers
  'tasks:getAll': () => [...mockTasks],
  'tasks:getByProject': (projectId: string) => 
    mockTasks.filter(t => t.projectId === projectId),
  'tasks:getById': (id: string) => mockTasks.find(t => t.id === id),
  'tasks:create': (task: any) => {
    const newTask = {
      id: String(mockTasks.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'not-started',
      ...task,
    };
    mockTasks.push(newTask);
    return newTask;
  },
  'tasks:update': (task: any) => {
    const index = mockTasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      mockTasks[index] = {
        ...mockTasks[index],
        ...task,
        updatedAt: new Date().toISOString(),
      };
      return mockTasks[index];
    }
    return null;
  },
  'tasks:delete': (id: string) => {
    const index = mockTasks.findIndex(t => t.id === id);
    if (index >= 0) {
      mockTasks.splice(index, 1);
    }
    return null;
  },

  // Activity handlers
  'activities:getAll': () => [...mockActivities],
  'activities:getByProject': (projectId: string) => 
    mockActivities.filter(a => a.projectId === projectId),
  'activities:getByTask': (taskId: string) => 
    mockActivities.filter(a => a.taskId === taskId),
};

// Mock the IPC functions
(window.electronAPI as any).invoke = async (channel: string, ...args: any[]) => {
  console.log(`Mock IPC invoke: ${channel}`, args);
  const handler = mockHandlers[channel];
  if (handler) {
    return handler(...args);
  }
  console.warn(`No mock handler for channel: ${channel}`);
  return null;
};

// Create empty implementations for other IPC methods
(window.electronAPI as any).on = (channel: string, listener: any) => {
  console.log(`Mock IPC on: ${channel}`);
};

(window.electronAPI as any).removeListener = (channel: string, listener: any) => {
  console.log(`Mock IPC removeListener: ${channel}`);
};

(window.electronAPI as any).send = (channel: string, ...args: any[]) => {
  console.log(`Mock IPC send: ${channel}`, args);
};

console.log('Mock data initialized for testing');
