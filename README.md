# VanTástica

Gestão inteligente de vans escolares — SaaS multi-tenant para donos e
motoristas de van organizarem rotas, check-in dos alunos e comunicação
automática com as famílias.

- **Motorista**: `/motorista` — dashboard, execução de rota, dossiê do
  aluno, financeiro.
- **Responsável**: `/responsavel` — status ao vivo, avisos/histórico,
  financeiro, calendário letivo.

Ambos são instaláveis como PWA ("Adicionar à Tela de Início") com
manifests e ícones próprios para cada perfil.

## Stack

- **Next.js** (App Router) + **Tailwind CSS v4** — hospedado na **Vercel**
- **Supabase** — Postgres multi-tenant (RLS por organização), Auth,
  Storage e Realtime
- **Resend** (MVP) → **Amazon SES** (quando o volume de notificações
  crescer) — e-mails transacionais de embarque/entrega

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — em
     [app.supabase.com](https://app.supabase.com) → seu projeto →
     Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — mesma tela (uso restrito a
     código server-side que precisa contornar RLS, nunca exposto ao
     client).
   - `RESEND_API_KEY` — em [resend.com/api-keys](https://resend.com/api-keys).

2. Rode a migração inicial do banco no seu projeto Supabase (SQL Editor
   ou `supabase db push` com a CLI):

   ```
   supabase/migrations/0001_init.sql
   ```

   Isso cria as tabelas (organizações, alunos, responsáveis, rotas,
   check-ins, financeiro, ocorrências, calendário) já com Row Level
   Security multi-tenant configurada.

3. Instale as dependências e rode em desenvolvimento:

   ```bash
   npm install
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
  app/
    motorista/       # rotas do app do motorista
    responsavel/      # rotas do app do responsável
    (auth)/login/      # autenticação
  components/
  lib/supabase/        # clients (browser/server) + refresh de sessão
supabase/
  migrations/          # schema do banco (SQL versionado)
public/
  manifest-*.webmanifest
  icons/
  sw.js                # service worker (app shell + suporte offline-first)
```

## Deploy

Projeto pronto para deploy direto na [Vercel](https://vercel.com/new) —
basta importar o repositório e configurar as mesmas variáveis de
ambiente do `.env.example` no painel do projeto.
