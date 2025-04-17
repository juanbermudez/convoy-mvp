import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarToggleProps extends React.HTMLAttributes<HTMLButtonElement> {
  isCollapsed: boolean
  onToggle: () => void
  icon?: React.ReactNode
  collapsedIcon?: React.ReactNode
  tooltipText?: string
  className?: string
}

export function SidebarToggle({
  isCollapsed,
  onToggle,
  icon,
  collapsedIcon,
  tooltipText = isCollapsed ? "Expand" : "Collapse",
  className,
  ...props
}: SidebarToggleProps) {
  const ButtonIcon = isCollapsed ? collapsedIcon : icon

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        isCollapsed ? "px-2" : "px-4"
      )}
    >
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("h-9 w-9", className)}
            {...props}
          >
            {ButtonIcon && ButtonIcon}
            <span className="sr-only">
              {isCollapsed ? "Expand" : "Collapse"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex items-center gap-4"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
