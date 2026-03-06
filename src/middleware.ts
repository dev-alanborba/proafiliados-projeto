import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // --- Subscription Protection ---
    // Blocks access to core features if user did not pay (subscription_status !== 'active')
    const premiumRoutes = ['/dashboard/whatsapp', '/dashboard/grupos', '/dashboard/links', '/dashboard/relatorios']
    const isPremiumRoute = premiumRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (user && isPremiumRoute) {
        // Query the profiles table directly — this is where the webhook writes
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', user.id)
            .single()

        const isSubscribed = profile?.subscription_status === 'active'

        if (!isSubscribed) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Admin Session Protection for Master Panel
    // Block any /api/admin routes without a valid admin session cookie
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
        const adminToken = request.cookies.get('admin_session')?.value
        if (!adminToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
