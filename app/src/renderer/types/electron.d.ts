/**
 * Type definitions for the Electron API
 */

interface ElectronAPI {
  // Window operations
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // IPC communication
  invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
  on: <T>(channel: string, listener: (data: T) => void) => void;
  removeListener: <T>(channel: string, listener: (data: T) => void) => void;
  send: (channel: string, ...args: any[]) => void;
}

declare interface Window {
  electronAPI: ElectronAPI;
}
