'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Key, ShoppingBag, Package, Link2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Toast } from '@/components/Toast'

export default function ConfigurationsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const [configs, setConfigs] = useState({
        shopee_app_id: '',
        shopee_app_secret: '',
        amazon_tag: '',
        mercadolivre_id: ''
    })

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const res = await fetch('/api/affiliates')
                if (!res.ok) throw new Error()
                const data = await res.json()
                if (data.config) {
                    setConfigs({
                        shopee_app_id: data.config.shopee_app_id || '',
                        shopee_app_secret: data.config.shopee_app_secret || '',
                        amazon_tag: data.config.amazon_tag || '',
                        mercadolivre_id: data.config.mercadolivre_id || ''
                    })
                }
            } catch {
                setToast({ message: 'Erro ao carregar configurações.', type: 'error' })
            } finally {
                setLoading(false)
            }
        }
        fetchConfigs()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/affiliates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configs)
            })

            if (!res.ok) throw new Error()
            setToast({ message: 'Configurações de afiliado salvas com sucesso!', type: 'success' })
        } catch {
            setToast({ message: 'Erro ao salvar. Tente novamente.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-grow p-6 md:p-8 space-y-8 animate-pulse">
                <div className="h-10 w-72 bg-white/[0.04] rounded-2xl" />
                <div className="h-[500px] w-full max-w-4xl bg-white/[0.04] rounded-[2.5rem]" />
            </div>
        )
    }

    return (
        <div className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 max-w-4xl mx-auto">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em]">
                        <div className="w-5 h-5 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Settings className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-primary">Engine Setup</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                        Meus <span className="text-gradient italic">Links</span>
                    </h1>
                    <p className="text-muted font-medium text-sm">Configure seus IDs de afiliado para substituição automática.</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <form onSubmit={handleSave} className="premium-card rounded-[2.5rem] p-8 md:p-12 space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">

                        {/* Shopee Config */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">Afiliado Shopee</h3>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Configuração API</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Key className="w-3.5 h-3.5 text-primary" /> App ID
                                    </label>
                                    <input
                                        type="text"
                                        value={configs.shopee_app_id}
                                        onChange={e => setConfigs({ ...configs, shopee_app_id: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary/50 focus:bg-primary/5 transition-all outline-none"
                                        placeholder="Ex: 12345678"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Key className="w-3.5 h-3.5 text-primary" /> App Secret
                                    </label>
                                    <input
                                        type="password"
                                        value={configs.shopee_app_secret}
                                        onChange={e => setConfigs({ ...configs, shopee_app_secret: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary/50 focus:bg-primary/5 transition-all outline-none"
                                        placeholder="Cole seu token secreto aqui"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Other Platforms Config */}
                        <div className="space-y-10">
                            {/* Amazon */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white tracking-tight">Associados Amazon</h3>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Tracking ID</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Link2 className="w-3.5 h-3.5 text-primary" /> Promo Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={configs.amazon_tag}
                                        onChange={e => setConfigs({ ...configs, amazon_tag: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary/50 focus:bg-primary/5 transition-all outline-none"
                                        placeholder="Ex: seu-nome-20"
                                    />
                                </div>
                            </div>

                            {/* Mercado Livre */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white tracking-tight">Afiliados Mercado Livre</h3>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest">ID de Identificação</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Link2 className="w-3.5 h-3.5 text-primary" /> Colaborador ID
                                    </label>
                                    <input
                                        type="text"
                                        value={configs.mercadolivre_id}
                                        onChange={e => setConfigs({ ...configs, mercadolivre_id: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary/50 focus:bg-primary/5 transition-all outline-none"
                                        placeholder="Ex: MLB123456789"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="pt-8 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">Pronto para Converter</h4>
                                <p className="text-[10px] text-muted font-medium max-w-xs leading-tight">Os IDs salvos aqui substituirão os originais quando copiados de um Grupo Espião.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/25 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar Configurações
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    )
}
