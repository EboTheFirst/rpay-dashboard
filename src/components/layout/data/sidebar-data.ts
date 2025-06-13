import {
  IconBrowserCheck,
  IconHelp,
  IconLayoutDashboard,
  IconNotification,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
} from '@tabler/icons-react'
import { Store, Users2, Target } from 'lucide-react'
import { RpayLogo } from '@/components/rpay-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'RPAY User',
    email: 'user@rpay.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'RPAY Analytics',
      logo: RpayLogo,
      plan: 'Dashboard',
    },
  ],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Merchants',
          url: '/merchants',
          icon: Store,
        },
        {
          title: 'Customers',
          url: '/customers',
          icon: Users2,
        },
        {
          title: 'Target Discovery',
          url: '/target-discovery',
          icon: Target,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
