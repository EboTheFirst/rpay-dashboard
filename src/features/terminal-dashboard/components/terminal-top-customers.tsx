import { useTerminalTopCustomers } from '@/hooks/use-terminals'
import type { DateFilters } from '@/types/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'

interface TerminalTopCustomersProps {
  terminalId: string
  mode: 'amount' | 'count'
  limit: number
  dateFilters: DateFilters
}

export function TerminalTopCustomers({
  terminalId,
  mode,
  limit,
  dateFilters
}: TerminalTopCustomersProps) {
  const { data, isLoading, error } = useTerminalTopCustomers(
    terminalId,
    { mode, limit, ...dateFilters },
    !!terminalId
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-1 items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Error loading customer data</div>
      </div>
    )
  }

  if (!terminalId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Please select a terminal to view data</div>
      </div>
    )
  }

  const customers = Array.isArray(data?.data) ? data.data : []

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No customer data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {customers.slice(0, limit).map((customer: any, index: number) => {
        // Generate initials from customer_id or use index
        const customerId = customer.customer_id || `Customer ${index + 1}`
        const initials = customerId
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'C'

        return (
          <div key={customer.customer_id || index} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {customer.customer_name || customer.customer_id || 'Unknown Customer'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {customer.transaction_count || 0} transactions
                </p>
              </div>
              <div className="font-medium">
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
