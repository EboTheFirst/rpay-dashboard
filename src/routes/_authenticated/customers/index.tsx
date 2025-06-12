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
import { Main } from '@/components/layout/main'
import { useAgent } from '@/context/agent-context'

interface PaginatedCustomersResponse {
  data: Array<{
    customer_id: string
    customer_name?: string
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

function AgentCustomersPage() {
  const navigate = useNavigate()
  const { selectedAgent } = useAgent()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState('total_amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: customersData, isLoading, error } = useQuery<PaginatedCustomersResponse>({
    queryKey: ['agent-customers', selectedAgent, page, pageSize, sortBy, sortOrder, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search })
      })

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/agents/${selectedAgent}/customers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
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

  return (
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
            <h1 className="text-2xl font-bold">My Customers</h1>
            <p className="text-muted-foreground">
              {customersData?.pagination?.total_items || 0} customers found
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              placeholder="Search customers..."
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
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, customersData?.pagination?.total_items || 0)} of {customersData?.pagination?.total_items || 0} customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">Loading customers...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8">
                  <div className="text-destructive">Error loading customers</div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('customer_id')}
                        >
                          Customer ID {getSortIcon('customer_id')}
                        </TableHead>
                        <TableHead>
                          Name
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('total_amount')}
                        >
                          Total Amount {getSortIcon('total_amount')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('transaction_count')}
                        >
                          Transactions {getSortIcon('transaction_count')}
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customersData?.data?.map((customer) => (
                        <TableRow key={customer.customer_id}>
                          <TableCell className="font-medium">
                            {customer.customer_id}
                          </TableCell>
                          <TableCell>
                            {customer.customer_name || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            ₵{customer.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">
                              {customer.transaction_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: `/customers/${customer.customer_id}` })}
                              title="View customer dashboard"
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
                      Page {page} of {customersData?.pagination?.total_pages || 1}
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
                        disabled={page >= (customersData?.pagination?.total_pages || 1)}
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
  )
}

export const Route = createFileRoute('/_authenticated/customers/')({
  component: AgentCustomersPage,
})
