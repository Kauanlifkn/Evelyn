# ROADMAP-CONVERGENCIA — Plano fechado de execução por fases

> **Base:** [`docs/HIDRO-ALERTA-COMPLIANCE.md`](./HIDRO-ALERTA-COMPLIANCE.md) (RECOVERY-0, 2026-09-24).
> **Fonte oficial:** [`HIDRO-ALERTA.md`](../HIDRO-ALERTA.md).
> **Regra de ouro:** nenhuma fase começa sem a anterior concluída e revisada por humano. Nenhuma fase conclui sem os critérios de §18 do documento oficial (lint, typecheck, testes, build, migrations verificadas, docs atualizadas, relatório de arquivos, git status conhecido, nenhuma chave exposta, nenhuma regressão conhecida, revisão humana solicitada, commit só com autorização).

## Visão geral das fases

| Fase | Nome | Entrega central | Complexidade |
|---|---|---|---|
| RECOVERY-1 | Fechamento total do frontend | Zero botões mortos, zero testes falhando, INMET oficial funcionando de verdade | Média |
| RECOVERY-2 | API/domínio real | Camada de domínio + API validada + contratos, dentro do Next (monólito modular) | Alta |
| RECOVERY-3 | PostgreSQL/PostGIS + Redis | Persistência real, migrations, filas | Alta |
| RECOVERY-4 | Integrações oficiais | CEMADEN, ANA/HidroWeb, CPTEC/INPE, IBGE + agendamento + circuit breaker | Alta |
| RECOVERY-5 | Sensores próprios | Ingestão RIO-001, heartbeat, telemetria | Média |
| RECOVERY-6 | Motor de risco | `RiskAssessment` explicável e versionado | Muito alta |
| RECOVERY-7 | Notificações e PWA | Web Push, preferências, geofencing, offline | Alta |
| RECOVERY-8 | Painel municipal | Central de alertas/ocorrências/abrigos, relatórios, RBAC | Muito alta |
| RECOVERY-9 | Tsunami / riscos costeiros | Conectores oficiais, zonas costeiras, protocolo | Média (após R-4) |
| RECOVERY-10 | Hardening e produção | Segurança, LGPD, observabilidade, CI/CD, backups | Alta |

Dependência críticas: R-2 ← R-1 · R-3 ← R-2 · R-4 ← R-3 · R-5 ← R-3 · R-6 ← R-4+R-5 · R-7 ← R-3 · R-8 ← R-3(+R-6 parcial) · R-9 ← R-4 · R-10 ← todas.

---

## RECOVERY-1 — Fechamento total do frontend (primeira fase executável)

> **STATUS (2026-09-25): EXECUTADA — aguardando revisão humana.** Critérios de aceite verificados: lint 0/0 · typecheck 0 · Vitest **140/140** · Playwright **83/83** (inclui axe-core 9/9 sem violações críticas/serious) · build OK · `npm audit` **0 critical / 0 high** (2 moderate: corrente vitest, correção exige v5 breaking — documentado) · INMET real ONLINE com **10 alertas oficiais ativos** validados em servidor de produção (modo official), 404 correto, fonte INMET saindo de OFFLINE. Bônus descoberto nesta fase: o feed ao vivo do INMET mudou o formato da tabela (markdown → HTML) — o parser passou a suportar os dois formatos. Detalhes: [Apêndice E do compliance](./HIDRO-ALERTA-COMPLIANCE.md). **Nenhum commit feito.**

### Objetivo
Tornar o frontend atual 100% íntegro: todo botão responde de verdade (ou está rotulado como simulado de forma honesta), toda rota carrega sem erro de console, todos os testes passam, a integração INMET — já implementada — funciona de ponta a ponta, e nada do que existe hoje é removido.

**Escopo por correção (cada item vira commit lógico próprio):**

