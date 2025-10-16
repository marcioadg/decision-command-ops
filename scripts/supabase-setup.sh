#!/bin/bash

# Script para configurar Supabase CLI e conectar aos projetos
# Uso: ./scripts/supabase-setup.sh

echo "🔧 Configurando Supabase CLI..."

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
else
    echo "✅ Supabase CLI já está instalado"
fi

# Login no Supabase
echo "🔐 Fazendo login no Supabase..."
supabase login

echo "📋 Configuração dos projetos:"
echo ""
echo "🌟 STAGING:"
echo "   Project ID: zanlercqmdxgydtaqzni"
echo "   URL: https://zanlercqmdxgydtaqzni.supabase.co"
echo ""
echo "🏭 PRODUCTION:"
echo "   Project ID: fezmgnixfujyfdxcwyol"
echo "   URL: https://fezmgnixfujyfdxcwyol.supabase.co"
echo ""

# Testar conexões
echo "🧪 Testando conexões..."

echo "Testando staging..."
if supabase projects list | grep -q "zanlercqmdxgydtaqzni"; then
    echo "✅ Conexão com staging: OK"
else
    echo "❌ Conexão com staging: FALHOU"
fi

echo "Testando production..."
if supabase projects list | grep -q "fezmgnixfujyfdxcwyol"; then
    echo "✅ Conexão com production: OK"
else
    echo "❌ Conexão com production: FALHOU"
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "Comandos úteis:"
echo "  supabase db push --project-ref zanlercqmdxgydtaqzni  # Deploy para staging"
echo "  supabase db push --project-ref fezmgnixfujyfdxcwyol  # Deploy para production"
echo "  supabase db diff --schema public > supabase/migrations/new_migration.sql  # Nova migração"
