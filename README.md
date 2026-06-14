# Ignis Marketplace

Catalogo online de **plugins e assets** do [IgnisEngine](https://github.com/URSoftware/IgnisEngine),
com **contas de usuario (GitHub OAuth)**, **gate de seguranca** nas submissoes, **moderacao/admin**
e camada legal (Termos, Privacidade, consentimento de cookies).

Backend serverless (Next.js) na **Vercel** + banco **Neon (Postgres)**.

> Regra do roadmap: o marketplace guarda apenas **URLs de repositorios Git**, nunca binarios.

---

## Stack

- **Next.js 14** (App Router) — frontend + API Routes
- **Auth.js v5 (next-auth)** — login com **GitHub OAuth**, identidade unica por usuario
- **@neondatabase/serverless** — driver Postgres serverless
- **Neon** + **Vercel** — banco e hospedagem (free tier)

## Estrutura

```
IginisMarketePlace/
├── auth.js                      # config Auth.js (GitHub, callbacks, admin)
├── app/
│   ├── page.js                  # catalogo (apenas aprovados, com dono)
│   ├── publish/page.js          # publicar (login + aceite + gate)
│   ├── admin/                   # painel admin (ban/unban) — restrito
│   ├── terms / privacy          # paginas legais
│   ├── components/              # Header (login), CookieConsent
│   └── api/
│       ├── auth/[...nextauth]   # rotas do Auth.js
│       ├── me                   # usuario logado
│       ├── items                # GET catalogo · POST publicar (gate)
│       ├── items/[id]           # GET · POST downloads · DELETE (admin/dono)
│       └── admin/users          # listar / banir (admin)
├── lib/db.js · lib/security.js  # Neon · gate de seguranca
└── db/
    ├── schema.sql               # esquema base
    └── migrations/002_users_security.sql  # usuarios + seguranca (idempotente)
```

## Usuarios, seguranca e admin

- **Identidade:** login via GitHub. Cada conta GitHub = usuario unico (tabela `users`).
- **Admins:** logins em `ADMIN_GITHUB_LOGINS` (padrao `ThyagoToledo,FeronZerbana`) viram
  `is_admin` automaticamente ao logar. Apenas admins acessam `/admin` e os endpoints `/api/admin/*`.
- **Gate de seguranca** (ao publicar): valida os campos, valida a URL do repo (host permitido,
  repo existe/publico/nao arquivado via GitHub API) e roda uma blocklist. **Reprovado nao sobe.**
- **Moderacao:** admin pode **banir** usuarios (banido nao loga nem publica, e seus itens somem do
  catalogo) e remover itens.
- **Legal:** Termos de Servico e Privacidade/Cookies, banner de consentimento e aceite obrigatorio
  antes de publicar (com isencao de responsabilidade sobre conteudo de terceiros).

## API

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET  | `/api/health`    | — | Status da API e do banco |
| GET  | `/api/items`     | — | Catalogo aprovado (`?type=`, `?q=`) |
| POST | `/api/items`     | login + aceite | Publica (passa pelo gate de seguranca) |
| GET  | `/api/items/:id` | — | Detalhe |
| POST | `/api/items/:id` | — | Incrementa downloads |
| DELETE | `/api/items/:id` | admin/dono | Remove item |
| GET  | `/api/me`        | — | Usuario logado |
| GET  | `/api/admin/users` | admin | Lista usuarios |
| POST | `/api/admin/users/:id` | admin | `{action:"ban"\|"unban", reason}` |
| GET/POST | `/api/tokens` | login | Lista / gera token de publicacao |
| DELETE | `/api/tokens/:id` | login | Revoga um token |

> `POST /api/items` aceita **sessao (cookie web)** OU **`Authorization: Bearer <token>`** (editor/CLI).

## Deploy na Vercel + Neon + GitHub OAuth

1. **Import na Vercel:** New Project → `ThyagoToledo/IginisMarketePlace` → Deploy.
2. **Banco Neon:** aba **Storage → Create Database → Neon (Free) → Connect to Project**
   (injeta `DATABASE_URL`).
3. **Tabelas:** no Neon → SQL Editor → rode `db/migrations/002_users_security.sql`.
4. **GitHub OAuth App:** github.com → **Settings → Developers → OAuth Apps → New OAuth App**
   - Homepage URL: `https://SEU-PROJETO.vercel.app`
   - **Authorization callback URL:** `https://SEU-PROJETO.vercel.app/api/auth/callback/github`
   - Gere um **Client secret**.
5. **Variaveis na Vercel** (Settings → Environment Variables):
   - `AUTH_SECRET` (gere: `openssl rand -base64 33`)
   - `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` (do passo 4)
   - `ADMIN_GITHUB_LOGINS=ThyagoToledo,FeronZerbana`
   - opcional: `GITHUB_TOKEN` (escopo `public_repo`, evita rate limit nas checagens)
6. **Redeploy.** Teste `SUA_URL/api/health` e faca login com GitHub no topo do site.

## Conexao com o editor

O catalogo (`GET /api/items`) e publico — o editor IgnisEngine
(`com.ignis.marketplace.MarketplaceClient`) consome direto. Defina a URL base:

```
IGNIS_MARKETPLACE_URL = https://SEU-PROJETO.vercel.app
```

Publicar pelo editor (sem navegador) usa **token**:
1. Logue no site com GitHub → pagina **Conta** (`/account`) → **Gerar novo token** → copie.
2. No editor: **Community Hub → 🔑 Token** → cole e salve.
3. Use **💻 Publicar com token** no editor (ou **🌐 Publicar no site** para o fluxo web).

O token vai no header `Authorization: Bearer <token>`. Rode a migracao
`db/migrations/003_api_tokens.sql` no Neon para criar a tabela de tokens.

## Dev local (opcional)

Requer Node 18+. `npm install`, copie `.env.example` para `.env` e preencha. `npm run dev`.
