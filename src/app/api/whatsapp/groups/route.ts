import { createClient } from '@/lib/supabase-server'
import { evolution } from '@/lib/evolution'
import { NextResponse, NextRequest } from 'next/server'

// Validates WhatsApp group JID format (can contain numbers, letters, and hyphens)
const GROUP_JID_REGEX = /^[a-zA-Z0-9-]+@g\.us$/

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's session (WhatsApp instance)
    const { data: session } = await supabase
        .from('sessions')
        .select('id, instance_name')
        .eq('user_id', user.id)
        .single()

    if (!session?.instance_name) {
        return NextResponse.json({ groups: [] })
    }

    // Fetch groups from Evolution API
    let evolutionGroups: { id: string; subject: string; size?: number }[] = []
    try {
        evolutionGroups = await evolution.getGroups(session.instance_name)
    } catch {
        // Instance may be disconnected — return configured groups only
    }

    // Fetch group config from Supabase (monitored/isDestination status)
    const { data: configuredGroups } = await supabase
        .from('groups')
        .select('group_jid, monitored, is_destination')
        .eq('session_id', session.id)

    const configMap = new Map(
        (configuredGroups ?? []).map(g => [g.group_jid, g])
    )

    // Merge Evolution groups with DB config
    const groups = evolutionGroups.map(g => {
        const cfg = configMap.get(g.id)
        return {
            id: g.id,
            name: g.subject,
            members: g.size ?? 0,
            lastMsg: '—',
            monitored: cfg?.monitored ?? false,
            isDestination: cfg?.is_destination ?? false,
        }
    })

    return NextResponse.json({ groups })
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { group_jid?: string; group_name?: string; field?: string; value?: boolean }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { group_jid, group_name, field, value } = body

    if (!group_jid || !GROUP_JID_REGEX.test(group_jid)) {
        return NextResponse.json({ error: 'Invalid group_jid' }, { status: 400 })
    }

    if (field !== 'monitored' && field !== 'is_destination') {
        return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }

    // Get user's session
    const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!session) {
        return NextResponse.json({ error: 'No active session' }, { status: 400 })
    }

    // Upsert group config
    const { error } = await supabase
        .from('groups')
        .upsert(
            { session_id: session.id, group_jid, name: group_name ?? '', [field]: value },
            { onConflict: 'session_id,group_jid' }
        )

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
