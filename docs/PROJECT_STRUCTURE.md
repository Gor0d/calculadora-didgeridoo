# Estrutura do Projeto - Didgemap

Documentação completa da estrutura de diretórios e arquivos do projeto.

---

## 📂 Estrutura Geral

```
calculadora-didgeridoo/
│
├── 📄 Arquivos de Configuração (Raiz)
├── 📁 src/                    # Código-fonte
├── 📁 assets/                 # Assets estáticos
├── 📁 docs/                   # Documentação
├── 📁 __tests__/              # Testes
└── 📁 .github/                # GitHub workflows
```

---

## 📄 Arquivos de Configuração (Raiz)

```
calculadora-didgeridoo/
├── README.md                   # Documentação principal do projeto
├── CONTRIBUTING.md             # Guia de contribuição
├── LICENSE                     # Licença MIT
├── package.json                # Dependências e scripts npm
├── package-lock.json           # Lock de dependências
│
├── app.json                    # Configuração principal do Expo
├── eas.json                    # Configuração EAS Build/Submit
├── babel.config.js             # Configuração Babel
├── metro.config.js             # Configuração Metro bundler
│
├── .eslintrc.js                # Configuração ESLint
├── .prettierrc                 # Configuração Prettier
├── jest.config.js              # Configuração Jest
│
├── .gitignore                  # Arquivos ignorados pelo Git
├── .gitattributes              # Atributos Git
│
├── vercel.json                 # Configuração Vercel (deploy web)
├── netlify.toml                # Configuração Netlify (alternativa)
│
├── index.js                    # Entry point do app
└── App.js                      # Componente raiz
```

### Propósito dos Arquivos Principais

#### package.json
```json
{
  "name": "didgemap",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "test": "jest",
    "build:android:production": "eas build --platform android --profile production"
  },
  "dependencies": { /* ... */ },
  "devDependencies": { /* ... */ }
}
```
**Contém:** Scripts, dependências, metadados do projeto

#### app.json
**Contém:** Configuração do Expo (nome, ícones, splash, permissões, etc)

#### eas.json
**Contém:** Perfis de build e submit para EAS

---

## 📁 src/ - Código Fonte

```
src/
├── components/         # Componentes reutilizáveis
├── screens/           # Telas principais
├── services/          # Lógica de negócio
├── hooks/             # Custom React hooks
├── navigation/        # Configuração de navegação
├── store/             # Redux store
├── utils/             # Utilitários
└── __tests__/         # Testes unitários
```

### 📂 src/components/

Componentes React Native reutilizáveis organizados por domínio:

```
components/
│
├── common/                      # Componentes genéricos
│   ├── Button.js               # Botão customizado
│   ├── Input.js                # Campo de entrada
│   ├── Card.js                 # Card container
│   ├── Modal.js                # Modal genérico
│   ├── LoadingSpinner.js       # Indicador de loading
│   └── ErrorBoundary.js        # Error boundary
│
├── acoustic/                    # Componentes de acústica
│   ├── FrequencyDisplay.js     # Exibe frequência
│   ├── HarmonicsChart.js       # Gráfico de harmônicos
│   ├── ImpedanceGraph.js       # Gráfico de impedância
│   └── NoteDisplay.js          # Exibe nota musical
│
├── geometry/                    # Componentes de geometria
│   ├── GeometryEditor.js       # Editor de pontos
│   ├── GeometryChart.js        # Visualização 2D
│   ├── PointsList.js           # Lista de pontos
│   └── GeometryPresets.js      # Templates prontos
│
├── export/                      # Componentes de exportação
│   ├── PDFExporter.js          # Exportar para PDF
│   ├── JSONExporter.js         # Exportar para JSON
│   └── ImageExporter.js        # Exportar imagem
│
└── settings/                    # Componentes de configurações
    ├── UnitSelector.js         # Seletor de unidades
    ├── LanguageSelector.js     # Seletor de idioma
    └── ThemeToggle.js          # Toggle de tema
```

**Convenções:**
- Um componente por arquivo
- Nome do arquivo = Nome do componente (PascalCase)
- Exportação default
- PropTypes ou TypeScript types

### 📂 src/screens/

Telas principais do aplicativo:

```
screens/
├── HomeScreen.js               # Tela inicial
├── CalculatorScreen.js         # Calculadora principal
├── ProjectsScreen.js           # Gerenciador de projetos
├── ProjectDetailScreen.js      # Detalhes de um projeto
├── SettingsScreen.js           # Configurações
├── AboutScreen.js              # Sobre o app
└── HelpScreen.js               # Ajuda/tutorial
```

