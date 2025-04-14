import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

import { useMemoryBank } from '@/hooks/useMemoryBank';

/**
 * Component for testing the Memory Bank pattern
 * This allows retrieving and displaying the complete context for a task
 */
export default function MemoryBankTest() {
  const [taskId, setTaskId] = useState<string>('');
  const [inputTaskId, setInputTaskId] = useState<string>('');
  const { context, isLoading, error, refreshContext } = useMemoryBank(taskId);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTaskId(inputTaskId);
  };

  // Format JSON for display
  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Memory Bank Test</CardTitle>
        <CardDescription>
          Test the Memory Bank pattern by retrieving context for a task
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="taskId">Task ID</Label>
            <Input
              id="taskId"
              value={inputTaskId}
              onChange={(e) => setInputTaskId(e.target.value)}
              placeholder="Enter task UUID"
            />
          </div>
          <Button type="submit">Retrieve Context</Button>
          {taskId && (
            <Button type="button" variant="outline" onClick={refreshContext}>
              Refresh
            </Button>
          )}
        </form>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading context...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : context ? (
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="task">Task</TabsTrigger>
              <TabsTrigger value="milestone">Milestone</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="bestPractices">Best Practices</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">Task</h3>
                  <p><strong>Title:</strong> {context.task.title}</p>
                  <p><strong>Stage:</strong> {context.task.current_stage}</p>
                  <p><strong>Status:</strong> {context.task.status}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">Milestone</h3>
                  <p><strong>Name:</strong> {context.milestone.name}</p>
                  <p><strong>Status:</strong> {context.milestone.status}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">Project</h3>
                  <p><strong>Name:</strong> {context.project.name}</p>
                  <p><strong>Status:</strong> {context.project.status}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">Workspace</h3>
                  <p><strong>Name:</strong> {context.workspace.name}</p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Activity Summary</h3>
                <p>{context.activities.length} recent activities</p>
                {context.activities.length > 0 && (
                  <p className="text-sm">
                    Latest: {context.activities[0].activity_type} at{' '}
                    {new Date(context.activities[0].created_at).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">Patterns</h3>
                  <p>{context.patterns.length} relevant patterns</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-2">Best Practices</h3>
                  <p>{context.best_practices.length} relevant best practices</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="task">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.task)}
              </pre>
            </TabsContent>
            
            <TabsContent value="milestone">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.milestone)}
              </pre>
            </TabsContent>
            
            <TabsContent value="project">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.project)}
              </pre>
            </TabsContent>
            
            <TabsContent value="workspace">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.workspace)}
              </pre>
            </TabsContent>
            
            <TabsContent value="activities">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.activities)}
              </pre>
            </TabsContent>
            
            <TabsContent value="patterns">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.patterns)}
              </pre>
            </TabsContent>
            
            <TabsContent value="bestPractices">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context.best_practices)}
              </pre>
            </TabsContent>
            
            <TabsContent value="json">
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {formatJson(context)}
              </pre>
            </TabsContent>
          </Tabs>
        ) : taskId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Context Found</AlertTitle>
            <AlertDescription>
              Could not find context for task ID: {taskId}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center p-12 text-gray-500">
            Enter a task ID to retrieve its context from the Memory Bank
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-4">
        <div className="text-sm text-gray-500">
          The Memory Bank pattern provides complete hierarchical context for tasks,
          enabling AI agents to understand the full context of what they're working on.
        </div>
      </CardFooter>
    </Card>
  );
}
