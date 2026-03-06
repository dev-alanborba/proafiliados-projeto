'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, Zap, Shield, BarChart3, Globe, Smartphone,
  Users, RefreshCw, CheckCircle2, ChevronDown, Star, Link2,
  MessageSquare, TrendingUp, Sparkles, Bot, Cpu
} from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from "@/lib/utils"

// ─── Static data ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '10.000+', label: 'Links Capturados' },
  { value: '3', label: 'Plataformas' },
  { value: '24/7', label: 'Uptime' },
]

const MOCKUP_STATS = [
  { label: 'Links Capturados', value: '1.284', color: 'text-violet-400' },
  { label: 'Grupos Ativos', value: '12', color: 'text-emerald-400' },
  { label: 'Conversões Hoje', value: '48', color: 'text-amber-400' },
]

const MOCKUP_CHART_BARS = [30, 55, 40, 70, 45, 80, 60, 72, 58, 88, 65, 90]
const MOCKUP_PLATFORMS = [
  { name: 'Shopee', pct: 60, color: 'bg-orange-500' },
  { name: 'M.Livre', pct: 30, color: 'bg-yellow-400' },
  { name: 'Amazon', pct: 10, color: 'bg-blue-400' },
]

const LINK_STREAM_ITEMS = [
  { p: 'Shopee', pr: 'R$ 47,90', x: '5%', y: '15%', d: 0 },
  { p: 'M. Livre', pr: 'R$ 159,00', x: '55%', y: '10%', d: 0.5 },
  { p: 'Amazon', pr: 'R$ 1.299', x: '28%', y: '48%', d: 1 },
  { p: 'AliExpress', pr: 'R$ 89,00', x: '70%', y: '42%', d: 1.5 },
  { p: 'Hotmart', pr: 'R$ 297,00', x: '12%', y: '72%', d: 0.8 },
  { p: 'Eduzz', pr: 'R$ 49,90', x: '52%', y: '78%', d: 1.2 },
  { p: 'Kiwify', pr: 'R$ 97,00', x: '82%', y: '22%', d: 2 },
]

const TESTIMONIALS = [
  {
    name: 'Ana S.',
    role: 'Afiliada Shopee — SP',
    text: 'Antes eu ficava copiando link por link manualmente. Hoje o robô faz tudo. Dobrei minha comissão no primeiro mês.',
    initials: 'AS',
    accent: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20',
    text_color: 'text-violet-400',
  },
  {
    name: 'Rafael M.',
    role: 'Afiliado Mercado Livre — RJ',
    text: 'A substituição de link é instantânea. Nunca perco uma oferta. Já paguei o plano com a primeira semana de uso.',
    initials: 'RM',
    accent: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20',
    text_color: 'text-emerald-400',
  },
  {
    name: 'Carla T.',
    role: 'Afiliada Amazon — MG',
    text: 'Monitorar 30 grupos ao mesmo tempo era impossível manualmente. Agora é automático. Indispensável.',
    initials: 'CT',
    accent: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20',
    text_color: 'text-amber-400',
  },
]

const PRICING_PLANS = [
  {
    name: 'Starter', price: '47',
    desc: 'Para quem está começando a escalar.',
    gradient: 'from-white/[0.03] to-white/[0.01]',
    features: ['1 Sessão WhatsApp', '10 Grupos Monitorados', 'Captura Real-time', 'Suporte via Ticket'],
  },
  {
    name: 'Professional', price: '97', popular: true,
    desc: 'O equilíbrio perfeito para profissionais.',
    gradient: 'from-violet-500/10 to-violet-500/[0.03]',
    features: ['3 Sessões WhatsApp', '50 Grupos Monitorados', 'AI Pattern Matching', 'Relatórios Avançados', 'Suporte Prioritário'],
  },
  {
    name: 'Enterprise', price: '197',
    desc: 'Potência máxima para grandes operações.',
    gradient: 'from-white/[0.03] to-white/[0.01]',
    features: ['10 Sessões WhatsApp', 'Grupos Ilimitados', 'API Access Beta', 'Gerente de Conta', 'Infra Dedicada'],
  },
]

