import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        {children}
      </div>
    </div>
  )
}