**A. Correção da integração INMET (quebrada — maior valor)**
1. `src/server/lib/rss-parser.ts:178-181` — reconstruir os `RegExp` com escape correto (`\\s`, `\\[`, `\\]`, `\\/`) ou usar `RegExp` literals com `tagName` sanitizado (`tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`). É a causa de 9 testes unitários falhando e do provider ficar OFFLINE para sempre.
2. Validar contra a fixture `src/tests/fixtures/inmet-rss.fixture.xml` e contra o feed real (up: HTTP 200 confirmado em 24/09/2026).
3. Adicionar **1 retry** com backoff curto no `inmet-provider.ts` (regra §9 do doc: retry é obrigatório por conector).

**B. Botões/interações mortos ou mentirosos**
4. `OfficialAlertDetail.tsx:162` — "Compartilhar" deve realmente copiar (`navigator.clipboard.writeText` com fallback Web Share) e dar feedback verdadeiro; para alertas oficiais os botões "Estou seguro"/"Preciso de ajuda" voltam com ação real de registro local (localStorage) rotulada como simulação de envio (sem criar fake de backend).
5. `mapa/page.tsx` + `MapFilters.tsx` + `RiskMap.tsx` — corrigir o contrato do filtro `'all'`: estado inicial deve exibir todos os marcadores; botão "Todos" deve resetar e ficar visivelmente ativo. Decidir destino do código morto: **usar** `MapDetailPanel` (renderizar ao clicar em marcador) e `OriginFilter` (exibir origem do dado) ou removê-los — decisão a ser proposta, nunca remoção silenciosa.
6. Busca da sidebar (`Sidebar.tsx:62-69`) — ou conecta a uma busca real (rotas/abrigos/alertas) ou é substituída por link para `/alertas` com foco no campo de busca. Proposta: remover a ilusão e redirecionar (menor risco).
7. `mocks/notifications.ts` — corrigir os 3 links quebrados (`/alerts/*`→`/alertas/*`, `/shelters/*`→`/abrigos`, `/incidents/*`→`/ocorrencias` ou remover link).
8. `SOSButton.tsx` + `MobileNav.tsx` — trocar `alert()` por `window.location.href = 'tel:192'` com `confirm()` prévio (mantendo aviso de ambiente de teste).

**C. Erros de runtime**
9. `LastUpdate.tsx` — eliminar hidratação: renderizar hora só após `useEffect` (ou `suppressHydrationWarning` + formatação estável com `Intl` fixado a `America/Sao_Paulo`).
10. `/alertas/[id]` ID inválido — 404 duplo no console: avaliar substituir fetch client-side por `Promise` única/cache no hook, e ajustar o teste para tolerar exatamente os 404 esperados (documento no teste).

**D. Rotulagem e honestidade de dados (regra §1/§2 do doc oficial)**
11. `mock-provider.ts:37` — parar de emitir `isOfficial: true` para dados mock (usar `isOfficial: false` + `sourceType: 'DEMO'`), mantendo o fallback da UI coerente.
12. Traduzir `eventType` cru do INMET na UI (`getOfficialEventTypeLabel` em `lib/utils.ts`); incluir nos filtros os eventos oficiais existentes (`storm`, `gale`, `frost`, `low_humidity`, `rain_accumulation`, `coastal_winds`, `temperature_drop`).
13. Abrigos: exibir `hasFood` (alimentação) e `lastUpdate` (última atualização) no `ShelterCard`; tornar contato clicável (`tel:`); adicionar filtro "Desconhecido".
14. `DemoBanner` — revisar texto único e verdadeiro sobre o estado ("fase de testes; alertas meteorológicos INMET são oficiais; demais módulos simulados") e alinhar **todos** os testes (unit + E2E) a esse texto.
15. `Badge.tsx` — remover `role="status"` (não é live region); usar `role` apropriado ou nenhum; ajustar teste `color-is-not-the-only-conveyer` para outro seletor.

