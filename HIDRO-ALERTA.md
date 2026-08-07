HIDRO ALERTA — Documento Oficial do Sistema

Versão: 0.1Data: 06/08/2026Status: Arquitetura inicial aprovada para começar o desenvolvimentoReferência visual: imagem enviada pelo idealizador, com dashboard web, aplicativo móvel, mapa de risco, alertas e abrigos.

1. Visão do produto

O Hidro Alerta será uma plataforma digital de prevenção, monitoramento e resposta a desastres naturais, inicialmente focada no Brasil.

A plataforma deverá:

avisar sobre risco e ocorrência de inundação, alagamento e enchente;

acompanhar níveis de rios, chuva acumulada e previsão meteorológica;

mostrar áreas de risco em um mapa interativo;

avisar sobre risco de tsunami, ressaca, maré de tempestade e ondas perigosas;

indicar abrigos, hospitais, rotas seguras e pontos de apoio;

permitir que cidadãos enviem ocorrências com foto, localização e descrição;

oferecer um painel operacional para Defesa Civil, prefeituras e administradores;

funcionar como PWA e, futuramente, como aplicativo Android e iOS;

continuar exibindo informações essenciais mesmo com conexão instável.

Regra de segurança: o sistema não deve inventar alertas oficiais. Avisos de tsunami, evacuação e emergência deverão ser identificados como oficiais, preditivos ou comunitários. Alertas oficiais sempre terão prioridade máxima.

2. Princípios obrigatórios

Salvar vidas é mais importante que aumentar engajamento.

Toda informação deve mostrar fonte, horário e nível de confiança.

Nenhuma previsão automática deve ser apresentada como certeza.

Alertas críticos precisam de trilha de auditoria.

Acessibilidade e simplicidade são obrigatórias.

O sistema deve degradar com segurança quando uma fonte externa falhar.

Dados pessoais e localização devem seguir a LGPD.

Toda alteração crítica deve possuir testes automatizados.

O mapa nunca poderá ser a única forma de transmitir um alerta.

A plataforma deve distinguir enchente, inundação, alagamento, enxurrada, deslizamento, tsunami, ressaca e maré de tempestade.

3. Públicos do sistema

3.1 Cidadão

consulta a situação da região;

recebe alertas por localização;

acompanha rios e chuva;

encontra abrigos e rotas;

envia ocorrência;

solicita ajuda;

cadastra familiares e locais importantes;

ativa modo de acessibilidade;

baixa um plano familiar de emergência.

3.2 Voluntário

visualiza solicitações autorizadas;

informa disponibilidade;

recebe missão;

registra atendimento;

não acessa dados além do necessário.

3.3 Operador municipal

acompanha mapa e sensores;

valida ocorrências;

gerencia abrigos;

publica comunicados;

acompanha recursos e equipes;

registra decisões operacionais.

3.4 Administrador

configura territórios;

gerencia usuários e permissões;

cadastra integrações;

acompanha auditoria;

ajusta regras de risco;

gerencia templates de notificação.

3.5 Analista

acompanha séries históricas;

compara eventos;

gera relatórios;

avalia qualidade dos dados;

analisa desempenho das regras e modelos.

4. Tipos de evento monitorados

Prioridade do MVP

chuva intensa;

alagamento;

inundação;

enchente de rios;

enxurrada;

deslizamento associado à chuva;

rompimento ou risco de barragem, apenas com fonte autorizada;

ressaca e ondas costeiras;

tsunami, somente com integração a fontes oficiais;

seca severa e risco hídrico, em fase posterior;

incêndio florestal, em fase posterior;

vendaval, granizo e tempestades severas.

5. Classificação dos alertas

Severidade

Nível

Nome

Cor

Significado

0

Informativo

Azul

Informação sem risco imediato

1

Atenção

Amarelo

Condições favoráveis ao evento

2

Perigo

Laranja

Evento provável ou em evolução

3

Perigo extremo

Vermelho

Risco grave, ação imediata

4

Emergência

Roxo

Evacuação, resgate ou ameaça à vida

Origem

OFFICIAL: emitido por órgão oficial;

SENSOR: derivado de sensor validado;

MODEL: resultado de regra ou modelo preditivo;

OPERATOR: emitido por operador autorizado;

COMMUNITY: ocorrência enviada pela comunidade;

PARTNER: fonte institucional parceira.

Estado

rascunho;

em validação;

ativo;

atualizado;

encerrado;

cancelado;

falso positivo confirmado.

6. Funcionalidades do aplicativo do cidadão

6.1 Tela inicial

Inspirada na imagem de referência:

saudação;

localização atual;

