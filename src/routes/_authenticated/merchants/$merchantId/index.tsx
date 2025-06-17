import { createFileRoute, useParams } from '@tanstack/react-router'
import MerchantDashboard from '@/features/merchant-dashboard'

function MerchantPage() {
  const { merchantId } = useParams({ from: '/_authenticated/merchants/$merchantId/' })
  
  if (!merchantId) {
    return <div>Loading...</div>
  }

  return <MerchantDashboard merchantId={merchantId} />
}

export const Route = createFileRoute('/_authenticated/merchants/$merchantId/')({
  component: MerchantPage,
})
