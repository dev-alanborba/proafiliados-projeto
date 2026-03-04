import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-[#0a0a0a] min-h-screen text-foreground">
            <Sidebar />
            <main className="flex-grow ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