cartão do alerta mais importante;

ações rápidas;

previsão do dia;

navegação inferior;

indicador de conexão;

último horário de atualização.

6.2 Ações rápidas

ver alertas;

localizar abrigo;

relatar alagamento;

solicitar ajuda;

compartilhar localização;

ligar para emergência;

abrir plano familiar;

confirmar que está seguro.

6.3 Mapa de risco

Camadas:

alertas ativos;

áreas suscetíveis;

chuva;

rios e estações;

nível de rios;

ocorrências comunitárias;

abrigos;

hospitais;

rotas interditadas;

rotas de evacuação;

pontos de encontro;

câmeras públicas autorizadas;

áreas costeiras e risco marítimo;

localização do usuário.

Recursos:

filtros por evento e severidade;

legenda;

agrupamento de marcadores;

atualização em tempo quase real;

cache offline das áreas favoritas;

pesquisa por cidade, bairro, rua ou CEP;

modo de alto contraste;

descrição textual alternativa do mapa.

6.4 Tela de alerta

título direto;

severidade;

evento;

local afetado;

fonte;

início e validade;

instruções;

áreas afetadas;

mapa;

evolução do risco;

contatos;

botão para compartilhar;

botão para confirmar leitura;

botão “estou seguro”;

botão “preciso de ajuda”.

6.5 Relatar ocorrência

Campos:

tipo;

foto ou vídeo;

descrição;

localização;

profundidade aproximada da água;

via bloqueada;

pessoas em risco;

horário;

envio anônimo opcional;

consentimento de uso.

Proteções:

remoção de metadados desnecessários;

limite de arquivos;

moderação;

detecção de duplicidade;

reputação de fonte;

nunca publicar dados pessoais de vítimas.

6.6 Abrigos

nome;

endereço;

distância;

capacidade total;

vagas estimadas;

acessibilidade;

aceita animais;

alimentação;

atendimento médico;

contato;

rota sugerida;

última atualização;

status aberto, lotado, fechado ou desconhecido.

6.7 Família e locais importantes

familiares;

casa;

escola;

trabalho;

parentes;

locais favoritos;

alertas por raio;

confirmação de segurança;

contatos de emergência.

7. Painel web operacional

7.1 Dashboard

Seguir o padrão visual da imagem:

nível do rio;

previsão de chuva;

pessoas potencialmente expostas;

abrigos ativos;

mapa em destaque;

alertas recentes;

abrigos próximos;

medidor geral de risco;

atualização em tempo real.

7.2 Central de alertas

criação e edição;

fluxo de aprovação;

seleção geográfica;

templates;

pré-visualização;

disparo multicanal;

cancelamento;

histórico;

confirmação de entrega;

auditoria completa.

7.3 Central de ocorrências

fila de validação;

comparação por proximidade;

mapa;

mídia;

prioridade;

atribuição a operador;

conversão em incidente;

vínculo com alerta existente.

7.4 Gestão de abrigos

cadastro;

capacidade;

ocupação;

necessidades;

responsáveis;

disponibilidade;

acessibilidade;

animais;

estoque;

check-in opcional.

7.5 Pessoas e áreas expostas

A estimativa deve ser apresentada como estimativa, nunca como contagem exata.

população estimada na área;

escolas;

hospitais;

instituições de longa permanência;

zonas vulneráveis;

infraestrutura crítica.

7.6 Relatórios

alertas emitidos;

tempo até publicação;

entregas por canal;

confirmações de leitura;

ocorrências;

falsos positivos;

disponibilidade das fontes;

abrigos;

evolução do evento;

exportação CSV e PDF.

8. Ideias adicionais aprovadas

8.1 Modo Guardião

O usuário acompanha familiares e recebe informação quando:

um familiar entra em área de risco;

um alerta afeta um local salvo;

o familiar confirma estar seguro;

há solicitação de ajuda autorizada.

8.2 Plano familiar de emergência

contatos;

ponto de encontro;

medicamentos;

animais;

documentos;

mochila de emergência;

rota primária e alternativa;

versão offline.

8.3 Modo escola

responsáveis;

alunos presentes;

confirmação de retirada;

comunicação em massa;

pontos de encontro;

simulações.

8.4 Modo comunidade

líderes locais;

sirenes comunitárias;

voluntários;

pessoas com mobilidade reduzida, mediante consentimento;

pontos de apoio;

comunicados locais.

8.5 Alertas por múltiplos canais

push;

SMS;

WhatsApp, mediante provedor e consentimento;

e-mail;

notificação web;

sirene ou dispositivo parceiro;

feed CAP;

ligação automática em fase futura.

