import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href?: string
    onClick?: () => void
  }[]
}

export function SidebarNav({
  className,
  links,
  isCollapsed = false,
  ...props
}: SidebarNavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group flex flex-col gap-4 py-2",
        isCollapsed && "items-center",
        className
      )}
      {...props}
    >
      <ScrollArea
        className={cn(
          "h-[calc(100vh-8rem)]",
          isCollapsed ? "w-[80px]" : "w-full"
        )}
      >
        <nav className="grid gap-1 px-2">
          {links.map((link, index) =>
            isCollapsed ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={link.variant}
                    size="icon"
                    className={cn(
                      "h-9 w-9",
                      link.variant === "default" &&
                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    )}
                    onClick={link.onClick}
                    {...(link.href ? { asChild: true } : {})}
                  >
                    {link.href ? (
                      <a href={link.href}>
                        {link.icon}
                        <span className="sr-only">{link.title}</span>
                      </a>
                    ) : (
                      <>
                        {link.icon}
                        <span className="sr-only">{link.title}</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-4">
                  {link.title}
                  {link.label && (
                    <span className="ml-auto text-muted-foreground">
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={index}
                variant={link.variant}
                size="sm"
                className={cn(
                  "justify-start",
                  link.variant === "default" &&
                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white"
                )}
                onClick={link.onClick}
                {...(link.href ? { asChild: true } : {})}
              >
                {link.href ? (
                  <a
                    href={link.href}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="flex items-center gap-2">
                      {link.icon}
                      {link.title}
                    </span>
                    {link.label && (
                      <span className="ml-auto text-muted-foreground">
                        {link.label}
                      </span>
                    )}
                  </a>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      {link.icon}
                      {link.title}
                    </span>
                    {link.label && (
                      <span className="ml-auto text-muted-foreground">
                        {link.label}
                      </span>
                    )}
                  </>
                )}
              </Button>
            )
          )}
        </nav>
      </ScrollArea>
    </div>
  )
}
