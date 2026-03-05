'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Zap,
    Users,
    Link2,
    MessageSquare,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    AlertCircle,
    CalendarClock
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const DashboardChart = dynamic(() => import('@/components/DashboardChart'), {
    ssr: false,
    loading: () => <div className="flex-grow h-[350px] w-full" />,
})

const supabase = createClient()

const PLANS = [
    { name: 'Starter', price: '47', features: ['1 Sessão WhatsApp', '10 Grupos Monitorados', 'Captura Real-time'] },
    { name: 'Professional', price: '97', popular: true, features: ['3 Sessões WhatsApp', '50 Grupos Monitorados', 'AI Pattern Matching', 'Relatórios Avançados'] },
    { name: 'Enterprise', price: '197', features: ['10 Sessões WhatsApp', 'Grupos Ilimitados', 'API Access Beta', 'Gerente de Conta'] }
]

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [isActive, setIsActive] = useState(false)
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null)
    const [syncedAt, setSyncedAt] = useState<Date | null>(null)
    const [stats, setStats] = useState({ totalLinks: 0, groups: 0, messages: 0, conversions: 0 })
    const [recentLinks, setRecentLinks] = useState<{
        id: string; link_url: string; platform?: string; group_jid?: string; created_at: string
    }[]>([])
    const [chartData, setChartData] = useState<{ name: string; links: number }[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setIsActive(user.user_metadata?.subscription_status === 'active')

                // Fetch subscription expiration date from profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_expires_at')
                    .eq('id', user.id)
                    .single()
                if (profile?.subscription_expires_at) {
                    setSubscriptionExpiresAt(profile.subscription_expires_at)
                }

                // Fetch real stats from API
                try {
                    const [statsRes, linksRes] = await Promise.all([
                        fetch('/api/stats'),
                        fetch('/api/links'),
                    ])
                    if (statsRes.ok) {
                        const statsData = await statsRes.json()
                        setStats(prev => ({
                            ...prev,
                            totalLinks: statsData.totalLinks ?? 0,
                            groups: statsData.groups ?? 0,
                        }))
                        setChartData(statsData.chartData ?? [])
                    }
                    if (linksRes.ok) {
                        const linksData = await linksRes.json()
                        setRecentLinks((linksData.links ?? []).slice(0, 10))
                    }
                } catch {
                    // Non-fatal: stats stay at zero
                }

                setSyncedAt(new Date())
            }
            setLoading(false)
        }
        fetchDashboardData()
    }, [])

    // Supabase Realtime: listen for new captured_links and update live
    useEffect(() => {
        const channel = supabase
            .channel('dashboard_captured_links')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'captured_links' },
                (payload) => {
                    const newLink = payload.new as { id: string; link_url: string; platform?: string; group_jid?: string; created_at: string }
                    setRecentLinks(prev => [newLink, ...prev].slice(0, 10))
                    setStats(prev => ({ ...prev, totalLinks: prev.totalLinks + 1 }))
                }
            )
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [])

    if (loading) {
        return (
            <div className="space-y-8 pb-10 animate-pulse">
                {/* Header skeleton */}
                <div className="space-y-3">
                    <div className="h-3 w-32 bg-white/[0.04] rounded-full" />
                    <div className="h-10 w-72 bg-white/[0.04] rounded-2xl" />
                    <div className="h-3 w-48 bg-white/[0.03] rounded-full" />
                </div>
                {/* Stat cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-36 rounded-[2.5rem] bg-white/[0.03] border border-white/5" />
                    ))}
                </div>
                {/* Chart + links skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-80 rounded-[2.5rem] bg-white/[0.03] border border-white/5" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-3xl bg-white/[0.03] border border-white/5" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!isActive) {
        return (
            <div className="flex-grow bg-[#050505] p-6 md:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
                    <div className="space-y-4 px-4 md:px-0">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em]"
                        >
                            <Zap className="w-3 h-3" /> Assinatura Requerida
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic break-words leading-tight">Ative sua <span className="text-primary block sm:inline">Inteligência</span></h1>
                        <p className="text-muted md:text-xl font-medium max-w-2xl leading-relaxed">Sua conta está pronta. Escolha um plano de elite para liberar o monitoramento global de links.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {PLANS.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "bento-card p-10 space-y-8 relative group",
                                    plan.popular ? "border-primary/30 bg-primary/[0.03]" : ""
                                )}
                            >
                                <div className="inner-glow" />
                                {plan.popular && (
                                    <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                                        Mais Popular
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-white">R${plan.price}</span>
                                        <span className="text-muted font-bold text-[10px] uppercase tracking-widest">/mês</span>
                                    </div>
                                </div>
                                <ul className="space-y-4">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm font-bold text-white/70">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Zap className="w-3 h-3 text-primary" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/dashboard/checkout?plan=${plan.name.toLowerCase()}`}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-center block shadow-2xl relative overflow-hidden",
                                        plan.popular ? "bg-white text-black" : "bg-white/5 border border-white/5"
                                    )}
                                >
                                    <span className="relative z-10">Adquirir Agora</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-10 bento-card border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                        <div className="inner-glow" />
                        <div className="flex items-center gap-6 text-left">
                            <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-8 h-8 text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic">Pagamento Blindado</h3>
                                <p className="text-xs text-muted font-bold uppercase tracking-widest leading-relaxed">Processado via Mercado Pago com ativação instantânea.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const dashboardStats = useMemo(() => [
        { label: 'Links Capturados', value: stats.totalLinks.toString(), icon: Link2, trend: '+0%', trendUp: true, color: 'primary' },
        { label: 'Grupos Ativos', value: stats.groups.toString(), icon: Users, trend: '0', trendUp: true, color: 'secondary' },
        { label: 'Mensagens/Dia', value: stats.messages.toString(), icon: MessageSquare, trend: '+0%', trendUp: true, color: 'primary' },
        { label: 'Taxa de Conversão', value: `${stats.conversions}%`, icon: TrendingUp, trend: '+0%', trendUp: true, color: 'secondary' },
    ], [stats])

    const hasNoData = stats.totalLinks === 0 && stats.groups === 0 && stats.messages === 0

    return (
        <div className="flex-grow bg-[#050505] p-8 space-y-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Painel de <span className="text-primary italic">Inteligência</span></h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <p className="text-muted font-black text-[10px] uppercase tracking-widest">Sistemas Operantes em regime de alta performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {subscriptionExpiresAt && (
                        <div className="flex items-center gap-2 px-5 py-3 bg-primary/[0.04] border border-primary/10 rounded-2xl backdrop-blur-3xl shadow-2xl">
                            <CalendarClock className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                Renovação: {format(new Date(subscriptionExpiresAt), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                            {syncedAt
                                ? `Sincronizado: ${format(syncedAt, "HH:mm 'de' dd/MM", { locale: ptBR })}`
                                : 'Sincronizando...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bento-card p-8 group relative overflow-hidden"
                    >
                        <div className="inner-glow" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                stat.color === 'primary' ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/10 text-secondary border border-secondary/20"
                            )}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-black tracking-widest px-3 py-1 rounded-full border",
                                stat.trendUp ? "text-secondary bg-secondary/10 border-secondary/10" : "text-red-400 bg-red-400/10 border-red-400/10"
                            )}>
                                {stat.trend}
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <div className="mt-8 space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">{stat.label}</p>
                            <p className="text-4xl font-black text-white tracking-tighter leading-none italic">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Onboarding empty state */}
            {hasNoData && (
                <div className="bento-card p-10 space-y-8 relative overflow-hidden">
                    <div className="inner-glow" />
                    <div className="space-y-2 relative z-10">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Primeiros Passos</h2>
                        <p className="text-[10px] text-muted font-black uppercase tracking-widest">Complete os passos abaixo para começar a capturar links.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 relative z-10">
                        {[
                            { step: '1', title: 'Conectar WhatsApp', desc: 'Vincule sua sessão para monitorar grupos em tempo real.', href: '/dashboard/whatsapp', icon: MessageSquare },
                            { step: '2', title: 'Adicionar Grupos', desc: 'Selecione os grupos de origem onde os links serão capturados.', href: '/dashboard/grupos', icon: Users },
                            { step: '3', title: 'Configurar Links', desc: 'Defina os links de destino que serão substituídos automaticamente.', href: '/dashboard/links', icon: Link2 },
                        ].map(({ step, title, desc, href, icon: Icon }) => (
                            <Link
                                key={step}
                                href={href}
                                className="flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-primary/[0.04] hover:border-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">{step}</span>
                                    <Icon className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase tracking-wider">{title}</p>
                                    <p className="text-[9px] text-muted font-bold leading-relaxed uppercase">{desc}</p>
                                </div>
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Acessar →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Chart View */}
                <div className="lg:col-span-2 bento-card p-8 space-y-8 relative group min-h-[500px]">
                    <div className="inner-glow" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Fluxo Dinâmico</h2>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Atividade volumétrica (Últimas 24h)</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Engine Ativa</span>
                        </div>
                    </div>

                    <div className="flex-grow h-[350px] w-full relative z-10">
                        <DashboardChart data={chartData} />
                    </div>
                </div>

                {/* Recent Captures */}
                <div className="bento-card p-8 space-y-8 group relative overflow-hidden h-full">
                    <div className="inner-glow" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Recentes</h2>
                            <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Últimas capturas detectadas</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                            <Link2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentLinks.length > 0 ? (
                            recentLinks.map((link, i) => (
                                <motion.div
                                    key={link.id ?? i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/item cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white truncate max-w-[120px] uppercase italic" title={link.link_url}>
                                                {link.link_url.replace(/^https?:\/\//, '').split('/')[0]}
                                            </p>
                                            {link.group_jid && (
                                                <p className="text-[9px] text-muted font-bold tracking-tight uppercase">
                                                    Grupo: {link.group_jid.split('@')[0]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {link.platform && (
                                            <span className="text-[9px] font-black text-primary px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 uppercase">{link.platform}</span>
                                        )}
                                        <p className="text-[9px] text-muted font-bold mt-1 uppercase italic tracking-tighter">
                                            {new Date(link.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5">
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                    <AlertCircle className="w-7 h-7 text-muted opacity-30" />
                                </div>
                                <div className="space-y-2 px-6">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Pronto para Capturar</p>
                                    <p className="text-[9px] text-muted font-bold leading-relaxed uppercase">Conecte seu WhatsApp para monitorar links da Shopee, ML e Amazon.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="w-full py-5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all text-muted hover:text-white shadow-2xl mt-auto">
                        Inspecionar Histórico
                    </button>
                </div>
            </div>
        </div>
    )
}