8.6 Rotas seguras

A rota deverá considerar:

vias bloqueadas;

áreas inundadas;

pontes;

relevo;

alertas ativos;

sentido de evacuação;

atualização e validade.

Uma rota sugerida nunca deve prometer segurança absoluta.

8.7 Modo offline

alertas recentes;

contatos;

plano familiar;

abrigos salvos;

instruções;

mapas previamente baixados;

horário da última sincronização.

9. Fontes de dados planejadas

Brasil

CEMADEN;

ANA/SNIRH/HidroWeb/Hidro-Telemetria;

INMET;

Defesa Civil nacional, estadual e municipal;

CPTEC/INPE;

IBGE;

órgãos ambientais;

prefeituras e parceiros;

sensores próprios autorizados.

Tsunami e riscos costeiros

avisos oficiais nacionais;

centros de alerta reconhecidos;

UNESCO-IOC e redes regionais;

dados de nível do mar e boias autorizadas;

fontes sísmicas oficiais.

Regra de integração

Cada conector deverá possuir:

identificador da fonte;

licença e termos;

autenticação;

frequência;

timeout;

retry;

circuit breaker;

normalizador;

verificação de duplicidade;

data de coleta;

data original;

status de saúde;

documentação;

testes com dados simulados.

10. Arquitetura técnica proposta

10.1 Monorepo

hidro-alerta/
├── apps/
│   ├── web/                 # Painel web e PWA do cidadão
│   ├── api/                 # API principal
│   ├── worker/              # Coleta, regras e notificações
│   └── mobile/              # Futuro app React Native/Expo
├── packages/
│   ├── ui/
│   ├── contracts/
│   ├── config/
│   ├── database/
│   ├── maps/
│   ├── risk-engine/
│   ├── notifications/
│   ├── observability/
│   └── testing/
├── infra/
│   ├── docker/
│   ├── migrations/
│   └── monitoring/
├── docs/
│   ├── ADR/
│   ├── product/
│   ├── security/
│   ├── integrations/
│   └── runbooks/
├── scripts/
├── .github/
├── CLAUDE.md
├── RUFLO.md
└── HIDRO-ALERTA.md

10.2 Stack inicial

Frontend

Next.js;

TypeScript;

React;

Tailwind CSS;

biblioteca de componentes acessíveis;

TanStack Query;

MapLibre GL JS;

OpenStreetMap ou provedor contratado;

PWA;

Web Push.

Backend

Node.js;

TypeScript;

NestJS;

REST inicialmente;

OpenAPI;

WebSocket ou Server-Sent Events para atualizações;

validação com Zod ou class-validator.

Dados

PostgreSQL;

PostGIS;

Redis;

BullMQ;

armazenamento S3 compatível;

migrations versionadas.

Infraestrutura

Docker Compose no desenvolvimento;

CI com lint, typecheck, testes e build;

logs estruturados;

métricas;

tracing;

backups;

ambientes local, staging e produção.

11. Serviços internos

identity-service

territory-service

source-ingestion-service

observation-service

risk-engine

alert-service

incident-service

shelter-service

routing-service

notification-service

community-report-service

audit-service

file-service

analytics-service

health-service

No MVP eles poderão existir como módulos de um monólito modular. Não criar microsserviços prematuramente.

12. Modelo de dados inicial

Entidades principais:

User

Organization

Membership

Role

Territory

SavedPlace

EmergencyContact

FamilyGroup

DataSource

SourceHealth

Station

Sensor

Observation

River

Basin

WeatherForecast

HazardArea

RiskAssessment

Alert

AlertRevision

AlertArea

AlertDelivery

Incident

CommunityReport

Shelter

ShelterStatus

ShelterResource

RoadBlock

SafeRoute

Volunteer

Mission

NotificationPreference

AuditEvent

Attachment

Todas as tabelas relevantes deverão possuir:

id;

createdAt;

updatedAt;

origem;

território;

versionamento quando necessário;

índices geoespaciais;

política de retenção;

auditoria em operações críticas.

13. Motor de risco

Entrada

chuva acumulada;

previsão;

nível e vazão de rio;

velocidade de elevação;

solo;

relevo;

histórico;

maré;

ondas;

ocorrências;

alertas oficiais;

qualidade e atualidade da fonte.

Saída

type RiskAssessment = {
  hazardType: string;
  severity: 0 | 1 | 2 | 3 | 4;
  score: number;
  confidence: number;
  area: GeoJSON;
  startedAt: string;
  validUntil: string;
  reasons: RiskReason[];
  sourceRefs: string[];
  modelVersion: string;
  status: "active" | "expired" | "superseded";
};

