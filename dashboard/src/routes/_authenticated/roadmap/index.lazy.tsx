import { createLazyFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/placeholder'

export const Route = createLazyFileRoute('/_authenticated/roadmap/')({
  component: RoadmapPlaceholder
})

function RoadmapPlaceholder() {
  return (
    <Placeholder 
      title="Roadmap" 
      description="Project planning and roadmap visualization" 
    />
  )
}
