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
    ChevronDown
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Toast } from '@/components/Toast'

const RelatoriosCharts = dynamic(() => import('@/components/RelatoriosCharts'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[500px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
            <div className="h-[500px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
        </div>
    ),
})

const PERIOD_OPTIONS = [
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 90 dias', value: '90d' },
]

// Brand Colors: Shopee (Orange), Mercado Livre (Yellow), Amazon (Blue)
const COLORS = ['#FF4D00', '#FFE600', '#0099FF']

export default function ReportsPage() {
    const [performanceData] = useState<{ name: string; links: number }[]>([])
    const [platformData] = useState<{ name: string; value: number }[]>([])
    const [stats] = useState({
        conversionRate: '0%',
        inactiveGroups: 0,
        bestTime: '--'
    })
    const [period, setPeriod] = useState(PERIOD_OPTIONS[0])
    const [periodOpen, setPeriodOpen] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

    return (
        <div className="space-y-10 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                        <BarChart2 className="w-3 h-3" /> Performance Insights
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Relatórios & Dados</h1>
                    <p className="text-muted font-medium">Análise detalhada da sua operação de captura.</p>
                </div>

                <div className="flex items-center gap-3 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    {/* Period selector */}
                    <div className="relative">
                        <button
                            onClick={() => setPeriodOpen(o => !o)}
                            aria-haspopup="listbox"
                            aria-expanded={periodOpen}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all"
                        >
                            <Calendar className="w-4 h-4 text-primary" />
                            {period.label}
                            <ChevronDown className={cn("w-3 h-3 transition-transform", periodOpen && "rotate-180")} />
                        </button>
                        {periodOpen && (
                            <div role="listbox" className="absolute top-full mt-2 left-0 z-50 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-44">
                                {PERIOD_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        role="option"
                                        aria-selected={period.value === opt.value}
                                        onClick={() => { setPeriod(opt); setPeriodOpen(false) }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors",
                                            period.value === opt.value
                                                ? "text-primary bg-primary/10"
                                                : "text-muted hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setToast({ message: 'Exportação em breve. Fique ligado!', type: 'info' })}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </header>

            <RelatoriosCharts
                performanceData={performanceData}
                platformData={platformData}
                periodLabel={period.label}
                colors={COLORS}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Taxa de Conversão Est.', value: stats.conversionRate, icon: TrendingUp, color: 'text-primary' },
                    { title: 'Grupos Inativos', value: stats.inactiveGroups, icon: Target, color: 'text-secondary' },
                    { title: 'Melhor Horário', value: stats.bestTime, icon: Zap, color: 'text-primary' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-8 rounded-3xl flex items-center justify-between group hover:translate-y-[-4px] transition-all duration-300">
                        <div className="space-y-3">
                            <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">{stat.title}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black tracking-tighter text-white">{stat.value}</p>
                                <span className="text-[10px] font-black text-primary flex items-center">
                                    <ArrowUpRight className="w-3 h-3" /> 0%
                                </span>
                            </div>
                        </div>
                        <div className={cn("w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl", stat.color)}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
