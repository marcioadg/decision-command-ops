#!/bin/bash

# Script para fazer deploy de migrações
# Uso: ./scripts/deploy-migrations.sh [staging|production]

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Erro: Especifique o ambiente (staging ou production)"
    echo "Uso: ./scripts/deploy-migrations.sh [staging|production]"
    exit 1
fi

if [ "$ENVIRONMENT" = "staging" ]; then
    PROJECT_ID="zanlercqmdxgydtaqzni"
    echo "🌟 Fazendo deploy para STAGING..."
elif [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_ID="fezmgnixfujyfdxcwyol"
    echo "🏭 Fazendo deploy para PRODUCTION..."
    echo "⚠️  ATENÇÃO: Você está fazendo deploy para PRODUCTION!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deploy cancelado"
        exit 1
    fi
else
    echo "❌ Erro: Ambiente inválido. Use 'staging' ou 'production'"
    exit 1
fi

echo "🚀 Aplicando migrações no projeto: $PROJECT_ID"

# Verificar se há migrações pendentes
echo "📋 Verificando migrações pendentes..."
supabase db diff --project-ref $PROJECT_ID --schema public

if [ $? -eq 0 ]; then
    echo "✅ Aplicando migrações..."
    supabase db push --project-ref $PROJECT_ID
    
    if [ $? -eq 0 ]; then
        echo "🎉 Migrações aplicadas com sucesso!"
        echo "🌐 URL: https://$PROJECT_ID.supabase.co"
    else
        echo "❌ Erro ao aplicar migrações"
        exit 1
    fi
else
    echo "ℹ️  Nenhuma migração pendente encontrada"
fi
