# 📱 Guia de Build para Google Play Store

## ✅ Checklist Pré-Build

### 1. Configurações do App
- [x] **app.json** configurado com todas informações necessárias
- [x] **versionCode** definido (1)
- [x] **version** definida (1.0.0)
- [x] **package name** correto (com.didgemap.app)
- [x] **ícones** preparados (icon.png, adaptive-icon.png)
- [x] **splash screen** configurado
- [x] **permissões** listadas e justificadas

### 2. Política de Privacidade
- [x] Arquivo `privacy-policy.html` criado
- [x] Hospedado em: https://didgemap.app/privacy-policy.html
- [ ] URL acessível publicamente (verificar)

### 3. Assets Necessários
- [x] Ícone principal (512x512px) - `./assets/didgemap-flat.png`
- [x] Ícone adaptativo (512x512px) - `./assets/adaptive-icon.png`
- [x] Splash screen - `./assets/splash-icon.png`
- [ ] Screenshots para Play Store (necessário criar)
- [ ] Banner promocional (necessário criar)

### 4. Metadados para Play Store

#### Informações Obrigatórias:
- **Nome do App:** Didgemap - Calculadora Didgeridoo
- **Descrição Curta:** Calculadora profissional de didgeridoo com análise acústica avançada
- **Descrição Completa:** Ver seção abaixo
- **Categoria:** Ferramentas / Música
- **Classificação de Conteúdo:** Livre
- **Email de Contato:** [seu-email@dominio.com]
- **Site:** https://didgemap.app
- **Política de Privacidade:** https://didgemap.app/privacy-policy.html

## 📝 Descrição para Play Store

### Descrição Curta (80 caracteres)
```
Calculadora profissional de didgeridoo com análise acústica em tempo real
```

### Descrição Completa
```
🎺 DIDGEMAP - Calculadora Profissional de Didgeridoo

Ferramenta completa para makers, construtores e entusiastas de didgeridoo. Calcule frequências, visualize geometrias e analise propriedades acústicas com precisão profissional.

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
• Visualização de harmônicos

🎵 PREVIEW SONORO
• Sintetizador de áudio integrado
• Reprodução de frequências calculadas
• Preview de séries harmônicas

💾 GERENCIAMENTO DE PROJETOS
• Salve e carregue geometrias
• Biblioteca de exemplos prontos
• Exportação de dados em múltiplos formatos
• Sistema de templates

🌍 RECURSOS PROFISSIONAIS
• Suporte a unidades métricas e imperiais
• Modo offline completo
• Multi-idioma (PT-BR, EN)
• Tema claro e escuro
• Interface responsiva

🎯 IDEAL PARA:
• Construtores profissionais de didgeridoo
• Makers e artesãos
• Músicos e entusiastas
• Estudantes de acústica
• Pesquisadores

🔧 TECNOLOGIA DE PONTA:
• Baseado em métodos científicos comprovados
• Precisão comparável a software profissional (CADSD, DidgitaldDoo)
• Cálculos acústicos validados
• Performance otimizada

📱 FUNCIONA OFFLINE:
Todo o processamento é feito localmente no seu dispositivo. Não requer conexão com internet após instalação.

🆓 GRATUITO E SEM ANÚNCIOS:
Ferramenta completamente gratuita, sem anúncios ou compras no app.

---

Desenvolvido com paixão por músicos para músicos.

Feedback e sugestões: didgemap.app
```

### Palavras-chave (para otimização)
```
didgeridoo, calculadora acústica, construção didgeridoo, análise sonora, maker tools, musical instruments, woodworking, acoustic calculator, frequency analysis, sound design
```

## 🚀 Comandos de Build

### 1. Build de Produção (App Bundle - AAB)
```bash
# Certifique-se de estar autenticado no EAS
npx eas-cli login

# Gerar build de produção
npx eas build --platform android --profile production

# Ou usar o script do package.json
npm run build:android:production
```

### 2. Build de Teste (APK)
```bash
# Para testar localmente antes de submeter
npx eas build --platform android --profile production-apk

# Ou
npm run build:android:apk
```

### 3. Submeter para Play Store
```bash
# Após a build completar, você pode submeter automaticamente
npx eas submit --platform android --profile production

# Ou
npm run submit:android
```

