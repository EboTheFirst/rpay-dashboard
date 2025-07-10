import { ChatBubbleIcon } from '@radix-ui/react-icons'
import { BotIcon } from 'lucide-react'
import React, { useState } from 'react'

function ChatBot() {
    const [chatOpened, setChatOpened] = useState()
    return (
        <div className='fixed flex cursor-pointer animate-bounce items-center justify-center size-[3rem] bg-sidebar/90 shadow rounded-full bottom-5 right-5 gap-2'><BotIcon className='text-[3.5rem] text-white' /></div>
    )
}

export default ChatBot