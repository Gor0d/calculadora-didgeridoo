# Documentação - Didgemap

Bem-vindo à documentação completa do Didgemap! Esta página serve como índice central para toda a documentação técnica e de usuário do projeto.

---

## 📚 Estrutura da Documentação

```
docs/
├── architecture/           # Documentação técnica e arquitetura
│   ├── TECHNICAL_DOCUMENTATION.md
│   └── CODE_STRUCTURE.md
│
├── deployment/            # Guias de build e deploy
│   ├── BUILD_AND_DEPLOY.md
│   └── GOOGLE_PLAY_BILLING_SETUP.md
│
├── guides/               # Guias de uso
│   ├── USER_GUIDE.md
│   └── FAQ.md
│
├── api/                  # Referência de APIs
│   └── API_REFERENCE.md
│
└── screenshots/          # Capturas de tela
    └── ...
```

---

## 🎯 Para Começar

### Novos Usuários
Se você é novo no Didgemap:
1. Leia o [README principal](../README.md) para visão geral
2. Veja o [Guia do Usuário](./guides/USER_GUIDE.md) (em breve)
3. Confira o [FAQ](./guides/FAQ.md) (em breve)

### Desenvolvedores
Se você quer contribuir ou entender o código:
1. Leia o [Guia de Contribuição](../CONTRIBUTING.md)
2. Estude a [Documentação Técnica](./architecture/TECHNICAL_DOCUMENTATION.md)
3. Veja a [Estrutura do Código](./architecture/CODE_STRUCTURE.md) (em breve)

### DevOps / Deploy
Se você precisa fazer build ou deploy:
1. Siga o [Guia de Build e Deploy](./deployment/BUILD_AND_DEPLOY.md)
2. Para monetização, veja [Google Play Billing Setup](./deployment/GOOGLE_PLAY_BILLING_SETUP.md)

---

## 📖 Documentação por Categoria

### 🏗 Arquitetura & Técnico

#### [Documentação Técnica Completa](./architecture/TECHNICAL_DOCUMENTATION.md)
Documentação técnica detalhada incluindo:
- Arquitetura do sistema
- Stack tecnológico
- Cálculos acústicos (fórmulas, implementação)
- Estrutura de código
- Fluxo de dados (Redux, hooks)
- Precisão e limitações
- APIs internas
- Performance
- Testes

**Público:** Desenvolvedores, engenheiros, pesquisadores

#### Estrutura do Código (em breve)
- Organização de diretórios
- Convenções de nomenclatura
- Padrões de design
- Best practices

---

### 🚀 Deploy & Build

#### [Build e Deploy](./deployment/BUILD_AND_DEPLOY.md)
Guia completo de build e deploy:
- **Android:** APK, App Bundle, Google Play Store
- **iOS:** App Store submission
- **Web:** Vercel, Netlify
- **CI/CD:** GitHub Actions, EAS
- **OTA Updates:** Expo Updates
- **Troubleshooting:** Soluções para problemas comuns
- **Versionamento:** Estratégias de versão

**Público:** DevOps, desenvolvedores, equipe de release

#### [Google Play Billing Setup](./deployment/GOOGLE_PLAY_BILLING_SETUP.md)
Guia detalhado para configurar monetização:
- Configuração de conta de desenvolvedor
- Perfil de faturamento (Merchant Account)
- Conta bancária e impostos
- Implementação técnica (react-native-iap)
- Produtos in-app e assinaturas
- Testes e validação
- Publicação e compliance
- Monitoramento de receita

**Público:** Product managers, desenvolvedores, financeiro

---

### 📘 Guias de Uso

#### Guia do Usuário (em breve)
Como usar o app Didgemap:
- Interface e navegação
- Criar e editar geometrias
- Interpretar resultados
- Salvar e gerenciar projetos
- Exportar dados
- Configurações

**Público:** Usuários finais, makers, construtores

#### FAQ - Perguntas Frequentes (em breve)
Respostas para perguntas comuns:
- Como usar o app?
- Como interpretar os resultados?
- Por que os cálculos diferem da realidade?
- Como exportar projetos?
- Problemas técnicos