## 📋 Passo a Passo Completo

### Fase 1: Preparação (30 min)
1. ✅ Atualizar version e versionCode se necessário
2. ✅ Verificar que todos os testes passam: `npm test`
3. ✅ Verificar lint: `npm run lint:check`
4. ✅ Build local web para testar: `npm run build:web`
5. ⏳ Criar screenshots do app (5-8 imagens)
6. ⏳ Criar banner promocional (1024x500px)

### Fase 2: Build (1-2 horas)
1. ✅ Login no EAS: `npx eas-cli login`
2. ⏳ Iniciar build: `npm run build:android:production`
3. ⏳ Aguardar conclusão (build é feita nos servidores do Expo)
4. ⏳ Download do arquivo .aab quando pronto

### Fase 3: Google Play Console (1 hora)
1. ⏳ Acessar https://play.google.com/console
2. ⏳ Criar novo app ou selecionar app existente
3. ⏳ Fazer upload do arquivo .aab
4. ⏳ Preencher metadados:
   - Nome do app
   - Descrição curta e completa
   - Screenshots (mínimo 2, recomendado 8)
   - Ícone (512x512px)
   - Banner promocional
   - Política de privacidade
5. ⏳ Configurar classificação de conteúdo
6. ⏳ Preencher questionário de declaração
7. ⏳ Submeter para revisão

### Fase 4: Revisão e Publicação (2-7 dias)
1. ⏳ Aguardar revisão do Google (geralmente 1-3 dias)
2. ⏳ Corrigir qualquer problema apontado
3. ⏳ Publicação automática após aprovação

## 🎨 Assets para Criar

### Screenshots Necessários
Criar 5-8 screenshots mostrando:
1. Tela inicial com geometria de exemplo
2. Visualização gráfica da geometria
3. Resultados de análise acústica
4. Gráfico de espectro de impedância
5. Gerenciador de projetos
6. Configurações e temas
7. Preview sonoro em ação
8. Exemplos prontos

**Dimensões:**
- Phone: 1080x1920px ou 1080x2340px
- Tablet: 1200x1920px ou 1600x2560px

### Banner Promocional
- **Dimensão:** 1024x500px
- **Conteúdo:** Logo + texto "Calculadora Profissional de Didgeridoo"
- **Estilo:** Moderno, limpo, cores do app (#6366F1, #10B981)

## 📧 Informações de Contato

Para configurar no Google Play Console:
- **Email:** [definir email de suporte]
- **Site:** https://didgemap.app
- **Política de Privacidade:** https://didgemap.app/privacy-policy.html

## 🔐 Segurança e Permissões

### Permissões Solicitadas:
1. **RECORD_AUDIO** - Para análise acústica de didgeridoos reais (opcional)
2. **CAMERA** - Para capturar medidas (opcional)
3. **READ_EXTERNAL_STORAGE** - Para importar projetos
4. **WRITE_EXTERNAL_STORAGE** - Para exportar projetos

### Justificativas:
Todas as permissões são opcionais e usadas apenas quando o usuário explicitamente utiliza a funcionalidade correspondente.

## 🐛 Troubleshooting

### Build Falha
```bash
# Limpar cache e tentar novamente
npx expo start --clear

# Reinstalar dependências
rm -rf node_modules
npm install

# Verificar configurações EAS
npx eas-cli build:configure
```

### Erro de Signing
- Verificar que o Google Play Console criou a chave automaticamente
- Se usando chave própria, verificar configuração em eas.json

### App Rejeitado
- Verificar política de privacidade está acessível
- Verificar que descrição não contém informações enganosas
- Verificar classificação de conteúdo está correta
- Verificar screenshots são representativos

## 📚 Recursos Úteis

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console/)
- [Google Play Store Listing](https://support.google.com/googleplay/android-developer/answer/9859152)
- [App Signing by Google Play](https://support.google.com/googleplay/android-developer/answer/9842756)

## 🎉 Pós-Publicação

Após publicação bem-sucedida:
1. Compartilhar link da Play Store
2. Monitorar reviews e ratings
3. Configurar updates automáticos via EAS Update
4. Preparar próximas versões com base no feedback

---

**Última atualização:** 2025-10-16
**Status:** Pronto para build de produção ✅
