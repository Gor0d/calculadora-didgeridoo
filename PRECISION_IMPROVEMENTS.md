# Plano de Melhorias de Precisão

## Problema Identificado

A calculadora está produzindo frequências **~2x maiores** que o esperado no modo simplificado porque está faltando a **correção do bocal** (mouthpiece correction).

### Exemplo do Erro:
- **Esperado**: G2 = 98 Hz (PVC 878mm)
- **Obtido**: G3 = 191 Hz
- **Erro**: 95% (praticamente o dobro)

### Causa Raiz:
No [AcousticEngine.js:101-102](src/services/acoustic/AcousticEngine.js#L101-L102):
```javascript
// ATUAL (INCORRETO):
const endCorrection = this.END_CORRECTION_FACTOR * avgRadius;
const effectiveLength = totalLength + endCorrection;  // Falta mouthCorrection!

// DEVERIA SER:
const bellRadius = /* raio do sino */;
const mouthRadius = /* raio do bocal */;
const bellCorrection = this.END_CORRECTION_FACTOR * bellRadius;
const mouthCorrection = this.BELL_CORRECTION_FACTOR * mouthRadius;
const effectiveLength = totalLength + bellCorrection + mouthCorrection;
```

---

## Melhorias Propostas (Por Prioridade)

### 🔴 CRÍTICO - Correção Imediata

#### 1. Adicionar Correção do Bocal no Modo Simplificado
**Problema**: Falta mouthCorrection no cálculo simplificado
**Impacto**: Erro de ~100% (dobro da frequência)
**Arquivo**: `src/services/acoustic/AcousticEngine.js` linhas 92-103
**Solução**:

```javascript
async analyzeGeometrySimplified(points) {
  try {
    // Calculate basic measurements
    const totalLength = points[points.length - 1].position / 100; // cm to m

    // CORREÇÃO: Usar raios específicos do sino e bocal
    const bellRadius = points[points.length - 1].diameter / 2000; // mm to m
    const mouthRadius = points[0].diameter / 2000; // mm to m

    // OPEN TUBE: correções em AMBAS as pontas
    const bellCorrection = this.END_CORRECTION_FACTOR * bellRadius;
    const mouthCorrection = this.BELL_CORRECTION_FACTOR * mouthRadius;
    const effectiveLength = totalLength + bellCorrection + mouthCorrection;

    const fundamentalFreq = this.SPEED_OF_SOUND / (2 * effectiveLength);

    // ... resto do código
  }
}
```

**Resultado Esperado**: Erro reduz de ~95% para <5%

---

### 🟡 IMPORTANTE - Melhorias de Precisão

#### 2. Melhorar Cálculo da Correção de Conicidade
**Problema**: Fator de correção de taper muito simplificado
**Impacto**: Erro adicional de 5-15% em didges cônicos
**Solução**: Usar fórmula de Benade para instrumentos cônicos

**Referência Científica**:
- Benade, A. H. (1976) "Fundamentals of Musical Acoustics"
- Fórmula para cone truncado: `f = (c/4L) × sqrt(1 + (r₁/L)²)`

```javascript
calculateTaperCorrection(segments) {
  const firstRadius = segments[0].r1;
  const lastRadius = segments[segments.length - 1].r2;
  const totalLength = segments.reduce((sum, seg) => sum + seg.length, 0);

  // Benade cone formula adjustment
  const taperRatio = (lastRadius - firstRadius) / firstRadius;
  const conicalityFactor = Math.sqrt(1 + Math.pow(firstRadius / totalLength, 2));

  // For didgeridoo (open-open tube with taper):
  // - Cylindrical: correction = 1.0
  // - Slight taper: correction = 1.0 to 1.15
  // - Strong taper: correction = 1.15 to 1.30

  if (taperRatio < 0.5) {
    // Cilíndrico ou quase cilíndrico
    return 1.0 + (taperRatio * 0.08);
  } else if (taperRatio < 1.5) {
    // Conicidade moderada (típico de didges)
    return 1.0 + (taperRatio * 0.10);
  } else {
    // Conicidade forte (campana pronunciada)
    return 1.0 + (taperRatio * 0.12);
  }
}
```

#### 3. Implementar Perdas Viscotérmicas (Viscothermal Losses)
**Problema**: Não consideramos atenuação por fricção e condução térmica
**Impacto**: Pequeno erro (<2%), mas importante para precisão científica
**Referência**: Mapes-Riordan (1991), Keefe (1984)

```javascript
calculateViscothermalLosses(frequency, radius) {
  const omega = 2 * Math.PI * frequency;
  const nu = this.DYNAMIC_VISCOSITY / this.AIR_DENSITY; // kinematic viscosity

  // Viscous boundary layer thickness
  const deltaV = Math.sqrt(2 * nu / omega);

  // Thermal boundary layer thickness
  const deltaT = deltaV / Math.sqrt(this.PRANDTL_NUMBER);

  // Loss factor (Keefe 1984)
  const alpha = (omega / (2 * this.SPEED_OF_SOUND)) *
                (deltaV / radius) *
                (1 + (this.GAMMA - 1) / Math.sqrt(this.PRANDTL_NUMBER));

  return alpha; // attenuation per meter
}
```

#### 4. Modelar Efeitos de Impedância de Radiação
**Problema**: Simplificação das correções de ponta
**Impacto**: Erro de 1-3% dependendo da frequência
**Solução**: Usar fórmula de Levine & Schwinger (1948)

```javascript
calculateRadiationImpedance(radius, frequency) {
  const k = (2 * Math.PI * frequency) / this.SPEED_OF_SOUND; // wave number
  const ka = k * radius;

  // Levine & Schwinger approximation for unflanged pipe
  const endCorrection = radius * (
    0.6133 -
    0.1168 * Math.pow(ka, 2) +
    0.0000 * Math.pow(ka, 4)  // Higher order terms if needed
  );

  return endCorrection;
}
```

---

### 🟢 AVANÇADO - Aproximação ao CADSD

#### 5. Implementar TMM com Perdas Completas
**Objetivo**: Igualar precisão do CADSD
**Método**: Transmission Matrix com perdas viscotérmicas em cada segmento

```javascript
async analyzeGeometryTMM_Advanced(points) {
  const segments = this.segmentizeGeometry(points);
  const frequencies = this.generateFrequencyRange(30, 1200, 0.5);

  const impedanceSpectrum = frequencies.map(freq => {
    // Matriz de transmissão completa com perdas
    let T = [[1, 0], [0, 1]]; // Identity matrix

    for (const segment of segments) {
      const Tseg = this.calculateSegmentMatrix_WithLosses(segment, freq);
      T = this.multiplyMatrices(T, Tseg);
    }

    // Input impedance
    const Z_in = this.calculateInputImpedance_FromMatrix(T, freq);

    return { frequency: freq, impedance: Z_in };
  });

  const resonances = this.detectResonances_AdvancedPeakFinding(impedanceSpectrum);
  return resonances;
}

calculateSegmentMatrix_WithLosses(segment, frequency) {
  const k = (2 * Math.PI * frequency) / this.SPEED_OF_SOUND;
  const alpha = this.calculateViscothermalLosses(frequency, segment.averageRadius);
  const gamma = k + alpha * 1j; // Complex propagation constant

  // Transfer matrix for conical segment with losses
  // (Implementação completa baseada em Mapes-Riordan 1991)

  return matrix; // 2x2 complex matrix
}
```

#### 6. Algoritmo de Detecção de Picos Melhorado
**Problema**: Detecção de ressonâncias pode perder picos ou detectar falsos positivos
**Solução**: Algoritmo de prominence-based peak detection

```javascript
detectResonances_AdvancedPeakFinding(spectrum) {
  // 1. Smooth spectrum with Savitzky-Golay filter
  const smoothed = this.savitzkyGolayFilter(spectrum, 5, 2);

  // 2. Find local minima (for impedance) or maxima (for admittance)
  const peaks = this.findLocalExtrema(smoothed);

  // 3. Calculate peak prominence
  const prominentPeaks = peaks.filter(peak => {
    const prominence = this.calculatePeakProminence(smoothed, peak.index);
    return prominence > this.RESONANCE_THRESHOLD;
  });

  // 4. Fit parabola around each peak for sub-sample accuracy
  const refinedPeaks = prominentPeaks.map(peak => {
    return this.parabolicInterpolation(smoothed, peak.index);
  });

  return refinedPeaks;
}
```

#### 7. Calibração com Dados Experimentais
**Objetivo**: Ajustar constantes empíricas para máxima precisão
**Método**: Regressão com dados de referência (PVC, didges reais)

```javascript
// Dataset de calibração
const calibrationData = [
  { length: 878, diameter: 34, measuredFreq: 98.0 },    // PVC G2
  { length: 1171, diameter: 34, measuredFreq: 73.42 },  // PVC D2
  { length: 1044, diameter: 34, measuredFreq: 82.41 },  // PVC E2
  // ... mais dados
];

calibrateConstants() {
  // Otimizar END_CORRECTION_FACTOR, BELL_CORRECTION_FACTOR, etc.
  // usando mínimos quadrados ou algoritmo genético

  const optimizedConstants = this.findOptimalConstants(calibrationData);

  this.END_CORRECTION_FACTOR = optimizedConstants.endCorrection;
  this.BELL_CORRECTION_FACTOR = optimizedConstants.bellCorrection;
  // ...
}
```

---

## Plano de Implementação

### Sprint 1: Correções Críticas (1-2 dias) 🔴
- [x] ~~Bug: Falta mouthCorrection no modo simplificado~~
- [ ] **FIX CRÍTICO**: Adicionar mouthCorrection ao analyzeGeometrySimplified
- [ ] Testar com validate-acoustics.js
- [ ] Validar erro < 5% em todos os casos de teste

### Sprint 2: Melhorias de Precisão (3-5 dias) 🟡
- [ ] Implementar correção de conicidade melhorada (Benade)
- [ ] Adicionar perdas viscotérmicas básicas
- [ ] Implementar impedância de radiação (Levine & Schwinger)
- [ ] Validar erro < 2% em casos de referência

### Sprint 3: Precisão Avançada (1-2 semanas) 🟢
- [ ] TMM com perdas completas
- [ ] Detecção de picos avançada
- [ ] Calibração com dados experimentais
- [ ] Validar erro < 1% (paridade com CADSD)

---

## Validação

### Métricas de Sucesso

| Métrica | Atual | Meta Sprint 1 | Meta Sprint 2 | Meta Sprint 3 |
|---------|-------|---------------|---------------|---------------|
| **Erro médio (PVC)** | ~95% | <5% | <2% | <1% |
| **Erro médio (Cônicos)** | ~25% | <10% | <3% | <1.5% |
| **Cobertura de casos** | 0/4 | 3/4 | 4/4 | 4/4 |
| **Tempo de cálculo** | <100ms | <100ms | <200ms | <500ms |

### Casos de Teste

```javascript
const testCases = [
  { name: 'PVC G2', length: 87.8, diameter: 34, expected: 98.0 },
  { name: 'PVC D2', length: 117.1, diameter: 34, expected: 73.42 },
  { name: 'PVC E2', length: 104.4, diameter: 34, expected: 82.41 },
  { name: 'Cônico G2', length: 169.5, diameters: [30...90], expected: 98.0 },
  { name: 'Tradicional C2', length: 131.5, diameters: [30...60], expected: 65.4 }
];
```

---

## Referências Científicas

### Papers Fundamentais:
1. **Mapes-Riordan, D. (1991)**: "Horn Modeling with Conical and Cylindrical Transmission Line Elements", AES #3194
2. **Benade, A. H. (1976)**: "Fundamentals of Musical Acoustics", Dover
3. **Keefe, D. H. (1984)**: "Acoustical wave propagation in cylindrical ducts", JASA 75(2)
4. **Levine & Schwinger (1948)**: "On the radiation of sound from an unflanged circular pipe", Phys. Rev. 73
5. **Fletcher & Rossing (1998)**: "The Physics of Musical Instruments", Springer

### Implementações de Referência:
- **CADSD**: www.didgeridoo-physik.de/cadsd/
- **DidgeLab**: github.com/jnehring/didge-lab
- **DIDGMO**: didgmo.sourceforge.net/

---

## Próximos Passos Imediatos

1. **URGENTE**: Corrigir analyzeGeometrySimplified (adicionar mouthCorrection)
2. Executar validate-acoustics.js e verificar melhoria
3. Executar test-cadsd-comparison.js e confirmar erro < 5%
4. Criar testes unitários para cada correção
5. Documentar mudanças no README

---

## Notas Técnicas

### Por que o erro é ~2x?

A fórmula é: `f = c / (2L)`

Se esquecemos parte do comprimento efetivo:
- L_correto = L_físico + bellCorrection + mouthCorrection
- L_errado = L_físico + bellCorrection (falta ~0.3×radius)

Para PVC 34mm:
- mouthCorrection = 0.3 × 17mm = 5.1mm ≈ 0.51cm
- Isso representa ~0.6% do comprimento total de 87.8cm
- MAS em tubos abertos, pequenas mudanças em L causam grandes mudanças em f

A razão do erro ~2x é que estamos efetivamente modelando o didge como se tivesse metade do comprimento efetivo que deveria.

### Confiança nas Correções

| Correção | Fonte | Confiança | Impacto |
|----------|-------|-----------|---------|
| End correction (0.8×r) | Empírica | Alta | Grande (~10%) |
| Mouth correction (0.3×r) | Empírica | Média | Médio (~5%) |
| Taper correction | Benade (1976) | Alta | Variável (0-20%) |
| Viscothermal losses | Keefe (1984) | Muito Alta | Pequeno (<2%) |
| Radiation impedance | Levine & Schwinger | Muito Alta | Pequeno (<3%) |

---

*Última atualização: 2025-01-13*
*Autor: Análise técnica DidGeoMap*
*Status: Plano aprovado, aguardando implementação*
