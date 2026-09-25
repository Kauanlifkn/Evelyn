# API — Hidro Alerta (RECOVERY-2)

> Documento OpenAPI 3.0 gerado em tempo de execução: **`GET /api/openapi.json`**
> (schemas derivados dos contratos Zod — não podem divergir da validação).
> Todas as respostas incluem `x-correlation-id` e `Cache-Control: no-store`.

## Convenções

- **Base:** `/api/v1` (a superfície legada `/api/*` continua ativa, delegando aos mesmos services).
- **Paginação:** `?page=1&pageSize=20` (máx. 100). Resposta:
  `{ "data": [...], "meta": { page, pageSize, total, totalPages } }`
- **Correlation ID:** envie `x-correlation-id` (token seguro 8–128 chars) ou receba um gerado.
- **Erros:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | CONFLICT | RATE_LIMITED | UPSTREAM_ERROR | INTERNAL_ERROR | SERVICE_UNAVAILABLE",
    "message": "…",
    "correlationId": "…",
    "details": { "issues": [ { "path": "consent", "message": "…" } ] }
  }
}
```

- **Modo de dados** (`ALERT_DATA_MODE`): `official` → alertas INMET reais; `mock` → tudo simulado. Falha da fonte nunca retorna mock como oficial.

## Endpoints v1

### Alertas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/alerts` | Lista paginada. Filtros: `source`, `severity` (0–4), `eventType`, `status`, `official=true|false`, `active=true|false` |
| GET | `/api/v1/alerts/{id}` | Detalhe (404 com envelope se inexistente) |

Exemplo: `/api/v1/alerts?source=INMET&active=true&severity=3`

### Fontes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/sources` | Fontes configuradas (id, name, type) |
| GET | `/api/v1/sources/status` | Saúde: `ONLINE | STALE | OFFLINE`, latência, última tentativa/sucesso, mensagem (sem stack) |

### Abrigos (simulados nesta fase — `isSimulated: true`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/shelters` | Filtros: `status`, `search`, `accessible`, `acceptsAnimals` + paginação |
| GET | `/api/v1/shelters/{id}` | Detalhe |

### Ocorrências (demonstração)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/incidents` | Lista (filtros `status`, `type`) |
| POST | `/api/v1/incidents` | Cria — **201** com id temporário. Body validado por Zod: `type`, `description` (10–2000), `location` (≤300), `waterDepth?`, `roadBlocked`, `peopleAtRisk`, `anonymous`, `consent: true` (obrigatório). **Rate limit: 5 req/min por cliente** (429 acima disso). Privacidade: IP/User-Agent/GPS não são armazenados. |

```json
{
  "data": { "id": "inc-demo-000001", "status": "pending", "isSimulated": true, "...": "…" },
  "meta": {
    "message": "Recebido apenas pelo ambiente de demonstração do Hidro Alerta. Não enviado à Defesa Civil. Armazenamento temporário em memória."
  }
}
```

### Saúde

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/health/live` | Liveness — processo responde (não depende de fontes) |
| GET | `/api/v1/health/ready` | Readiness — runtime + config; sem banco ainda → `degraded` (200). Config inválida → `unhealthy` (503) |

## Superfície legada (compatibilidade)

`GET /api/alerts`, `GET /api/alerts/{id}`, `GET /api/sources/status`, `GET /api/health` — mesmos services, formato histórico preservado (ex.: `severity` como string). Novas integrações devem usar `/api/v1`.

## Segurança

- Headers globais: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP (tiles OSM liberados apenas em `img-src`).
- Rate limit em memória: **transicional e por processo** — não adequado para múltiplas instâncias; Redis na RECOVERY-3.
- Nenhum segredo no repositório; `.env*` fora do Git.
