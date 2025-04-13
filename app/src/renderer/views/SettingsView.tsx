import React, { useState, useEffect } from 'react';
import { ConvoyConfig } from '../types';

const SettingsView: React.FC = () => {
  const [config, setConfig] = useState<ConvoyConfig>({
    supabaseUrl: '',
    supabaseKey: '',
    llmApiKey: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load config from main process
    const loadConfig = async () => {
      try {
        setLoading(true);
        const currentConfig = await window.convoy.getConfig();
        setConfig({
          supabaseUrl: currentConfig.supabaseUrl || '',
          supabaseKey: currentConfig.supabaseKey || '',
          llmApiKey: currentConfig.llmApiKey || ''
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load config:', err);
        setError('Failed to load configuration. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
    // Clear messages when user changes input
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await window.convoy.saveConfig(config);
      if (result) {
        setSuccess('Configuration saved successfully');
        setError(null);
      } else {
        setError('Failed to save configuration');
        setSuccess(null);
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setError('An error occurred while saving configuration');
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configure API keys for interacting with external services. These keys are securely stored.
        </p>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LLM Provider API Key */}
            <div>
              <label htmlFor="llmApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LLM Provider API Key:
              </label>
              <input
                id="llmApiKey"
                name="llmApiKey"
                type="password"
                value={config.llmApiKey || ''}
                onChange={handleChange}
                placeholder="Enter your LLM API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                value={config.supabaseUrl || ''}
                onChange={handleChange}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your Supabase project URL.
              </p>
            </div>
            
            {/* Supabase Anon Key */}
            <div>
              <label htmlFor="supabaseKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supabase Anon Key:
              </label>
              <input
                id="supabaseKey" 
                name="supabaseKey"
                type="password"
                value={config.supabaseKey || ''}
                onChange={handleChange}
                placeholder="Enter your Supabase Anon Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Used for accessing your Supabase project.
              </p>
            </div>
            
            <div className="pt-2">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  {error}
                </p>
              )}
              
              {success && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                  {success}
                </p>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
