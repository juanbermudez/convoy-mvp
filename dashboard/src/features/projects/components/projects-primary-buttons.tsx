import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useProjects } from '../context/projects-context'

export function ProjectsPrimaryButtons() {
  const { setOpen } = useProjects()

  return (
    <div className='flex gap-2'>
      <Button 
        size="sm"
        className='px-2 gap-1'
        onClick={() => setOpen('create')}
      >
        <IconPlus size={16} />
        <span>New Project</span>
      </Button>
    </div>
  )
}
