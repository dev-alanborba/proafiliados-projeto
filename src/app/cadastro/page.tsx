'use client'

import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Mail, Lock, User, ArrowRight, Loader2, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react'

function RegisterForm() {
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan') || 'starter'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    selected_plan: plan
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
        } else {
            // Redirect to checkout with plan info
            router.push(`/dashboard/checkout?plan=${plan}`)
            router.refresh()
        }
    }

    return (
        <div className="w-full max-w-[450px] relative z-10 glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl space-y-8">
            <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Zap className="w-8 h-8 text-primary shadow-primary/50" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Criar Conta</h1>
                <p className="text-xs text-muted font-black uppercase tracking-[0.2em]">Você selecionou o plano <span className="text-primary">{plan}</span></p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Nome Completo</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Seu Nome"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset' }}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Email Principal</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Senha de Acesso</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {password.length > 0 && (() => {
                            let score = 0
                            if (password.length >= 8) score++
                            if (/[0-9]/.test(password)) score++
                            if (/[^a-zA-Z0-9]/.test(password)) score++
                            if (password.length >= 12) score++
                            const labels = ['Fraca', 'Média', 'Boa', 'Forte']
                            const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
                            const textColors = ['text-red-500', 'text-orange-400', 'text-yellow-400', 'text-green-500']
                            const idx = Math.max(0, score - 1)
                            return (
                                <div className="px-1 space-y-1.5 mt-2">
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3].map(j => (
                                            <div key={j} className={`h-1 flex-1 rounded-full transition-all duration-300 ${j < score ? colors[idx] : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ml-1 ${textColors[idx]}`}>{labels[idx]}</p>
                                </div>
                            )
                        })()}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest justify-center bg-red-500/5 py-3 rounded-xl border border-red-500/20">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>Próximo Passo: Pagamento</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-4 border-t border-white/5">
                <p className="text-center text-xs font-bold text-muted uppercase tracking-widest">
                    Já possui conta?{' '}
                    <Link href="/login" className="text-primary hover:text-white transition-colors">
                        Faça Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -mr-64 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[150px] rounded-full -ml-64 -mb-32" />
            </div>

            <Suspense fallback={<div className="text-primary animate-pulse font-black uppercase tracking-widest">Carregando...</div>}>
                <RegisterForm />
            </Suspense>

            {/* Trust Badges */}
            <div className="absolute bottom-10 hidden md:flex items-center gap-8 opacity-50">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                    <ShieldCheck className="w-4 h-4" /> 100% Seguro
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                    <CheckCircle2 className="w-4 h-4" /> Ativação Imediata
                </div>
            </div>
        </div>
    )
}
