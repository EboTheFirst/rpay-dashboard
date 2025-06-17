import { useBranchTopTerminals } from '@/hooks/use-branches'
import type { DateFilters } from '@/types/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Monitor } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

interface BranchTopTerminalsProps {
  branchId: string
  mode: 'amount' | 'count'
  limit: number
  dateFilters: DateFilters
}

export function BranchTopTerminals({ branchId, mode, limit, dateFilters }: BranchTopTerminalsProps) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useBranchTopTerminals(
    branchId,
    mode,
    limit,
    dateFilters,
    !!branchId
  )

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <div className='h-9 w-9 bg-muted rounded-full animate-pulse' />
            <div className='flex-1 space-y-2'>
              <div className='h-4 w-24 bg-muted rounded animate-pulse' />
              <div className='h-3 w-16 bg-muted rounded animate-pulse' />
            </div>
            <div className='h-4 w-16 bg-muted rounded animate-pulse' />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Error loading top terminals</p>
      </div>
    )
  }

  if (!data?.data || (Array.isArray(data.data) && data.data.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No terminals found</p>
      </div>
    )
  }

  const terminals = Array.isArray(data.data) ? data.data : [data.data]

  return (
    <div className='space-y-4'>
      {terminals.map((terminal, index) => {
        // Generate initials from terminal_id or use index
        const terminalId = terminal.terminal_id || `Terminal ${index + 1}`
        const initials = terminalId
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'T'

        return (
          <div key={terminal.terminal_id || index} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {terminal.terminal_name || terminal.terminal_id || `Terminal ${index + 1}`}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {terminal.transaction_count || 0} transactions
                </p>
              </div>
              <div className='font-medium'>
                {mode === 'amount'
                  ? `₵${(terminal.total_amount || 0).toLocaleString()}`
                  : `${terminal.transaction_count || 0} txns`
                }
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
