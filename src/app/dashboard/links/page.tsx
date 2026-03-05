'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Link2,
    ExternalLink,
    User,
    Hash,
    Calendar,
    Check,
    Zap,
    Copy
} from 'lucide-react'
import { cn } from "@/lib/utils"

const PLATFORMS = ['All', 'Shopee', 'Mercado Livre', 'Amazon']

export default function LinksPage() {
    const [links, setLinks] = useState<{ id: string, url: string, original_url: string, short_url: string, clicks: number, created_at: string, platform?: string, title?: string, group?: string, sender?: string, date?: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [filter, setFilter] = useState('All')

    const fetchLinks = useCallback(async () => {
        setLoading(true)
        // Fetch from Supabase
        setTimeout(() => {
            setLinks([])
            setLoading(false)
        }, 500)
    }, [])

    useEffect(() => {
        fetchLinks()
    }, [fetchLinks])

    const handleCopy = useCallback((url: string, id: string) => {
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }, [])

    const filteredLinks = useMemo(
        () => filter === 'All' ? links : links.filter(l => l.platform === filter),
        [filter, links]
    )

    return (
        <div className="space-y-10 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                        <Link2 className="w-3 h-3" /> Capture Engine
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Links Capturados</h1>
                    <p className="text-muted font-medium">Histórico global de ofertas detectadas.</p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto max-w-full">
                    {PLATFORMS.map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-xs font-black transition-all border whitespace-nowrap",
                                filter === p
                                    ? "bg-primary text-white border-primary/20 shadow-lg shadow-primary/10"
                                    : "text-muted hover:text-white hover:bg-white/5 border-transparent"
                            )}
                        >
                            {p === 'All' ? 'Todos' : p}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-28 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                    ))
                ) : filteredLinks.length > 0 ? (
                    filteredLinks.map((link) => (
                        <div key={link.id} className="glass-card rounded-3xl p-6 hover:translate-y-[-2px] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
                            <div className="flex items-center gap-6 flex-grow">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-500 shrink-0 shadow-lg",
                                    link.platform === 'Shopee' ? "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/5" :
                                        link.platform === 'Mercado Livre' ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20 shadow-yellow-400/5" :
                                            link.platform === 'Amazon' ? "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5" :
                                                "bg-primary/10 text-primary border-primary/20 shadow-primary/5"
                                )}>
                                    <Zap className="w-8 h-8" />
                                </div>

                                <div className="min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black truncate text-white tracking-tight">{link.title}</h3>
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/5 text-muted border border-white/10 uppercase tracking-widest">
                                            {link.platform}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                                        <div className="text-xs text-muted font-bold flex items-center gap-1.5">
                                            <Hash className="w-3.5 h-3.5 text-primary" /> {link.group}
                                        </div>
                                        <div className="text-xs text-muted font-bold flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-secondary" /> {link.sender}
                                        </div>
                                        <div className="text-xs text-muted font-bold flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 opacity-50" /> {link.date}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 relative z-10">
                                <button
                                    onClick={() => handleCopy(link.url, link.id)}
                                    className="flex-grow md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest shadow-xl"
                                >
                                    {copiedId === link.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                                    {copiedId === link.id ? 'Copiado' : 'Link'}
                                </button>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-grow md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3.5 bg-primary text-white rounded-2xl hover:opacity-90 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    <ExternalLink className="w-4 h-4" /> Abrir
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-card rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full translate-y-1/2 pointer-events-none" />

                        <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Link2 className="w-12 h-12 text-muted opacity-30" />
                        </div>

                        <div className="space-y-3 relative z-10">
                            <h3 className="text-2xl font-black tracking-tight text-white">Nenhum Link Detectado</h3>
                            <p className="text-muted font-medium max-w-sm mx-auto leading-relaxed">
                                O motor de busca está operante e aguardando ofertas da Shopee, Mercado Livre ou Amazon nos grupos monitorados.
                            </p>
                        </div>

                        <button
                            onClick={fetchLinks}
                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-white hover:bg-white/10 transition-all relative z-10"
                        >
                            Atualizar Agora
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
