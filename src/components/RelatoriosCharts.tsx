'use client'

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
import { BarChart2, PieChart as PieChartIcon, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface PlatformEntry {
    name: string
    value: number
}

interface RelatoriosChartsProps {
    performanceData: { name: string; links: number }[]
    platformData: PlatformEntry[]
    periodLabel: string
    colors: string[]
}

export default function RelatoriosCharts({ performanceData, platformData, periodLabel, colors }: RelatoriosChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Bar Chart */}
            <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full -ml-40 -mt-40 pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-white">Capturas por Período</h2>
                        <p className="text-xs text-muted font-medium">Volume diário de links processados · {periodLabel}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary px-3 py-1.5 rounded-full bg-primary/10 border border-primary/10 uppercase tracking-widest">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +0% vs out.
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
                                <Bar dataKey="links" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center space-y-6 px-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto border border-white/5 opacity-40">
                                <BarChart2 className="w-10 h-10 text-muted" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black uppercase tracking-widest text-white/60">Sem dados ainda</p>
                                <p className="text-[10px] text-muted font-bold leading-relaxed uppercase">
                                    Conecte seu WhatsApp e monitore grupos para começar a gerar dados.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/whatsapp"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                            >
                                Conectar WhatsApp <ArrowUpRight className="w-3 h-3" />
                            </Link>
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
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
                    {platformData.length > 0 ? platformData.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                                <p className="text-xs font-black text-white uppercase tracking-wider">{p.name}</p>
                            </div>
                            <p className="text-xs font-black text-white">{p.value} <span className="text-[10px] text-muted ml-0.5">links</span></p>
                        </div>
                    )) : (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/5 text-center">
                            <p className="text-[10px] text-muted font-black uppercase tracking-[0.15em] italic">Inicie o robô para gerar insights.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
