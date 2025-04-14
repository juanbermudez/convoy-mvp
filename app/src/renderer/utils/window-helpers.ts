/**
 * Helper functions for window management in Electron
 */

/**
 * Minimize the current window
 */
export function minimizeWindow() {
  window.electronAPI.minimizeWindow();
}

/**
 * Maximize the current window
 */
export function maximizeWindow() {
  window.electronAPI.maximizeWindow();
}

/**
 * Close the current window
 */
export function closeWindow() {
  window.electronAPI.closeWindow();
}
