'use client'

import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-64 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full -ml-64 -mb-32" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10 space-y-12">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-primary transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
                </Link>

                <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Termos de <span className="text-primary italic">Serviço</span></h1>
                    <p className="text-muted font-bold uppercase tracking-widest text-xs">Última atualização: Março de 2026</p>
                </div>

                <div className="prose prose-invert prose-primary max-w-none space-y-8 text-white/70 font-medium leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar a plataforma ProAfiliados, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concorda com qualquer parte destes termos, não deverá utilizar nossos serviços.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Descrição do Serviço</h2>
                        <p>
                            O ProAfiliados é uma ferramenta de automação e monitoramento de links para afiliados, integrando-se com o WhatsApp para captura de mensagens em grupos. O serviço é fornecido &quot;como está&quot; e a disponibilidade pode variar conforme as APIs de terceiros.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Uso Responsável</h2>
                        <p>
                            O usuário compromete-se a não utilizar a ferramenta para fins de spam, atividades ilegais ou qualquer ação que viole as políticas do WhatsApp ou das lojas parceiras (Shopee, Mercado Livre, Amazon). O uso indevido resultará na suspensão imediata da conta sem direito a reembolso.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Assinaturas e Pagamentos</h2>
                        <p>
                            Nossos planos são cobrados mensalmente via Mercado Pago. O acesso às funcionalidades premium é liberado após a confirmação do pagamento. Cancelamentos podem ser solicitados a qualquer momento, mantendo o acesso até o fim do período vigente.
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
