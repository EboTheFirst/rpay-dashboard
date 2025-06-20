import { useQuery } from '@tanstack/react-query'
import type { DateFilters } from '@/types/api'

interface MerchantStat {
  metric: string
  value: number
}

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

interface MerchantOverview {
  transaction_volume: GraphData
  transaction_count: GraphData
  average_transactions: GraphData
  segmentation: TableData
  top_customers: TableData
  transaction_outliers: TableData
  days_between_transactions: TableData
  transaction_frequency: TableData
  stats: MerchantStat[]
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
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }

  return params.toString()
}

export const useMerchantStats = (
  merchantId: string,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<MerchantStat[]>({
    queryKey: ['merchant-stats', merchantId, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/stats${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant stats: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

export const useMerchantOverview = (
  merchantId: string,
  granularity: string = 'monthly',
  topMode: string = 'amount',
  topLimit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<MerchantOverview>({
    queryKey: ['merchant-overview', merchantId, granularity, topMode, topLimit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, topMode, topLimit, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/overview${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant overview: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

export const useMerchantTransactionVolume = (
  merchantId: string,
  granularity: string = 'monthly',
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<GraphData>({
    queryKey: ['merchant-transaction-volume', merchantId, granularity, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/transaction-volume${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant transaction volume: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

export const useMerchantTransactionCount = (
  merchantId: string,
  granularity: string = 'monthly',
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<GraphData>({
    queryKey: ['merchant-transaction-count', merchantId, granularity, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(granularity, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/transaction-count${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant transaction count: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

export const useMerchantTopCustomers = (
  merchantId: string,
  mode: string = 'amount',
  limit: number = 10,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['merchant-top-customers', merchantId, mode, limit, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/top-customers?mode=${mode}&limit=${limit}${params ? `&${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant top customers: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

// Hook to get merchant details (name, etc.) from the merchants list
export const useMerchantTransactionFrequencyAnalysis = (
  merchantId: string,
  dateFilters: DateFilters = {},
  enabled: boolean = true
) => {
  return useQuery<TableData>({
    queryKey: ['merchant-transaction-frequency-analysis', merchantId, dateFilters],
    queryFn: async () => {
      const params = buildQueryParams(undefined, undefined, undefined, dateFilters)
      const url = `${API_BASE_URL}/merchants/${merchantId}/transaction-frequency-analysis${params ? `?${params}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant transaction frequency analysis: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: enabled && !!merchantId,
  })
}

export const useMerchantDetails = (merchantId: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: ['merchant-details', merchantId],
    queryFn: async () => {
      // Try to get merchant details from the general merchants endpoint
      const response = await fetch(`${API_BASE_URL}/merchants/?search=${merchantId}&page_size=1`)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant details: ${response.statusText}`)
      }
      const data = await response.json()

      const merchant = data.data?.find((m: any) => m.merchant_id == merchantId)
      return merchant || { merchant_id: merchantId, merchant_name: null }
    },
    enabled: enabled && !!merchantId,
  })
}

// Hook to get list of all merchants
export const useMerchantList = () => {
  return useQuery<Array<{ merchant_id: string; merchant_name: string }>>({
    queryKey: ['merchant-list'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/merchants/list`)
      if (!response.ok) {
        throw new Error(`Failed to fetch merchants: ${response.statusText}`)
      }
      return response.json()
    },
  })
}
