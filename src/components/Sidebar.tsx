'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Link2,
    BarChart3,
    LogOut,
    Zap,
    CalendarClock,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { cn } from '../lib/utils'
import { createClient } from '../lib/supabase'

const supabase = createClient()

const menuItems = [
    { label: 'Visão Geral', mobileLabel: 'Início', icon: LayoutDashboard, href: '/dashboard', color: 'text-violet-400' },
    { label: 'WhatsApp', mobileLabel: 'WA', icon: MessageSquare, href: '/dashboard/whatsapp', color: 'text-emerald-400' },
    { label: 'Grupos', mobileLabel: 'Grupos', icon: Users, href: '/dashboard/grupos', color: 'text-blue-400' },
    { label: 'Links', mobileLabel: 'Links', icon: Link2, href: '/dashboard/links', color: 'text-amber-400' },
    { label: 'Relatórios', mobileLabel: 'Stats', icon: BarChart3, href: '/dashboard/relatorios', color: 'text-rose-400' },
]

function SidebarComponent() {
    const pathname = usePathname()
    const [userMetadata, setUserMetadata] = useState<{ full_name?: string; selected_plan?: string; subscription_status?: string } | null>(null)
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null)

    const [profileSubscriptionStatus, setProfileSubscriptionStatus] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserMetadata(user.user_metadata)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_status, subscription_expires_at')
                    .eq('id', user.id)
                    .single()
                if (profile?.subscription_status) {
                    setProfileSubscriptionStatus(profile.subscription_status)
                }
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
    // Check both sources for subscription status
    const isActive = profileSubscriptionStatus === 'active' || userMetadata?.subscription_status === 'active'
    const initials = userMetadata?.full_name
        ? userMetadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'PA'

    return (
        <>
            {/* ─── MOBILE TOP HEADER ─── */}
            <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-[#030303]/90 backdrop-blur-2xl border-b border-white/[0.05] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 relative">
                        <div className="absolute inset-0 rounded-xl bg-primary animate-pulse opacity-30" />
                        <Zap className="w-4 h-4 text-white relative z-10" />
                    </div>
                    <span className="font-black text-white text-sm uppercase tracking-wider">ProAfiliados</span>
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-500/20">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>

            {/* ─── DESKTOP SIDEBAR ─── */}
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 left-0 overflow-hidden z-40">
                {/* Background */}
                <div className="absolute inset-0 bg-[#050508] border-r border-white/[0.05]" />
                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                {/* Ambient glow */}
                <div className="absolute top-0 left-0 w-full h-64 bg-primary/8 blur-[80px] -translate-y-1/3 pointer-events-none" />

                {/* ── Logo ── */}
                <div className="relative z-10 p-7 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 relative z-10">
                                <Zap className="w-6 h-6 text-white fill-white/20" />
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-primary animate-pulse opacity-30" />
                        </div>
                        <div>
                            <h1 className="font-black text-[18px] tracking-tight text-white leading-none">ProAfiliados</h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-primary/60" />
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/60">Intelligence</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="relative z-10 px-4 space-y-1 shrink-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 px-3 mb-3">Menu Principal</p>
                    {menuItems.map((item) => {
                        const isItemActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isItemActive ? 'page' : undefined}
                                className={cn(
                                    "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isItemActive
                                        ? "bg-primary/10 border border-primary/20 text-white shadow-lg shadow-primary/10"
                                        : "text-muted hover:bg-white/[0.04] hover:text-white border border-transparent"
                                )}
                            >
                                {/* Active background glow */}
                                {isItemActive && (
                                    <motion.div
                                        layoutId="sidebar-active-bg"
                                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}

                                {/* Icon */}
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 relative z-10",
                                    isItemActive
                                        ? "bg-primary/20 border border-primary/30"
                                        : "bg-white/[0.04] border border-white/[0.05] group-hover:bg-white/[0.07]"
                                )}>
                                    <item.icon className={cn(
                                        "w-4 h-4 transition-all duration-300",
                                        isItemActive ? "text-primary" : "text-muted group-hover:text-white"
                                    )} />
                                </div>

                                <span className={cn(
                                    "text-sm font-bold tracking-tight relative z-10 flex-1",
                                    isItemActive ? "text-white" : "text-muted group-hover:text-white"
                                )}>
                                    {item.label}
                                </span>

                                {isItemActive && (
                                    <ChevronRight className="w-3.5 h-3.5 text-primary/50 relative z-10" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* ── Scrollable area ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">

                    {/* Subscription card */}
                    <div className="p-4 mt-4">
                        <div className={cn(
                            "rounded-2xl p-5 space-y-4 border relative overflow-hidden",
                            isActive
                                ? "bg-gradient-to-br from-primary/10 to-primary/[0.03] border-primary/20"
                                : "bg-white/[0.02] border-white/[0.05]"
                        )}>
                            {isActive && (
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted">Seu Plano</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                    isActive ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                    {isActive ? 'Ativo' : 'Pendente'}
                                </span>
                            </div>

                            <p className="text-base font-black text-white tracking-tight uppercase leading-none">{planName}</p>

                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isActive ? '100%' : '15%' }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    className={cn(
                                        "h-full rounded-full",
                                        isActive ? "bg-gradient-to-r from-secondary to-emerald-400 shadow-[0_0_10px_rgba(0,255,135,0.5)]" : "bg-amber-500"
                                    )}
                                />
                            </div>

                            {isActive && subscriptionExpiresAt && (
                                <div className="flex items-center gap-2 p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl">
                                    <CalendarClock className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-[7px] font-black text-muted uppercase tracking-[0.3em]">Renovação em</p>
                                        <p className="text-[10px] font-black text-white tracking-tight">
                                            {new Date(subscriptionExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <p className="text-[9px] font-bold text-muted/70 leading-relaxed">
                                {isActive
                                    ? 'Todos os sistemas operando em regime de alta performance.'
                                    : 'Complete o pagamento para liberar o monitoramento total.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── User + Logout ── */}
                <div className="relative z-10 p-4 shrink-0 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-all group cursor-pointer" onClick={handleSignOut}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-black text-primary">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate">
                                {userMetadata?.full_name || 'Usuário'}
                            </p>
                            <p className="text-[9px] font-bold text-muted uppercase tracking-widest">Sair da conta</p>
                        </div>
                        <LogOut className="w-4 h-4 text-muted group-hover:text-red-400 transition-colors shrink-0" />
                    </div>
                </div>
            </aside>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="mx-3 mb-3">
                    <div className="bg-[#050508]/85 backdrop-blur-2xl border border-white/[0.07] rounded-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.7)]">
                        <div className="flex items-center justify-around px-2 py-2">
                            {menuItems.map((item) => {
                                const isItemActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={isItemActive ? 'page' : undefined}
                                        className="flex flex-col items-center gap-1 p-2 rounded-xl relative group w-14"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                                            isItemActive ? "bg-primary/15 border border-primary/25 shadow-lg shadow-primary/10" : "group-active:scale-90"
                                        )}>
                                            <item.icon className={cn(
                                                "w-5 h-5 transition-all duration-300",
                                                isItemActive ? "text-primary" : "text-muted"
                                            )} />
                                            {isItemActive && (
                                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black tracking-tight text-center w-full truncate uppercase",
                                            isItemActive ? "text-white" : "text-muted/60"
                                        )}>
                                            {item.mobileLabel}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export const Sidebar = memo(SidebarComponent)
