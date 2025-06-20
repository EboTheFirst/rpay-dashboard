import { useQuery } from '@tanstack/react-query'
import type { DateFilters, TerminalStat, TerminalOverview } from '@/types/api'

interface GraphPoints {
  labels: string[]
  values: number[]
}

interface GraphData {
  metric: string
  data: GraphPoints
}

interface TableRow {
  [key: string]: any
}

interface TableData {
  metric: string
  data: TableRow[] | TableRow
}

interface TerminalDetails {
  terminal_id: string
  branch_admin_id: string
  branch_name?: string
  merchant_id?: string
  merchant_name?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Helper function to build query parameters
const buildQueryParams = (
  granularity?: string,
  topMode?: string,
  topLimit?: number,
  dateFilters?: DateFilters,
  channel?: string
) => {
  const params = new URLSearchParams()

  if (granularity) params.append('granularity', granularity)
  if (topMode) params.append('top_mode', topMode)
  if (topLimit) params.append('top_limit', topLimit.toString())
  if (channel) params.append('channel', channel)

  // Add date filters
  if (dateFilters) {
    Object.entries(dateFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
  }

  return params.toString()
}

// Get all terminals for a branch
export const useBranchTerminals = (
  branchId: string,
  enabled: boolean = true
) => {
  return useQuery<TerminalDetails[]>({
    queryKey: ['branch-terminals', branchId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/branch-admins/${branchId}/terminals`)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch terminals: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get terminal statistics
export const useTerminalStats = (
  terminalId: string,
  filters: DateFilters & { channel?: string } = {},
  enabled: boolean = true
) => {
  return useQuery<TerminalStat[]>({
    queryKey: ['terminal-stats', terminalId, filters],
    queryFn: async () => {
      const { channel, ...dateFilters } = filters
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters, channel)
      const url = `${API_BASE_URL}/terminals/${terminalId}/stats${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal stats: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}

// Get terminal overview data
export const useTerminalOverview = (
  terminalId: string,
  granularity: string = 'monthly',
  topMode: string = 'amount',
  topLimit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TerminalOverview>({
    queryKey: ['terminal-overview', terminalId, granularity, topMode, topLimit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, topMode, topLimit, dateFilters)
      const url = `${API_BASE_URL}/terminals/${terminalId}/overview${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal overview: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}

// Get terminal transaction volume over time
export const useTerminalTransactionVolume = (
  terminalId: string,
  granularity: string = 'monthly',
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<GraphData>({
    queryKey: ['terminal-transaction-volume', terminalId, granularity, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/terminals/${terminalId}/transaction-volume${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal transaction volume: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}

// Get terminal transaction count over time
export const useTerminalTransactionCount = (
  terminalId: string,
  granularity: string = 'monthly',
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<GraphData>({
    queryKey: ['terminal-transaction-count', terminalId, granularity, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/terminals/${terminalId}/transaction-count${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal transaction count: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}

// Get top customers for a terminal
export const useTerminalTopCustomers = (
  terminalId: string,
  filters: DateFilters & { mode?: string; limit?: number; channel?: string } = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['terminal-top-customers', terminalId, filters],
    queryFn: async () => {
      const { mode = 'amount', limit = 10, channel, ...dateFilters } = filters
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters, channel)
      const url = `${API_BASE_URL}/terminals/${terminalId}/top-customers?mode=${mode}&limit=${limit}${params ? `&${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal top customers: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}

// Get terminal details
export const useTerminalDetails = (terminalId: string, enabled: boolean = true) => {
  return useQuery<TerminalDetails>({
    queryKey: ['terminal-details', terminalId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/terminals/${terminalId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal details: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}

// Get terminal transaction frequency analysis
export const useTerminalTransactionFrequencyAnalysis = (
  terminalId: string,
  filters: DateFilters & { channel?: string } = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['terminal-transaction-frequency', terminalId, filters],
    queryFn: async () => {
      const { channel, ...dateFilters } = filters
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters, channel)
      const url = `${API_BASE_URL}/terminals/${terminalId}/transaction-frequency-analysis${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch terminal transaction frequency: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!terminalId,
  })
}
