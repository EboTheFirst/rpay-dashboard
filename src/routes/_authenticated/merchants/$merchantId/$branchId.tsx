import { createFileRoute, useParams } from '@tanstack/react-router'
import BranchDashboard from '@/features/branch-dashboard'

function MerchantBranchPage() {
  const { merchantId, branchId } = useParams({ from: '/_authenticated/merchants/$merchantId/$branchId' })
  
  if (!merchantId || !branchId) {
    return <div>Loading...</div>
  }

  return <BranchDashboard branchId={branchId} merchantId={merchantId} />
}

export const Route = createFileRoute('/_authenticated/merchants/$merchantId/$branchId')({
  component: MerchantBranchPage,
})
