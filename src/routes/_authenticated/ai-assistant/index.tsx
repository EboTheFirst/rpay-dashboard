import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ChatInput } from '@/components/ui/chat-input'
import { Send } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { BotGraph } from '@/components/bot-graph'
import PaginatedSortableTable from '@/components/paginated-sorted-table'
import { RPAYTeam, useTeam } from '@/context/team-context'

export const Route = createFileRoute('/_authenticated/ai-assistant/')({
  component: Chat,
})

interface Message {
  from: "ai" | "user", type: string, text: string, axes?: {
    x_axis_key: string;
    y_axis_keys: string[];
  }, content?: any
}


function ChatMessage({ message }: { message: Message }) {

  if (message && message.from == "ai") {
    return (
      <div className='flex flex-col gap-4'>
        <div>
          {message.text}
        </div>
        {
          message.type == "table" &&
          <PaginatedSortableTable data={message.content} defaultPageSize={10} />
        }

        {
          ["bar_chart", "area_chart"].includes(message.type) && message.axes && message.type &&
          <BotGraph axes={message.axes} data={message.content} type={message.type} />
        }
      </div>
    )
  }

  return (
    <div className='p-[0.75rem] break-words rounded-l-lg rounded-tr-lg ml-auto bg-primary text-primary-foreground max-w-[30rem]'>
      {message.text}
    </div>
  )
}

function Chat() {
  const [inputText, setInputText] = useState("")
  const [aiLoading, setAILoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const { selectedEntity, selectedTeam } = useTeam()

  const RPTeam = selectedTeam == RPAYTeam.agent ?
    "agents" : (selectedTeam == RPAYTeam.merchant ?
      "merchants" : "branch-admins")


  const sendMesage = useMutation({
    mutationFn: async ({ query, team, entityId }: { query: string, team: string, entityId: string }) => {
      setAILoading(true);
      console.log({ query, team, entityId })
      const response = await api.post(`/${team}/${entityId}/nl-filter-sql`, {
        query: query.trim(),
      })

      return response.data as Message
    },
    onSuccess: (data) => {
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages.push(data)
        return newMessages
      })
    },
    onError: (_) => {
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages.push({ from: "ai", type: "text", text: "Sorry I couldn't fulfil your request. Please try again or try something else" })
        return newMessages
      })
    },
    onSettled: () => {
      setAILoading(false);
    }
  })

  const handleSend = () => {
    setAILoading(true)
    setMessages((prev) => {
      const newMessages = [...prev]
      newMessages.push({ from: "user", type: "text", text: inputText })
      return newMessages
    })
    sendMesage.mutate({query: inputText, team: RPTeam, entityId: selectedEntity})
    setInputText("")
  }

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, aiLoading]); // run every time list changes

  return (
    <div className='flex flex-col gap-[1rem] flex-1 w-full p-1'>
      <div ref={containerRef} className='flex-1 gap-16 overflow-y-scroll flex flex-col-reverse'>
        {
          aiLoading &&
          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 animate-ping"></div>
        }

        {
          messages.length > 0 && [...messages]?.reverse()?.map((msg) => (
            <ChatMessage message={msg} />
          ))
        }

      </div>
      <div className="flex items-center gap-2 w-full">
        <ChatInput
          placeholder="Enter your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className='flex items-center justify-center bg-accent w-10 h-full rounded-lg' onClick={handleSend}>
          <Send className="size-5 text-white" />
        </button>
      </div>
    </div>
  )
}