**E. Qualidade / baseline verde**
16. Corrigir 2 erros de lint (`useOfficialAlerts.ts`) movendo o fetch para callback/padrão aceito pelo `react-hooks/set-state-in-effect`; remover 5 warnings de variáveis não usadas.
17. Atualizar todas as specs E2E desatualizadas; manter as verificações de console limpo (com exceções documentadas).
18. Atualizar `next` 16.3.0 → ≥16.3.6 (vulnerabilidade **crítica** RCE) e rodar `npm audit fix` para js-yaml/nanoid/sharp; re-validar build + E2E após upgrade (Next 16.x — ler `node_modules/next/dist/docs/` antes, conforme AGENTS.md).
19. Criar `.env.local` de desenvolvimento (a partir de `.env.example`) com `ALERT_DATA_MODE=official` e documentar no README o comportamento em cada modo.
20. Adicionar axe-core ao Playwright (smoke de acessibilidade por página) — cria a base exigida pelo §15.

### Dependências
Nenhuma externa. Única dependência interna: ordem A → B/C → D → E (o fix do parser muda o comportamento da UI oficial, então specs dependem dele).

### Arquivos afetados (previstos)
`src/server/lib/rss-parser.ts` · `src/server/providers/alerts/inmet-provider.ts` · `src/server/providers/alerts/mock-provider.ts` · `src/components/alerts/OfficialAlertDetail.tsx` · `src/components/alerts/OfficialBadge.tsx` · `src/components/map/RiskMap.tsx` · `src/components/map/MapFilters.tsx` · `src/app/mapa/page.tsx` · `src/components/layout/Sidebar.tsx` · `src/components/layout/SOSButton.tsx` · `src/components/layout/MobileNav.tsx` · `src/components/layout/DemoBanner.tsx` · `src/components/dashboard/LastUpdate.tsx` · `src/components/shelters/ShelterCard.tsx` · `src/components/ui/Badge.tsx` · `src/hooks/useOfficialAlerts.ts` · `src/data/mocks/notifications.ts` · `src/lib/utils.ts` · `src/app/api/health/route.ts` · specs em `src/tests/**` · `package.json` (next, sharp, js-yaml, nanoid) · `README.md` · `.env.local` (não commitado).

### Migrations
Nenhuma (fase sem banco).

### Testes
- Unit: 87/87 verdes (parser 30, provider 11, componentes, hooks, utils, mocks).
- E2E: 67/67 verdes, incluindo novos: marcadores visíveis no mapa sem filtro ativo; "Todos" reseta; compartilhar copia de verdade; links de notificação navegam; axe smoke sem violação crítica.
- Novos unit: retry do provider (fake deterministic), `getOfficialEventTypeLabel`.

### Critérios de aceite
1. `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npx playwright test` — **todos verdes**.
2. `npm audit` sem vulnerabilidade crítica/high (moderate documentado).
3. Em `ALERT_DATA_MODE=official`: `/api/alerts` retorna avisos reais do INMET com `sourceStatus: ONLINE`; dashboard exibe seção "Alertas Oficiais".
4. Em `ALERT_DATA_MODE=mock`: nenhum dado aparece como oficial; banner truthful; fallback de `/alertas` funcional.
5. Mapa exibe marcadores no carregamento inicial; botão "Todos" funcional.
6. Zero erro de console nas 6 rotas (exceto os 404 intencionais de `/alertas/[id]` inválido, documentados no teste).
7. Nenhum botão morto, nenhum feedback falso; ações não implementadas rotuladas como simuladas.
8. Relatório de arquivos alterados + git status conhecido; **sem commit** até autorização.

### Riscos
| Risco | Mitigação |
|---|---|
| Upgrade do Next quebrar build/E2E | Ler docs locais do Next 16 primeiro; upgrade isolado em commit próprio; rollback trivial |
| Feed INMET mudar formato (tabela do `description`) | Parser tolerante + testes com fixture; health STALE visível |
| `react-hooks/set-state-in-effect` exigir redesign do hook | Migrar para padrão `useSyncExternalStore`/fetch-external já usado em `useLocalStorage` |
| Correção dos filtros do mapa alterar comportamento que alguém dependia | Comportamento atual é bug visível (marcadores sumidos); cobrir com E2E novo antes do fix |
| Clipboard bloqueado em contexto não-seguro | Fallback Web Share + feedback de erro real |

