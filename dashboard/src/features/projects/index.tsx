import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { ProjectsDialogs } from './components/projects-dialogs'
import { ProjectsPrimaryButtons } from './components/projects-primary-buttons'
import ProjectsProvider from './context/projects-context'
import { projects } from './data/projects'

export default function Projects() {
  return (
    <ProjectsProvider>
      <Header fixed>
        <div className="flex flex-1 items-center">
          {/* This area will be used for breadcrumbs in the future */}
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Projects</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your current projects!
            </p>
          </div>
          <ProjectsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={projects} columns={columns} />
        </div>
      </Main>

      <ProjectsDialogs />
    </ProjectsProvider>
  )
}
