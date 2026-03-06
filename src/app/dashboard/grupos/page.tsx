'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Users,
    Search,
    Shield,
    ShieldOff,
    RefreshCw,
    MessageSquare,
    Globe,
    Target,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Toast } from '@/components/Toast'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { motion } from 'framer-motion'

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
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
    const [confirmTarget, setConfirmTarget] = useState<Group | null>(null)

    const fetchGroups = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/whatsapp/groups')
            if (!res.ok) throw new Error('Erro na resposta da API')
            const data = await res.json()
            setGroups(data.groups ?? [])
        } catch {
            setToast({ message: 'Erro ao carregar grupos. Tente novamente.', type: 'error' })
            setGroups([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchGroups() }, [fetchGroups])

    const filteredGroups = useMemo(() => groups.filter(g => {
        const matchesTab = tab === 'origin' ? !g.isDestination : g.isDestination
        const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
        return matchesTab && matchesSearch
    }), [groups, tab, search])

    const handleToggleMonitor = useCallback(async (group: Group) => {
        setLoadingIds(prev => new Set(prev).add(group.id))
        const newValue = !group.monitored
        try {
            const res = await fetch('/api/whatsapp/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_jid: group.id, group_name: group.name, field: 'monitored', value: newValue }),
            })
            if (!res.ok) throw new Error()
            setGroups(prev => prev.map(g => g.id === group.id ? { ...g, monitored: newValue } : g))
            setToast({ message: newValue ? 'Grupo ativado para monitoramento!' : 'Monitoramento pausado.', type: newValue ? 'success' : 'info' })
        } catch {
            setToast({ message: 'Erro ao atualizar grupo. Tente novamente.', type: 'error' })
        } finally {
            setLoadingIds(prev => { const s = new Set(prev); s.delete(group.id); return s })
        }
    }, [])

    const handleToggleDestination = useCallback(async (group: Group) => {
        if (group.isDestination) { setConfirmTarget(group); return }
        setLoadingIds(prev => new Set(prev).add(`dest-${group.id}`))
        try {
            const res = await fetch('/api/whatsapp/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_jid: group.id, group_name: group.name, field: 'is_destination', value: true }),
            })
            if (!res.ok) throw new Error()
            setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isDestination: true } : g))
            setToast({ message: `"${group.name}" adicionado como grupo destino!`, type: 'success' })
        } catch {
            setToast({ message: 'Erro ao definir destino. Tente novamente.', type: 'error' })
        } finally {
            setLoadingIds(prev => { const s = new Set(prev); s.delete(`dest-${group.id}`); return s })
        }
    }, [])

    const handleConfirmRemoveDestination = useCallback(async () => {
        if (!confirmTarget) return
        const group = confirmTarget
        setConfirmTarget(null)
        setLoadingIds(prev => new Set(prev).add(`dest-${group.id}`))
        try {
            const res = await fetch('/api/whatsapp/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_jid: group.id, group_name: group.name, field: 'is_destination', value: false }),
            })
            if (!res.ok) throw new Error()
            setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isDestination: false } : g))
            setToast({ message: `"${group.name}" removido dos grupos destino.`, type: 'info' })
        } catch {
            setToast({ message: 'Erro ao remover destino. Tente novamente.', type: 'error' })
        } finally {
            setLoadingIds(prev => { const s = new Set(prev); s.delete(`dest-${group.id}`); return s })
        }
    }, [confirmTarget])

    const originCount = groups.filter(g => !g.isDestination).length
    const destCount = groups.filter(g => g.isDestination).length

    return (
        <div className="space-y-8 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmDialog
                open={confirmTarget !== null}
                title="Remover grupo destino?"
                description={`"${confirmTarget?.name}" deixará de receber links substituídos. Você pode adicioná-lo novamente a qualquer momento.`}
                confirmLabel="Remover"
                variant="danger"
                onConfirm={handleConfirmRemoveDestination}
                onCancel={() => setConfirmTarget(null)}
            />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em]">
                        <div className="w-5 h-5 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-primary">Monitoring Hub</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">
                        Grupos do <span className="text-gradient italic">WhatsApp</span>
                    </h1>
                    <p className="text-muted font-medium text-sm">Gerencie quais grupos o robô deve observar.</p>
                </div>

                <button
                    onClick={fetchGroups}
                    aria-label="Atualizar lista de grupos"
                    className="flex items-center gap-2.5 px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl hover:bg-white/[0.08] transition-all text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                    <RefreshCw className={cn("w-4 h-4 text-primary", loading && "animate-spin")} />
                    Atualizar Lista
                </button>
            </header>

            {/* Tabs */}
            <div className="flex gap-3 flex-wrap">
                <button
                    role="tab"
                    aria-selected={tab === 'origin'}
                    onClick={() => setTab('origin')}
                    className={cn(
                        "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        tab === 'origin'
                            ? "bg-primary/10 border-primary/25 text-white shadow-lg shadow-primary/10"
                            : "bg-white/[0.03] border-white/[0.07] text-muted hover:text-white hover:border-white/15"
                    )}
                >
                    <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center border", tab === 'origin' ? "bg-primary/20 border-primary/30" : "bg-white/[0.05] border-white/10")}>
                        <Users className={cn("w-3 h-3", tab === 'origin' ? "text-primary" : "text-muted")} />
                    </div>
                    Grupos Espiões
                    <span className={cn("px-2 py-0.5 rounded-lg text-[8px] border", tab === 'origin' ? "bg-primary/15 border-primary/20 text-primary" : "bg-white/[0.05] border-white/10 text-muted")}>
                        {originCount}
                    </span>
                </button>
                <button
                    role="tab"
                    aria-selected={tab === 'destination'}
                    onClick={() => setTab('destination')}
                    className={cn(
                        "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        tab === 'destination'
                            ? "bg-secondary/10 border-secondary/25 text-white shadow-lg shadow-secondary/10"
                            : "bg-white/[0.03] border-white/[0.07] text-muted hover:text-white hover:border-white/15"
                    )}
                >
                    <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center border", tab === 'destination' ? "bg-secondary/15 border-secondary/25" : "bg-white/[0.05] border-white/10")}>
                        <Target className={cn("w-3 h-3", tab === 'destination' ? "text-secondary" : "text-muted")} />
                    </div>
                    Grupos VIP (Destino)
                    <span className={cn("px-2 py-0.5 rounded-lg text-[8px] border", tab === 'destination' ? "bg-secondary/15 border-secondary/20 text-secondary" : "bg-white/[0.05] border-white/10 text-muted")}>
                        {destCount}
                    </span>
                </button>
            </div>

            {/* Search */}
            <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3 group">
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                <Search className="w-4 h-4 text-muted group-focus-within:text-primary transition-colors shrink-0" />
                <input
                    type="text"
                    aria-label="Buscar grupos"
                    placeholder="Buscar entre seus grupos..."
                    className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-muted/50 py-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Groups grid */}
            <div id="tab-panel-grupos" role="tabpanel">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-52 rounded-3xl bg-white/[0.04] animate-pulse border border-white/[0.05]" />
                        ))}
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredGroups.map((group, index) => {
                            const destLoading = loadingIds.has(`dest-${group.id}`)
                            const monitorLoading = loadingIds.has(group.id)
                            return (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className={cn(
                                        "relative rounded-3xl border p-6 space-y-5 hover:translate-y-[-3px] transition-all duration-300 overflow-hidden",
                                        group.monitored
                                            ? "bg-gradient-to-br from-primary/8 to-primary/[0.02] border-primary/20 shadow-lg shadow-primary/5"
                                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                                    )}
                                >
                                    {group.monitored && (
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                    )}

                                    <div className="flex items-start justify-between">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-400",
                                            group.isDestination
                                                ? "bg-secondary/10 text-secondary border-secondary/20"
                                                : group.monitored
                                                    ? "bg-primary/15 text-primary border-primary/25"
                                                    : "bg-white/[0.05] text-muted border-white/[0.08]"
                                        )}>
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            {group.monitored && (
                                                <span className="px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                    Monitorando
                                                </span>
                                            )}
                                            {group.isDestination && (
                                                <span className="px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20">
                                                    Destino VIP
                                                </span>
                                            )}
                                            {!group.monitored && !group.isDestination && (
                                                <span className="px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-white/[0.05] text-muted border border-white/10 opacity-60">
                                                    Pausado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-black text-lg text-white tracking-tight truncate" title={group.name}>
                                            {group.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <span className="text-[10px] text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                                <Users className="w-3 h-3 text-primary/60" /> {group.members}
                                            </span>
                                            <span className="text-[10px] text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                                <MessageSquare className="w-3 h-3 text-secondary/60" /> {group.lastMsg}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => handleToggleDestination(group)}
                                            disabled={destLoading}
                                            aria-label={group.isDestination ? `Remover ${group.name} dos grupos destino` : `Tornar ${group.name} grupo destino`}
                                            className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/[0.08] hover:border-white/15 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-muted hover:text-white"
                                        >
                                            {destLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                                            {tab === 'origin' ? 'Tornar Destino' : 'Remover Destino'}
                                        </button>
                                        <button
                                            onClick={() => handleToggleMonitor(group)}
                                            disabled={monitorLoading}
                                            aria-label={group.monitored ? `Pausar monitoramento de ${group.name}` : `Ativar monitoramento de ${group.name}`}
                                            className={cn(
                                                "p-3 rounded-2xl transition-all border disabled:opacity-50",
                                                group.monitored
                                                    ? "text-red-400 bg-red-400/[0.08] border-red-400/15 hover:bg-red-400 hover:text-white"
                                                    : "text-primary bg-primary/[0.08] border-primary/15 hover:bg-primary hover:text-white"
                                            )}
                                        >
                                            {monitorLoading
                                                ? <RefreshCw className="w-5 h-5 animate-spin" />
                                                : group.monitored ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />
                                            }
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="premium-card rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />
                        <div className="w-20 h-20 rounded-[2rem] bg-white/[0.04] flex items-center justify-center border border-white/[0.08] shadow-inner relative z-10">
                            <Users className="w-10 h-10 text-muted opacity-30" />
                        </div>
                        <div className="space-y-3 relative z-10">
                            <h3 className="text-2xl font-black tracking-tight text-white">Nenhum Grupo Conectado</h3>
                            <p className="text-muted font-medium max-w-sm mx-auto leading-relaxed text-sm">
                                Conecte seu WhatsApp e entre em pelo menos um grupo para começar o monitoramento.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                            <button
                                onClick={fetchGroups}
                                className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                <Zap className="w-3.5 h-3.5 inline mr-1.5" />
                                Verificar Grupos
                            </button>
                            <Link
                                href="/dashboard/whatsapp"
                                className="px-6 py-3 bg-white/[0.04] border border-white/[0.08] text-muted font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/[0.08] transition-all text-center"
                            >
                                Conectar WhatsApp
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
