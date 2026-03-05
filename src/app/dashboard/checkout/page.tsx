'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import {
    CheckCircle2,
    QrCode,
    Zap,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    const planId = searchParams.get('plan') || 'starter'

    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'pending' | 'processing' | 'waiting_payment' | 'success'>(
        searchParams.get('payment') === 'success' ? 'success' : 'pending'
    )
    const [qrCodeData, setQrCodeData] = useState<{ base64: string, copyPaste: string } | null>(null)

    const plans = {
        starter: { name: 'Starter', price: '47', features: ['1 Sessão WhatsApp', '10 Grupos Monitorados'] },
        professional: { name: 'Professional', price: '97', features: ['3 Sessões WhatsApp', '50 Grupos Monitorados'] },
        enterprise: { name: 'Enterprise', price: '197', features: ['10 Sessões WhatsApp', 'Grupos Ilimitados'] }
    }

    const currentPlan = plans[planId as keyof typeof plans] || plans.starter

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
                })
            });

            const data = await res.json();

            if (data.qr_code && data.qr_code_base64) {
                // Display QR Code on UI
                setQrCodeData({
                    base64: data.qr_code_base64,
                    copyPaste: data.qr_code
                });
                setStatus('waiting_payment');
            } else {
                console.error('Error generating PIX:', data);
                setStatus('pending');
                alert('Erro ao gerar código PIX. Tente novamente.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setStatus('pending');
            alert('Erro ao comunicar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

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
                    <p className="text-xs text-muted font-bold uppercase tracking-widest">Escaneie o QR Code abaixo</p>
                </div>

                {/* QR Code Area */}
                <div className="relative group relative z-10 w-full max-w-xs">
                    <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-full bg-black/40 border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center gap-6 backdrop-blur-xl">

                        {qrCodeData ? (
                            <img src={`data:image/jpeg;base64,${qrCodeData.base64}`} alt="QR Code PIX" className="w-48 h-48 rounded-xl object-contain bg-white p-2" />
                        ) : (
                            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center animate-pulse mb-4">
                                <QrCode className="w-10 h-10 text-primary opacity-50" />
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                {qrCodeData ? 'Aguardando Pagamento' : 'Pagamento via PIX'}
                            </p>
                            <p className="text-[9px] text-muted font-bold uppercase tracking-widest leading-tight">
                                {qrCodeData ? 'Abra o app do seu banco e escaneie' : 'Clique no botão abaixo para gerar a chave.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4 relative z-10">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center space-y-2">
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest">Código Copia e Cola</p>
                        <p className="text-[9px] font-mono text-white break-all opacity-80 select-all p-2 bg-white/5 rounded-lg border border-white/5 max-h-24 overflow-y-auto w-full mx-auto" style={{ wordBreak: 'break-all' }}>
                            {qrCodeData ? qrCodeData.copyPaste : '***************************************************************'}
                        </p>
                    </div>

                    {!qrCodeData && (
                        <button
                            onClick={handleConfirmPayment}
                            disabled={loading || status === 'processing'}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                            {status === 'processing' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Gerando PIX...</span>
                                </>
                            ) : (
                                <>
                                    <span>Gerar Código PIX</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    )}

                    <p className="text-[9px] text-center text-muted font-bold uppercase tracking-widest opacity-40">
                        A liberação ocorre em até 30 segundos após o PIX.
                    </p>
                </div>
            </div>
        </div>
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
