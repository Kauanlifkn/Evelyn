# Banco de Dados — PostgreSQL + PostGIS (RECOVERY-3)

> ADR: [0006 — Drizzle](./ADR/0006-database-orm.md) · Arquitetura: [ARCHITECTURE.md](./ARCHITECTURE.md)

## Subir do zero (desenvolvimento)

```bash
cp .env.example .env        # credenciais locais de desenvolvimento
npm run infra:up            # postgres (host 5434) + redis (6379), com healthcheck
npm run db:migrate          # aplica ./drizzle/*.sql
npm run db:seed             # seed determinística (idempotente)
npm run dev
```

## Scripts

| Script | O que faz |
|---|---|
| `npm run infra:up` / `infra:down` | Sobe/para `docker compose` (PostGIS + Redis) |
| `npm run db:generate` | Gera SQL de migration a partir do schema Drizzle |
| `npm run db:migrate` | Aplica migrations em `DATABASE_URL` |
| `npm run db:seed` | Seed determinística (idempotente) |
| `npm run db:status` | Migrations aplicadas + contagens + versão do PostGIS |
| `npm run db:test` | Cria/prepare `hidro_alerta_test` (migrate + seed) |
| `npm run db:reset-test` | Dropa e recria o banco de teste |
| `npm run test:db` | Suíte de integração (requer Docker; usa o banco de **teste**) |

## Portas

Nesta máquina **5432 e 5433 já estavam ocupadas** por serviços externos — o container publica o Postgres em **5434** (interno 5432, configurável via `POSTGRES_HOST_PORT`). Redis usa **6379** (`REDIS_HOST_PORT`; fallback documentado 6380). Nenhum serviço externo é encerrado.

## Schema (fase atual)

`territories` · `data_sources` · `source_health` · `alerts` · `alert_areas` · `shelters` · `incidents` · `sensors` · `observations`

- **alerts**: `CHECK severity BETWEEN 0 AND 4`; `CHECK NOT (is_official AND is_simulated)`; `UNIQUE (source_id, external_id)` → dedupe do INMET.
- **alert_areas**: filhas de alerta (`ON DELETE CASCADE`), geometry nullable — INMET não fornece polígonos e nenhum é inventado.
- **shelters / incidents / sensors**: `geography(Point,4326)` nullable + índice GIST.
- **observations**: índice `(sensor_id, observed_at DESC)`.
- **PostGIS**: `CREATE EXTENSION IF NOT EXISTS postgis` na migration inicial (versão validada: 3.4).

## Fluxo de alertas (doc §21/§22)

```
INMET (RSS) → provider (timeout/retry/cache) → adapter → syncInmetAlerts()
  → lock Redis (SET NX PX 60s) → transação: upsert por (source, external_id) + áreas
  → source_health → API lê do BANCO (nunca do feed por request)
```

- Expirados **permanecem** no banco (histórico); `active=true` filtra por status + validade.
- Sync manual em dev/ops: `POST /api/v1/admin/sync-inmet` com header `x-admin-token` (= `ADMIN_SYNC_TOKEN`, nunca commitado; rota 404 sem token). Produção: job/worker chamando `syncInmetAlerts()`.

## Source health

Modelo **latest-state** por fonte (`UNIQUE(source_id)`): status, última tentativa/sucesso, latência, erro. Histórico temporal entra com observabilidade completa (R-10) — decisão registrada aqui.

## Testes

- Banco dedicado `hidro_alerta_test` — a suíte dev **nunca** roda destrutivamente no banco de desenvolvimento.
- `npm run db:reset-test && npm run test:db` — 11 testes: migrations do zero, CHECKs, dedupe/upsert, filtros+paginação, incidentes reais, PostGIS (Point/MultiPolygon/ST_Contains/ST_DWithin), sync idempotente (fake source — nunca a rede real), rate limit Redis.
- E2E (Playwright) roda com `PERSISTENCE_DRIVER=postgres` contra `hidro_alerta_e2e`, provisionado pelo `globalSetup`.

## Pooling / produção

- Pool `pg` único por processo (`globalThis`), `max=10` — nunca conexão por request.
- **Vercel/serverless:** usar provedor Postgres externo com endpoint pooled (PgBouncer/Neon/Supabase pooler) via `DATABASE_URL`; `DATABASE_SSL=require` habilita TLS. Nada foi contratado/configurado automaticamente.
- **Backup (futuro, R-10):** `pg_dump` diário + WAL arquivamento no provedor; restore testado em staging antes do go-live.

## Entidades do §12 ainda não criadas (fases futuras)

User, Organization, Membership, Role, SavedPlace, EmergencyContact, FamilyGroup, WeatherForecast, HazardArea, RiskAssessment, AlertRevision, AlertDelivery, ShelterStatus (tabela), ShelterResource, RoadBlock, SafeRoute, Volunteer, Mission, NotificationPreference, AuditEvent, Attachment — criadas conforme os services correspondentes (R-4 a R-8), evitando tabelas mortas.
