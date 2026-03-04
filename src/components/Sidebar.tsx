'use client'

import { useState, useEffect } from 'react'
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
    Zap
} from 'lucide-react'
import { cn } from '../lib/utils'
import { createClient } from '../lib/supabase'

const supabase = createClient()

const menuItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'WhatsApp', icon: MessageSquare, href: '/dashboard/whatsapp' },
    { label: 'Grupos', icon: Users, href: '/dashboard/grupos' },
    { label: 'Links', icon: Link2, href: '/dashboard/links' },
    { label: 'Relatórios', icon: BarChart3, href: '/dashboard/relatorios' },
]

export function Sidebar() {
    const pathname = usePathname()
    const [userMetadata, setUserMetadata] = useState<{ full_name?: string, selected_plan?: string, subscription_status?: string } | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserMetadata(user.user_metadata)
            }
        }
        fetchUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const planName = userMetadata?.selected_plan || 'Nenhum'
    const subscriptionStatus = userMetadata?.subscription_status === 'active' ? 'active' : 'pending'

    return (
        <aside className="w-72 bg-[#050505] border-r border-white/5 flex flex-col relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-[100px] -translate-y-1/2 pointer-events-none" />

            <div className="p-8 flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                    <Zap className="w-7 h-7 text-primary fill-primary/20" />
                </div>
                <div>
                    <h1 className="font-black text-xl tracking-tighter text-white">ProAfiliados</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Intelligence</p>
                </div>
            </div>

            <nav className="flex-grow px-4 space-y-2 py-4 relative z-10">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                    <p className="text-[9px] font-bold text-muted leading-relaxed">
                        {subscriptionStatus === 'active'
                            ? 'Todos os sistemas estão operando em regime de alta performance.'
                            : 'Complete o pagamento para liberar o monitoramento total.'}
                    </p>
                </div>
            </div>

            <div className="p-6 relative z-10">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </button>
            </div>
        </aside>
    )
}
