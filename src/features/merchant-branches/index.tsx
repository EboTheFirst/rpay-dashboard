import { useState } from 'react'
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
import { useNavigate } from '@tanstack/react-router'

interface PaginatedBranchesResponse {
  data: Array<{
    branch_admin_id: string
    branch_name?: string
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

interface MerchantBranchesProps {
  merchantId: string
}

export default function MerchantBranches({ merchantId }: MerchantBranchesProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState('total_amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: branchesData, isLoading, error } = useQuery<PaginatedBranchesResponse>({
    queryKey: ['merchant-branches', merchantId, page, pageSize, sortBy, sortOrder, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search })
      })

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/merchants/${merchantId}/branches?${params}`)
      if (!response.ok) throw new Error('Failed to fetch branches')
      return response.json()
    },
    enabled: !!merchantId,
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
              onClick={() => navigate({ to: `/merchants/${merchantId}` })}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Merchant Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Merchant Branches</h1>
              <p className="text-muted-foreground">
                {branchesData?.pagination?.total_items || 0} branches found
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Search branches..."
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
              <CardTitle>Branches</CardTitle>
              <CardDescription>
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, branchesData?.pagination?.total_items || 0)} of {branchesData?.pagination?.total_items || 0} branches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">Loading branches...</div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center py-8">
                    <div className="text-destructive">Error loading branches</div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('branch_admin_id')}
                          >
                            Branch ID {getSortIcon('branch_admin_id')}
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
                        {branchesData?.data?.map((branch) => (
                          <TableRow key={branch.branch_admin_id}>
                            <TableCell className="font-medium">
                              {branch.branch_admin_id}
                            </TableCell>
                            <TableCell>
                              {branch.branch_name || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              ₵{branch.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">
                                {branch.transaction_count}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: `/merchants/${merchantId}/${branch.branch_admin_id}` })}
                                title="View branch dashboard"
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
                        Page {page} of {branchesData?.pagination?.total_pages || 1}
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
                          disabled={page >= (branchesData?.pagination?.total_pages || 1)}
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
