import { IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
  items: {
    label: string
    href?: string
  }[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center', className)}>
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <IconChevronRight size={14} className="mx-1 text-muted-foreground" />}
            <span className={cn(
              "text-sm font-medium",
              index === items.length - 1 ? "text-foreground" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
