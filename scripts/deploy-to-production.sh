#!/bin/bash

# Script para fazer deploy da staging para production
# Uso: ./scripts/deploy-to-production.sh

echo "🚀 Iniciando deploy para produção..."

# Verificar se estamos na branch staging
current_branch=$(git branch --show-current)
if [ "$current_branch" != "staging" ]; then
    echo "❌ Erro: Você deve estar na branch 'staging' para fazer deploy para produção"
    echo "Branch atual: $current_branch"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Erro: Há mudanças não commitadas. Faça commit ou stash das mudanças primeiro."
    git status --short
    exit 1
fi

# Fazer pull da staging para garantir que está atualizada
echo "📥 Atualizando branch staging..."
git pull origin staging

# Fazer merge da staging para main
echo "🔄 Fazendo merge da staging para main..."
git checkout main
git pull origin main
git merge staging --no-ff -m "Deploy to production: merge staging to main"

# Push para main (isso vai triggerar o deploy automático)
echo "🚀 Fazendo push para main (deploy automático)..."
git push origin main

# Voltar para staging
echo "🔙 Voltando para branch staging..."
git checkout staging

echo "✅ Deploy para produção iniciado!"
echo "📊 Acompanhe o progresso em: https://github.com/marcioadg/decision-command-ops/actions"
echo "🌐 Aplicação estará disponível em: https://decision-command-ops.vercel.app"
