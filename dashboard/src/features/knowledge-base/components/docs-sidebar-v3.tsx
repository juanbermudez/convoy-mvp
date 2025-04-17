import React, { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronDown, ChevronRight, ChevronLeft, ChevronUp, FileText, FolderClosed, FolderOpen, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarNav,
  SidebarSection,
  SidebarToggle
} from "@/components/ui/sidebar-02"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Type definitions
type DocItem = {
  id: string
  title: string
  type: "file" | "folder"
  path?: string
  children?: DocItem[]
}

interface DocsSidebarProps {
  className?: string
  items: DocItem[]
  activePath?: string
}

export function DocsSidebarV3({ className, items, activePath }: DocsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }
  
  return (
    <Sidebar className={cn(
      "h-full border-r min-h-screen transition-all duration-300", 
      isCollapsed ? "w-[80px]" : "min-w-[240px] w-[240px]", 
      className
    )}>
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        isCollapsed ? "flex-col" : "flex-row"
      )}>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Documentation</h2>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-8 w-8 rounded-full hover:bg-muted/60"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
          <span className="sr-only">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-10rem)] w-full">
        <div className="p-2">
          {items.map((item) => (
            <NavItem 
              key={item.id} 
              item={item} 
              activePath={activePath} 
              level={0}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </ScrollArea>
    </Sidebar>
  )
}

// Component for rendering individual navigation items
function NavItem({ 
  item, 
  activePath, 
  level = 0,
  isCollapsed
}: { 
  item: DocItem
  activePath?: string
  level: number
  isCollapsed: boolean
}) {
  // Auto-expand if this item or any child is active
  const isActive = activePath === item.path
  const hasChildren = !!item.children?.length
  
  // Determine if this item should be expanded based on active path
  const shouldExpandByDefault = () => {
    if (isActive) return true
    if (!hasChildren || !activePath) return false
    
    // Check if any child matches the active path
    const hasActiveChild = item.children?.some(child => {
      if (child.path === activePath) return true
      if (child.children?.length) {
        return child.children.some(grandchild => grandchild.path === activePath)
      }
      return false
    })
    
    return hasActiveChild
  }
  
  const [expanded, setExpanded] = useState(shouldExpandByDefault())
  
  // Update expanded state when active path changes
  useEffect(() => {
    if (shouldExpandByDefault()) {
      setExpanded(true)
    }
  }, [activePath])

  // Toggle folder expansion
  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  // If sidebar is collapsed, show only top-level items with tooltips
  if (isCollapsed) {
    if (level > 0) return null

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="mb-2 flex justify-center">
            <Button
              variant={isActive ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 mx-auto"
              asChild={!!item.path}
            >
              {item.path ? (
                <Link to={item.path}>
                  {item.type === "file" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    expanded ? <FolderOpen className="h-4 w-4" /> : <FolderClosed className="h-4 w-4" />
                  )}
                </Link>
              ) : (
                <button onClick={toggleExpand}>
                  {expanded ? <FolderOpen className="h-4 w-4" /> : <FolderClosed className="h-4 w-4" />}
                </button>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className={level > 0 ? "ml-3" : ""}>
      <div 
        className={cn(
          "flex items-center py-1 px-2 rounded-md text-sm",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 transition-colors",
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
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
