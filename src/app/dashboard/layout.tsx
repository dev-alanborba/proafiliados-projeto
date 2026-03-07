import { DashboardClient } from './DashboardClient'

// Force dynamic rendering — dashboard pages require auth and env vars at request time
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardClient>{children}</DashboardClient>
}
