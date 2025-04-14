import React from 'react';
import Sidebar from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
