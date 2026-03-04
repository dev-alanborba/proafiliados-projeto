'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Search,
    Shield,
    ShieldOff,
    RefreshCw,
    MessageSquare,
    Globe,
    AlertCircle,
    Target
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface Group {
    id: string;
    name: string;
    monitored: boolean;
    members: number;
    lastMsg: string;
    isDestination?: boolean;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tab, setTab] = useState<'origin' | 'destination'>('origin')

    const fetchGroups = async () => {
        setLoading(true)
        // Fetch from Supabase/Evolution API
        setTimeout(() => {
            setGroups([])
            setLoading(false)
        }, 500)
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const filteredGroups = groups.filter(g => {
        const matchesTab = tab === 'origin' ? !g.isDestination : g.isDestination
        const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
        return matchesTab && matchesSearch
    })

    return (
        <div className="space-y-10 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                        <Globe className="w-3 h-3" /> Monitoring Hub
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Grupos do WhatsApp</h1>
                    <p className="text-muted font-medium">Gerencie quais grupos o robô deve observar.</p>
                </div>

                <button
                    onClick={fetchGroups}
                    className="flex items-center gap-3 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest shadow-xl"
                >
                    <RefreshCw className={cn("w-4 h-4 text-primary", loading && "animate-spin")} />
                    Atualizar Lista
                </button>
            </header>

            {/* Tabs for Origin vs Destination */}
            <div className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <button
                    onClick={() => setTab('origin')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        tab === 'origin' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-white"
                    )}
                >
                    Grupos Espiões (Origem)
                </button>
                <button
                    onClick={() => setTab('destination')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        tab === 'destination' ? "bg-white text-black shadow-lg shadow-white/20" : "text-muted hover:text-white"
                    )}
                >
                    <Target className="w-4 h-4" /> Seus Grupos VIP (Destino)
                </button>
            </div>

            <div className="glass-card p-4 rounded-2xl flex items-center gap-4 group relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                <Search className="w-5 h-5 text-muted ml-2 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar entre seus grupos..."
                    className="bg-transparent border-none outline-none text-sm w-full font-bold placeholder:text-muted/50 py-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-56 rounded-3xl bg-white/5 animate-pulse border border-white/5 shadow-2xl" />
                    ))}
                </div>
            ) : filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                    <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    {filteredGroups.map((group) => (
                        <div key={group.id} className="glass-card rounded-[2.5rem] p-8 space-y-6 hover:translate-y-[-4px] transition-all duration-300 group shadow-2xl relative overflow-hidden">
                            <div className={cn(
                                "absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full -mr-12 -mt-12 transition-opacity opacity-0 group-hover:opacity-100",
                                group.monitored ? "bg-primary/20" : "bg-white/10"
                            )} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                    group.monitored ? "bg-primary/20 text-primary border-primary/20 shadow-lg shadow-primary/10" : "bg-white/5 text-muted border-white/10"
                                )}>
                                    <Users className="w-7 h-7" />
                                </div>
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                    group.monitored
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-white/5 text-muted border-white/10 opacity-50"
                                )}>
                                    {group.monitored ? 'Ativo' : 'Pausado'}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-black text-xl text-white tracking-tight truncate">{group.name}</h3>
                                <div className="flex items-center gap-5 mt-2">
                                    <span className="text-[10px] text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                        <Users className="w-3.5 h-3.5 text-primary" /> {group.members}
                                    </span>
                                    <span className="text-[10px] text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                        <MessageSquare className="w-3.5 h-3.5 text-secondary" /> {group.lastMsg}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 relative z-10">
                                <button className="flex-grow py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg">
                                    {tab === 'origin' ? 'Tornar Destino' : 'Remover Destino'}
                                </button>
                                <button className={cn(
                                    "p-3.5 rounded-2xl transition-all border shadow-lg group/btn",
                                    group.monitored
                                        ? "text-red-400 bg-red-400/10 border-red-400/10 hover:bg-red-400 hover:text-white"
                                        : "text-primary bg-primary/10 border-primary/10 hover:bg-primary hover:text-white"
                                )}>
                                    {group.monitored ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full translate-y-1/2 pointer-events-none" />

                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Users className="w-12 h-12 text-muted opacity-30" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <h3 className="text-3xl font-black tracking-tight text-white">Nenhum Grupo Conectado</h3>
                        <p className="text-muted font-medium max-w-sm mx-auto leading-relaxed">
                            Você precisa conectar seu WhatsApp e estar em pelo menos um grupo para começar o monitoramento.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <button
                            onClick={fetchGroups}
                            className="px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                            Verificar Grupos
                        </button>
                        <button
                            className="px-8 py-4 bg-white/5 border border-white/10 text-muted font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                        >
                            Conectar WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

