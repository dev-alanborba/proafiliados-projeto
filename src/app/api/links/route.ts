import { createClient } from '@/lib/supabase-server'
import { NextResponse, NextRequest } from 'next/server'

const ALLOWED_PLATFORMS = ['Shopee', 'Mercado Livre', 'Amazon']

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get platform filter from query params
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    // Get user's session IDs
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id)

    if (!sessions || sessions.length === 0) {
        return NextResponse.json({ links: [] })
    }

    const sessionIds = sessions.map(s => s.id)

    // Query captured_links
    let query = supabase
        .from('captured_links')
        .select('id, session_id, group_jid, sender_name, sender_number, link_url, platform, content, created_at')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false })
        .limit(50)

    if (platform && ALLOWED_PLATFORMS.includes(platform)) {
        query = query.eq('platform', platform)
    }

    const { data: links, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ links: links ?? [] })
}
