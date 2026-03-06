'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense } from 'react'
import {
    CheckCircle2,
    QrCode,
    Zap,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Check,
    Copy,
    Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Toast } from '@/components/Toast'

const PIX_EXPIRY_SECONDS = 600 // 10 minutes

const plans = {
    starter: { name: 'Starter', price: '47', features: ['1 Sessão WhatsApp', '10 Grupos Monitorados'] },
    professional: { name: 'Professional', price: '97', features: ['3 Sessões WhatsApp', '50 Grupos Monitorados'] },
    enterprise: { name: 'Enterprise', price: '197', features: ['10 Sessões WhatsApp', 'Grupos Ilimitados'] }
}

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const planId = searchParams.get('plan') || 'starter'
    const currentPlan = plans[planId as keyof typeof plans] || plans.starter

    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'pending' | 'processing' | 'waiting_payment' | 'success'>(
        searchParams.get('payment') === 'success' ? 'success' : 'pending'
    )
    const [qrCodeData, setQrCodeData] = useState<{ base64: string; copyPaste: string } | null>(null)
    const [paymentId, setPaymentId] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(PIX_EXPIRY_SECONDS)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
    const [cpf, setCpf] = useState('')

    // Format CPF as user types: xxx.xxx.xxx-xx
    const handleCpfChange = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11)
        let formatted = digits
        if (digits.length > 9) formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
        else if (digits.length > 6) formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
        else if (digits.length > 3) formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`
        setCpf(formatted)
    }
    const cpfDigits = cpf.replace(/\D/g, '')

    // ── Countdown timer ──────────────────────────────────────────────────────
    useEffect(() => {
        if (status !== 'waiting_payment') return
        if (countdown <= 0) {
            setStatus('pending')
            setQrCodeData(null)
            setPaymentId(null)
            setToast({ message: 'PIX expirado. Gere um novo código.', type: 'error' })
            return
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown, status])

    // ── Poll Supabase every 5s for subscription activation ───────────────────
    useEffect(() => {
        if (status !== 'waiting_payment' || !paymentId) return
        const supabase = createClient()

        const interval = setInterval(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_status')
                .eq('id', user.id)
                .single()
            if (profile?.subscription_status === 'active') {
                clearInterval(interval)
                setStatus('success')
                setTimeout(() => router.push('/dashboard'), 2500)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [status, paymentId, router])

    const handleConfirmPayment = async () => {
        setLoading(true)
        setStatus('processing')

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    planName: currentPlan.name,
                    planPrice: currentPlan.price,
                    docNumber: cpfDigits,
                })
            })

            const data = await res.json()

            if (data.qr_code && data.qr_code_base64) {
                setQrCodeData({ base64: data.qr_code_base64, copyPaste: data.qr_code })
                setPaymentId(data.id ?? 'unknown')
                setCountdown(PIX_EXPIRY_SECONDS)
                setStatus('waiting_payment')
            } else {
                setStatus('pending')
                setToast({ message: data.error || 'Erro ao gerar código PIX. Tente novamente.', type: 'error' })
            }
        } catch {
            setStatus('pending')
            setToast({ message: 'Sem conexão com o servidor. Tente novamente.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleCopyPix = useCallback(() => {
        if (!qrCodeData) return
        navigator.clipboard.writeText(qrCodeData.copyPaste)
        setToast({ message: 'Código copiado!', type: 'success' })
    }, [qrCodeData])

    const countdownMinutes = Math.floor(countdown / 60)
    const countdownSeconds = String(countdown % 60).padStart(2, '0')
    const countdownPct = (countdown / PIX_EXPIRY_SECONDS) * 100

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-white">Pagamento Confirmado!</h1>
                    <p className="text-muted font-medium uppercase tracking-widest text-[10px]">Sua conta ProAfiliados está agora ativa.</p>
                </div>
                <p className="text-sm text-muted animate-pulse">Redirecionando para o seu dashboard...</p>
            </div>
        )
    }

    return (
        <>
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto py-10">
                {/* Plan Details */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                            <Zap className="w-3 h-3" /> Quase lá
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white">Finalize sua Assinatura</h1>
                        <p className="text-muted font-medium">Complete o pagamento para liberar seu robô.</p>
                    </div>

                    <div className="glass-card p-8 rounded-[2rem] border-primary/20 bg-primary/[0.02] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Plano Selecionado</span>
                                <h2 className="text-3xl font-black text-white">{currentPlan.name}</h2>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Valor Mensal</span>
                                <p className="text-3xl font-black text-white">R$ {currentPlan.price}</p>
                            </div>
                        </div>

                        <ul className="space-y-4 pt-4 border-t border-white/5 relative z-10">
                            {currentPlan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/80">
                                    <Check className="w-4 h-4 text-primary" />
                                    {f}
                                </li>
                            ))}
                            <li className="flex items-center gap-3 text-sm font-medium text-white/80">
                                <Check className="w-4 h-4 text-primary" />
                                Suporte Especializado 24/7
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 opacity-60">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <div className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            Pagamento processado de forma segura via Mercado Pago. <br /> Seus dados estão 100% protegidos.
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-8 relative overflow-hidden border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                    <div className="text-center space-y-2 relative z-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Pague com PIX</h3>
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">
                            {qrCodeData ? 'Escaneie ou copie o código abaixo' : 'Gere o QR Code para pagar'}
                        </p>
                    </div>

                    {/* QR Code Area */}
                    <div className="relative group z-10 w-full max-w-xs">
                        <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="w-full bg-black/40 border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center gap-6 backdrop-blur-xl">
                            {qrCodeData ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`data:image/jpeg;base64,${qrCodeData.base64}`} alt="QR Code PIX" className="w-48 h-48 rounded-xl object-contain bg-white p-2" />
                            ) : (
                                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center animate-pulse mb-4">
                                    <QrCode className="w-10 h-10 text-primary opacity-50" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                    {qrCodeData ? 'Aguardando confirmação...' : 'Pagamento via PIX'}
                                </p>
                                {qrCodeData && (
                                    <p className="text-[9px] text-secondary font-bold uppercase tracking-widest animate-pulse">
                                        Detecção automática ativa
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-4 relative z-10">
                        {/* Copy-paste code */}
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Código Copia e Cola</p>
                                {qrCodeData && (
                                    <button
                                        onClick={handleCopyPix}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                                    >
                                        <Copy className="w-3 h-3" /> Copiar
                                    </button>
                                )}
                            </div>
                            <p className="text-[9px] font-mono text-white break-all opacity-80 p-2 bg-white/5 rounded-lg border border-white/5 max-h-20 overflow-y-auto w-full select-all">
                                {qrCodeData ? qrCodeData.copyPaste : '*'.repeat(60)}
                            </p>
                        </div>

                        {/* Countdown bar */}
                        {status === 'waiting_payment' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5 text-muted">
                                        <Clock className="w-3 h-3" /> PIX válido por
                                    </span>
                                    <span className={countdown < 60 ? 'text-red-400' : 'text-white'}>
                                        {countdownMinutes}:{countdownSeconds}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${countdownPct}%`,
                                            backgroundColor: countdown < 60 ? '#f87171' : '#7c3aed'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CPF Input + Generate button */}
                        {!qrCodeData && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">CPF do Pagador</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="000.000.000-00"
                                        value={cpf}
                                        onChange={(e) => handleCpfChange(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white text-center placeholder:text-muted/50 focus:border-primary/50 focus:bg-black/60 transition-all outline-none tracking-widest"
                                        maxLength={14}
                                    />
                                    {cpfDigits.length > 0 && cpfDigits.length !== 11 && (
                                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest text-center">CPF deve ter 11 dígitos</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={loading || status === 'processing' || cpfDigits.length !== 11}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 group"
                                >
                                    {status === 'processing' ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /><span>Gerando PIX...</span></>
                                    ) : (
                                        <><span>Gerar Código PIX</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </div>
                        )}

                        <p className="text-[9px] text-center text-muted font-bold uppercase tracking-widest opacity-40">
                            Confirmação automática após o pagamento.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function CheckoutPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            }>
                <CheckoutContent />
            </Suspense>
        </div>
    )
}
