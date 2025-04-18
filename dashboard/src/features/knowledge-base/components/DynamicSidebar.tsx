import * as React from "react";
import { ChevronDown, ChevronRight, FileText, FolderClosed, FolderOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { getDocumentService } from "@/services/DocumentServiceFactory";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define document item interface
export interface DocItem {
  id: string;
  title: string;
  type: 'file' | 'folder';
  path?: string;
  children?: DocItem[];
}

interface DynamicSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activePath?: string;
}

export function DynamicSidebar({ 
  activePath,
  className, 
  ...props 
}: DynamicSidebarProps) {
  const [navItems, setNavItems] = React.useState<DocItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  // Load documents from Supabase
  React.useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        
        // Get the appropriate document service
        const docService = await getDocumentService();
        
        // Get all documents
        const documents = await docService.getAllDocuments();
        
        // Transform flat list into hierarchical structure
        const rootItems: DocItem[] = [];
        const pathMap: Record<string, DocItem> = {};
        
        // Create folder structure first
        documents.forEach(doc => {
          const pathParts = doc.path.split('/').filter(Boolean);
          let currentPath = '';
          
          // Create folder structure
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const isLastPart = i === pathParts.length - 1;
            const parentPath = currentPath;
            
            // Update current path
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            
            // Skip if this path was already processed
            if (pathMap[currentPath]) {
              continue;
            }
            
            // Create the item
            const item: DocItem = {
              id: currentPath,
              title: part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              type: isLastPart && currentPath === doc.path ? 'file' : 'folder',
              path: isLastPart && currentPath === doc.path ? `/knowledge-base/${currentPath}` : undefined,
              children: []
            };
            
            // Add to path map
            pathMap[currentPath] = item;
            
            // Add to parent or root
            if (parentPath) {
              if (pathMap[parentPath] && !pathMap[parentPath].children) {
                pathMap[parentPath].children = [];
              }
              
              if (pathMap[parentPath]) {
                pathMap[parentPath].children?.push(item);
              }
            } else {
              rootItems.push(item);
            }
          }
        });
        
        // Handle root document
        if (documents.some(doc => doc.path === '')) {
          rootItems.unshift({
            id: 'home',
            title: 'Home',
            type: 'file',
            path: '/knowledge-base'
          });
        }
        
        // Add top-level sections if they don't exist
        const ensureSection = (id: string, title: string) => {
          if (!pathMap[id]) {
            const section: DocItem = {
              id,
              title,
              type: 'folder',
              children: []
            };
            pathMap[id] = section;
            rootItems.push(section);
          }
        };
        
        // Ensure common top-level sections exist
        ensureSection('workspace', 'Workspace');
        ensureSection('projects', 'Projects');
        ensureSection('patterns', 'Patterns');
        
        // Sort items alphabetically
        const sortItems = (items: DocItem[]): DocItem[] => {
          return items.sort((a, b) => {
            // Sort folders before files
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            
            // Then sort by title
            return a.title.localeCompare(b.title);
          }).map(item => {
            if (item.children && item.children.length > 0) {
              item.children = sortItems(item.children);
            }
            return item;
          });
        };
        
        // Set the sorted items
        setNavItems(sortItems(rootItems));
      } catch (err) {
        // Error already captured in state, no need to log to console
        setError(err instanceof Error ? err : new Error('Failed to load document structure'));
      } finally {
        setLoading(false);
      }
    }
    
    loadDocuments();
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className={cn("w-64 border-r h-full bg-card flex flex-col", className)} {...props}>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center py-1">
                <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className={cn("w-64 border-r h-full bg-card flex flex-col", className)} {...props}>
        <ScrollArea className="flex-1">
          <div className="p-4 text-red-500">
            <p>Error loading navigation</p>
            <p className="text-xs">{error.message}</p>
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  // Show document tree
  return (
    <div className={cn("w-64 border-r h-full bg-card flex flex-col", className)} {...props}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {navItems.map((item) => 
            item.type === 'folder' ? (
              <NavFolder 
                key={item.id} 
                item={item} 
                activePath={activePath}
              />
            ) : (
              <NavItem 
                key={item.id} 
                item={item} 
                activePath={activePath}
              />
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface NavItemProps {
  item: DocItem;
  activePath?: string;
  indent?: number;
}

function NavItem({ item, activePath, indent = 0 }: NavItemProps) {
  const isActive = activePath === item.path;
  
  return (
    <Link
      to={item.path || ''}
      className={cn(
        "flex items-center py-1 px-2 text-sm rounded-md transition-colors",
        "hover:bg-muted text-muted-foreground",
        isActive && "bg-accent text-accent-foreground font-medium",
        indent > 0 && `ml-${indent * 2}`
      )}
    >
      <FileText className="mr-2 h-4 w-4" />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}

function NavFolder({ item, activePath, indent = 0 }: NavItemProps) {
  // Check if this folder or any of its children are active
  const isActive = activePath === item.path || 
    item.children?.some(child => 
      child.path === activePath || 
      (child.children?.some(grandchild => grandchild.path === activePath))
    );
  
  // Folders with active items should be expanded by default
  const [isOpen, setIsOpen] = React.useState(isActive);
  
  return (
    <div>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center py-1 px-2 w-full text-sm rounded-md transition-colors",
              "hover:bg-muted text-muted-foreground text-left",
              isActive && "text-foreground font-medium",
              indent > 0 && `ml-${indent * 2}`
            )}
          >
            {isOpen ? (
              <FolderOpen className="mr-2 h-4 w-4" />
            ) : (
              <FolderClosed className="mr-2 h-4 w-4" />
            )}
            <span className="truncate">{item.title}</span>
            <div className="ml-auto">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-2 pt-1 pb-1 ml-2 space-y-1 border-l">
            {item.children?.map(child => 
              child.type === 'folder' ? (
                <NavFolder 
                  key={child.id} 
                  item={child} 
                  activePath={activePath}
                  indent={indent + 1}
                />
              ) : (
                <NavItem 
                  key={child.id} 
                  item={child} 
                  activePath={activePath} 
                  indent={indent + 1}
                />
              )
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
