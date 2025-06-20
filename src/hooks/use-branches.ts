import { useQuery } from '@tanstack/react-query'
import type { DateFilters, BranchStat, BranchOverview, BranchDetails } from '@/types/api'

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Helper function to build query parameters
const buildQueryParams = (
  granularity?: string,
  topMode?: string,
  topLimit?: number,
  dateFilters?: DateFilters
) => {
  const params = new URLSearchParams()
  
  if (granularity) params.append('granularity', granularity)
  if (topMode) params.append('top_mode', topMode)
  if (topLimit) params.append('top_limit', topLimit.toString())
  
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

// Get all branches for a merchant
export const useMerchantBranches = (
  merchantId: string,
  enabled: boolean = true
) => {
  return useQuery<BranchDetails[]>({
    queryKey: ['merchant-branches', merchantId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/merchants/${merchantId}/branches`)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant branches: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

// Get branch statistics
export const useBranchStats = (
  branchId: string,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<BranchStat[]>({
    queryKey: ['branch-stats', branchId, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/stats${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch stats: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get branch overview data
export const useBranchOverview = (
  branchId: string,
  granularity: string = 'monthly',
  topMode: string = 'amount',
  topLimit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<BranchOverview>({
    queryKey: ['branch-overview', branchId, granularity, topMode, topLimit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, topMode, topLimit, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/overview${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch overview: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get branch transaction volume over time
export const useBranchTransactionVolume = (
  branchId: string,
  granularity: string = 'monthly',
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<GraphData>({
    queryKey: ['branch-transaction-volume', branchId, granularity, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/transaction-volume${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch transaction volume: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get branch transaction count over time
export const useBranchTransactionCount = (
  branchId: string,
  granularity: string = 'monthly',
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<GraphData>({
    queryKey: ['branch-transaction-count', branchId, granularity, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/transaction-count${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch transaction count: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get top customers for a branch
export const useBranchTopCustomers = (
  branchId: string,
  mode: string = 'amount',
  limit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['branch-top-customers', branchId, mode, limit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/top-customers?mode=${mode}&limit=${limit}${params ? `&${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch top customers: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get top terminals for a branch
export const useBranchTopTerminals = (
  branchId: string,
  mode: string = 'amount',
  limit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['branch-top-terminals', branchId, mode, limit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/top-terminals?mode=${mode}&limit=${limit}${params ? `&${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch top terminals: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get branch details
export const useBranchDetails = (branchId: string, enabled: boolean = true) => {
  return useQuery<BranchDetails>({
    queryKey: ['branch-details', branchId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/branch-admins/${branchId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch details: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get top branches for a merchant
export const useMerchantTopBranches = (
  merchantId: string,
  mode: string = 'amount',
  limit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['merchant-top-branches', merchantId, mode, limit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/top-branches?mode=${mode}&limit=${limit}${params ? `&${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant top branches: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

// Get branch activity heatmap for a merchant
export const useMerchantBranchActivityHeatmap = (
  merchantId: string,
  filters: Record<string, any> = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['merchant-branch-activity-heatmap', merchantId, filters],
    queryFn: async () => {
      const params = buildQueryParams(
        filters.granularity,
        undefined,
        undefined,
        filters
      )
      const url = `${API_BASE_URL}/merchants/${merchantId}/branch-activity-heatmap${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant branch activity heatmap: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

// Hook to get list of all branches
export const useBranchList = () => {
  return useQuery<Array<{ branch_admin_id: string; branch_name: string }>>({
    queryKey: ['branch-list'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/branch-admins/list`)
      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.statusText}`)
      }
      return response.json()
    },
  })
}

// Get terminal activity heatmap for a branch
export const useBranchTerminalActivityHeatmap = (
  branchId: string,
  filters: Record<string, any> = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['branch-terminal-activity-heatmap', branchId, filters],
    queryFn: async () => {
      const params = buildQueryParams(
        filters.granularity,
        undefined,
        undefined,
        filters
      )
      const url = `${API_BASE_URL}/branch-admins/${branchId}/terminal-activity-heatmap${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch terminal activity heatmap: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}

// Get branch transaction frequency analysis
export const useBranchTransactionFrequencyAnalysis = (
  branchId: string,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['branch-transaction-frequency-analysis', branchId, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/branch-admins/${branchId}/transaction-frequency-analysis${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch branch transaction frequency analysis: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!branchId,
  })
}
