import api from '@/lib/api'
import type {
  SimpleStat,
  GraphData,
  TableData,
  AgentOverview,
  AgentOverviewParams,
  TopEntitiesParams,
  GraphParams,
  DateFilters,
} from '@/types/api'

export const agentsApi = {
  // Get list of all agents
  getList: async (): Promise<{ id: string; name: string }[]> => {
    const response = await api.get('/agents/list')
    return response.data
  },

  // Get total agent count
  getCount: async (): Promise<SimpleStat> => {
    const response = await api.get('/agents/count')
    return response.data
  },

  // Get agent overview data
  getOverview: async (
    agentId: string,
    params: AgentOverviewParams = {}
  ): Promise<AgentOverview> => {
    const response = await api.get(`/agents/${agentId}/overview`, { params })
    return response.data
  },

  // Get agent stats
  getStats: async (
    agentId: string,
    params: DateFilters = {}
  ): Promise<SimpleStat[]> => {
    const response = await api.get(`/agents/${agentId}/stats`, { params })
    return response.data
  },

  // Get transaction volume over time
  getTransactionVolume: async (
    agentId: string,
    params: GraphParams
  ): Promise<GraphData> => {
    const response = await api.get(`/agents/${agentId}/transaction-volume`, {
      params,
    })
    return response.data
  },

  // Get transaction count over time
  getTransactionCount: async (
    agentId: string,
    params: GraphParams
  ): Promise<GraphData> => {
    const response = await api.get(`/agents/${agentId}/transaction-count`, {
      params,
    })
    return response.data
  },

  // Get average transactions over time
  getAverageTransactions: async (
    agentId: string,
    params: GraphParams
  ): Promise<GraphData> => {
    const response = await api.get(`/agents/${agentId}/average-transactions`, {
      params,
    })
    return response.data
  },

  // Get top customers
  getTopCustomers: async (
    agentId: string,
    params: TopEntitiesParams
  ): Promise<TableData> => {
    const response = await api.get(`/agents/${agentId}/top-customers`, {
      params,
    })
    return response.data
  },

  // Get top merchants
  getTopMerchants: async (
    agentId: string,
    params: TopEntitiesParams
  ): Promise<TableData> => {
    const response = await api.get(`/agents/${agentId}/top-merchants`, {
      params,
    })
    return response.data
  },

  // Get customer segmentation
  getCustomerSegmentation: async (
    agentId: string,
    params: DateFilters = {}
  ): Promise<TableData> => {
    const response = await api.get(`/agents/${agentId}/customer-segmentation`, {
      params,
    })
    return response.data
  },

  // Get merchant segmentation
  getMerchantSegmentation: async (
    agentId: string,
    params: DateFilters = {}
  ): Promise<TableData> => {
    const response = await api.get(`/agents/${agentId}/merchant-segmentation`, {
      params,
    })
    return response.data
  },

  // Get merchant activity heatmap
  getMerchantActivityHeatmap: async (
    agentId: string,
    params: GraphParams
  ): Promise<any> => {
    const response = await api.get(`/agents/${agentId}/merchant-activity-heatmap`, {
      params,
    })
    return response.data
  },
}
