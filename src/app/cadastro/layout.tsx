// Force dynamic — signup page calls Supabase auth which requires env vars at request time
export const dynamic = 'force-dynamic'

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
