import React, { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Monitor } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DateFiltersComponent } from '@/components/date-filters'
import { ChannelFilter } from '@/components/channel-filter'
import { GranularitySelector } from '@/components/granularity-selector'
import { TopModeSelector } from '@/components/top-mode-selector'
import { ChartTypeSelector } from '@/components/chart-type-selector'
import { FilterSummary } from '@/components/filter-summary'
import { FilterIndicator } from '@/components/filter-indicator'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConnectionStatus } from '@/components/connection-status'
import type { DateFilters } from '@/types/api'

// Import terminal dashboard components
import { TerminalOverview } from './components/terminal-overview'
import { TerminalTopCustomers } from './components/terminal-top-customers'
import { TerminalTransactionFrequencyAnalysis } from './components/terminal-transaction-frequency-analysis'
import { TerminalTransactionVolume } from './components/terminal-transaction-volume'
import { TerminalStats } from './components/terminal-stats'
import { useTerminalStats, useTerminalDetails } from '@/hooks/use-terminals'

const STATIC_LIMIT = 5

export function TerminalDashboard() {
  const { merchantId, branchId, terminalId } = useParams({ strict: false })
  const navigate = useNavigate()

  // State for filters and modes
  const [dateFilters, setDateFilters] = useState<DateFilters>({})
  const [customersMode, setCustomersMode] = useState<'amount' | 'count'>('amount')
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [trendMode, setTrendMode] = useState<'amount' | 'count'>('amount')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const { data: terminalStats, isLoading: statsLoading } = useTerminalStats(
    terminalId as string,
    dateFilters,
    !!terminalId
  )

  const { data: terminalDetails } = useTerminalDetails(terminalId as string, !!terminalId)

  const clearFilters = () => {
    setDateFilters({})
  }

  const clearSingleFilter = (key: keyof DateFilters) => {
    setDateFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  // Helper function to render stats cards
  const renderStatsCards = () => {
    if (statsLoading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='h-4 w-24 bg-muted rounded animate-pulse' />
            <div className='h-4 w-4 bg-muted rounded animate-pulse' />
          </CardHeader>
          <CardContent>
            <div className='h-8 w-32 bg-muted rounded animate-pulse mb-2' />
            <div className='h-3 w-24 bg-muted rounded animate-pulse' />
          </CardContent>
        </Card>
      ))
    }

    if (terminalStats && terminalStats.length > 0) {
      const filteredStats = terminalStats.filter(stat =>
        stat.metric.includes('Total Transaction Value') ||
        stat.metric.includes('Average Transaction Value') ||
        stat.metric.includes('Total Transactions') ||  // Fixed: API returns "Total Transactions", not "Transaction Count"
        stat.metric.includes('Total Customers')
      )

      // Ensure we always have 4 cards by adding defaults if needed
      const defaultStats = [
        { metric: 'Total Transaction Value', value: 0 },
        { metric: 'Average Transaction Value', value: 0 },
        { metric: 'Total Transactions', value: 0 },
        { metric: 'Total Customers', value: 0 }
      ]

      const statsToShow = [...filteredStats]
      defaultStats.forEach(defaultStat => {
        if (!statsToShow.find(stat => stat.metric.includes(defaultStat.metric.split(' ')[0]))) {
          statsToShow.push(defaultStat)
        }
      })

      return statsToShow.slice(0, 4).map((stat, index) => (
        <Card key={stat.metric}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='flex flex-col space-y-1'>
              <CardTitle className='text-sm font-medium'>
                {stat.metric.replace(/\s*\(.*?\)\s*$/, '').replace('Total Transactions', 'Transaction Count')}
              </CardTitle>
              <FilterIndicator dateFilters={dateFilters} />
            </div>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='text-muted-foreground h-4 w-4'
            >
              {index === 0 && <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />}
              {index === 1 && <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />}
              {index === 1 && <circle cx='9' cy='7' r='4' />}
              {index === 2 && <rect width='20' height='14' x='2' y='5' rx='2' />}
              {index === 2 && <path d='M2 10h20' />}
              {index === 3 && <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />}
              {index === 3 && <circle cx='9' cy='7' r='4' />}
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stat.metric.includes('Value') || stat.metric.includes('Transaction Value')
                ? `₵${stat.value.toLocaleString()}`
                : stat.value.toLocaleString()}
            </div>
            <p className='text-muted-foreground text-xs'>
              {Object.keys(dateFilters).length === 0 ? 'All time' : 'Filtered period'}
            </p>
          </CardContent>
        </Card>
      ))
    }

    // No data fallback
    return Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {['Total Revenue', 'Average Transaction', 'Transaction Count', 'Total Customers'][i]}
          </CardTitle>
          <div className='text-muted-foreground h-4 w-4 opacity-50'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
            >
              {i === 0 && <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />}
              {i === 1 && <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />}
              {i === 2 && <rect width='20' height='14' x='2' y='5' rx='2' />}
              {i === 3 && <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />}
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-muted-foreground'>--</div>
          <p className='text-muted-foreground text-xs'>
            No data available
          </p>
        </CardContent>
      </Card>
    ))
  }

  if (!terminalId) {
    return (
      <>
        <Header>
          <div className='ml-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="text-center py-8">
            <p className="text-destructive">Terminal ID is required</p>
          </div>
        </Main>
      </>
    )
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
        <ConnectionStatus>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: `/merchants/${merchantId}/${branchId}` })}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Branch Dashboard
              </Button>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  Terminal {terminalId}
                </h1>
                <p className='text-muted-foreground'>
                  {terminalDetails?.branch_name ? (
                    <>Terminal of {terminalDetails.branch_name}</>
                  ) : (
                    'View analytics and insights for this terminal'
                  )}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button>Download</Button>
            </div>
          </div>

          {/* Filters Section */}
          <ErrorBoundary>
            <div className='flex gap-4 flex-wrap'>
              <div className='max-w-md'>
                <DateFiltersComponent
                  filters={dateFilters}
                  onFiltersChange={setDateFilters}
                  onClear={clearFilters}
                />
              </div>
              <div className='max-w-xs'>
                <ChannelFilter
                  filters={dateFilters}
                  onFiltersChange={setDateFilters}
                  onClear={() => {
                    const { channel, ...restFilters } = dateFilters
                    setDateFilters(restFilters)
                  }}
                />
              </div>
            </div>
          </ErrorBoundary>

          {/* Filter Summary */}
          <FilterSummary
            dateFilters={dateFilters}
            onClearFilter={clearSingleFilter}
            onClearAll={clearFilters}
          />

          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {renderStatsCards()}
            </div>

            {/* Transaction Volume Chart - Full Width */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Transaction Trend Over Time</CardTitle>
                    <CardDescription>
                      {granularity.charAt(0).toUpperCase() + granularity.slice(1)} transaction {trendMode === 'amount' ? 'value' : 'volume'} for this terminal
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <ChartTypeSelector
                      value={chartType}
                      onValueChange={setChartType}
                      label="Type"
                      className="min-w-[100px]"
                    />
                    <TopModeSelector
                      mode={trendMode}
                      onModeChange={setTrendMode}
                      label="Show"
                      className="min-w-[120px]"
                    />
                    <GranularitySelector
                      value={granularity}
                      onValueChange={setGranularity}
                      label="Granularity"
                      className="min-w-[120px]"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pl-2'>
                <ErrorBoundary>
                  <TerminalTransactionVolume
                    terminalId={terminalId}
                    granularity={granularity}
                    mode={trendMode}
                    dateFilters={dateFilters}
                    chartType={chartType}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Top Customers and Terminal Stats Row */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        Top 5 Customers
                      </CardTitle>
                      <CardDescription>
                        Highest value customers by {customersMode === 'amount' ? 'transaction amount' : 'transaction count'}
                      </CardDescription>
                    </div>
                    <div className='flex-shrink-0'>
                      <TopModeSelector
                        mode={customersMode}
                        onModeChange={setCustomersMode}
                        label="Sort By"
                        className="min-w-[120px]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <TerminalTopCustomers
                      terminalId={terminalId}
                      mode={customersMode}
                      limit={STATIC_LIMIT}
                      dateFilters={dateFilters}
                    />
                  </ErrorBoundary>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Terminal Statistics</CardTitle>
                  <CardDescription>
                    Key performance metrics for this terminal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <TerminalStats
                      terminalId={terminalId}
                      dateFilters={dateFilters}
                    />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Frequency Analysis - Full Width */}
            <div className="col-span-full">
              <ErrorBoundary>
                <TerminalTransactionFrequencyAnalysis
                  terminalId={terminalId}
                  dateFilters={dateFilters}
                />
              </ErrorBoundary>
            </div>
          </div>
        </ConnectionStatus>
      </Main>
    </>
  )
}
