import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface ConnectionStatusProps {
  children: React.ReactNode
}

export function ConnectionStatus({ children }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string>('')
  const [retryCount, setRetryCount] = useState(0)

  const checkConnection = async () => {
    try {
      setStatus('checking')
      setError('')
      
      // Try to hit a simple endpoint
      const response = await api.get('/agents/count', { timeout: 5000 })
      
      if (response.status === 200) {
        setStatus('connected')
        setRetryCount(0)
      } else {
        throw new Error(`Server returned ${response.status}`)
      }
    } catch (err: any) {
      setStatus('error')
      
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Is it running?')
      } else if (err.response?.status === 500) {
        setError('Backend server error. Check if data is loaded.')
      } else {
        setError(err.message || 'Unknown connection error')
      }
    }
  }

  const retry = () => {
    setRetryCount(prev => prev + 1)
    checkConnection()
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <CardTitle>Connecting to Backend</CardTitle>
            </div>
            <CardDescription>
              Checking connection to the analytics API...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Connection Error</CardTitle>
            </div>
            <CardDescription>
              Unable to connect to the backend server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Troubleshooting:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make sure the backend server is running</li>
                <li>• Check that the API URL is correct in .env</li>
                <li>• Verify that transaction data is loaded</li>
                <li>• Check browser console for CORS errors</li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Attempt {retryCount + 1}
              </Badge>
              <Button onClick={retry} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Connected - show the dashboard
  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      <div className="flex items-center justify-end">
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Connected
        </Badge>
      </div>
      {children}
    </div>
  )
}
