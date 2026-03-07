// Force dynamic — login page calls Supabase auth which requires env vars at request time
export const dynamic = 'force-dynamic'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
