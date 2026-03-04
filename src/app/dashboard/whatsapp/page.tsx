'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    QrCode,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    Smartphone,
    ChevronRight,
    Wifi,
    Zap,
    MessageSquare,
    Link2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"

export default function WhatsAppPage() {
    const [step, setStep] = useState(1)
    const [status, setStatus] = useState<'loading' | 'disconnected' | 'connected' | 'error'>('loading')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(30)
    const [error, setError] = useState<string | null>(null)

    const fetchQr = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp/qrcode')
            const data = await res.json()

            if (data.code || data.base64) {
                setQrCode(data.base64 || data.code)
                setStatus('disconnected')
                setCountdown(30)
            } else if (data.instance?.status === 'open') {
                setStatus('connected')
                setStep(4)
                setQrCode(null)
            } else {
                setError(data.error || 'Erro ao carregar QR Code')
                setStatus('error')
            }
        } catch {
            setError('Erro de conexão com o servidor')
            setStatus('error')
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchQr()
    }, [fetchQr])

    useEffect(() => {
        if (status === 'disconnected' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && status === 'disconnected') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchQr()
        }
    }, [countdown, status, fetchQr])

    const steps = [
        { id: 1, title: 'Início', icon: Smartphone },
        { id: 2, title: 'Conexão', icon: QrCode },
        { id: 3, title: 'Sincronia', icon: RefreshCw },
        { id: 4, title: 'Pronto', icon: CheckCircle2 },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                        <Wifi className="w-3 h-3" /> Connection Wizard
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Central de Conexão</h1>
                    <p className="text-muted font-medium">Configure seu robô de automação em poucos segundos.</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    {steps.map((s) => (
                        <div
                            key={s.id}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-500",
                                step === s.id ? "bg-primary text-white shadow-lg shadow-primary/20" :
                                    step > s.id ? "text-primary opacity-50" : "text-muted opacity-30"
                            )}
                        >
                            <s.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{s.title}</span>
                        </div>
                    ))}
                </div>
            </header>

            <div className="grid lg:grid-cols-5 gap-10 items-start">
                {/* Left Column: Instructions & Status */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />

                        <div className="space-y-2 relative z-10">
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Como conectar?
                            </h2>
                            <p className="text-sm text-muted font-medium">Siga as instruções para ativar o monitoramento.</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {[
                                { step: 1, text: "Abra o WhatsApp no seu celular principal." },
                                { step: 2, text: "Acesse as configurações e toque em 'Aparelhos Conectados'." },
                                { step: 3, text: "Toque em 'Conectar um Aparelho' e aponte para o QR Code." },
                                { step: 4, text: "Aguarde a sincronização completa das mensagens." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group/item">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border transition-all duration-300",
                                        step >= item.step ? "bg-primary/20 border-primary/20 text-primary scale-110 shadow-lg" : "bg-white/5 border-white/10 text-muted"
                                    )}>
                                        {item.step}
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium leading-relaxed transition-colors",
                                        step >= item.step ? "text-white" : "text-muted"
                                    )}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/5 relative z-10">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <AlertCircle className="w-5 h-5 text-secondary shrink-0" />
                                <p className="text-[10px] font-bold text-muted leading-tight uppercase tracking-wider">
                                    Certifique-se de manter o celular conectado à internet durante o processo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Interaction Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="glass-card rounded-[3rem] p-12 min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden group/card shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

                            {step === 1 && (
                                <div className="space-y-8 max-w-sm relative z-10">
                                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 shadow-xl flex items-center justify-center mx-auto group-hover/card:scale-110 transition-transform duration-500">
                                        <Smartphone className="w-12 h-12 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black tracking-tight text-white">Pronto para Iniciar?</h3>
                                        <p className="text-muted font-medium">Vamos gerar sua instância de conexão segura em nossos servidores.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setStep(2)
                                            fetchQr()
                                        }}
                                        className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        Gerar Instância <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 relative z-10">
                                    {status === 'loading' ? (
                                        <div className="space-y-6 flex flex-col items-center">
                                            <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                            <p className="text-muted font-black uppercase tracking-widest text-[10px]">Alocando servidor...</p>
                                        </div>
                                    ) : qrCode ? (
                                        <div className="space-y-8 flex flex-col items-center">
                                            <div className="relative p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(124,58,237,0.3)] group/qr transition-transform duration-500 hover:scale-[1.02]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={qrCode} alt="WhatsApp QR Code" className="w-[300px] h-[300px]" />

                                                {countdown < 5 && (
                                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2.5rem] animate-in fade-in duration-500">
                                                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-4">Renovando...</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                                                    <RefreshCw className={cn("w-4 h-4 text-primary", countdown < 5 && "animate-spin")} />
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">Expira em {countdown}s</span>
                                                </div>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="text-[10px] font-black text-muted uppercase tracking-[0.2em] hover:text-white transition-colors"
                                                >
                                                    ← Cancelar e Voltar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                                                <XCircle className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-bold">{error || "Falha na Geração"}</h3>
                                            <button
                                                onClick={fetchQr}
                                                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                            >
                                                Tentar Novamente
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 max-w-sm relative z-10 animate-in zoom-in duration-500">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                        <div className="w-28 h-28 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 shadow-2xl flex items-center justify-center mx-auto relative z-10">
                                            <CheckCircle2 className="w-14 h-14 text-primary" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black tracking-tight text-white">Conexão Ativa!</h3>
                                        <p className="text-muted font-medium leading-relaxed">
                                            Seu WhatsApp foi sincronizado com sucesso. O robô já está pronto para processar ofertas.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <a href="/dashboard/grupos" className="py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg flex flex-col items-center gap-2">
                                            <MessageSquare className="w-5 h-5" /> Grupos
                                        </a>
                                        <a href="/dashboard/links" className="py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-2">
                                            <Link2 className="w-5 h-5" /> Links
                                        </a>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setStatus('disconnected')
                                            setStep(1)
                                        }}
                                        className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] hover:text-red-300 transition-colors"
                                    >
                                        Desconectar Conta
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
