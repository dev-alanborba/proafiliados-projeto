'use client'
// Login Page v2 - Dark Theme

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2, Zap, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function translateError(msg: string): string {
    if (msg.toLowerCase().includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
    if (msg.toLowerCase().includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
    if (msg.toLowerCase().includes('too many requests')) return 'Muitas tentativas. Aguarde alguns minutos.'
    if (msg.toLowerCase().includes('user not found')) return 'Conta não encontrada.'
    if (msg.toLowerCase().includes('network')) return 'Sem conexão. Verifique sua internet.'
    return 'Ocorreu um erro. Tente novamente.'
}

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [forgotMode, setForgotMode] = useState(false)
    const [resetSent, setResetSent] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(translateError(error.message))
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setError('Digite seu e-mail para receber o link de recuperação.')
            return
        }
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`,
        })

        setLoading(false)
        if (error) {
            setError(translateError(error.message))
        } else {
            setResetSent(true)
        }
    }

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-[420px] space-y-8 relative z-10">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/10">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-primary italic">ProAfiliados</h1>
                    <p className="text-muted text-xs font-bold uppercase tracking-[0.2em]">Entre na sua conta para gerenciar seus bots</p>
                </div>

                <div className="bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl space-y-6">

                    {/* ── Reset password: success ── */}
                    {resetSent ? (
                        <div className="flex flex-col items-center text-center space-y-5 py-4">
                            <div className="w-14 h-14 bg-secondary/10 border border-secondary/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-secondary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black text-white uppercase tracking-wider">E-mail enviado!</p>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-relaxed">
                                    Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                                </p>
                            </div>
                            <button
                                onClick={() => { setForgotMode(false); setResetSent(false) }}
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                                ← Voltar para o login
                            </button>
                        </div>

                    ) : forgotMode ? (
                        /* ── Reset password: form ── */
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div className="space-y-1">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Recuperar senha</p>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-relaxed">
                                    Digite seu e-mail e enviaremos um link para redefinir sua senha.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="reset-email" className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">E-mail</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="reset-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-muted/50 focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p role="alert" className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/5 py-2.5 rounded-xl border border-red-500/20">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar link de recuperação'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setForgotMode(false); setError(null) }}
                                className="w-full text-[10px] font-black text-muted uppercase tracking-widest hover:text-white transition-colors py-2"
                            >
                                ← Voltar para o login
                            </button>
                        </form>

                    ) : (
                        /* ── Normal login ── */
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="login-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-muted/50 focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-4 mr-1">
                                    <label htmlFor="login-password" className="text-[10px] font-black text-muted uppercase tracking-widest">Senha</label>
                                    <button
                                        type="button"
                                        onClick={() => { setForgotMode(true); setError(null) }}
                                        className="text-[10px] font-black text-primary hover:opacity-70 transition-opacity uppercase tracking-widest"
                                    >
                                        Esqueci minha senha
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-14 text-sm font-bold text-white placeholder:text-muted/50 focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p role="alert" className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/5 py-2.5 rounded-xl border border-red-500/20">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" /></>}
                            </button>
                        </form>
                    )}

                    {!forgotMode && !resetSent && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                    <span className="bg-[#0a0a0a] px-4 text-muted">Ou continue com</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                aria-label="Entrar com Google"
                                className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-white font-black text-xs uppercase tracking-widest">Google</span>
                            </button>

                            <p className="text-center text-xs font-bold text-muted">
                                Não tem uma conta?{' '}
                                <Link href="/cadastro" className="text-primary hover:underline">
                                    Cadastre-se
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
