import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useBranchList } from '@/hooks/use-branches'
import { useTeam } from '@/context/team-context'

interface BranchSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function BranchSelector({
  value,
  onValueChange,
  placeholder = 'Select branch...',
}: BranchSelectorProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setNavigationContext } = useTeam()
  const { data: branches = [], isLoading, error } = useBranchList()

  const selectedBranch = branches.find((branch) => branch.branch_admin_id === value)

  const handleBranchSelect = (branchId: string) => {
    const newValue = branchId === value ? '' : branchId
    onValueChange(newValue)
    setOpen(false)

    // Navigate to branch dashboard if a branch is selected
    if (newValue) {
      // Set navigation context to 'direct' since this is team-based access
      setNavigationContext('direct')
      navigate({ to: `/branches/${newValue}` })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between branch-selector-button'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loading...
            </>
          ) : selectedBranch ? (
            selectedBranch.branch_name || selectedBranch.branch_admin_id
          ) : error ? (
            'Error loading branches'
          ) : (
            placeholder
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search branches...' />
          <CommandList>
            {isLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2 text-sm text-muted-foreground'>Loading branches...</span>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center py-6'>
                <span className='text-sm text-muted-foreground'>Error loading branches</span>
              </div>
            ) : branches.length === 0 ? (
              <CommandEmpty>No branches found.</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>No branch found.</CommandEmpty>
                <CommandGroup>
                  {branches.map((branch) => (
                    <CommandItem
                      key={branch.branch_admin_id}
                      value={branch.branch_admin_id}
                      onSelect={() => handleBranchSelect(branch.branch_admin_id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === branch.branch_admin_id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {branch.branch_name || branch.branch_admin_id}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