**Convenções:**
- Sufixo `Screen` no nome
- Um screen por arquivo
- Conectado ao Redux se necessário
- Navegação via React Navigation

### 📂 src/services/

Lógica de negócio e serviços:

```
services/
│
├── acoustic/                    # Engine acústico
│   ├── AcousticEngine.js       # Classe principal
│   ├── FrequencyCalculator.js  # Cálculos de frequência
│   ├── HarmonicAnalyzer.js     # Análise harmônica
│   ├── ImpedanceCalculator.js  # Cálculo de impedância
│   └── __tests__/              # Testes do engine
│       ├── AcousticEngine.test.js
│       └── FrequencyCalculator.test.js
│
├── audio/                       # Síntese de áudio
│   ├── AudioSynthesizer.js     # Sintetizador
│   ├── AudioPlayer.js          # Player de áudio
│   └── __tests__/
│       └── AudioSynthesizer.test.js
│
├── storage/                     # Persistência
│   ├── StorageService.js       # Interface de storage
│   ├── ProjectStorage.js       # Salvar/carregar projetos
│   ├── SettingsStorage.js      # Configurações
│   └── __tests__/
│       └── StorageService.test.js
│
├── export/                      # Exportação
│   ├── PDFExportService.js     # Gerar PDFs
│   ├── JSONExportService.js    # Exportar JSON
│   ├── CSVExportService.js     # Exportar CSV
│   └── ImageExportService.js   # Capturar imagens
│
├── i18n/                        # Internacionalização
│   ├── LocalizationService.js  # Service principal
│   ├── translations/
│   │   ├── pt-BR.json         # Português
│   │   └── en.json            # Inglês
│   └── __tests__/
│       └── LocalizationService.test.js
│
├── logging/                     # Logs e analytics
│   ├── LoggingService.js       # Logger
│   └── AnalyticsService.js     # Analytics (opcional)
│
└── crashReporting/              # Error tracking
    └── SentryConfig.js         # Configuração Sentry
```

**Convenções:**
- Classes ou módulos exportáveis
- Lógica sem dependência de UI
- Testáveis independentemente
- Documentação JSDoc

### 📂 src/hooks/

Custom React hooks:

```
hooks/
├── useAcousticCalculation.js   # Hook para cálculos acústicos
├── useAudioPlayer.js           # Hook para audio player
├── useProjects.js              # Hook para gerenciar projetos
├── useSettings.js              # Hook para configurações
├── useGeometry.js              # Hook para geometria
└── useExport.js                # Hook para exportação
```

**Convenções:**
- Prefixo `use`
- Encapsula lógica reutilizável
- Pode usar outros hooks
- Retorna objetos ou arrays

**Exemplo:**
```javascript
const useAcousticCalculation = () => {
  const dispatch = useDispatch();
  const geometry = useSelector(state => state.geometry);

  const calculate = useCallback(async () => {
    // ... lógica
  }, [geometry]);

  return { calculate };
};
```

### 📂 src/navigation/

Configuração de navegação:

```
navigation/
├── AppNavigator.js             # Navigator principal
├── TabNavigator.js             # Bottom tabs
├── StackNavigator.js           # Stack navigation
└── navigationTypes.js          # Types/constants
```

**Stack:**
```
App
 └── TabNavigator
      ├── HomeStack
      │    ├── HomeScreen
      │    └── ProjectDetailScreen
      ├── CalculatorStack
      │    └── CalculatorScreen
      ├── ProjectsStack
      │    ├── ProjectsScreen
      │    └── ProjectDetailScreen
      └── SettingsStack
           ├── SettingsScreen
           └── AboutScreen
```

### 📂 src/store/

Redux store e slices:

```
store/
├── store.js                    # Configuração da store
│
├── slices/                     # Redux slices
│   ├── geometrySlice.js       # Estado de geometria
│   ├── calculationSlice.js    # Resultados de cálculos
│   ├── projectsSlice.js       # Projetos salvos
│   ├── settingsSlice.js       # Configurações do app
│   └── audioSlice.js          # Estado do audio player
│
└── __tests__/                  # Testes dos slices
    ├── geometrySlice.test.js
    └── calculationSlice.test.js
```

