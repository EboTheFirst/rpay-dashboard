import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAgentList } from '@/hooks/use-agents'

interface AgentContextType {
  selectedAgent: string
  setSelectedAgent: (agentId: string) => void
  agents: Array<{ id: string; name: string }> | undefined
  isLoading: boolean
  error: Error | null
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

interface AgentProviderProps {
  children: ReactNode
}

export function AgentProvider({ children }: AgentProviderProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const { data: agents, isLoading, error } = useAgentList()

  // Auto-select first agent when list loads
  useEffect(() => {
    if (agents && agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0].id)
    }
  }, [agents, selectedAgent])

  // Persist selected agent to localStorage
  useEffect(() => {
    if (selectedAgent) {
      localStorage.setItem('selectedAgent', selectedAgent)
    }
  }, [selectedAgent])

  // Load selected agent from localStorage on mount
  useEffect(() => {
    const savedAgent = localStorage.getItem('selectedAgent')
    if (savedAgent && agents?.some(agent => agent.id === savedAgent)) {
      setSelectedAgent(savedAgent)
    }
  }, [agents])

  const value: AgentContextType = {
    selectedAgent,
    setSelectedAgent,
    agents,
    isLoading,
    error,
  }

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}
