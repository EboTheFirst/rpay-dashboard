import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface TopModeSelectorProps {
  mode: 'amount' | 'count'
  onModeChange: (mode: 'amount' | 'count') => void
  label?: string
  className?: string
}

export function TopModeSelector({
  mode,
  onModeChange,
  label = 'Sort By',
  className
}: TopModeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={mode} onValueChange={onModeChange}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="amount">By Amount</SelectItem>
          <SelectItem value="count">By Count</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