### Estimativa de complexidade
**Média.** ~20 correções cirúrgicas, sem mudança de arquitetura, sem banco. 1–2 sessões de execução.

---

## RECOVERY-2 — API/domínio real

> **STATUS (2026-09-25): EXECUTADA — aguardando revisão humana.** Entregues: camadas domain/application/infrastructure/shared ([ADR 0005](./ADR/0005-api-domain-inside-next.md)), Zod em todas as entradas, `/api/v1` completa + OpenAPI (`/api/openapi.json`), correlation ID, erros padronizados, rate limit transicional (5/min em POST incidents; memória — Redis na R-3), liveness/readiness, logs estruturados, headers de segurança, TanStack Query no frontend (alertas/detalhe/abrigos/source status), ocorrências via POST com consentimento + honestidade mantida, legado delegando aos mesmos services. Baseline: lint 0/0 · tsc 0 · Vitest 200/200 · build OK · E2E 83/83 · audit 0 critical/0 high. **Nenhum commit feito.**

### Objetivo
Criar a camada de domínio e API real dentro do app Next (monólito modular, §11 do doc: "No MVP eles poderão existir como módulos de um monólito modular"), com validação, contratos e persistência plugável — **sem** ainda migrar para NestJS nem instalar banco.

### Escopo
- `src/server/domain/`: módulos `alerts`, `shelters`, `incidents`, `sources`, `health` com serviços puros (regra §11: alert-service, incident-service, shelter-service, source-ingestion-service, health-service).
- Repositórios com interface + implementação em memória (determinística, `isSimulated` preservado) — prontos para trocar por Postgres na R-3.
- Validação com **Zod** em todas as rotas (`/api/alerts`, `/api/alerts/[id]`, `/api/health`, `/api/sources/status`, novas: `POST /api/incidents`, `GET /api/shelters`, `GET /api/rivers`).
- OpenAPI gerado dos schemas Zod; `GET /api/openapi.json` + página `/docs` (Swagger UI) — requisito §10.2.
- Correlation ID por request (middleware) + logs estruturados JSON (requisito §16).
- Rate limit simples em memória nas rotas de escrita (§14.7).
- Substituição progressiva dos hooks client (`useOfficialAlerts`) por fetchers com TanStack Query (§10.2) — decisão a validar com humano.
- Divergência arquitetural registrada: NestJS fica para fase pós-R-3 (extrair `apps/api` somente se justificado). Não migrar silenciosamente — esta fase é a convergência documentada.

### Dependências
R-1 concluída (baseline verde).

### Arquivos
`src/server/domain/**` (novo) · `src/app/api/**` (reescrita sobre domain) · `src/lib/api-client.ts` · `package.json` (zod, @tanstack/react-query, swagger) · `src/tests/server/**`.

### Migrations
Nenhuma ainda.

### Testes
Unit de cada serviço (fakes determinísticos, §19); contract tests das rotas (supertest-style via fetch); teste de rate limit; correção de contratos nos E2E existentes.

### Critérios de aceite
1. Toda rota validada (400 com erros claros), OpenAPI publicado e coerente.
2. `POST /api/incidents` persiste em repositório em memória e o form de `/ocorrencias` passa a usá-lo (ainda rotulado simulado na UI até R-3).
3. Logs estruturados com correlation ID visíveis no servidor.
4. Suítes verdes; sem regressão visual (screenshots spec).

### Riscos
Reescrita de rotas quebrando E2E (mitigar mantendo contratos de resposta atuais); escopo crescer para "backend completo" (proibido — manter módulos mínimos do doc §11).

