import * as React from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Create a Sidebar Context
type SidebarState = 'expanded' | 'collapsed'
type SidebarVariant = 'default' | 'floating'
type SidebarCollapsible = 'none' | 'icon' | 'full'

interface SidebarContextValue {
  state: SidebarState
  setState: (state: SidebarState) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  collapsible: SidebarCollapsible
  variant: SidebarVariant
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({
  children,
  defaultState = 'expanded',
  collapsible = 'none',
  variant = 'default',
}: {
  children: React.ReactNode
  defaultState?: SidebarState
  collapsible?: SidebarCollapsible
  variant?: SidebarVariant
}) {
  const [state, setState] = React.useState<SidebarState>(defaultState)
  const [openMobile, setOpenMobile] = React.useState(false)
  
  return (
    <SidebarContext.Provider value={{ 
      state, 
      setState, 
      openMobile, 
      setOpenMobile, 
      collapsible,
      variant
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultState?: SidebarState
  collapsible?: SidebarCollapsible
  variant?: SidebarVariant
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ 
    className, 
    defaultState = 'expanded', 
    collapsible = 'none', 
    variant = 'default', 
    ...props 
  }, ref) => {
    const { state } = collapsible !== 'none' 
      ? useSidebar() 
      : { state: defaultState };
    
    return (
      <SidebarProvider 
        defaultState={defaultState} 
        collapsible={collapsible}
        variant={variant}
      >
        <div
          ref={ref}
          data-state={state}
          data-collapsible={collapsible}
          data-variant={variant}
          className={cn(
            "group relative flex flex-col h-full w-full max-w-[280px] border-r bg-sidebar text-sidebar-foreground shadow-sm duration-300",
            // If collapsed and collapsible is icon, set smaller width
            state === 'collapsed' && collapsible === 'icon' && "max-w-[80px]",
            // If floating variant, add rounded corners and shadow
            variant === 'floating' && "rounded-xl border shadow-md",
            className
          )}
          {...props}
        />
      </SidebarProvider>
    );
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-4 p-4 border-b", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto p-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pb-2", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  SidebarGroupLabelProps
>(({ className, asChild = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium tracking-tight",
      className
    )}
    {...props}
  />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("min-h-0 py-0.5", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("px-0", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  asChild?: boolean
  tooltip?: string
  size?: "default" | "sm" | "lg"
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, asChild = false, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative block rounded-md w-full px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isActive && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
      className
    )}
    {...props}
  />
))
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute right-0 top-0 h-full w-px transition-all",
      className
    )}
    {...props}
  />
))
SidebarRail.displayName = "SidebarRail"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto px-2 py-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("space-y-1 pl-6", className)} {...props} />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("px-0", className)} {...props} />
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  asChild?: boolean
}

const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuSubButtonProps
>(({ className, isActive, asChild = false, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative block rounded-md w-full px-3 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      className
    )}
    {...props}
  />
))
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { openMobile, setOpenMobile } = useSidebar()
    
    const toggleSidebar = () => {
      setOpenMobile(!openMobile)
    }
    
    return (
      <Button
        ref={ref}
        variant={variant as any}
        size="icon"
        onClick={toggleSidebar}
        className={cn("h-9 w-9", className)}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger
}
