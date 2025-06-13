import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users2, Store, Search, Filter, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/target-discovery/')({
  component: TargetDiscoveryPage,
})

function TargetDiscoveryPage() {
  const navigate = useNavigate()

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Target Discovery</h1>
            <p className="text-muted-foreground">
              Find and target merchants and customers based on specific criteria for product offerings
            </p>
          </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Merchant Targeting
            </CardTitle>
            <CardDescription>
              Find merchants that match specific transaction patterns, volume, or customer base criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Use Cases:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Merchants with high transaction volume (50+ transactions)</li>
                <li>• Merchants with high average transaction values (₵200+)</li>
                <li>• Merchants serving many customers (20+ unique customers)</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/target-discovery/merchants">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Merchants
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/target-discovery/merchants/search">
                  <Search className="h-4 w-4 mr-2" />
                  Smart Search
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Customer Targeting
            </CardTitle>
            <CardDescription>
              Identify customers based on spending behavior, transaction frequency, and patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Use Cases:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• High-value customers (₵500+ average transactions)</li>
                <li>• Frequent customers (10+ transactions)</li>
                <li>• Customers with high total spending (₵1000+)</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/target-discovery/customers">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Customers
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/target-discovery/customers/search">
                  <Search className="h-4 w-4 mr-2" />
                  Smart Search
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


        </div>
      </Main>
    </>
  )
}
