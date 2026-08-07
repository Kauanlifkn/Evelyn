# Hidro Alerta — Informação certa salva vidas

Plataforma de prevenção, monitoramento e resposta a desastres naturais.

> **Atenção:** Este é um ambiente de **demonstração** com **dados 100% simulados**. Nenhum alerta exibido é real.

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3001](http://localhost:3001) no navegador.

## Testes

```bash
# Unit tests (Vitest)
npm run test

# Testes E2E (Playwright)
npx playwright install    # primeira vez
npm run test:e2e

# Type checking
npm run typecheck

# Lint
npm run lint
```

## Build de produção

```bash
npm run build
npm start
```

Acesse [http://localhost:3001](http://localhost:3001).

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Dashboard principal |
| `/mapa` | Mapa de risco interativo |
| `/alertas` | Central de alertas |
| `/alertas/[id]` | Detalhes de um alerta |
| `/abrigos` | Lista de abrigos |
| `/ocorrencias` | Relatar ocorrência |
| `/tsunami` | Riscos costeiros e tsunami |

## Mapa

O mapa interativo utiliza **OpenStreetMap** via [Leaflet](https://leafletjs.com/) e [react-leaflet](https://react-leaflet.js.org/).

- **Atribuição:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- O carregamento do Leaflet é feito exclusivamente no cliente (SSR desabilitado) porque a biblioteca depende de APIs do navegador (`window`, `document`).

## Dados

Todos os dados exibidos são **simulados** (mocks):

- Alertas, abrigos, ocorrências, rios, previsão climática, áreas de risco, notificações, usuário e cidades

Todo dado de domínio simulado inclui o campo `isSimulated: true`.

## Limitações (fase atual)

- Não há backend; todos os dados são estáticos e definidos no código-fonte
- Não há autenticação real; o usuário é simulado
- O mapa não carrega dados em tempo real
- O formulário de ocorrências simula o envio sem persistência
- O botão SOS exibe um alerta informativo (em produção, ligaria para emergência)
- Notificações são persistidas via `localStorage` e não sincronizam com servidor
- A funcionalidade de tsunami exibe apenas conteúdo educativo e status demonstrativo

## Como abrir rapidamente no Linux

```bash
./abrir-hidro-alerta.sh
```

O script instala dependências (se necessário), inicia o servidor e abre o navegador automaticamente.

## Porta

O servidor roda na **porta 3001** (configurada em `package.json`).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Leaflet + react-leaflet
- Vitest + Playwright