### Complexidade
**Alta.**

---

## RECOVERY-3 — PostgreSQL/PostGIS + Redis

### Objetivo
Persistência real conforme §10.2/§12: PostgreSQL+PostGIS, Redis, filas BullMQ, migrations versionadas, Docker Compose de desenvolvimento.

### Escopo
- Docker Compose: `db` (postgis/postgis), `redis`, `app`.
- Escolha ORM (**Prisma vs Drizzle** — decisão ADR: PostGIS, migrations, tipagem, consultas geoespaciais; recomendação preliminar: Drizzle por tipagem e SQL próximo p/ PostGIS — **decidir com humano em ADR `docs/ADR/0002`**).
- Criar as **34 entidades do §12** (começando por Alert, AlertArea, Shelter, Incident/CommunityReport, DataSource, SourceHealth, Station, River, Territory, AuditEvent) com `id/createdAt/updatedAt/origem/território/versionamento/índices geoespaciais/retenção` (§12).
- Migrations versionadas; seed determinístico (`isSimulated: true`).
- BullMQ: fila de ingestão de fontes e de entrega (preparação p/ R-4/R-7).
- Repositórios da R-2 trocados por implementações reais; health checks de banco/Redis em `/api/health` (§16.3).
- Storage S3-compat (MinIO local) para futuros uploads (§10.2) — só infra nesta fase.

### Dependências
R-2 (repositórios interfaceados). Docker disponível (29.6.0 ✅).

### Arquivos
`docker-compose.yml` · `infra/**` · `packages/database` ou `src/server/db/**` · `migrations/**` · `.env.example` (DATABASE_URL, REDIS_URL) · `src/server/domain/**` (adapters).

### Migrations
Criam todo o schema inicial v1 (34 entidades do §12, subset mínimo primeiro).

### Testes
Integração contra Postgres real em CI local (docker); migrations up/down; repositórios CRUD; health checks.

### Critérios de aceite
1. `docker compose up` sobe tudo; app roda contra banco real.
2. Dados de abrigos/alertas/ocorrências vindos do banco; mocks apenas como seed rotulado.
3. `/api/health` reporta banco e Redis.
4. Migrations verificadas; nenhum dado de usuário em mock puro.

### Riscos
Complexidade PostGIS (mitigar: subset de entidades primeiro); divergência monorepo (manter estrutura única; monorepo só se extração de apps for aprovada).

### Complexidade
**Alta.**

---

## RECOVERY-4 — Integrações oficiais

### Objetivo
Completar §9 com os conectores oficiais, cada um com o kit obrigatório da "Regra de integração" (id, licença, auth, frequência, timeout, retry, circuit breaker, normalizador, dedupe, datas, health, docs, testes).

### Escopo
- CEMADEN (pluviômetros), ANA/HidroWeb/Hidro-Telemetria (nível de rios — substitui mocks de rio), CPTEC/INPE (previsão — substitui mock de weather), IBGE (territórios/população — base p/ §7.5).
- Worker agendado (BullMQ repeatable jobs) com frequência por fonte; circuit breaker por fonte; cache Redis; dedupe persistente; `SourceHealth` persistido (dashboard `/status` público).
- Camadas novas no mapa: chuva (CEMADEN), rios/estações (ANA), previsão (CPTEC) — fecha 6.3.3–6.3.5.
- IDAP/Defesa Civil: manter BLOQUEADO (aguardando interface pública validada — `.env.example` já documenta).
- Atualização em tempo quase real no mapa (polling SSE leve) — 6.3.18.

### Dependências
R-3 (persistência, filas). Fontes externas reais em staging.

### Arquivos
`src/server/providers/{cemaden,ana,cptec,ibge}/` · `src/server/workers/ingestion.ts` · `src/app/api/sources/**` · `src/app/status/page.tsx` · `src/components/map/**`.

