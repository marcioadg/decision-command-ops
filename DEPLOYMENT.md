# 🚀 Deployment Guide - Decision Command Ops

## 📋 Estrutura de Ambientes

### 🌟 Staging (Desenvolvimento)
- **Branch:** `staging`
- **URL:** `https://decision-command-ops-staging.vercel.app`
- **Supabase:** Staging Database
- **Uso:** Desenvolvimento e testes

### 🏭 Production (Produção)
- **Branch:** `main`
- **URL:** `https://decision-command-ops.vercel.app`
- **Supabase:** Production Database
- **Uso:** Aplicação em produção

## 🔄 Workflow de Desenvolvimento

### 1. Desenvolvimento Diário (Sempre na staging)
```bash
# Certifique-se de estar na branch staging
git checkout staging

# Faça suas mudanças
# ... código ...

# Commit e push para staging
git add .
git commit -m "feat: nova funcionalidade"
git push origin staging
```

### 2. Deploy para Produção (Quando tudo estiver validado)

**Opção A: Script Automático**
```bash
./scripts/deploy-to-production.sh
```

**Opção B: Manual**
```bash
# 1. Certifique-se que staging está atualizada
git checkout staging
git pull origin staging

# 2. Merge para main
git checkout main
git pull origin main
git merge staging --no-ff -m "Deploy to production"

# 3. Push para main (deploy automático)
git push origin main

# 4. Volte para staging
git checkout staging
```

## 🗄️ Supabase Integration

### Configuração de Ambientes
- **Staging:** `zanlercqmdxgydtaqzni.supabase.co`
- **Production:** `fezmgnixfujyfdxcwyol.supabase.co`

### Gerenciamento de Migrações
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Aplicar migrações no staging
supabase db push --project-ref zanlercqmdxgydtaqzni

# Aplicar migrações na produção (apenas após validação)
supabase db push --project-ref fezmgnixfujyfdxcwyol
```

## 🔐 Variáveis de Ambiente no Vercel

### Staging
- `VITE_ENVIRONMENT=staging`
- `VITE_SUPABASE_URL=https://zanlercqmdxgydtaqzni.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Production
- `VITE_ENVIRONMENT=production`
- `VITE_SUPABASE_URL=https://fezmgnixfujyfdxcwyol.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📊 Monitoramento

### GitHub Actions
- **Staging Deploy:** Automático ao fazer push na `staging`
- **Production Deploy:** Automático ao fazer push na `main`

### URLs de Monitoramento
- **GitHub Actions:** https://github.com/marcioadg/decision-command-ops/actions
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard

## 🛠️ Comandos Úteis

```bash
# Ver status dos deploys
git log --oneline -10

# Ver diferenças entre staging e main
git diff staging main

# Reset staging para main (em caso de emergência)
git checkout staging
git reset --hard main
git push origin staging --force

# Ver logs do Vercel
vercel logs

# Testar build local
npm run build
npm run preview
```

## 🚨 Troubleshooting

### Deploy Falhou
1. Verificar logs no GitHub Actions
2. Verificar variáveis de ambiente no Vercel
3. Testar build local: `npm run build`

### Supabase Connection Issues
1. Verificar URLs e chaves no Vercel
2. Verificar se as migrações foram aplicadas
3. Verificar RLS (Row Level Security) policies

### Rollback de Emergência
```bash
# Voltar para commit anterior na main
git checkout main
git reset --hard HEAD~1
git push origin main --force
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do GitHub Actions
2. Verificar Vercel Dashboard
3. Verificar Supabase Dashboard
4. Contatar suporte técnico
