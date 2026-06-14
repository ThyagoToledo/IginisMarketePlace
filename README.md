# Ignis Marketplace

Catalogo online de **plugins e assets** do [IgnisEngine](https://github.com/URSoftware/IgnisEngine).
Backend serverless (Next.js) na **Vercel** + banco **Neon (Postgres)**.

> Regra do roadmap: o marketplace guarda apenas **URLs de repositorios Git**, nunca binarios.
> O editor IgnisEngine consome a API REST deste projeto pela aba *Community & Marketplace*.

---

## Stack

- **Next.js 14** (App Router) — frontend do catalogo + API Routes
- **@neondatabase/serverless** — driver Postgres para funcoes serverless
- **Neon** — banco Postgres gratuito
- **Vercel** — hospedagem gratuita (zero-config para Next.js)

## Estrutura

```
IginisMarketePlace/
├── app/
│   ├── page.js                  # UI do catalogo (server component)
│   ├── layout.js / globals.css  # tema escuro
│   └── api/
│       ├── health/route.js      # GET  /api/health
│       └── items/
│           ├── route.js         # GET/POST /api/items
│           └── [id]/route.js    # GET/POST /api/items/:id
├── lib/db.js                    # cliente Neon
├── db/
│   ├── schema.sql               # cria a tabela items
│   └── seed.csv                 # dados iniciais (importar no Neon)
├── .env.example
└── package.json
```

## API

| Metodo | Rota                | Descricao                                            |
|--------|---------------------|------------------------------------------------------|
| GET    | `/api/health`       | Status da API e do banco                             |
| GET    | `/api/items`        | Catalogo completo (`?type=plugin\|workshop\|asset`, `?q=busca`) |
| POST   | `/api/items`        | Publica um pacote (apenas URL Git)                   |
| GET    | `/api/items/:id`    | Detalhe de um pacote                                 |
| POST   | `/api/items/:id`    | Incrementa downloads (1-click install)               |

Os campos JSON sao **camelCase** (`gitUrl`, `coverImageText`), prontos para o cliente Java do editor.

## Deploy na Vercel + Neon (gratuito)

1. **Importe este repo na Vercel** (New Project → `ThyagoToledo/IginisMarketePlace`). O Next.js e detectado automaticamente.
2. **Crie o banco Neon**: na Vercel → aba **Storage** → *Create Database* → **Neon** (plano free). Isso injeta a variavel `DATABASE_URL` no projeto automaticamente.
3. **Crie a tabela**: no painel do Neon → *SQL Editor* → cole e rode o conteudo de [`db/schema.sql`](db/schema.sql).
4. **Importe os dados**: no Neon → *Tables* → tabela `items` → **Import** → suba [`db/seed.csv`](db/seed.csv) (CSV com cabecalho).
5. **Redeploy** (a Vercel refaz o build com `DATABASE_URL` ja configurada).
6. Acesse a URL gerada (ex: `https://iginis-markete-place.vercel.app`) — o catalogo deve listar os itens.

## Conexao com o editor

No IgnisEngine, defina a URL base via variavel de ambiente ou propriedade de sistema:

```
IGNIS_MARKETPLACE_URL = https://SEU-PROJETO.vercel.app
```

O editor (`com.ignis.marketplace.MarketplaceClient`) consome `/api/items`. Se a API estiver
offline, ele cai automaticamente no catalogo mock embutido, entao o editor nunca quebra.

## Dev local (opcional)

Requer Node 18+.

```bash
npm install
cp .env.example .env        # cole a DATABASE_URL do Neon
npm run dev                 # http://localhost:3000
```
