import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBranchDetails } from '@/hooks/use-branches'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ErrorBoundary } from '@/components/error-boundary'
import { useNavigate } from '@tanstack/react-router'
import { DateFiltersComponent } from '@/components/date-filters'
import { ChannelFilter } from '@/components/channel-filter'
import { DateFilters } from '@/types/api'
import { FilterIndicator } from '@/components/filter-indicator'

interface PaginatedTerminalsResponse {
  data: Array<{
    terminal_id: string
    terminal_name?: string
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

function BranchTerminals() {
  const { branchId } = Route.useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState('total_amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    month: new Date().getMonth() + 1, year: new Date().getFullYear()
  });


  // Get branch details to get merchant ID for navigation
  const { data: branchDetails } = useBranchDetails(branchId || '', !!branchId)

  const { data: terminalsData, isLoading, error } = useQuery<PaginatedTerminalsResponse>({
    queryKey: ['branch-terminals', branchId, page, pageSize, sortBy, sortOrder, search, dateFilters],
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
      const response = await fetch(`${apiBaseUrl}/branch-admins/${branchId}/terminals?${params}`)
      if (!response.ok) throw new Error('Failed to fetch terminals')
      return response.json()
    },
    enabled: !!branchId,
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

  const handleTerminalClick = (terminalId: string) => {
    // Navigate to terminal dashboard using the hierarchical route
    if (branchDetails?.merchant_id) {
      navigate({
        to: `/merchants/${branchDetails.merchant_id}/${branchId}/${terminalId}`
      })
    } else {
      console.warn('Merchant ID not available for navigation')
    }
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
              onClick={() => navigate({ to: `/branches/${branchId}` })}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Branch Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Branch Terminals</h1>
              <p className="text-muted-foreground">
                {terminalsData?.pagination?.total_items || 0} terminals found
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
                placeholder="Search terminals..."
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
              <CardTitle>Terminals</CardTitle>
              <CardDescription>
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, terminalsData?.pagination?.total_items || 0)} of {terminalsData?.pagination?.total_items || 0} terminals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">Loading terminals...</div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center py-8">
                    <div className="text-destructive">Error loading terminals</div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('terminal_id')}
                          >
                            Terminal ID {getSortIcon('terminal_id')}
                          </TableHead>
                          <TableHead
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('total_amount')}
                          >
                            <div className='w-full flex justify-end items-center gap-2 text-right'><FilterIndicator dateFilters={dateFilters} /> Total Amount {getSortIcon('total_amount')}</div>
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
                        {terminalsData?.data?.map((terminal) => (
                          <TableRow key={terminal.terminal_id}>
                            <TableCell className="font-medium">
                              {terminal.terminal_id}
                            </TableCell>
                            <TableCell className="text-right">
                              ₵{terminal.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">
                                {terminal.transaction_count}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTerminalClick(terminal.terminal_id)}
                                title="View terminal dashboard"
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
                        Page {page} of {terminalsData?.pagination?.total_pages || 1}
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
                          disabled={page >= (terminalsData?.pagination?.total_pages || 1)}
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

export const Route = createFileRoute('/_authenticated/branches/$branchId/terminals')({
  component: BranchTerminals,
})
