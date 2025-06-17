import { useBranchTransactionVolume, useBranchTransactionCount } from '@/hooks/use-branches'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface BranchOverviewProps {
  branchId: string
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters: DateFilters
  mode?: 'amount' | 'count'
  chartType?: 'area' | 'bar'
}

export function BranchOverview({ branchId, granularity, dateFilters, mode = 'amount', chartType = 'area' }: BranchOverviewProps) {
  const { theme } = useTheme()
  const { data: volumeData, isLoading: volumeLoading, error: volumeError } = useBranchTransactionVolume(
    branchId,
    granularity,
    dateFilters,
    !!branchId
  )

  const { data: countData, isLoading: countLoading, error: countError } = useBranchTransactionCount(
    branchId,
    granularity,
    dateFilters,
    !!branchId
  )

  const isLoading = volumeLoading || countLoading
  const error = volumeError || countError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>Error loading chart data</p>
      </div>
    )
  }

  // Combine volume and count data
  const chartData = []
  const volumeLabels = volumeData?.data?.labels || []
  const volumeValues = volumeData?.data?.values || []
  const countValues = countData?.data?.values || []

  for (let i = 0; i < volumeLabels.length; i++) {
    chartData.push({
      date: volumeLabels[i],
      amount: mode === 'amount' ? (volumeValues[i] || 0) : (countValues[i] || 0)
    })
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No data available for the selected period</p>
      </div>
    )
  }

  const chartColor = theme === 'dark' ? '#08518A' : '#08518A'

  const tooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            {mode === 'amount' 
              ? `₵${payload[0].value.toLocaleString()}`
              : `${payload[0].value.toLocaleString()} transactions`
            }
          </p>
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
