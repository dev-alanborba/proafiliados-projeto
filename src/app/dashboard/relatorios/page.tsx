'use client'

import { useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import {
    Calendar,
    Download,
    TrendingUp,
    Target,
    Zap,
    BarChart2,
    PieChart as PieChartIcon,
    ArrowUpRight
} from 'lucide-react'
import { cn } from "@/lib/utils"

export default function ReportsPage() {
    const [performanceData] = useState([])
    const [platformData] = useState([])
    const [stats] = useState({
        conversionRate: '0%',
        inactiveGroups: 0,
        bestTime: '--'
    })

    // Brand Colors: Shopee (Orange), Mercado Livre (Yellow), Amazon (Blue)
    const COLORS = ['#FF4D00', '#FFE600', '#0099FF']

    return (
        <div className="space-y-10 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                        <BarChart2 className="w-3 h-3" /> Performance Insights
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Relatórios & Dados</h1>
                    <p className="text-muted font-medium">Análise detalhada da sua operação de captura.</p>
                </div>

                <div className="flex items-center gap-3 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all">
                        <Calendar className="w-4 h-4 text-primary" />
                        Últimos 7 dias
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Bar Chart */}
                <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full -ml-40 -mt-40 pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight text-white">Capturas por Período</h2>
                            <p className="text-xs text-muted font-medium">Volume diário de links processados</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary px-3 py-1.5 rounded-full bg-primary/10 border border-primary/10 uppercase tracking-widest">
                            <TrendingUp className="w-3.5 h-3.5" /> +0% vs out.
                        </div>
                    </div>

                    <div className="h-[380px] w-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] relative z-10">
                        {performanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(124,58,237,0.05)' }}
                                        contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                        itemStyle={{ color: '#7c3aed' }}
                                    />
                                    <Bar dataKey="links" fill="#7c3aed" radius={[6, 6, 0, 0]} className="hover:opacity-80 transition-opacity" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center space-y-4 opacity-30">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                                    <BarChart2 className="w-10 h-10 text-muted" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-widest">Aguardando dados iniciais</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Platform Pie Chart */}
                <div className="glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -mr-32 -mb-32 pointer-events-none" />

                    <div className="space-y-1 relative z-10">
                        <h2 className="text-2xl font-black tracking-tight text-white">Market Share</h2>
                        <p className="text-xs text-muted font-medium">Distribuição por plataforma</p>
                    </div>

                    <div className="h-[280px] w-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] relative z-10">
                        {platformData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={platformData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {platformData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer shadow-xl" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center space-y-4 opacity-30">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                                    <PieChartIcon className="w-8 h-8 text-muted" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Sem capturas para exibir</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 relative z-10">
                        {platformData.length > 0 ? platformData.map((p: { name: string, value: number }, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: COLORS[i], backgroundColor: COLORS[i] }} />
                                    <p className="text-xs font-black text-white uppercase tracking-wider">{p.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-white">{p.value} <span className="text-[10px] text-muted ml-0.5">links</span></p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/5 text-center">
                                <p className="text-[10px] text-muted font-black uppercase tracking-[0.15em] italic">Inicie o robô para gerar insights.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

