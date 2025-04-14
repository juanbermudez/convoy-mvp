import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import DashboardPage from './pages/dashboard';
import ProjectsPage from './pages/projects';
import TaskListPage from './pages/task-list';
import TaskDetailPage from './pages/task-detail';
import SettingsPage from './pages/settings';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId/tasks" element={<TaskListPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
