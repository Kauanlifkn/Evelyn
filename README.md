# Hidro Alerta — Informação certa salva vidas

Plataforma de prevenção, monitoramento e resposta a desastres naturais.

> **Estado atual (pós-RECOVERY-1):** sistema **híbrido e honesto** — a integração com os avisos meteorológicos do **INMET fornece alertas oficiais reais** quando ativada; **todos os demais módulos ainda usam dados simulados** e estão rotulados como tal. Em emergência real, ligue 192 (SAMU), 193 (Bombeiros) ou 199 (Defesa Civil).

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

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Dashboard (seção de alertas oficiais quando em modo official; simulados rotulados em mock) |
| `/mapa` | Mapa de risco interativo + **resumo textual acessível** |
| `/alertas` | Central de alertas (oficiais ou simulados, conforme o modo) |
| `/alertas/[id]` | Detalhes de um alerta (oficial ou simulado) |
| `/abrigos` | Lista de abrigos (simulados) |
| `/ocorrencias` | Relatar ocorrência (demonstração local — não envia a órgãos) |
| `/tsunami` | Riscos costeiros e tsunami (educativo; sem fonte oficial conectada) |

### API

| Rota | Descrição |
|---|---|
| `GET /api/alerts` | Alertas ativos do provider configurado (INMET ou mock) |
| `GET /api/alerts/[id]` | Um alerta por ID (404 se inexistente) |
| `GET /api/sources/status` | Saúde da fonte (ONLINE/STALE/OFFLINE, latência, última sync) |
| `GET /api/health` | Health check da aplicação/fonte |

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

## Limitações (fase atual — RECOVERY-1 concluída)

- Sem backend próprio: 4 Route Handlers dentro do Next (convergência documentada em `docs/ROADMAP-CONVERGENCIA.md`)
- Sem banco de dados; sem autenticação; sem painel operacional
- Ocorrências: registro apenas local/demonstrativo, com consentimento LGPD simulado
- Notificações: apenas local (localStorage); sem push
- Sem PWA/service worker ainda
- Tsunami: conteúdo educativo; nenhuma fonte oficial conectada (não afirmamos segurança nem risco)
- `/api/health` é passivo (não dispara fetch da fonte); faça uma chamada a `/api/alerts` para aquecer o status

## Como abrir rapidamente no Linux

```bash
./abrir-hidro-alerta.sh
```

## Porta

O servidor roda na **porta 3001** (configurada em `package.json`).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Leaflet + react-leaflet
- Vitest + Playwright (+ axe-core)
