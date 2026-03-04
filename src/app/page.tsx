'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Zap, Shield, BarChart3, Globe, Smartphone, Users, RefreshCw, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter">ProAfiliados</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-muted">
            <Link href="#features" className="hover:text-primary transition-colors">Funcionalidades</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Planos</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link href="/cadastro" className="bg-primary text-white px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/10">Começar Agora</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24 overflow-x-hidden relative">
        {/* Subtle Background Noise Overlay (Already in CSS, emphasizing depth here) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center py-10 px-6">
          {/* Animated Mesh Orbs (Enhanced) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full"
            />
            <motion.div
              animate={{
                x: [0, -60, 0],
                y: [0, 40, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-primary/5 blur-[120px] rounded-full"
            />
          </div>

          <div className="max-w-7xl mx-auto text-center space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">O Robô de Conversão Automática</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.05em] leading-[0.9] text-white uppercase"
            >
              Monitore <br />
              <span className="text-primary italic relative">
                Grupos
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  className="absolute -bottom-4 left-0 h-3 bg-primary/20 blur-md rounded-full"
                />
              </span> <br />
              Venda no Automático
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg md:text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-medium tracking-tight"
            >
              O robô escuta grupos 24h/dia, injeta o seu link de afiliado nas ofertas <br className="hidden md:block" />
              e repassa a foto com o texto convertido para os seus Grupos VIP em <span className="text-white font-bold underline decoration-primary/50 decoration-4 underline-offset-8">frações de segundo</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10"
            >
              <Link href="/cadastro" className="group relative px-14 py-7 bg-white text-black font-black rounded-3xl text-xs uppercase tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] flex items-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">Começar Agora</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="#features" className="group px-14 py-7 border border-white/5 bg-white/[0.03] backdrop-blur-xl rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all relative overflow-hidden">
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255, 255, 255, 0.05)]" />
                <span className="text-white/70 group-hover:text-white transition-colors">Explorar Tecnologia</span>
              </Link>
            </motion.div>
          </div>

          {/* Dynamic Engine Workflow (Replaces Static 3D Dashboard) */}
          <div className="mt-32 w-full max-w-5xl mx-auto px-6 relative z-10">
            <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-8 relative">

              {/* Connection Lines (Desktop only, absolute) */}
              <div className="hidden md:flex absolute top-[40%] left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent -translate-y-1/2 z-0" />

              {/* Step 1: Monitoramento */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex-1 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] z-10 space-y-6 relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                  <Users className="w-6 h-6 text-white/70" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white">1. Grupos Espião</h3>
                  <p className="text-sm text-muted mt-2 font-medium">O robô lê silenciosamente as milhares de ofertas enviadas pelos lojistas.</p>
                </div>
                {/* Anim Mock */}
                <div className="mt-6 h-24 bg-white/[0.02] rounded-xl border border-white/5 p-4 flex flex-col justify-end relative overflow-hidden gap-2">
                  <motion.div animate={{ y: [10, 0], opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }} className="w-full h-6 bg-white/10 rounded-lg flex items-center px-2">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </motion.div>
                  <motion.div animate={{ y: [10, 0], opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }} className="w-2/3 h-6 bg-white/5 rounded-lg flex items-center px-2">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 2: Clonagem */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex-1 bg-primary/10 backdrop-blur-2xl border border-primary/20 p-8 rounded-[2rem] z-10 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center relative z-10 shadow-lg shadow-primary/20">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-primary">2. Substituição</h3>
                  <p className="text-sm text-primary/70 mt-2 font-medium">O link original é apagado. O seu Link de Afiliado é injetado no lugar em fração de segundos.</p>
                </div>
                {/* Anim Mock */}
                <div className="mt-6 h-24 bg-primary/[0.05] rounded-xl border border-primary/20 p-4 flex items-center justify-center relative overflow-hidden">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin-slow" />
                </div>
              </motion.div>

              {/* Step 3: Disparo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="flex-1 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] z-10 space-y-6 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center relative z-10">
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white">3. Publicação</h3>
                  <p className="text-sm text-muted mt-2 font-medium">A mensagem convertida, junto com a imagem original, cai direto nos seus Grupos VIP.</p>
                </div>
                {/* Anim Mock */}
                <div className="mt-6 h-24 bg-white/[0.02] rounded-xl border border-white/5 p-4 flex items-center justify-start relative overflow-hidden gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 shrink-0 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="w-full space-y-2">
                    <div className="w-full h-2 bg-secondary/40 rounded-full" />
                    <div className="w-2/3 h-2 bg-secondary/20 rounded-full" />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Brand Bar - 3D Carousel Style */}
        <section className="py-20 border-y border-white/5 bg-white/[0.01] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto overflow-hidden flex relative w-full">
            <div className="flex items-center w-max animate-marquee opacity-40">
              {/* Duplicamos o set de Marcas dentro de uma mesma linha para scroll infinito perfeito de 50% */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <React.Fragment key={n}>
                  <span className="text-4xl px-16 font-black italic tracking-tighter text-white whitespace-nowrap">SHOPEE</span>
                  <span className="text-4xl px-16 font-black italic tracking-tighter text-white whitespace-nowrap">MERCADO LIVRE</span>
                  <span className="text-4xl px-16 font-black italic tracking-tighter text-white whitespace-nowrap">AMAZON</span>
                  <span className="text-4xl px-16 font-black italic tracking-tighter text-white whitespace-nowrap">ALIEXPRESS</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - High-End Bento Grid */}
        <section id="features" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 space-y-24">
            <div className="text-center space-y-6">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-primary font-black text-[10px] uppercase tracking-[0.4em]"
              >
                Engenharia de Performance
              </motion.span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white">Inteligência <span className="italic">Avançada</span></h2>
              <p className="text-muted text-xl max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
                Uma abordagem não linear para o monitoramento de ativos digitais. Arquitetura distribuída encontra execução impecável.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[900px]">
              {/* Feature 1: Main (Big) */}
              <motion.div
                whileHover={{ y: -5 }}
                className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-4px] hover:border-white/10 p-12 flex flex-col justify-between group h-full"
              >
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255, 255, 255, 0.05)]" />
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">Monitoramento e <br /> Troca de Links</h3>
                  <p className="text-muted text-lg max-w-md font-medium">Extrai o link original (Shopee, Mercado Livre, Amazon), converte para o seu ID de afiliado e posta a mensagem final.</p>
                </div>
                <div className="mt-12 relative h-80 w-full rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] p-1 shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                  {/* Dynamic Link Stream Visualization */}
                  <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                    {[
                      { p: 'Shopee', pr: 'R$ 47,90', x: '10%', y: '20%', d: 0 },
                      { p: 'M. Livre', pr: 'R$ 159,00', x: '60%', y: '15%', d: 0.5 },
                      { p: 'Amazon', pr: 'R$ 1.299', x: '30%', y: '50%', d: 1 },
                      { p: 'AliExpress', pr: 'R$ 89,00', x: '75%', y: '45%', d: 1.5 },
                      { p: 'Hotmart', pr: 'R$ 297,00', x: '15%', y: '75%', d: 0.8 },
                      { p: 'Eduzz', pr: 'R$ 49,90', x: '55%', y: '80%', d: 1.2 },
                      { p: 'Kiwify', pr: 'R$ 97,00', x: '85%', y: '25%', d: 2 },
                      { p: 'Monetizze', pr: 'R$ 197,00', x: '40%', y: '65%', d: 0.3 },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.3, 0.7, 0.3],
                          scale: [0.95, 1, 0.95]
                        }}
                        transition={{
                          duration: 4 + ((i % 5) * 0.4),
                          repeat: Infinity,
                          delay: item.d
                        }}
                        className="absolute p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-2xl"
                        style={{ left: item.x, top: item.y }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-white/40 uppercase tracking-tighter">{item.p}</div>
                          <div className="text-[10px] font-bold text-white tracking-tight">{item.pr}</div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Scanning Line Effect */}
                    <motion.div
                      animate={{ top: ['-10%', '110%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-primary/20 to-transparent z-10 pointer-events-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Feature 2: Side Top */}
              <motion.div
                whileHover={{ y: -5 }}
                className="md:col-span-4 relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-4px] hover:border-white/10 p-10 space-y-8 group h-full"
              >
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255, 255, 255, 0.05)]" />
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="text-3xl font-black text-white tracking-tight">Cópia de Midia (Img/Vid)</h3>
                  <p className="text-muted font-medium text-sm leading-relaxed">Não é só texto. O robô baixa a imagem/vídeo da oferta e anexa na mensagem de destino, como se fosse você enviando.</p>
                </div>

                {/* AI Visualization */}
                <div className="flex-1 min-h-[160px] relative mt-4 border border-white/5 rounded-2xl bg-white/[0.01] overflow-hidden group/ia">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full p-4 grid grid-cols-6 gap-2">
                      {[...Array(24)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.1 }}
                          animate={{
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2 + ((i % 5) * 0.4),
                            repeat: Infinity,
                            delay: (i % 4) * 0.5
                          }}
                          className="h-full w-full bg-secondary/10 rounded-md border border-secondary/20 flex items-center justify-center overflow-hidden"
                        >
                          <div suppressHydrationWarning className="text-[6px] font-mono text-secondary/40">0x{((i * 13) % 16).toString(16).toUpperCase()}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <motion.div
                    animate={{ left: ['-20%', '120%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-secondary/10 to-transparent skew-x-12 z-10"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-20 h-20 text-secondary/10 group-hover/ia:text-secondary/20 transition-colors duration-700 animate-pulse" />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-secondary px-2 py-1 bg-secondary/10 rounded-md">ENVIO IMEDIATO</span>
                  </div>
                </div>
              </motion.div>

              {/* Feature 3: Bottom Left (Medium) */}
              <motion.div
                whileHover={{ y: -5 }}
                className="md:col-span-12 lg:col-span-5 relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-4px] hover:border-white/10 p-10 space-y-8 group h-full"
              >
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255, 255, 255, 0.05)]" />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tighter">Conexão via QR Code</h3>
                  <p className="text-muted font-medium text-sm leading-relaxed">Conecte o número do seu bot em segundos usando nosso servidor próprio da Evolution API. Escala multi-sessão.</p>
                </div>
              </motion.div>

              {/* Feature 4: Bottom Right (Wide) */}
              <motion.div
                whileHover={{ y: -5 }}
                className="md:col-span-12 lg:col-span-7 relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-4px] hover:border-white/10 p-10 flex flex-col justify-end group h-full relative"
              >
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255, 255, 255, 0.05)]" />
                <div className="absolute top-0 right-0 p-8">
                  <Smartphone className="w-40 h-40 text-white/[0.03] -rotate-12 translate-x-10 -translate-y-10 group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl font-black text-white tracking-tight leading-none italic">Sessões Ilimitadas</h3>
                  <p className="text-muted font-medium text-sm max-w-sm">Conecte múltiplas contas de WhatsApp e escale seu monitoramento ao infinito sem restrições de hardware.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Premium Bento-style */}
        <section id="pricing" className="py-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 space-y-24 relative z-10">
            <div className="text-center space-y-6">
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Invasão de Escala</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white">Planos de <span className="italic">Elite</span></h2>
              <p className="text-muted text-xl max-w-2xl mx-auto font-medium tracking-tight">Escolha a potência necessária para sua operação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Starter', price: '47', desc: 'Para quem está começando a escalar.', features: ['1 Sessão WhatsApp', '10 Grupos Monitorados', 'Captura Real-time', 'Suporte via Ticket'] },
                { name: 'Professional', price: '97', desc: 'O equilíbrio perfeito para profissionais.', popular: true, features: ['3 Sessões WhatsApp', '50 Grupos Monitorados', 'AI Pattern Matching', 'Relatórios Avançados', 'Suporte Prioritário'] },
                { name: 'Enterprise', price: '197', desc: 'Potência máxima para grandes operações.', features: ['10 Sessões WhatsApp', 'Grupos Ilimitados', 'API Access Beta', 'Gerente de Conta', 'Infra Dedicada'] }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={cn(
                    "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-4px] hover:border-white/10 p-12 space-y-10 group relative",
                    plan.popular ? "border-primary/30 bg-primary/[0.03] shadow-[0_30px_60px_-15px_rgba(124,58,237,0.2)]" : ""
                  )}
                >
                  <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255, 255, 255, 0.05)]" />
                  {plan.popular && (
                    <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                      Mais Popular
                    </div>
                  )}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">{plan.name}</h3>
                    <p className="text-muted text-sm font-medium leading-relaxed">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white tracking-tighter">R${plan.price}</span>
                    <span className="text-muted font-bold text-xs uppercase tracking-widest">/mês</span>
                  </div>
                  <ul className="space-y-5 pt-4">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-4 text-sm font-bold text-white/70">
                        <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/cadastro?plan=${plan.name.toLowerCase()}`}
                    className={cn(
                      "w-full py-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all text-center block shadow-2xl relative overflow-hidden",
                      plan.popular ? "bg-white text-black" : "bg-white/5 border border-white/5 hover:bg-white/10 text-white"
                    )}
                  >
                    <span className="relative z-10">Aderir ao Plano</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Premium */}
      <footer className="py-32 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                <Zap className="w-7 h-7 text-primary fill-primary/20" />
              </div>
              <span className="font-black text-2xl tracking-tighter">ProAfiliados</span>
            </div>
            <p className="text-muted text-lg max-w-sm font-medium leading-relaxed">
              A próxima geração de monitoramento de ativos digitais. Elevando o padrão da afiliação global.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Plataforma</h4>
            <ul className="space-y-4 text-sm font-bold text-muted">
              <li><Link href="#features" className="hover:text-primary transition-colors">Tecnologia</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Planos</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Acessar Conta</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Segurança</h4>
            <ul className="space-y-4 text-sm font-bold text-muted">
              <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> Proteção de Dados</li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4" /> Infraestrutura Cloud</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 mt-20">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">© 2026 ProAfiliados Intelligence. Todos os direitos reservados.</span>
          <div className="flex items-center gap-8 text-[10px] font-black text-muted uppercase tracking-widest underline decoration-white/5 decoration-2 underline-offset-4">
            <Link href="/termos">Termos</Link>
            <Link href="/privacidade">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
