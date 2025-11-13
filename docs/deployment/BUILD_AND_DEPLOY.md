# Build e Deploy - Didgemap

## Visão Geral

Este documento consolida todas as informações sobre build e deploy do app Didgemap para as diferentes plataformas.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Build Android](#build-android)
3. [Build iOS](#build-ios)
4. [Deploy Web](#deploy-web)
5. [Google Play Store](#google-play-store)
6. [Apple App Store](#apple-app-store)
7. [CI/CD](#cicd)
8. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Ferramentas Necessárias
```bash
# Instalar EAS CLI globalmente
npm install -g @expo/eas-cli

# Login no Expo
npx eas login

# Verificar configuração
npx eas build:configure
```

### Checklist Pré-Build
- [ ] `app.json` configurado corretamente
- [ ] Version e versionCode/buildNumber atualizados
- [ ] Testes passando: `npm test`
- [ ] Lint sem erros: `npm run lint:check`
- [ ] Assets (ícones, splash screen) preparados
- [ ] Política de privacidade publicada

---

## Build Android

### Perfis Disponíveis

#### 1. Development (Debug + Dev Client)
```bash
npx eas build --platform android --profile development
```
- **Uso:** Desenvolvimento local
- **Formato:** APK Debug
- **Tamanho:** ~50-80MB
- **Development Client:** Sim

#### 2. Preview (Teste Interno)
```bash
npx eas build --platform android --profile preview
# ou
npm run build:android:preview
```
- **Uso:** Testes internos, distribuição direta
- **Formato:** APK Release
- **Tamanho:** ~30-50MB
- **Assinado:** Sim

#### 3. Production APK
```bash
npm run build:android:apk
```
- **Uso:** Distribuição direta (fora da Play Store)
- **Formato:** APK Release
- **Tamanho:** ~30-50MB

#### 4. Production Bundle (Play Store)
```bash
npm run build:android:production
```
- **Uso:** Publicação na Google Play Store
- **Formato:** App Bundle (.aab)
- **Tamanho:** ~25-40MB
- **Auto-increment:** versionCode (automático)

### Processo de Build

1. **Iniciar Build**
   ```bash
   npm run build:android:production
   ```

2. **Acompanhar Progresso**
   - Build é executada nos servidores do Expo
   - Tempo estimado: 10-20 minutos
   - URL de status é fornecida no terminal

3. **Download**
   - Arquivo `.aab` estará disponível na URL fornecida
   - Também acessível em: https://expo.dev

---

## Build iOS

### Pré-requisitos iOS
- Conta Apple Developer ($99/ano)
- Apple Team ID
- App Store Connect configurado

### Build Production
```bash
npm run build:ios:production
```

### Configuração Necessária
No arquivo `eas.json`, atualizar:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "seu-email@apple.com",
        "ascAppId": "seu-app-id",
        "appleTeamId": "seu-team-id"
      }
    }
  }
}
```

---

## Deploy Web

### Vercel (Recomendado)

#### Setup Inicial
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login
```

#### Deploy
```bash
# Build web
npm run build:web:prod

# Deploy para produção
vercel --prod
```

#### Auto-Deploy via GitHub
O projeto já está configurado com `vercel.json`:
- Push para `main` → Deploy automático
- Pull requests → Preview deployment
- SSL/HTTPS automático
- CDN global

### Netlify (Alternativa)

#### Deploy via CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build
npm run build:web:prod

# Deploy
netlify deploy --prod --dir=build
```

#### Configuração
O arquivo `netlify.toml` já está configurado:
```toml
[build]
  publish = "build"
  command = "npm run build:web:prod"
```

---

## Google Play Store

### Preparação

#### 1. Criar Conta de Desenvolvedor
- Custo: $25 USD (pagamento único)
- Tempo de ativação: 2-3 dias
- URL: https://play.google.com/console

#### 2. Assets Necessários
- Ícone: 512x512px (PNG, sem transparência)
- Screenshots: 5-8 imagens
  - Phone: 1080x1920px ou 1080x2340px
  - Tablet: 1200x1920px (opcional)
- Banner promocional: 1024x500px
- Vídeo promocional (opcional)

#### 3. Metadados
- **Nome:** Didgemap - Calculadora Didgeridoo
- **Descrição curta:** (80 chars max)
  ```
  Calculadora profissional de didgeridoo com análise acústica em tempo real
  ```
- **Descrição completa:** Ver seção abaixo
- **Categoria:** Ferramentas / Música
- **Classificação:** Livre
- **Email de contato:** [configurar]
- **Site:** https://didgemap.app
- **Política de privacidade:** https://didgemap.app/privacy-policy.html

#### Descrição Completa
```markdown
🎺 DIDGEMAP - Calculadora Profissional de Didgeridoo

Ferramenta completa para makers, construtores e entusiastas de didgeridoo.
Calcule frequências, visualize geometrias e analise propriedades acústicas
com precisão profissional.

✨ RECURSOS PRINCIPAIS:

🔬 ANÁLISE ACÚSTICA AVANÇADA
• Transfer Matrix Method (TMM) para cálculos de alta precisão
• Cálculo de frequência fundamental e harmônicos
• Análise de espectro de impedância
• Previsão de notas musicais com precisão de cents

📊 VISUALIZAÇÃO INTERATIVA
• Representação gráfica 2D da geometria
• Zoom e pan para análise detalhada
• Gráficos de impedância em tempo real

🎵 PREVIEW SONORO
• Sintetizador de áudio integrado
• Reprodução de frequências calculadas

💾 GERENCIAMENTO DE PROJETOS
• Salve e carregue geometrias
• Biblioteca de exemplos prontos
• Exportação em múltiplos formatos

🌍 RECURSOS PROFISSIONAIS
• Suporte a unidades métricas e imperiais
• Modo offline completo
• Multi-idioma (PT-BR, EN)
• Interface responsiva

🆓 GRATUITO E SEM ANÚNCIOS
```

### Submissão

#### Via EAS CLI (Automático)
```bash
# Submeter após build completar
npm run submit:android
```

#### Via Console (Manual)
1. Acessar https://play.google.com/console
2. Selecionar o app
3. Produção > Criar nova versão
4. Upload do arquivo .aab
5. Preencher notas da versão
6. Revisar e publicar

### Timeline de Publicação
- Upload: Imediato
- Revisão: 1-3 dias úteis
- Aprovação: 3-7 dias (primeira vez)
- Publicação: Automática após aprovação

---

## Apple App Store

### Preparação

#### Requisitos
- Conta Apple Developer ($99/ano)
- Xcode instalado (apenas para verificação)
- Certificados e provisioning profiles (EAS gerencia automaticamente)

### Submissão
```bash
npm run submit:ios
```

### App Store Connect
1. Criar app em https://appstoreconnect.apple.com
2. Preencher metadados
3. Upload de screenshots (via Transporter ou EAS)
4. Submeter para revisão

### Timeline
- Upload: 10-30 min (processamento)
- Revisão: 24-48 horas
- Aprovação: 1-3 dias

---

## CI/CD

### GitHub Actions

O projeto inclui workflow automatizado em `.github/workflows/build.yml`:

```yaml
name: Build and Test

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run lint:check
```

### EAS Build Triggers

#### Via Git Tags
```bash
# Criar tag de release
git tag v1.0.0
git push origin v1.0.0

# Configurar EAS para builds automáticas em tags
```

#### Via GitHub Actions + EAS
```yaml
- name: Build Android
  run: npx eas build --platform android --profile production --non-interactive
  env:
    EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Updates Over-The-Air (OTA)

### Conceito
OTA permite atualizar o JavaScript/assets sem novo build:
- ✅ Fixes de bugs
- ✅ Mudanças de UI
- ✅ Novas features (sem código nativo)
- ❌ Não funciona para mudanças em dependências nativas

### Publicar Update
```bash
# Production
npm run update:production

# Preview/Test
npm run update:preview
```

### Configuração
Já configurado em `app.json`:
```json
{
  "updates": {
    "enabled": true,
    "checkAutomatically": "ON_LOAD",
    "fallbackToCacheTimeout": 30000
  }
}
```

---

## Troubleshooting

### Build Falha

#### Erro: "Expo token invalid"
```bash
# Fazer login novamente
npx eas login
```

#### Erro: "Build failed"
```bash
# Limpar cache
npx expo start --clear

# Reinstalar dependências
rm -rf node_modules
npm install

# Reconfigurar EAS
npx eas build:configure
```

### Submissão Rejeitada

#### Google Play
**Motivos comuns:**
- Política de privacidade inacessível
- Descrição enganosa
- Screenshots não representativos
- Permissões sem justificativa

**Solução:**
1. Ler email de rejeição cuidadosamente
2. Corrigir o problema apontado
3. Resubmeter

#### App Store
**Motivos comuns:**
- Metadados incompletos
- Screenshots em tamanho errado
- Funcionalidades quebradas
- Violação de guidelines

### Problemas de Signing

#### Android
- EAS gerencia chaves automaticamente
- Chaves armazenadas de forma segura no Expo
- Primeira build cria chave automaticamente

#### iOS
- Certificados gerenciados pelo EAS
- Provisioning profiles criados automaticamente
- Requer Apple Developer Program ativo

---

## Versionamento

### Estratégia de Versão

#### Formato: `MAJOR.MINOR.PATCH`
- **MAJOR:** Mudanças incompatíveis
- **MINOR:** Novas funcionalidades (compatível)
- **PATCH:** Correções de bugs

#### Exemplo
```
1.0.0 → Lançamento inicial
1.0.1 → Fix de bug crítico
1.1.0 → Nova feature (export PDF)
2.0.0 → Redesign completo
```

### Atualizar Versão

#### Arquivo: `app.json`
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

**Importante:**
- `version`: Sempre atualizar (string)
- `versionCode` (Android): Auto-incrementado pelo EAS
- `buildNumber` (iOS): Auto-incrementado pelo EAS

---

## Custos Estimados

### Configuração Gratuita
- **EAS Build:** Gratuito (com limitações)
- **Vercel:** Gratuito (100GB/mês)
- **GitHub Actions:** Gratuito (2000 min/mês)
- **Expo Updates:** Gratuito
- **Total:** $0/mês

### Configuração Profissional
- **Google Play:** $25 (uma vez)
- **Apple Developer:** $99/ano
- **Vercel Pro:** $20/mês (opcional)
- **Total:** ~$10-15/mês

---

## Recursos Úteis

### Documentação Oficial
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console/)
- [App Store Connect](https://appstoreconnect.apple.com)

### Comunidade
- [Expo Forums](https://forums.expo.dev/)
- [Expo Discord](https://discord.gg/expo)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

**Última atualização:** 27/10/2025
**Versão do documento:** 2.0
