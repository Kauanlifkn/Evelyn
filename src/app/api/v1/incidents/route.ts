import {
  createIncidentSchema,
  incidentFilterSchema,
  incidentSchema,
} from '@/server/domain/incidents/incident.contract';
import { getServices } from '@/server/infrastructure/composition';
import {
  clientKey,
} from '@/server/infrastructure/http/rate-limit';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';
import { buildPageMeta, parsePagination } from '@/server/shared/pagination';
import { parseWithSchema } from '@/server/shared/validation';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/incidents', async (request) => {
  const { incidentService } = getServices();
  const url = new URL(request.url);
  const rawFilters: Record<string, string> = {};
  for (const key of ['status', 'type']) {
    const value = url.searchParams.get(key);
    if (value !== null) rawFilters[key] = value;
  }
  const filter = parseWithSchema(incidentFilterSchema, rawFilters, 'filtros de ocorrências');
  const pagination = parsePagination(url.searchParams);

  const { items, meta } = await incidentService.list(filter, pagination);
  return jsonResponse({ data: items, meta: buildPageMeta(meta.total, pagination) });
});

export const POST = withRoute('/api/v1/incidents', async (request, { correlationId }) => {
  const { incidentService, incidentRateLimiter, driver } = getServices();

  // Rate limit BEFORE parsing — do not spend work on floods.
  // Key uses the raw socket identity only as a rate-limit bucket; it is
  // never persisted or logged (privacy, doc §14).
  await incidentRateLimiter.enforce(clientKey(request, 'POST /api/v1/incidents'));

  // Malformed JSON becomes null → schema validation fails with 400.
  const body = await request.json().catch(() => null);
  const input = parseWithSchema(
    createIncidentSchema,
    body,
    'corpo da ocorrência'
  );

  const incident = await incidentService.create(input);

  // Contract guard: what we store is exactly the published contract.
  parseWithSchema(incidentSchema, incident, 'ocorrência criada');

  // HONESTY (doc §1/§2) — the message always states exactly what happened:
  const meta =
    driver === 'postgres'
      ? {
          heading: 'Ocorrência registrada no Hidro Alerta',
          message:
            'Ocorrência registrada no Hidro Alerta. Este registro não significa ' +
            'que a Defesa Civil recebeu a ocorrência.',
        }
      : {
          heading: 'Ocorrência recebida pelo ambiente de demonstração',
          message:
            'Recebido apenas pelo ambiente de demonstração do Hidro Alerta. ' +
            'Não enviado à Defesa Civil. Armazenamento temporário em memória.',
        };

  return jsonResponse(
    {
      data: incident,
      meta: { ...meta, correlationId },
    },
    201
  );
});
