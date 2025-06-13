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
import { GranularitySelector } from '@/components/granularity-selector'
import { TopModeSelector } from '@/components/top-mode-selector'
import { ChartTypeSelector } from '@/components/chart-type-selector'
import { FilterSummary } from '@/components/filter-summary'
import { FilterIndicator } from '@/components/filter-indicator'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConnectionStatus } from '@/components/connection-status'
import { ArrowLeft } from 'lucide-react'
import { MerchantOverview } from './components/merchant-overview'
import { MerchantTopCustomers } from './components/merchant-top-customers'
import { MerchantTransactionFrequencyAnalysis } from './components/merchant-transaction-frequency-analysis'
import { useMerchantStats, useMerchantDetails } from '@/hooks/use-merchants'
import type { DateFilters } from '@/types/api'
import { useNavigate } from '@tanstack/react-router'

interface MerchantDashboardProps {
  merchantId: string
}

export default function MerchantDashboard({ merchantId }: MerchantDashboardProps) {
  const navigate = useNavigate()
  const [dateFilters, setDateFilters] = useState<DateFilters>({})
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [customersMode, setCustomersMode] = useState<'amount' | 'count'>('amount')
  const [trendMode, setTrendMode] = useState<'amount' | 'count'>('amount')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const STATIC_LIMIT = 5

  const { data: merchantStats, isLoading: statsLoading } = useMerchantStats(
    merchantId,
    dateFilters,
    !!merchantId
  )

  const { data: merchantDetails } = useMerchantDetails(merchantId, !!merchantId)

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

    return parts.length > 0 ? parts.join(', ') : 'Filtered period'
  }

  console.log("Merchant Details: ", merchantDetails)

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
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  {merchantDetails?.merchant_name ? (
                    <>
                      {merchantDetails.merchant_name}
                      <span className="text-lg font-normal text-muted-foreground ml-2">
                        ({merchantId})
                      </span>
                    </>
                  ) : (
                    `Merchant ${merchantId}`
                  )}
                </h1>
                <p className='text-muted-foreground'>
                  View analytics and insights for this merchant
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button>Download</Button>
            </div>
          </div>
        {/* Date Filters Section */}
        <ErrorBoundary>
          <div className='max-w-md'>
            <DateFiltersComponent
              filters={dateFilters}
              onFiltersChange={setDateFilters}
              onClear={clearFilters}
            />
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
              ) : merchantStats && merchantStats.length > 0 ? (
                // Real data - filter to show specific stats: Total Transaction Value, Average Transaction Value, Max Transaction Value, Total Branches
                merchantStats.filter(stat =>
                  stat.metric.includes('Total Transaction Value') ||
                  stat.metric.includes('Average Transaction Value') ||
                  stat.metric.includes('Max Transaction Value') ||
                  stat.metric.includes('Total Branches')
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
                        {index === 3 && <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />}
                        {index === 3 && <polyline points='9,9 9,13 15,13 15,9' />}
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {stat.metric.includes('Value') || stat.metric.includes('Transaction Value')
                          ? `₵${stat.value.toLocaleString()}`
                          : stat.value.toLocaleString()}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {getFilterDescription(dateFilters)}
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
                        {['Total Revenue', 'Average Transaction', 'Max Transaction', 'Total Branches'][i]}
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
                          {i === 3 && <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />}
                          {i === 3 && <polyline points='9,9 9,13 15,13 15,9' />}
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
                      {granularity.charAt(0).toUpperCase() + granularity.slice(1)} transaction {trendMode === 'amount' ? 'value' : 'volume'} for this merchant
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
                  <MerchantOverview
                    merchantId={merchantId}
                    granularity={granularity}
                    dateFilters={dateFilters}
                    mode={trendMode}
                    chartType={chartType}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Top Customers */}
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
                  <MerchantTopCustomers
                    merchantId={merchantId}
                    mode={customersMode}
                    limit={STATIC_LIMIT}
                    dateFilters={dateFilters}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Transaction Frequency Analysis - Full Width */}
            <ErrorBoundary>
              <MerchantTransactionFrequencyAnalysis
                merchantId={merchantId}
                dateFilters={dateFilters}
              />
            </ErrorBoundary>
        </div>
        </ConnectionStatus>
      </Main>
    </>
  )
}


