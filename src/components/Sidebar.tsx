'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Link2,
    BarChart3,
    LogOut,
    Zap,
    CalendarClock
} from 'lucide-react'
import { cn } from '../lib/utils'
import { createClient } from '../lib/supabase'

const supabase = createClient()

const menuItems = [
    { label: 'Visão Geral', mobileLabel: 'Início', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'WhatsApp', mobileLabel: 'WA', icon: MessageSquare, href: '/dashboard/whatsapp' },
    { label: 'Grupos', mobileLabel: 'Grupos', icon: Users, href: '/dashboard/grupos' },
    { label: 'Links', mobileLabel: 'Links', icon: Link2, href: '/dashboard/links' },
    { label: 'Relatórios', mobileLabel: 'Stats', icon: BarChart3, href: '/dashboard/relatorios' },
]

function SidebarComponent() {
    const pathname = usePathname()
    const [userMetadata, setUserMetadata] = useState<{ full_name?: string, selected_plan?: string, subscription_status?: string } | null>(null)
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserMetadata(user.user_metadata)

                // Fetch expiration date from profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_expires_at')
                    .eq('id', user.id)
                    .single()
                if (profile?.subscription_expires_at) {
                    setSubscriptionExpiresAt(profile.subscription_expires_at)
                }
            }
        }
        fetchUser()
    }, [])

    const handleSignOut = useCallback(async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }, [])

    const planName = userMetadata?.selected_plan || 'Nenhum'
    const subscriptionStatus = userMetadata?.subscription_status === 'active' ? 'active' : 'pending'

    return (
        <>
            {/* --- MOBILE HEADER WITH LOGOUT --- */}
            <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
                        <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-black text-white text-sm uppercase tracking-wider">ProAfiliados</span>
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-2 p-2 text-muted hover:text-red-400 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Sair</span>
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex w-72 bg-[#050505] border-r border-white/5 flex-col fixed inset-y-0 left-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-[100px] -translate-y-1/2 pointer-events-none" />

                {/* Fixed Header */}
                <div className="p-8 flex items-center gap-4 relative z-10 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.2)] shrink-0">
                        <Zap className="w-7 h-7 text-primary fill-primary/20" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tighter text-white">ProAfiliados</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Intelligence</p>
                    </div>
                </div>

                {/* Scrollable Content Area (Menus + Card) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <nav className="px-4 space-y-2 py-2 relative z-10">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-white/[0.03] text-white border border-white/5 shadow-2xl"
                                            : "text-muted hover:bg-white/[0.02] hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                                        />
                                    )}
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-primary" : "text-muted"
                                    )} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Subscription Status Card */}
                    <div className="p-6 relative z-10">
                        <div className="bento-card p-6 space-y-4">
                            <div className="inner-glow" />
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Seu Plano</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                                    subscriptionStatus === 'active' ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-500"
                                )}>
                                    {subscriptionStatus === 'active' ? 'Ativo' : 'Pendente'}
                                </span>
                            </div>
                            <p className="text-lg font-black text-white tracking-tight leading-none uppercase">{planName}</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: subscriptionStatus === 'active' ? '100%' : '15%' }}
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        subscriptionStatus === 'active' ? "bg-secondary shadow-[0_0_10px_rgba(0,255,135,0.4)]" : "bg-amber-500"
                                    )}
                                />
                            </div>
                            {subscriptionStatus === 'active' && subscriptionExpiresAt && (
                                <div className="flex items-center gap-2 p-2.5 bg-white/[0.03] border border-white/5 rounded-xl">
                                    <CalendarClock className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-[8px] font-black text-muted uppercase tracking-widest">Renovação em</p>
                                        <p className="text-[11px] font-black text-white tracking-tight">
                                            {new Date(subscriptionExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <p className="text-[9px] font-bold text-muted leading-relaxed">
                                {subscriptionStatus === 'active'
                                    ? 'Todos os sistemas estão operando em regime de alta performance.'
                                    : 'Complete o pagamento para liberar o monitoramento total.'}
                            </p>
                        </div>
                    </div>
                </div> {/* End Scrollable Content */}

                {/* Fixed Footer (Logout) */}
                <div className="p-6 pt-4 relative z-10 w-full border-t border-white/5 bg-[#050505] shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>
            </aside>

            {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-2xl border-t border-white/10 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-around px-2 py-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className="flex flex-col items-center gap-1.5 p-2 rounded-xl relative group w-16"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative",
                                    isActive ? "bg-primary/20 border border-primary/30" : "bg-transparent text-muted group-hover:bg-white/5"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-transform duration-300 group-active:scale-90",
                                        isActive ? "text-primary" : "text-muted"
                                    )} />
                                    {isActive && (
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold tracking-tight text-center w-full truncate",
                                    isActive ? "text-white" : "text-muted/60"
                                )}>
                                    {item.mobileLabel}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}

export const Sidebar = memo(SidebarComponent)
