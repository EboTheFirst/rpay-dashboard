import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChatInput } from '@/components/ui/chat-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Send } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAgent } from '@/context/agent-context'

export const Route = createFileRoute('/_authenticated/ai-assistant/')({
  component: Chat,
})

interface Message { from: "ai" | "user", type: string, content: any }


function ChatMessage({ message }: { message: Message }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState('total_amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }
  if (message && message.from == "ai") {
    return (
      <div className=''>
        {
          message.type == "text" &&
          <div>
            {message.content}
          </div>
        }
        {
          message.type == "table" &&
          <div>
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {
                      Object.keys(message.content[0]).map((key) => (
                        <TableHead className="font-bold text-lg">
                          {(key.replace("_", " "))}
                        </TableHead>
                      ))
                    }
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {message.content?.map((item: any) => (
                    <TableRow key={item}>
                      {
                        Object.keys(item).map((key) => (
                          <TableCell className="font-medium">
                            {item[key]}
                          </TableCell>
                        ))
                      }
                      {/* <TableCell className="text-right">
                                                ₵{item.total_amount.toLocaleString()}
                                            </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {/* <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {page} of {branchesData?.pagination?.total_pages || 1}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= (branchesData?.pagination?.total_pages || 1)}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div> */}
            </>
          </div>
        }
      </div>
    )
  }

  return (
    <div className='p-[0.75rem] break-words rounded-l-lg rounded-tr-lg ml-auto bg-primary text-primary-foreground max-w-[30rem]'>
      {message.content}
    </div>
  )
}

function Chat() {
  const [inputText, setInputText] = useState("")
  const [aiLoading, setAILoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const { selectedAgent } = useAgent()

  const sendMesage = useMutation({
    mutationFn: async (query: string) => {
      setAILoading(true);
      const response = await api.post(`/agents/${selectedAgent}/nl-filter-sql`, {
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
    onError: (error) => {
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages.push({ from: "ai", type: "text", content: "Sorry I couldn't fulfil your request. Please try again or try something else" })
        return newMessages
      })
    },
    onSettled: () => {
      setAILoading(false);
    }
  })

  const handleSend = () => {
    setMessages((prev) => {
      const newMessages = [...prev]
      newMessages.push({ from: "user", type: "text", content: inputText })
      return newMessages
    })
    sendMesage.mutate(inputText)
    setInputText("")
  }

  return (
    <div className='flex flex-col gap-[1rem] flex-1 w-full p-1'>
      <div className='flex-1 gap-2 overflow-y-scroll flex flex-col-reverse'>
        {
          aiLoading &&
          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 animate-ping"></div>
        }
        {
          messages.length > 0 && messages?.map((msg) => (
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
