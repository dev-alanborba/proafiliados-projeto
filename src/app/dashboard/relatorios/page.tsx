'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
    Calendar,
    Download,
    TrendingUp,
    Target,
    Zap,
    BarChart2,
    ArrowUpRight,
    ChevronDown,
    Sparkles
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Toast } from '@/components/Toast'

const RelatoriosCharts = dynamic(() => import('@/components/RelatoriosCharts'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] animate-pulse" />
            <div className="h-[500px] rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] animate-pulse" />
        </div>
    ),
})

const PERIOD_OPTIONS = [
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 90 dias', value: '90d' },
]

const COLORS = ['#FF4D00', '#FFE600', '#0099FF']

const STAT_CARDS = [
    {
        title: 'Taxa de Conversão Est.',
        key: 'conversionRate',
        icon: TrendingUp,
        gradient: 'from-violet-500/10 to-violet-500/5',
        border: 'border-violet-500/20',
        iconClass: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
        trendClass: 'text-violet-400',
    },
    {
        title: 'Grupos Inativos',
        key: 'inactiveGroups',
        icon: Target,
        gradient: 'from-emerald-500/10 to-emerald-500/5',
        border: 'border-emerald-500/20',
        iconClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        trendClass: 'text-emerald-400',
    },
    {
        title: 'Melhor Horário',
        key: 'bestTime',
        icon: Zap,
        gradient: 'from-amber-500/10 to-amber-500/5',
        border: 'border-amber-500/20',
        iconClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        trendClass: 'text-amber-400',
    },
]

export default function ReportsPage() {
    const [performanceData] = useState<{ name: string; links: number }[]>([])
    const [platformData] = useState<{ name: string; value: number }[]>([])
    const [stats] = useState({ conversionRate: '0%', inactiveGroups: 0, bestTime: '--' })
    const [period, setPeriod] = useState(PERIOD_OPTIONS[0])
    const [periodOpen, setPeriodOpen] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

    const statValues: Record<string, string | number> = {
        conversionRate: stats.conversionRate,
        inactiveGroups: stats.inactiveGroups,
        bestTime: stats.bestTime,
    }

    return (
        <div className="space-y-8 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em]">
                        <div className="w-5 h-5 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <BarChart2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-primary">Performance Insights</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">
                        Relatórios <span className="text-gradient italic">& Dados</span>
                    </h1>
                    <p className="text-muted font-medium text-sm">Análise detalhada da sua operação de captura.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Period selector */}
                    <div className="relative">
                        <button
                            onClick={() => setPeriodOpen(o => !o)}
                            aria-haspopup="listbox"
                            aria-expanded={periodOpen}
                            className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-all hover:border-white/15"
                        >
                            <Calendar className="w-4 h-4 text-primary" />
                            {period.label}
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", periodOpen && "rotate-180")} />
                        </button>
                        {periodOpen && (
                            <div className="absolute top-full mt-2 left-0 z-50 bg-[#0a0a14] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl w-48 backdrop-blur-xl">
                                {PERIOD_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setPeriod(opt); setPeriodOpen(false) }}
                                        className={cn(
                                            "w-full text-left px-4 py-3.5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2",
                                            period.value === opt.value
                                                ? "text-primary bg-primary/10"
                                                : "text-muted hover:text-white hover:bg-white/[0.05]"
                                        )}
                                    >
                                        {period.value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setToast({ message: 'Exportação em breve. Fique ligado!', type: 'info' })}
                        className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl hover:opacity-90 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </header>

            {/* Charts */}
            <RelatoriosCharts
                performanceData={performanceData}
                platformData={platformData}
                periodLabel={period.label}
                colors={COLORS}
            />

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {STAT_CARDS.map((card, i) => (
                    <div
                        key={i}
                        className={cn(
                            "relative rounded-3xl border p-7 flex items-center justify-between group hover:translate-y-[-3px] transition-all duration-300 overflow-hidden bg-gradient-to-br",
                            card.gradient, card.border
                        )}
                    >
                        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

                        <div className="space-y-3">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-muted/40" />
                                <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em]">{card.title}</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black tracking-tighter text-white">{statValues[card.key]}</p>
                                <span className={cn("text-[9px] font-black flex items-center", card.trendClass)}>
                                    <ArrowUpRight className="w-3 h-3" /> 0%
                                </span>
                            </div>
                        </div>

                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-400 shadow-xl",
                            card.iconClass
                        )}>
                            <card.icon className="w-7 h-7" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming soon notice */}
            <div className="premium-card rounded-3xl p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-black text-white">Relatórios avançados em breve</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">
                        Análise por período, exportação CSV e insights de performance estão chegando.
                    </p>
                </div>
            </div>
        </div>
    )
}
