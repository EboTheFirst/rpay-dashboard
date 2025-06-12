import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useAgentTopMerchants } from '@/hooks/use-agents'
import type { DateFilters } from '@/types/api'

interface TopMerchantsProps {
  agentId?: string
  mode?: 'amount' | 'count'
  limit?: number
  dateFilters?: DateFilters
}

export function TopMerchants({
  agentId,
  mode = 'amount',
  limit = 5,
  dateFilters = {}
}: TopMerchantsProps) {
  const { data: topMerchants, isLoading, error } = useAgentTopMerchants(
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
      <div className='flex h-[200px] items-center justify-center'>
        <div className='text-muted-foreground text-sm'>
          Failed to load top merchants data
        </div>
      </div>
    )
  }

  if (!topMerchants?.data || !Array.isArray(topMerchants.data) || topMerchants.data.length === 0) {
    return (
      <div className='flex h-[200px] items-center justify-center'>
        <div className='text-muted-foreground text-sm'>
          {agentId ? 'No merchant data available' : 'Select an agent to view top merchants'}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {topMerchants.data.map((merchant: any, index: number) => {
        const initials = merchant.merchant_name
          ? merchant.merchant_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          : merchant.merchant_id
            ? merchant.merchant_id.substring(0, 2).toUpperCase()
            : `M${index + 1}`

        return (
          <div key={merchant.merchant_id || index} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {merchant.merchant_name || merchant.merchant_id || `Merchant ${index + 1}`}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {merchant.transaction_count || 0} transactions
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='font-medium'>
                  {mode === 'amount'
                    ? `₵${(merchant.total_amount || 0).toLocaleString()}`
                    : `${merchant.transaction_count || 0} txns`
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    // Navigate to merchant detail page
                    window.open(`/merchants/${merchant.merchant_id}`, '_blank')
                  }}
                  title="View merchant details"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
