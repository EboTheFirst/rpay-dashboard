// API Response Types
export interface SimpleStat {
  metric: string
  value: number
}

export interface GraphPoints {
  labels: string[]
  values: number[]
}

export interface GraphData {
  metric: string
  data: GraphPoints
}

export interface TableData {
  metric: string
  data: Record<string, any>[] | Record<string, any>
}

// Agent API Response Types
export interface AgentOverview {
  transaction_volume: GraphData
  transaction_count: GraphData
  average_transactions: GraphData
  segmentation: TableData
  top_customers: TableData
  transaction_outliers: TableData
  days_between_transactions: TableData
}

// API Query Parameters
export interface DateFilters {
  year?: number
  month?: number
  week?: number
  day?: number
  range_days?: number
  start_date?: string
  end_date?: string
  channel?: string
}

export interface AgentOverviewParams extends DateFilters {
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  top_mode?: 'amount' | 'count'
  top_limit?: number
}

export interface TopEntitiesParams extends DateFilters {
  mode: 'amount' | 'count'
  limit?: number
}

export interface GraphParams extends DateFilters {
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
}
