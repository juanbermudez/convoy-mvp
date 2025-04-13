import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Sidebar from './components/Sidebar';
import ProjectListView from './views/ProjectListView';
import TaskListView from './views/TaskListView';
import TaskDetailView from './views/TaskDetailView';
import SettingsView from './views/SettingsView';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <Router>
        <div className="mx-auto max-w-screen-2xl">
          <Sidebar />
          <main className="lg:pl-72">
            <div className="p-6">
              <Routes>
                <Route path="/projects" element={<ProjectListView />} />
                <Route path="/projects/:projectId/tasks" element={<TaskListView />} />
                <Route path="/tasks/:taskId" element={<TaskDetailView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="/" element={<Navigate to="/projects" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
