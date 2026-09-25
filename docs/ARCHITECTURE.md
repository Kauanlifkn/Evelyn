# Arquitetura — Hidro Alerta (RECOVERY-2)

> ADR relacionado: [ADR 0005 — API e domínio dentro do Next.js](./ADR/0005-api-domain-inside-next.md)
> Fonte oficial: [`HIDRO-ALERTA.md`](../HIDRO-ALERTA.md)

## Visão geral

```
Frontend (Next.js App Router, React 19, TanStack Query)
        │  fetch /api/v1/*
        ▼
Route Handlers (withRoute: correlation id, erros, logs, no-store)
        │
        ▼
Application Services (AlertService · ShelterService · IncidentService
                       SourceService · HealthService)
        │ depende de ports
        ▼
Infrastructure
  ├─ providers/alerts   INMET adapter · mock adapter  (AlertSourcePort)
  ├─ repositories       InMemory shelters · incidents (ports p/ PostGIS)
  ├─ http               route wrapper · rate limit (transicional)
  └─ observability      logger JSON estruturado
        │
Shared: errors (AppError) · validation (Zod) · ids (correlation) ·
        time · pagination
```

## Camadas

| Camada | Responsabilidade | Não pode |
|---|---|---|
| `domain/` | Contratos + schemas Zod (Alert 0–4, Shelter, Incident, Sensor, Source, Territory, Health) | Importar I/O, Next, providers |
| `application/` | Casos de uso, filtros, paginação, ordenação, regras de honestidade | Conhecer HTTP/Next |
| `infrastructure/` | Implementações concretas (INMET, in-memory, rate limit, logger) | Ser importada por domain |
| `app/api/**` | Handlers finos: validam entrada → chamam service → respondem | Conter regra de negócio |

## Contratos-chave

- **Severity 0–4** (doc §5): 0 Informativo · 1 Atenção · 2 Perigo · 3 Perigo extremo · 4 Emergência. Nível 4 nunca é gerado automaticamente.
- **Origens**: OFFICIAL · SENSOR · MODEL · OPERATOR · COMMUNITY · PARTNER.
- **Honestidade**: `isOfficial`/`isSimulated` viajam no contrato; mocks nunca são oficiais (garantido por schema + testes).
- **Erros**: envelope único `error.{code,message,correlationId,details?}`; stack traces nunca saem do servidor.
- **Correlation ID**: `x-correlation-id` aceito (token seguro 8–128), gerado se ausente, ecoado em toda resposta e em todo log.

## Fluxos por modo (`ALERT_DATA_MODE`)

| Modo | Alertas | Fontes/status |
|---|---|---|
| `official` | INMET real (timeout 15 s, retry, cache 120 s, health) | INMET ONLINE/STALE/OFFLINE |
| `mock` (default) | Dataset simulado via `MockAlertSource` (`isSimulated: true`) | Fonte DEMO sempre ONLINE |

Falha da fonte oficial **nunca** vira mock: a API devolve lista vazia/erro e o frontend mostra "FONTE INDISPONÍVEL — não significa ausência de risco".

## Persistência (estado atual → RECOVERY-3)

- Shelters/Incidents: `InMemory*Repository` com interfaces `ShelterRepository`/`IncidentRepository` — a troca por PostgreSQL/PostGIS é confinada à infraestrutura.
- Ocorrências: armazenamento **em memória e rotulado como demo**; sem IP/UA/GPS; consentimento obrigatório.
- Rate limit: memória local (por processo) — **inadequado para múltiplas instâncias**; Redis substitui na RECOVERY-3.

## Decisões abertas

- Extração para NestJS/monorepo: reavaliar após RECOVERY-3 (ADR 0005).
- SSE/WebSocket (doc §10.2): hoje polling via TanStack Query (60–120 s).
- Leaflet+OSM mantidos (MapLibre é opção futura, doc §10.2).