const FAQ_ITEMS = [
  { q: 'Meu WhatsApp pode ser banido?', a: 'Utilizamos a Evolution API com técnicas anti-ban. Recomendamos usar um número secundário dedicado ao robô, como a maioria dos nossos usuários faz.' },
  { q: 'Quais plataformas são suportadas?', a: 'Shopee, Mercado Livre e Amazon. Novos marketplaces são adicionados frequentemente.' },
  { q: 'Funciona com grupos privados?', a: 'Sim. O robô precisa apenas fazer parte dos grupos monitorados. Grupos privados funcionam normalmente.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem fidelidade. O cancelamento é feito em um clique no painel. Você mantém o acesso até o fim do período pago.' },
  { q: 'Como funciona a substituição de link?', a: 'O robô detecta links de afiliado nas mensagens, extrai o produto, gera o link com o seu ID de afiliado e reencaminha a mensagem nos seus Grupos VIP.' },
  { q: 'O robô envia mensagens automaticamente?', a: 'Sim. Ao detectar uma oferta válida, reencaminha automaticamente para os seus grupos destino com o link substituído.' },
]

// ─── Tilt Card Component ───────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={cn('cursor-default', className)}
    >
      {children}
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number>(-1)

  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-white selection:bg-primary/30 font-sans">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-4 md:mx-8 mt-4">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 relative">
                <div className="absolute inset-0 rounded-xl bg-primary animate-pulse opacity-30" />
                <Zap className="w-5 h-5 text-white relative z-10" />
              </div>
              <span className="font-black text-xl tracking-tighter">ProAfiliados</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted">
              <Link href="#features" className="hover:text-white transition-colors duration-200">Funcionalidades</Link>
              <Link href="#pricing" className="hover:text-white transition-colors duration-200">Planos</Link>
              <Link href="/login" className="hover:text-white transition-colors duration-200">Login</Link>
              <Link href="/cadastro" className="bg-primary text-white px-5 py-2.5 rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25">
                Começar Agora
              </Link>
            </div>

            <Link href="/cadastro" className="md:hidden bg-primary text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest">
              Começar
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-28 overflow-x-hidden relative">

        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex items-center py-10 px-6">

          {/* Background grid */}
          <div className="absolute inset-0 bg-grid-dots opacity-60 pointer-events-none" />

          {/* Gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1/4 -left-1/4 w-[700px] h-[700px] bg-primary/10 blur-[150px] rounded-full"
            />
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full"
            />
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: Text */}
              <div className="space-y-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md shadow-xl">
                    <div className="relative flex items-center">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <div className="absolute w-2 h-2 rounded-full bg-secondary animate-ping opacity-75" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">Robô de Conversão Automática</span>
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.88] text-white uppercase">
                    Monitore<br />
                    <span className="relative inline-block">
                      <span className="text-gradient">Grupos</span>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-violet-400 to-secondary rounded-full origin-left"
                      />
                    </span><br />
                    Venda no<br />
                    <span className="italic">Automático</span>
                  </h1>

                  <p className="text-lg text-muted font-medium leading-relaxed max-w-lg">
                    O robô escuta grupos <strong className="text-white">24h/dia</strong>, injeta o seu link de afiliado nas ofertas e repassa para os seus Grupos VIP em{' '}
                    <strong className="text-white underline decoration-primary/50 decoration-2 underline-offset-4">frações de segundo</strong>.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/cadastro" className="group relative px-8 py-4 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] overflow-hidden shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">Começar Agora — Grátis</span>
                    <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="#features" className="group px-8 py-4 border border-white/10 bg-white/[0.03] backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/[0.07] transition-all text-white/60 hover:text-white flex items-center justify-center gap-2">
                    Ver Tecnologia
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex items-center gap-8 pt-2"
                >
                  {STATS.map((stat, i) => (
                    <div key={i} className="space-y-0.5">
                      <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                      <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right: 3D Product Mockup */}
              <motion.div
                initial={{ opacity: 0, rotateX: 20, rotateY: -20, y: 40 }}
                animate={{ opacity: 1, rotateX: 8, rotateY: -6, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                whileHover={{ rotateX: 3, rotateY: -2, scale: 1.01 }}
                style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
                className="relative hidden lg:block"
              >
                {/* Glow under card */}
                <div className="absolute -inset-4 bg-primary/20 blur-[60px] rounded-[3rem] pointer-events-none" />

                <div
                  className="relative rounded-[2rem] border border-white/10 bg-[#080810] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(124,58,237,0.1)]"
                  style={{ transform: 'translateZ(0)' }}
                >
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5 bg-black/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white/[0.04] border border-white/5 rounded-lg px-4 py-1.5 text-[10px] font-mono text-muted/60 w-fit tracking-tight">
                        app.proafiliados.com.br/dashboard
                      </div>
                    </div>
                  </div>

                  {/* Sidebar + content */}
                  <div className="flex h-[400px]">
                    {/* Mini sidebar */}
                    <div className="w-14 bg-black/40 border-r border-white/5 flex flex-col items-center py-4 gap-3">
                      {[BarChart3, MessageSquare, Users, Link2].map((Icon, i) => (
                        <div key={i} className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                          i === 0 ? "bg-primary/20 text-primary" : "text-white/20"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                      ))}
                    </div>

                    {/* Dashboard content */}
                    <div className="flex-1 p-5 space-y-4 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Painel de Inteligência</div>
                          <div className="text-lg font-black text-white mt-0.5 tracking-tight">Visão Geral</div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                          <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Live</span>
                        </div>
                      </div>

                      {/* Stat cards */}
                      <div className="grid grid-cols-3 gap-3">
                        {MOCKUP_STATS.map((item, i) => (
                          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1">
                            <div className={cn('text-[8px] font-black uppercase tracking-widest', item.color)}>{item.label}</div>
                            <div className="text-xl font-black text-white tracking-tighter">{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Chart */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
                        <div className="text-[8px] font-black text-muted uppercase tracking-widest">Atividade 24h</div>
                        <div className="flex items-end gap-1 h-16">
                          {MOCKUP_CHART_BARS.map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 0.5, delay: 0.1 * i, ease: 'backOut' }}
                              className="flex-1 rounded-t bg-primary/40 min-h-[4px]"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Platforms */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                        {MOCKUP_PLATFORMS.map((p, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[8px] font-black text-muted">
                              <span>{p.name}</span><span>{p.pct}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p.pct}%` }}
                                transition={{ duration: 0.8, delay: 0.2 * i }}
                                className={cn('h-full rounded-full', p.color)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-5 -right-5 bg-[#0d0d18] border border-primary/20 rounded-2xl p-3 shadow-2xl flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-white uppercase tracking-widest">Link Capturado</div>
                    <div className="text-[9px] text-muted font-bold">shopee.com.br/produto</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute -bottom-4 -left-6 bg-[#0d0d18] border border-secondary/20 rounded-2xl p-3 shadow-2xl flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-white uppercase tracking-widest">Enviado para 12 grupos</div>
                    <div className="text-[9px] text-muted font-bold">há 0.3 segundos</div>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ─── BRAND BAR ─── */}
        <section className="py-16 border-y border-white/[0.04] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303] z-10 pointer-events-none" />
          <div className="flex items-center w-max animate-marquee opacity-[0.25]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <React.Fragment key={n}>
                <span className="text-3xl px-14 font-black italic tracking-tighter text-white whitespace-nowrap">SHOPEE</span>
                <span className="text-3xl px-14 font-black italic tracking-tighter text-white whitespace-nowrap">MERCADO LIVRE</span>
                <span className="text-3xl px-14 font-black italic tracking-tighter text-white whitespace-nowrap">AMAZON</span>
                <span className="text-3xl px-14 font-black italic tracking-tighter text-white whitespace-nowrap">ALIEXPRESS</span>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />
          <div className="max-w-6xl mx-auto space-y-20 relative z-10">
            <div className="text-center space-y-5">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em]"
              >
                <Bot className="w-3.5 h-3.5" /> Como funciona
              </motion.span>
              <h2 className="text-5xl md:text-7xl font-black tracking-[-0.04em] text-white">
                3 Passos. <span className="text-gradient italic">Zero Esforço.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px bg-gradient-to-r from-white/10 via-primary/40 to-white/10" />

              {[
                { n: '01', title: 'Grupos Espião', desc: 'O robô lê silenciosamente as milhares de ofertas enviadas por lojistas em tempo real.', icon: Users, color: 'text-white/60', bg: 'bg-white/5 border-white/10', anim: null },
                { n: '02', title: 'Substituição', desc: 'O link original é apagado. Seu ID de afiliado é injetado no lugar em fração de segundos.', icon: Zap, color: 'text-primary', bg: 'bg-primary/10 border-primary/20', anim: 'shadow-primary/20 shadow-2xl' },
                { n: '03', title: 'Publicação', desc: 'A mensagem convertida com imagem cai direto nos seus Grupos VIP automaticamente.', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20', anim: null },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <TiltCard className="h-full">
                    <div className={cn(
                      "glass-card rounded-[2rem] p-8 space-y-6 h-full transition-all duration-500 hover:border-white/15",
                      step.anim
                    )}>
                      <div className="flex items-start justify-between">
                        <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center", step.bg)}>
                          <step.icon className={cn("w-7 h-7", step.color)} />
                        </div>
                        <span className="text-[10px] font-black text-white/15 uppercase tracking-[0.4em]">{step.n}</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight">{step.title}</h3>
                        <p className="text-muted font-medium text-sm leading-relaxed">{step.desc}</p>
                      </div>
                      {/* Mini animation */}
                      <div className="h-20 bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden relative">
                        {i === 0 && (
                          <div className="p-3 space-y-2">
                            {[1, 2].map(j => (
                              <motion.div
                                key={j}
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, delay: j * 0.6 }}
                                className="h-5 bg-white/10 rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {i === 1 && (
                          <div className="h-full flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            >
                              <RefreshCw className="w-8 h-8 text-primary/40" />
                            </motion.div>
                          </div>
                        )}
                        {i === 2 && (
                          <div className="h-full flex items-center gap-3 p-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-secondary" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <motion.div animate={{ width: ['0%', '100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-1.5 bg-secondary/40 rounded-full" />
                              <motion.div animate={{ width: ['0%', '70%', '70%'] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className="h-1.5 bg-secondary/20 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES BENTO ─── */}
        <section id="features" className="py-28 px-6 relative overflow-hidden content-visibility-auto">
          <div className="max-w-7xl mx-auto space-y-20 relative z-10">
            <div className="text-center space-y-5">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em]"
              >
                <Cpu className="w-3.5 h-3.5" /> Engenharia de Performance
              </motion.span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.05em] text-white">
                Inteligência <span className="text-gradient italic">Avançada</span>
              </h2>
              <p className="text-muted text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                Arquitetura distribuída encontra execução impecável.
              </p>
            </div>

            {/* Big feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <TiltCard>
                <div className="premium-card rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/15 transition-all duration-700" />

                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Zap className="w-8 h-8 text-primary" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                          Monitoramento<br />e Troca de Links
                        </h3>
                        <p className="text-muted text-lg font-medium leading-relaxed">
                          Extrai o link original (Shopee, Mercado Livre, Amazon), converte para o seu ID e posta a mensagem convertida.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Shopee', 'Mercado Livre', 'Amazon', 'AliExpress'].map(p => (
                          <span key={p} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-white/60">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative h-72 rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                      {LINK_STREAM_ITEMS.map((item, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -16, 0], opacity: [0.4, 1, 0.4], scale: [0.97, 1, 0.97] }}
                          transition={{ duration: 4 + (i % 3) * 0.8, repeat: Infinity, delay: item.d }}
                          className="absolute p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm flex items-center gap-2.5 shadow-xl"
                          style={{ left: item.x, top: item.y }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div>
                            <div className="text-[7px] font-black text-white/40 uppercase tracking-tight">{item.p}</div>
                            <div className="text-[9px] font-bold text-white">{item.pr}</div>
                          </div>
                        </motion.div>
                      ))}
                      <motion.div
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-primary/15 to-transparent pointer-events-none z-10"
                      />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* 3-column features */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Globe,
                  color: 'text-secondary bg-secondary/10 border-secondary/20',
                  title: 'Cópia de Mídia',
                  desc: 'Baixa imagens e vídeos da oferta e anexa na mensagem de destino — como se fosse você enviando.',
                  badge: 'Img + Vídeo',
                  badgeColor: 'bg-secondary/10 text-secondary border-secondary/20',
                },
                {
                  icon: BarChart3,
                  color: 'text-primary bg-primary/10 border-primary/20',
                  title: 'QR Code Instantâneo',
                  desc: 'Conecte o número do seu bot em segundos usando Evolution API. Multi-sessão nativa.',
                  badge: 'Multi-sessão',
                  badgeColor: 'bg-primary/10 text-primary border-primary/20',
                },
                {
                  icon: Smartphone,
                  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                  title: 'Sessões Ilimitadas',
                  desc: 'Conecte múltiplas contas de WhatsApp e escale seu monitoramento sem limites de hardware.',
                  badge: 'Enterprise',
                  badgeColor: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TiltCard className="h-full">
                    <div className="glass-card rounded-[2rem] p-8 space-y-6 h-full hover:border-white/15 transition-all duration-400">
                      <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center", feature.color)}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-black text-white tracking-tight">{feature.title}</h3>
                        <p className="text-muted font-medium text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                      <span className={cn("inline-flex px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest", feature.badgeColor)}>
                        {feature.badge}
                      </span>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="py-28 px-6 relative overflow-hidden content-visibility-auto">
          <div className="absolute inset-0 bg-grid-dots opacity-25 pointer-events-none" />
          <div className="max-w-7xl mx-auto space-y-16 relative z-10">
            <div className="text-center space-y-5">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-primary font-black text-[10px] uppercase tracking-[0.4em]"
              >
                Prova Social
              </motion.span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                O que dizem nossos <br /><span className="text-gradient italic">afiliados</span>
              </h2>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/5 border border-secondary/20">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-secondary animate-ping opacity-60" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">2.400+ usuários ativos</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <TiltCard className="h-full">
                    <div className={cn(
                      "h-full rounded-3xl p-8 space-y-6 border bg-gradient-to-b transition-all duration-400",
                      t.accent, t.border
                    )}>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-white/70 font-medium leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
                      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black border', t.border, t.text_color, 'bg-white/5')}>
                          {t.initials}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{t.name}</div>
                          <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{t.role}</div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="pricing" className="py-28 px-6 relative content-visibility-auto">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-20 relative z-10">
            <div className="text-center space-y-5">
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Invasão de Escala</span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
                Planos de <span className="italic text-gradient">Elite</span>
              </h2>
              <p className="text-muted text-xl max-w-2xl mx-auto font-medium">Escolha a potência necessária para sua operação.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className={cn(
                    "relative rounded-[2.5rem] border p-10 space-y-8 overflow-hidden h-full bg-gradient-to-b transition-all duration-500",
                    plan.popular
                      ? "border-primary/30 shadow-[0_40px_80px_-20px_rgba(124,58,237,0.25)]"
                      : "border-white/5 hover:border-white/10",
                    plan.gradient
                  )}>
                    {plan.popular && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-xl shadow-primary/30">
                          Mais Popular
                        </div>
                      </>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-white uppercase tracking-widest">{plan.name}</h3>
                      <p className="text-muted text-sm font-medium">{plan.desc}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-black text-white tracking-tighter">R${plan.price}</span>
                      <span className="text-muted font-bold text-xs uppercase tracking-widest">/mês</span>
                    </div>

                    <ul className="space-y-4 pt-2">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm font-bold text-white/70">
                          <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/cadastro?plan=${plan.name.toLowerCase()}`}
                      className={cn(
                        "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all text-center block",
                        plan.popular
                          ? "bg-primary text-white shadow-xl shadow-primary/25 hover:opacity-95"
                          : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                      )}
                    >
                      Aderir ao Plano
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-xs font-bold text-muted">
              {[
                { icon: Shield, text: 'Pagamento Seguro via Mercado Pago' },
                { icon: RefreshCw, text: 'Cancele a qualquer momento' },
                { icon: Zap, text: 'Ativação instantânea' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <badge.icon className="w-4 h-4 text-primary/60" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-28 px-6 relative content-visibility-auto">
          <div className="max-w-2xl mx-auto space-y-16 relative z-10">
            <div className="text-center space-y-4">
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Dúvidas</span>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                Perguntas <span className="italic text-gradient">Frequentes</span>
              </h2>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {FAQ_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="py-6 cursor-pointer group"
                  onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-black text-white text-lg group-hover:text-primary transition-colors duration-200">{item.q}</span>
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0",
                      faqOpen === i ? "bg-primary/10 border-primary/20 text-primary rotate-180" : "bg-white/[0.03] border-white/10 text-muted"
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: faqOpen === i ? 'auto' : 0, opacity: faqOpen === i ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted font-medium leading-relaxed pt-4">{item.a}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─── */}
        <section className="py-28 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/8 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                <TrendingUp className="w-3.5 h-3.5" /> Comece agora mesmo
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                Pronto para <br /><span className="text-gradient italic">escalar?</span>
              </h2>
              <p className="text-muted text-xl font-medium max-w-xl mx-auto leading-relaxed">
                Mais de 2.400 afiliados já automatizaram suas comissões. Você está esperando o quê?
              </p>
              <Link
                href="/cadastro"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.04] bg-black/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-16">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter">ProAfiliados</span>
            </div>
            <p className="text-muted text-sm font-medium max-w-xs leading-relaxed">
              A próxima geração de monitoramento de ativos digitais. Elevando o padrão da afiliação global.
            </p>
          </div>
          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Plataforma</h4>
            <ul className="space-y-3 text-sm font-bold text-muted">
              <li><Link href="#features" className="hover:text-primary transition-colors">Tecnologia</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Planos</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Acessar Conta</Link></li>
            </ul>
          </div>
          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Legal</h4>
            <ul className="space-y-3 text-sm font-bold text-muted">
              <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Proteção de Dados</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-black text-muted/60 uppercase tracking-widest">© 2026 ProAfiliados Intelligence. Todos os direitos reservados.</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] font-black text-muted/60 uppercase tracking-widest">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
