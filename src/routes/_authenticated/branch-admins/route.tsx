import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/branch-admins')({
  component: () => <Outlet />,
})
