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
import { MerchantSelector } from '@/components/merchant-selector'
import { BranchSelector } from '@/components/branch-selector'
import { useAgent } from '@/context/agent-context'
import { useTeam } from '@/context/team-context'
import { getTeamSidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { selectedAgent, setSelectedAgent } = useAgent()
  const { selectedTeam, selectedEntity, setSelectedEntity, getDashboardUrl } = useTeam()
  const { state } = useSidebar()

  const dashboardUrl = getDashboardUrl()
  const currentSidebarData = getTeamSidebarData(selectedTeam, dashboardUrl, selectedEntity)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={currentSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {currentSidebarData.navGroups.map((navGroup) => (
          <NavGroup key={navGroup.title} {...navGroup} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2">
          {/* Only show entity selector when sidebar is expanded */}
          {state === 'expanded' && (
            <div className="px-2">
              {selectedTeam === 'RPAY Analytics' && (
                <>
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
                </>
              )}
              {selectedTeam === 'RPAY Merchant' && (
                <>
                  <label className="text-xs font-medium text-sidebar-foreground/70">
                    Selected Merchant
                  </label>
                  <div className="mt-1">
                    <MerchantSelector
                      value={selectedEntity}
                      onValueChange={setSelectedEntity}
                      placeholder="Select merchant..."
                    />
                  </div>
                </>
              )}
              {selectedTeam === 'RPAY Branch' && (
                <>
                  <label className="text-xs font-medium text-sidebar-foreground/70">
                    Selected Branch
                  </label>
                  <div className="mt-1">
                    <BranchSelector
                      value={selectedEntity}
                      onValueChange={setSelectedEntity}
                      placeholder="Select branch..."
                    />
                  </div>
                </>
              )}
            </div>
          )}
          {state === 'expanded' && <SidebarSeparator />}
          <NavUser user={currentSidebarData.user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