### Migrations
`DataSource`, `SourceHealth`, `Station`, `Observation`, `WeatherForecast` (dados reais).

### Testes
Por conector: fixture offline determinística (§19: "Não usar dados externos reais nos testes"), timeout, erro HTTP, circuit breaker, dedupe.

### Critérios de aceite
1. Nível de rio e previsão do dashboard vêm de fonte real com horário e health visíveis.
2. Cada fonte tem página/documento de integração (`docs/integrations/`).
3. Falha de qualquer fonte degrada com segurança (stale + health), nunca inventa dado.
4. Suítes verdes sem rede (fixtures).

### Riscos
Instabilidade/limites das APIs públicas; formatos não documentados; geocodificação de áreas INMET→território.

### Complexidade
**Alta.**

---

## RECOVERY-5 — Sensores próprios

### Objetivo
Implementar §9.8 "sensores próprios autorizados" na web: ingestão, cadastro, heartbeat, telemetria e alertas derivados para o **Sensor RIO-001** (firmware já criado externamente).

### Escopo
- `POST /api/sensors/[id]/telemetry` com autenticação de dispositivo (token por sensor, hash no banco; chave fora do Git).
- Heartbeat + status online/offline (Redis TTL); telemetria com histórico (Observation) e gráfico (`/sensores` ou card no dashboard); alerta derivado de sensor com origem `SENSOR` passando pelo motor de regras mínimo (pré-R-6: thresholds por estação, nunca "Evacuação" automática — §13).
- Cadastro/edição de sensores (painel mínimo operador — inicial do R-8).

### Dependências
R-3 (Observation, Sensor, Redis). Contrato de payload do firmware externo.

### Arquivos
`src/app/api/sensors/**` · `src/server/domain/sensors/**` · `src/app/sensores/page.tsx` · `src/components/sensors/**`.

### Migrations
`Sensor`, `Observation` (uso real), `Station` vínculo.

### Testes
Ingestão autenticada (positiva/negativa), heartbeat expira, thresholds derivam alerta, dedupe/janela.

### Critérios de aceite
1. RIO-001 envia telemetria real e aparece online com histórico/gráfico.
2. Alerta SENSOR respeita regras do §13 (explicável, sem evacuação automática).
3. Dispositivo sem token válido é rejeitado (401) e limitado por rate limit.

### Riscos
Qualidade/calibração do hardware; flood de dados do dispositivo (rate limit por dispositivo).

### Complexidade
**Média.**

---

## RECOVERY-6 — Motor de risco

### Objetivo
Implementar §13 completo: `RiskAssessment` explicável, versionado, com entradas reais (chuva acumulada, nível, velocidade de elevação, ocorrências, alertas oficiais, qualidade da fonte), limites por território e métricas de falso positivo/negativo.

### Escopo
- `packages/risk-engine` (ou `src/server/domain/risk/`): regras determinísticas por hazard; entradas das Observations + WeatherForecast + Alert oficial; saída conforme type do doc (`severity, score, confidence, area, reasons, sourceRefs, modelVersion, status`).
- Substituir o `RiskGauge` mock pelo resultado real do motor (mantendo rótulo de estimativa — §7.5).
- Anti dupla contagem; simulação (modo replay); testes históricos com eventos passados; aprovação humana obrigatória para alertas públicos críticos não oficiais (fluxo mínimo: proposta → fila do operador).

### Dependências
R-4 (observações reais) + R-5 (sensores). HazardArea/HazardArea geo (R-3).

### Migrations
`RiskAssessment`, `HazardArea` reais, `Territory` com limites.

### Testes
Regras unitárias com séries sintéticas determinísticas; explicabilidade (toda avaliação produz `reasons` não vazio); replay histórico; métricas FP/FN calculadas em dataset de teste.

### Critérios de aceite
1. Nenhuma avaliação sem razões e versão de modelo.
2. Medidor do dashboard reflete `RiskAssessment` ativo com horário e confiança.
3. Nenhum alerta de evacuação automático; críticos não oficiais exigem aprovação (§13).

