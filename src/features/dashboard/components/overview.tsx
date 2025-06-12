import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAgentTransactionVolume, useAgentTransactionCount } from '@/hooks/use-agents'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'

interface OverviewProps {
  agentId?: string
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters?: DateFilters
  mode?: 'amount' | 'count'
  chartType?: 'area' | 'bar'
}

export function Overview({ agentId, granularity = 'monthly', dateFilters = {}, mode = 'amount', chartType = 'area' }: OverviewProps) {
  const { theme } = useTheme()
  const { data: transactionVolume, isLoading: volumeLoading, error: volumeError } = useAgentTransactionVolume(
    agentId || '',
    { granularity, ...dateFilters },
    !!agentId
  )

  const { data: transactionCount, isLoading: countLoading, error: countError } = useAgentTransactionCount(
    agentId || '',
    { granularity, ...dateFilters },
    !!agentId
  )

  // Use the appropriate data based on mode
  const data = mode === 'amount' ? transactionVolume : transactionCount
  const isLoading = mode === 'amount' ? volumeLoading : countLoading
  const error = mode === 'amount' ? volumeError : countError

  // Get theme-appropriate colors
  const getChartColor = () => {
    switch (theme) {
      case 'dark':
        return '#60a5fa' // bright blue for dark mode
      case 'transflow-light':
        return '#08518A' // transflow blue
      case 'transflow-dark':
        return '#60a5fa' // bright blue for dark transflow
      default:
        return '#3b82f6' // default blue for light mode
    }
  }

  const chartColor = getChartColor()

  // Transform API data to chart format
  const chartData = data?.data
    ? data.data.labels.map((label, index) => ({
        name: label,
        total: data.data.values[index],
      }))
    : []

  if (isLoading) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <div className='text-muted-foreground'>Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <div className='text-muted-foreground'>Error loading chart data</div>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <div className='text-muted-foreground'>Please select an agent to view data</div>
      </div>
    )
  }

  const tooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Date
              </span>
              <span className="font-bold text-muted-foreground">
                {label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {mode === 'amount' ? 'Amount' : 'Count'}
              </span>
              <span className="font-bold">
                {mode === 'amount' ? `₵${payload[0].value?.toLocaleString()}` : payload[0].value?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      {chartType === 'area' ? (
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='name'
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => mode === 'amount' ? `₵${value.toLocaleString()}` : value.toLocaleString()}
          />
          <Tooltip content={tooltipContent} />
          <Area
            type="monotone"
            dataKey='total'
            stroke={chartColor}
            fillOpacity={1}
            fill="url(#fillTotal)"
          />
        </AreaChart>
      ) : (
        <BarChart data={chartData}>
          <XAxis
            dataKey='name'
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => mode === 'amount' ? `₵${value.toLocaleString()}` : value.toLocaleString()}
          />
          <Tooltip content={tooltipContent} />
          <Bar
            dataKey='total'
            fill={chartColor}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}
