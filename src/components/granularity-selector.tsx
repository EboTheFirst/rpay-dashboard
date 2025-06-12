import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface GranularitySelectorProps {
  value: 'daily' | 'weekly' | 'monthly' | 'yearly'
  onValueChange: (value: 'daily' | 'weekly' | 'monthly' | 'yearly') => void
  label?: string
  className?: string
}

export function GranularitySelector({ 
  value, 
  onValueChange, 
  label = 'Time Period',
  className 
}: GranularitySelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
