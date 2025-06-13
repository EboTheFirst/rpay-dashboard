import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, MessageCircle, Sparkles } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAgent } from '@/context/agent-context'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DateFiltersComponent } from '@/components/date-filters'
import type { DateFilters } from '@/types/api'

export const Route = createFileRoute('/_authenticated/target-discovery/merchants/search')({
  component: MerchantSmartSearchPage,
})

function MerchantSmartSearchPage() {
  const { selectedAgent } = useAgent()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFilters, setDateFilters] = useState<DateFilters>({})

  const exampleQueries = [
    "Find merchants with more than 50 transactions",
    "Show merchants with average transaction amount greater than 200",
    "List merchants with between 20 and 100 unique customers",
    "Find merchants with total transactions less than 30",
    "Show merchants with average transaction amount between 100 and 500"
  ]

  const executeSearch = async () => {
    if (!selectedAgent || !query.trim()) return

    setLoading(true)
    try {
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

      const url = `${apiBaseUrl}/agents/${selectedAgent}/nl-filter-merchants${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Smart Merchant Search
            </h1>
            <p className="text-muted-foreground">Use natural language to find merchants</p>
          </div>
        </div>

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
            <CardTitle>Natural Language Query</CardTitle>
            <CardDescription>
              Describe what kind of merchants you're looking for in plain English
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="e.g., Find merchants with more than 100 transactions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button onClick={executeSearch} disabled={loading || !query.trim() || !selectedAgent} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search Merchants'}
            </Button>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Example Queries:</h4>
              <div className="space-y-1">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors block w-full p-2 rounded border hover:bg-muted"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Search Results ({results.length})
              {results.length > 0 && (
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reach Out
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Merchants matching your search criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Searching merchants...
                  </div>
                ) : (
                  "No results yet. Enter a search query to find merchants."
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((merchant, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{merchant.merchant_id}</div>
                      <Badge variant="secondary">
                        {merchant.total_transactions} transactions
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Avg: ₵{merchant.avg_transaction_amount?.toFixed(2)} | 
                      Total: ₵{merchant.sum_transaction_amount?.toFixed(2)} |
                      Customers: {merchant.unique_customers}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Available Metrics:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Total transactions</li>
                <li>• Average transaction amount</li>
                <li>• Total transaction amount</li>
                <li>• Min/Max transaction amounts</li>
                <li>• Unique customers</li>
                <li>• Unique terminals</li>
                <li>• Unique branch admins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supported Phrases:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "more than", "greater than"</li>
                <li>• "less than", "below"</li>
                <li>• "between X and Y"</li>
                <li>• "equals", "is exactly"</li>
                <li>• "at least" (≥), "at most" (≤)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </Main>
    </>
  )
}
