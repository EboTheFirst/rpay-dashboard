import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMerchantList } from '@/hooks/use-merchants'
import { useBranchList } from '@/hooks/use-branches'

export type TeamType = 'RPAY Analytics' | 'RPAY Merchant' | 'RPAY Branch'
export type NavigationContext = 'direct' | 'hierarchical'

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
  const [selectedTeam, setSelectedTeam] = useState<TeamType>('RPAY Analytics')
  const [selectedEntity, setSelectedEntity] = useState<string>('')
  const [navigationContext, setNavigationContext] = useState<NavigationContext>('direct')

  // Get entity lists for auto-selection
  const { data: merchants } = useMerchantList()
  const { data: branches } = useBranchList()

  // Function to get the appropriate dashboard URL based on team and entity
  const getDashboardUrl = (): string => {
    switch (selectedTeam) {
      case 'RPAY Analytics':
        return '/'
      case 'RPAY Merchant':
        return selectedEntity ? `/merchants/${selectedEntity}` : '/'
      case 'RPAY Branch':
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
    if (savedTeam && ['RPAY Analytics', 'RPAY Merchant', 'RPAY Branch'].includes(savedTeam)) {
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

    if (selectedTeam === 'RPAY Merchant' && merchants) {
      if (savedEntity && merchants.some(m => m.merchant_id === savedEntity)) {
        setSelectedEntity(savedEntity)
      } else if (merchants.length > 0) {
        setSelectedEntity(merchants[0].merchant_id)
      }
    } else if (selectedTeam === 'RPAY Branch' && branches) {
      if (savedEntity && branches.some(b => b.branch_admin_id === savedEntity)) {
        setSelectedEntity(savedEntity)
      } else if (branches.length > 0) {
        setSelectedEntity(branches[0].branch_admin_id)
      }
    } else if (selectedTeam === 'RPAY Analytics') {
      // For analytics team, we don't need to set an entity as it uses agent context
      setSelectedEntity('')
    } else if (savedEntity) {
      setSelectedEntity(savedEntity)
    } else {
      setSelectedEntity('')
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
