import { createLazyFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/placeholder'

export const Route = createLazyFileRoute('/_authenticated/activity/')({
  component: ActivityPlaceholder
})

function ActivityPlaceholder() {
  return (
    <Placeholder 
      title="Activity" 
      description="Recent activity and work history" 
    />
  )
}
