import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTerminalStats } from '@/hooks/use-terminals'
import type { DateFilters } from '@/types/api'
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react'

interface TerminalOverviewProps {
  terminalId: string
  dateFilters: DateFilters
}

export function TerminalOverview({ terminalId, dateFilters }: TerminalOverviewProps) {
  const { data: stats, isLoading, error } = useTerminalStats(
    terminalId,
    dateFilters,
    !!terminalId
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Error loading terminal statistics</div>
        </CardContent>
      </Card>
    )
  }

  if (!terminalId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Please select a terminal to view data</div>
        </CardContent>
      </Card>
    )
  }

  const statsArray = Array.isArray(stats) ? stats : []

  // Extract specific stats
  const totalValue = statsArray.find(s => s.metric.includes('Total Transaction Value'))?.value || 0
  const avgValue = statsArray.find(s => s.metric.includes('Average Transaction Value'))?.value || 0
  const totalCustomers = statsArray.find(s => s.metric.includes('Total Customers'))?.value || 0
  const totalTransactions = statsArray.find(s => s.metric.includes('Total Transactions'))?.value || 0

  const statsCards = [
    {
      title: 'Total Value',
      value: `₵${totalValue.toLocaleString()}`,
      description: 'Total transaction value',
      icon: DollarSign,
      trend: null
    },
    {
      title: 'Average Value',
      value: `₵${avgValue.toLocaleString()}`,
      description: 'Average transaction value',
      icon: TrendingUp,
      trend: null
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      description: 'Unique customers served',
      icon: Users,
      trend: null
    },
    {
      title: 'Total Transactions',
      value: totalTransactions.toLocaleString(),
      description: 'Total number of transactions',
      icon: Activity,
      trend: null
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
