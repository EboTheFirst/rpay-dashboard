import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, X, Search, MessageCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAgent } from '@/context/agent-context'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DateFiltersComponent } from '@/components/date-filters'
import type { DateFilters } from '@/types/api'

export const Route = createFileRoute('/_authenticated/target-discovery/customers/')({
  component: CustomerTargetingPage,
})

interface FilterCondition {
  id: string
  column: string
  operator: string
  value: string | number | [number, number]
}

function CustomerTargetingPage() {
  const { selectedAgent } = useAgent()
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFilters, setDateFilters] = useState<DateFilters>({})

  const availableColumns = [
    { value: 'total_transactions', label: 'Total Transactions' },
    { value: 'avg_transaction_amount', label: 'Average Transaction Amount' },
    { value: 'sum_transaction_amount', label: 'Total Transaction Amount' },
    { value: 'min_transaction_amount', label: 'Minimum Transaction Amount' },
    { value: 'max_transaction_amount', label: 'Maximum Transaction Amount' },
    { value: 'std_transaction_amount', label: 'Transaction Amount Std Dev' },
    { value: 'unique_merchants', label: 'Unique Merchants' },
    { value: 'unique_branch_admins', label: 'Unique Branch Admins' },
    { value: 'unique_terminals', label: 'Unique Terminals' },
  ]

  const operators = [
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'equals', label: 'Equals' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In (comma-separated values)' },
  ]

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: '',
      operator: '',
      value: ''
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id: string, field: keyof FilterCondition, value: any) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const executeFilter = async () => {
    if (!selectedAgent || filters.length === 0) return

    setLoading(true)
    try {
      const filterStructure = {
        and: filters.map(f => ({
          column: f.column,
          operator: f.operator,
          value: f.operator === 'between' ? f.value : Number(f.value)
        }))
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

      // Build query parameters for date filters
      const params = new URLSearchParams()
      if (dateFilters.year) params.append('year', dateFilters.year.toString())
      if (dateFilters.month) params.append('month', dateFilters.month.toString())
      if (dateFilters.week) params.append('week', dateFilters.week.toString())
      if (dateFilters.day) params.append('day', dateFilters.day.toString())
      if (dateFilters.range_days) params.append('range_days', dateFilters.range_days.toString())
      if (dateFilters.start_date) params.append('start_date', dateFilters.start_date)
      if (dateFilters.end_date) params.append('end_date', dateFilters.end_date)

      const url = `${apiBaseUrl}/agents/${selectedAgent}/filter-customers${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterStructure)
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data || [])
      }
    } catch (error) {
      console.error('Filter error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/target-discovery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Customer Targeting</h1>
            <p className="text-muted-foreground">Filter customers based on spending behavior and transaction patterns</p>
          </div>
        </div>

      <div className="space-y-6">
        {/* Date Filters */}
        <div className='max-w-md'>
          <DateFiltersComponent
            filters={dateFilters}
            onFiltersChange={setDateFilters}
            onClear={() => setDateFilters({})}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Filter Conditions</CardTitle>
              <CardDescription>
                Add conditions to find customers that match your criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Column</Label>
                  <Select value={filter.column} onValueChange={(value) => updateFilter(filter.id, 'column', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map(col => (
                        <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Operator</Label>
                  <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, 'operator', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={typeof filter.value === 'string' || typeof filter.value === 'number' ? filter.value : ''}
                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => removeFilter(filter.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
              <Button onClick={executeFilter} disabled={loading || filters.length === 0 || !selectedAgent}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search Customers'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Results ({results.length})
              {results.length > 0 && (
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reach Out
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Customers matching your filter criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results yet. Add filters and search to find customers.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((customer, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{customer.customer_id}</div>
                      <Badge variant="secondary">
                        {customer.total_transactions} transactions
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Avg: ₵{customer.avg_transaction_amount?.toFixed(2)} | 
                      Total: ₵{customer.sum_transaction_amount?.toFixed(2)} |
                      Merchants: {customer.unique_merchants}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
        </div>
      </Main>
    </>
  )
}
