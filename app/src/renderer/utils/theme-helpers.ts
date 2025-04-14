/**
 * Helper functions for theme management
 */

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const html = document.documentElement;
  
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * Initialize theme based on system preference or stored preference
 */
export function initializeTheme() {
  const html = document.documentElement;
  const storedTheme = localStorage.getItem('theme');
  
  if (
    storedTheme === 'dark' || 
    (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}