Regras

toda avaliação deve ser explicável;

salvar razões e dados utilizados;

versionar regra e modelo;

não disparar alerta de evacuação automaticamente no MVP;

exigir aprovação humana para alertas públicos críticos não oficiais;

suportar simulação;

evitar dupla contagem;

medir falso positivo e falso negativo;

criar limites por território, pois rios e regiões são diferentes.

14. Segurança e LGPD

autenticação segura;

MFA para operadores;

RBAC;

isolamento por organização;

criptografia em trânsito e repouso;

logs de auditoria imutáveis para ações críticas;

princípio do menor privilégio;

consentimento de localização;

retenção limitada;

exclusão e anonimização;

proteção contra abuso de ocorrências;

rate limiting;

verificação de arquivos;

secrets fora do Git;

revisão de dependências;

política de incidentes;

backups testados;

nenhuma chave real em testes.

15. Acessibilidade

Meta mínima: WCAG 2.2 AA.

Obrigatório:

navegação por teclado;

leitores de tela;

contraste;

textos redimensionáveis;

alertas não dependentes somente de cor;

vibração e som configuráveis;

linguagem simples;

Libras em conteúdos essenciais futuramente;

leitura em voz alta;

modo para baixa conectividade.

16. Observabilidade

uptime;

latência;

erro por rota;

fila;

falha por fonte;

atraso de dados;

notificações enviadas;

notificações entregues;

tempo entre detecção e alerta;

saúde do banco;

saúde do Redis;

dashboards;

alertas operacionais;

correlation ID;

auditoria separada de logs técnicos.

17. Estratégia de desenvolvimento

FASE 0 — Fundação

repositório;

documentos;

monorepo;

Docker;

banco;

Redis;

CI;

autenticação inicial;

health checks;

design tokens;

shell do painel;

testes básicos.

FASE 1 — MVP visual demonstrável

landing/login;

dashboard baseado na referência;

mapa com dados simulados;

alertas simulados;

abrigos simulados;

PWA;

responsividade;

acessibilidade inicial.

FASE 2 — Domínio real

PostGIS;

territórios;

estações;

observações;

alertas;

abrigos;

ocorrências;

API;

auditoria.

FASE 3 — Primeira integração oficial

um conector hidrológico;

um conector meteorológico;

normalização;

saúde da fonte;

cache;

atualização agendada.

FASE 4 — Motor de risco

regras determinísticas;

simulação;

explicabilidade;

aprovação humana;

testes históricos.

FASE 5 — Notificações

push;

e-mail;

preferências;

geofencing;

deduplicação;

controle de frequência.

FASE 6 — Operação municipal

central de alertas;

incidentes;

ocorrências;

abrigos;

equipes;

relatórios.

FASE 7 — Riscos costeiros e tsunami

conectores oficiais;

zonas costeiras;

protocolo de aviso;

rotas de evacuação;

exercícios simulados;

revisão com especialistas.

18. Critérios de conclusão de qualquer fase

Uma fase somente poderá ser marcada como concluída quando houver:

escopo entregue;

lint aprovado;

typecheck aprovado;

testes aprovados;

build aprovado;

migrations verificadas;

documentação atualizada;

relatório de arquivos alterados;

git status conhecido;

nenhuma chave exposta;

nenhuma regressão conhecida;

revisão humana solicitada;

commit apenas após autorização do responsável.

19. Regras para Claude Code e Ruflo

Ler integralmente este arquivo antes de qualquer alteração.

Ler CLAUDE.md, RUFLO.md e ADRs existentes.

Auditar o repositório antes de criar arquivos.

Não reescrever arquitetura aprovada sem autorização.

Trabalhar em fases pequenas.

Exibir plano antes de editar.

Não executar git commit, git push, reset destrutivo ou exclusão sem autorização.

Não usar dados externos reais nos testes.

Criar fakes determinísticos.

Não afirmar que algo funciona sem executar validações.

Não começar a fase seguinte automaticamente.

Ao final, entregar relatório técnico e aguardar revisão humana.

20. Identidade visual inicial

Nome

Hidro Alerta

Slogan

Informação certa salva vidas.

Direção visual

azul-marinho para estrutura;

azul vivo para água e informação;

vermelho para emergência;

laranja para perigo;

amarelo para atenção;

verde-água para segurança e abrigo;

cartões claros;

bordas suaves;

mapa como elemento central;

ícones simples;

tipografia legível;

interface séria, moderna e confiável.

Regra visual

Não copiar marcas, mapas ou componentes protegidos da imagem de referência. Utilizar a composição como inspiração e produzir componentes originais.

