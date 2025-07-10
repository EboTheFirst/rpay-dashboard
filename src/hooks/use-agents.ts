import { useQuery } from '@tanstack/react-query'
import { agentsApi } from '@/services/agents'
import type {
  AgentOverviewParams,
  TopEntitiesParams,
  GraphParams,
  DateFilters,
} from '@/types/api'
import api from '@/lib/api'

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
  myMerchants: (id: string, params?: DateFilters) =>
    [...agentKeys.agent(id), 'my-merchants', params] as const,
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

export const useAgentMerchants = (
  agentId: string,
  params: DateFilters = {},
  enabled = true
) => {
  return useQuery({
    queryKey: agentKeys.stats(agentId, params),
    queryFn: () => agentsApi.getMyMerchants(agentId, params),
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

export const agentDataExport = async (
  agentId: string,
  params: DateFilters = {}
): Promise<void> => {
  if (!agentId) {
    console.warn("agentDataExport: agentId is required.");
    return; // Exit if agentId is not provided
  }

  try {
    const response = await api.get(`/agents/${agentId}/export`, {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let filename = 'export.csv';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export agent data:", error);
    // You might want to throw the error or handle it more specifically
    throw error;
  }
};
