# Hidro Alerta — Informação certa salva vidas

Plataforma de prevenção, monitoramento e resposta a desastres naturais.

> **Estado atual (pós-RECOVERY-3):** persistência real (PostgreSQL/PostGIS + Redis via Docker), API v1 com OpenAPI, sync INMET para o banco e leitura pela API. sistema **híbrido e honesto** — a integração com os avisos meteorológicos do **INMET fornece alertas oficiais reais** quando ativada; **todos os demais módulos ainda usam dados simulados** e estão rotulados como tal. Em emergência real, ligue 192 (SAMU), 193 (Bombeiros) ou 199 (Defesa Civil).

## Modo de dados (ALERT_DATA_MODE)

| Modo | Comportamento |
|---|---|
| `official` | `/api/alerts` busca o feed público de avisos do INMET (sem autenticação), normaliza e expõe apenas avisos vigentes. Falha da fonte **nunca** vira fallback para dados simulados — o dashboard exibe "FONTE INDISPONÍVEL" com orientação de que isso **não significa ausência de risco**. |
| `mock` (default sem `.env.local`) | Todos os dados são simulados; o banner global deixa claro que "nenhum alerta exibido é real". |

Configure copiando `.env.example` para `.env.local`. Nota: em build de produção o texto do banner é resolvido no build; em `npm run dev` é resolvido por request.

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3001](http://localhost:3001) no navegador.

## Testes

```bash
# Unit tests (Vitest)
npm run test

# Testes E2E (Playwright) — o modo mock é forçado para hermeticidade
npx playwright install    # primeira vez
npm run test:e2e

# Type checking
npm run typecheck

# Lint
npm run lint
```

A suíte E2E inclui varreduras **axe-core** (WCAG 2.x A/AA) nas 7 rotas — zero violações críticas/serious.

## Build de produção

```bash
npm run build
npm start
```

## Rotas (frontend)

| Rota | Descrição |
|---|---|
| `/` | Dashboard (seção de alertas oficiais quando em modo official; simulados rotulados em mock) |
| `/mapa` | Mapa de risco interativo + **resumo textual acessível** |
| `/alertas` | Central de alertas (oficiais ou simulados, conforme o modo) |
| `/alertas/[id]` | Detalhes de um alerta (oficial ou simulado) |
| `/abrigos` | Lista de abrigos (via API; simulados) |
| `/ocorrencias` | Relatar ocorrência (POST na API; armazenamento demo em memória — não envia a órgãos) |
| `/tsunami` | Riscos costeiros e tsunami (educativo; sem fonte oficial conectada) |

## API

- **Superfície versionada:** `/api/v1/*` — alertas (filtros + paginação), fontes/status, abrigos, ocorrências (POST com consentimento e rate limit 5/min), `health/live` e `health/ready`.
- **OpenAPI:** `GET /api/openapi.json` (schemas gerados dos contratos Zod).
- **Correlation ID:** `x-correlation-id` aceito/gerado e ecoado em toda resposta.
- **Erros padronizados:** envelope `error.{code,message,correlationId,details}` — nunca stack trace.
- **Legado:** `/api/alerts`, `/api/sources/status`, `/api/health` seguem ativos delegando aos mesmos services.
- Detalhes: [`docs/API.md`](docs/API.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [ADR 0005](docs/ADR/0005-api-domain-inside-next.md)

## Mapa

Leaflet + react-leaflet com tiles **OpenStreetMap** (única comunicação externa; ícones de marcador são servidos localmente em `public/leaflet/`). O mapa tem alternativa textual (seção "Resumo textual do mapa") que reflete os filtros ativos.

## Integração INMET

- Endpoint: `https://apiprevmet3.inmet.gov.br/avisos/rss` (configurável em `INMET_RSS_URL`)
- Sem autenticação; timeout de 15 s; **1 retry** com backoff para falhas transientes; cache em memória de 120 s
- Suporta os dois formatos de tabela do feed (markdown legado e HTML atual)
- Falha segura: fonte OFFLINE → lista vazia + status visível; **nunca** mock disfarçado de oficial

## Dados

- Alertas oficiais (modo official): reais, com fonte, horário e `isOfficial: true`
- Todo dado simulado carrega `isSimulated: true` e rótulo na UI; o provider de mock marca `isOfficial: false` — **nenhum mock exibe badge OFICIAL**

## Persistência (RECOVERY-3)

```bash
npm run infra:up     # PostGIS (5434) + Redis (6379), com healthchecks
npm run db:migrate   # migrations SQL versionadas (Drizzle)
npm run db:seed      # seed determinística (INMET/MOCK, abrigos, RIO-001, alertas mock)
```

- Alertas oficiais são **sincronizados ao banco** e a API lê do banco (nunca do feed por request). Sync manual em dev: `POST /api/v1/admin/sync-inmet` com `x-admin-token`.
- Detalhes: [`docs/DATABASE.md`](docs/DATABASE.md) · [`docs/REDIS.md`](docs/REDIS.md)

## Limitações (fase atual — RECOVERY-3 concluída)

- Backend modular dentro do Next — NestJS é decisão futura ([ADR 0005](docs/ADR/0005-api-domain-inside-next.md))
- Sem autenticação/RBAC; sem painel operacional; ingestão de sensores ainda não exposta (R-5)
- Rate limit Redis com fallback em memória documentado (multi-instância: limite efetivo ×instâncias)
- Ocorrências: persistidas no Hidro Alerta — **não** significa que a Defesa Civil as recebeu (aviso na UI); sem upload de mídia
- Notificações: apenas local (localStorage); sem push; sem PWA ainda
- Tsunami: conteúdo educativo; nenhuma fonte oficial conectada
- Backup/observabilidade de produção: documentados, implementados na R-10

## Como abrir rapidamente no Linux

```bash
./abrir-hidro-alerta.sh
```

## Porta

O servidor roda na **porta 3001** (configurada em `package.json`).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TanStack Query 5
- TypeScript 5 + Zod 4 (contratos/validação)
- Tailwind CSS 4
- Leaflet + react-leaflet
- Vitest + Playwright (+ axe-core)
