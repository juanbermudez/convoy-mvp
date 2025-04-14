import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import TasksProvider from './context/tasks-context'
import { tasks } from './data/tasks'

export default function Tasks() {
  return (
    <TasksProvider>
      <Header fixed>
        <div className="flex flex-1 items-center">
          {/* This area will be used for breadcrumbs in the future */}
        </div>
      </Header>

      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
          <p className='text-muted-foreground'>
            Here&apos;s a list of your tasks for this month!
          </p>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={tasks} columns={columns} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
