/**
 * OpenAPI 3.0 document builder (RECOVERY-2).
 * Schemas are generated from the Zod domain contracts (zod v4 native
 * JSON Schema conversion) so documentation cannot drift from validation.
 */

import { z } from 'zod';
import { alertSchema } from '@/server/domain/alerts/alert.contract';
import { shelterSchema } from '@/server/domain/shelters/shelter.contract';
import { incidentSchema, createIncidentSchema } from '@/server/domain/incidents/incident.contract';
import { sourceHealthSchema } from '@/server/domain/sources/sources.contract';
import { paginationQuerySchema } from '@/server/shared/pagination';

export function buildOpenApiDocument(baseUrl: string): Record<string, unknown> {
  const component = (name: string, schema: z.ZodType) =>
    z.toJSONSchema(schema, { target: 'draft-7', io: 'input' });

  return {
    openapi: '3.0.3',
    info: {
      title: 'Hidro Alerta API',
      version: '0.2.0',
      description:
        'API do Hidro Alerta (fase RECOVERY-2). Alertas do INMET podem ser oficiais; ' +
        'demais recursos retornam isSimulated: true neste estágio. ' +
        'Todas as respostas carregam o header x-correlation-id.',
      contact: { name: 'Hidro Alerta' },
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: 'alerts', description: 'Alertas (oficiais via INMET ou simulados)' },
      { name: 'sources', description: 'Fontes de dados e saúde' },
      { name: 'shelters', description: 'Abrigos (simulados nesta fase)' },
      { name: 'incidents', description: 'Ocorrências da comunidade (demo)' },
      { name: 'health', description: 'Liveness e readiness' },
    ],
    components: {
      schemas: {
        Alert: component('Alert', alertSchema),
        Shelter: component('Shelter', shelterSchema),
        Incident: component('Incident', incidentSchema),
        CreateIncidentInput: component('CreateIncidentInput', createIncidentSchema),
        SourceHealth: component('SourceHealth', sourceHealthSchema),
        PaginationQuery: component('PaginationQuery', paginationQuerySchema),
      },
    },
    paths: {
      '/api/v1/alerts': {
        get: {
          tags: ['alerts'],
          summary: 'Lista alertas com filtros e paginação',
          parameters: [
            { name: 'source', in: 'query', schema: { type: 'string' } },
            { name: 'severity', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 4 } },
            { name: 'eventType', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'official', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'active', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Lista paginada de alertas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Alert' } },
                      meta: { $ref: '#/components/schemas/PaginationQuery' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Filtros inválidos (VALIDATION_ERROR)' },
          },
        },
      },
      '/api/v1/alerts/{id}': {
        get: {
          tags: ['alerts'],
          summary: 'Detalhe de um alerta',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Alerta',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/Alert' } },
                  },
                },
              },
            },
            '404': { description: 'Alerta não encontrado' },
          },
        },
      },
      '/api/v1/sources': {
        get: {
          tags: ['sources'],
          summary: 'Lista fontes de dados configuradas',
          responses: { '200': { description: 'Fontes' } },
        },
      },
      '/api/v1/sources/status': {
        get: {
          tags: ['sources'],
          summary: 'Saúde das fontes (ONLINE/STALE/OFFLINE, latência)',
          responses: {
            '200': {
              description: 'Saúde por fonte',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/SourceHealth' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/shelters': {
        get: {
          tags: ['shelters'],
          summary: 'Lista abrigos (simulados nesta fase)',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'crowded', 'closed', 'unknown'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'accessible', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'acceptsAnimals', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: { '200': { description: 'Abrigos paginados (isSimulated: true)' } },
        },
      },
      '/api/v1/shelters/{id}': {
        get: {
          tags: ['shelters'],
          summary: 'Detalhe de um abrigo',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Abrigo' },
            '404': { description: 'Abrigo não encontrado' },
          },
        },
      },
      '/api/v1/incidents': {
        get: {
          tags: ['incidents'],
          summary: 'Lista ocorrências registradas (demo, em memória)',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: { '200': { description: 'Ocorrências paginadas' } },
        },
        post: {
          tags: ['incidents'],
          summary: 'Registra ocorrência (demo; consentimento obrigatório; rate limit 5/min)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateIncidentInput' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Criada (id temporário, armazenamento em memória)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/Incident' } },
                  },
                },
              },
            },
            '400': { description: 'Validação (consentimento, tamanhos, tipos)' },
            '429': { description: 'Rate limit excedido' },
          },
        },
      },
      '/api/v1/health/live': {
        get: {
          tags: ['health'],
          summary: 'Liveness — processo responde (não depende de fontes externas)',
          responses: { '200': { description: 'Saudável' } },
        },
      },
      '/api/v1/health/ready': {
        get: {
          tags: ['health'],
          summary: 'Readiness — runtime + configuração (banco chega na RECOVERY-3)',
          responses: { '200': { description: 'Readiness com checks detalhados' } },
        },
      },
    },
  };
}
