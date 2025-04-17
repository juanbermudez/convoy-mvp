import { createLazyFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/placeholder'

export const Route = createLazyFileRoute('/_authenticated/workflows/documentation/')({
  component: DocumentationWorkflowPlaceholder
})

function DocumentationWorkflowPlaceholder() {
  return (
    <Placeholder 
      title="Documentation Workflow" 
      description="Guidelines for creating and maintaining documentation" 
    />
  )
}
