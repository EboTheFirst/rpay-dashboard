import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ChartTypeSelectorProps {
  value: 'area' | 'bar'
  onValueChange: (value: 'area' | 'bar') => void
  label?: string
  className?: string
}

export function ChartTypeSelector({ 
  value, 
  onValueChange, 
  label = 'Chart Type',
  className 
}: ChartTypeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="area">Area Chart</SelectItem>
          <SelectItem value="bar">Bar Chart</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
