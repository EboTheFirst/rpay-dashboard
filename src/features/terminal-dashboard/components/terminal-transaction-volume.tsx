import { useTerminalTransactionVolume, useTerminalTransactionCount } from '@/hooks/use-terminals'
import type { DateFilters } from '@/types/api'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/context/theme-context'

interface TerminalTransactionVolumeProps {
  terminalId: string
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
  mode: 'amount' | 'count'
  dateFilters: DateFilters
  chartType?: 'area' | 'bar'
}

export function TerminalTransactionVolume({
  terminalId,
  granularity,
  mode,
  dateFilters,
  chartType = 'area'
}: TerminalTransactionVolumeProps) {
  const { theme } = useTheme()

  const { data: volumeData, isLoading: volumeLoading } = useTerminalTransactionVolume(
    terminalId,
    granularity,
    dateFilters,
    !!terminalId
  )

  const { data: countData, isLoading: countLoading } = useTerminalTransactionCount(
    terminalId,
    granularity,
    dateFilters,
    !!terminalId
  )

  const isLoading = volumeLoading || countLoading

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  // Use the appropriate data based on mode
  const data = mode === 'amount' ? volumeData : countData
  const error = null // We'll handle errors in the parent component

  // Get theme-appropriate colors (matching other dashboard components)
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

  if (!data?.data || !data.data.labels || data.data.labels.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">No transaction data available</div>
      </div>
    )
  }

  // Transform the data from GraphPoints format to chart format (matching other dashboards)
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
