import { createFileRoute, useParams } from '@tanstack/react-router'
import { TerminalDashboard } from '@/features/terminal-dashboard'

function TerminalPage() {
  const { merchantId, branchId, terminalId } = useParams({ from: '/_authenticated/merchants/$merchantId/$branchId/$terminalId' })

  if (!merchantId || !branchId || !terminalId) {
    return <div>Loading...</div>
  }

  return <TerminalDashboard />
}

export const Route = createFileRoute('/_authenticated/merchants/$merchantId/$branchId/$terminalId')({
  component: TerminalPage,
})
