import { useMerchantTopCustomers } from '@/hooks/use-merchants'
import type { DateFilters } from '@/types/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface MerchantTopCustomersProps {
  merchantId: string
  mode: 'amount' | 'count'
  limit: number
  dateFilters: DateFilters
}

export function MerchantTopCustomers({ 
  merchantId, 
  mode, 
  limit, 
  dateFilters 
}: MerchantTopCustomersProps) {
  const { data: customersData, isLoading, error } = useMerchantTopCustomers(
    merchantId,
    mode,
    limit,
    dateFilters,
    !!merchantId
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="ml-4 space-y-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="ml-auto h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Error loading top customers</div>
      </div>
    )
  }

  const customers = Array.isArray(customersData?.data) ? customersData.data : []

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No customer data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {customers.slice(0, limit).map((customer: any, index: number) => (
        <div key={customer.customer_id || index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {customer.customer_id ? customer.customer_id.slice(0, 2).toUpperCase() : 'CU'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {customer.customer_name || customer.customer_id || 'Unknown Customer'}
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === 'amount'
                ? `${customer.transaction_count || 0} transactions`
                : `₵${(customer.total_amount || 0).toLocaleString()}`
              }
            </p>
          </div>
          <div className="ml-auto font-medium">
            {mode === 'amount'
              ? `₵${(customer.total_amount || 0).toLocaleString()}`
              : `${customer.transaction_count || 0}`
            }
          </div>
        </div>
      ))}
    </div>
  )
}
