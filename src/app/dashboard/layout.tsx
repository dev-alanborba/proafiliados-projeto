import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-[#0a0a0a] min-h-screen text-foreground overflow-x-hidden">
            <Sidebar />
            <main className="flex-grow md:ml-64 p-4 pt-20 md:pt-8 md:p-8 pb-32 md:pb-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
