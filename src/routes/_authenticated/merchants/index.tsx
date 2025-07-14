import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAgent } from '@/context/agent-context'
import type { DateFilters } from '@/types/api'
import { DateFiltersComponent } from '@/components/date-filters'
import { ChannelFilter } from '@/components/channel-filter'
import { FilterIndicator } from '@/components/filter-indicator'


interface PaginatedMerchantsResponse {
  data: Array<{
    daily_avg_amount: string
    merchant_id: string
    merchant_name?: string
    total_amount: number
    transaction_count: number
  }>
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
  filters: any
  sort: {
    sort_by: string
    sort_order: string
  }
}

function AgentMerchantsPage() {
  const navigate = useNavigate()
  const { selectedAgent } = useAgent()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState('total_amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    month: new Date().getMonth() + 1, year: new Date().getFullYear()
  });


  const { data: merchantsData, isLoading, error } = useQuery<PaginatedMerchantsResponse>({
    queryKey: ['agent-merchants', selectedAgent, page, pageSize, sortBy, sortOrder, search, dateFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...Object.fromEntries(
          Object.entries(dateFilters)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ),
      })

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/agents/${selectedAgent}/merchants?${params}`)
      if (!response.ok) throw new Error('Failed to fetch merchants')
      return response.json()
    },
    enabled: !!selectedAgent,
  })

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1) // Reset to first page when searching
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const clearDateFilter = () => {
    setDateFilters(prev => {
      const newFilters: DateFilters = {}
      if (prev.channel) {
        newFilters["channel"] = prev["channel"]
      }
      return newFilters
    })
  }

  const clearChannelFilter = () => {
    setDateFilters(prev => {
      const newFilters = { ...prev }
      if (newFilters.channel) {
        delete newFilters["channel"]
      }
      return newFilters
    })
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Merchants</h1>
              <p className="text-muted-foreground">
                {merchantsData?.pagination?.total_items || 0} merchants found
              </p>
            </div>
          </div>

          <ErrorBoundary>
            <div className='flex gap-4 flex-wrap'>
              <div className='max-w-md'>
                <DateFiltersComponent
                  filters={dateFilters}
                  onFiltersChange={setDateFilters}
                  onClear={clearDateFilter}
                />
              </div>
              <div className='max-w-xs'>
                <ChannelFilter
                  filters={dateFilters}
                  onFiltersChange={setDateFilters}
                  onClear={clearChannelFilter}
                />
              </div>
            </div>
          </ErrorBoundary>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Search merchants..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Merchants</CardTitle>
              <CardDescription>
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, merchantsData?.pagination?.total_items || 0)} of {merchantsData?.pagination?.total_items || 0} merchants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">Loading merchants...</div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center py-8">
                    <div className="text-destructive">Error loading merchants</div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('merchant_id')}
                          >
                            Merchant ID {getSortIcon('merchant_id')}
                          </TableHead>
                          <TableHead>
                            Name
                          </TableHead>
                          <TableHead
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('total_amount')}
                          >
                            <div className='w-full flex justify-end items-center gap-2 text-right'><FilterIndicator dateFilters={dateFilters} /> Total Amount {getSortIcon('total_amount')}</div>
                          </TableHead>
                          <TableHead
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('daily_avg_amount')}
                          >
                            <div className='w-full flex justify-end items-center gap-2 text-right'><FilterIndicator dateFilters={dateFilters} /> Daily Avg. Amt. {getSortIcon('transaction_count')}</div>
                          </TableHead>
                          <TableHead
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('transaction_count')}
                          >
                            <div className='w-full flex justify-end items-center gap-2 text-right'><FilterIndicator dateFilters={dateFilters} /> Transactions {getSortIcon('transaction_count')}</div>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {merchantsData?.data?.map((merchant) => (
                          <TableRow key={merchant.merchant_id}>
                            <TableCell className="font-medium">
                              {merchant.merchant_id}
                            </TableCell>
                            <TableCell>
                              {merchant.merchant_name || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className='flex items-center justify-end gap-2 text-right'>
                                ₵{merchant.total_amount.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className='flex items-center justify-end gap-2 text-right'>
                                ₵{parseFloat(merchant.daily_avg_amount).toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">
                                {merchant.transaction_count}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: `/merchants/${merchant.merchant_id}` })}
                                title="View merchant dashboard"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {merchantsData?.pagination?.total_pages || 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page >= (merchantsData?.pagination?.total_pages || 1)}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/merchants/')({
  component: AgentMerchantsPage,
})
