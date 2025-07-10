import ChatBot from '@/features/chat-bot'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ai-assistant')({
  component: ChatBot,
})
