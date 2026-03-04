'use client'

import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full -mr-64 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -ml-64 -mb-32" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10 space-y-12">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-secondary transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
                </Link>

                <div className="space-y-4">
                    <div className="w-16 h-16 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                        <Lock className="w-8 h-8 text-secondary" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Política de <span className="text-secondary italic">Privacidade</span></h1>
                    <p className="text-muted font-bold uppercase tracking-widest text-xs">Última atualização: Março de 2026</p>
                </div>

                <div className="prose prose-invert prose-secondary max-w-none space-y-8 text-white/70 font-medium leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Coleta de Dados</h2>
                        <p>
                            Coletamos apenas as informações necessárias para a prestação do serviço, como nome, email e dados de sessão do WhatsApp. Não armazenamos o conteúdo das suas conversas privadas, apenas os links capturados conforme configurado no sistema.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Uso das Informações</h2>
                        <p>
                            Seus dados são utilizados exclusivamente para gerenciar sua conta, processar pagamentos e fornecer suporte técnico. Suas informações nunca serão vendidas ou compartilhadas com terceiros para fins publicitários.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Segurança</h2>
                        <p>
                            Utilizamos criptografia de ponta a ponta e infraestrutura segura via Supabase para proteger seus dados. Monitoramos constantemente nossa rede contra acessos não autorizados.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Cookies</h2>
                        <p>
                            Utilizamos cookies estritamente necessários para manter sua sessão ativa e garantir a segurança da navegação na plataforma ProAfiliados.
                        </p>
                    </section>
                </div>

                <div className="pt-20 border-t border-white/5 text-center">
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">© 2026 ProAfiliados Intelligence. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    )
}
