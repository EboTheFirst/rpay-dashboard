import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { AgentSelector } from '@/components/agent-selector'
import { useAgent } from '@/context/agent-context'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { selectedAgent, setSelectedAgent } = useAgent()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2">
          {/* Only show agent selector when sidebar is expanded */}
          {state === 'expanded' && (
            <div className="px-2">
              <label className="text-xs font-medium text-sidebar-foreground/70">
                Selected Agent
              </label>
              <div className="mt-1">
                <AgentSelector
                  value={selectedAgent}
                  onValueChange={setSelectedAgent}
                  placeholder="Select agent..."
                />
              </div>
            </div>
          )}
          {state === 'expanded' && <SidebarSeparator />}
          <NavUser user={sidebarData.user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
