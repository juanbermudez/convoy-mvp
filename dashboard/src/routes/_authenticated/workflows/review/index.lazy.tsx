import { createLazyFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/placeholder'

export const Route = createLazyFileRoute('/_authenticated/workflows/review/')({
  component: ReviewWorkflowPlaceholder
})

function ReviewWorkflowPlaceholder() {
  return (
    <Placeholder 
      title="Review Workflow" 
      description="Processes for code review and quality assurance" 
    />
  )
}
