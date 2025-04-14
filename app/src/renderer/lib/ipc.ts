/**
 * IPC communication layer for interacting with Electron's main process
 * Provides type-safe wrappers around window.electronAPI
 */

/**
 * Sends an IPC message to the main process and returns a promise with the response
 * @param channel - The IPC channel to send the message on
 * @param args - Arguments to pass to the main process
 */
export function invoke<T>(channel: string, ...args: any[]): Promise<T> {
  if (!window.electronAPI || !window.electronAPI.invoke) {
    return Promise.reject(new Error('Electron IPC not available'));
  }
  
  return window.electronAPI.invoke(channel, ...args);
}

/**
 * Register an event listener for IPC events from the main process
 * @param channel - The IPC channel to listen on
 * @param listener - The callback function to execute when an event is received
 * @returns A function to remove the event listener
 */
export function on<T>(channel: string, listener: (data: T) => void): () => void {
  if (!window.electronAPI || !window.electronAPI.on) {
    console.error('Electron IPC not available');
    return () => {};
  }
  
  window.electronAPI.on(channel, listener);
  return () => window.electronAPI.removeListener(channel, listener);
}

/**
 * Send an IPC message to the main process without expecting a response
 * @param channel - The IPC channel to send the message on
 * @param args - Arguments to pass to the main process
 */
export function send(channel: string, ...args: any[]): void {
  if (!window.electronAPI || !window.electronAPI.send) {
    console.error('Electron IPC not available');
    return;
  }
  
  window.electronAPI.send(channel, ...args);
}
