import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTasks } from '../context/tasks-context'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button 
        size="sm"
        className='px-2'
        onClick={() => setOpen('create')}
      >
        <IconPlus size={16} />
      </Button>
    </div>
  )
}
