import { useMerchantTopBranches } from '@/hooks/use-branches'
import type { DateFilters } from '@/types/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Building2, ExternalLink } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

interface MerchantTopBranchesProps {
  merchantId: string
  mode: 'amount' | 'count'
  limit: number
  dateFilters: DateFilters
}

export function MerchantTopBranches({ 
  merchantId, 
  mode, 
  limit, 
  dateFilters 
}: MerchantTopBranchesProps) {
  const navigate = useNavigate()
  
  const { data: branchesData, isLoading, error } = useMerchantTopBranches(
    merchantId,
    mode,
    limit,
    dateFilters,
    !!merchantId
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error loading top branches
      </div>
    )
  }

  if (!branchesData || !branchesData.data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No branch data available
      </div>
    )
  }

  // Handle both array and object data structures
  const branches = Array.isArray(branchesData.data) 
    ? branchesData.data 
    : Object.values(branchesData.data).flat()

  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No branches found
      </div>
    )
  }

  const handleBranchClick = (branchId: string) => {
    navigate({
      to: `/merchants/${merchantId}/${branchId}`,
      search: { from: 'merchant-dashboard' }
    })
  }

  return (
    <div className='space-y-4'>
      {branches.slice(0, limit).map((branch: any, index: number) => {
        const initials = branch.branch_name
          ? branch.branch_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          : branch.branch_admin_id
            ? branch.branch_admin_id.substring(0, 2).toUpperCase()
            : `B${index + 1}`

        return (
          <div key={branch.branch_admin_id || index} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {branch.branch_name || branch.branch_admin_id || `Branch ${index + 1}`}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {branch.transaction_count || 0} transactions
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='font-medium'>
                  {mode === 'amount'
                    ? `₵${(branch.total_amount || 0).toLocaleString()}`
                    : `${branch.transaction_count || 0} txns`
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleBranchClick(branch.branch_admin_id)}
                  title="View branch details"
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
