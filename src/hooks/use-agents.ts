import { useQuery } from '@tanstack/react-query'
import { agentsApi } from '@/services/agents'
import type {
  AgentOverviewParams,
  TopEntitiesParams,
  GraphParams,
  DateFilters,
} from '@/types/api'

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  list: () => [...agentKeys.all, 'list'] as const,
  count: () => [...agentKeys.all, 'count'] as const,
  agent: (id: string) => [...agentKeys.all, id] as const,
  overview: (id: string, params?: AgentOverviewParams) =>
    [...agentKeys.agent(id), 'overview', params] as const,
  stats: (id: string, params?: DateFilters) =>
    [...agentKeys.agent(id), 'stats', params] as const,
  transactionVolume: (id: string, params: GraphParams) =>
    [...agentKeys.agent(id), 'transaction-volume', params] as const,
  transactionCount: (id: string, params: GraphParams) =>
    [...agentKeys.agent(id), 'transaction-count', params] as const,
  averageTransactions: (id: string, params: GraphParams) =>
    [...agentKeys.agent(id), 'average-transactions', params] as const,
  topCustomers: (id: string, params: TopEntitiesParams) =>
    [...agentKeys.agent(id), 'top-customers', params] as const,
  topMerchants: (id: string, params: TopEntitiesParams) =>
    [...agentKeys.agent(id), 'top-merchants', params] as const,
  customerSegmentation: (id: string, params?: DateFilters) =>
    [...agentKeys.agent(id), 'customer-segmentation', params] as const,
  merchantSegmentation: (id: string, params?: DateFilters) =>
    [...agentKeys.agent(id), 'merchant-segmentation', params] as const,
  merchantActivityHeatmap: (id: string, params: GraphParams) =>
    [...agentKeys.agent(id), 'merchant-activity-heatmap', params] as const,
  transactionFrequencyAnalysis: (id: string, params?: DateFilters) =>
    [...agentKeys.agent(id), 'transaction-frequency-analysis', params] as const,
}

// Hooks
export const useAgentList = () => {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: agentsApi.getList,
  })
}

export const useAgentCount = () => {
  return useQuery({
    queryKey: agentKeys.count(),
    queryFn: agentsApi.getCount,
  })
}

export const useAgentOverview = (
  agentId: string,
  params: AgentOverviewParams = {},
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.overview(agentId, params),
    queryFn: () => agentsApi.getOverview(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentStats = (
  agentId: string,
  params: DateFilters = {},
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.stats(agentId, params),
    queryFn: () => agentsApi.getStats(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentTransactionVolume = (
  agentId: string,
  params: GraphParams,
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.transactionVolume(agentId, params),
    queryFn: () => agentsApi.getTransactionVolume(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentTransactionCount = (
  agentId: string,
  params: GraphParams,
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.transactionCount(agentId, params),
    queryFn: () => agentsApi.getTransactionCount(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentTopCustomers = (
  agentId: string,
  params: TopEntitiesParams,
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.topCustomers(agentId, params),
    queryFn: () => agentsApi.getTopCustomers(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentTopMerchants = (
  agentId: string,
  params: TopEntitiesParams,
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.topMerchants(agentId, params),
    queryFn: () => agentsApi.getTopMerchants(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentMerchantActivityHeatmap = (
  agentId: string,
  params: GraphParams,
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.merchantActivityHeatmap(agentId, params),
    queryFn: () => agentsApi.getMerchantActivityHeatmap(agentId, params),
    enabled: enabled && !!agentId,
  })
}

export const useAgentTransactionFrequencyAnalysis = (
  agentId: string,
  params: DateFilters = {},
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.transactionFrequencyAnalysis(agentId, params),
    queryFn: () => agentsApi.getTransactionFrequencyAnalysis(agentId, params),
    enabled: enabled && !!agentId,
  })
}
