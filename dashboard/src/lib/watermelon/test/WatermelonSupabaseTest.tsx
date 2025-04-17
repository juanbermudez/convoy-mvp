/**
 * Combined Test Component for WatermelonDB and Supabase
 * 
 * This component demonstrates the integration between WatermelonDB models
 * and Supabase synchronization.
 */

import React, { useState } from 'react';
import { WatermelonTest } from './WatermelonTest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { supabase, checkSupabaseConnection } from '@/lib/supabase/client';
import { getWorkspaces } from '@/lib/supabase/contextService';
import { database, sync } from '@/lib/watermelon/database';

/**
 * Combined test component for WatermelonDB and Supabase
 */
export default function WatermelonSupabaseTest() {
  const [activeTab, setActiveTab] = useState('watermelon');
  const [connectionState, setConnectionState] = useState<'checking' | 'success' | 'failure'>('checking');
  const [workspaces, setWorkspaces] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failure'>('idle');

  /**
   * Test Supabase connection
   */
  const testConnection = async () => {
    setConnectionState('checking');
    setError(null);
    
    try {
      const isConnected = await checkSupabaseConnection();
      setConnectionState(isConnected ? 'success' : 'failure');
      
      if (!isConnected) {
        setError('Failed to connect to Supabase database. Check your configuration.');
      }
    } catch (err) {
      setConnectionState('failure');
      setError('Error checking connection: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Fetch workspaces from Supabase
   */
  const fetchWorkspaces = async () => {
    setError(null);
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
      
      if (!data) {
        setError('No workspaces found or error fetching workspaces.');
      }
    } catch (err) {
      setError('Error fetching workspaces: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Run test query against Supabase
   */
  const runTestQuery = async () => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      console.log('Test query result:', data);
      alert(`Test query successful. Found ${data?.length || 0} workspaces.`);
    } catch (err) {
      setError('Error running test query: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Synchronize data between WatermelonDB and Supabase
   */
  const syncDatabases = async () => {
    setError(null);
    setSyncStatus('syncing');
    try {
      const success = await sync();
      setSyncStatus(success ? 'success' : 'failure');
      
      if (!success) {
        setError('Synchronization failed. Check console for details.');
      }
    } catch (err) {
      setSyncStatus('failure');
      setError('Error during synchronization: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Push data from WatermelonDB to Supabase
   */
  const pushToSupabase = async () => {
    setError(null);
    try {
      // First, get data from WatermelonDB
      const workspaces = await database.get('workspaces').query().fetch();
      
      if (workspaces.length === 0) {
        setError('No workspaces found in WatermelonDB. Create some data first.');
        return;
      }
      
      // Now, push to Supabase
      await syncDatabases();
      alert(`Push to Supabase completed. ${workspaces.length} workspaces synchronized.`);
    } catch (err) {
      setError('Error pushing to Supabase: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Pull data from Supabase to WatermelonDB
   */
  const pullFromSupabase = async () => {
    setError(null);
    try {
      // First, check if there's data in Supabase
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        setError('No workspaces found in Supabase. Create some data first.');
        return;
      }
      
      // Now, pull from Supabase
      await syncDatabases();
      alert(`Pull from Supabase completed. ${data.length} workspaces synchronized.`);
    } catch (err) {
      setError('Error pulling from Supabase: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">WatermelonDB and Supabase Integration Test</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="watermelon">WatermelonDB Test</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watermelon" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>WatermelonDB Test</CardTitle>
              <CardDescription>Test local database operations and view stored data</CardDescription>
            </CardHeader>
            
            <CardContent>
              <WatermelonTest />
            </CardContent>
            
            <Separator />
            
            <CardFooter className="flex justify-between p-4">
              <Button onClick={pushToSupabase} variant="outline">
                Push to Supabase
              </Button>
              <Button onClick={pullFromSupabase} variant="outline">
                Pull from Supabase
              </Button>
              <Button 
                onClick={syncDatabases} 
                variant="default"
                disabled={syncStatus === 'syncing'}
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Data'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="supabase" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Connection Test</CardTitle>
              <CardDescription>
                Test the connection to Supabase and perform basic operations
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium">Connection Status</h3>
                  <p className="text-sm text-gray-500">
                    {connectionState === 'checking' ? 'Checking connection...' : 
                     connectionState === 'success' ? 'Connected to Supabase' : 
                     'Connection failed'}
                  </p>
                </div>
                <div>
                  {connectionState === 'checking' ? (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  ) : connectionState === 'success' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </div>
              
              {/* Sync Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium">Sync Status</h3>
                  <p className="text-sm text-gray-500">
                    {syncStatus === 'idle' ? 'Ready to sync' : 
                     syncStatus === 'syncing' ? 'Synchronizing...' : 
                     syncStatus === 'success' ? 'Synchronization successful' : 
                     'Synchronization failed'}
                  </p>
                </div>
                <div>
                  {syncStatus === 'syncing' ? (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  ) : syncStatus === 'success' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : syncStatus === 'failure' ? (
                    <XCircle className="h-8 w-8 text-red-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-gray-300" />
                  )}
                </div>
              </div>
              
              {/* Workspaces */}
              {workspaces && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Workspaces from Supabase</h3>
                  <div className="border rounded-md divide-y">
                    {workspaces.length > 0 ? (
                      workspaces.map((workspace) => (
                        <div key={workspace.id} className="p-3">
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-sm text-gray-500">{workspace.description || 'No description'}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">No workspaces found</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <Separator />
            
            <CardFooter className="flex justify-between p-4">
              <Button onClick={testConnection} variant="outline">
                Test Connection
              </Button>
              <Button onClick={fetchWorkspaces} variant="outline">
                Fetch Workspaces
              </Button>
              <Button onClick={runTestQuery} variant="default">
                Run Test Query
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
