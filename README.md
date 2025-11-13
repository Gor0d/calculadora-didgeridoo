# Didgemap - Calculadora Profissional de Didgeridoo

<div align="center">

![Didgemap Logo](./assets/didgemap-flat.png)

**Ferramenta completa para design e análise acústica de didgeridoos**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/didgemap)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-53.0-000020.svg?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev/)

[Website](https://didgemap.app) • [Documentação](#documentação) • [Download](#download) • [Contribuir](#contribuindo)

</div>

---

## 📋 Índice

- [Sobre](#sobre)
- [Recursos](#recursos)
- [Screenshots](#screenshots)
- [Download](#download)
- [Tecnologias](#tecnologias)
- [Começando](#começando)
- [Documentação](#documentação)
- [Desenvolvimento](#desenvolvimento)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Contato](#contato)

---

## 🎺 Sobre

Didgemap é uma calculadora acústica profissional desenvolvida para makers, construtores e entusiastas de didgeridoo. Utilizando métodos científicos de análise acústica, o app permite simular e otimizar o design de didgeridoos antes mesmo da construção física.

### Para Quem é Este App?

- **Construtores profissionais** que querem otimizar seus designs
- **Makers e artesãos** interessados em construir seus próprios instrumentos
- **Músicos** curiosos sobre a acústica de seus instrumentos
- **Estudantes** de física acústica e engenharia de áudio
- **Pesquisadores** em acústica de instrumentos de sopro

---

## ✨ Recursos

### 🔬 Análise Acústica Avançada
- Cálculo de frequência fundamental com alta precisão
- Análise de série harmônica completa
- Espectro de impedância acústica
- Conversão automática para notas musicais (com precisão em cents)
- Suporte a afinação A440 e A432

### 📊 Visualização Interativa
- Representação gráfica 2D da geometria interna
- Zoom e pan para análise detalhada
- Gráficos de impedância em tempo real
- Visualização de distribuição de harmônicos

### 🎵 Preview Sonoro
- Sintetizador de áudio integrado
- Reprodução da frequência fundamental
- Preview de séries harmônicas
- Mixagem de múltiplas frequências

### 💾 Gerenciamento de Projetos
- Salvar e carregar geometrias personalizadas
- Biblioteca de exemplos prontos (cilíndrico, cônico, híbrido)
- Sistema de favoritos
- Histórico de projetos recentes

### 📤 Exportação de Dados
- **PDF:** Relatórios completos com gráficos
- **JSON:** Dados brutos para análise externa
- **CSV:** Tabelas de dados
- **Imagens:** Screenshots de alta resolução

### 🌍 Recursos Profissionais
- **Multi-idioma:** Português (BR) e Inglês
- **Unidades flexíveis:** Métrico (mm, cm, m) e Imperial (in, ft)
- **Modo offline:** Funciona 100% sem internet
- **Sem anúncios:** Experiência limpa e profissional
- **Gratuito:** Completamente free, sem paywall

---

## 📱 Screenshots

<div align="center">

| Tela Principal | Análise Acústica | Projetos |
|:---:|:---:|:---:|
| ![Home](./docs/screenshots/home.png) | ![Analysis](./docs/screenshots/analysis.png) | ![Projects](./docs/screenshots/projects.png) |

</div>

---

## 📥 Download

### Android
<a href="https://play.google.com/store/apps/details?id=com.didgemap.app">
  <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" height="80"/>
</a>

### iOS
<a href="#">
  <img alt="Download on the App Store" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" height="55"/>
</a>

### Web
Acesse diretamente: [https://didgemap.app](https://didgemap.app)

---

## 🛠 Tecnologias

### Core
- **[React Native](https://reactnative.dev/)** 0.79.5 - Framework mobile
- **[Expo](https://expo.dev/)** 53.0 - Plataforma de desenvolvimento
- **[React](https://react.dev/)** 19.0 - Biblioteca UI

### State & Navigation
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - Gerenciamento de estado
- **[React Navigation](https://reactnavigation.org/)** 7.x - Navegação
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Persistência local

### Audio & Graphics
- **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)** - Síntese de áudio
- **[React Native SVG](https://github.com/software-mansion/react-native-svg)** - Gráficos vetoriais

### Export & Utils
- **[jsPDF](https://github.com/parallax/jsPDF)** - Geração de PDFs
- **[html2canvas](https://html2canvas.hertzen.com/)** - Captura de screenshots
- **[Sentry](https://sentry.io/)** - Error tracking

### Dev Tools
- **[Jest](https://jestjs.io/)** - Testes unitários
- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Formatação de código

---

## 🚀 Começando

### Pré-requisitos
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Expo CLI** (opcional, mas recomendado)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/yourusername/didgemap.git
   cd didgemap
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Inicie o app**
   ```bash
   npm start
   # ou
   expo start
   ```

4. **Execute em um dispositivo**
   - **Android:** Pressione `a` no terminal ou escaneie o QR code com Expo Go
   - **iOS:** Pressione `i` no terminal ou escaneie o QR code com Expo Go
   - **Web:** Pressione `w` no terminal

---

## 📚 Documentação

A documentação completa está organizada em:

### Arquitetura & Técnico
- [**Documentação Técnica**](./docs/architecture/TECHNICAL_DOCUMENTATION.md) - Arquitetura, cálculos acústicos, APIs
- [**Estrutura do Código**](./docs/architecture/CODE_STRUCTURE.md) - Organização de arquivos e convenções

### Deploy & Build
- [**Guia de Build e Deploy**](./docs/deployment/BUILD_AND_DEPLOY.md) - Build para Android, iOS e Web
- [**Google Play Billing**](./docs/deployment/GOOGLE_PLAY_BILLING_SETUP.md) - Configuração de monetização (se aplicável)

### Guias de Uso
- [**Guia do Usuário**](./docs/guides/USER_GUIDE.md) - Como usar o app
- [**FAQ**](./docs/guides/FAQ.md) - Perguntas frequentes

### APIs
- [**API Reference**](./docs/api/API_REFERENCE.md) - Documentação das APIs internas

---

## 💻 Desenvolvimento

### Estrutura do Projeto
```
calculadora-didgeridoo/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── screens/         # Telas principais
│   ├── services/        # Lógica de negócio
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Configuração de rotas
│   ├── store/           # Redux store
│   └── utils/           # Utilitários
├── assets/              # Imagens, ícones, fontes
├── docs/                # Documentação
├── __tests__/           # Testes
├── app.json             # Configuração Expo
├── eas.json             # Configuração EAS Build
└── package.json         # Dependências
```

### Scripts Disponíveis

#### Desenvolvimento
```bash
npm start              # Inicia Expo Dev Server
npm run android        # Abre no emulador Android
npm run ios            # Abre no simulador iOS
npm run web            # Abre no navegador
```

#### Build
```bash
npm run build:android:preview      # Build APK preview
npm run build:android:production   # Build AAB produção
npm run build:ios:production       # Build iOS produção
npm run build:web                  # Build web
```

#### Qualidade de Código
```bash
npm test                   # Executa testes
npm run test:watch         # Testes em watch mode
npm run test:coverage      # Coverage report
npm run lint               # Lint e fix
npm run lint:check         # Apenas verificar lint
npm run format             # Formatar código
```

#### Deploy
```bash
npm run submit:android     # Submeter para Play Store
npm run submit:ios         # Submeter para App Store
npm run update:production  # OTA update (Expo)
```

### Fluxo de Trabalho

1. **Criar branch para feature**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Desenvolver e testar**
   ```bash
   npm test
   npm run lint:check
   ```

3. **Commit com mensagens descritivas**
   ```bash
   git commit -m "feat: adiciona visualização 3D"
   ```

4. **Push e abrir Pull Request**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

### Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test AcousticEngine

# Watch mode (útil durante desenvolvimento)
npm run test:watch

# Coverage
npm run test:coverage
```

**Cobertura atual:**
- Statements: 85%
- Branches: 78%
- Functions: 82%
- Lines: 86%

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso [Guia de Contribuição](./CONTRIBUTING.md) antes de submeter PRs.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch** (`git checkout -b feature/MinhaFeature`)
3. **Commit suas mudanças** (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. **Push para a branch** (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

### Diretrizes

- Siga as convenções de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação se necessário
- Mantenha PRs focados e pequenos
- Escreva mensagens de commit claras

### Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/yourusername/didgemap/issues/new) com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Versão do app e dispositivo

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

**Equipe Didgemap**
- Website: [https://didgemap.app](https://didgemap.app)
- Email: contato@didgemap.app

---

## 🙏 Agradecimentos

- Comunidade Expo/React Native
- Pesquisadores em acústica de didgeridoo
- Makers e construtores que inspiraram este projeto
- Todos os contribuidores e testadores

---

## 🔗 Links Úteis

### Projeto
- [Website oficial](https://didgemap.app)
- [Documentação completa](./docs/)
- [Política de Privacidade](https://didgemap.app/privacy-policy.html)
- [Changelog](./CHANGELOG.md)

### Comunidade
- [GitHub Issues](https://github.com/yourusername/didgemap/issues)
- [Discussions](https://github.com/yourusername/didgemap/discussions)

### Recursos Externos
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Acústica de Instrumentos](https://www.phys.unsw.edu.au/jw/didjeridu.html)

---

## ⭐ Mostre seu Apoio

Se este projeto foi útil para você, considere dar uma ⭐ no GitHub!

---

<div align="center">

**Desenvolvido com ❤️ por músicos para músicos**

[⬆ Voltar ao topo](#didgemap---calculadora-profissional-de-didgeridoo)

</div>
