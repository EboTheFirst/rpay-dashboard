import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
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
import { useAgentList } from '@/hooks/use-agents'

interface AgentSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function AgentSelector({
  value,
  onValueChange,
  placeholder = 'Select agent...',
}: AgentSelectorProps) {
  const [open, setOpen] = useState(false)
  const { data: agents = [], isLoading, error } = useAgentList()

  const selectedAgent = agents.find((agent) => agent.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between agent-selector-button'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loading...
            </>
          ) : selectedAgent ? (
            selectedAgent.name
          ) : error ? (
            'Error loading agents'
          ) : (
            placeholder
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search agents...' />
          <CommandList>
            {isLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2 text-sm text-muted-foreground'>Loading agents...</span>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center py-6'>
                <span className='text-sm text-muted-foreground'>Error loading agents</span>
              </div>
            ) : agents.length === 0 ? (
              <CommandEmpty>No agents found.</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>No agent found.</CommandEmpty>
                <CommandGroup>
                  {agents.map((agent) => (
                    <CommandItem
                      key={agent.id}
                      value={agent.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? '' : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === agent.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {agent.name}
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