**Estrutura de um Slice:**
```javascript
const geometrySlice = createSlice({
  name: 'geometry',
  initialState: {
    points: [],
    isDirty: false
  },
  reducers: {
    setPoints: (state, action) => { /* ... */ },
    addPoint: (state, action) => { /* ... */ },
    clearGeometry: (state) => { /* ... */ }
  }
});
```

### 📂 src/utils/

Utilitários e helpers:

```
utils/
├── constants.js                # Constantes globais
├── validators.js               # Funções de validação
├── formatters.js               # Formatação de dados
├── converters.js               # Conversão de unidades
├── calculations.js             # Cálculos auxiliares
└── __tests__/                  # Testes dos utils
    ├── validators.test.js
    ├── formatters.test.js
    └── converters.test.js
```

**Exemplos:**

**constants.js**
```javascript
export const SPEED_OF_SOUND = 343; // m/s
export const DEFAULT_TEMPERATURE = 20; // °C
export const A4_FREQUENCY = 440; // Hz
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
```

**validators.js**
```javascript
export const isValidGeometry = (points) => {
  return Array.isArray(points) && points.length >= 2;
};

export const isValidFrequency = (freq) => {
  return typeof freq === 'number' && freq > 0 && freq < 20000;
};
```

**formatters.js**
```javascript
export const formatFrequency = (freq) => {
  return `${freq.toFixed(2)} Hz`;
};

export const formatNote = (note) => {
  return `${note.note}${note.octave}`;
};
```

---

## 📁 assets/ - Assets Estáticos

```
assets/
├── didgemap-flat.png           # Logo principal (512x512)
├── adaptive-icon.png           # Ícone adaptativo Android
├── splash-icon.png             # Splash screen
├── icon.png                    # Ícone iOS
│
├── images/                     # Imagens gerais
│   ├── tutorial/              # Imagens do tutorial
│   └── examples/              # Exemplos visuais
│
├── fonts/                      # Fontes customizadas
│   └── (se houver)
│
└── sounds/                     # Áudios (se houver)
    └── (se houver)
```

**Convenções:**
- Imagens em PNG ou JPG
- SVGs para ícones quando possível
- Nomes descritivos em kebab-case

---

## 📁 docs/ - Documentação

```
docs/
├── README.md                   # Índice da documentação
├── PROJECT_STRUCTURE.md        # Este arquivo
│
├── architecture/               # Docs técnicos
│   ├── TECHNICAL_DOCUMENTATION.md
│   └── CODE_STRUCTURE.md
│
├── deployment/                 # Docs de deploy
│   ├── BUILD_AND_DEPLOY.md
│   └── GOOGLE_PLAY_BILLING_SETUP.md
│
├── guides/                     # Guias de uso
│   ├── USER_GUIDE.md
│   └── FAQ.md
│
├── api/                        # API reference
│   └── API_REFERENCE.md
│
└── screenshots/                # Capturas de tela
    ├── home.png
    ├── calculator.png
    └── projects.png
```

---

## 📁 __tests__/ - Testes

Os testes estão distribuídos junto aos arquivos que testam:

```
src/
├── services/
│   ├── acoustic/
│   │   ├── AcousticEngine.js
│   │   └── __tests__/
│   │       └── AcousticEngine.test.js
│   └── storage/
│       ├── StorageService.js
│       └── __tests__/
│           └── StorageService.test.js
│
└── utils/
    ├── validators.js
    └── __tests__/
        └── validators.test.js
```

**Convenções:**
- Pasta `__tests__` no mesmo nível do código testado
- Nome do arquivo: `[arquivo].test.js`
- Usar Jest + React Native Testing Library

---

## 📁 .github/ - GitHub Workflows

```
.github/
├── workflows/
│   ├── build.yml              # CI/CD para builds
│   ├── test.yml               # Testes automáticos
│   └── deploy.yml             # Deploy automático
│
├── ISSUE_TEMPLATE/             # Templates de issues
│   ├── bug_report.md
│   └── feature_request.md
│
└── PULL_REQUEST_TEMPLATE.md    # Template de PR
```

---

## 🗂 Organização por Domínio

### Domínio: Acústica

```
Acústica/
├── Services:   src/services/acoustic/
├── Components: src/components/acoustic/
├── Hooks:      src/hooks/useAcousticCalculation.js
├── Store:      src/store/slices/calculationSlice.js
└── Tests:      src/services/acoustic/__tests__/
```

### Domínio: Projetos

