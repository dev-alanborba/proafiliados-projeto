'use client'

import React, { useState, useEffect } from 'react'
import {
    Zap,
    Users,
    Link2,
    MessageSquare,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ShieldCheck,
    AlertCircle,
    CalendarClock,
    Check,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const DashboardChart = dynamic(
    () => import('@/components/DashboardChart').catch(() => {
        return { default: () => <div className="flex items-center justify-center h-full text-muted text-sm">Gráfico indisponível</div> }
    }),
    {
        ssr: false,
        loading: () => <div className="flex-grow h-[350px] w-full bg-white/[0.02] rounded-2xl animate-pulse" />,
    }
)

const supabase = createClient()

const PLANS = [
    {
        name: 'Starter',
        price: '47',
        features: ['Monitoramento em 1 grupo', 'Captura de até 50 links/dia', 'Relatórios básicos', 'Suporte via WhatsApp'],
        popular: false,
    },
    {
        name: 'Enterprise',
        price: '97',
        features: ['Monitoramento em 10 grupos', 'Captura ilimitada de links', 'Relatórios avançados', 'Suporte prioritário', 'API de integração'],
        popular: true,
    },
    {
        name: 'Ultimate',
        price: '197',
        features: ['Monitoramento ilimitado', 'Captura ilimitada de links', 'Relatórios premium', 'Suporte dedicado', 'API completa', 'Automação de mensagens'],
        popular: false,
    },
]

const STAT_CONFIGS = [
    {
        label: 'Links Capturados', icon: Link2,
        gradient: 'from-violet-500/15 to-violet-500/5',
        border: 'border-violet-500/20',
        iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
        glow: 'shadow-violet-500/10',
        trendColor: 'text-violet-400 bg-violet-400/10 border-violet-400/10',
    },
    {
        label: 'Grupos Ativos', icon: Users,
        gradient: 'from-emerald-500/15 to-emerald-500/5',
        border: 'border-emerald-500/20',
        iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        glow: 'shadow-emerald-500/10',
        trendColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/10',
    },
    {
        label: 'Mensagens/Dia', icon: MessageSquare,
        gradient: 'from-blue-500/15 to-blue-500/5',
        border: 'border-blue-500/20',
        iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        glow: 'shadow-blue-500/10',
        trendColor: 'text-blue-400 bg-blue-400/10 border-blue-400/10',
    },
    {
        label: 'Taxa de Conversão', icon: TrendingUp,
        gradient: 'from-amber-500/15 to-amber-500/5',
        border: 'border-amber-500/20',
        iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        glow: 'shadow-amber-500/10',
        trendColor: 'text-amber-400 bg-amber-400/10 border-amber-400/10',
    },
]

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [isActive, setIsActive] = useState(false)
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null)
    const [syncedAt, setSyncedAt] = useState<string | null>(null)
    const [stats, setStats] = useState({ totalLinks: 0, groups: 0, messages: 0, conversions: 0 })
    const [chartData, setChartData] = useState<{ name: string; links: number }[]>([])
    const [recentLinks, setRecentLinks] = useState<{ id: string; link_url: string; platform?: string; group_jid?: string; created_at: string }[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('subscription_status, subscription_expires_at')
                        .eq('id', user.id)
                        .maybeSingle()
                    const isProfileActive = profile?.subscription_status === 'active'
                    const isMetadataActive = user.user_metadata?.subscription_status === 'active'
                    setIsActive(isProfileActive || isMetadataActive)
                    if (profile?.subscription_expires_at) {
                        setSubscriptionExpiresAt(profile.subscription_expires_at)
                    }
                    try {
                        const [statsRes, linksRes] = await Promise.all([
                            fetch('/api/stats'),
                            fetch('/api/links'),
                        ])
                        if (statsRes.ok) {
                            const statsData = await statsRes.json()
                            setStats(prev => ({ ...prev, totalLinks: statsData.totalLinks ?? 0, groups: statsData.groups ?? 0 }))
                            setChartData(statsData.chartData ?? [])
                        }
                        if (linksRes.ok) {
                            const linksData = await linksRes.json()
                            setRecentLinks((linksData.links ?? []).slice(0, 10))
                        }
                    } catch { /* Non-fatal */ }
                    const now = new Date()
                    setSyncedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err)
            }
            setLoading(false)
        }
        fetchDashboardData()
    }, [])

    useEffect(() => {
        const channel = supabase
            .channel('dashboard_captured_links')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'captured_links' }, (payload) => {
                const newLink = payload.new as { id: string; link_url: string; platform?: string; group_jid?: string; created_at: string }
                setRecentLinks(prev => [newLink, ...prev].slice(0, 10))
                setStats(prev => ({ ...prev, totalLinks: prev.totalLinks + 1 }))
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [])

    if (loading) {
        return (
            <div className="space-y-8 pb-10">
                <div className="space-y-3">
                    <div className="h-3 w-32 bg-white/[0.04] rounded-full animate-pulse" />
                    <div className="h-10 w-72 bg-white/[0.04] rounded-2xl animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-36 rounded-3xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 rounded-3xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!isActive) {
        return (
            <div className="flex-grow p-6 md:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                            <Zap className="w-3 h-3" /> Assinatura Requerida
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic leading-tight">
                            Ative sua <span className="text-gradient">Inteligência</span>
                        </h1>
                        <p className="text-muted md:text-xl font-medium max-w-2xl leading-relaxed">
                            Sua conta está pronta. Escolha um plano de elite para liberar o monitoramento global de links.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {PLANS.map((plan, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "relative rounded-[2rem] border p-8 space-y-8 overflow-hidden",
                                    plan.popular
                                        ? "bg-gradient-to-b from-primary/10 to-primary/[0.03] border-primary/25 shadow-[0_30px_60px_-15px_rgba(124,58,237,0.2)]"
                                        : "bg-white/[0.02] border-white/[0.06]"
                                )}
                            >
                                {plan.popular && (
                                    <>
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                                        <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-xl shadow-primary/30">
                                            Mais Popular
                                        </div>
                                    </>
                                )}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white">R${plan.price}</span>
                                        <span className="text-muted font-bold text-[10px] uppercase tracking-widest">/mês</span>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm font-bold text-white/70">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-primary" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/dashboard/checkout?plan=${plan.name.toLowerCase()}`}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-center block",
                                        plan.popular
                                            ? "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-95"
                                            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                    )}
                                >
                                    Adquirir Agora
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col md:flex-row items-center justify-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-7 h-7 text-secondary" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-base font-black text-white uppercase italic">Pagamento Blindado</h3>
                            <p className="text-xs text-muted font-bold uppercase tracking-widest">Processado via Mercado Pago com ativação instantânea.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const dashboardStats = [
        { ...STAT_CONFIGS[0], value: stats.totalLinks.toString(), trend: '+0%' },
        { ...STAT_CONFIGS[1], value: stats.groups.toString(), trend: '0' },
        { ...STAT_CONFIGS[2], value: stats.messages.toString(), trend: '+0%' },
        { ...STAT_CONFIGS[3], value: `${stats.conversions}%`, trend: '+0%' },
    ]

    const hasNoData = stats.totalLinks === 0 && stats.groups === 0 && stats.messages === 0

    return (
        <div className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary/60" />
                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Painel de Inteligência</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        Visão <span className="text-gradient italic">Geral</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-secondary animate-ping opacity-60" />
                        </div>
                        <p className="text-muted font-black text-[10px] uppercase tracking-widest">Sistemas Operantes em Alta Performance</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {subscriptionExpiresAt && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06] border border-primary/15 rounded-2xl backdrop-blur-xl">
                            <CalendarClock className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                Renova: {(() => { try { return new Date(subscriptionExpiresAt).toLocaleDateString('pt-BR') } catch { return '—' } })()}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                            {syncedAt ?? 'Sincronizando...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {dashboardStats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "relative rounded-3xl border p-6 overflow-hidden group transition-all duration-400 hover:translate-y-[-3px] bg-gradient-to-br",
                            stat.gradient, stat.border, `shadow-xl ${stat.glow}`
                        )}
                    >
                        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="flex justify-between items-start">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-400 group-hover:scale-110",
                                stat.iconBg
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-xl border",
                                stat.trendColor
                            )}>
                                {stat.trend}
                                <ArrowUpRight className="w-3 h-3" />
                            </div>
                        </div>
                        <div className="mt-6 space-y-0.5">
                            <p className="text-[9px] font-black text-muted uppercase tracking-[0.35em]">{stat.label}</p>
                            <p className="text-4xl font-black text-white tracking-tighter leading-none italic">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Onboarding */}
            {hasNoData && (
                <div className="bento-card p-8 relative group">
                    <div className="inner-glow" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Zap className="w-10 h-10 text-primary" />
                        </div>
                        <div className="flex-1 text-center lg:text-left space-y-3">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Configure seu Sistema</h2>
                            <p className="text-sm text-muted font-medium leading-relaxed max-w-xl">Conecte seu WhatsApp e adicione grupos para iniciar a captura inteligente de links de afiliados.</p>
                        </div>
                        <Link
                            href="/dashboard/whatsapp"
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-primary/25 hover:opacity-95 transition-all whitespace-nowrap"
                        >
                            Conectar WhatsApp
                        </Link>
                    </div>
                </div>
            )}

            {/* Chart + Recent Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bento-card p-7 space-y-6 relative group min-h-[480px]">
                    <div className="inner-glow" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Fluxo Dinâmico</h2>
                            <p className="text-[9px] text-muted font-black uppercase tracking-widest">Atividade volumétrica • Últimas 24h</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-xl">
                            <div className="relative">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-secondary animate-ping opacity-60" />
                            </div>
                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Engine Ativa</span>
                        </div>
                    </div>
                    <div className="flex-grow h-[350px] w-full relative z-10">
                        <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-muted text-sm">Gráfico indisponível</div>}>
                            <DashboardChart data={chartData} />
                        </ErrorBoundary>
                    </div>
                </div>

                <div className="bento-card p-7 space-y-5 relative group">
                    <div className="inner-glow" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black tracking-tight text-white uppercase italic">Capturas Recentes</h2>
                            <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Últimas ofertas detectadas</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                            <Link2 className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                        {recentLinks.length > 0 ? (
                            recentLinks.map((link, i) => {
                                const platformColors: Record<string, string> = {
                                    'Shopee': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                                    'Mercado Livre': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                                    'Amazon': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                }
                                const pc = link.platform ? (platformColors[link.platform] || 'bg-primary/10 text-primary border-primary/20') : 'bg-primary/10 text-primary border-primary/20'
                                return (
                                    <div
                                        key={link.id ?? i}
                                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all cursor-pointer"
                                    >
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", pc)}>
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-white truncate uppercase italic">
                                                {link.link_url?.replace(/^https?:\/\//, '').split('/')[0] ?? 'Link'}
                                            </p>
                                            {link.group_jid && (
                                                <p className="text-[8px] text-muted font-bold tracking-tight uppercase truncate">
                                                    {link.group_jid.split('@')[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {link.platform && (
                                                <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase", pc)}>
                                                    {link.platform.split(' ')[0]}
                                                </span>
                                            )}
                                            <p className="text-[8px] text-muted font-bold mt-1 uppercase">
                                                {(() => { try { return new Date(link.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } catch { return '—' } })()}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-14 text-center space-y-4 bg-white/[0.01] rounded-3xl border border-dashed border-white/[0.06]">
                                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
                                    <AlertCircle className="w-6 h-6 text-muted opacity-40" />
                                </div>
                                <div className="space-y-1.5 px-4">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Pronto para Capturar</p>
                                    <p className="text-[9px] text-muted font-bold leading-relaxed uppercase">Conecte seu WhatsApp para monitorar links.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/dashboard/links"
                        className="relative z-10 w-full py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/[0.07] transition-all text-muted hover:text-white text-center block"
                    >
                        Ver Histórico Completo
                    </Link>
                </div>
            </div>
        </div>
    )
}
