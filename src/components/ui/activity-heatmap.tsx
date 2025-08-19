import { useState } from 'react'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface HeatmapData {
  metric: string
  periods: string[]
  transaction_volume: Array<{ [key: string]: any }>
  transaction_count: Array<{ [key: string]: any }>
  average_transaction_value: Array<{ [key: string]: any }>
}

export interface ActivityHeatmapProps {
  // Data and loading state
  data?: HeatmapData
  isLoading: boolean
  error?: Error | null
  
  // Configuration
  entityType: 'merchant' | 'branch' | 'terminal'
  entityIdField: string // e.g., 'merchant', 'branch', 'terminal'
  entityDisplayField?: string // e.g., 'branch_name' for branches, defaults to entityIdField
  entityLabel: string // e.g., 'Merchant', 'Branch', 'Terminal'
  entityLabelPlural: string // e.g., 'merchants', 'branches', 'terminals'
  
  // Behavior
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters?: DateFilters
  mode?: 'volume' | 'count' | 'average'
  itemsPerPage?: number
  
  // Messages
  loadingMessage?: string
  errorMessage?: string
  noDataMessage?: string
  noEntityMessage?: string
}

export function ActivityHeatmap({
  data,
  isLoading,
  error,
  entityIdField,
  entityDisplayField,
  entityLabel,
  entityLabelPlural,
  mode = 'volume',
  itemsPerPage = 10,
  loadingMessage,
  errorMessage,
  noDataMessage
}: ActivityHeatmapProps) {
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState(1)

  // Get theme-appropriate colors (using the merchant heatmap's more sophisticated color scheme)
  const getHeatmapColors = () => {
    switch (theme) {
      case 'dark':
        return {
          low: '#1e293b',
          medium: '#60a5fa',
          high: '#bae6fd',   // Even more intense high (sky-200)
          textLow: '#94a3b8',
          textMedium: '#0f172a',
          textHigh: '#0f172a'
        };
      case 'transflow-light':
        return {
          low: '#f1f5f9',
          medium: '#3b82f6',
          high: '#1d4ed8',   // Even more intense high (blue-700)
          textLow: '#475569',
          textMedium: '#f8fafc',
          textHigh: '#f8fafc'
        };
      case 'transflow-dark':
        return {
          low: '#1e293b',
          medium: '#0ea5e9',
          high: '#93c5fd',   // Even more intense high (blue-300)
          textLow: '#94a3b8',
          textMedium: '#f8fafc',
          textHigh: '#0f172a'
        };
      default:
        return {
          low: '#f1f5f9',
          medium: '#2563eb',
          high: '#172554',   // Even more intense high (blue-950)
          textLow: '#475569',
          textMedium: '#f8fafc',
          textHigh: '#f8fafc'
        };
    }
  };

  const colors = getHeatmapColors()

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">
          {loadingMessage || 'Loading heatmap data...'}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-destructive">
          {errorMessage || 'Error loading heatmap data'}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">
          {noDataMessage || 'No heatmap data available'}
        </div>
      </div>
    )
  }

  // Get the appropriate data based on mode
  const getData = () => {
    switch (mode) {
      case 'volume':
        return data.transaction_volume || []
      case 'count':
        return data.transaction_count || []
      case 'average':
        return data.average_transaction_value || []
      default:
        return data.transaction_volume || []
    }
  }

  const entityData = getData()
  const periods = data.periods || []

  // Calculate pagination
  const totalEntities = entityData.length
  const totalPages = Math.ceil(totalEntities / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = entityData.slice(startIndex, endIndex)

  // Calculate value ranges for color scaling
  const allValues = entityData.flatMap((entity: any) =>
    periods.map((period: any) => entity[period] || 0)
  ).filter((val: number) => val > 0)

  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  // Get color intensity based on value
  const getBackgroundColor = (value: number) => {
    if (value === 0) return 'transparent';
    if (allValues.length === 0) return colors.low;
    const range = maxValue - minValue;
    if (range === 0) return colors.medium; // All values are the same
    const intensity = (value - minValue) / range;
    if (intensity < 0.33) return colors.low;
    if (intensity < 0.66) return colors.medium;
    return colors.high;
  };

  const getTextColor = (value: number) => {
    if (value === 0) return '#6b7280'; // gray-500
    if (allValues.length === 0) return colors.textLow;
    const range = maxValue - minValue;
    if (range === 0) return colors.textMedium;
    const intensity = (value - minValue) / range;
    if (intensity < 0.33) return colors.textLow;
    if (intensity < 0.66) return colors.textMedium;
    return colors.textHigh;
  };

  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  
  // Format value for display
  const formatValue = (value: number) => {
    if (mode === 'volume' || mode === 'average') {
      return `₵${value.toLocaleString('en-US', options)}`
    }
    return value.toLocaleString()
  }

  // Get display name for entity
  const getEntityDisplayName = (entity: any) => {
    const displayField = entityDisplayField || entityIdField
    return entity[displayField] || entity[entityIdField]
  }

  return (
    <div className="space-y-4">
      {/* Header with pagination */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalEntities)} of {totalEntities} {entityLabelPlural}
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
              {entityLabel}
            </div>
            {periods.map((period: any) => (
              <div key={period} className="p-2 text-xs font-medium text-muted-foreground text-center">
                {period}
              </div>
            ))}
          </div>

          {/* Data rows */}
          <div className="space-y-1">
            {paginatedData.map((entity: any) => (
              <div
                key={entity[entityIdField]}
                className="grid gap-1"
                style={{ gridTemplateColumns: `200px repeat(${periods.length}, 80px)` }}
              >
                <div className="p-2 text-xs font-medium truncate bg-muted/50 rounded">
                  {getEntityDisplayName(entity)}
                </div>
                {periods.map((period: any) => {
                  const value = entity[period] || 0
                  return (
                    <div
                      key={period}
                      className="p-2 text-xs text-center rounded transition-colors"
                      style={{
                        backgroundColor: getBackgroundColor(value),
                        color: getTextColor(value)
                      }}
                      title={`${getEntityDisplayName(entity)} - ${period}: ${formatValue(value)}`}
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
