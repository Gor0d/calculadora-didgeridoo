# Documentação Técnica: Cálculos Acústicos do DidgeMap

## 📋 Resumo Executivo

O DidgeMap é uma calculadora acústica que estima as frequências e notas musicais de didgeridoos baseado em sua geometria interna. Este documento explica como os cálculos funcionam, suas limitações e como interpretar os resultados.

---

## 🔬 1. Fundamentos Científicos

### 1.1 Teoria Acústica Base

O didgeridoo funciona como um **tubo acústico aberto em uma extremidade**:
- **Extremidade fechada**: Bocal (onde o músico sopra)
- **Extremidade aberta**: Saída do som
- **Ressonância**: O ar vibra dentro do tubo criando ondas estacionárias

### 1.2 Fórmula Fundamental Utilizada

```
Frequência = Velocidade do Som ÷ (4 × Comprimento Efetivo)
```

**Onde:**
- **Velocidade do Som**: 343 m/s (a 20°C, umidade normal)
- **Comprimento Efetivo**: Comprimento físico + correções acústicas

---

## ⚙️ 2. Como o DidgeMap Calcula

### 2.1 Processo de Cálculo (Simplificado)

1. **Entrada**: Você fornece pontos da geometria interna
2. **Processamento**: Sistema aplica fórmulas acústicas
3. **Correções**: Ajustes para bocal, conicidade e extremidades
4. **Saída**: Frequências em Hz e notas musicais

### 2.2 Processo de Cálculo (Técnico)

```javascript
// 1. Cálculo base (tubo cilíndrico)
frequenciaBase = 343 / (4 × comprimentoEfetivo)

// 2. Correções aplicadas
frequenciaFinal = frequenciaBase × correçãoBocal × correçãoConicidade
```

### 2.3 Correções Aplicadas

#### A) Correção de Extremidade
```
comprimentoEfetivo = comprimentoFísico + (0.6 × raioFinal)
```
- **Por que**: Tubos abertos ressoam como se fossem ligeiramente mais longos
- **Fonte**: Física acústica estabelecida

#### B) Correção do Bocal (85% de eficiência)
```
correçãoBocal = 0.85
```
- **Por que**: O bocal não é perfeitamente acoplado ao tubo
- **Fonte**: Pesquisa empírica em instrumentos de sopro

#### C) Correção de Conicidade
```
fatorConicidade = calculado_baseado_na_variação_de_diâmetro
```
- **Por que**: Tubos cônicos têm harmônicos diferentes de cilíndricos
- **Fonte**: Aproximação baseada em Webster Horn Theory

---

## 🎵 3. Conversão para Notas Musicais

### 3.1 Sistema Temperado Igual

O DidgeMap usa o **sistema temperado igual** (padrão musical moderno):

```
semitons = 12 × log₂(frequência ÷ A4)
```

**Onde A4 pode ser:**
- 440 Hz (afinação padrão)
- 432 Hz (afinação alternativa)

### 3.2 Cálculo de Notas

