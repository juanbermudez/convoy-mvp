import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/breadcrumb';
import { SyncStatus } from '@/components/sync/SyncStatus';
import { Main } from '@/components/layout/main';
import { DynamicSidebar } from './components/DynamicSidebar';
import { MarkdownViewer } from './components/markdown-viewer';
import { getDocumentService, isUsingSupabase } from '@/services/DocumentServiceFactory';
import { filePathToKbPath, kbPathToFilePath, routeParamToDocPath } from '@/utils/kb-path-converter';

export default function KnowledgeBase() {
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [document, setDocument] = useState<{ title: string, content: string, path: string }>({
    title: 'Loading...',
    content: '# Loading...',
    path: ''
  });

  // Extract document path from URL in a way that's independent of router configuration
  const [path, setPath] = useState('');
  
  // Get the route params and search params for path extraction
  // Use try/catch to handle cases where useParams might not be properly initialized
  let routePath = '';
  try {
    const params = useParams({ strict: false });
    if (params && 'path' in params) {
      routePath = params.path || '';
    }
  } catch (e) {
    console.warn('Error getting route params:', e);
    // Continue with empty routePath
  }
  const search = new URLSearchParams(window.location.search);
  const queryDocPath = search.get('docPath');
  
  // Update path when URL changes using location
  useEffect(() => {
    const updatePathFromUrl = () => {
      try {
        // First try to get the path from route params
        let extractedPath = '';
        
        // First check if we have a docPath query parameter
        if (queryDocPath) {
          extractedPath = queryDocPath;
        } else if (routePath) {
          // If no query param but we have a route param, use it
          extractedPath = String(routePath);
        } else {
          // Otherwise extract from window pathname
          const pathname = window.location.pathname;
          
          // Log the full pathname for debugging
          console.log('KnowledgeBase - Window pathname:', pathname);
          
          // Extract path after /knowledge-base/
          if (pathname.startsWith('/knowledge-base/')) {
            extractedPath = pathname.substring('/knowledge-base/'.length);
          }
        }
        
        // Clean up the path
        extractedPath = routeParamToDocPath(extractedPath);
        console.log('KnowledgeBase - Extracted path:', extractedPath);
        
        setPath(extractedPath);
      } catch (error) {
        console.error('Error extracting path:', error);
        // In case of error, default to empty path (root document)
        setPath('');
      }
    };
    
    // Initial path extraction
    updatePathFromUrl();
    
    // Listen for URL changes (pushState, replaceState, etc.)
    const handleUrlChange = () => {
      updatePathFromUrl();
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    // Some browsers support these events
    if (typeof window.addEventListener === 'function') {
      try {
        window.addEventListener('pushstate', handleUrlChange);
        window.addEventListener('replacestate', handleUrlChange);
      } catch (e) {
        console.warn('Browser does not support pushstate/replacestate events');
      }
    }
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      if (typeof window.removeEventListener === 'function') {
        try {
          window.removeEventListener('pushstate', handleUrlChange);
          window.removeEventListener('replacestate', handleUrlChange);
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [routePath, queryDocPath]); // Track both route params and query params
  
  // Check which service implementation we're using
  const [serviceImplementation, setServiceImplementation] = useState<string>('checking...');
  
  // Check service on mount
  useEffect(() => {
    async function checkService() {
      await getDocumentService();
      setServiceImplementation(isUsingSupabase() ? 'Supabase' : 'Local Fallback');
    }
    
    checkService();
  }, []);
  
  // Fetch the document when the path changes
  useEffect(() => {
    console.log('KnowledgeBase - Loading document for path:', path);
    
    async function loadDocument() {
      try {
        setLoading(true);
        setError(null);
        
        // Path-specific handling
        if (path === 'workspace/workflows/integrated-workflow') {
          console.log('KnowledgeBase - Special handling for integrated workflow path');
        } else if (path === 'projects/current/convoy-mvp') {
          console.log('KnowledgeBase - Special handling for convoy-mvp project page');
        }
        
        // Get the appropriate document service
        const docService = await getDocumentService();
        
        // Load the document
        const doc = await docService.loadDocument(path || '');
        
        console.log('KnowledgeBase - Document loaded:', doc);
        setDocument(doc);
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err : new Error('Failed to load document'));
      } finally {
        setLoading(false);
      }
    }
    
    loadDocument();
  }, [path]);
  
  // Generate breadcrumb items based on the path
  const breadcrumbItems = React.useMemo(() => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Knowledge Base', href: '/knowledge-base' }
    ];
    
    if (path) {
      const pathParts = path.split('/');
      let currentPath = '';
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!part) continue;
        
        currentPath += `/${part}`;
        
        const isLastPart = i === pathParts.length - 1;
        const label = isLastPart 
          ? document.title 
          : part.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        items.push({
          label,
          href: `/knowledge-base${currentPath}`
        });
      }
    }
    
    return items;
  }, [path, document.title]);
  
  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    navigate({ to: href });
  };
  
  // Render loading state
  if (loading) {
    return (
      <>
        <Header fixed>
          <div className="flex flex-1 w-full items-center justify-between">
            <Breadcrumb items={breadcrumbItems.map(item => ({
              ...item,
              onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleBreadcrumbClick(e, item.href)
            }))} />
            <div className="flex items-center gap-4">
              <SyncStatus />
            </div>
          </div>
        </Header>
        
        <Main className="flex flex-1 h-full overflow-hidden border rounded-lg mt-16">
          <DynamicSidebar 
            activePath={`/knowledge-base${path ? `/${path}` : ''}`}
            className="h-full shrink-0" 
          />
          
          <div ref={contentRef} className="flex-1 h-full overflow-auto p-6">
            <div className="animate-pulse">
              <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
              
              <div className="h-5 w-1/4 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
            </div>
          </div>
        </Main>
      </>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <>
        <Header fixed>
          <div className="flex flex-1 w-full items-center justify-between">
            <Breadcrumb items={breadcrumbItems.map(item => ({
              ...item,
              onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleBreadcrumbClick(e, item.href)
            }))} />
            <div className="flex items-center gap-4">
              <SyncStatus />
            </div>
          </div>
        </Header>
        
        <Main className="flex flex-1 h-full overflow-hidden border rounded-lg mt-16">
          <DynamicSidebar 
            activePath={`/knowledge-base${path ? `/${path}` : ''}`}
            className="h-full shrink-0" 
          />
          
          <div ref={contentRef} className="flex-1 h-full overflow-auto p-6">
            <div className="border border-red-300 rounded-md p-4 bg-red-50 text-red-800">
              <h2 className="text-lg font-semibold mb-2">Error Loading Document</h2>
              <p className="mb-4">{error.message}</p>
              <p>
                Suggestions:
                <ul className="list-disc ml-5 mt-2">
                  <li>Check that the document path is correct</li>
                  <li>Try a different document from the sidebar</li>
                  <li>Return to the <a 
                      href="/knowledge-base" 
                      className="text-blue-600 hover:underline"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => { e.preventDefault(); navigate({ to: '/knowledge-base' }); }}
                    >Knowledge Base home</a>
                  </li>
                </ul>
              </p>
            </div>
          </div>
        </Main>
      </>
    );
  }
  
  // Render the document content
  return (
    <>
      <Header fixed>
        <div className="flex flex-1 w-full items-center justify-between">
          <Breadcrumb 
            items={breadcrumbItems.map(item => ({
              ...item,
              onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleBreadcrumbClick(e, item.href)
            }))} 
          />
          <div className="flex items-center gap-4">
            <SyncStatus />
          </div>
        </div>
      </Header>
      
      <Main className="flex flex-1 h-full overflow-hidden border rounded-lg mt-16">
        <DynamicSidebar 
          activePath={`/knowledge-base${path ? `/${path}` : ''}`}
          className="h-full shrink-0" 
        />
        
          <div ref={contentRef} className="flex-1 h-full overflow-auto p-6">
            <div className="mb-2 text-xs text-right text-gray-500">
              Using: {serviceImplementation}
            </div>
            <MarkdownViewer content={document.content} />
          </div>
      </Main>
    </>
  );
}
