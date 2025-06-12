import { useMerchantTransactionCount } from '@/hooks/use-merchants'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MerchantTransactionCountChartProps {
  merchantId: string
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters: DateFilters
}

export function MerchantTransactionCountChart({
  merchantId,
  granularity,
  dateFilters
}: MerchantTransactionCountChartProps) {
  const { theme } = useTheme()
  const { data: countData, isLoading, error } = useMerchantTransactionCount(
    merchantId,
    granularity,
    dateFilters,
    !!merchantId
  )

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
        <div className="text-muted-foreground">Loading transaction count...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-destructive">Error loading transaction count</div>
      </div>
    )
  }

  if (!countData?.data || !countData.data.labels || countData.data.labels.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">No transaction count data available</div>
      </div>
    )
  }

  // Transform the data from GraphPoints format to chart format
  const chartData = countData.data.labels.map((label, index) => ({
    date: label,
    count: countData.data.values[index] || 0
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
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
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          content={({ active, payload, label }) => {
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
                        Count
                      </span>
                      <span className="font-bold">
                        {payload[0].value?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey="count"
          fill={chartColor}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
