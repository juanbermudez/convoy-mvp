import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownViewerProps {
  content?: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  // This is a simplified markdown renderer for now
  // In a real implementation, you would use a library like react-markdown
  
  if (!content) {
    return (
      <div className={cn("flex items-center justify-center h-full p-6 text-muted-foreground", className)}>
        <p>Select a document to view its content</p>
      </div>
    );
  }
  
  // Very basic markdown parsing (just for headings and paragraphs)
  const formattedContent = content
    .split('\n')
    .map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 my-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <div key={index} className="h-4"></div>;
      } else {
        return <p key={index} className="my-2">{line}</p>;
      }
    });
  
  return (
    <div className={cn("p-6", className)}>
      {formattedContent}
    </div>
  );
}
