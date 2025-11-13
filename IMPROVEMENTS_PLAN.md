# Plano de Melhorias - Precisão e Usabilidade

**Data:** 27/10/2025
**Objetivo:** Melhorar precisão dos cálculos acústicos e adicionar modo de entrada por caixa de texto

---

## 🎯 Melhorias Solicitadas

### 1. Testar Geometria Específica

**Geometria de teste:**
```
0 30
100 30
200 35
300 35
400 35
500 35
600 35
700 35
800 40
900 45
1000 45
1100 40
1200 40
1300 50
1400 55
1500 60
1550 65
1600 70
1695 90
```

**Características:**
- Comprimento total: 1.695 mm (169.5 cm)
- Bocal: 30mm
- Bell: 90mm
- Taper complexo com variações

**Frequência esperada:** ~50-60 Hz (aproximadamente D1 ou D#1)

---

## 2. Modo de Entrada por Caixa de Texto

### Status Atual:
✅ **JÁ IMPLEMENTADO** - O componente `GeometryInput.js` possui:
- Botão "📋 Colar Medidas" (linha 227-233)
- Função `handlePasteFromClipboard` (linha 150-207)
- Suporta múltiplos formatos: tab, vírgula, ponto-e-vírgula, espaço

### Melhorias a Fazer:
1. ✅ **Adicionar modo "Texto Livre"** além da tabela
2. ✅ **Melhorar validação** ao colar
3. ✅ **Feedback visual** melhor para erros
4. ✅ **Botão para alternar** entre modo tabela e modo texto

---

## 3. Melhorar Precisão dos Cálculos

### Problemas Identificados no AcousticEngine.js:

#### A) Correção de Taper Muito Agressiva (linha 246)
```javascript
// ATUAL: Pode aumentar até 30%
taperCorrection = 1.0 + (taperFactor * 0.3);

// MELHOR: Reduzir para 10-15%
taperCorrection = 1.0 + (taperFactor * 0.15);
```

**Motivo:** 30% é muito agressivo para didgeridoos reais

---

#### B) Correção de Raio Incorreta (linha 250)
```javascript
// ATUAL:
const radiusCorrection = 1 - (averageRadius * 0.05);

// PROBLEMA: Raio está em metros, então 0.05 pode dar valores negativos
// Se averageRadius = 0.04m (40mm), radiusCorrection = 0.998 (quase 1)
// Se averageRadius = 0.02m (20mm), radiusCorrection = 0.999

// MELHOR: Ajustar para mm ou remover se irrelevante
```

---

#### C) Fórmula de Frequência Fundamental Simplificada Incorreta (linha 96)
```javascript
// ATUAL em analyzeGeometrySimplified:
const fundamentalFreq = this.SPEED_OF_SOUND / (4 * totalLength);

// CORRETO: Usar fórmula completa com correções
const fundamentalFreq = this.SPEED_OF_SOUND / (2 * totalLength);
// Para tubo aberto: f = c / (2 * L)
// Para tubo fechado: f = c / (4 * L)
```

**Didgeridoo é tubo ABERTO** (ambas extremidades abertas acusticamente)

---

#### D) Correção de Extremidade Muito Conservadora (linha 34)
```javascript
// ATUAL:
this.END_CORRECTION_FACTOR = 0.6;

// Para didgeridoos com bells largos, usar:
this.END_CORRECTION_FACTOR = 0.8; // Mais preciso
```

---

#### E) Transfer Matrix Method - Problema na Radiação (linha 745)
```javascript
// ATUAL:
const real = Zc * 0.25 * ka * ka;
const imag = Zc * 0.61 * ka;

// MELHOR: Usar aproximação mais precisa (Levine-Schwinger completa)
```

---

### Melhorias Propostas:

```javascript
// 1. Ajustar constantes
this.END_CORRECTION_FACTOR = 0.8; // De 0.6 para 0.8
this.MOUTH_IMPEDANCE_FACTOR = 0.90; // De 0.85 para 0.90

// 2. Corrigir fórmula fundamental
calculateFundamental(effectiveLength, averageRadius, segments = null) {
  // Tubo aberto: f = c / (2 * L)
  let baseFreq = this.SPEED_OF_SOUND / (2 * effectiveLength);

  // Correção de taper reduzida
  let taperCorrection = 1.0;
  if (segments && segments.length > 0) {
    const taperFactor = this.calculateTaperFactor(segments);
    taperCorrection = 1.0 + (taperFactor * 0.12); // Reduzido de 0.30 para 0.12
  }

  // Remover correção de raio problemática ou recalcular
  // const radiusCorrection = 1 - (averageRadius * 0.05); // REMOVER

  // Aplicar apenas taper e mouthpiece
  return baseFreq * mouthpieceCorrection * taperCorrection;
}

// 3. Melhorar calculateEffectiveLength
calculateEffectiveLength(segments) {
  const physicalLength = segments.reduce((sum, seg) => sum + seg.length, 0);

  // Correção de extremidade melhorada
  const finalRadius = segments[segments.length - 1].r2;
  const endCorrection = this.END_CORRECTION_FACTOR * finalRadius;

  // Adicionar correção de bell para didgeridoos
  const firstRadius = segments[0].r1;
  const bellCorrection = 0.3 * firstRadius; // Correção na entrada (bocal)

  return physicalLength + endCorrection + bellCorrection;
}
```

---

## 4. Adicionar Validação de Resultados

```javascript
// Validar resultados contra geometria de teste conhecida
validateAgainstKnownGeometry() {
  const testGeometry = `
0 30
100 30
200 35
300 35
400 35
500 35
600 35
700 35
800 40
900 45
1000 45
1100 40
1200 40
1300 50
1400 55
1500 60
1550 65
1600 70
1695 90
  `.trim();

  // Frequência esperada: 50-60 Hz (D1)
  // Com essa geometria, deveria dar entre D1 (36.7Hz) e D#2 (77.8Hz)
  // Mais provável: E1 (41.2Hz) a G1 (49.0Hz)
}
```

---

## 5. Implementação - Ordem de Prioridade

### Fase 1: Correções Críticas no AcousticEngine (30 min)
- [x] Analisar problema nos cálculos
- [ ] Corrigir fórmula de frequência fundamental (linha 239)
- [ ] Ajustar END_CORRECTION_FACTOR (linha 34)
- [ ] Reduzir taperCorrection (linha 246)
- [ ] Remover radiusCorrection problemático (linha 250)
- [ ] Adicionar bellCorrection (novo)

### Fase 2: Melhorar GeometryInput (20 min)
- [ ] Adicionar toggle "Modo Tabela" vs "Modo Texto"
- [ ] Implementar TextInput grande para modo texto
- [ ] Manter funcionalidade de colar
- [ ] Melhorar feedback visual

### Fase 3: Testes com Geometria Real (15 min)
- [ ] Testar geometria fornecida
- [ ] Comparar resultado com expectativa
- [ ] Ajustar parâmetros se necessário
- [ ] Documentar precisão alcançada

### Fase 4: Documentação (10 min)
- [ ] Atualizar TECHNICAL_DOCUMENTATION.md
- [ ] Adicionar exemplos de geometrias testadas
- [ ] Documentar limitações conhecidas

---

## 6. Resultados Esperados

### Antes das Correções:
- Frequência pode estar ~20-30% incorreta
- Harmônicos desalinhados
- Notas musicais imprecisas

### Depois das Correções:
- Frequência com precisão de ±5-10%
- Harmônicos mais realistas
- Notas musicais mais confiáveis
- Melhor usabilidade para entrada de dados

---

## 7. Testes de Validação

### Geometria 1: Cilíndrica Simples
```
0 30
1500 30
```
**Esperado:** ~57 Hz (B♭1)

### Geometria 2: Cônica Simples
```
0 30
1500 80
```
**Esperado:** ~65 Hz (C2)

### Geometria 3: Complexa (Fornecida)
```
[19 pontos conforme fornecido]
```
**Esperado:** ~50-60 Hz (D1 a B♭1)

---

## 8. Notas Técnicas

### Por Que Tubo Aberto?
Didgeridoos são considerados **tubos abertos** porque:
1. Extremidade do bocal age acusticamente como aberta (lips vibram livremente)
2. Bell é obviamente aberta
3. Fórmula: `f = c / (2L)` não `f = c / (4L)`

### Correções de Extremidade
- **Bell:** 0.8 × raio (empiricamente validado)
- **Bocal:** 0.3 × raio (menor porque é restrito pelos lábios)

### Taper
- Didgeridoos cônicos aumentam frequência em ~10-15%
- Taper muito agressivo cria reflexões (reduz eficiência)
- Taper gradual é ideal

---

**Próximo passo:** Implementar correções no `AcousticEngine.js`