**Público:** Todos

---

### 🔌 APIs

#### Referência de API (em breve)
Documentação das APIs internas:
- **AcousticEngine API:** Cálculos acústicos
- **StorageService API:** Persistência de dados
- **AudioSynthesizer API:** Síntese de áudio
- **ExportService API:** Exportação de projetos
- **GeometryValidator API:** Validação de geometria

**Público:** Desenvolvedores, integradores

---

## 🔍 Busca Rápida

### Por Tópico

#### Cálculos Acústicos
- [Fundamentos Teóricos](./architecture/TECHNICAL_DOCUMENTATION.md#cálculos-acústicos)
- [Fórmulas Base](./architecture/TECHNICAL_DOCUMENTATION.md#fórmulas-base)
- [Correções Aplicadas](./architecture/TECHNICAL_DOCUMENTATION.md#correções-aplicadas)
- [Implementação](./architecture/TECHNICAL_DOCUMENTATION.md#implementação---acousticengine)
- [Precisão e Limitações](./architecture/TECHNICAL_DOCUMENTATION.md#precisão-e-limitações)

#### Build & Deploy
- [Build Android](./deployment/BUILD_AND_DEPLOY.md#build-android)
- [Build iOS](./deployment/BUILD_AND_DEPLOY.md#build-ios)
- [Deploy Web](./deployment/BUILD_AND_DEPLOY.md#deploy-web)
- [Google Play Store](./deployment/BUILD_AND_DEPLOY.md#google-play-store)
- [CI/CD](./deployment/BUILD_AND_DEPLOY.md#cicd)

#### Monetização
- [Configuração de Billing](./deployment/GOOGLE_PLAY_BILLING_SETUP.md#3-perfil-de-faturamento-merchant-account)
- [Produtos In-App](./deployment/GOOGLE_PLAY_BILLING_SETUP.md#7-configuração-de-produtos-in-app)
- [Implementação Técnica](./deployment/GOOGLE_PLAY_BILLING_SETUP.md#6-implementação-técnica-no-app)

#### Desenvolvimento
- [Configuração de Ambiente](../CONTRIBUTING.md#configuração-do-ambiente)
- [Padrões de Código](../CONTRIBUTING.md#padrões-de-código)
- [Testes](../CONTRIBUTING.md#testes)
- [Fluxo de Trabalho](../CONTRIBUTING.md#fluxo-de-trabalho)

---

## 🆕 Documentos Recentes

| Documento | Data | Versão |
|-----------|------|--------|
| [Technical Documentation](./architecture/TECHNICAL_DOCUMENTATION.md) | 27/10/2025 | 2.0 |
| [Build and Deploy](./deployment/BUILD_AND_DEPLOY.md) | 27/10/2025 | 2.0 |
| [Google Play Billing](./deployment/GOOGLE_PLAY_BILLING_SETUP.md) | 27/10/2025 | 1.0 |
| [Contributing Guide](../CONTRIBUTING.md) | 27/10/2025 | 1.0 |
| [Main README](../README.md) | 27/10/2025 | 2.0 |

---

## 📝 Documentos Planejados

### Próximas Adições

- [ ] **USER_GUIDE.md** - Guia completo do usuário
- [ ] **FAQ.md** - Perguntas frequentes
- [ ] **API_REFERENCE.md** - Referência completa de APIs
- [ ] **CODE_STRUCTURE.md** - Estrutura detalhada do código
- [ ] **ACOUSTIC_THEORY.md** - Teoria acústica aprofundada
- [ ] **TESTING_GUIDE.md** - Guia de testes
- [ ] **PERFORMANCE_OPTIMIZATION.md** - Otimizações
- [ ] **SECURITY.md** - Práticas de segurança

---

## 🤝 Contribuindo com Documentação

A documentação é tão importante quanto o código! Se você quer ajudar:

### Como Contribuir

1. **Identifique gaps:** O que está faltando?
2. **Proponha melhorias:** Abra uma issue
3. **Escreva documentação:** Siga o template
4. **Submeta PR:** Pull request com suas adições

### Diretrizes

- **Clareza:** Escreva de forma clara e concisa
- **Exemplos:** Inclua exemplos práticos
- **Screenshots:** Adicione imagens quando útil
- **Organização:** Mantenha a estrutura consistente
- **Atualização:** Mantenha docs atualizados com código

### Templates

#### Template de Documentação Técnica
```markdown
# Título

## Visão Geral
Breve descrição do tópico.

## Conceitos Básicos
Explique conceitos fundamentais.

## Implementação
Como está implementado no código.

## Exemplos
Exemplos práticos de uso.

## Referências
Links e recursos adicionais.
```

#### Template de Guia de Usuário
```markdown
# Como Fazer X

## O Que Você Vai Aprender
Lista de objetivos.

## Pré-requisitos
O que você precisa saber/ter.

## Passo a Passo
1. Faça isso
2. Depois isso
3. Finalmente isso

## Dicas
Dicas úteis e atalhos.

## Problemas Comuns
Soluções para issues conhecidos.
```

---

## 📚 Recursos Externos

### Acústica de Instrumentos
- [Physics of Didgeridoos - UNSW](https://www.phys.unsw.edu.au/jw/didjeridu.html)
- [Acoustics of Wind Instruments](https://newt.phys.unsw.edu.au/jw/winds.html)
- [Transfer Matrix Method](https://en.wikipedia.org/wiki/Transfer-matrix_method)

### React Native & Expo
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### Deploy & CI/CD
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)

### Google Play & App Store
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [App Store Connect](https://developer.apple.com/app-store-connect/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Apple StoreKit](https://developer.apple.com/documentation/storekit)

---

## 🔗 Links Rápidos

### Documentação Interna
- [README Principal](../README.md)
- [Guia de Contribuição](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md) (em breve)
- [License](../LICENSE)

### Projeto
- [Website](https://didgemap.app)
- [GitHub Repository](https://github.com/yourusername/didgemap)
- [Issues](https://github.com/yourusername/didgemap/issues)
- [Discussions](https://github.com/yourusername/didgemap/discussions)

### Legal
- [Política de Privacidade](https://didgemap.app/privacy-policy.html)
- [Termos de Uso](https://didgemap.app/terms.html) (em breve)

---

## 📞 Suporte

### Para Usuários
- **FAQ:** [docs/guides/FAQ.md](./guides/FAQ.md) (em breve)
- **Email:** contato@didgemap.app

### Para Desenvolvedores
- **Issues:** [GitHub Issues](https://github.com/yourusername/didgemap/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/didgemap/discussions)
- **Contributing:** [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📊 Estatísticas da Documentação

| Categoria | Documentos | Status |
|-----------|------------|--------|
| **Arquitetura** | 1 / 2 | 🟡 Em progresso |
| **Deploy** | 2 / 2 | 🟢 Completo |
| **Guias** | 0 / 2 | 🔴 Pendente |
| **API** | 0 / 1 | 🔴 Pendente |
| **Total** | **3 / 7** | **43%** |

---

## ✅ Checklist de Qualidade

Ao adicionar/atualizar documentação, verifique:

- [ ] Título claro e descritivo
- [ ] Índice (se documento longo)
- [ ] Linguagem clara e concisa
- [ ] Exemplos de código (quando aplicável)
- [ ] Screenshots (quando útil)
- [ ] Links para recursos relacionados
- [ ] Data de última atualização
- [ ] Versão do documento
- [ ] Revisão ortográfica
- [ ] Formatação consistente

---

## 🌟 Hall da Fama - Contribuidores de Documentação

Agradecimentos especiais a todos que contribuíram para a documentação!

<!-- Lista de contribuidores será adicionada aqui -->

---

**Última atualização:** 27/10/2025
**Coordenador de Documentação:** Equipe Didgemap

---

<div align="center">

**Documentação é código também!** 📚

[⬆ Voltar ao topo](#documentação---didgemap)

</div>
