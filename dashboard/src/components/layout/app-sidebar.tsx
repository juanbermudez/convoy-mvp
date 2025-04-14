import { Link } from '@tanstack/react-router'
import { IconHelp } from '@tabler/icons-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher'
import { Search } from '@/components/search'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader className="flex flex-col gap-2">
        <WorkspaceSwitcher workspaces={sidebarData.workspaces} />
        <div className="px-3 w-full max-w-full">
          <Search placeholder="Search..." className="w-full max-w-full" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        <div className="px-3">
          <SidebarMenuButton
            asChild
            size="lg"
            className="w-full justify-start"
          >
            <Link to='/help-center'>
              <IconHelp className="mr-3 h-4 w-4" />
              <span>Support</span>
            </Link>
          </SidebarMenuButton>
        </div>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
