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
    Link2,
    Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { Toast } from '@/components/Toast'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const STEPS = [
    { id: 1, title: 'Início', icon: Smartphone },
    { id: 2, title: 'Conexão', icon: QrCode },
    { id: 3, title: 'Sincronia', icon: RefreshCw },
    { id: 4, title: 'Pronto', icon: CheckCircle2 },
]

export default function WhatsAppPage() {
    const [step, setStep] = useState(1)
    const [status, setStatus] = useState<'loading' | 'disconnected' | 'connected' | 'error'>('loading')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(30)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
    const [confirmDisconnect, setConfirmDisconnect] = useState(false)

    const fetchQr = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp/qrcode')
            const data = await res.json()
            if (data.code || data.base64) {
                setQrCode(data.base64 || data.code)
                setStatus('disconnected')
                setCountdown(30)
            } else if (data.instance?.status === 'open' || data.status === 'connected' || data.instance?.state === 'open') {
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

    useEffect(() => { fetchQr() }, [fetchQr])

    useEffect(() => {
        if (status === 'disconnected' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && status === 'disconnected') {
            setToast({ message: 'QR Code expirado. Gerando novo código...', type: 'info' })
            fetchQr()
        }
    }, [countdown, status, fetchQr])

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmDialog
                open={confirmDisconnect}
                title="Desconectar WhatsApp?"
                description="Todos os grupos monitorados serão pausados imediatamente. Você precisará escanear o QR Code novamente para reativar."
                confirmLabel="Desconectar"
                variant="danger"
                onConfirm={() => { setConfirmDisconnect(false); setStatus('disconnected'); setStep(1); setQrCode(null) }}
                onCancel={() => setConfirmDisconnect(false)}
            />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em]">
                        <div className="w-5 h-5 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Wifi className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-primary">Connection Wizard</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Central de <span className="text-gradient italic">Conexão</span></h1>
                    <p className="text-muted font-medium text-sm">Configure seu robô de automação em poucos segundos.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl backdrop-blur-md">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-1.5">
                            <div className={cn(
                                "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-500",
                                step === s.id ? "bg-primary text-white shadow-lg shadow-primary/25" :
                                    step > s.id ? "text-primary/50 opacity-60" : "text-muted opacity-30"
                            )}>
                                <s.icon className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">{s.title}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={cn("w-3 h-px transition-all duration-500", step > s.id ? "bg-primary/40" : "bg-white/10")} />
                            )}
                        </div>
                    ))}
                </div>
            </header>

            <div className="grid lg:grid-cols-5 gap-8 items-start">

                {/* Instructions */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="premium-card rounded-[2rem] p-7 space-y-7 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />

                        <div className="space-y-2 relative z-10">
                            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-primary" />
                                </div>
                                Como conectar?
                            </h2>
                            <p className="text-sm text-muted font-medium">Siga as instruções abaixo para ativar o monitoramento.</p>
                        </div>

                        <div className="space-y-5 relative z-10">
                            {[
                                { step: 1, text: "Abra o WhatsApp no seu celular principal." },
                                { step: 2, text: "Acesse as configurações e toque em 'Aparelhos Conectados'." },
                                { step: 3, text: "Toque em 'Conectar um Aparelho' e aponte para o QR Code." },
                                { step: 4, text: "Aguarde a sincronização completa das mensagens." }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-3.5 items-start">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border transition-all duration-300",
                                        step >= item.step ? "bg-primary/15 border-primary/25 text-primary" : "bg-white/[0.04] border-white/[0.07] text-muted"
                                    )}>
                                        {step > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium leading-relaxed transition-colors pt-1",
                                        step >= item.step ? "text-white" : "text-muted"
                                    )}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/[0.06] relative z-10">
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/[0.06] border border-secondary/15">
                                <AlertCircle className="w-4 h-4 text-secondary shrink-0" />
                                <p className="text-[9px] font-bold text-muted leading-tight uppercase tracking-wider">
                                    Mantenha o celular conectado à internet durante o processo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR/Status area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="premium-card rounded-[2.5rem] p-10 md:p-14 min-h-[480px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                        >
                            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                            {step === 1 && (
                                <div className="space-y-8 max-w-sm relative z-10">
                                    <div className="relative mx-auto w-24 h-24">
                                        <div className="absolute inset-0 rounded-[2rem] bg-primary/20 animate-pulse" />
                                        <div className="relative w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/25 shadow-2xl flex items-center justify-center">
                                            <Smartphone className="w-12 h-12 text-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary/60" />
                                            <h3 className="text-2xl font-black tracking-tight text-white">Pronto para Iniciar?</h3>
                                        </div>
                                        <p className="text-muted font-medium text-sm leading-relaxed">
                                            Vamos gerar sua instância de conexão segura em nossos servidores de alta performance.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setStep(2); fetchQr() }}
                                        className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
                                    >
                                        Gerar Instância <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 relative z-10">
                                    {status === 'loading' ? (
                                        <div className="space-y-6 flex flex-col items-center">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Zap className="w-8 h-8 text-primary/40" />
                                                </div>
                                            </div>
                                            <p className="text-muted font-black uppercase tracking-widest text-[10px]">Alocando servidor...</p>
                                        </div>
                                    ) : qrCode ? (
                                        <div className="space-y-8 flex flex-col items-center">
                                            <div className="relative p-5 bg-white rounded-[2rem] shadow-[0_0_60px_rgba(124,58,237,0.35)] hover:scale-[1.01] transition-transform duration-300">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={qrCode} alt="WhatsApp QR Code" className="w-[280px] h-[280px] rounded-xl" />
                                                {countdown < 5 && (
                                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-3">Renovando...</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                                                    <RefreshCw className={cn("w-3.5 h-3.5 text-primary", countdown < 5 && "animate-spin")} />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                        Expira em {countdown}s
                                                    </span>
                                                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                                            style={{ width: `${(countdown / 30) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="text-[9px] font-black text-muted uppercase tracking-[0.2em] hover:text-white transition-colors"
                                                >
                                                    ← Cancelar e Voltar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                                                <XCircle className="w-10 h-10 text-red-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-white">{error || "Falha na Geração"}</h3>
                                                <p className="text-sm text-muted">Tente gerar novamente.</p>
                                            </div>
                                            <button
                                                onClick={fetchQr}
                                                className="px-8 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                                            >
                                                Tentar Novamente
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 max-w-sm relative z-10">
                                    <div className="relative mx-auto">
                                        <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full scale-150" />
                                        <div className="relative w-28 h-28 rounded-[2.5rem] bg-secondary/10 border-2 border-secondary/25 shadow-2xl flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-14 h-14 text-secondary" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black tracking-tight text-white">Conexão Ativa!</h3>
                                        <p className="text-muted font-medium leading-relaxed text-sm">
                                            Seu WhatsApp foi sincronizado com sucesso. O robô está pronto para processar ofertas.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <a href="/dashboard/grupos" className="py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex flex-col items-center gap-2">
                                            <MessageSquare className="w-5 h-5" /> Grupos
                                        </a>
                                        <a href="/dashboard/links" className="py-4 bg-white/[0.05] border border-white/[0.1] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/[0.1] transition-all flex flex-col items-center gap-2">
                                            <Link2 className="w-5 h-5" /> Links
                                        </a>
                                    </div>

                                    <button
                                        onClick={() => setConfirmDisconnect(true)}
                                        className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] hover:text-red-300 transition-colors"
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
