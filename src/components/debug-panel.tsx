import { useState } from 'react'
import { ChevronDown, ChevronUp, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import type { DateFilters } from '@/types/api'

interface DebugPanelProps {
  selectedAgent: string
  dateFilters: DateFilters
  agentStats?: any[]
  className?: string
}

export function DebugPanel({
  selectedAgent,
  dateFilters,
  agentStats,
  className = ''
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  const activeFilters = Object.entries(dateFilters).filter(([_, value]) => value !== undefined && value !== null)

  return (
    <Card className={`border-dashed border-orange-200 bg-orange-50/50 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm text-orange-800">Debug Panel</CardTitle>
                <Badge variant="outline" className="text-xs">
                  DEV ONLY
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-orange-800 mb-2">Current State</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <span className="font-medium">Agent:</span> {selectedAgent || 'None'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-orange-800 mb-2">
                Active Filters ({activeFilters.length})
              </h4>
              {activeFilters.length > 0 ? (
                <div className="space-y-1">
                  {activeFilters.map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="font-medium">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No filters active</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-orange-800 mb-2">API Query Parameters</h4>
              <div className="bg-orange-100 p-2 rounded text-xs font-mono">
                <div>Agent ID: {selectedAgent}</div>
                <div>Date Filters: {JSON.stringify(dateFilters, null, 2)}</div>
              </div>
            </div>

            {agentStats && (
              <div>
                <h4 className="font-medium text-orange-800 mb-2">
                  Stats Response ({agentStats.length} items)
                </h4>
                <div className="bg-orange-100 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                  {agentStats.map((stat, index) => (
                    <div key={index}>
                      {stat.metric}: {stat.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-orange-200">
              <p className="text-xs text-orange-700">
                💡 This panel helps verify that filters are being applied correctly.
                Check that the API parameters match your filter selections.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
