import React from 'react';

const SettingsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configure API keys for interacting with external services. These keys are securely stored.
        </p>
        
        <div className="space-y-6">
          {/* LLM Provider API Key */}
          <div>
            <label htmlFor="llmKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LLM Provider API Key:
            </label>
            <input
              id="llmKey"
              name="llmKey"
              type="password"
              placeholder="Enter your LLM API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used for AI task planning and checkpoint summaries.
            </p>
          </div>
          
          {/* Supabase URL */}
          <div>
            <label htmlFor="supabaseUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase URL:
            </label>
            <input
              id="supabaseUrl"
              name="supabaseUrl"
              type="text"
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your Supabase project URL.
            </p>
          </div>
          
          {/* Supabase Anon Key */}
          <div>
            <label htmlFor="supabaseAnonKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase Anon Key:
            </label>
            <input
              id="supabaseAnonKey" 
              name="supabaseAnonKey"
              type="password"
              placeholder="Enter your Supabase Anon Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used for accessing your Supabase project.
            </p>
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Settings
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Note: Functionality will be implemented in a later phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
