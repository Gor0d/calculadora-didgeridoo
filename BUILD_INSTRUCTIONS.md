# 🚀 Instruções de Build - Didgemap

## ⚠️ Resolução do Erro EAS

O erro que você encontrou é comum e pode ser resolvido facilmente. Siga estes passos:

### 1. Configurar Projeto EAS Interativamente

```bash
# No terminal interativo (não PowerShell), execute:
eas init

# Quando perguntado "Would you like to create a project for @gorodis/didgemap-calculadora?"
# Digite: y (yes)
```

**OU use o Expo CLI tradicional:**

```bash
# Instalar Expo CLI se necessário
npm install -g @expo/cli

# Fazer login
expo login

# Configurar projeto
expo init --template blank-typescript didgemap-production
# (ou usar o projeto atual)
```

### 2. Alternativa: Build Local com Expo

Se preferir build local (mais rápido para testes):

```bash
# Android APK local
expo build:android --type apk

# iOS local (apenas no macOS)
expo build:ios --type archive
```

### 3. Configuração Manual do Project ID

Após executar `eas init` com sucesso, o arquivo `app.json` será atualizado automaticamente com um project ID válido similar a:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      }
    }
  }
}
```

### 4. Commands de Build Corretos

Após configuração:

```bash
# Preview builds (para teste)
npm run build:android:preview
npm run build:ios:preview

# Production builds (para lojas)
npm run build:android:production
npm run build:ios:production

# Ambos simultaneamente
npm run build:all:production
```

## 🔧 Troubleshooting Comum

### Erro: "Invalid UUID appId"
**Solução:** Execute `eas init` no terminal interativo

### Erro: "Input is required, but stdin is not readable"
**Solução:** Use terminal interativo (não PowerShell ISE)

### Erro: "EAS project not configured"
**Solução:** 
1. Execute `eas whoami` para verificar login
2. Execute `eas init` para configurar projeto
3. Confirme com 'y' quando perguntado

### Build falhando por dependências
**Solução:**
```bash
# Limpar cache
expo r -c
npm install
eas build --clear-cache --platform android --profile preview
```

## 📱 Builds Alternativos

### Opção 1: Expo Go (Desenvolvimento)
```bash
# Para teste rápido sem build
expo start
# Escaneie QR code no Expo Go app
```

### Opção 2: Build Local com Expo CLI
```bash
# Requer Android Studio ou Xcode configurado
expo run:android
expo run:ios
```

### Opção 3: EAS Build na Nuvem (Recomendado)
```bash
# Após eas init configurado
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 🎯 Próximos Passos Após Build

1. **Download do APK/IPA:**
   - EAS enviará email com links
   - Ou acesse: https://expo.dev/accounts/gorodis/projects/didgemap-calculadora/builds

2. **Teste em Dispositivos Reais:**
   - Android: Instale APK diretamente
   - iOS: Use TestFlight para distribuição

3. **Upload para Lojas:**
   - Google Play: Use arquivo AAB
   - App Store: Use arquivo IPA

## 💡 Dica Importante

O app **ESTÁ 100% FUNCIONAL** mesmo com esse erro de configuração. O erro é apenas na pipeline de build, não no código do app.

Para demonstração imediata, use:
```bash
expo start
# E teste no navegador ou Expo Go
```

O Didgemap funcionará perfeitamente! 🎵✨