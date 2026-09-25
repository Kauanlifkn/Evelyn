# ADR 0005 — API e domínio dentro do Next.js (antes de NestJS)

- **Status:** Aceito (RECOVERY-2, 2026-09-25)
- **Contexto:** [HIDRO-ALERTA.md §10.2](../../HIDRO-ALERTA.md) prevê NestJS como backend. O projeto real é um app Next.js (App Router) com Route Handlers e uma integração INMET estável (RECOVERY-1).

## Decisão

Manter os Route Handlers do Next.js como superfície HTTP **por enquanto** e construir a lógica de negócio como **módulos server-side extraíveis**:

```
src/server/
  domain/          # contratos + schemas Zod (puro, sem I/O)
  application/     # services (casos de uso) — dependem de ports
  infrastructure/  # providers, repositories, http, observability
  shared/          # errors, validation, ids, time, pagination
```

## Justificativa

1. **Risco reduzido:** nenhuma reestruturação de repo/monorepo; deploy e tooling atuais preservados.
2. **Integração INMET preservada:** o provider testado na RECOVERY-1 vira um adapter atrás da porta `AlertSourcePort`, sem reescrita.
3. **Contratos primeiro:** o valor real da fase é o contrato de domínio versionado (Zod → OpenAPI), não o framework HTTP.
4. **Extração futura barata:** services dependem de ports (inversão); mover para NestJS pós-RECOVERY-3 é portar os handlers, não reescrever regras. O monorepo (doc §10.1) continua sendo opção aberta — a decisão sobre `apps/api` será tomada com dados de uso, não por antecipação.

## Consequências

**Positivas**
- Superfície `/api/v1` versionada + legado delegando aos mesmos services.
- Correlation ID, erros padronizados, rate limit e logs estruturados em um único wrapper (`withRoute`).
- Repositórios in-memory com interface pronta para PostgreSQL/PostGIS (RECOVERY-3).

**Negativas / limitações**
- Rate limit em memória é por processo — inadequado para múltiplas instâncias serverless (documentado; Redis chega na RECOVERY-3).
- Sem WebSocket/SSE nativo do Nest (doc §10.2) — queda para polling/TanStack Query até decisão futura.
- Duas formas de rodar a mesma API (legado + v1) até que o legado seja aposentado.

**Revisão:** reavaliar extração para NestJS ao fim da RECOVERY-3, quando persistência e filas existirem.
