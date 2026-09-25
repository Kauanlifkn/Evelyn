# Redis (RECOVERY-3)

> Uso restrito a: **rate limit distribuído**, **cache curto** e **locks de sync**.
> O Redis NUNCA é fonte de verdade — o PostgreSQL é.

## Local

```bash
npm run infra:up        # redis:7-alpine em localhost:6379 (healthcheck ping)
```

Produção: URL externa via `REDIS_URL` (ex.: Upstash/ElastiCache). **Não assumir localhost em deploy.**

## Chaves

| Padrão | Uso | TTL |
|---|---|---|
| `ratelimit:<rota>:<cliente>:<janela>` | contador fixo do rate limiter | 60 s |
| `lock:sync:inmet` | impede sync simultâneo do INMET | 60 s (PX) |

## Rate limit distribuído

- `POST /api/v1/incidents`: 5 req/min por cliente (INCR + EXPIRE), 429 com `Retry-After`.
- Substitui o limiter em memória da RECOVERY-2 (que era por processo).

## Política de falha (documentada)

Se o Redis estiver indisponível:

1. **Rate limit** → fallback para o limiter **em memória** (por processo), com log `redis.error`. Leituras públicas nunca são derrubadas pelo Redis. Limitação: com várias instâncias, o limite efetivo vira `5 × instâncias` por janela.
2. **Sync lock** → trava em-processo impede sobreposição na mesma instância; entre instâncias pode haver sync concorrente benigno (upsert é idempotente).
3. **Health** → `readiness` reporta `redis: warn` (degraded, 200) — degradação, não indisponibilidade.

## Cliente

`ioredis` singleton por processo (`lazyConnect`, `maxRetriesPerRequest: 1`, timeouts curtos) — falha rápida, sem pendurar requests. Erros são logados, nunca crasham o processo.
