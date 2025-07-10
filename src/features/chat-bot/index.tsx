import { Outlet } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import SidebarNav from '../settings/components/sidebar-nav'
import {  Edit, Target } from 'lucide-react'




export default function ChatBot() {


    

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <Search />
                <div className='ml-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main fixed>
                <div className='space-y-0.5'>
                    <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                        AI Assistant
                    </h1>
                    <p className='text-muted-foreground'>
                        Ask questions and get instant insights from your transaction data.
                    </p>
                </div>
                <Separator className='my-4 lg:my-6' />
                <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <aside className='top-0 lg:sticky lg:w-1/5'>
                        <SidebarNav items={sidebarNavItems} />
                    </aside>
                    <Outlet />
                </div>
            </Main>
        </>
    )
}


const sidebarNavItems = [
    {
        title: 'Chat',
        icon: <Edit size={18} />,
        href: '/ai-assistant',
    },
    {
        title: 'Target Discovery',
        icon: <Target size={18} />,
        href: '/ai-assistant/target-discovery',
    },
    // {
    //     title: 'Account',
    //     icon: <IconTool size={18} />,
    //     href: '/settings/account',
    // },
    // {
    //     title: 'Appearance',
    //     icon: <IconPalette size={18} />,
    //     href: '/settings/appearance',
    // },
    // {
    //     title: 'Notifications',
    //     icon: <IconNotification size={18} />,
    //     href: '/settings/notifications',
    // },
    // {
    //     title: 'Display',
    //     icon: <IconBrowserCheck size={18} />,
    //     href: '/settings/display',
    // },
]