### Riscos
Calibração de limiares (mitigar: limites por território configuráveis e revisão humana); overfitting de regras.

### Complexidade
**Muito alta.**

---

## RECOVERY-7 — Notificações e PWA

### Objetivo
Implementar §8.5/§8.7/FASE 5: Web Push real, preferências, geofencing, dedupe/controle de frequência; PWA instalável com modo offline (alertas recentes, contatos, plano familiar, abrigos salvos, instruções, última sincronização).

### Escopo
- Service worker + manifest + installability; estratégias de cache (alertas/abrigos/instruções offline); indicador de conexão e "última sincronização" (6.1.7/6.1.8).
- Web Push (VAPID) com `AlertDelivery` persistido; e-mail (SMTP) inicial; preferências por usuário (NotificationPreference); dedupe e rate de envio; geofencing por território/raio (6.7.2).
- SMS/WhatsApp/sirene/CAP: BLOQUEADO nesta fase (dependem de provedor contratado e consentimento — §8.5).

### Dependências
R-3 (deliveries/preferences), R-2 (auth básica p/ subscriptions).

### Migrations
`AlertDelivery`, `NotificationPreference`, `PushSubscription`.

### Testes
Unit de preferências/dedupe/frequência; E2E de instalação PWA (beforeinstallprompt), offline (context offline → alertas recentes visíveis), push (service worker mock).

### Critérios de aceite
1. Lighthouse PWA instalável; offline exibe dados essenciais + hora da sync.
2. Push entregue com dedupe e respeitando preferências; confirmação de entrega registrada.
3. Nenhum canal contratado simulado como real.

### Riscos
Permissões de push/iOS; cache obsoleto de alertas críticos (mitigar: TTL curto + revalidação).

### Complexidade
**Alta.**

---

## RECOVERY-8 — Painel municipal

### Objetivo
Implementar §3.3/§7: painel operacional com RBAC — central de alertas (criação/aprovação/templates/disparo/auditoria), central de ocorrências (fila/validação/conversão em incidente), gestão de abrigos, pessoas expostas (estimativas), relatórios com exportação CSV/PDF. Voluntários/missões (§3.2) e modos Guardião/Escola/Comunidade (§8.1–8.4) entram como subescopos aprovados separadamente.

### Escopo
- Auth real (sessão, MFA operador — §14), RBAC (citizen/volunteer/operator/admin), isolamento por organização.
- `/painel`: dashboard operacional; `/painel/alertas` (fluxo rascunho→validação→ativo com auditoria — §5.3 completo); `/painel/ocorrencias` (fila com proximidade e conversão); `/painel/abrigos` (CRUD + ocupação + recursos + check-in); `/painel/relatorios` (§7.6 com CSV/PDF).
- Pessoas expostas com estimativa populacional (IBGE da R-4) apresentada como estimativa.

### Dependências
R-3, R-6 parcial (para propostas de alerta), R-7 (disparo multicanal real).

### Migrations
`User/Organization/Membership/Role`, `Alert` completo (revision, áreas), `AuditEvent`, `Shelter*`, `Mission/Volunteer` (se aprovado).

### Testes
RBAC (matriz de permissões), fluxo de aprovação com auditoria imutável, relatórios (séries determinísticas → CSV/PDF snapshot).

### Critérios de aceite
1. Operador consegue emitir alerta com fluxo de aprovação e trilha completa.
2. Cidadão NÃO acessa nada do painel (RBAC testado).
3. Toda ação crítica gera `AuditEvent`.

### Riscos
Maior fase do roadmap; mitigar dividindo em 8a (auth/RBAC), 8b (alertas/ocorrências), 8c (abrigos/relatórios).

### Complexidade
**Muito alta.**

---

## RECOVERY-9 — Tsunami / riscos costeiros