```
Projetos/
├── Services:   src/services/storage/ProjectStorage.js
├── Components: src/components/geometry/
├── Screens:    src/screens/ProjectsScreen.js
├── Hooks:      src/hooks/useProjects.js
├── Store:      src/store/slices/projectsSlice.js
└── Tests:      (vários)
```

### Domínio: Audio

```
Audio/
├── Services:   src/services/audio/
├── Components: src/components/acoustic/ (player controls)
├── Hooks:      src/hooks/useAudioPlayer.js
├── Store:      src/store/slices/audioSlice.js
└── Tests:      src/services/audio/__tests__/
```

---

## 📊 Métricas do Projeto

### Contagem de Arquivos (Aproximada)

| Categoria | Quantidade |
|-----------|------------|
| **Componentes** | ~45 arquivos |
| **Screens** | ~7 arquivos |
| **Services** | ~15 arquivos |
| **Hooks** | ~6 arquivos |
| **Utils** | ~8 arquivos |
| **Store** | ~6 arquivos |
| **Testes** | ~30 arquivos |
| **Docs** | ~10 arquivos |
| **Total (src/)** | **~130 arquivos** |

### Linhas de Código (Aproximada)

| Categoria | LOC |
|-----------|-----|
| **Source Code** | ~8,000 |
| **Tests** | ~2,000 |
| **Docs** | ~5,000 |
| **Total** | **~15,000** |

---

## 🎯 Arquivos Importantes

### Para Desenvolvedores

| Arquivo | Propósito |
|---------|-----------|
| [README.md](../README.md) | Visão geral do projeto |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Como contribuir |
| [package.json](../package.json) | Dependências e scripts |
| [app.json](../app.json) | Configuração Expo |
| [eas.json](../eas.json) | Configuração de build |

### Para Deploy

| Arquivo | Propósito |
|---------|-----------|
| [BUILD_AND_DEPLOY.md](./deployment/BUILD_AND_DEPLOY.md) | Guia de build |
| [vercel.json](../vercel.json) | Config Vercel |
| [netlify.toml](../netlify.toml) | Config Netlify |

### Para Entender o Código

| Arquivo | Propósito |
|---------|-----------|
| [TECHNICAL_DOCUMENTATION.md](./architecture/TECHNICAL_DOCUMENTATION.md) | Documentação técnica |
| [src/services/acoustic/AcousticEngine.js](../src/services/acoustic/AcousticEngine.js) | Engine principal |
| [src/store/store.js](../src/store/store.js) | Redux store |

---

## 🔍 Como Encontrar Arquivos

### Por Funcionalidade

**"Quero mudar os cálculos acústicos"**
→ `src/services/acoustic/AcousticEngine.js`

**"Quero adicionar um novo componente de UI"**
→ `src/components/[dominio]/NovoComponente.js`

**"Quero mudar a navegação"**
→ `src/navigation/AppNavigator.js`

**"Quero adicionar uma nova tela"**
→ `src/screens/NovaScreen.js`

**"Quero mudar a logo ou ícones"**
→ `assets/`

**"Quero adicionar testes"**
→ `src/[pasta]/__tests__/`

**"Quero atualizar a documentação"**
→ `docs/`

### Por Problema

**"App não compila"**
→ Verificar: `package.json`, `babel.config.js`, `metro.config.js`

**"Build falha"**
→ Verificar: `eas.json`, `app.json`

**"Testes falhando"**
→ Verificar: `jest.config.js`, arquivos de teste

**"Lint errors"**
→ Verificar: `.eslintrc.js`, `.prettierrc`

---

## 🚀 Comandos Úteis

### Navegação Rápida (VS Code)

```bash
# Abrir arquivo por nome
Ctrl+P (Windows/Linux) ou Cmd+P (Mac)

# Buscar em arquivos
Ctrl+Shift+F (Windows/Linux) ou Cmd+Shift+F (Mac)

# Ir para símbolo
Ctrl+T (Windows/Linux) ou Cmd+T (Mac)
```

### CLI

```bash
# Encontrar arquivo
find . -name "AcousticEngine.js"

# Buscar texto em arquivos
grep -r "calculateFrequency" src/

# Listar estrutura de diretórios
tree -L 2 src/
```

---

## 📚 Recursos Adicionais

- [Documentação Técnica Completa](./architecture/TECHNICAL_DOCUMENTATION.md)
- [Guia de Build](./deployment/BUILD_AND_DEPLOY.md)
- [Guia de Contribuição](../CONTRIBUTING.md)

---

**Última atualização:** 27/10/2025
**Versão:** 1.0
