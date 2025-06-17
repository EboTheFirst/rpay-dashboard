import { createFileRoute, useParams } from '@tanstack/react-router'
import BranchDashboard from '@/features/branch-dashboard'

function BranchPage() {
  const { branchId } = useParams({ from: '/_authenticated/branch-admins/$branchId' })
  
  if (!branchId) {
    return <div>Loading...</div>
  }

  return <BranchDashboard branchId={branchId} />
}

export const Route = createFileRoute('/_authenticated/branch-admins/$branchId')({
  component: BranchPage,
})
