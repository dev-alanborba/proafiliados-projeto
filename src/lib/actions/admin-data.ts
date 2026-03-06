'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { isAdminAuthenticated } from './admin'

export interface AdminUser {
    id: string
    name: string
    email: string
    plan: string | null
    planStatus: string
    sessions: number
    links: number
    status: 'Pago' | 'Pendente'
    joined: string
    created_at: string
}

export interface AdminStats {
    totalUsers: number
    paidUsers: number
    unpaidUsers: number
    activeSessions: number
    totalLinks: number
    mrr: number
}

export interface AdminDashboardData {
    users: AdminUser[]
    stats: AdminStats
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
    // Verify admin authentication
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
        return {
            users: [],
            stats: { totalUsers: 0, paidUsers: 0, unpaidUsers: 0, activeSessions: 0, totalLinks: 0, mrr: 0 }
        }
    }

    // Use service role key to bypass RLS — admin needs to see ALL users
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // Fetch all profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch all subscriptions
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')

    // Fetch session counts per user
    const { data: sessions } = await supabase
        .from('sessions')
        .select('user_id, id')

    // Fetch link counts per session
    const { data: links } = await supabase
        .from('captured_links')
        .select('session_id, id')

    // Proceed directly to building list

    // Build user list
    const userList: AdminUser[] = (profiles || []).map(profile => {
        // Find subscription for this user
        const userSub = (subscriptions || []).find(s => s.user_id === profile.id)
        const planData = userSub?.plans as { name?: string, price?: number | string } | undefined
        const isPaid = userSub?.status === 'active'

        // Count sessions for this user
        const userSessions = (sessions || []).filter(s => s.user_id === profile.id).length

        // Count links for this user's sessions
        const userSessionIds = (sessions || []).filter(s => s.user_id === profile.id).map(s => s.id)
        const userLinks = (links || []).filter(l => userSessionIds.includes(l.session_id)).length

        // Format date
        const createdAt = new Date(profile.created_at)
        const joined = createdAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })

        return {
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'Sem Nome',
            email: profile.email || 'N/A',
            plan: planData?.name || null,
            planStatus: userSub?.status || 'inactive',
            sessions: userSessions,
            links: userLinks,
            status: isPaid ? 'Pago' : 'Pendente',
            joined,
            created_at: profile.created_at
        }
    })

    // Calculate stats
    const paidUsers = userList.filter(u => u.status === 'Pago').length
    const unpaidUsers = userList.filter(u => u.status === 'Pendente').length
    const totalSessions = (sessions || []).length
    const totalLinks = (links || []).length

    // Calculate MRR from active subscriptions
    const mrr = (subscriptions || [])
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            const planPrice = (s.plans as { name?: string, price?: number | string } | undefined)?.price || 0
            return sum + Number(planPrice)
        }, 0)

    return {
        users: userList,
        stats: {
            totalUsers: userList.length,
            paidUsers,
            unpaidUsers,
            activeSessions: totalSessions,
            totalLinks,
            mrr
        }
    }
}