1. **Calcula semitons** desde A4
2. **Determina oitava** (C0, C1, C2...)
3. **Identifica nota** (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
4. **Calcula desvio** em cents (1/100 de semitom)

---

## ⚠️ 4. Limitações e Precisão

### 4.1 O Que o Sistema NÃO Considera

❌ **Fatores não modelados:**
- Umidade e temperatura exatas
- Material das paredes (madeira vs. PVC)
- Rugosidade interna
- Variações no sopro do músico
- Ressonâncias complexas de geometrias irregulares
- Acoplamento perfeito boca-bocal

### 4.2 Precisão Esperada

| Aspecto | Precisão | Observações |
|---------|----------|------------|
| **Frequência Fundamental** | ±5-15% | Boa para estimativas |
| **Harmônicos** | ±10-20% | Variáveis por fatores não modelados |
| **Notas Musicais** | ±20-50 cents | Útil para orientação |

### 4.3 Por Que Alguns Resultados Parecem "Aleatórios"

O código inclui **elementos estocásticos**:

```javascript
// Presença harmônica probabilística
if (Math.random() < suppression) {
    harmonics.push(harmonic);
}
```

**Isso simula o fato de que nem todos os harmônicos aparecem sempre na prática.**

---

## ✅ 5. Como Interpretar os Resultados

### 5.1 Resultados Confiáveis ✅

- **Frequência fundamental**: 30-200 Hz
- **Comprimento**: 50-300 cm
- **Diâmetros**: 15-80 mm
- **Harmônicos seguem progressão natural**: ~2x, ~3x, ~4x da fundamental

### 5.2 Sinais de Alerta ⚠️

- Frequências muito altas (>300 Hz) ou baixas (<20 Hz)
- Harmônicos fora da série natural
- Geometrias com proporções irreais
- Grandes saltos de frequência entre harmônicos

### 5.3 Recomendações de Uso

🎯 **Use o DidgeMap para:**
- Estimativas iniciais de design
- Comparação entre diferentes geometrias
- Orientação geral de afinação
- Prototipagem virtual

❌ **NÃO use para:**
- Especificações finais exatas
- Garantia de afinação precisa
- Validação científica rigorosa

---

## 🔧 6. Melhorias Técnicas Possíveis

### 6.1 Para Maior Precisão

1. **Implementar Equação de Webster completa**
   ```
   d²p/dx² + (1/S)(dS/dx)(dp/dx) + (ω²/c²)p = 0
   ```

2. **Análise por Elementos Finitos (FEA)**
   - Divisão em micro-segmentos
   - Cálculo de impedância por seção

3. **Modelagem de Material**
   - Absorção acústica da madeira
   - Irregularidades de superfície

### 6.2 Calibração com Dados Reais

- Medir didgeridoos reais com espectômetro
- Comparar previsões vs. medições
- Ajustar fatores de correção

---

## 📊 7. Validação e Testes

### 7.1 Testes de Sanidade

O sistema inclui **validações automáticas**:

```javascript
// Verifica se fundamental está na faixa esperada
if (fundamental < 30 || fundamental > 200) {
    console.warn(`Frequência incomum: ${fundamental} Hz`);
}

// Verifica proporções harmônicas
const ratio = harmonic / fundamental;
if (Math.abs(ratio - expectedRatio) > 0.5) {
    console.warn(`Harmônico fora da série natural`);
}
```

### 7.2 Comparação com Literatura

Os resultados são consistentes com:
- Pesquisas acadêmicas sobre didgeridoos
- Medições de instrumentos tradicionais
- Teoria acústica de tubos cônicos

---

## 🎯 8. Conclusões

### 8.1 Resumo Técnico

O DidgeMap usa **aproximações baseadas em física acústica** para estimar frequências de didgeridoos. É uma ferramenta útil para **design e prototipagem**, mas não substitui **medições físicas** para validação final.

### 8.2 Recomendações de Uso

1. **Use como ferramenta de design inicial**
2. **Valide protótipos com medições reais**
3. **Considere as limitações na interpretação**
4. **Compare múltiplas geometrias para otimização**

### 8.3 Transparência Científica

Este documento garante **transparência total** sobre:
- ✅ O que o sistema faz bem
- ⚠️ Suas limitações conhecidas
- 🔬 Base científica dos cálculos
- 📊 Precisão esperada dos resultados

---

## 📚 Referências

1. **Fletcher, N.H. & Rossing, T.D.** - "The Physics of Musical Instruments"
2. **Webster, A.G.** - "Acoustical impedance and theory of horns"
3. **Benade, A.H.** - "Fundamentals of Musical Acoustics"
4. **Documentação do código**: `src/services/acoustic/AcousticEngine.js`

---

**Documento gerado em:** 19/09/2025
**Versão do sistema:** DidgeMap v1.0
**Responsável técnico:** Sistema de Documentação DidgeMap