import { LinkProps } from '@tanstack/react-router'

interface User {
  name: string
  email: string
  avatar: string
}

interface Workspace {
  name: string
  logo: React.ElementType
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
  hidden?: boolean
  comingSoon?: boolean
}

type NavLink = BaseNavItem & {
  url: LinkProps['to']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  user: User
  workspaces: Workspace[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, Workspace }
