import { useMerchantTransactionVolume, useMerchantTransactionCount } from '@/hooks/use-merchants'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MerchantOverviewProps {
  merchantId: string
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters: DateFilters
  mode?: 'amount' | 'count'
  chartType?: 'area' | 'bar'
}

export function MerchantOverview({ merchantId, granularity, dateFilters, mode = 'amount', chartType = 'area' }: MerchantOverviewProps) {
  const { theme } = useTheme()
  const { data: volumeData, isLoading: volumeLoading, error: volumeError } = useMerchantTransactionVolume(
    merchantId,
    granularity,
    dateFilters,
    !!merchantId
  )

  const { data: countData, isLoading: countLoading, error: countError } = useMerchantTransactionCount(
    merchantId,
    granularity,
    dateFilters,
    !!merchantId
  )

  // Use the appropriate data based on mode
  const data = mode === 'amount' ? volumeData : countData
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

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading transaction {mode === 'amount' ? 'volume' : 'count'}...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-destructive">Error loading transaction {mode === 'amount' ? 'volume' : 'count'}</div>
      </div>
    )
  }

  if (!data?.data || !data.data.labels || data.data.labels.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">No transaction data available</div>
      </div>
    )
  }

  // Transform the data from GraphPoints format to chart format
  const chartData = data.data.labels.map((label, index) => ({
    date: label,
    amount: data.data.values[index] || 0
  }))

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
    <ResponsiveContainer width="100%" height={300}>
      {chartType === 'area' ? (
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => mode === 'amount' ? `₵${value.toLocaleString()}` : value.toLocaleString()}
          />
          <Tooltip content={tooltipContent} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={chartColor}
            fillOpacity={1}
            fill="url(#fillAmount)"
          />
        </AreaChart>
      ) : (
        <BarChart data={chartData}>
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => mode === 'amount' ? `₵${value.toLocaleString()}` : value.toLocaleString()}
          />
          <Tooltip content={tooltipContent} />
          <Bar
            dataKey="amount"
            fill={chartColor}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}
