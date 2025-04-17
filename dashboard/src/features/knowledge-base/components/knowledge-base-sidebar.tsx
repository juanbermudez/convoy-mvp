import * as React from "react"
import { ChevronDown, ChevronRight, FileText, FolderClosed, FolderOpen } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Import the doc items from docs-sidebar
import { docNavItems } from "./docs-sidebar"

interface KnowledgeBaseSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activePath?: string
}

export function KnowledgeBaseSidebar({ 
  activePath,
  className, 
  ...props 
}: KnowledgeBaseSidebarProps) {
  return (
    <div className={cn("w-64 border-r h-full bg-card flex flex-col", className)} {...props}>
      {/* Scrollable navigation content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {docNavItems.map((item) => 
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
  )
}

interface NavItemProps {
  item: {
    id: string;
    title: string;
    type: 'file' | 'folder';
    path?: string;
    children?: any[];
  };
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
