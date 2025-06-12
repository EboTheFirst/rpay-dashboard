import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useAgentTransactionCount } from '@/hooks/use-agents'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'

interface TransactionCountChartProps {
  agentId?: string
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dateFilters?: DateFilters
}

export function TransactionCountChart({
  agentId,
  granularity = 'monthly',
  dateFilters = {}
}: TransactionCountChartProps) {
  const { theme } = useTheme()
  const { data: transactionCount, isLoading, error } = useAgentTransactionCount(
    agentId || '',
    { granularity, ...dateFilters },
    !!agentId
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

  // Transform API data to chart format
  const chartData = transactionCount?.data
    ? transactionCount.data.labels.map((label, index) => ({
        name: label,
        count: transactionCount.data.values[index],
      }))
    : []

  if (isLoading) {
    return (
      <div className='flex h-[300px] items-center justify-center'>
        <div className='text-muted-foreground'>Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-[300px] items-center justify-center'>
        <div className='text-muted-foreground'>Error loading chart data</div>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div className='flex h-[300px] items-center justify-center'>
        <div className='text-muted-foreground'>Please select an agent to view data</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={chartData}>
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
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className='rounded-lg border bg-background p-2 shadow-sm'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Period
                      </span>
                      <span className='font-bold text-muted-foreground'>
                        {label}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Transactions
                      </span>
                      <span className='font-bold'>
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
        <Line
          type='monotone'
          dataKey='count'
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: chartColor, opacity: 0.25 },
          }}
          style={{
            stroke: chartColor,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
