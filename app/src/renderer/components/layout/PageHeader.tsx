import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { cn } from '@/renderer/utils/tailwind';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  actions?: React.ReactNode;
}

/**
 * PageHeader component for consistent page headers
 * Includes title, optional description, breadcrumbs, and actions
 */
export function PageHeader({
  title,
  description,
  className,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 pb-4", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
