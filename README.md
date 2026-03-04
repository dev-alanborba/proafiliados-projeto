<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg" width="80" alt="ProAfiliados Logo" />
  <br/>
  <h1>ProAfiliados ⚡ Motor de Conversão Automática</h1>
  <p><strong>A plataforma definitiva de monitoramento, conversão e disparo automático de tráfego para Afiliados e Coprodutores.</strong></p>

  <a href="https://proafiliados-projeto-ww21.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Acessar_Plataforma_Ao--Vivo_%E2%96%B6-000000?style=for-the-badge&logo=vercel&logoColor=white" height="40" alt="Acessar Sistema" />
  </a>
  <br/>
  <p><em>👆 Clique no botão acima para abrir e testar o sistema agora mesmo.</em></p>

  [![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
  
  <br/>
</div>

---

## 🚀 O que é o ProAfiliados?

O **ProAfiliados** é um sistema completo em arquitetura SaaS focado em alavancar vendas orgânicas ou de grupos de tráfego pago através do WhatsApp. Diferente de monitores analíticos comuns, o coração dessa plataforma é um robô inteligente que intercepta ofertas de alta conversão de concorrentes, altera os links da oferta para o ID do seu afiliado, e repassa a oferta estruturada (Foto + Textos) perfeitamente para seus próprios grupos Vip.

Tudo isso abrigado dentro de um Dashboard Web Premium escuro e construído em tempo real para os clientes contratarem planos da sua ferramenta (via Mercado Pago) e plugar seus números WhatsApp de forma autônoma por QR Code usando um motor próprio (Evolution API).

<br/>

## 🎯 Arquitetura de Conversão (Webhook Engine)

A essência do núcleo operacional roda pelo servidor invisível através do \`api/webhook/route.ts\`:
1. **👂 Monitoramento:** O cliente delimita "Grupos Espiões". O webhook aguarda mensagens desses grupos de forma silenciosa e reativa;
2. **🤖 Interceptação (Link Parse):** Qualquer mensagem com link detectado das plataformas parceiras (Shopee, Mercado Livre, Amazon, Hotmart) engatilha a segunda etapa;
3. **🪄 Conversão Emocional:** O link hostil é destruído. Em seu lugar, a URL com a variável de afiliado (\`aff_id\`) do dono da sessão é montada e substituída diretamente no payload sem tocar no resto da copy (textos da mensagem);
4. **📤 Despache (VIP Groups):** O disparo paralelo \`O(n)\` se inicia usando os despachantes \`sendText\` ou \`sendMedia\`, inundando todos os Canais e Grupos de Destino setados pelo usuário de uma só vez, preservando até mesmo as imagens e vídeos originais copiadas do concorrente.

<br/>

## 💎 Features da Interface Frontend

- **Estética Ultra Premium:** Layout 100% Dark Theme (Glassmorfismo, Fronteiras Translúcidas, Gradientes Acentuados e Fontes Black/Itálicas modernas que valorizam o produto em `$5k/mês`);
- **Onboarding de Checkout:** Planos (Starter, Pro, Elite), Pagamentos (Cartão/Pix via M. Pago) e Setup da Conta;
- **Hub de Grupos:** Abas claras de Origem `[Espiões]` vs. Abas de Disparo `[Destino]`;
- **Links Dashboard:** Feed Ao-Vivo das capturas feitas no dia atual pelo Worker API.

<br/>

## 🛠️ Stack Tecnológico

| Camada | Tecnologia Principal | Propósito |
|---|---|---|
| **Core UI** | Next.js 14 (App Router) + React | Renderização Server-Side / Client-Side de alta velocidade. |
| **Pintura Visual** | Tailwind CSS + Lucide Icons | Utilitários diretos injetados na className garantindo 100% responsividade. |
| **Banco e Auth** | Supabase (PostgreSQL) | Autenticação Mágica por E-mail do usuário e persistência das rotas e Grupos VIPs. |
| **Aparelho Lógico** | Evolution API | Conexão Multi-Sessões de instâncias de WhatsApp no formato WebHook (Node.js). |

<br/>

## ⚡ Como rodar o sistema localmente na sua máquina (Modo Dev)

Esteja certo de estar rodando as ferramentas corretas para Node.JS na versão 18+.

1. **Clone do Repositório**
   \`\`\`bash
   git clone https://github.com/dev-alanborba/proafiliados-projeto.git
   cd proafiliados-projeto
   \`\`\`

2. **Instalação das dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Chaves (Ambiente .env)**
   Crie um arquivo chamado \`.env.local\` seguindo a arquitetura de base do \`.env.example\` que já está na pasta. Você vai precisar inserir suas URLs do Supabase.

4. **Inicie o Foguete**
   \`\`\`bash
   npm run dev
   \`\`\`
   
5. A interface subirá instantaneamente na porta: \`http://localhost:3000\`.

<br/>

---

<div align="center">
    <i>Desenvolvido e operando a 100x com Next.js e Inteligência Algorítmica.</i>
</div>
