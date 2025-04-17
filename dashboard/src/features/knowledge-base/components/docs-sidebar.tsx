import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, FileText, FolderClosed, FolderOpen } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// Type definitions
type DocItem = {
  id: string;
  title: string;
  type: 'file' | 'folder';
  path?: string;
  children?: DocItem[];
};

interface DocsSidebarProps {
  className?: string;
  items: DocItem[];
  activePath?: string;
}

export function DocsSidebar({ className, items, activePath }: DocsSidebarProps) {
  return (
    <div className={cn("h-full", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Documentation</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-2">
          {items.map((item) => (
            <NavItem 
              key={item.id} 
              item={item} 
              activePath={activePath} 
              level={0} 
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Component for rendering individual navigation items
function NavItem({ 
  item, 
  activePath, 
  level = 0 
}: { 
  item: DocItem; 
  activePath?: string; 
  level: number;
}) {
  // Auto-expand if this item or any child is active
  const isActive = activePath === item.path;
  const hasChildren = !!item.children?.length;
  
  // Determine if this item should be expanded based on active path
  const shouldExpandByDefault = () => {
    if (isActive) return true;
    if (!hasChildren || !activePath) return false;
    
    // Check if any child matches the active path
    const hasActiveChild = item.children?.some(child => {
      if (child.path === activePath) return true;
      if (child.children?.length) {
        return child.children.some(grandchild => grandchild.path === activePath);
      }
      return false;
    });
    
    return hasActiveChild;
  };
  
  const [expanded, setExpanded] = useState(shouldExpandByDefault());
  
  // Update expanded state when active path changes
  useEffect(() => {
    if (shouldExpandByDefault()) {
      setExpanded(true);
    }
  }, [activePath]);

  // Toggle folder expansion
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center py-1 px-2 rounded-md text-sm",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 transition-colors",
          level > 0 && "ml-3"
        )}
      >
        {item.type === 'folder' ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 mr-1 p-0" 
            onClick={toggleExpand}
          >
            {expanded ? 
              <ChevronDown className="h-3.5 w-3.5" /> : 
              <ChevronRight className="h-3.5 w-3.5" />
            }
          </Button>
        ) : (
          <span className="w-5 mr-1 flex justify-center">
            <FileText className="h-3.5 w-3.5" />
          </span>
        )}
        
        {item.type === 'file' && item.path ? (
          <Link
            to={item.path}
            className={cn(
              "flex-1 truncate",
              isActive ? "font-medium" : ""
            )}
            activeProps={{ className: "font-medium" }}
          >
            {item.title}
          </Link>
        ) : (
          <button
            onClick={toggleExpand}
            className={cn(
              "flex-1 text-left truncate flex items-center",
              expanded ? "font-medium" : ""
            )}
          >
            {expanded ? <FolderOpen className="h-3.5 w-3.5 mr-1" /> : <FolderClosed className="h-3.5 w-3.5 mr-1" />}
            {item.title}
          </button>
        )}
      </div>
      
      {/* Render children if expanded */}
      {hasChildren && expanded && (
        <div className="ml-2 mt-1">
          {item.children!.map((child) => (
            <NavItem 
              key={child.id} 
              item={child} 
              activePath={activePath} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sample navigation data structure
export const docNavItems: DocItem[] = [
  {
    id: "overview",
    title: "Overview",
    type: "file",
    path: "/knowledge-base",
  },
  {
    id: "architecture",
    title: "Architecture",
    type: "folder",
    children: [
      {
        id: "architecture-overview",
        title: "Overview",
        type: "file",
        path: "/knowledge-base/architecture",
      },
      {
        id: "knowledge-graph",
        title: "Knowledge Graph",
        type: "file",
        path: "/knowledge-base/architecture/knowledge-graph",
      },
      {
        id: "memory-bank-pattern",
        title: "Memory Bank Pattern",
        type: "file",
        path: "/knowledge-base/architecture/memory-bank-pattern",
      },
    ],
  },
  {
    id: "technical-specs",
    title: "Technical Specs",
    type: "folder",
    children: [
      {
        id: "tech-stack",
        title: "Tech Stack",
        type: "file",
        path: "/knowledge-base/technical-specs/tech-stack",
      },
      {
        id: "api-reference",
        title: "API Reference",
        type: "file",
        path: "/knowledge-base/technical-specs/api-reference",
      },
    ],
  },
  {
    id: "patterns",
    title: "Patterns",
    type: "file",
    path: "/knowledge-base/patterns",
  },
  {
    id: "best-practices",
    title: "Best Practices",
    type: "file",
    path: "/knowledge-base/best-practices",
  },
  {
    id: "source-code",
    title: "Source Code",
    type: "file",
    path: "/knowledge-base/source-code",
  },
];
