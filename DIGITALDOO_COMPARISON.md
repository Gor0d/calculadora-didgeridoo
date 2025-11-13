# Comparação: Nossa Calculadora vs DigitalDoo

## 🎯 Descoberta Importante

Você compartilhou o link do **DigitalDoo Sketch** (https://didgitaldoo.github.io/sketch.html), que é uma ferramenta baseada no mesmo princípio do CADSD para calcular ressonâncias acústicas de didgeridoos.

## O Que é o DigitalDoo?

**DigitalDoo** é uma implementação web open-source que usa **Transfer Matrix Method (TMM)** para calcular:
- ✅ Espectro de impedância completo
- ✅ Ressonâncias reais (não apenas harmônicos simples)
- ✅ Modos inarmônicos causados por geometrias complexas
- ✅ Visualização gráfica de forma, impedância e espectro sonoro

### Formato de Entrada
```
posição(mm) diâmetro(mm)
0 28
100 26
1400 38
```

### Saídas
- Frequências de ressonância com nota musical
- Desvio em cents
- Plots de impedância e espectro sonoro
- Visualização da forma

---

## Por Que os Harmônicos São Inarmônicos?

Você forneceu esses valores para a geometria de 1695mm:

| Harm | Freq (Hz) | Nota | Observação |
|------|-----------|------|------------|
| H1 | 65.50 | C2 | Fundamental |
| H2 | 163.62 | E3 | **NÃO é 2×65.5 = 131 Hz!** |
| H3 | 270.44 | D6#4 | **NÃO é 3×65.5 = 196.5 Hz!** |
| H4 | 353.77 | F4 | **NÃO é 4×65.5 = 262 Hz!** |

Isso indica que esses valores vieram de:
1. **Medição real** de um didgeridoo físico, ou
2. **Cálculo TMM** (CADSD/DigitalDoo)

### A Física por Trás

Em instrumentos com **geometrias complexas** (como didgeridoos cônicos), as ressonâncias **NÃO são múltiplos inteiros** do fundamental. Isso ocorre por:

1. **Conicidade agressiva**: Altera a velocidade de propagação ao longo do tubo
2. **Mudanças abruptas de diâmetro**: Causam reflexões locais
3. **Efeitos de dispersão**: Frequências diferentes viajam a velocidades diferentes
4. **Inarmonia cônica**: Característico de instrumentos cônicos

---

## Nossa Implementação

### ✅ O Que JÁ Temos

Nossa calculadora **JÁ TEM** implementação completa do TMM:

```javascript
// AcousticEngine.js - Linha 532+
async analyzeGeometryTransferMatrix(points) {
  // Process geometry into segments
  const segments = this.processGeometryForTMM(points);

  // Generate frequency range for analysis (30-1200 Hz)
  const frequencies = this.generateFrequencyRange();

  // Calculate impedance spectrum across all frequencies
  const impedanceSpectrum = this.calculateImpedanceSpectrum(segments, frequencies);

  // Find resonance peaks (harmonics)
  const resonances = this.findResonancePeaks(frequencies, impedanceSpectrum);

  // Convert to musical notes
  return results with full impedance data
}
```

### Configuração Atual

```javascript
// AcousticEngine.js - Linha 39+
this.TMM_ENABLED = true; // ✅ JÁ ATIVADO!
this.FREQ_RANGE_START = 30; // Hz
this.FREQ_RANGE_END = 1200; // Hz
this.FREQ_STEP_LOW = 0.5; // Hz (30-100 Hz)
this.FREQ_STEP_HIGH = 1.0; // Hz (100-1200 Hz)
```

---

## Diferenças Entre as Abordagens

| Aspecto | DigitalDoo | Nossa Calculadora |
|---------|------------|-------------------|
| **Método** | TMM completo | TMM completo ✅ |
| **Espectro de Impedância** | Sim, visualizado | Sim, calculado ✅ |
| **Detecção de Picos** | Automática | Automática ✅ |
| **Formato Entrada** | MM × MM | CM × MM ou MM × MM ✅ |
| **Plataforma** | Web only | Mobile + Web ✅ |
| **Visualização** | Plots gráficos | SVG + Tabelas ✅ |
| **Interface** | Simples | Completa ✅ |

---

## Por Que Pode Haver Diferença nos Resultados?

Se os valores calculados pela nossa app **não correspondem** aos esperados (65.5, 163.62, 270.44...), pode ser por:

### 1. Fator de Escala Empírico
Adicionamos recentemente um fator de escala adaptativo:

```javascript
// AcousticEngine.js - Linha 111+
const taperRatio = bellRadius / mouthRadius;
let empiricalScaleFactor = 1.0;

if (taperRatio > 2.5) {
  empiricalScaleFactor = 0.66; // ⚠️ Isso afeta APENAS o modo simplificado!
}

fundamentalFreq = fundamentalFreq * empiricalScaleFactor;
```

**PROBLEMA**: Esse fator está sendo aplicado no **modo simplificado**, mas **NÃO no TMM**!

### 2. Parâmetros de Detecção de Picos

```javascript
this.RESONANCE_THRESHOLD = 0.25; // Threshold para detecção de picos
```

Se esse valor está muito alto, picos menores podem não ser detectados.

### 3. Resolução de Frequência

```javascript
this.FREQ_STEP_LOW = 0.5; // Hz
this.FREQ_STEP_HIGH = 1.0; // Hz
```

DigitalDoo pode usar resolução diferente.

---

## O Que Fazer Agora?

### Opção A: Testar na Aplicação Real ✅ (RECOMENDADO)

1. Abrir a aplicação web em http://localhost:8082
2. Colar a geometria no formato CM×MM:
```
0 30
10 30
20 35
...
169.5 90
```
3. Ver os resultados do TMM
4. Comparar com valores esperados

### Opção B: Ajustar Parâmetros do TMM

Se os resultados não correspondem, podemos:

1. **Remover o fator de escala adaptativo** (ou aplicá-lo no TMM também)
2. **Ajustar RESONANCE_THRESHOLD**
3. **Aumentar resolução** (FREQ_STEP menor)
4. **Validar com DigitalDoo**

### Opção C: Calibração com Dados Reais

Se você tem medições reais do didgeridoo:

1. Fornecer geometria + frequências medidas
2. Ajustar parâmetros do TMM para reproduzir resultados
3. Criar perfil de calibração

---

## Teste Prático Sugerido

### Passo 1: Testar no DigitalDoo
1. Ir em https://didgitaldoo.github.io/sketch.html
2. Colar geometria em MM×MM:
```
0 30
100 30
200 35
...
1695 90
```
3. Anotar frequências obtidas

### Passo 2: Testar em Nossa App
1. Abrir http://localhost:8082
2. Colar mesma geometria em CM×MM (ou usar toggle MM×MM)
3. Comparar resultados

### Passo 3: Ajustar
Se houver diferença:
- Documentar valores obtidos
- Identificar onde está a discrepância
- Ajustar parâmetros conforme necessário

---

## Conclusão

✅ **Nossa calculadora JÁ TEM TMM completo implementado**
✅ **Os fundamentos físicos estão corretos**
⚠️ **Pode haver diferenças em parâmetros de calibração**

Para obter resultados **idênticos** ao DigitalDoo:
1. Testar ambas as ferramentas com mesma geometria
2. Comparar resultados lado a lado
3. Ajustar parâmetros se necessário

---

## Próximos Passos

1. **Você testa** a app com a geometria
2. **Compartilha** os resultados obtidos
3. **Compara** com valores esperados
4. **Ajustamos** parâmetros se necessário

**Ou se preferir**, posso:
- Remover o fator de escala adaptativo
- Deixar apenas o TMM puro
- Garantir máxima fidelidade aos resultados teóricos

**Qual abordagem você prefere?**

---

*Última atualização: 2025-01-13*
*Status: Aguardando teste prático*
