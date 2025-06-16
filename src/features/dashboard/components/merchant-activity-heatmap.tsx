import { useState } from 'react'
import { useAgentMerchantActivityHeatmap } from '@/hooks/use-agents'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MerchantActivityHeatmapProps {
  agentId?: string
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters?: DateFilters
  mode?: 'volume' | 'count' | 'average'
}

interface HeatmapData {
  metric: string
  periods: string[]
  transaction_volume: Array<{ merchant: string;[key: string]: any }>
  transaction_count: Array<{ merchant: string;[key: string]: any }>
  average_transaction_value: Array<{ merchant: string;[key: string]: any }>
}

const MERCHANTS_PER_PAGE = 10

export function MerchantActivityHeatmap({
  agentId,
  granularity = 'monthly',
  dateFilters = {},
  mode = 'volume'
}: MerchantActivityHeatmapProps) {
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState(1)

  const { data: heatmapData, isLoading, error } = useAgentMerchantActivityHeatmap(
    agentId || '',
    { granularity, ...dateFilters },
    !!agentId
  )

  // Get theme-appropriate colors
  const getHeatmapColors = () => {
    switch (theme) {
      case 'dark':
        return {
          low: '#1e293b',
          medium: '#3b82f6',
          high: '#60a5fa',
          text: '#f8fafc'
        }
      case 'transflow-light':
        return  {
        "low": "#f1f5f9",
        "medium": "#60a5fa",
        "high": "#3b82f6",
        "text": "#0f172a"
      }
        // return {
        //   "low": "#fef2f2",
        //   "medium": "#f87171",
        //   "high": "#ef4444",
        //   "text": "#0f172a"
        // }
             

      case 'transflow-dark':
        return {
          low: '#1e293b',
          medium: '#0369a1',
          high: '#60a5fa',
          text: '#f8fafc'
        }
      default:
        return {
          low: '#f1f5f9',
          medium: '#3b82f6',
          high: '#1d4ed8',
          text: '#0f172a'
        }
    }
  }

  const colors = getHeatmapColors()

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading heatmap data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-destructive">Error loading heatmap data</div>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Please select an agent to view heatmap</div>
      </div>
    )
  }

  if (!heatmapData) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">No heatmap data available</div>
      </div>
    )
  }

  // Get the appropriate data based on mode
  const getData = () => {
    switch (mode) {
      case 'volume':
        return heatmapData.transaction_volume || []
      case 'count':
        return heatmapData.transaction_count || []
      case 'average':
        return heatmapData.average_transaction_value || []
      default:
        return heatmapData.transaction_volume || []
    }
  }

  const data = getData()
  const periods = heatmapData.periods || []

  // Calculate pagination
  const totalMerchants = data.length
  const totalPages = Math.ceil(totalMerchants / MERCHANTS_PER_PAGE)
  const startIndex = (currentPage - 1) * MERCHANTS_PER_PAGE
  const endIndex = startIndex + MERCHANTS_PER_PAGE
  const paginatedData = data.slice(startIndex, endIndex)

  // Calculate value ranges for color scaling
  const allValues = data.flatMap((merchant: any) =>
    periods.map((period: any) => merchant[period] || 0)
  ).filter((val: number) => val > 0)

  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    if (value === 0) return colors.low
    const intensity = (value - minValue) / (maxValue - minValue)
    if (intensity < 0.33) return colors.low
    if (intensity < 0.66) return colors.medium
    return colors.high
  }

  // Format value for display
  const formatValue = (value: number) => {
    if (mode === 'volume' || mode === 'average') {
      return `₵${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Header with pagination */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalMerchants)} of {totalMerchants} merchants
          </p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header row */}
          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `200px repeat(${periods.length}, 80px)` }}>
            <div className="p-2 text-xs font-medium text-muted-foreground">
              Merchant
            </div>
            {periods.map((period: any) => (
              <div key={period} className="p-2 text-xs font-medium text-muted-foreground text-center">
                {period}
              </div>
            ))}
          </div>

          {/* Data rows */}
          <div className="space-y-1">
            {paginatedData.map((merchant: any, index: any) => (
              <div
                key={merchant.merchant}
                className="grid gap-1"
                style={{ gridTemplateColumns: `200px repeat(${periods.length}, 80px)` }}
              >
                <div className="p-2 text-xs font-medium truncate bg-muted/50 rounded">
                  {merchant.merchant}
                </div>
                {periods.map((period: any) => {
                  const value = merchant[period] || 0
                  return (
                    <div
                      key={period}
                      className="p-2 text-xs text-center rounded transition-colors"
                      style={{
                        backgroundColor: getColorIntensity(value),
                        color: value > 0 ? colors.text : 'hsl(var(--muted-foreground))'
                      }}
                      title={`${merchant.merchant} - ${period}: ${formatValue(value)}`}
                    >
                      {value > 0 ? formatValue(value) : '-'}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Intensity:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.low }}></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.medium }}></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.high }}></div>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
