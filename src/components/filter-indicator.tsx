import { Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DateFilters } from '@/types/api'

interface FilterIndicatorProps {
  dateFilters: DateFilters
  className?: string
}

export function FilterIndicator({ dateFilters, className = '' }: FilterIndicatorProps) {
  const hasFilters = Object.keys(dateFilters).length > 0

  if (!hasFilters) {
    return null
  }

  const getFilterSummary = () => {
    const filters = []
    
    if (dateFilters.year) filters.push(`${dateFilters.year}`)
    if (dateFilters.month) {
      const monthName = new Date(2024, dateFilters.month - 1).toLocaleString('default', { month: 'short' })
      filters.push(monthName)
    }
    if (dateFilters.range_days) filters.push(`${dateFilters.range_days}d`)
    if (dateFilters.start_date) filters.push(`from ${dateFilters.start_date}`)
    if (dateFilters.end_date) filters.push(`to ${dateFilters.end_date}`)
    if (dateFilters.week) filters.push(`W${dateFilters.week}`)
    if (dateFilters.day) filters.push(`D${dateFilters.day}`)

    return filters.slice(0, 2).join(', ') + (filters.length > 2 ? '...' : '')
  }

  return (
    <Badge variant="secondary" className={`gap-1 text-xs ${className}`}>
      <Filter className="h-3 w-3" />
      {getFilterSummary()}
    </Badge>
  )
}
