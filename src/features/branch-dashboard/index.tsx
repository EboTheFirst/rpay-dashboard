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
import { ArrowLeft, Monitor } from 'lucide-react'
import { BranchOverview } from './components/branch-overview'
import { BranchTopCustomers } from './components/branch-top-customers'
import { BranchTopTerminals } from './components/branch-top-terminals'
import { BranchTerminalActivityHeatmap } from './components/branch-terminal-activity-heatmap'
import { BranchTransactionFrequencyAnalysis } from './components/branch-transaction-frequency-analysis'
import { useBranchStats, useBranchDetails } from '@/hooks/use-branches'
import type { DateFilters } from '@/types/api'
import { useNavigate } from '@tanstack/react-router'
import { useTeam } from '@/context/team-context'

interface BranchDashboardProps {
  branchId: string
  merchantId?: string
}

export default function BranchDashboard({ branchId, merchantId }: BranchDashboardProps) {
  const navigate = useNavigate()
  const { navigationContext, selectedTeam } = useTeam()
  const [dateFilters, setDateFilters] = useState<DateFilters>({})
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [customersMode, setCustomersMode] = useState<'amount' | 'count'>('amount')
  const [terminalsMode, setTerminalsMode] = useState<'amount' | 'count'>('amount')
  const [trendMode, setTrendMode] = useState<'amount' | 'count'>('amount')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [heatmapMode, setHeatmapMode] = useState<'volume' | 'count' | 'average'>('volume')
  const STATIC_LIMIT = 5

  // Determine if back button should be shown
  // Show back button only for hierarchical navigation or when not in RPAY Branch team context
  const shouldShowBackButton = navigationContext === 'hierarchical' || selectedTeam !== 'RPAY Branch'

  const { data: branchStats, isLoading: statsLoading } = useBranchStats(
    branchId,
    dateFilters,
    !!branchId
  )

  const { data: branchDetails, isLoading: detailsLoading } = useBranchDetails(
    branchId,
    !!branchId
  )

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
              {shouldShowBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: merchantId ? `/merchants/${merchantId}` : branchDetails?.merchant_id ? `/merchants/${branchDetails.merchant_id}` : '/' })}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Merchant Dashboard
                </Button>
              )}
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  {branchDetails?.branch_name ? (
                    <>
                      {branchDetails.branch_name}
                      <span className="text-lg font-normal text-muted-foreground ml-2">
                        ({branchId})
                      </span>
                    </>
                  ) : (
                    `Branch ${branchId}`
                  )}
                </h1>
                <p className='text-muted-foreground'>
                  {branchDetails?.merchant_name ? (
                    <>Branch of {branchDetails.merchant_name}</>
                  ) : (
                    'View analytics and insights for this branch'
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
                onClear={() => setDateFilters({})}
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
          onClearFilter={(key) => {
            const { [key]: _, ...rest } = dateFilters
            setDateFilters(rest)
          }}
          onClearAll={() => setDateFilters({})}
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
              ) : branchStats && branchStats.length > 0 ? (
                // Real data - filter to show specific stats: Total Transaction Value, Average Transaction Value, Max Transaction Value, Total Terminals
                branchStats.filter(stat =>
                  stat.metric.includes('Total Transaction Value') ||
                  stat.metric.includes('Average Transaction Value') ||
                  stat.metric.includes('Transaction Count') ||
                  stat.metric.includes('Total Terminals')
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
                        {index === 3 && <rect x='2' y='3' width='20' height='14' rx='2' ry='2' />}
                        {index === 3 && <line x1='8' y1='21' x2='16' y2='21' />}
                        {index === 3 && <line x1='12' y1='17' x2='12' y2='21' />}
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
              ) : (
                // No data
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        {['Total Revenue', 'Average Transaction', 'Max Transaction', 'Total Terminals'][i]}
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
                          {i === 2 && <path d='M22 12h-4l-3 9L9 3l-3 9H2' />}
                          {i === 3 && <rect x='2' y='3' width='20' height='14' rx='2' ry='2' />}
                          {i === 3 && <line x1='8' y1='21' x2='16' y2='21' />}
                          {i === 3 && <line x1='12' y1='17' x2='12' y2='21' />}
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
              )}
            </div>

            {/* Transaction Volume Chart - Full Width */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Transaction Trend Over Time</CardTitle>
                    <CardDescription>
                      {granularity.charAt(0).toUpperCase() + granularity.slice(1)} transaction {trendMode === 'amount' ? 'value' : 'volume'} for this branch
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
                  <BranchOverview
                    branchId={branchId}
                    granularity={granularity}
                    dateFilters={dateFilters}
                    mode={trendMode}
                    chartType={chartType}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Top Customers and Top Terminals Row */}
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
                    <BranchTopCustomers
                      branchId={branchId}
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
                        Top 5 Terminals
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => navigate({ to: `/branches/${branchId}/terminals` })}
                          title="View all terminals for this branch"
                        >
                          <Monitor className="h-3 w-3 mr-1" />
                          View All
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Highest value terminals by {terminalsMode === 'amount' ? 'transaction amount' : 'transaction count'}
                      </CardDescription>
                    </div>
                    <div className='flex-shrink-0'>
                      <TopModeSelector
                        mode={terminalsMode}
                        onModeChange={setTerminalsMode}
                        label="Sort By"
                        className="min-w-[120px]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <BranchTopTerminals
                      branchId={branchId}
                      merchantId={branchDetails?.merchant_id}
                      mode={terminalsMode}
                      limit={STATIC_LIMIT}
                      dateFilters={dateFilters}
                    />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Terminal Activity Heatmap - Full Width */}
            <Card className="col-span-full">
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>
                      Terminal Activity - {heatmapMode === 'volume' ? 'Transaction Volume' : heatmapMode === 'count' ? 'Transaction Count' : 'Average Value'}
                    </CardTitle>
                    <CardDescription>
                      {granularity.charAt(0).toUpperCase() + granularity.slice(1)} terminal activity patterns for this branch
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
                  <BranchTerminalActivityHeatmap
                    branchId={branchId}
                    granularity={granularity}
                    dateFilters={dateFilters}
                    mode={heatmapMode}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Transaction Frequency Analysis - Full Width */}
            <div className="col-span-full">
              <ErrorBoundary>
                <BranchTransactionFrequencyAnalysis
                  branchId={branchId}
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
