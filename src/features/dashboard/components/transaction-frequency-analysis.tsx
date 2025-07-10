import { useState } from 'react'
import { useAgentTransactionFrequencyAnalysis } from '@/hooks/use-agents'
import { useTheme } from '@/context/theme-context'
import type { DateFilters } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Clock, Calendar, TrendingUp, Activity } from 'lucide-react'

interface TransactionFrequencyAnalysisProps {
  agentId?: string
  dateFilters?: DateFilters
}

interface FrequencyData {
  summary: Array<{ metric: string; value: number }>
  day_of_week: Array<{ day_of_week: string; transaction_count: number }>
  hour_of_day: Array<{ hour_of_day: number; transaction_count: number }>
  month_of_year: Array<{ month_of_year: string; transaction_count: number }>
  quarter_of_year: Array<{ quarter_of_year: string; transaction_count: number }>
}

export function TransactionFrequencyAnalysis({
  agentId,
  dateFilters = {}
}: TransactionFrequencyAnalysisProps) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('summary')

  const { data: frequencyData, isLoading, error } = useAgentTransactionFrequencyAnalysis(
    agentId || '',
    dateFilters,
    !!agentId
  )

  // Get theme-appropriate colors
  const getChartColor = () => {
    switch (theme) {
      case 'dark':
        return '#60a5fa'
      case 'transflow-light':
        return '#08518A'
      case 'transflow-dark':
        return '#60a5fa'
      default:
        return '#3b82f6'
    }
  }

  const chartColor = getChartColor()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Frequency Analysis
          </CardTitle>
          <CardDescription>
            Analyze transaction patterns by time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-muted-foreground'>Loading frequency analysis...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Frequency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-muted-foreground'>Error loading frequency analysis</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!agentId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Frequency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-muted-foreground'>Please select an agent to view frequency analysis</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = frequencyData?.data as FrequencyData

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Frequency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-muted-foreground'>No frequency data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format hour data for better display
  const hourData = data.hour_of_day?.map(item => ({
    hour: `${item.hour_of_day}:00`,
    count: item.transaction_count
  })) || []

  // Day of week data with proper ordering
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayData = dayOrder.map(day => {
    const found = data.day_of_week?.find(item => item.day_of_week === day)
    return {
      day: day.slice(0, 3), // Abbreviate day names
      count: found?.transaction_count || 0
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction Frequency Analysis
        </CardTitle>
        <CardDescription>
          Analyze transaction patterns by time periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="hourly" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Hourly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Quarterly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.summary?.map((stat, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="text-2xl font-bold">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() || 0 : stat.value || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.metric}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayData}>
                  <XAxis
                    dataKey="day"
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
                                  Day
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Transactions
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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {dayData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourData}>
                  <XAxis
                    dataKey="hour"
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
                                  Hour
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Transactions
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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {hourData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.month_of_year?.map(item => ({
                  month: item.month_of_year.slice(0, 3), // Abbreviate month names
                  count: item.transaction_count
                }))}>
                  <XAxis
                    dataKey="month"
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
                                  Month
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Transactions
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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.month_of_year?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.quarter_of_year?.map(item => ({
                  quarter: item.quarter_of_year,
                  count: item.transaction_count
                }))}>
                  <XAxis
                    dataKey="quarter"
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
                                  Quarter
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Transactions
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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.quarter_of_year?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
