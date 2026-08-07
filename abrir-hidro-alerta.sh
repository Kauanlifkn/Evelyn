#!/usr/bin/env bash
# abrir-hidro-alerta.sh — Atalho local para abrir o Hidro Alerta no Linux

set -euo pipefail

PROJECT_DIR="/home/uchoa/Downloads/evelyn"
PORT=3001
URL="http://localhost:$PORT"

cd "$PROJECT_DIR"
echo "✔ Diretório: $PROJECT_DIR"

# 1. Verifica node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 node_modules não encontrado. Instalando dependências..."
  npm install
  echo "✔ Dependências instaladas."
else
  echo "✔ Dependências já instaladas."
fi

# 2. Verifica se a porta 3001 já está em uso pelo Hidro Alerta
if lsof -i :"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "✔ Hidro Alerta já está rodando na porta $PORT."
else
  echo "🚀 Iniciando servidor de desenvolvimento..."
  npm run dev >/dev/null 2>&1 &
  DEV_PID=$!

  # Aguarda o servidor responder
  echo "⏳ Aguardando servidor ficar pronto..."
  TIMEOUT=60
  ELAPSED=0
  while ! curl -s -o /dev/null "$URL" 2>/dev/null; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
      echo "✖ Tempo esgotado ao aguardar o servidor." >&2
      kill "$DEV_PID" 2>/dev/null || true
      exit 1
    fi
  done
  echo "✔ Servidor pronto (PID $DEV_PID)."
fi

# 3. Abre no navegador padrão
echo "🌐 Abrindo $URL no navegador..."
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v sensible-browser >/dev/null 2>&1; then
  sensible-browser "$URL"
else
  echo "⚠ Não foi possível detectar o navegador. Acesse manualmente: $URL"
fi