### Objetivo
Implementar §4.9/§8.6/FASE 7: conectores oficiais de tsunami e nível do mar, zonas costeiras, protocolo de aviso, rotas de evacuação costeiras.

### Escopo
- Conectores: avisos oficiais nacionais (Marinha/CenAD quando disponíveis), UNESCO-IOC/redes regionais, fontes sísmicas oficiais, nível do mar/boias — todos BLOQUEADOS até validação de fontes; nesta fase: implementar o pipeline genérico + `provider` CAP.
- `/tsunami`: status real por zona costeira (substitui "Normal" fixo), protocolo de aviso alinhado à Defesa Civil, exercícios simulados (§FASE 7), revisão com especialistas (humano).
- Camada costeira no mapa (6.3.13) e rotas de evacuação (8.6) com a regra: "rota sugerida nunca promete segurança absoluta".

### Dependências
R-4 (pipeline de conectores), R-3 (SafeRoute/RoadBlock).

### Testes
Fixtures CAP/sísmicos determinísticos; mapeamento de severidade; exercício simulado ponta a ponta.

### Critérios de aceite
1. Nenhum status costeiro exibido sem fonte oficial identificada.
2. Protocolo revisado por humano/especialista antes de habilitar em produção.

### Riscos
Disponibilidade de fontes oficiais brasileiras (manter BLOQUEADO até existirem — nunca simular alerta de tsunami).

### Complexidade
**Média** (após R-4).

---

## RECOVERY-10 — Hardening, segurança, LGPD, observabilidade e produção

### Objetivo
Fechar §14/§16: produção com segurança, LGPD e observabilidade completas.

### Escopo
- Headers/CSP/CORS em `next.config.ts`; rate limit global (Redis); revisão de upload (verificação de arquivos); XSS/SSRF review; pentest interno básico.
- LGPD: consentimento (localização/ocorrências), retenção limitada, exclusão/anonimização, DPO docs (`docs/security/`), política de incidentes, backups testados.
- Observabilidade §16: métricas (uptime, latência, erro por rota, fila, atraso de dados, notificações enviadas/entregues, tempo detecção→alerta), dashboards, alertas operacionais, correlation ID ponta a ponta, auditoria separada de logs técnicos.
- CI/CD (lint, typecheck, testes, build, migrations check) — `.github/`; ambientes local/staging/produção; ambientes e segredos gerenciados (fora do Git).
- MFA operadores, revisão de dependências automática (audit no CI).

### Dependências
Todas as fases anteriores.

### Testes
Suíte de segurança (headers, rate limit, RBAC regressivo); restore de backup em staging; dashboards com dados sintéticos.

### Critérios de aceite
1. Checklist §14 e §16 100% implementado ou explicitamente BLOQUEADO com justificativa.
2. `npm audit` limpo; segredos só em cofre/ambiente.
3. Go-live somente com revisão humana.

### Riscos
Custo de infra de observabilidade; complexidade LGPD (mitigar com checklist incremental desde R-1: consentimento de ocorrência já entra na R-1/R-2).

### Complexidade
**Alta.**

---

## Decisões de arquitetura que exigem aprovação humana (registradas, não executadas)

1. **NestJS agora ou depois?** Recomendação: manter monólito modular em Next na R-2 e extrair `apps/api` (NestJS) só quando R-3 estiver estável (doc §10.1 prevê monorepo, §11 permite monólito modular no MVP).
2. **Prisma vs Drizzle** para PostGIS/migrations (ADR 0002 na R-3).
3. **Leaflet vs MapLibre** — manter Leaflet+OSM no MVP e registrar ADR 0004, ou migrar (custo alto, sem ganho imediato).
4. **TanStack Query** como camada de fetch cliente (doc §10.2 lista explicitamente).
5. **Destino do código morto** (`Modal`, `useMediaQuery`, `useReducedMotion`, `MapDetailPanel`, `OriginFilter`): usar ou remover com aprovação (nada será apagado nesta fase).
