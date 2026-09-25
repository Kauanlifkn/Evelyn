# HIDRO-ALERTA-COMPLIANCE — Matriz de Conformidade (RECOVERY-0)

> **Fonte oficial:** [`HIDRO-ALERTA.md`](../HIDRO-ALERTA.md) (v0.1, 06/08/2026).
> **Data da auditoria:** 2026-09-24. **Commit base:** `21acd58` + alterações não commitadas (integração INMET em andamento).
> **Escopo desta matriz:** conformidade entre o documento oficial e o código atual. Nenhum item foi omitido deliberadamente.
>
> **⬆️ ATUALIZAÇÃO RECOVERY-1 (2026-09-25):** os itens corrigidos nesta fase estão marcados com **[R1 ✅]** e detalhados no apêndice [Apêndice E — Delta RECOVERY-1](#apêndice-e--delta-recovery-1-2026-09-25) no fim deste documento. A matriz abaixo preserva o retrato de 2026-09-24 para rastreabilidade.

## Legenda de status

| Status | Significado |
|---|---|
| `IMPLEMENTADO` | Existe, funciona e é real (não simulado). |
| `PARCIAL` | Existe, mas cobre parte do requisito ou tem falhas pontuais. |
| `SIMULADO` | Existe visualmente/funcionalmente no cliente, mas com dado ou persistência falsa — **identificado na UI**. |
| `QUEBRADO` | Existe, mas está com defeito ativo hoje (falha em teste, erro de console ou comportamento errado). |
| `NÃO IMPLEMENTADO` | Não existe no repositório. |
| `BLOQUEADO` | Depende de decisão/fornecedor externo para avançar. |
| `FORA DE ESCOPO ATUAL` | Previsto pelo documento para fase posterior; não exigido agora. |

---

## 1. Visão do produto (HIDRO-ALERTA.md §1)

| # | Requisito | Status | Arquivos / Rotas | Testes | Problema / Observação | Fase |
|---|---|---|---|---|---|---|
| 1.1 | Avisar risco de inundação/alagamento/enchente | SIMULADO | `src/data/mocks/alerts.ts`, `/alertas` | `mocks.test.ts` | Alertas mock estáticos; nenhuma emissão real de aviso hidrológico | R-4/R-6 |
| 1.2 | Acompanhar nível de rios, chuva acumulada e previsão | SIMULADO | `src/data/mocks/rivers.ts`, `weather.ts`, dashboard | `mocks.test.ts` | Dados fixos de ago/2026; sem coleta | R-4 |
| 1.3 | Mostrar áreas de risco em mapa interativo | PARCIAL | `src/components/map/RiskMap.tsx`, `/mapa` | `app.spec.ts` | Mapa carrega, mas marcadores **não aparecem no estado inicial** (bug do filtro `'all'` — ver 6.3) | R-1 |
| 1.4 | Avisar tsunami, ressaca, maré de tempestade, ondas | SIMULADO | `/tsunami`, `CoastalStatus.tsx` | `app.spec.ts` | Só conteúdo educativo + status "Normal" fixo para 4 cidades; nenhuma fonte oficial | R-9 |
| 1.5 | Indicar abrigos, hospitais, rotas seguras, pontos de apoio | PARCIAL | `/abrigos`, `ShelterCard.tsx` | `app.spec.ts` | Abrigos mock ok; **hospitais, rotas seguras e pontos de apoio não existem** | R-1/R-3 |
| 1.6 | Cidadão envia ocorrência com foto, localização e descrição | PARCIAL | `/ocorrencias`, `IncidentForm.tsx` | `app.spec.ts` | Form existe; **foto simulada, sem geolocalização automática, sem envio/persistência** | R-1/R-2 |
| 1.7 | Painel operacional para Defesa Civil/prefeitura/admin | NÃO IMPLEMENTADO | — | — | Não há rota `/painel` nem qualquer tela operacional | R-8 |
| 1.8 | PWA; futuro Android/iOS | NÃO IMPLEMENTADO | `public/` (só SVGs), `layout.tsx` | — | Sem `manifest`, sem service worker, sem offline | R-7 |
| 1.9 | Exibir informação essencial com conexão instável | NÃO IMPLEMENTADO | — | — | Nada funciona sem rede além do HTML em cache do navegador | R-7 |
| 1.10 | Não inventar alertas oficiais; rotular oficial/preditivo/comunitário | PARCIAL | `OfficialBadge.tsx`, `AlertDetail.tsx`, `mock-provider.ts` | `inmet-provider.test.ts` | Rotulagem existe, **mas** `MockProvider` marca alertas com `isOfficial: true` (`mock-provider.ts:37`) — violação do princípio em modo mock | R-1 |

## 2. Princípios obrigatórios (§2)

| # | Princípio | Status | Evidência | Problema | Fase |
|---|---|---|---|---|---|
| 2.1 | Toda informação mostra fonte, horário e nível de confiança | PARCIAL | `SourceStatus.tsx`, `OfficialAlertDetail.tsx` | Alerts oficiais mostram fonte/hora; mocks de rio/clima/abrigos mostram "simulado" mas sem horário de coleta visível em todos os cards; "nível de confiança" não existe | R-6 |
| 2.2 | Previsão automática nunca apresentada como certeza | PARCIAL | Dashboard ("dado simulado") | Ok nos rótulos; motor de risco inexistente, então nada a rotular ainda | R-6 |
| 2.3 | Alertas críticos com trilha de auditoria | NÃO IMPLEMENTADO | — | Sem backend/DB não há auditoria | R-2/R-3 |
| 2.4 | Acessibilidade e simplicidade obrigatórias | PARCIAL | `globals.css`, testes E2E de acessibilidade | Boa base (landmarks, aria-label, focus-visible, reduced-motion); faltas: alternativa textual do mapa, skip-link, axe-core; `Badge` usa `role="status"` indevidamente (polui live regions e quebrou teste) | R-1 |
| 2.5 | Degradar com segurança quando fonte externa falhar | PARCIAL | `inmet-provider.ts` (`returnStaleOrEmpty`), fallback mock em `/alertas` | Fallback existe e nunca mostra mock como oficial; mas em `official` mode o dashboard mostra "temporariamente indisponível" sem stale-data persistida entre restarts (cache só em memória) | R-4 |
| 2.6 | LGPD para dados pessoais e localização | NÃO IMPLEMENTADO | — | Sem coleta real ainda; ocorrências não pedem consentimento (doc §6.5 exige) | R-1/R-10 |
| 2.7 | Alteração crítica com testes automatizados | PARCIAL | 87 unit + 67 E2E | Suíte existe, porém **10 unit + 8 E2E falhando** no baseline | R-1 |
| 2.8 | Mapa nunca única forma de transmitir alerta | PARCIAL | Alertas também em lista/dashboard | Ok hoje por acidente (lista é a forma principal); nada garante a regra | R-1 |
| 2.9 | Distinguir enchente/inundação/alagamento/enxurrada/deslizamento/tsunami/ressaca/maré | PARCIAL | `types/alert.ts` (`AlertType`), `AlertFilters.tsx` | Tipos existem; **"enxurrada" não tem tipo próprio**; eventos do INMET (`storm`, `gale`, `coastal_winds`, `frost`…) não estão nos filtros da UI | R-1 |
| 2.10 | Salvar vidas > engajamento | IMPLEMENTADO | SOS presente em todas as telas | — | — |

## 3. Públicos do sistema (§3)

| # | Público / capacidade | Status | Evidência | Fase |
|---|---|---|---|---|
| 3.1 | Cidadão: consultar situação | PARCIAL | Dashboard/listas com mocks | R-1..R-4 |
| 3.2 | Cidadão: receber alertas por localização | NÃO IMPLEMENTADO | Sem geolocalização, sem geofencing | R-7 |
| 3.3 | Cidadão: acompanhar rios e chuva | SIMULADO | Cards do dashboard (mocks) | R-4 |
| 3.4 | Cidadão: encontrar abrigos e rotas | PARCIAL | `/abrigos` mock; **rotas inexistentes** ("Traçar rota" = `alert()`) | R-1/R-3 |
| 3.5 | Cidadão: enviar ocorrência | PARCIAL | Form sem persistência/foto real | R-2 |
| 3.6 | Cidadão: solicitar ajuda | NÃO IMPLEMENTADO | Botão "Preciso de ajuda" só no detalhe de alerta mock, via `alert()`; sem canal real | R-2/R-8 |
| 3.7 | Cidadão: cadastrar familiares e locais | NÃO IMPLEMENTADO | — | R-8 |
| 3.8 | Cidadão: modo de acessibilidade | PARCIAL | `prefers-reduced-motion`, contraste ok | R-1 |
| 3.9 | Cidadão: baixar plano familiar | NÃO IMPLEMENTADO | — | R-8 |
| 3.10 | Voluntário: ver solicitações/disponibilidade/missão/atendimento | NÃO IMPLEMENTADO | — | R-8 |
| 3.11 | Operador municipal: mapa+sensores, validar ocorrências, gerir abrigos, comunicados, recursos, decisões | NÃO IMPLEMENTADO | — | R-8 |
| 3.12 | Administrador: territórios, usuários, permissões, integrações, auditoria, regras de risco, templates | NÃO IMPLEMENTADO | — | R-8/R-10 |
| 3.13 | Analista: séries históricas, comparação, relatórios, qualidade de dados | NÃO IMPLEMENTADO | — | R-8 |

## 4. Tipos de evento monitorados (§4)

| # | Evento | Status | Evidência | Fase |
|---|---|---|---|---|
| 4.1 | Chuva intensa | PARCIAL | `heavy_rain` em mocks + mapeado do INMET (`mapInmetEventType`) | R-4 |
| 4.2 | Alagamento | SIMULADO | `waterlogging` (mocks) | R-2+ |
| 4.3 | Inundação | SIMULADO | `flood` (mocks) | R-2+ |
| 4.4 | Enchente de rios | SIMULADO | `river_flood` (mocks) | R-2+ |
| 4.5 | Enxurrada | NÃO IMPLEMENTADO | Não existe tipo `flash_flood`/enxurrada distinto na UI de filtros (`flash_flood` existe no tipo, falta no filtro da UI e conceito separado de "enchente rápida" vs "enxurrada") | R-1 |
| 4.6 | Deslizamento associado à chuva | SIMULADO | `landslide` (mocks) | R-2+ |
| 4.7 | Rompimento de barragem (só fonte autorizada) | SIMULADO | `dam_risk` mock com origem OPERATOR; sem fonte autorizada real | R-4+ |
| 4.8 | Ressaca e ondas costeiras | SIMULADO | `storm_surge`, `high_waves` (mocks) | R-9 |
| 4.9 | Tsunami (só fontes oficiais) | NÃO IMPLEMENTADO | Página educativa; nenhum conector (ex.: UNESCO-IOC, Marinha) | R-9 |
| 4.10 | Seca severa / risco hídrico | FORA DE ESCOPO ATUAL | Doc: "fase posterior" | Posterior |
| 4.11 | Incêndio florestal | FORA DE ESCOPO ATUAL | Doc: "fase posterior" | Posterior |
| 4.12 | Vendaval, granizo, tempestades severas | PARCIAL | INMET mapeia `Vendaval`→`gale`, `Tempestade`→`storm`; UI não exibe/filtra esses tipos | R-1/R-4 |

## 5. Classificação dos alertas (§5)

| # | Requisito | Status | Evidência | Problema | Fase |
|---|---|---|---|---|---|
| 5.1 | Severidade 0–4 (Informativo→Emergência) com cores doc | PARCIAL | `Badge.tsx` (0–4), `RiskGauge.tsx`, `MapLegend.tsx` | UI cobre 0–4; **alertas oficiais INMET só têm 0–3** (informative/attention/danger/extreme) e não há mapeamento para "Emergência" (4); filtro de severidade da UI ignora nível 4 em modo oficial | R-1/R-4 |
| 5.2 | Origens OFFICIAL/SENSOR/MODEL/OPERATOR/COMMUNITY/PARTNER | PARCIAL | `types/alert.ts`, `getOriginLabel` | Tipos definidos e exibidos em mocks; origem não existe no fluxo oficial (`OfficialAlert` tem `sourceType: 'OFFICIAL_WEATHER'`) nem para ocorrências reais | R-2 |
| 5.3 | Estados: rascunho/em validação/ativo/atualizado/encerrado/cancelado/falso positivo | PARCIAL | `AlertStatus` (sem `encerrado`? — usa `closed`), `OfficialAlertStatus` só `active/expired` | Modelo oficial simplificado (`active|expired`) vs. doc; sem fluxo de estados no backend | R-2 |

## 6. Funcionalidades do cidadão (§6)

### 6.1 Tela inicial

| # | Item | Status | Arquivo | Observação | Fase |
|---|---|---|---|---|---|
| 6.1.1 | Saudação | NÃO IMPLEMENTADO | `app/page.tsx` | Não há saudação ao usuário (usuário mock só aparece na sidebar) | R-1 |
| 6.1.2 | Localização atual | NÃO IMPLEMENTADO | — | Nenhuma geolocalização; cidade fixa "Região Metropolitana" | R-1/R-7 |
| 6.1.3 | Cartão do alerta mais importante | PARCIAL | `app/page.tsx` (até 5 `OfficialAlertCard`) | Em modo mock mostra "indisponível"; não há noção de "mais importante" (ordenação por severidade) | R-1 |
| 6.1.4 | Ações rápidas (8 do §6.2) | NÃO IMPLEMENTADO | — | Nenhuma grade de ações rápidas existe | R-1 |
| 6.1.5 | Previsão do dia | SIMULADO | `RainForecastCard`, `mocks/weather.ts` | Data fixa 2026-08-06 (stale) | R-4 |
| 6.1.6 | Navegação inferior | IMPLEMENTADO | `MobileNav.tsx` | Funciona (4 abas + SOS + Mais) | — |
| 6.1.7 | Indicador de conexão | NÃO IMPLEMENTADO | — | Offline/online não detectado | R-7 |
| 6.1.8 | Último horário de atualização | QUEBRADO | `LastUpdate.tsx`, `app/page.tsx:164` | **Erro de hidratação**: `new Date().toISOString()` no render do cliente + `toLocaleString` divergente server/client (capturado no E2E) | R-1 |

### 6.2 Ações rápidas

| # | Ação | Status | Evidência | Fase |
|---|---|---|---|---|
| 6.2.1 | Ver alertas | PARCIAL | Navegação existe; ação rápida em si não existe | R-1 |
| 6.2.2 | Localizar abrigo | PARCIAL | Navegação existe; ação rápida não | R-1 |
| 6.2.3 | Relatar alagamento | PARCIAL | `/ocorrencias` existe; ação rápida não | R-1 |
| 6.2.4 | Solicitar ajuda | NÃO IMPLEMENTADO | — | R-1/R-2 |
| 6.2.5 | Compartilhar localização | NÃO IMPLEMENTADO | — | R-1 (Web Share API) |
| 6.2.6 | Ligar para emergência | PARCIAL | SOS = `alert()` informativo (rotulado simulado) | R-1 (`tel:` link) |
| 6.2.7 | Abrir plano familiar | NÃO IMPLEMENTADO | — | R-8 |
| 6.2.8 | Confirmar que está seguro | NÃO IMPLEMENTADO | Botão "Estou seguro" só existe no detalhe de alerta **mock**; desapareceu no detalhe oficial | R-1/R-2 |

### 6.3 Mapa de risco

| # | Item | Status | Evidência | Problema | Fase |
|---|---|---|---|---|---|
| 6.3.1 | Camada: alertas ativos | QUEBRADO | `RiskMap.tsx` | No estado inicial (`filters=['all']`) nenhum marcador é renderizado — `showAll = filters.length===0` nunca é true e `.includes(type)` falha com o sentinel `'all'` | R-1 |
| 6.3.2 | Camada: áreas suscetíveis | QUEBRADO | `RiskMap.tsx` (círculos) | Mesmo bug do filtro; raio/geom fixos mock | R-1/R-3 |
| 6.3.3 | Camada: chuva | NÃO IMPLEMENTADO | — | — | R-4 |
| 6.3.4 | Camada: rios e estações | NÃO IMPLEMENTADO | — | — | R-4 |
| 6.3.5 | Camada: nível de rios | NÃO IMPLEMENTADO | — | — | R-4 |
| 6.3.6 | Camada: ocorrências comunitárias | NÃO IMPLEMENTADO | `mockIncidents` só usado em teste | — | R-2 |
| 6.3.7 | Camada: abrigos | QUEBRADO | `RiskMap.tsx` | Mesmo bug do estado inicial (só aparece se clicar no filtro "Abrigos") | R-1 |
| 6.3.8 | Camada: hospitais | NÃO IMPLEMENTADO | Tipo `hospital` existe em `types/map.ts` | Sem dados/UI | R-3 |
| 6.3.9 | Camada: rotas interditadas | NÃO IMPLEMENTADO | — | — | R-3 |
| 6.3.10 | Camada: rotas de evacuação | NÃO IMPLEMENTADO | — | — | R-3/R-9 |
| 6.3.11 | Camada: pontos de encontro | NÃO IMPLEMENTADO | — | — | R-8 |
| 6.3.12 | Camada: câmeras públicas autorizadas | NÃO IMPLEMENTADO | — | — | R-8 |
| 6.3.13 | Camada: áreas costeiras / risco marítimo | NÃO IMPLEMENTADO | — | — | R-9 |
| 6.3.14 | Camada: localização do usuário | NÃO IMPLEMENTADO | — | — | R-1 (permissão) |
| 6.3.15 | Filtros por evento e severidade | QUEBRADO | `MapFilters.tsx` + `mapa/page.tsx` | Botão "Todos" é no-op e nunca fica ativo (`isAllActive = activeFilters.length===0` é inalcançável); filtro de origem (`OriginFilter` com INMET/Sensores/Comunidade/Simulados) existe em código morto e não é renderizado | R-1 |
| 6.3.16 | Legenda | IMPLEMENTADO | `MapLegend.tsx` | Presente e correta para severidade/abrigo | — |
| 6.3.17 | Agrupamento de marcadores (cluster) | NÃO IMPLEMENTADO | — | — | R-1 |
| 6.3.18 | Tempo quase real | NÃO IMPLEMENTADO | — | Sem polling/SSE no mapa | R-4 |
| 6.3.19 | Cache offline de áreas favoritas | NÃO IMPLEMENTADO | — | — | R-7 |
| 6.3.20 | Pesquisa por cidade/bairro/rua/CEP | NÃO IMPLEMENTADO | Busca da sidebar não conectada a nada | — | R-1/R-3 |
| 6.3.21 | Modo alto contraste | NÃO IMPLEMENTADO | — | — | R-1 |
| 6.3.22 | Descrição textual alternativa do mapa | NÃO IMPLEMENTADO | Só legenda; regra §2 "mapa nunca única forma" hoje é atendida pela lista, não por alternativa do mapa | — | R-1 |

### 6.4 Tela de alerta

| # | Item | Status | Evidência | Problema | Fase |
|---|---|---|---|---|---|
| 6.4.1 | Título direto | IMPLEMENTADO | `OfficialAlertDetail`/`AlertDetail` | — | — |
| 6.4.2 | Severidade | PARCIAL | Badge 0–3 oficial | Nível 4 (Emergência) não é produzido por fonte nenhuma | R-4 |
| 6.4.3 | Evento | PARCIAL | `alert.eventType` exibido **cru** (ex.: `chuvas_intensas`) — sem tradução pt-BR no detalhe oficial | R-1 |
| 6.4.4 | Local afetado | PARCIAL | `areas[].areaDesc` (texto) | Sem vínculo geográfico/mapa | R-3 |
| 6.4.5 | Fonte | IMPLEMENTADO | `getSourceLabel('INMET')` | — | — |
| 6.4.6 | Início e validade | IMPLEMENTADO | `effectiveAt/expiresAt` | — | — |
| 6.4.7 | Instruções | NÃO IMPLEMENTADO p/ oficial | INMET não fornece; comentário no código; mock tem instruções | Doc exige instruções — precisa de fonte secundária/templates | R-4 |
| 6.4.8 | Áreas afetadas | IMPLEMENTADO | Lista de chips | — | — |
| 6.4.9 | Mapa no alerta | NÃO IMPLEMENTADO | — | — | R-3 |
| 6.4.10 | Evolução do risco | NÃO IMPLEMENTADO | — | — | R-6 |
| 6.4.11 | Contatos | NÃO IMPLEMENTADO | — | — | R-1 |
| 6.4.12 | Compartilhar | QUEBRADO | `OfficialAlertDetail.tsx:162` | `alert('Link copiado')` mas **nada é copiado** (sem `navigator.clipboard`); feedback mentindo ao usuário. No mock, `AlertDetail` usa `alert()` rotulado | R-1 |
| 6.4.13 | Confirmar leitura | NÃO IMPLEMENTADO | — | — | R-2 |
| 6.4.14 | "Estou seguro" | QUEBRADO | Removido do detalhe oficial | Existia no mock (`AlertDetail`), sumiu na troca para `OfficialAlertDetail`; E2E falhando | R-1/R-2 |
| 6.4.15 | "Preciso de ajuda" | QUEBRADO | idem 6.4.14 | idem | R-1/R-2 |

### 6.5 Relatar ocorrência

| # | Campo/Proteção | Status | Evidência | Fase |
|---|---|---|---|---|
| 6.5.1 | Tipo | IMPLEMENTADO | select com 5 tipos | — |
| 6.5.2 | Foto ou vídeo | SIMULADO | Área clicável → `alert()`; sem upload real | R-2 (storage) |
| 6.5.3 | Descrição | IMPLEMENTADO | textarea obrigatória | — |
| 6.5.4 | Localização | PARCIAL | Campo de texto manual; sem GPS | R-1 |
| 6.5.5 | Profundidade da água | IMPLEMENTADO | input numérico opcional | — |
| 6.5.6 | Via bloqueada | IMPLEMENTADO | checkbox | — |
| 6.5.7 | Pessoas em risco | IMPLEMENTADO | input numérico opcional | — |
| 6.5.8 | Horário | PARCIAL | `createdAt` implícito; usuário não informa; sem exibição | R-1 |
| 6.5.9 | Envio anônimo opcional | NÃO IMPLEMENTADO | Tipo `Incident.anonymous` existe; **form não tem o toggle** | R-1 |
| 6.5.10 | Consentimento de uso | NÃO IMPLEMENTADO | Ausente — **requisito LGPD do doc** | R-1 |
| 6.5.11 | Remoção de metadados de mídia | NÃO IMPLEMENTADO | — | R-2 |
| 6.5.12 | Limite de arquivos | NÃO IMPLEMENTADO | — | R-2 |
| 6.5.13 | Moderação | NÃO IMPLEMENTADO | — | R-8 |
| 6.5.14 | Detecção de duplicidade | NÃO IMPLEMENTADO | — | R-2/R-6 |
| 6.5.15 | Reputação de fonte | NÃO IMPLEMENTADO | — | R-8 |
| 6.5.16 | Nunca publicar dados pessoais de vítimas | NÃO IMPLEMENTADO | Sem pipeline de publicação | R-2/R-10 |
| 6.5.17 | Persistência do envio | SIMULADO | Sucesso apenas client-side, estado some ao recarregar | R-2 |

### 6.6 Abrigos

| # | Item | Status | Evidência | Problema | Fase |
|---|---|---|---|---|---|
| 6.6.1 | Nome, endereço, distância | IMPLEMENTADO (mock) | `ShelterCard`, `mocks/shelters.ts` | Dados estáticos; distância fixa, não calculada do usuário | R-3 |
| 6.6.2 | Capacidade total e vagas | IMPLEMENTADO (mock) | Barra de ocupação | — | — |
| 6.6.3 | Acessibilidade / animais / alimentação / atendimento médico | PARCIAL | `accessible`, `acceptsAnimals`, `hasFood`, `hasMedical` | **`hasFood` (alimentação) não é exibido no card** — só acessível/animais/médico | R-1 |
| 6.6.4 | Contato | PARCIAL | Telefone exibido como texto | Não é link `tel:` | R-1 |
| 6.6.5 | Rota sugerida | SIMULADO | Botão "Traçar rota" → `alert()` | — | R-3 |
| 6.6.6 | Última atualização | PARCIAL | `lastUpdate` no tipo/mock | **Não exibido na UI** | R-1 |
| 6.6.7 | Status aberto/lotado/fechado/desconhecido | IMPLEMENTADO (mock) | Badge colorido + texto | Sem filtro "Desconhecido" na lista (só Todos/Abertos/Lotados/Fechados) | R-1 |

### 6.7 Família e locais importantes

| # | Item | Status | Fase |
|---|---|---|---|
| 6.7.1 | Familiares, casa, escola, trabalho, parentes, locais favoritos | NÃO IMPLEMENTADO | R-8 |
| 6.7.2 | Alertas por raio | NÃO IMPLEMENTADO | R-7 |
| 6.7.3 | Confirmação de segurança | NÃO IMPLEMENTADO | R-8 |
| 6.7.4 | Contatos de emergência | NÃO IMPLEMENTADO | R-8 |

## 7. Painel web operacional (§7)

| # | Módulo | Status | Evidência | Fase |
|---|---|---|---|---|
| 7.1 | Dashboard operacional (nível rio, chuva, pessoas expostas, abrigos, mapa, alertas recentes, abrigos próximos, medidor, tempo real) | PARCIAL | Existe **dashboard do cidadão** (`/`) com todos esses cards, mas todos SIMULADOS e sem tempo real; não é painel operacional com login/papel | R-8 |
| 7.1.x | Medidor geral de risco | SIMULADO | `RiskGauge` com `level={2}` hardcoded e rótulo "Simulado" | R-6 |
| 7.2 | Central de alertas (criar/editar, aprovação, seleção geográfica, templates, preview, multicanal, cancelamento, histórico, entrega, auditoria) | NÃO IMPLEMENTADO | — | R-8 |
| 7.3 | Central de ocorrências (fila, proximidade, mapa, mídia, prioridade, atribuição, conversão em incidente, vínculo com alerta) | NÃO IMPLEMENTADO | `mockIncidents` não tem UI | R-8 |
| 7.4 | Gestão de abrigos (cadastro, capacidade, ocupação, necessidades, responsáveis, estoque, check-in) | NÃO IMPLEMENTADO | Só leitura pública de mocks | R-8 |
| 7.5 | Pessoas e áreas expostas (estimativa populacional, escolas, hospitais, ILPIs, zonas vulneráveis, infra crítica) | SIMULADO | `RiskPeopleCard count={12450}` hardcoded, rotulado simulado; doc exige apresentar como estimativa — hoje ok, mas sem base | R-3/R-6 |
| 7.6 | Relatórios (alertas, tempo até publicação, entregas, leituras, ocorrências, falsos positivos, disponibilidade, abrigos, evolução, CSV/PDF) | NÃO IMPLEMENTADO | — | R-8 |

## 8. Ideias adicionais aprovadas (§8)

| # | Ideia | Status | Fase |
|---|---|---|---|
| 8.1 | Modo Guardião | NÃO IMPLEMENTADO | R-8 |
| 8.2 | Plano familiar de emergência (contatos, ponto de encontro, medicamentos, animais, documentos, mochila, rotas, versão offline) | NÃO IMPLEMENTADO | R-8 |
| 8.3 | Modo escola | NÃO IMPLEMENTADO | R-8 |
| 8.4 | Modo comunidade | NÃO IMPLEMENTADO | R-8 |
| 8.5 | Alertas multicanal (push, SMS, WhatsApp, e-mail, web, sirene, CAP, ligação) | NÃO IMPLEMENTADO | R-7 |
| 8.6 | Rotas seguras (vias bloqueadas, áreas inundadas, pontes, relevo, alertas, sentido de evacuação, validade) | NÃO IMPLEMENTADO | R-3/R-9 |
| 8.7 | Modo offline (alertas recentes, contatos, plano, abrigos salvos, instruções, mapas, hora da sync) | NÃO IMPLEMENTADO | R-7 |

## 9. Fontes de dados (§9)

| # | Fonte | Status | Evidência (endpoint, auth, timeout, retry, cache, normalização, health, testes) | Fase |
|---|---|---|---|---|
| 9.1 | **INMET** (avisos RSS) | QUEBRADO (implementado) | `src/server/providers/alerts/inmet-provider.ts` + `rss-parser.ts`. Endpoint `https://apiprevmet3.inmet.gov.br/avisos/rss`; sem auth (correto); timeout 15 s (`AbortController`); **sem retry**; cache em memória TTL 120 s; normalização completa (`mapInmetSeverity`, `parseAreas`, etc.); health (`SourceHealth` ONLINE/STALE/OFFLINE + latência); testes existem (11) mas **3 falham**. **Causa-raiz ativa:** [rss-parser.ts:179-180](../src/server/lib/rss-parser.ts#L179-L180) constrói `RegExp` com strings sem escapar backslashes (`"\s*"`→`s*`, `\[CDATA\[`→`[CDATA[`) → `SyntaxError: Unmatched ')'` em todo parse → `PARSE_ERROR` → provider sempre OFFLINE → `/api/alerts` devolve `[]` em modo `official`. Feed real está UP (verificado em 2026-09-24: HTTP 200, 140 KB, 1,3 s). Falha segura correta: nunca mostra mock como oficial. | R-1 |
| 9.2 | IDAP / Defesa Civil nacional-estadual-municipal | BLOQUEADO | `.env.example` documenta: aguardando interface pública validada; factory de providers já preparada (`providers/alerts/index.ts`) | R-4 |
| 9.3 | CEMADEN | NÃO IMPLEMENTADO | — | R-4 |
| 9.4 | ANA / SNIRH / HidroWeb / Hidro-Telemetria | NÃO IMPLEMENTADO | — | R-4 |
| 9.5 | CPTEC / INPE | NÃO IMPLEMENTADO | — | R-4 |
| 9.6 | IBGE | NÃO IMPLEMENTADO | — | R-4 |
| 9.7 | Órgãos ambientais / prefeituras / parceiros | NÃO IMPLEMENTADO | — | R-4+ |
| 9.8 | Sensores próprios autorizados | NÃO IMPLEMENTADO | Ver §Sensor abaixo | R-5 |
| 9.9 | Tsunami: avisos oficiais, UNESCO-IOC, nível do mar, boias, fontes sísmicas | NÃO IMPLEMENTADO | — | R-9 |
| 9.10 | Regra de integração (identificador, licença, auth, frequência, timeout, retry, circuit breaker, normalizador, dedupe, data coleta/original, health, docs, testes com dados simulados) | PARCIAL | Só INMET: tem id fonte, timeout, cache, normalizador, health, testes. **Faltam:** retry, circuit breaker, licença/terms registrados, dedupe persistente, frequência agendada (hoje é lazy por request) | R-4 |

### Sensor próprio RIO-001 (instrução da fase RECOVERY-0)

| Item | Status |
|---|---|
| Firmware do sensor | Existe **externamente** a este repositório (fora do escopo desta auditoria) |
| API de ingestão de telemetria | NÃO IMPLEMENTADO |
| Cadastro de sensor | NÃO IMPLEMENTADO |
| Heartbeat / status online-offline | NÃO IMPLEMENTADO |
| Telemetria / histórico / gráfico | NÃO IMPLEMENTADO |
| Alertas derivados de sensor | NÃO IMPLEMENTADO (origem `SENSOR` só existe em mocks) |
| Autenticação de dispositivo | NÃO IMPLEMENTADO |
| **Pendência registrada para:** | **RECOVERY-5** (não implementar comunicação Arduino nesta fase) |

## 10. Arquitetura técnica (§10)

| # | Requisito | Status | Evidência | Divergência registrada | Fase |
|---|---|---|---|---|---|
| 10.1 | Monorepo `apps/{web,api,worker,mobile}` + `packages/*` + `infra/` + `docs/` | NÃO IMPLEMENTADO | Estrutura atual: app Next.js único em `src/` | **Divergência arquitetural consciente.** Não migrar silenciosamente — plano em RECOVERY-2/R-3 decide | Decisão humana |
| 10.2 | Frontend: Next.js+TS+React+Tailwind | IMPLEMENTADO | `package.json` (Next 16.3.0, React 19.2.8, TS 5, Tailwind 4) | Next 16 tem breaking changes — seguir `node_modules/next/dist/docs/` | — |
| 10.3 | TanStack Query | NÃO IMPLEMENTADO | Hooks `use*` artesanais (`useOfficialAlerts`) | Substituto funcional parcial (sem cache/dedupe/retry) | R-2 |
| 10.4 | MapLibre GL JS | DIVERGENTE | Leaflet 1.9.4 + react-leaflet 5 + tiles OSM | Doc prevê MapLibre; Leaflet cumpre o papel no MVP — **manter e registrar como decisão, não trocar silenciosamente** | Decisão humana |
| 10.5 | PWA / Web Push | NÃO IMPLEMENTADO | — | — | R-7 |
| 10.6 | Backend: NestJS, REST, OpenAPI, SSE/WS, validação Zod | NÃO IMPLEMENTADO | 4 Route Handlers Next (`src/app/api/*`) sem validação de input | **Divergência documentada:** hoje tudo em Route Handlers. Convergência proposta em RECOVERY-2 (monólito modular dentro de Next → extrair NestJS depois) | R-2 |
| 10.7 | PostgreSQL + PostGIS + Redis + BullMQ + S3 + migrations | NÃO IMPLEMENTADO | Nenhuma persistência; tudo em código/localStorage | — | R-3 |
| 10.8 | Docker Compose dev; CI com lint/typecheck/test/build; logs estruturados; métricas; tracing; backups; ambientes | NÃO IMPLEMENTADO | Docker instalado na máquina, nada no repo; sem CI (`.github/` ausente) | — | R-3/R-10 |

## 11. Serviços internos (§11) — como módulos do monólito

| Serviço | Status | Observação |
|---|---|---|
| identity-service | NÃO IMPLEMENTADO | Usuário mock (`mocks/user.ts`) |
| territory-service | NÃO IMPLEMENTADO | — |
| source-ingestion-service | PARCIAL | `src/server/providers/alerts/*` é o embrião (1 fonte) |
| observation-service | NÃO IMPLEMENTADO | — |
| risk-engine | NÃO IMPLEMENTADO | Ver §13 |
| alert-service | PARCIAL | Provider de leitura apenas; sem emissão/estados/audit |
| incident-service | NÃO IMPLEMENTADO | Form client-side sem domínio |
| shelter-service | NÃO IMPLEMENTADO | Só leitura mock |
| routing-service | NÃO IMPLEMENTADO | — |
| notification-service | NÃO IMPLEMENTADO | Ver §13/Notificações |
| community-report-service | NÃO IMPLEMENTADO | — |
| audit-service | NÃO IMPLEMENTADO | — |
| file-service | NÃO IMPLEMENTADO | — |
| analytics-service | NÃO IMPLEMENTADO | — |
| health-service | PARCIAL | `/api/health` + `/api/sources/status` cobrem só fontes de alerta |

## 12. Modelo de dados (§12) — 34 entidades oficiais

| Entidade | Status | Onde existe hoje (aproximação) |
|---|---|---|
| User | AUSENTE (mock) | `mocks/user.ts` |
| Organization | AUSENTE | — |
| Membership | AUSENTE | — |
| Role | AUSENTE (enum em `User.role`) | `types/user.ts` |
| Territory | AUSENTE | — |
| SavedPlace | AUSENTE | — |
| EmergencyContact | AUSENTE | — |
| FamilyGroup | AUSENTE | — |
| DataSource | PARCIAL (código) | `providers/alerts/*` (sem tabela) |
| SourceHealth | PARCIAL (runtime) | `types.ts` + `/api/sources/status` (sem persistência) |
| Station | AUSENTE | — |
| Sensor | AUSENTE | — |
| Observation | AUSENTE | — |
| River | AUSENTE (mock) | `mocks/rivers.ts` |
| Basin | AUSENTE | — |
| WeatherForecast | AUSENTE (mock) | `mocks/weather.ts` |
| HazardArea | AUSENTE (mock `RiskArea`) | `mocks/risk-areas.ts` |
| RiskAssessment | AUSENTE | — |
| Alert | PARCIAL (dois modelos: `Alert` mock + `OfficialAlert` runtime) | `types/alert.ts`, `providers/alerts/types.ts` |
| AlertRevision | AUSENTE | — |
| AlertArea | PARCIAL (código) | `providers/alerts/types.ts` |
| AlertDelivery | AUSENTE | — |
| Incident | AUSENTE (tipo mock) | `types/incident.ts` |
| CommunityReport | AUSENTE | — |
| Shelter | AUSENTE (mock) | `types/shelter.ts` |
| ShelterStatus | AUSENTE (enum mock) | `types/shelter.ts` |
| ShelterResource | AUSENTE | — |
| RoadBlock | AUSENTE | — |
| SafeRoute | AUSENTE | — |
| Volunteer | AUSENTE | — |
| Mission | AUSENTE | — |
| NotificationPreference | AUSENTE | — |
| AuditEvent | AUSENTE | — |
| Attachment | AUSENTE | — |

> **Resumo:** 0 implementadas em banco, 5 parciais como tipos/código em memória, 29 ausentes. Nenhum ORM, nenhuma migration, nenhum banco.

## 13. Motor de risco (§13)

| # | Requisito | Status | Evidência |
|---|---|---|---|
| 13.1 | Entradas (chuva, previsão, nível/vazão, velocidade de elevação, solo, relevo, histórico, maré, ondas, ocorrências, alertas oficiais, qualidade da fonte) | NÃO IMPLEMENTADO | Nenhuma entrada real existe |
| 13.2 | Saída `RiskAssessment` (severity, score, confidence, area, validade, reasons, sourceRefs, modelVersion, status) | NÃO IMPLEMENTADO | Tipo não existe no código |
| 13.3 | Explicabilidade (razões, dados usados, versionamento de regra/modelo) | NÃO IMPLEMENTADO | — |
| 13.4 | Sem evacuação automática no MVP; aprovação humana para críticos não oficiais | NÃO IMPLEMENTADO (nada a regular ainda) | — |
| 13.5 | Simulação, anti dupla contagem, métricas de falso pos./neg., limites por território | NÃO IMPLEMENTADO | — |
| 13.6 | **Medidor visual de risco do dashboard** | SIMULADO | `RiskGauge` recebe `level={2}` hardcoded (`app/page.tsx:118`) com rótulo "Simulado". **Não é motor de risco.** |

## 14. Segurança e LGPD (§14)

| # | Item | Status | Evidência | Fase |
|---|---|---|---|---|
| 14.1 | Segredos fora do Git | IMPLEMENTADO | `.gitignore` cobre `.env*`; nenhum segredo no repo; `.env.example` só com valores públicos | — |
| 14.2 | Autenticação segura / MFA operadores / RBAC / isolamento por organização | NÃO IMPLEMENTADO | — | R-2/R-10 |
| 14.3 | Criptografia em trânsito/repouso | PARCIAL | HTTPS nas chamadas externas; repouso n/a (sem DB) | R-3/R-10 |
| 14.4 | Logs de auditoria imutáveis | NÃO IMPLEMENTADO | — | R-3 |
| 14.5 | Consentimento de localização | NÃO IMPLEMENTADO | Nenhuma coleta de localização hoje | R-1 |
| 14.6 | Retenção limitada, exclusão, anonimização | NÃO IMPLEMENTADO | — | R-10 |
| 14.7 | Proteção contra abuso de ocorrências + rate limiting | NÃO IMPLEMENTADO | `/api/*` sem rate limit | R-2/R-10 |
| 14.8 | Verificação de arquivos (upload) | NÃO IMPLEMENTADO | Sem upload | R-2 |
| 14.9 | Revisão de dependências | QUEBRADO | `npm audit`: **6 vulnerabilidades — 1 crítica (Next 16.3.0: RCE GHSA-p293-qw3h-jr36 + RCE no otimizador de imagem AVIF; fix ≥16.3.6), 3 high (js-yaml, nanoid, sharp), 2 moderate (@vitest/mocker)** | R-1 |
| 14.10 | XSS | PARCIAL | React escapa por padrão; parser RSS sanitiza entidades e bloqueia DOCTYPE/ENTITY (XXE-safe por design); **risco baixo atual** | — |
| 14.11 | Headers de segurança / CSP / CORS | NÃO IMPLEMENTADO | `next.config.ts` vazio (sem `headers()`) | R-10 |
| 14.12 | SSRF | PARCIAL | URL do RSS configurável por env (server-side, alvo fixo); sem input de URL do usuário | R-10 |
| 14.13 | Política de incidentes, backups testados, nenhuma chave em testes | NÃO IMPLEMENTADO | Testes usam fixture local (correto) | R-10 |

## 15. Acessibilidade (§15) — meta WCAG 2.2 AA

| # | Item | Status | Evidência | Fase |
|---|---|---|---|---|
| 15.1 | Navegação por teclado | PARCIAL | Links/botões nativos; `Card` clicável tem `tabIndex`+`Enter/Space` (`Card.tsx:19-20`); **sem skip-link**; painel de notificação sem focus trap | R-1 |
| 15.2 | Leitores de tela | PARCIAL | `aria-label` em nav/botões/search; landmarks ok | **Defeito:** `Badge` usa `role="status"` para todo badge — badges não são live regions; polui anúncios e causou violação de strict mode no E2E (`official-alerts.spec.ts:16`) | R-1 |
| 15.3 | Contraste | PARCIAL | Paleta com soft-bg + dark-text; não auditado com ferramenta (axe/Lighthouse ainda não rodam no CI) | R-1 |
| 15.4 | Textos redimensionáveis / zoom | PARCIAL | Sem `user-scalable=no`; não validado em 200% | R-1 |
| 15.5 | Alerta não só por cor | IMPLEMENTADO | Badges com texto, ícones; E2E cobre (`console-accessibility.spec.ts:257`) | — |
| 15.6 | Vibração e som configuráveis | NÃO IMPLEMENTADO | — | R-7 |
| 15.7 | Linguagem simples | PARCIAL | pt-BR claro; alguns textos técnicos ("sincronizado em") | R-1 |
| 15.8 | Libras (futuro) | FORA DE ESCOPO ATUAL | Doc: "futuramente" | Posterior |
| 15.9 | Leitura em voz alta | NÃO IMPLEMENTADO | — | R-7+ |
| 15.10 | Modo baixa conectividade | NÃO IMPLEMENTADO | — | R-7 |
| 15.11 | Testes axe-core | NÃO IMPLEMENTADO | Suíte E2E manual boa, sem axe | R-1 |

## 16. Observabilidade (§16)

| # | Item | Status | Evidência | Fase |
|---|---|---|---|---|
| 16.1 | Uptime / latência / erro por rota | PARCIAL | `SourceHealth.latencyMs` só da fonte; nada por rota | R-10 |
| 16.2 | Fila, atraso de dados, notificações enviadas/entregues, tempo detecção→alerta | NÃO IMPLEMENTADO | — | R-3/R-7 |
| 16.3 | Saúde do banco / Redis | NÃO IMPLEMENTADO | Não existem | R-3 |
| 16.4 | Dashboards e alertas operacionais | NÃO IMPLEMENTADO | — | R-10 |
| 16.5 | Correlation ID | NÃO IMPLEMENTADO | Logs via `console.*` com prefixo `[INMET]`/`[/api/...]` | R-2 |
| 16.6 | Auditoria separada de logs técnicos | NÃO IMPLEMENTADO | — | R-3 |
| 16.7 | Health endpoint | IMPLEMENTADO | `/api/health` (200 healthy/degraded; 503 quando fonte OFFLINE) — **nota:** em modo `mock` sempre "healthy" (health do MockProvider é fixo ONLINE) | — |
| 16.8 | Source health | IMPLEMENTADO | `/api/sources/status` (1 fonte; memória; reseta a cada rebuild/restart) | R-3 |

## 17–19. Estratégia, critérios de fase e regras para agentes (§17–19)

| Item | Status |
|---|---|
| FASE 0 (fundação: monorepo, Docker, banco, Redis, CI, auth, health, tokens, shell, testes) | PARCIAL — shell/tokens/testes/health existem; monorepo/Docker/banco/Redis/CI/auth não |
| FASE 1 (MVP visual demonstrável, dados simulados rotulados) | PARCIAL — telas existem com rotulagem; PWA/responsividade/acessibilidade iniciais incompletas |
| FASE 2 (domínio real: PostGIS, territórios, estações, observações, alertas, abrigos, ocorrências, API, auditoria) | NÃO IMPLEMENTADO |
| FASE 3 (primeira integração oficial: conector hidrológico + meteorológico, normalização, health, cache, agendamento) | PARCIAL — conector meteorológico (INMET) existe e está quebrado; conector hidrológico não |
| FASE 4–7 (motor de risco, notificações, operação municipal, tsunami) | NÃO IMPLEMENTADO |
| Critérios de conclusão de fase (§18) | Processo adotado nesta auditoria (baseline + relatório + sem commit) |
| Regras para Claude/Ruflo (§19: ler doc antes, não reescrever arquitetura, fases pequenas, sem commit sem autorização, fakes determinísticos, não afirmar sem validar) | SEGUIDAS nesta execução |

## 20. Identidade visual (§20)

| Item | Status | Evidência |
|---|---|---|
| Paleta (navy, azul vivo, vermelho, laranja, amarelo, verde-água), cartões claros, bordas suaves, mapa central, ícones simples | IMPLEMENTADO | `globals.css` design tokens `--color-hydro-*`; componentes `Card`/`Badge`/`Button` coerentes; lucide-react |
| Slogan/nome | IMPLEMENTADO | `layout.tsx` metadata |
| Não copiar marcas da referência | IMPLEMENTADO | Componentes originais |

## 21. Primeiro objetivo executável (§21)

| Item | Status |
|---|---|
| Frontend web com dashboard responsivo, mapa, cards, alertas simulados, abrigos simulados, testes, documentação | PARCIAL (feito com lacunas acima) |
| Backend, PostgreSQL/PostGIS, Redis, Docker Compose, health checks | NÃO IMPLEMENTADO (health checks de fonte existem) |

---

## Apêndice A — Inventário de rotas auditadas (§4 do plano RECOVERY-0)

Build de produção gera 12 rotas (7 páginas + 4 API + not-found):

| Rota | Carrega | Console | E2E | Dado | Observações |
|---|---|---|---|---|---|
| `/` | ✅ | ❌ erro de hidratação (`LastUpdate`) | 1 teste falha (banner) | Misto: INMET oficial (quando `official`) + mocks | Seção oficial some no modo mock e mostra "indisponível"; `RiskGauge` hardcoded |
| `/mapa` | ✅ | ✅ limpo | ✅ | Mock | **Marcadores invisíveis no estado inicial**; "Todos" no-op; `OriginFilter`/`MapDetailPanel` mortos; sem camadas chuva/rios/ocorrências/hospitais/evacuação; sem busca; sem alternativa textual |
| `/alertas` | ✅ | ✅ | ✅ (com fallback) | Misto | Modo duplo oficial/mock; filtros funcionam; eventos INMET não mapeados nos filtros; severidade 4 ausente no mapa oficial |
| `/alertas/[id]` | ✅ | ❌ 2× `404` de resource no ID inválido (comportamento esperado, teste é estrito) | 4 testes falham | Misto | Detalhe oficial **sem** Estou seguro / Preciso de ajuda / instruções / contatos / confirmação de leitura; fallback mock ok; estado "não encontrado" ok |
| `/abrigos` | ✅ | ✅ | ✅ | Mock | Busca/filtros ok; "Ver no mapa"/"Traçar rota" = `alert()` rotulado; `hasFood`/`lastUpdate` não exibidos; contato sem `tel:` |
| `/ocorrencias` | ✅ | ✅ | ✅ | Client-side | Sem persistência/foto real/GPS/anônimo/consentimento |
| `/tsunami` | ✅ | ✅ | ✅ | Estático educativo | Status "Normal" fixo de 4 cidades (rotulado simulado); nenhuma fonte oficial |
| `/api/alerts` | ✅ | — | indireto | Provider | Funciona; em `official` devolve `[]` (parser quebrado); em `mock` devolve 12 alertas |
| `/api/alerts/[id]` | ✅ | — | indireto | Provider | 404 correto |
| `/api/health` | ✅ | — | — | — | Em mock sempre healthy; em official 503 quando OFFLINE (comportamento correto pós-fix) |
| `/api/sources/status` | ✅ | — | — | — | Só a fonte de alerta; single-source |
| `/_not-found` | ✅ | — | — | — | Default Next |

## Apêndice B — Inventário de elementos interativos (§5 do plano RECOVERY-0)

| Componente | Local | Ação esperada | Ação atual | Status | Correção necessária |
|---|---|---|---|---|---|
| Links sidebar (6) | `Sidebar` | Navegar | Navegam | ✅ OK | — |
| Busca sidebar | `Sidebar` | Buscar algo | Input filtra **nada** (estado local órfão) | ❌ MORTO | Conectar a busca global ou remover/rotular |
| Sino notificações (×2) | Sidebar/MobileHeader | Abrir centro | Abre | ✅ OK | — |
| Fechar centro / marcar lidas / limpar | `NotificationCenter` | Gerenciar | Funcionam (localStorage) | ✅ OK | Posicionamento `absolute` sem ancestral `relative` — painel não ancora no sino (verificar visualmente) |
| Item de notificação com link | `NotificationCenter` | Navegar ao alerta/abrigo/incidente | **Links para rotas inexistentes** (`/alerts/...`, `/shelters/...`, `/incidents/...`) → 404 | ❌ QUEBRADO | Corrigir mocks para `/alertas/[id]`, `/abrigos` |
| Abas nav mobile (4) | `MobileNav` | Navegar | Navegam | ✅ OK | — |
| Botão SOS (mobile + desktop) | `MobileNav`/`SOSButton` | Ligar 192 | `alert()` rotulado "Simulado" | ⚠️ SIMULADO | Trocar por `tel:192` (R-1) |
| "Mais" (mobile) | `MobileNav` | Abrir dropdown | Abre; 2 links funcionam | ✅ OK | Fechar com Esc/fora ok por overlay |
| Filtros de severidade (alertas) | `AlertFilters` | Filtrar | Filtram (oficial 0–3) | ✅ OK | Mapear nível 4 |
| Filtro de tipo (alertas) | `AlertFilters` | Filtrar | Filtra mocks; tipos INMET ausentes | ⚠️ PARCIAL | Adicionar `storm`, `gale`, `frost` etc. |
| Busca de alertas | `/alertas` | Filtrar por texto | Funciona | ✅ OK | — |
| Cards de alerta | Dashboard/Alertas | Abrir detalhe | Navegam | ✅ OK | — |
| Estou seguro / Preciso de ajuda | `AlertDetail` (mock) | Registrar | `alert()` rotulado | ⚠️ SIMULADO | Ausentes no detalhe oficial — restaurar ação com rótulo correto |
| Compartilhar | Detalhes | Copiar link | Oficial: `alert('Link copiado')` **sem copiar**; mock: `alert()` rotulado | ❌ QUEBRADO | Usar `navigator.clipboard`/Web Share |
| Ver na fonte | Detalhe oficial | Abrir INMET | `window.open` externo | ✅ OK | — |
| Botão "Todos" (mapa) | `MapFilters` | Resetar filtros | **No-op**; nunca ativo | ❌ QUEBRADO | Corrigir lógica `'all'` (page + component + RiskMap) |
| Filtros de evento (mapa) | `MapFilters` | Ligar/desligar camada | Funcionam **após** clique; estado inicial esconde tudo | ❌ QUEBRADO (inicial) | Ver 6.3.1 |
| Ver no mapa / Traçar rota (abrigo) | `ShelterCard` | Mapa/rota | `alert()` rotulado | ⚠️ SIMULADO | Linkar `/mapa` com param / deep-link |
| Busca + filtros de status (abrigos) | `ShelterList` | Filtrar | Funcionam | ✅ OK | Adicionar "Desconhecido" |
| Form ocorrência (7 campos + submit) | `IncidentForm` | Registrar | Valida 2 campos; sucesso client-side | ⚠️ PARCIAL | Anônimo, consentimento, foto, GPS |
| Área de foto | `IncidentForm` | Anexar mídia | `alert()` rotulado | ⚠️ SIMULADO | R-2 |
| "Registrar outra ocorrência" | `IncidentSuccess` | Resetar | Funciona | ✅ OK | — |
| Busca (RiskMap zoom/pan) | `RiskMap` | Explorar | Funciona (Leaflet) | ✅ OK | — |

**Regra violada encontrada:** nenhum botão "não faz nada" silenciosamente — os problemas são: 1 no-op real ("Todos" do mapa), 1 busca órfã (sidebar), 1 feedback falso (Compartilhar oficial), 3 links 404 (notificações), e N ações simuladas — todas rotuladas, exceto o Compartilhar oficial.

## Apêndice C — Baseline de testes (2026-09-24, sem nenhuma correção)

| Verificação | Resultado | Detalhe |
|---|---|---|
| `npm run lint` | ❌ **FALHA** | 2 erros `react-hooks/set-state-in-effect` (`useOfficialAlerts.ts:53,70`) + 5 warnings de variável não usada (`health/route.ts:32`, `OfficialBadge.tsx:11`, `inmet-provider.ts:92,180`, `mock-provider.ts:14`) |
| `npx tsc --noEmit` | ✅ PASSA | Sem erros de tipo |
| `npm run test` (Vitest) | ❌ **77/87 passam, 10 falham** (3 arquivos) | Causa-raiz 1: regex quebrada em `rss-parser.ts:179-180` (derruba 6 testes de parser + 3 de provider). Causa-raiz 2: texto do `DemoBanner` mudou e `DemoBanner.test.tsx:8` não foi atualizado (1 teste) |
| `npm run build` | ✅ PASSA | 12 rotas; Next 16.3.0 Turbopack; 9 páginas estáticas + 4 dinâmicas |
| `npx playwright test` | ❌ **59/67 passam, 8 falham** | (a) 4 falhas por texto do `DemoBanner` alterado sem atualizar specs (`app.spec.ts:6,39`, `console-accessibility.spec.ts:159`, `official-alerts.spec.ts:16` — esta última por strict mode: `Badge role="status"` duplica o `getByRole('status')`); (b) 2 falhas: botões "Estou seguro"/"Preciso de ajuda" ausentes no detalhe (troca `AlertDetail`→`OfficialAlertDetail`); (c) 1 falha: "Compartilhar" não contém "Simulado" (agora `alert('Link copiado...')` sem copiar); (d) 1 falha: console com 2× resource 404 no ID inválido (teste exige zero erros de console); (e) **erro de hidratação real** capturado em `LastUpdate.tsx:21` (data server≠client) |
| `npm audit` | ❌ **6 vulnerabilidades** | **Crítica:** next 16.3.0 (2× RCE; fix `next@16.3.6`). High: js-yaml, nanoid, sharp. Moderate: @vitest/mocker (vitest 4→5 breaking) |
| Rotas quebradas | 3 links nos mocks | `/alerts/*`, `/shelters/*`, `/incidents/*` (`mocks/notifications.ts`) |
| Warnings de runtime | 1 | Hydration mismatch (dashboard) |

## Apêndice D — Ambiente

| Item | Valor |
|---|---|
| Projeto | `/home/uchoa/Downloads/evelyn` (confirmado) |
| Branch / remotes | `main`; `origin https://github.com/Kauanlifkn/Evelyn.git` |
| Git status | 6 arquivos modificados + 11 novos (integração INMET não commitada); 112 arquivos rastreados |
| Node / npm / git / Docker | v22.23.0 / 10.9.8 / 2.53.0 / 29.6.0 (pnpm ausente) |
| `.env.local` | **Inexistente** → `ALERT_DATA_MODE` efetivo = `mock` (default do código), embora `.env.example` documente `official` |
| Feed INMET | UP em 2026-09-24 (HTTP 200, 140 KB, 1,3 s) |
| Next.js | 16.3.0 — **versão com mudanças breaking; guias em `node_modules/next/dist/docs/` são obrigatórios antes de codar (AGENTS.md)** |

---

## Apêndice E — Delta RECOVERY-1 (2026-09-25)

Itens corrigidos na fase RECOVERY-1. Cada linha refere-se a uma seção da matriz acima ou do HIDRO-ALERTA.md.

### Integração INMET (§9.1): QUEBRADO → IMPLEMENTADO

- **Parser:** regex reconstruída com escape correto ([rss-parser.ts](../src/server/lib/rss-parser.ts)); tags sanitizadas antes de montar `RegExp`.
- **NOVO BUG REAL CORRIGIDO:** o feed ao vivo mudou de tabela markdown (`| Chave | Valor |`) para **tabela HTML** dentro do CDATA (`<tr><th>Status</th><td>…`). O `description` bruto agora é preservado (`descriptionRaw`) para extração de campos antes da sanitização. Ambos os formatos são suportados (testes para os dois).
- **Validação real (2026-09-25, produção, modo official):** HTTP 200, `application/rss+xml`, 124 KB, ~700 ms, 72 itens — **10 ativos** / 62 expirados, 72/72 com áreas, severidades mapeadas (Grande Perigo 3, Perigo 19, Perigo Potencial 50), eventos traduzidos. `/api/alerts` retornou 10 alertas oficiais (`isOfficial: true`); `/api/health` ONLINE; 404 correto por ID inválido.
- **Resiliência:** retry único com backoff para falhas transientes (5xx/429/timeout/rede); sem retry para 4xx e erro de parse; falha nunca vira mock.

### Honestidade de dados (§1/§2, §11/§12 do plano): corrigido

- `MockProvider` agora emite `isOfficial: false` / `isSimulated: true` / `sourceType: 'DEMO'` — **nenhum mock pode exibir badge OFICIAL** (era `isOfficial: true`).
- Tipo `OfficialAlert` ampliado (`isOfficial: boolean; isSimulated: boolean`).
- Dashboard modo mock exibe alertas simulados rotulados; modo official com fonte OFFLINE exibe "FONTE INDISPONÍVEL — isso não significa ausência de risco" + telefones de emergência.
- Banner global moveu-se para o layout (server) e reflete o modo: mock → "nenhum alerta exibido é real"; official → "alertas do INMET são oficiais; demais módulos podem conter dados simulados".

### Mapa (§6.3): itens 6.3.1/6.3.2/6.3.7/6.3.15 QUEBRADO → corrigido

- Contrato de filtros redefinido (`src/lib/map-filters.ts`): `[]` = tudo visível; sentinel `'all'` removido.
- Marcadores visíveis no carregamento inicial; botão "Todos" reseta e fica ativo; `aria-pressed` nos filtros.
- **6.3.22 alternativa textual do mapa: IMPLEMENTADO** (`MapSummary`) — lista textual sincronizada com os filtros.
- Ícones de marcador movidos de unpkg para local (`public/leaflet/`) — única chamada externa restante é o tile OSM.

### Tela de alerta (§6.4): 6.4.3/6.4.12/6.4.14/6.4.15 → IMPLEMENTADO (local/honesto)

- Compartilhar copia de verdade (`navigator.clipboard` + fallback `execCommand`), com estados sucesso/erro/indisponível — nunca mente.
- "Estou seguro": confirmação persistida apenas no dispositivo, rotulada **LOCAL**.
- "Preciso de ajuda": modal com telefones oficiais (192/193/199/190) via `tel:` e aviso de que o envio digital não está conectado (o `Modal`, antes código morto, agora é usado).
- Tipo de evento traduzido (inclui novos: `heat`→Onda de Calor etc.).

### Outros fechamentos (§6/§7/§15/§16/§19 do plano RECOVERY-0)

| Item | Antes | Agora |
|---|---|---|
| Hidratação (6.1.8) | QUEBRADO | **[R1 ✅]** Placeholder estável + formatação pós-mount com TZ fixa; regressão unitária (`renderToString`) |
| Notificações (links 404) | QUEBRADO | **[R1 ✅]** Links corrigidos p/ `/alertas/[id]`, `/abrigos`, `/ocorrencias` + testes unit/E2E |
| Busca da sidebar | MORTA | **[R1 ✅]** Busca funcional (páginas/alertas/abrigos) com teclado (↑↓/Enter/Esc) e mouse |
| Abrigos 6.6.3/6.6.4/6.6.6 | PARCIAL | **[R1 ✅]** Alimentação exibida; contato `tel:` com fallback sem telefone; última atualização exibida |
| Ocorrências 6.5.9/6.5.10 | AUSENTE | **[R1 ✅]** Anônimo opcional + consentimento LGPD obrigatório + loading + sucesso LOCAL honesto (§6.5 persistência segue para R-2) |
| Tsunami 4.9 | SIMULADO c/ falso "Normal" | **[R1 ✅]** "Sem dados oficiais" (neutro) — não afirma segurança nem risco; educativo rotulado |
| Badge `role="status"` (15.2) | Defeito | **[R1 ✅]** Removido; live regions só onde legítimo; axe-core 9/9 sem violações críticas/serious |
| Skip-link / foco (15.1) | AUSENTE | **[R1 ✅]** Skip link + restauração de foco no painel de notificações |
| Lint (§21) | 2 erros/5 warnings | **[R1 ✅]** 0/0 |
| Next vulnerabilidade crítica (14.9) | 16.3.0 (RCE) | **[R1 ✅]** 16.3.6; audit 0 critical/0 high (2 moderate: corrente vitest, correção exige v5 breaking — documentado) |
| Testes | 77/87 + 59/67 | **[R1 ✅]** 140/140 unit + 83/83 E2E (axe incluído; E2E força `ALERT_DATA_MODE=mock` para hermeticidade) |

### Pendências conhecidas (não escopo de R-1)

- `/api/health` é passivo (não dispara fetch); aquecer com uma chamada a `/api/alerts` — refinar na R-2.
- `OriginFilter` (componente de filtro de origem) e `MapDetailPanel` permanecem não renderizados (código morto listado; remoção/uso exige aprovação).
- `useMediaQuery`, `useReducedMotion` permanecem sem uso (código morto listado).
- Eventos do INMET sem tradução específica caem no slug honesto (ex.: futuros tipos novos) — mapa de eventos cresce por fonte na R-4.
