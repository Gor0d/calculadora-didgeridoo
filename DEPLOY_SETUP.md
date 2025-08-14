# 🚀 Setup de Deploy - Didgemap Calculadora

## ✅ STATUS ATUAL:

### Concluído:
- ✅ **Build APK**: Em andamento no Expo EAS (ID: a625f2fb-34e9-4456-b373-1c68fbd0b0e2)
- ✅ **Build Web**: Concluído em `/build/`
- ✅ **GitHub Actions**: Workflow configurado
- ✅ **Scripts de automação**: Criados

### Próximos Passos:

---

## 📱 1. ACOMPANHAR BUILD APK

Seu build Android está sendo criado:
- **Status**: Em progresso 
- **Link direto**: https://expo.dev/accounts/gorodis/projects/didgemap-calculadora/builds/a625f2fb-34e9-4456-b373-1c68fbd0b0e2

### Comandos para acompanhar:
```bash
# Verificar status do build
npx eas build:list --platform android --limit 3

# Ver logs em tempo real
npx eas build:view a625f2fb-34e9-4456-b373-1c68fbd0b0e2
```

---

## 🌐 2. DEPLOY WEB (ESCOLHA UMA OPÇÃO)

### Opção A: Vercel (Recomendado - Gratuito)

1. **Acesse**: https://vercel.com/signup
2. **Login com GitHub** (recomendado)
3. **Conectar repositório**:
   ```bash
   # No terminal
   vercel login
   # Escolha "Continue with GitHub"
   
   # Deploy da pasta build
   cd build
   vercel --prod --yes
   ```

### Opção B: Netlify (Alternativa Gratuita)

1. **Acesse**: https://netlify.com/signup  
2. **Login com GitHub**
3. **Drag & Drop** da pasta `build/` no dashboard
4. **OU usar CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=build
   ```

### Opção C: GitHub Pages (Simples)

1. **No seu repositório GitHub**:
   - Settings → Pages 
   - Source: GitHub Actions
   - Commit e push dos arquivos

---

## 🏪 3. PUBLICAÇÃO NAS LOJAS

### Google Play Store:

#### **Custos e Prazos:**
- **Taxa**: $25 USD (pagamento único)
- **Aprovação**: 2-3 dias
- **Link**: https://play.google.com/console/

#### **Passos:**
```bash
# 1. Aguardar build APK ficar pronto
# 2. Baixar APK do Expo Dashboard
# 3. Criar conta de desenvolvedor Google Play
# 4. Upload do APK manualmente OU automático:

npx eas submit --platform android --profile production
```

### Apple App Store:

#### **Custos e Prazos:**
- **Taxa**: $99 USD/ano
- **Aprovação**: 24-48 horas  
- **Link**: https://developer.apple.com/

#### **Passos:**
```bash
# 1. Build iOS primeiro
npx eas build --platform ios --profile production

# 2. Submeter automaticamente
npx eas submit --platform ios --profile production
```

---

## ☁️ 4. INFRAESTRUTURA 24/7

### **Para manter o app rodando sem seu PC:**

#### Web (Gratuito):
- ✅ **Vercel**: Deploy automático via GitHub
- ✅ **Netlify**: Deploy automático via GitHub  
- ✅ **GitHub Pages**: Hosting gratuito

#### Mobile (Automático):
- ✅ **Expo Updates**: Updates OTA sem rebuild
- ✅ **Lojas**: Apps ficam disponíveis 24/7

### **Custos mensais estimados:**
```
Configuração GRATUITA:
- Google Play Store: $25 (uma vez)
- Vercel/Netlify: $0/mês
- Expo Updates: $0/mês
- GitHub Actions: $0/mês
Total: $0/mês (após setup inicial)
```

---

## 🔄 5. AUTOMAÇÃO GITHUB ACTIONS

### **Configuração de Secrets:**

No GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

```
EXPO_TOKEN=ey... (seu token do Expo)
VERCEL_TOKEN=... (se usar Vercel)
VERCEL_ORG_ID=... (se usar Vercel)
VERCEL_PROJECT_ID=... (se usar Vercel)
```

### **Como pegar os tokens:**

```bash
# Token Expo
npx eas login
# Depois vá em: https://expo.dev/accounts/[username]/settings/access-tokens

# Token Vercel
vercel login
# Depois vá em: https://vercel.com/account/tokens
```

---

## ⚡ 6. COMANDOS RÁPIDOS

```bash
# Build APK rápido (preview)
npm run build:quick

# Build completo (produção)
npm run release

# Deploy web
npm run build:web:prod && vercel --prod

# Update OTA (sem rebuild)
npx eas update --branch production --message "Bug fixes"

# Verificar builds
npx eas build:list
```

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS:

1. **⏳ Aguardar build APK** (5-15 minutos)
2. **🌐 Configurar Vercel** para deploy web automático
3. **🏪 Criar conta Google Play** ($25)
4. **📱 Testar APK** no dispositivo
5. **🚀 Publicar na Play Store**

---

## 📞 SUPORTE:

- **Expo Dashboard**: https://expo.dev/accounts/gorodis/projects/didgemap-calculadora
- **Build em andamento**: https://expo.dev/accounts/gorodis/projects/didgemap-calculadora/builds/a625f2fb-34e9-4456-b373-1c68fbd0b0e2
- **Documentação**: https://docs.expo.dev/

**Status**: ✅ **Pronto para deploy 24/7 com $0/mês de custo!**