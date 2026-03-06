'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Link2,
    ExternalLink,
    User,
    Hash,
    Calendar,
    Check,
    Zap,
    Copy,
    ShoppingBag,
    Package
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Toast } from '@/components/Toast'
import { motion } from 'framer-motion'

const PLATFORMS = ['All', 'Shopee', 'Mercado Livre', 'Amazon']

const PLATFORM_CONFIG: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
    'Shopee':        { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: ShoppingBag },
    'Mercado Livre': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: Package },
    'Amazon':        { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   icon: Package },
}

export default function LinksPage() {
    const [links, setLinks] = useState<{
        id: string
        link_url: string
        platform?: string
        sender_name?: string
        group_jid?: string
        created_at: string
    }[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [filter, setFilter] = useState('All')
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

    const fetchLinks = useCallback(async () => {
        setLoading(true)
        try {
            const params = filter !== 'All' ? `?platform=${encodeURIComponent(filter)}` : ''
            const res = await fetch(`/api/links${params}`)
            if (!res.ok) throw new Error('Erro na resposta da API')
            const data = await res.json()
            setLinks(data.links ?? [])
        } catch {
            setToast({ message: 'Erro ao carregar links. Tente novamente.', type: 'error' })
            setLinks([])
        } finally {
            setLoading(false)
        }
    }, [filter])

    const handleCopy = useCallback(async (url: string, id: string) => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
            } else {
                const el = document.createElement('textarea')
                el.value = url
                el.style.position = 'fixed'
                el.style.opacity = '0'
                document.body.appendChild(el)
                el.select()
                document.execCommand('copy')
                document.body.removeChild(el)
            }
            setCopiedId(id)
            setToast({ message: 'Link copiado com sucesso!', type: 'success' })
            setTimeout(() => setCopiedId(null), 2000)
        } catch {
            setToast({ message: 'Não foi possível copiar. Copie manualmente.', type: 'error' })
        }
    }, [])

    useEffect(() => { fetchLinks() }, [fetchLinks])

    return (
        <div className="space-y-8 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em]">
                        <div className="w-5 h-5 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Link2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-primary">Capture Engine</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">
                        Links <span className="text-gradient italic">Capturados</span>
                    </h1>
                    <p className="text-muted font-medium text-sm">Histórico global de ofertas detectadas.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl backdrop-blur-md overflow-x-auto max-w-full">
                    {PLATFORMS.map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                                filter === p
                                    ? "bg-primary text-white border-primary/30 shadow-lg shadow-primary/15"
                                    : "text-muted hover:text-white hover:bg-white/[0.05] border-transparent"
                            )}
                        >
                            {p === 'All' ? 'Todos' : p}
                        </button>
                    ))}
                </div>
            </header>

            {/* Count badge */}
            {!loading && links.length > 0 && (
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[10px] font-black text-muted uppercase tracking-widest">
                        {links.length} {links.length === 1 ? 'link capturado' : 'links capturados'}
                    </div>
                    {filter !== 'All' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Filtro: {filter}
                        </div>
                    )}
                </div>
            )}

            {/* Links list */}
            <div className="space-y-3 relative">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 rounded-3xl bg-white/[0.04] animate-pulse border border-white/[0.05]" />
                    ))
                ) : links.length > 0 ? (
                    links.map((link, index) => {
                        const pc = link.platform && PLATFORM_CONFIG[link.platform]
                            ? PLATFORM_CONFIG[link.platform]
                            : { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', icon: Zap }
                        const PlatformIcon = pc.icon

                        return (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.25 }}
                                className={cn(
                                    "group relative rounded-3xl border p-5 hover:translate-y-[-2px] transition-all duration-300",
                                    "bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]"
                                )}
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                    {/* Platform icon */}
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-400 group-hover:scale-105 shrink-0 shadow-lg",
                                        pc.bg, pc.border
                                    )}>
                                        <PlatformIcon className={cn("w-7 h-7", pc.text)} />
                                    </div>

                                    {/* Link info */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h3
                                                className="text-sm font-black text-white truncate max-w-[280px] md:max-w-[400px]"
                                                title={link.link_url}
                                            >
                                                {link.link_url}
                                            </h3>
                                            {link.platform && (
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border shrink-0",
                                                    pc.bg, pc.text, pc.border
                                                )}>
                                                    {link.platform}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            {link.group_jid && (
                                                <div className="text-[10px] text-muted font-bold flex items-center gap-1.5">
                                                    <Hash className="w-3 h-3 text-primary/60" />
                                                    {link.group_jid.split('@')[0]}
                                                </div>
                                            )}
                                            {link.sender_name && (
                                                <div className="text-[10px] text-muted font-bold flex items-center gap-1.5">
                                                    <User className="w-3 h-3 text-secondary/60" />
                                                    {link.sender_name}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-muted font-bold flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 opacity-40" />
                                                {new Date(link.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                                        <button
                                            onClick={() => handleCopy(link.link_url, link.id)}
                                            className={cn(
                                                "flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border",
                                                copiedId === link.id
                                                    ? "bg-secondary/10 border-secondary/20 text-secondary"
                                                    : "bg-white/[0.04] border-white/[0.08] text-muted hover:bg-white/[0.08] hover:text-white"
                                            )}
                                        >
                                            {copiedId === link.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedId === link.id ? 'Copiado' : 'Copiar'}
                                        </button>
                                        <a
                                            href={link.link_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/15"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Abrir
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                ) : (
                    <div className="premium-card rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />
                        <div className="w-20 h-20 rounded-[2rem] bg-white/[0.04] flex items-center justify-center border border-white/[0.08] shadow-inner">
                            <Link2 className="w-10 h-10 text-muted opacity-30" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black tracking-tight text-white">Nenhum Link Detectado</h3>
                            <p className="text-muted font-medium max-w-sm mx-auto leading-relaxed text-sm">
                                O motor de busca está operante e aguardando ofertas da Shopee, Mercado Livre ou Amazon nos grupos monitorados.
                            </p>
                        </div>
                        <button
                            onClick={fetchLinks}
                            className="px-6 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-white hover:bg-white/[0.08] transition-all"
                        >
                            Atualizar Agora
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
