import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FolderClosed,
  FolderOpen,
  Search,
} from "lucide-react";

// Type definitions
type DocItem = {
  id: string;
  title: string;
  type: 'file' | 'folder';
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: DocItem[];
  description?: string;
};

interface DocsSidebarProps {
  className?: string;
  items: DocItem[];
  activePath?: string;
}

export function DocsSidebarV2({ className, items, activePath }: DocsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filterItems = (items: DocItem[], query: string): DocItem[] => {
    if (!query) return items;
    
    return items
      .filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        (item.children && filterItems(item.children, query).length > 0)
      )
      .map(item => {
        if (!item.children) return item;
        
        return {
          ...item,
          children: filterItems(item.children, query)
        };
      });
  };

  const filteredItems = filterItems(items, searchQuery);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "relative group h-full flex flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-[70px]" : "w-[240px]",
      className
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background z-10 hidden md:flex"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      {/* Header */}
      <div className={cn(
        "flex h-[60px] items-center border-b px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <h2 className="font-semibold">Documentation</h2>}
        <Activity className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "")} />
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background pl-8 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className={cn("space-y-1 px-2", isCollapsed && "px-1")}>
          {filteredItems.map((item) => (
            <NavItem 
              key={item.id} 
              item={item} 
              activePath={activePath} 
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Individual navigation item
function NavItem({ 
  item, 
  activePath, 
  isCollapsed,
  level = 0
}: { 
  item: DocItem; 
  activePath?: string; 
  isCollapsed: boolean;
  level?: number;
}) {
  const isActive = activePath === item.path;
  const hasChildren = !!item.children?.length;
  
  const [expanded, setExpanded] = useState(isActive || level === 0);
  
  // Determine if this item or any child is active
  const isItemOrChildActive = (item: DocItem): boolean => {
    if (item.path === activePath) return true;
    if (item.children) {
      return item.children.some(isItemOrChildActive);
    }
    return false;
  };
  
  // Toggle folder expansion
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Choose the appropriate icon
  const ItemIcon = item.icon || (item.type === 'folder' 
    ? (expanded ? FolderOpen : FolderClosed) 
    : FileText);

  if (isCollapsed) {
    return (
      <div className="py-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to={item.path || "#"}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md",
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 transition-colors"
              )}
            >
              <ItemIcon className="h-5 w-5" />
              <span className="sr-only">{item