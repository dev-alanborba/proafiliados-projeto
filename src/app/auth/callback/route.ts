import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Validate next is a safe relative path to prevent open redirect attacks
    const rawNext = searchParams.get('next') ?? '/dashboard'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return redirect(`${origin}/login?error=Could not authenticate user`)
}
