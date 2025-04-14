import {
  IconActivity,
  IconBarrierBlock,
  IconBook2,
  IconBoxModel2,
  IconBrowserCheck,
  IconBug,
  IconBuildingArch,
  IconCheckbox,
  IconError404,
  IconEye,
  IconFileDescription,
  IconFileText,
  IconGitBranch,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPalette,
  IconRoad,
  IconRocket,
  IconServerOff,
  IconSettings,
  IconSquareRoundedCheck,
  IconStarFilled,
  IconTemplate,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  workspaces: [
    {
      name: 'Convoy App',
      logo: Command,
      plan: 'AI Product Agent',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Workbench',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
          hidden: true,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: IconSquareRoundedCheck,
        },
        {
          title: 'Projects',
          url: '/projects',
          icon: IconBoxModel2,
        },
        {
          title: 'Roadmap',
          url: '/roadmap',
          icon: IconRoad,
          hidden: true,
        },
        {
          title: 'Activity',
          url: '/activity',
          icon: IconActivity,
          comingSoon: true,
        },
        {
          title: 'Knowledge Base',
          icon: IconBook2,
          items: [
            {
              title: 'Overview',
              url: '/overview',
              comingSoon: true,
            },
            {
              title: 'Architecture',
              url: '/architecture',
              comingSoon: true,
            },
            {
              title: 'Technical Specs',
              url: '/technical-specs',
              comingSoon: true,
            },
            {
              title: 'Patterns',
              url: '/patterns',
              comingSoon: true,
            },
            {
              title: 'Best Practices',
              url: '/best-practices',
              comingSoon: true,
            },
            {
              title: 'Source Code',
              url: '/source-code',
              comingSoon: true,
            },
          ],
        },
        {
          title: 'Workflows',
          icon: IconGitBranch,
          items: [
            {
              title: 'Development',
              url: '/workflows/development',
              comingSoon: true,
            },
            {
              title: 'Documentation',
              url: '/workflows/documentation',
              comingSoon: true,
            },
            {
              title: 'Review',
              url: '/workflows/review',
              comingSoon: true,
            },
            {
              title: 'Deployment',
              url: '/workflows/deployment',
              comingSoon: true,
            },
          ],
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: IconBoxModel2,
          hidden: true,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: IconMessages,
          hidden: true,
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
          hidden: true,
        },
      ],
    },
  ],
}
