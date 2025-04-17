import { createLazyFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/placeholder'

export const Route = createLazyFileRoute('/_authenticated/workflows/deployment/')({
  component: DeploymentWorkflowPlaceholder
})

function DeploymentWorkflowPlaceholder() {
  return (
    <Placeholder 
      title="Deployment Workflow" 
      description="Process for deploying and releasing updates" 
    />
  )
}
