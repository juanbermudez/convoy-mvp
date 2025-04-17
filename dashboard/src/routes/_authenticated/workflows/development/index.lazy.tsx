import { createLazyFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/placeholder'

export const Route = createLazyFileRoute('/_authenticated/workflows/development/')({
  component: DevelopmentWorkflowPlaceholder
})

function DevelopmentWorkflowPlaceholder() {
  return (
    <Placeholder 
      title="Development Workflow" 
      description="Process and guidelines for development activities" 
    />
  )
}
