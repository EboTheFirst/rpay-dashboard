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
import { useMerchantList } from '@/hooks/use-merchants'
import { useTeam } from '@/context/team-context'

interface MerchantSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function MerchantSelector({
  value,
  onValueChange,
  placeholder = 'Select merchant...',
}: MerchantSelectorProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setNavigationContext } = useTeam()
  const { data: merchants = [], isLoading, error } = useMerchantList()

  const selectedMerchant = merchants.find((merchant) => merchant.merchant_id === value)

  const handleMerchantSelect = (merchantId: string) => {
    const newValue = merchantId === value ? '' : merchantId
    onValueChange(newValue)
    setOpen(false)

    // Navigate to merchant dashboard if a merchant is selected
    if (newValue) {
      // Set navigation context to 'direct' since this is team-based access
      setNavigationContext('direct')
      navigate({ to: `/merchants/${newValue}` })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between merchant-selector-button'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loading...
            </>
          ) : selectedMerchant ? (
            selectedMerchant.merchant_name || selectedMerchant.merchant_id
          ) : error ? (
            'Error loading merchants'
          ) : (
            placeholder
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search merchants...' />
          <CommandList>
            {isLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2 text-sm text-muted-foreground'>Loading merchants...</span>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center py-6'>
                <span className='text-sm text-muted-foreground'>Error loading merchants</span>
              </div>
            ) : merchants.length === 0 ? (
              <CommandEmpty>No merchants found.</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>No merchant found.</CommandEmpty>
                <CommandGroup>
                  {merchants.map((merchant) => (
                    <CommandItem
                      key={merchant.merchant_id}
                      value={merchant.merchant_id}
                      onSelect={() => handleMerchantSelect(merchant.merchant_id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === merchant.merchant_id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {merchant.merchant_name || merchant.merchant_id}
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