21. Primeiro objetivo executável

Criar a fundação técnica e uma primeira interface visual com dados simulados, sem ainda afirmar que os alertas são reais.

A primeira entrega deverá conter:

monorepo funcional;

frontend web;

backend;

PostgreSQL/PostGIS;

Redis;

Docker Compose;

health checks;

dashboard responsivo;

mapa;

cards;

alertas simulados;

abrigos simulados;

testes;

documentação;

relatório final.

PROMPT 1 PARA O RUFLO/CLAUDE CODE — AUDITORIA E FUNDAÇÃO

Copie o prompt abaixo e envie ao Claude Code dentro da pasta escolhida para o projeto.

Você é o agente arquiteto principal do projeto HIDRO ALERTA.

OBJETIVO DESTA EXECUÇÃO
Realizar somente a FASE 0A — auditoria do ambiente, criação da documentação-base e planejamento técnico da fundação. Não implemente ainda o dashboard completo e não integre APIs externas.

FONTE OFICIAL
1. Leia integralmente o arquivo HIDRO-ALERTA.md.
2. Se existirem, leia CLAUDE.md, RUFLO.md, README.md, package.json, arquivos de workspace, Docker, Git e documentação.
3. O arquivo HIDRO-ALERTA.md é a fonte oficial atual da arquitetura e do comportamento do sistema.
4. Não contradiga esse arquivo silenciosamente. Registre divergências e peça aprovação.

REGRAS DE SEGURANÇA
- Não execute git commit.
- Não execute git push.
- Não execute reset destrutivo.
- Não apague arquivos existentes.
- Não altere chaves ou credenciais.
- Não use segredos reais.
- Não instale dependências globalmente.
- Não comece outra fase.
- Não declare sucesso sem provas.
- Dados de alertas deverão ser marcados como simulados nesta etapa.

TAREFAS
1. Identifique:
   - caminho absoluto do projeto;
   - sistema operacional;
   - versões de Node, npm, pnpm, Docker e Git;
   - estado do Git;
   - branch atual;
   - remotes;
   - arquivos existentes;
   - portas ocupadas relevantes;
   - ferramentas disponíveis.
2. Verifique se a pasta está vazia ou contém outro projeto.
3. Proponha a estrutura monorepo mais segura para:
   - apps/web;
   - apps/api;
   - apps/worker;
   - packages/ui;
   - packages/contracts;
   - packages/database;
   - packages/config;
   - packages/testing;
   - infra;
   - docs.
4. Proponha versões compatíveis e estáveis de:
   - Node;
   - pnpm;
   - Next.js;
   - NestJS;
   - TypeScript;
   - PostgreSQL/PostGIS;
   - Redis;
   - Prisma ou Drizzle.
5. Compare Prisma e Drizzle para este projeto e escolha um, justificando principalmente:
   - PostGIS;
   - migrations;
   - tipagem;
   - manutenção;
   - testes;
   - consultas geoespaciais.
6. Crie ou atualize somente documentação, após mostrar o plano:
   - README.md;
   - CLAUDE.md;
   - RUFLO.md;
   - docs/ARCHITECTURE.md;
   - docs/ROADMAP.md;
   - docs/SECURITY.md;
   - docs/ADR/0001-monorepo.md;
   - docs/ADR/0002-database-and-postgis.md;
   - docs/ADR/0003-modular-monolith.md;
   - docs/ADR/0004-map-stack.md.
7. Não crie código de produção nesta execução.
8. Não instale dependências nesta execução.
9. Execute verificações finais adequadas para documentos.
10. Entregue um relatório final.

FORMATO DO PLANO ANTES DE ALTERAR
- Estado encontrado
- Riscos
- Arquivos que serão criados ou alterados
- Decisões propostas
- Comandos pretendidos
- O que não será feito
- Aguarde autorização humana antes de editar

FORMATO DO RELATÓRIO FINAL
1. Resumo executivo
2. Caminho e estado do repositório
3. Arquivos criados/alterados
4. Decisões arquiteturais
5. Divergências ou dúvidas
6. Validações executadas e resultados
7. Git status
8. Próxima fase recomendada
9. Frase final exata:
   FASE 0A CONCLUÍDA — PRONTO PARA REVISÃO HUMANA

IMPORTANTE
Primeiro faça a auditoria e apresente o plano. Não edite nada até receber autorização humana.

22. Próximo prompt previsto

Depois da aprovação humana da FASE 0A, a próxima etapa será a FASE 0B — scaffold do monorepo, Docker, banco, Redis, CI e health checks.

Não iniciar a FASE 0B antes de revisar o relatório da FASE 0A.