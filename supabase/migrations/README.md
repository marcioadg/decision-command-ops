# 🗄️ Supabase Migrations

Este diretório contém as migrações do banco de dados Supabase.

## 📋 Como Usar

### Aplicar Migrações no Staging
```bash
supabase db push --project-ref zanlercqmdxgydtaqzni
```

### Aplicar Migrações na Produção
```bash
supabase db push --project-ref fezmgnixfujyfdxcwyol
```

### Criar Nova Migração
```bash
# Para mudanças no schema
supabase db diff --schema public > supabase/migrations/$(date +%Y%m%d%H%M%S)_migration_name.sql

# Para mudanças em funções
supabase db diff --schema functions > supabase/migrations/$(date +%Y%m%d%H%M%S)_functions_migration.sql
```

### Resetar Banco Local (Desenvolvimento)
```bash
supabase db reset
```

## 🔐 Configuração dos Projetos

### Staging
- **Project ID:** `zanlercqmdxgydtaqzni`
- **URL:** `https://zanlercqmdxgydtaqzni.supabase.co`

### Production  
- **Project ID:** `fezmgnixfujyfdxcwyol`
- **URL:** `https://fezmgnixfujyfdxcwyol.supabase.co`

## 📝 Convenções

- Use nomes descritivos para as migrações
- Sempre teste no staging antes de aplicar na produção
- Documente mudanças complexas nos comentários SQL
- Use timestamps no formato `YYYYMMDDHHMMSS`

## 🚨 Importante

- **NUNCA** aplique migrações diretamente na produção sem testar no staging
- Sempre faça backup antes de migrações críticas
- Use transações para migrações que podem falhar
