import { createFileRoute } from '@tanstack/react-router'
import { MerchantSmartSearch } from '@/features/merchant-targeting'


export const Route = createFileRoute(
  '/_authenticated/ai-assistant/target-discovery/',
)({
  component: MerchantSmartSearch,
})