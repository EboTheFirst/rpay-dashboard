import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMerchantList } from '@/hooks/use-merchants'
import { useBranchList } from '@/hooks/use-branches'
import { useAgentList } from '@/hooks/use-agents'

export type TeamType = 'RPAY Analytics' | 'RPAY Merchant' | 'RPAY Branch'
export type NavigationContext = 'direct' | 'hierarchical'

export const RPAYTeam: Record<string, TeamType> = {
  agent: "RPAY Analytics", merchant: "RPAY Merchant", branch: "RPAY Branch"
}

interface TeamContextType {
  selectedTeam: TeamType
  setSelectedTeam: (team: TeamType) => void
  selectedEntity: string
  setSelectedEntity: (entityId: string) => void
  navigationContext: NavigationContext
  setNavigationContext: (context: NavigationContext) => void
  getDashboardUrl: () => string
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

interface TeamProviderProps {
  children: ReactNode
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamType>(RPAYTeam.agent)
  const [selectedEntity, setSelectedEntity] = useState<string>('')
  const [navigationContext, setNavigationContext] = useState<NavigationContext>('direct')

  // Get entity lists for auto-selection
  const { data: agents } = useAgentList()
  const { data: merchants } = useMerchantList()
  const { data: branches } = useBranchList()

  // Function to get the appropriate dashboard URL based on team and entity
  const getDashboardUrl = (): string => {
    switch (selectedTeam) {
      case RPAYTeam.agent:
        return '/'
      case RPAYTeam.merchant:
        return selectedEntity ? `/merchants/${selectedEntity}` : '/'
      case RPAYTeam.branch:
        return selectedEntity ? `/branches/${selectedEntity}` : '/'
      default:
        return '/'
    }
  }

  // Persist selected team to localStorage
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem('selectedTeam', selectedTeam)
    }
  }, [selectedTeam])

  // Load selected team from localStorage on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('selectedTeam') as TeamType
    if (savedTeam && [RPAYTeam.agent, RPAYTeam.merchant, RPAYTeam.branch].includes(savedTeam)) {
      setSelectedTeam(savedTeam)
    }
  }, [])

  // Persist selected entity per team type
  useEffect(() => {
    if (selectedEntity && selectedTeam) {
      localStorage.setItem(`selectedEntity_${selectedTeam}`, selectedEntity)
    }
  }, [selectedEntity, selectedTeam])

  // Load selected entity for current team from localStorage and auto-select if needed
  useEffect(() => {
    const savedEntity = localStorage.getItem(`selectedEntity_${selectedTeam}`)

    if (selectedTeam === RPAYTeam.merchant && merchants) {
      if (savedEntity && merchants.some(m => m.merchant_id === savedEntity)) {
        setSelectedEntity(savedEntity)
      } else if (merchants.length > 0) {
        setSelectedEntity(merchants[0].merchant_id)
      }
    } else if (selectedTeam === RPAYTeam.branch && branches) {
      if (savedEntity && branches.some(b => b.branch_admin_id === savedEntity)) {
        setSelectedEntity(savedEntity)
      } else if (branches.length > 0) {
        setSelectedEntity(branches[0].branch_admin_id)
      }
    } else if (selectedTeam === RPAYTeam.agent && agents) {
      if (savedEntity && agents.some(a => a.id === savedEntity)) {
        setSelectedEntity(savedEntity)
      } else if (agents.length > 0) {
        setSelectedEntity(agents[0].id)
      }
    }
  }, [selectedTeam, merchants, branches])

  const value: TeamContextType = {
    selectedTeam,
    setSelectedTeam,
    selectedEntity,
    setSelectedEntity,
    navigationContext,
    setNavigationContext,
    getDashboardUrl,
  }

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
