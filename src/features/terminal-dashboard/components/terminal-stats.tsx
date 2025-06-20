import { useTerminalStats } from '@/hooks/use-terminals'
import type { DateFilters } from '@/types/api'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TerminalStatsProps {
  terminalId: string
  dateFilters: DateFilters
}

export function TerminalStats({ terminalId, dateFilters }: TerminalStatsProps) {
  const { data: stats, isLoading, error } = useTerminalStats(
    terminalId,
    dateFilters,
    !!terminalId
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Error loading terminal statistics</div>
      </div>
    )
  }

  if (!terminalId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Please select a terminal to view data</div>
      </div>
    )
  }

  const statsArray = Array.isArray(stats) ? stats : []

  if (statsArray.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No statistics available</div>
      </div>
    )
  }

  // Extract specific stats for display
  const displayStats = statsArray.map(stat => {
    const isAmount = stat.metric.toLowerCase().includes('value') || stat.metric.toLowerCase().includes('amount')
    const isCount = stat.metric.toLowerCase().includes('count') || stat.metric.toLowerCase().includes('transactions')
    
    let formattedValue = stat.value
    if (typeof stat.value === 'number') {
      if (isAmount) {
        formattedValue = `₵${stat.value.toLocaleString()}`
      } else {
        formattedValue = stat.value.toLocaleString()
      }
    }

    return {
      ...stat,
      formattedValue,
      isAmount,
      isCount
    }
  })

  const getTrendIcon = (metric: string) => {
    // For now, we'll show neutral trend since we don't have historical comparison
    // In a real implementation, you'd compare with previous period
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-3">
      {displayStats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {stat.metric.replace(/\s*\(.*?\)\s*/g, '')} {/* Remove filter suffix */}
            </p>
            <p className="text-xs text-muted-foreground">
              {stat.isAmount ? 'Transaction value' : 
               stat.isCount ? 'Count' : 
               'Metric value'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {stat.formattedValue}
            </span>
            {getTrendIcon(stat.metric)}
          </div>
        </div>
      ))}
    </div>
  )
}
