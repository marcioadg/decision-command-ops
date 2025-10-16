# 🔄 Workflow de Desenvolvimento - Decision Command Ops

## 🎯 Resumo do Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  STAGING    │───▶│  MAIN       │───▶│ PRODUCTION  │
│ (Desenvolv.)│    │ (Validação) │    │ (Live)      │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📋 Processo Diário

### 1. 🌟 Desenvolvimento (Sempre na staging)
```bash
# Certifique-se de estar na staging
git checkout staging

# Faça suas mudanças
# ... código ...

# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin staging
```

**Resultado:** Deploy automático para staging no Vercel

### 2. 🧪 Teste e Validação
- Acesse: `https://decision-command-ops-staging.vercel.app`
- Teste todas as funcionalidades
- Valide com stakeholders
- Documente bugs/ajustes necessários

### 3. 🚀 Deploy para Produção (Quando tudo estiver OK)

**Opção A: Script Automático**
```bash
./scripts/deploy-to-production.sh
```

**Opção B: Manual**
```bash
git checkout staging
git pull origin staging
git checkout main
git pull origin main
git merge staging --no-ff -m "Deploy to production"
git push origin main
git checkout staging
```

**Resultado:** Deploy automático para produção no Vercel

## 🗄️ Gerenciamento de Banco de Dados

### Setup Inicial (Uma vez só)
```bash
npm run supabase:setup
```

### Aplicar Migrações no Staging
```bash
npm run supabase:deploy:staging
```

### Aplicar Migrações na Produção
```bash
npm run supabase:deploy:production
```

### Criar Nova Migração
```bash
npm run supabase:diff
# Edite o arquivo gerado e depois aplique
```

## 📊 URLs dos Ambientes

| Ambiente | Branch | URL | Banco |
|----------|--------|-----|-------|
| 🌟 Staging | `staging` | https://decision-command-ops-staging.vercel.app | Staging DB |
| 🏭 Production | `main` | https://decision-command-ops.vercel.app | Production DB |

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Servidor local
npm run build:staging          # Build para staging
npm run build:production       # Build para production

# Deploy
npm run deploy:staging         # Push para staging
npm run deploy:production      # Deploy para produção

# Supabase
npm run supabase:setup         # Setup inicial
npm run supabase:deploy:staging    # Deploy migrações staging
npm run supabase:deploy:production # Deploy migrações production
npm run supabase:diff          # Criar nova migração

# Git
git checkout staging           # Ir para staging
git checkout main             # Ir para main
git log --oneline -10         # Ver commits recentes
git diff staging main         # Ver diferenças
```

## 🚨 Regras Importantes

### ✅ SEMPRE FAÇA:
- Desenvolva na branch `staging`
- Teste tudo no ambiente de staging antes de ir para produção
- Use commits descritivos
- Faça backup antes de mudanças críticas no banco

### ❌ NUNCA FAÇA:
- Commitar diretamente na `main`
- Deployar para produção sem testar no staging
- Aplicar migrações na produção sem testar no staging
- Forçar push na `main` (exceto emergências)

## 🔄 Ciclo de Release

1. **Desenvolvimento** → Staging
2. **Teste** → Validação no staging
3. **Ajustes** → Volta para desenvolvimento se necessário
4. **Aprovação** → Stakeholder aprova no staging
5. **Deploy** → Merge staging → main
6. **Monitoramento** → Verificar produção

## 📞 Quando Algo Der Errado

### Deploy Falhou
1. Verificar logs no GitHub Actions
2. Verificar variáveis de ambiente no Vercel
3. Testar build local

### Banco de Dados com Problema
1. Verificar logs no Supabase Dashboard
2. Fazer rollback da migração se necessário
3. Testar no staging primeiro

### Rollback de Emergência
```bash
# Voltar para commit anterior
git checkout main
git reset --hard HEAD~1
git push origin main --force
```

## 🎉 Benefícios deste Workflow

- ✅ **Separação clara** entre desenvolvimento e produção
- ✅ **Testes obrigatórios** no staging antes da produção
- ✅ **Deploy automático** via GitHub Actions
- ✅ **Rollback fácil** em caso de problemas
- ✅ **Histórico claro** de mudanças
- ✅ **Integração completa** com Supabase
