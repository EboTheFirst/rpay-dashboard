import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAgentTopCustomers } from '@/hooks/use-agents'
import type { DateFilters } from '@/types/api'

interface RecentSalesProps {
  agentId?: string
  mode?: 'amount' | 'count'
  limit?: number
  dateFilters?: DateFilters
}

export function RecentSales({
  agentId,
  mode = 'amount',
  limit = 5,
  dateFilters = {}
}: RecentSalesProps) {
  const { data: topCustomers, isLoading, error } = useAgentTopCustomers(
    agentId || '',
    { mode, limit, ...dateFilters },
    !!agentId
  )

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <div className='h-9 w-9 rounded-full bg-muted animate-pulse' />
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <div className='h-4 w-24 bg-muted rounded animate-pulse' />
                <div className='h-3 w-32 bg-muted rounded animate-pulse' />
              </div>
              <div className='h-4 w-16 bg-muted rounded animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground'>Error loading customer data</div>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground'>Please select an agent to view data</div>
      </div>
    )
  }

  const customers = Array.isArray(topCustomers?.data) ? topCustomers.data : []

  if (customers.length === 0) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground'>No customer data available</div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {customers.slice(0, 5).map((customer: any, index: number) => {
        const initials = customer.customer_name
          ? customer.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          : customer.customer_id
            ? customer.customer_id.substring(0, 2).toUpperCase()
            : `C${index + 1}`

        return (
          <div key={customer.customer_id || index} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  {customer.customer_name || customer.customer_id || `Customer ${index + 1}`}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {customer.transaction_count || 0} transactions
                </p>
              </div>
              <div className='font-medium'>
                {mode === 'amount'
                  ? `₵${(customer.total_amount || 0).toLocaleString()}`
                  : `${customer.transaction_count || 0} txns`
                }
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
