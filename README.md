# ProAfiliados

> Sistema de gestão e análise de vendas para afiliados digitais. Meu primeiro projeto como desenvolvedor, construído com Next.js, TypeScript e Supabase.

## 🌟 Visão Geral

ProAfiliados é uma aplicação web fullstack desenvolvida como meu primeiro grande projeto profissional como desenvolvedor. O sistema foi criado para centralizar, organizar e visualizar todos os dados importantes para um afiliado digital: campanhas, produtos, links, vendas e comissões.

A aplicação combina uma **UI moderna com tema escuro**, **tipagem forte com TypeScript**, **autenticação segura** e **banco de dados bem estruturado** para oferecer uma experiência completa de gestão.

---

## 🌮 O que o ProAfiliados faz

- **Autenticação & Gerenciamento de Usuários**: Sistema de login seguro com Supabase Auth
- **Gestão de Campanhas**: Organize suas campanhas de afiliado com facilidade
- **Rastreamento de Vendas**: Registre vendas, comissões e acompanhe o desempenho em tempo real
- **Análise de Métricas**: Cards e tabelas com dados de faturamento, ticket médio, taxa de conversão
- **Interface Profissional**: UI responsiva com tema escuro, desenvolvida com Tailwind CSS
- **Tipagem Completa**: Toda a aplicação desenvolvida com TypeScript rigoroso (strict mode)

---

## 💻 Stack Tecnológico

### Frontend
- **Next.js 15+** (App Router) - Framework React moderno e performático
- **React 19+** - Biblioteca UI
- **TypeScript** - Tipagem estática forte em todo o código
- **Tailwind CSS** - Estilização moderna e utilitária
- **ESLint** - Lint rígido com enforceamento de tipos

### Backend & Database
- **Supabase** - PostgreSQL gerenciado + Autenticação + RLS
- **PostgrSQL** - Banco de dados robusto e relacional
- **Row Level Security (RLS)** - Segurança de dados em nível de banco

### Ferramentas & Configuração
- **tsconfig.json** - Configuração TypeScript rigorosa (strict: true)
- **next.config.ts** - Configuração otimizada de Next.js
- **postcss** + **Tailwind CSS** - Processamento CSS moderno

---

## 🚀 Iniciando o Projeto

### Pré-requisitos
- Node.js 18+ ou 20+
- npm, yarn, pnpm ou bun
- Conta Supabase (criar em https://supabase.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/dev-alanborba/proafiliados-projeto.git
cd proafiliados-projeto

# Instale as dependências
npm install
# ou
yarn install
# ou
pnpm install
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-instancia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Rodando em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📄 Arquitetura do Projeto

```
src/
├─ app/
│  ├─ (auth)/          # Páginas de autenticação (login/signup)
│  ├─ (dashboard)/     # Rotas protegidas do painel principal
│  ├─ layout.tsx       # Layout raiz
│  ├─ page.tsx         # Página inicial
│  └─ globals.css      # Estilos globais
├─ components/        # Componentes React reutilizáveis
├─ hooks/             # Custom hooks (useAuth, useFetch, etc)
├─ lib/               # Funções utilitárias e helpers
├─ types/             # Definições de tipos TypeScript
└─ utils/             # Funções auxiliares

public/                   # Assets estáticos
supabase_schema.sql       # Schema do banco de dados
tsconfig.json             # Configurações TypeScript
next.config.ts            # Configurações Next.js
```

### Schema do Banco de Dados

O arquivo `supabase_schema.sql` contém:
- Tabelas: `users`, `campaigns`, `products`, `sales`, `commissions`
- Relações entre entidades
- Políticas de Row Level Security (RLS)
- Índices para performance

---

## 📚 Aprendizados Principais

Como primeiro projeto profissional como desenvolvedor, este projeto me ensinou:

1. **Tipagem em TypeScript** - Uso rigoroso de tipos, interfaces e generics
2. **Arquitetura de Componentes** - Organização e reutilização de código
3. **Integração com Banco de Dados** - Queries, relações e segurança com RLS
4. **Autenticação & Autorização** - Implementação segura com Supabase Auth
5. **UI/UX Moderna** - Design com Tailwind CSS e tema escuro
6. **Code Quality** - ESLint, commits estruturados, boas práticas

---

## 🙋 Contribuções

Este é um projeto pessoal em desenvolvimento. Sugestões e melhorias são bem-vindas!

---

## 📄 Licença

MIT - sinta-se livre para usar este projeto como referência para seus estudos.

---

## 👇 Sobre Mim

Sou Alan Borba, desenvolvedor em formação atuando como freelancer. Este projeto representa meu comprometimento com qualidade de código e boas práticas de desenvolvimento.

- GitHub: [@dev-alanborba](https://github.com/dev-alanborba)
- Estudando em: UNISC (Análise e Desenvolvimento de Sistemas)
