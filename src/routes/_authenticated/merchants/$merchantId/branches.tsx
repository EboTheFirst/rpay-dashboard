import { createFileRoute, useParams } from '@tanstack/react-router'
import MerchantBranches from '@/features/merchant-branches'

function MerchantBranchesPage() {
  const { merchantId } = useParams({ from: '/_authenticated/merchants/$merchantId/branches' })
  
  if (!merchantId) {
    return <div>Loading...</div>
  }

  return <MerchantBranches merchantId={merchantId} />
}

export const Route = createFileRoute('/_authenticated/merchants/$merchantId/branches')({
  component: MerchantBranchesPage,
})
