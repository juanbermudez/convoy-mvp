import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  showSeparator?: boolean
  isCollapsed?: boolean
  className?: string
  children?: React.ReactNode
}

export function SidebarSection({
  title,
  showSeparator = true,
  isCollapsed = false,
  className,
  children,
  ...props
}: SidebarSectionProps) {
  return (
    <div className={cn("py-2", className)} {...props}>
      {title && !isCollapsed && (
        <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight">
          {title}
        </h3>
      )}
      {children}
      {showSeparator && (
        <Separator className={cn("mt-4", isCollapsed ? "w-full" : "w-full")} />
      )}
    </div>
  )
}
