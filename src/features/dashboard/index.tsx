import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

import { DateFiltersComponent } from '@/components/date-filters'
import { ChannelFilter } from '@/components/channel-filter'
import { GranularitySelector } from '@/components/granularity-selector'
import { TopModeSelector } from '@/components/top-mode-selector'
import { ChartTypeSelector } from '@/components/chart-type-selector'
import { HeatmapModeSelector } from '@/components/heatmap-mode-selector'
import { FilterSummary } from '@/components/filter-summary'
import { FilterIndicator } from '@/components/filter-indicator'

import { ErrorBoundary } from '@/components/error-boundary'
import { ConnectionStatus } from '@/components/connection-status'
import { Users, Store } from 'lucide-react'
import { Overview } from './components/overview'
import { AgentTopCustomers } from './components/agent-top-customers'
import { TopMerchants } from './components/top-merchants'
import { MerchantActivityHeatmap } from './components/merchant-activity-heatmap'
import { TransactionFrequencyAnalysis } from './components/transaction-frequency-analysis'

import { agentDataExport, useAgentStats } from '@/hooks/use-agents'
import { useAgent } from '@/context/agent-context'
import type { DateFilters } from '@/types/api'

export default function Dashboard() {
  const { selectedAgent } = useAgent()
  const [dateFilters, setDateFilters] = useState<DateFilters>({})
  const [downloading, setDownloading] = useState<boolean>(false)
  const [downloadText, setDownloadText] = useState<string>("Download")
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')

  // Separate state for customers and merchants (limit is static at 5)
  const [customersMode, setCustomersMode] = useState<'amount' | 'count'>('amount')
  const [merchantsMode, setMerchantsMode] = useState<'amount' | 'count'>('amount')
  const [trendMode, setTrendMode] = useState<'amount' | 'count'>('amount')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [heatmapMode, setHeatmapMode] = useState<'volume' | 'count' | 'average'>('volume')
  const STATIC_LIMIT = 5

  const { data: agentStats, isLoading: statsLoading } = useAgentStats(
    selectedAgent,
    dateFilters,
    !!selectedAgent
  )

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

  const getFilterDescription = (filters: DateFilters): string => {
    if (Object.keys(filters).length === 0) {
      return 'All time'
    }

    const parts = []

    if (filters.year && filters.month) {
      const monthName = new Date(2024, filters.month - 1).toLocaleString('default', { month: 'long' })
      parts.push(`${monthName} ${filters.year}`)
    } else if (filters.year) {
      parts.push(`Year ${filters.year}`)
    } else if (filters.month) {
      const monthName = new Date(2024, filters.month - 1).toLocaleString('default', { month: 'long' })
      parts.push(`${monthName} (all years)`)
    }

    if (filters.range_days) {
      parts.push(`Last ${filters.range_days} days`)
    }

    if (filters.start_date && filters.end_date) {
      parts.push(`${filters.start_date} to ${filters.end_date}`)
    } else if (filters.start_date) {
      parts.push(`From ${filters.start_date}`)
    } else if (filters.end_date) {
      parts.push(`Until ${filters.end_date}`)
    }

    if (filters.week) {
      parts.push(`Week ${filters.week}`)
    }

    if (filters.day) {
      parts.push(`Day ${filters.day}`)
    }

    if (filters.channel) {
      parts.push(`Channel: ${filters.channel}`)
    }

    return parts.length > 0 ? parts.join(', ') : 'Filtered period'
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
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Agent Dashboard</h1>
              <p className='text-muted-foreground'>
                View analytics and gain insights
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <Button disabled={(downloading || downloadText.toLowerCase() != "download")} onClick={async () => {

                setDownloading(true);
                setDownloadText("Downloading");
                try {
                  await agentDataExport(selectedAgent, dateFilters)
                  setDownloading(false);
                  setDownloadText("Download");
                } catch (error) {
                  setDownloadText("Error")
                  setTimeout(() => {
                    setDownloadText("Download");
                    setDownloading(false);
                  }, 4000)
                }
                setDownloading(false);
              }}>{downloadText}</Button>
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
              {statsLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
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
              ) : agentStats && agentStats.length > 0 ? (
                // Real data - filter to show specific stats: Total Transaction Value, Average Transaction Value, Transaction Count, Unique Merchants
                agentStats.filter(stat =>
                  stat.metric.includes('Total Transaction Value') ||
                  stat.metric.includes('Average Transaction Value') ||
                  stat.metric.includes('Transaction Count') ||
                  stat.metric.includes('Unique Merchants')
                ).map((stat, index) => (
                  <Card key={stat.metric}>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <div className='flex flex-col space-y-1'>
                        <CardTitle className='text-sm font-medium'>
                          {stat.metric.replace(/\s*\(.*?\)\s*$/, '')}
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
                        {index === 3 && <path d='M2 3h6l2 4h9l-3 7H6l-2-4H2V3z' />}
                        {index === 3 && <circle cx='9' cy='19' r='1' />}
                        {index === 3 && <circle cx='20' cy='19' r='1' />}
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {stat.metric.includes('Value') || stat.metric.includes('Transaction Value')
                          ? `₵${stat.value.toLocaleString()}`
                          : stat.value.toLocaleString()}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {selectedAgent ? getFilterDescription(dateFilters) : 'Select an agent to view data'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // No agent selected or no data
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        {['Total Revenue', 'Average Transaction', 'Transactions', 'Merchants'][i]}
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
                          {i === 3 && <path d='M2 3h6l2 4h9l-3 7H6l-2-4H2V3z' />}
                          {i === 3 && <circle cx='9' cy='19' r='1' />}
                          {i === 3 && <circle cx='20' cy='19' r='1' />}
                        </svg>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold text-muted-foreground'>--</div>
                      <p className='text-muted-foreground text-xs'>
                        Select an agent to view data
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {/* Transaction Volume Chart - Full Width */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Transaction Trend Over Time</CardTitle>
                    <CardDescription>
                      {granularity.charAt(0).toUpperCase() + granularity.slice(1)} transaction {trendMode === 'amount' ? 'value' : 'volume'} for the selected agent
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
                  <Overview
                    agentId={selectedAgent}
                    granularity={granularity}
                    dateFilters={dateFilters}
                    mode={trendMode}
                    chartType={chartType}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Top Customers and Top Merchants Row */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        Top 5 Customers
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            window.open(`/customers`, '_blank')
                          }}
                          title="View all customers for this agent"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          View All
                        </Button>
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
                    <AgentTopCustomers
                      agentId={selectedAgent}
                      mode={customersMode}
                      limit={STATIC_LIMIT}
                      dateFilters={dateFilters}
                    />
                  </ErrorBoundary>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        Top 5 Merchants
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            window.open(`/merchants`, '_blank')
                          }}
                          title="View all merchants for this agent"
                        >
                          <Store className="h-3 w-3 mr-1" />
                          View All
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Highest value merchants by {merchantsMode === 'amount' ? 'transaction amount' : 'transaction count'}
                      </CardDescription>
                    </div>
                    <div className='flex-shrink-0'>
                      <TopModeSelector
                        mode={merchantsMode}
                        onModeChange={setMerchantsMode}
                        label="Sort By"
                        className="min-w-[120px]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <TopMerchants
                      agentId={selectedAgent}
                      mode={merchantsMode}
                      limit={STATIC_LIMIT}
                      dateFilters={dateFilters}
                    />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Merchant Activity Heatmap - Full Width */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>
                      Merchant Activity - {heatmapMode === 'volume' ? 'Transaction Volume' : heatmapMode === 'count' ? 'Transaction Count' : 'Average Value'}
                    </CardTitle>
                    <CardDescription>
                      {granularity.charAt(0).toUpperCase() + granularity.slice(1)} merchant activity patterns for the selected agent
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <HeatmapModeSelector
                      value={heatmapMode}
                      onValueChange={setHeatmapMode}
                      label="Metric"
                      className="min-w-[140px]"
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
              <CardContent>
                <ErrorBoundary>
                  <MerchantActivityHeatmap
                    agentId={selectedAgent}
                    granularity={granularity}
                    dateFilters={dateFilters}
                    mode={heatmapMode}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Transaction Frequency Analysis - Full Width */}
            <ErrorBoundary>
              <TransactionFrequencyAnalysis
                agentId={selectedAgent}
                dateFilters={dateFilters}
              />
            </ErrorBoundary>
          </div>
        </ConnectionStatus>
      </Main>
    </>
  )
}


