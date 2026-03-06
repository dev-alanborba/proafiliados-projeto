import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's session IDs and status
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('user_id', user.id)

    if (!sessions || sessions.length === 0) {
        return NextResponse.json({
            totalLinks: 0,
            groups: 0,
            chartData: buildEmptyChart(),
            platformData: [],
        })
    }

    const sessionIds = sessions.map(s => s.id)

    // Run queries in parallel
    const [linksResult, groupsResult, recentLinksResult] = await Promise.all([
        // Total links count
        supabase
            .from('captured_links')
            .select('id', { count: 'exact', head: true })
            .in('session_id', sessionIds),

        // Active monitored groups count
        supabase
            .from('groups')
            .select('id', { count: 'exact', head: true })
            .in('session_id', sessionIds)
            .eq('monitored', true),

        // Last 24h links for chart + platform breakdown
        supabase
            .from('captured_links')
            .select('created_at, platform')
            .in('session_id', sessionIds)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: true }),
    ])

    const totalLinks = linksResult.count ?? 0
    const groups = groupsResult.count ?? 0
    const recentLinks = recentLinksResult.data ?? []

    // Build hourly chart data (last 24h, bucketed by hour)
    const chartData = buildHourlyChart(recentLinks)

    // Build platform breakdown
    const platformCounts: Record<string, number> = {}
    for (const link of recentLinks) {
        if (link.platform) {
            platformCounts[link.platform] = (platformCounts[link.platform] ?? 0) + 1
        }
    }
    const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }))

    const isConnected = sessions.some(s => s.status === 'connected' || s.status === 'open')

    return NextResponse.json({ totalLinks, groups, chartData, platformData, isConnected })
}

function buildEmptyChart() {
    const now = new Date()
    return Array.from({ length: 7 }, (_, i) => {
        const h = new Date(now)
        h.setHours(h.getHours() - (6 - i) * 4)
        return { name: `${String(h.getHours()).padStart(2, '0')}:00`, links: 0 }
    })
}

function buildHourlyChart(links: { created_at: string }[]) {
    const now = new Date()
    // 7 buckets of ~3.4h each to cover 24h
    const buckets: { label: string; start: Date; count: number }[] = Array.from({ length: 7 }, (_, i) => {
        const bucketStart = new Date(now.getTime() - (6 - i) * (24 / 7) * 60 * 60 * 1000)
        return {
            label: `${String(bucketStart.getHours()).padStart(2, '0')}:00`,
            start: bucketStart,
            count: 0,
        }
    })

    for (const link of links) {
        const t = new Date(link.created_at).getTime()
        for (let i = buckets.length - 1; i >= 0; i--) {
            if (t >= buckets[i].start.getTime()) {
                buckets[i].count++
                break
            }
        }
    }

    return buckets.map(b => ({ name: b.label, links: b.count }))
}
