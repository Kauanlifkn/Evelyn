# ADR 0006 — Banco de dados e ORM: PostgreSQL + PostGIS com Drizzle

- **Status:** Aceito (RECOVERY-3, 2026-09-25)
- **Contexto:** [HIDRO-ALERTA.md §10.2](../../HIDRO-ALERTA.md) exige PostgreSQL + PostGIS e migrations versionadas; a comparação Prisma vs Drizzle estava pendente desde o RECOVERY-0 (decisão "ADR 0002" antecipada para esta fase). O domínio já possui ports de repositório (ADR 0005).

## Comparação (resumo da auditoria)

| Critério | Drizzle | Prisma |
|---|---|---|
| PostGIS | `geometry`/`geography` via tipo custom + SQL direto; extensões, GIST e funções (`ST_Contains`, `ST_DWithin`) sem atrito | Sem suporte nativo: `Unsupported("geometry")`, diffs de migration cegos para PostGIS, geo-queries em `$queryRaw` |
| Migrations | SQL gerado, legível, versionado em arquivo; rollback = reexecução controlada (down compatível por SQL próprio) | `prisma migrate` sólido, mas PostGIS força shadow-db manual e edições à mão |
| SQL custom | Cidadão de primeira linha (`sql` template tipado) | `queryRaw` sem tipagem de resultado |
| Tipagem | Inferida do schema; próxima do SQL real | Excelente, porém sobre o modelo Prisma (não do SQL) |
| Performance/Runtime | Cliente `pg` puro + pool próprio; runtime fino | Engine binário próprio; cold-start maior em serverless |
| Testes | Conecta em qualquer banco via pool; integração direta | Requer binário/schema engine no ambiente |
| Extração futura (NestJS) | `drizzle-orm` + `pg` são bibliotecas comuns — portáveis sem lock | Client gerado acoplado ao schema path |
| Compat. Next.js | Server-side puro, sem entrypoints extras | Compatível, mas com bundling/engine extras |

## Decisão

**Drizzle ORM 0.45 + node-postgres (pg 8) + drizzle-kit (migrations SQL).**

Motivo decisivo: **PostGIS é cidadão nativo no Drizzle** (extensão, geometria, GIST, funções espaciais em SQL tipado) e é ponto de atrito permanente no Prisma. Secundários: SQL custom tipado, runtime fino (pool `pg` reutilizado entre requests), extração futura sem lock de ferramenta.

## Consequências

**Positivas**
- Fundação geoespacial real desde o dia 1 (territories/alert_areas/shelters/sensors com GIST).
- Migrations SQL auditáveis; fluxo do zero: `infra:up` → `db:migrate` → `db:seed`.
- Repositórios Postgres encaixam nos ports da ADR 0005 sem tocar nos services.

**Negativas / mitigação**
- Relações não são "mágicas": joins escritos à mão → menor custo com poucas entidades.
- Migrations de rollback são manuais (SQL down documentado por migração crítica) → estratégia: migração imutável + restore limpo em dev.
- `drizzle-kit push` é **proibido** fora de descarte local — apenas `migrate`.

## Revisão
Revisitar se surgir necessidade de ORM com relações complexas em massa (R-8) — a troca fica confinada à infraestrutura.
