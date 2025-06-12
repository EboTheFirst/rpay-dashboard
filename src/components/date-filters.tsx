import { useState, useEffect } from 'react'
import { CalendarIcon, X, Calendar as CalendarIconLucide, Clock, Target, ChevronDown } from 'lucide-react'
import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { DateFilters } from '@/types/api'

type FilterMode = 'quick' | 'range' | 'custom'

interface DateFiltersProps {
  filters: DateFilters
  onFiltersChange: (filters: DateFilters) => void
  onClear: () => void
}

export function DateFiltersComponent({ filters, onFiltersChange, onClear }: DateFiltersProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [activeMode, setActiveMode] = useState<FilterMode>('quick')
  const [isOpen, setIsOpen] = useState(true)

  // Synchronize local state with filters
  useEffect(() => {
    if (filters.start_date) {
      try {
        setStartDate(parse(filters.start_date, 'yyyy-MM-dd', new Date()))
      } catch {
        setStartDate(undefined)
      }
    } else {
      setStartDate(undefined)
    }

    if (filters.end_date) {
      try {
        setEndDate(parse(filters.end_date, 'yyyy-MM-dd', new Date()))
      } catch {
        setEndDate(undefined)
      }
    } else {
      setEndDate(undefined)
    }
  }, [filters])

  const updateFilter = (key: keyof DateFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }

    // Clear conflicting filters when setting a new filter
    if (value !== undefined && value !== null) {
      switch (key) {
        case 'year':
        case 'month':
        case 'day':
          // Clear other mode filters when setting quick filters (year/month/day are all in quick mode now)
          delete newFilters.range_days
          delete newFilters.start_date
          delete newFilters.end_date
          break
        case 'range_days':
          // Clear other mode filters when setting range filter
          delete newFilters.year
          delete newFilters.month
          delete newFilters.start_date
          delete newFilters.end_date
          delete newFilters.day
          break
        case 'start_date':
        case 'end_date':
          // Clear other mode filters when setting custom filters
          delete newFilters.year
          delete newFilters.month
          delete newFilters.range_days
          delete newFilters.day
          break
      }
    }

    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onClear()
  }

  const switchMode = (mode: FilterMode) => {
    setActiveMode(mode)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== null)

  return (
    <div className="border rounded-lg bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-3 py-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-sm font-medium hover:bg-transparent hover:text-foreground">
              <CalendarIconLucide className="h-4 w-4" />
              Date Filters
              <ChevronDown className={cn("h-3 w-3 transition-transform", !isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="mr-1 h-2 w-2" />
              Clear
            </Button>
          )}
        </div>
        <CollapsibleContent>
          <div className="px-3 pb-3">
        <Tabs value={activeMode} onValueChange={(value) => switchMode(value as FilterMode)}>
          <TabsList className="grid w-full grid-cols-3 mb-3 h-8">
            <TabsTrigger value="quick" className="text-xs h-6">
              <Target className="w-3 h-3 mr-1" />
              Quick
            </TabsTrigger>
            <TabsTrigger value="range" className="text-xs h-6">
              <Clock className="w-3 h-3 mr-1" />
              Range
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs h-6">
              <CalendarIconLucide className="w-3 h-3 mr-1" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-2 mt-0">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Quick Options</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    variant={filters.year === new Date().getFullYear() && !filters.month && !filters.day ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentYear = new Date().getFullYear()
                      const newFilters = { ...filters }
                      // Clear conflicting filters
                      delete newFilters.range_days
                      delete newFilters.start_date
                      delete newFilters.end_date
                      // Set current year and clear month/day
                      newFilters.year = currentYear
                      delete newFilters.month
                      delete newFilters.day
                      onFiltersChange(newFilters)
                    }}
                  >
                    This Year
                  </Button>
                  <Button
                    variant={filters.year === new Date().getFullYear() && filters.month === new Date().getMonth() + 1 && !filters.day ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentYear = new Date().getFullYear()
                      const currentMonth = new Date().getMonth() + 1
                      const newFilters = { ...filters }
                      // Clear conflicting filters
                      delete newFilters.range_days
                      delete newFilters.start_date
                      delete newFilters.end_date
                      // Set current year and month, clear day
                      newFilters.year = currentYear
                      newFilters.month = currentMonth
                      delete newFilters.day
                      onFiltersChange(newFilters)
                    }}
                  >
                    This Month
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Year</Label>
                  <Select
                    value={filters.year?.toString() || 'all'}
                    onValueChange={(value) => updateFilter('year', value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Month</Label>
                  <Select
                    value={filters.month?.toString() || 'all'}
                    onValueChange={(value) => updateFilter('month', value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Day of Month</Label>
                <Input
                  type="number"
                  placeholder="1-31"
                  value={filters.day || ''}
                  onChange={(e) => updateFilter('day', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-8"
                  min="1"
                  max="31"
                />
                <p className="text-xs text-muted-foreground">
                  {filters.year || filters.month
                    ? "Filter by specific day within the selected time period"
                    : "Filter by specific day across all months and years"
                  }
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="range" className="space-y-2 mt-0">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Last 7 days', value: 7 },
                    { label: 'Last 30 days', value: 30 },
                    { label: 'Last 90 days', value: 90 },
                    { label: 'Last 365 days', value: 365 },
                  ].map((preset) => (
                    <Button
                      key={preset.value}
                      variant={filters.range_days === preset.value ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => updateFilter('range_days', preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Custom Days</Label>
                <Input
                  type="number"
                  placeholder="e.g., 45"
                  value={filters.range_days || ''}
                  onChange={(e) => updateFilter('range_days', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-8"
                  min="1"
                  max="365"
                />
                <p className="text-xs text-muted-foreground">
                  Or enter a custom number of days
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-2 mt-0">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-8 w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        updateFilter('start_date', date ? format(date, 'yyyy-MM-dd') : undefined)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-8 w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        updateFilter('end_date', date ? format(date, 'yyyy-MM-dd') : undefined)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>
          </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
