# 🚀 Guia Completo de Build e Publicação

## 📱 1. CRIAÇÃO DE APK

### Pré-requisitos:
```bash
# Instalar EAS CLI globalmente
npm install -g @expo/eas-cli

# Login no Expo
npx eas login

# Verificar configuração
npx eas build:configure
```

### Builds Disponíveis:

#### APK de Desenvolvimento (Teste Local):
```bash
npx eas build --platform android --profile development
```

#### APK de Preview (Distribuição Interna):
```bash
npx eas build --platform android --profile preview
```

#### APK de Produção:
```bash
npx eas build --platform android --profile production-apk
```

#### App Bundle para Google Play:
```bash
npx eas build --platform android --profile production
```

### iOS (App Store):
```bash
npx eas build --platform ios --profile production
```

---

## 🏪 2. PUBLICAÇÃO NAS LOJAS

### Google Play Store:

#### 2.1. Conta de Desenvolvedor:
- Custo: **$25 USD** (pagamento único)
- Tempo de aprovação: **2-3 dias**
- Link: https://play.google.com/console/

#### 2.2. Preparação:
```bash
# Criar app bundle de produção
npx eas build --platform android --profile production

# Submeter automaticamente (após configurar service account)
npx eas submit --platform android
```

### Apple App Store:

#### 2.1. Conta de Desenvolvedor:
- Custo: **$99 USD/ano**
- Tempo de aprovação: **24-48 horas**
- Link: https://developer.apple.com/

#### 2.2. Preparação:
```bash
# Criar build iOS
npx eas build --platform ios --profile production

# Submeter para App Store
npx eas submit --platform ios
```

---

## ☁️ 3. INFRAESTRUTURA 24/7 (SEM SEU PC)

### Opção 1: **Vercel** (Recomendado para Web)
**Custo: GRATUITO** (até 100GB bandwidth/mês)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy web
npm run build:web
vercel --prod
```

**Benefícios:**
- ✅ Deploy automático via GitHub
- ✅ SSL grátis
- ✅ CDN global
- ✅ Preview deployments

### Opção 2: **Railway** (Backend + Web)
**Custo: $5-10/mês**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Opção 3: **AWS Amplify** (Profissional)
**Custo: $1-5/mês** (para apps pequenos)

```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar
amplify init
amplify add hosting
amplify publish
```

### Opção 4: **Expo Hosting** (Expo Go)
**Custo: GRATUITO** (para desenvolvimento)

```bash
# Publicar no Expo
npx expo publish
```

---

## 🔄 4. CI/CD AUTOMÁTICO

### GitHub Actions (Gratuito):

Criar arquivo `.github/workflows/build.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npm run build:web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 💰 5. CUSTOS MENSAIS ESTIMADOS

### Configuração Básica (Recomendado):
- **Google Play Store**: $25 (uma vez)
- **Vercel (Web)**: $0/mês
- **GitHub Actions**: $0/mês (2000 min grátis)
- **Expo Updates**: $0/mês
- **Total inicial**: $25
- **Total mensal**: $0

### Configuração Profissional:
- **Google Play Store**: $25 (uma vez)
- **App Store**: $99/ano ($8.25/mês)
- **Railway (Backend)**: $5/mês
- **Domain personalizado**: $1/mês
- **Total mensal**: ~$14

### Configuração Enterprise:
- **AWS Amplify**: $10-50/mês
- **CloudFront CDN**: $1-10/mês
- **RDS Database**: $15-30/mês
- **Total mensal**: $26-90

---

## 📊 6. ANALYTICS E MONITORING

### Gratuitos:
- **Expo Analytics**: Incluído
- **Google Analytics**: Gratuito
- **Sentry Error Tracking**: 5K errors/mês grátis

### Configuração:
```bash
# Instalar Sentry
npx expo install @sentry/react-native

# Configurar no app.json
"hooks": {
  "postPublish": [
    {
      "file": "sentry-expo/upload-sourcemaps",
      "config": {
        "organization": "sua-org",
        "project": "didgemap"
      }
    }
  ]
}
```

---

## 🔐 7. SEGURANÇA E BACKUP

### Variáveis de Ambiente:
```bash
# Expo Secrets
npx eas secret:create --scope project --name API_KEY --value "seu-valor"

# Verificar
npx eas secret:list
```

### Backup Automático:
- ✅ Código no GitHub (privado)
- ✅ Builds no Expo
- ✅ Analytics preservados
- ✅ Configurações versionadas

---

## ⚡ 8. COMANDOS RÁPIDOS

```bash
# Build APK local para teste
npx eas build --platform android --profile preview --local

# Deploy web
npm run build:web && vercel --prod

# Submeter para lojas
npx eas submit --platform android
npx eas submit --platform ios

# Update OTA (sem rebuild)
npx eas update --branch production --message "Bug fixes"
```

---

## 🎯 RECOMENDAÇÃO FINAL

Para começar **AGORA** com **$0/mês**:

1. **Build APK**: `npx eas build --platform android --profile preview`
2. **Web Deploy**: Vercel (grátis)
3. **CI/CD**: GitHub Actions (grátis)
4. **Updates**: Expo OTA (grátis)

**Total para rodar 24/7**: $0/mês
**Único custo**: $25 para Google Play Store

Depois de validar o produto, migrar para configuração profissional! 🚀