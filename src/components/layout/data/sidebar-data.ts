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
import { Store, Users2, Bot, Target, Building2 } from 'lucide-react'
import { RpayLogo } from '@/components/rpay-logo'
import { type SidebarData, type NavItem, type NavLink } from '../types'
import { type TeamType } from '@/context/team-context'

// Common elements
const commonTeams = [
  {
    name: 'RPAY Analytics',
    logo: RpayLogo,
    plan: 'Dashboard',
  },
  {
    name: 'RPAY Merchant',
    logo: RpayLogo,
    plan: 'Dashboard',
  },
  {
    name: 'RPAY Branch',
    logo: RpayLogo,
    plan: 'Dashboard',
  },
]

// Define with proper typing
const commonMainItems: NavLink[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: IconLayoutDashboard,
  },
  // Commented out but kept for reference
  // {
  //   title: 'Customers',
  //   url: '/customers',
  //   icon: Users2,
  // },
  {
    title: 'Target Discovery',
    url: '/target-discovery',
    icon: Target as unknown as React.ElementType,
  },
]

const settingsItems: NavItem[] = [
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
]

// Agent sidebar data
export const sidebarData: SidebarData = {
  user: {
    name: 'RPAY Agent',
    email: 'agent@rpay.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: commonTeams,
  navGroups: [
    {
      title: 'Main',
      items: [
        commonMainItems[0], // Dashboard
        {
          title: 'Merchants',
          url: '/merchants',
          icon: Store as unknown as React.ElementType,
        },
        commonMainItems[1], // Target Discovery
      ],
    },
    {
      title: 'Support',
      items: settingsItems,
    },
  ],
}

// Merchant sidebar data
export const merchantSidebarData: SidebarData = {
  user: {
    name: 'RPAY Merchant',
    email: 'merchant@rpay.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: commonTeams,
  navGroups: [
    {
      title: 'Main',
      items: [
        commonMainItems[0], // Dashboard
        {
          title: 'Branches',
          url: '/branches',
          icon: Store as unknown as React.ElementType,
        },
        commonMainItems[1], // Target Discovery
      ],
    },
  ],
}

// Branch sidebar data
export const branchSidebarData: SidebarData = {
  user: {
    name: 'RPAY Branch',
    email: 'branch@rpay.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: commonTeams,
  navGroups: [
    {
      title: 'Main',
      items: [
        commonMainItems[0], // Dashboard
        {
          title: 'Terminals',
          url: '/branches/$branchId/terminals',
          icon: Building2 as unknown as React.ElementType,
        },
      ],
    },
  ],
}

// Function to create dashboard nav item with dynamic URL
const createDashboardItem = (url: string): NavLink => ({
  title: 'Dashboard',
  url: url as any, // Type assertion to handle dynamic URLs
  icon: IconLayoutDashboard,
})

// Team-based navigation mapping with dynamic dashboard URLs
export const getTeamSidebarData = (team: TeamType, dashboardUrl: string = '/', selectedEntity?: string): SidebarData => {
  const dashboardItem = createDashboardItem(dashboardUrl)

  switch (team) {
    case 'RPAY Analytics':
      return {
        ...sidebarData,
        navGroups: [
          {
            title: 'Main',
            items: [
              dashboardItem,
              {
                title: 'Merchants',
                url: '/merchants',
                icon: Store as unknown as React.ElementType,
              },
              commonMainItems[1], // Target Discovery
              {
                title: 'AI Assistant',
                url: '/ai-assistant',
                icon: Bot as unknown as React.ElementType,
              },
            ],
          },
          {
            title: 'Support',
            items: settingsItems,
          },
        ],
      }
    case 'RPAY Merchant':
      return {
        ...merchantSidebarData,
        navGroups: [
          {
            title: 'Main',
            items: [
              dashboardItem,
              {
                title: 'Branches',
                url: (selectedEntity ? `/merchants/${selectedEntity}/branches` : '/merchants') as any,
                icon: Store as unknown as React.ElementType,
              },
              commonMainItems[1], // Target Discovery
              {
                title: 'AI Assistant',
                url: '/ai-assistant',
                icon: Bot as unknown as React.ElementType,
              },
            ],
          },
        ],
      }
    case 'RPAY Branch':
      return {
        ...branchSidebarData,
        navGroups: [
          {
            title: 'Main',
            items: [
              dashboardItem,
              {
                title: 'Terminals',
                url: (selectedEntity ? `/branches/${selectedEntity}/terminals` : '/branches') as any,
                icon: Building2 as unknown as React.ElementType,
              },
              {
                title: 'AI Assistant',
                url: '/ai-assistant',
                icon: Bot as unknown as React.ElementType,
              },
            ],
          },
        ],
      }
    default:
      return {
        ...sidebarData,
        navGroups: [
          {
            title: 'Main',
            items: [
              dashboardItem,
              {
                title: 'Merchants',
                url: '/merchants',
                icon: Store as unknown as React.ElementType,
              },
              commonMainItems[1], // Target Discovery
            ],
          },
          {
            title: 'Support',
            items: settingsItems,
          },
        ],
      }
  }
}
