import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/renderer/utils/tailwind';

interface BreadcrumbsProps {
  className?: string;
  items?: {
    label: string;
    href?: string;
  }[];
}

/**
 * Breadcrumbs component for showing navigation path
 */
export function Breadcrumbs({ className, items = [] }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <ol className="flex items-center gap-1">
        <li>
          <a 
            href="/dashboard"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Home</span>
          </a>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-muted-foreground" />
            {item.href ? (
              <a 
                href={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
