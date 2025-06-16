import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { DateFilters } from '@/types/api'

interface FilterSummaryProps {
  dateFilters: DateFilters
  onClearFilter: (key: keyof DateFilters) => void
  onClearAll: () => void
}

export function FilterSummary({
  dateFilters,
  onClearFilter,
  onClearAll,
}: FilterSummaryProps) {
  const activeFilters = []

  // Determine filter type and create appropriate labels
  if (dateFilters.range_days) {
    activeFilters.push({
      key: 'range_days' as keyof DateFilters,
      label: `Last ${dateFilters.range_days} days`,
      value: dateFilters.range_days,
      type: 'range'
    })
  } else if (dateFilters.start_date || dateFilters.end_date) {
    if (dateFilters.start_date && dateFilters.end_date) {
      activeFilters.push({
        key: 'start_date' as keyof DateFilters,
        label: `${dateFilters.start_date} to ${dateFilters.end_date}`,
        value: `${dateFilters.start_date}-${dateFilters.end_date}`,
        type: 'custom'
      })
    } else if (dateFilters.start_date) {
      activeFilters.push({
        key: 'start_date' as keyof DateFilters,
        label: `From ${dateFilters.start_date}`,
        value: dateFilters.start_date,
        type: 'custom'
      })
    } else if (dateFilters.end_date) {
      activeFilters.push({
        key: 'end_date' as keyof DateFilters,
        label: `Until ${dateFilters.end_date}`,
        value: dateFilters.end_date,
        type: 'custom'
      })
    }
  } else if (dateFilters.year || dateFilters.month) {
    if (dateFilters.year && dateFilters.month) {
      const monthName = new Date(2024, dateFilters.month - 1).toLocaleString('default', { month: 'long' })
      activeFilters.push({
        key: 'year' as keyof DateFilters,
        label: `${monthName} ${dateFilters.year}`,
        value: `${dateFilters.year}-${dateFilters.month}`,
        type: 'quick'
      })
    } else if (dateFilters.year) {
      activeFilters.push({
        key: 'year' as keyof DateFilters,
        label: `Year ${dateFilters.year}`,
        value: dateFilters.year,
        type: 'quick'
      })
    } else if (dateFilters.month) {
      const monthName = new Date(2024, dateFilters.month - 1).toLocaleString('default', { month: 'long' })
      activeFilters.push({
        key: 'month' as keyof DateFilters,
        label: `${monthName} (all years)`,
        value: dateFilters.month,
        type: 'quick'
      })
    }
  }

  // Add day filter (now part of quick filters)
  if (dateFilters.day) {
    activeFilters.push({
      key: 'day' as keyof DateFilters,
      label: `Day ${dateFilters.day}`,
      value: dateFilters.day,
      type: 'quick'
    })
  }

  // Add channel filter
  if (dateFilters.channel) {
    activeFilters.push({
      key: 'channel' as keyof DateFilters,
      label: `Channel: ${dateFilters.channel}`,
      value: dateFilters.channel,
      type: 'channel'
    })
  }

  const hasActiveFilters = activeFilters.length > 0

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className='flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg'>
      <span className='text-sm font-medium text-muted-foreground'>Active filters:</span>
      
      {/* Date filters with remove buttons */}
      {activeFilters.map((filter) => (
        <Badge key={filter.key} variant='secondary' className='gap-1'>
          {filter.label}
          <Button
            variant='ghost'
            size='sm'
            className='h-auto p-0 text-muted-foreground hover:text-foreground'
            onClick={() => onClearFilter(filter.key)}
          >
            <X className='h-3 w-3' />
          </Button>
        </Badge>
      ))}

      {/* Clear all button */}
      {activeFilters.length > 0 && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onClearAll}
          className='h-6 px-2 text-xs'
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
