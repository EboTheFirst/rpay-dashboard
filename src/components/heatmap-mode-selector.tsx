import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface HeatmapModeSelectorProps {
  value: 'volume' | 'count' | 'average'
  onValueChange: (value: 'volume' | 'count' | 'average') => void
  label?: string
  className?: string
}

export function HeatmapModeSelector({ 
  value, 
  onValueChange, 
  label = 'Metric',
  className 
}: HeatmapModeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="volume">Transaction Volume</SelectItem>
          <SelectItem value="count">Transaction Count</SelectItem>
          <SelectItem value="average">Average Value</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
