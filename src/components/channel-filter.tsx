import { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { DateFilters } from '@/types/api'

interface ChannelFilterProps {
  filters: DateFilters
  onFiltersChange: (filters: DateFilters) => void
  onClear: () => void
}

const CHANNEL_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'POS', label: 'POS' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
]

export function ChannelFilter({ filters, onFiltersChange, onClear }: ChannelFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  const updateFilter = (value: string | undefined) => {
    onFiltersChange({
      ...filters,
      channel: value === 'all' ? undefined : value,
    })
  }

  const clearFilter = () => {
    const { channel, ...restFilters } = filters
    onFiltersChange(restFilters)
    onClear()
  }

  const hasActiveFilter = !!filters.channel

  return (
    <div className="border rounded-lg bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-3 py-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-sm font-medium hover:bg-transparent hover:text-foreground">
              <Filter className="h-4 w-4" />
              Channel Filter
              <ChevronDown className={cn("h-3 w-3 transition-transform", !isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="h-6 px-2 text-xs"
            >
              <X className="mr-1 h-2 w-2" />
              Clear
            </Button>
          )}
        </div>
        <CollapsibleContent>
          <div className="px-3 pb-3">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Channel</Label>
                <Select
                  value={filters.channel || 'all'}
                  onValueChange={updateFilter}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {CHANNEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Filter transactions by payment channel type
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
