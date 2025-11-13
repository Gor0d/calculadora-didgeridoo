# Documentação Técnica - Didgemap

## Visão Geral

Didgemap é uma calculadora acústica profissional para design e análise de didgeridoos, construída com React Native + Expo.

---

## Índice

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Cálculos Acústicos](#cálculos-acústicos)
3. [Estrutura de Código](#estrutura-de-código)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Precisão e Limitações](#precisão-e-limitações)
6. [APIs e Serviços](#apis-e-serviços)

---

## Arquitetura do Sistema

### Stack Tecnológico

#### Frontend
- **Framework:** React Native 0.79.5
- **Plataforma:** Expo 53.0.20
- **UI Library:** React Native Components
- **Navegação:** React Navigation 7.x
- **State Management:** Redux Toolkit

#### Serviços
- **Audio:** Expo AV
- **Storage:** AsyncStorage
- **Export:** jsPDF, html2pdf
- **Graphics:** React Native SVG
- **Error Tracking:** Sentry

### Arquitetura de Camadas

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Screens, Components, UI)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Business Logic Layer           │
│  (Services, Hooks, Utils)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Layer                     │
│  (Redux Store, AsyncStorage)        │
└─────────────────────────────────────┘
```

### Componentes Principais

#### 1. Acoustic Engine
**Localização:** `src/services/acoustic/AcousticEngine.js`

Responsável por:
- Cálculos de frequências fundamentais
- Análise harmônica
- Impedância acústica
- Conversão para notas musicais

#### 2. Geometry Manager
**Localização:** `src/services/geometry/`

Funções:
- Validação de pontos
- Interpolação de geometria
- Cálculos de dimensões
- Exportação de dados

#### 3. Audio Synthesizer
**Localização:** `src/services/audio/`

Capabilities:
- Síntese de tons puros
- Geração de harmônicos
- Mixagem de frequências
- Preview sonoro em tempo real

#### 4. Storage Service
**Localização:** `src/services/storage/`

Features:
- Persistência de projetos
- Cache de cálculos
- Gerenciamento de favoritos
- Exportação/importação

---

## Cálculos Acústicos

### Fundamentos Teóricos

#### Modelo de Tubo Acústico

O didgeridoo é modelado como um **tubo acústico aberto em uma extremidade**:

```
[Bocal - Fechado] ←──────── L ──────→ [Saída - Aberta]
                    Vibrações do ar
```

### Fórmulas Base

#### 1. Frequência Fundamental
```javascript
f₀ = c / (4 × L_eff)
```

Onde:
- `c` = velocidade do som (343 m/s a 20°C)
- `L_eff` = comprimento efetivo (com correções)

#### 2. Comprimento Efetivo
```javascript
L_eff = L_physical + (0.6 × r_final)
```

**Correção de extremidade:** Tubos abertos ressoam como se fossem mais longos.

#### 3. Harmônicos
```javascript
f_n = (2n - 1) × f₀    onde n = 1, 2, 3, ...
```

Para tubos cônicos:
```javascript
f_n = n × f₀           onde n = 1, 2, 3, ...
```

### Correções Aplicadas

#### A) Correção de Bocal
```javascript
const mouthpieceEfficiency = 0.85;
f_corrected = f_base × mouthpieceEfficiency;
```

**Justificativa:** O bocal não é perfeitamente acoplado ao tubo, perdendo ~15% de energia.

#### B) Correção de Conicidade
```javascript
const tapering = (d_final - d_initial) / length;
const conicityFactor = 1 + (tapering × 0.3);
```

**Impacto:** Tubos cônicos aumentam frequência em relação a cilíndricos.

#### C) Correção de Temperatura
```javascript
const speedOfSound = 331.3 + (0.606 × temperature);
```

**Default:** 343 m/s (20°C)

### Implementação - AcousticEngine

#### Classe Principal
```javascript
class AcousticEngine {
  constructor() {
    this.speedOfSound = 343; // m/s
    this.temperatureC = 20;
    this.referenceA4 = 440; // Hz
  }

  calculateFundamental(geometry) {
    // 1. Validar geometria
    this.validateGeometry(geometry);

    // 2. Calcular comprimento efetivo
    const Leff = this.calculateEffectiveLength(geometry);

    // 3. Frequência base
    const f0 = this.speedOfSound / (4 * Leff);

    // 4. Aplicar correções
    const corrected = this.applyCorrections(f0, geometry);

    return corrected;
  }

  calculateHarmonics(fundamental, geometry) {
    const harmonics = [];
    const conicityFactor = this.getConicityFactor(geometry);

    for (let n = 1; n <= 8; n++) {
      const multiple = conicityFactor > 0.5 ? n : (2*n - 1);
      const freq = fundamental * multiple;

      // Supressão probabilística
      if (Math.random() < this.getSuppressionFactor(n)) {
        harmonics.push({
          number: n,
          frequency: freq,
          note: this.frequencyToNote(freq),
          amplitude: this.calculateAmplitude(n)
        });
      }
    }

    return harmonics;
  }

  frequencyToNote(frequency) {
    // Sistema temperado igual
    const semitonesFromA4 = 12 * Math.log2(frequency / this.referenceA4);
    const noteIndex = Math.round(semitonesFromA4) % 12;
    const octave = Math.floor((semitonesFromA4 + 57) / 12);
    const cents = Math.round((semitonesFromA4 - Math.round(semitonesFromA4)) * 100);

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    return {
      note: notes[noteIndex],
      octave: octave,
      cents: cents,
      frequency: frequency
    };
  }
}
```

### Validação e Testes

#### Ranges Esperados
```javascript
const VALID_RANGES = {
  fundamental: { min: 30, max: 200 },      // Hz
  length: { min: 500, max: 3000 },         // mm
  diameter: { min: 15, max: 80 },          // mm
  harmonics: { min: 2, max: 8 }            // número de harmônicos
};
```

#### Testes Automáticos
```javascript
describe('AcousticEngine', () => {
  test('calcula fundamental corretamente', () => {
    const geometry = createCylindricalGeometry(1200, 35);
    const f0 = engine.calculateFundamental(geometry);
    expect(f0).toBeGreaterThan(60);
    expect(f0).toBeLessThan(80);
  });

  test('harmônicos seguem progressão natural', () => {
    const harmonics = engine.calculateHarmonics(65, geometry);
    const ratios = harmonics.map(h => h.frequency / 65);
    expect(ratios[1]).toBeCloseTo(3, 0.2);
    expect(ratios[2]).toBeCloseTo(5, 0.3);
  });
});
```

---

## Estrutura de Código

### Organização de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Botões, inputs, cards
│   ├── acoustic/       # Visualizações acústicas
│   ├── geometry/       # Editores de geometria
│   └── export/         # Exportação de dados
│
├── screens/            # Telas principais
│   ├── HomeScreen.js
│   ├── CalculatorScreen.js
│   ├── ProjectsScreen.js
│   └── SettingsScreen.js
│
├── services/           # Lógica de negócio
│   ├── acoustic/       # Engine acústico
│   ├── audio/          # Síntese de áudio
│   ├── storage/        # Persistência
│   ├── export/         # Exportação (PDF, JSON)
│   ├── i18n/           # Internacionalização
│   └── logging/        # Logs e analytics
│
├── hooks/              # Custom React hooks
│   ├── useAcousticCalculation.js
│   ├── useAudioPlayer.js
│   └── useProjects.js
│
├── navigation/         # Configuração de rotas
│   └── AppNavigator.js
│
├── store/              # Redux store
│   ├── slices/
│   │   ├── geometrySlice.js
│   │   ├── calculationSlice.js
│   │   └── settingsSlice.js
│   └── store.js
│
└── utils/              # Utilitários
    ├── constants.js
    ├── validators.js
    └── formatters.js
```

### Convenções de Código

#### Nomenclatura
```javascript
// Components: PascalCase
const GeometryEditor = () => {};

// Functions: camelCase
const calculateFrequency = () => {};

// Constants: UPPER_SNAKE_CASE
const DEFAULT_SPEED_OF_SOUND = 343;

// Files: PascalCase para components, camelCase para services
GeometryEditor.js
acousticEngine.js
```

#### Imports
```javascript
// 1. React e bibliotecas externas
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Navegação
import { useNavigation } from '@react-navigation/native';

// 3. Redux
import { useDispatch, useSelector } from 'react-redux';

// 4. Componentes locais
import GeometryEditor from '../components/geometry/GeometryEditor';

// 5. Services e utils
import AcousticEngine from '../services/acoustic/AcousticEngine';
import { formatFrequency } from '../utils/formatters';

// 6. Styles
import styles from './styles';
```

---

## Fluxo de Dados

### Ciclo de Cálculo Acústico

```
1. User Input (Geometry)
         ↓
2. Validation (GeometryValidator)
         ↓
3. Redux Store Update (geometrySlice)
         ↓
4. Trigger Calculation (useAcousticCalculation hook)
         ↓
5. AcousticEngine.calculate()
         ↓
6. Results → Redux Store (calculationSlice)
         ↓
7. UI Update (Components re-render)
         ↓
8. Optional: Audio Preview / Export
```

### State Management

#### Redux Slices

**geometrySlice.js**
```javascript
const geometrySlice = createSlice({
  name: 'geometry',
  initialState: {
    points: [],
    metadata: {},
    isDirty: false
  },
  reducers: {
    setPoints: (state, action) => {
      state.points = action.payload;
      state.isDirty = true;
    },
    clearGeometry: (state) => {
      state.points = [];
      state.isDirty = false;
    }
  }
});
```

**calculationSlice.js**
```javascript
const calculationSlice = createSlice({
  name: 'calculation',
  initialState: {
    fundamental: null,
    harmonics: [],
    impedance: [],
    isCalculating: false,
    error: null
  },
  reducers: {
    startCalculation: (state) => {
      state.isCalculating = true;
      state.error = null;
    },
    calculationSuccess: (state, action) => {
      state.isCalculating = false;
      state.fundamental = action.payload.fundamental;
      state.harmonics = action.payload.harmonics;
    },
    calculationError: (state, action) => {
      state.isCalculating = false;
      state.error = action.payload;
    }
  }
});
```

### Custom Hooks

#### useAcousticCalculation
```javascript
const useAcousticCalculation = () => {
  const dispatch = useDispatch();
  const geometry = useSelector(state => state.geometry.points);
  const settings = useSelector(state => state.settings);

  const calculate = useCallback(async () => {
    try {
      dispatch(startCalculation());

      const engine = new AcousticEngine(settings);
      const results = await engine.calculate(geometry);

      dispatch(calculationSuccess(results));

      return results;
    } catch (error) {
      dispatch(calculationError(error.message));
      throw error;
    }
  }, [geometry, settings, dispatch]);

  return { calculate };
};
```

---

## Precisão e Limitações

### O Que o Sistema Faz Bem ✅

1. **Estimativas de Frequência Fundamental**
   - Precisão: ±5-15%
   - Válido para: Geometrias cilíndricas e cônicas simples

2. **Comparação Relativa**
   - Excelente para comparar diferentes designs
   - Útil para otimização de geometria

3. **Previsão de Série Harmônica**
   - Identifica harmônicos principais
   - Boa aproximação para tubos regulares

### Limitações Conhecidas ⚠️

#### Fatores Não Modelados

1. **Material e Construção**
   - Madeira vs PVC vs Fibra
   - Rugosidade interna
   - Densidade da parede

2. **Fatores Humanos**
   - Técnica de sopro
   - Pressão do ar
   - Acoplamento boca-bocal
   - Variação de embocadura

3. **Condições Ambientais**
   - Temperatura exata
   - Umidade relativa
   - Pressão atmosférica

4. **Geometrias Complexas**
   - Irregularidades naturais
   - Variações abruptas
   - Assimetrias

### Precisão Esperada

| Aspecto | Precisão | Uso Recomendado |
|---------|----------|-----------------|
| Frequência fundamental | ±5-15% | Estimativa inicial |
| Harmônicos | ±10-20% | Orientação geral |
| Notas musicais | ±20-50 cents | Guia de afinação |
| Impedância | Qualitativo | Comparação relativa |

### Recomendações de Uso

#### ✅ Use o Didgemap para:
- Design inicial de instrumentos
- Comparação entre geometrias
- Prototipagem virtual
- Educação e experimentação
- Otimização iterativa

#### ❌ NÃO use para:
- Especificações finais exatas
- Garantia de afinação precisa
- Validação científica rigorosa
- Produção em escala sem testes

### Validação Recomendada

```
Didgemap Design → Protótipo Físico → Medição Real → Ajustes → Final
```

**Ferramentas de validação:**
- Afinador cromático profissional
- Analisador de espectro
- Medidor de SPL
- Software de análise acústica (Audacity, etc)

---

## APIs e Serviços

### Audio Synthesis API

#### Classe: AudioSynthesizer
```javascript
class AudioSynthesizer {
  async playFrequency(frequency, duration = 1000) {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    oscillator.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration/1000);
  }

  async playHarmonicSeries(fundamental, harmonics, duration = 2000) {
    // Mixagem de múltiplas frequências
    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();

    harmonics.forEach((harmonic, index) => {
      const osc = audioContext.createOscillator();
      osc.frequency.value = harmonic.frequency;
      osc.type = 'sine';

      const harmGain = audioContext.createGain();
      harmGain.gain.value = harmonic.amplitude;

      osc.connect(harmGain);
      harmGain.connect(gainNode);
      gainNode.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration/1000);
    });
  }
}
```

### Storage API

#### Interface
```javascript
interface StorageService {
  // Projetos
  saveProject(project: Project): Promise<string>;
  loadProject(id: string): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<Project[]>;

  // Favoritos
  addFavorite(projectId: string): Promise<void>;
  removeFavorite(projectId: string): Promise<void>;
  getFavorites(): Promise<string[]>;

  // Settings
  saveSetting(key: string, value: any): Promise<void>;
  loadSetting(key: string): Promise<any>;
}
```

### Export API

#### Formatos Suportados
- **JSON:** Dados completos do projeto
- **PDF:** Relatório visual com gráficos
- **CSV:** Dados tabulares
- **Image:** Screenshots da geometria

#### Exemplo: Export PDF
```javascript
import jsPDF from 'jspdf';

class ExportService {
  async exportToPDF(project) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Didgemap - Análise Acústica', 20, 20);

    // Geometria
    doc.setFontSize(14);
    doc.text('Geometria:', 20, 40);
    // ... adicionar dados

    // Resultados
    doc.text('Resultados:', 20, 100);
    doc.text(`Fundamental: ${project.fundamental} Hz`, 30, 110);
    // ... adicionar harmônicos

    // Gráfico (SVG → Canvas → PDF)
    const canvas = await this.renderChart(project);
    doc.addImage(canvas, 'PNG', 20, 150, 170, 100);

    return doc.save(`${project.name}.pdf`);
  }
}
```

---

## Performance

### Otimizações Implementadas

#### 1. Memoization
```javascript
const MemoizedGeometryChart = React.memo(GeometryChart, (prev, next) => {
  return prev.points === next.points &&
         prev.dimensions === next.dimensions;
});
```

#### 2. Debouncing
```javascript
const debouncedCalculate = useMemo(
  () => debounce(calculate, 500),
  [calculate]
);
```

#### 3. Lazy Loading
```javascript
const ExportScreen = lazy(() => import('./screens/ExportScreen'));
```

#### 4. Virtualized Lists
```javascript
<FlatList
  data={projects}
  renderItem={renderProject}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Métricas de Performance

| Operação | Tempo Target | Tempo Atual |
|----------|--------------|-------------|
| Cálculo acústico | < 100ms | ~50ms |
| Renderização gráfica | < 16ms | ~12ms |
| Save projeto | < 200ms | ~150ms |
| Load projeto | < 100ms | ~80ms |

---

## Testes

### Estrutura de Testes

```
src/
└── __tests__/
    ├── services/
    │   ├── AcousticEngine.test.js
    │   ├── StorageService.test.js
    │   └── AudioSynthesizer.test.js
    ├── components/
    │   ├── GeometryEditor.test.js
    │   └── ResultsDisplay.test.js
    └── utils/
        ├── validators.test.js
        └── formatters.test.js
```

### Executar Testes
```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Cobertura Target
- **Statements:** > 80%
- **Branches:** > 70%
- **Functions:** > 80%
- **Lines:** > 80%

---

## Segurança

### Dados do Usuário
- ✅ Armazenamento local (AsyncStorage)
- ✅ Sem envio de dados para servidores
- ✅ Sem tracking de usuário
- ✅ Sem coleta de analytics pessoais

### Error Tracking
- **Sentry:** Apenas erros técnicos
- **Sem PII:** Nenhuma informação pessoal enviada
- **Opt-out:** Usuário pode desabilitar

---

## Próximas Melhorias Técnicas

### Curto Prazo
1. Implementar Transfer Matrix Method completo
2. Adicionar análise de impedância real
3. Melhorar precisão de harmônicos
4. Suporte a geometrias irregulares

### Médio Prazo
1. Simulação 3D WebGL
2. Machine Learning para calibração
3. Backend para sync de projetos
4. Análise de áudio real (FFT)

### Longo Prazo
1. FEA (Finite Element Analysis)
2. Simulação de materiais
3. Comunidade de makers
4. Marketplace de designs

---

**Última atualização:** 27/10/2025
**Versão:** 2.0
**Responsável:** Equipe Didgemap
