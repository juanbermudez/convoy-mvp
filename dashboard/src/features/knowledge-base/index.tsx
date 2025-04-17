import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/breadcrumb';
import { SyncStatus } from '@/components/sync/SyncStatus';
import { Main } from '@/components/layout/main';
import { KnowledgeBaseSidebar } from './components/knowledge-base-sidebar';
import { MarkdownViewer } from './components/markdown-viewer';
import { useParams, useMatches } from '@tanstack/react-router';

export default function KnowledgeBase() {
  // Get route information
  const matches = useMatches();
  const routeMatch = matches.find(match => match.routeId.includes('knowledge-base'));
  
  // Check if we're on the $path route or the main KB route
  const isPathRoute = routeMatch?.routeId.includes('$path');
  
  // Get path param only if we're on the $path route
  const params = isPathRoute ? useParams({ from: '/_authenticated/knowledge-base/$path/' }) : { path: undefined };
  const pathParam = params.path;
  
  const [documentTitle, setDocumentTitle] = useState('Knowledge Base');
  const [documentContent, setDocumentContent] = useState<string>('');
  
  // Update content based on path
  useEffect(() => {
    if (!isPathRoute || !pathParam) {
      // Default content for overview or main KB page
      setDocumentTitle('Knowledge Base');
      setDocumentContent(`# Knowledge Base Overview
      
Welcome to the Convoy Knowledge Base. This is your central repository for all documentation related to the project.

## Contents

- **Architecture**: System design and architectural patterns
- **Technical Specs**: Technical specifications and requirements
- **Patterns**: Reusable design and implementation patterns
- **Best Practices**: Guidelines and recommended approaches
- **Source Code**: Code documentation and guidelines

Select a document from the sidebar to view its contents.
`);
      return;
    }
    
    // Mock loading different content based on the path
    const pathSegments = pathParam.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Update document title based on path
    const formattedTitle = lastSegment
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    setDocumentTitle(formattedTitle);
    
    // Set sample content based on path
    setDocumentContent(`# ${formattedTitle}
    
This is a placeholder for the ${pathParam} document.

In the real implementation, this content would be loaded from the appropriate markdown file or database.

## Features to implement:

- Load real markdown content from files or API
- Add proper markdown rendering with code highlighting
- Implement document navigation
- Add search functionality
`);
  }, [isPathRoute, pathParam]);
  
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Home' },
    { label: 'Knowledge Base' }
  ];
  
  // Add the document title to breadcrumbs if we're on a specific document
  if (isPathRoute && pathParam && documentTitle !== 'Knowledge Base') {
    breadcrumbItems.push({ label: documentTitle });
  }
  
  return (
    <>
      <Header fixed>
        <div className="flex flex-1 w-full items-center justify-between">
          <Breadcrumb items={breadcrumbItems} />
          <SyncStatus />
        </div>
      </Header>
      
      {/* Added mt-16 to provide space for the fixed header */}
      <Main className="flex flex-1 h-full overflow-hidden border rounded-lg mt-16">
        {/* Knowledge Base sidebar */}
        <KnowledgeBaseSidebar 
          activePath={isPathRoute && pathParam ? `/knowledge-base/${pathParam}` : '/knowledge-base'}
          className="h-full shrink-0" 
        />
        
        {/* Content area */}
        <div className="flex-1 h-full overflow-auto">
          <MarkdownViewer content={documentContent} />
        </div>
      </Main>
    </>
  );
}
