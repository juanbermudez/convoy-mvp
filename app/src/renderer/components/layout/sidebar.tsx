import React, { useState } from "react";
import { cn } from "@/renderer/utils/tailwind";
import { Button } from "@/renderer/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, Home, Settings, LayoutGrid } from "lucide-react";

interface SidebarProps {
  className?: string;
}

/**
 * Sidebar component for navigation
 * Includes toggle functionality to collapse/expand
 */
export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-3 py-2">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-foreground">Convoy</h2>
        )}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <NavItem icon={<Home size={18} />} label="Dashboard" href="/dashboard" collapsed={collapsed} />
          <NavItem icon={<LayoutGrid size={18} />} label="Projects" href="/projects" collapsed={collapsed} />
          <NavItem icon={<Settings size={18} />} label="Settings" href="/settings" collapsed={collapsed} />
        </nav>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  collapsed: boolean;
}

/**
 * Navigation item for the sidebar
 */
function NavItem({ icon, label, href, collapsed }: NavItemProps) {
  const isActive = window.location.pathname === href;
  
  return (
    <a 
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive 
          ? "bg-accent text-accent-foreground" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </a>
  );
}
