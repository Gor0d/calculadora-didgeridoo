# 📋 Próximas Tarefas - Calculadora de Didgeridoo

## ✅ Implementado (Sessão Atual)
- ✅ Transfer Matrix Method (TMM) para cálculos de alta precisão
- ✅ Análise completa de espectro de impedância (30-1000 Hz)
- ✅ Detecção automática de ressonâncias
- ✅ Cálculo de fator de qualidade (Q) dos harmônicos
- ✅ Impedância de radiação (modelo Levine-Schwinger)
- ✅ Sistema de fallback inteligente
- ✅ Documentação técnica com referências científicas

---

## 🎯 Próximas Melhorias Recomendadas

### 1. 📊 Visualização do Espectro de Impedância na UI
**Prioridade:** Alta
**Complexidade:** Média
**Tempo estimado:** 2-3 horas

**Descrição:**
Adicionar um gráfico interativo mostrando o espectro completo de impedância calculado pelo TMM.

**Tarefas:**
- [ ] Criar componente `ImpedanceSpectrumChart.js`
- [ ] Usar react-native-svg para renderizar gráfico
- [ ] Adicionar eixo X (frequência 30-1000 Hz)
- [ ] Adicionar eixo Y (magnitude da impedância)
- [ ] Marcar picos de ressonância com círculos coloridos
- [ ] Adicionar tooltip com info ao tocar em um pico
- [ ] Opção de zoom/pan no gráfico
- [ ] Toggle para mostrar/ocultar espectro
- [ ] Exportar gráfico como imagem

**Benefícios:**
- Usuário vê visualmente onde estão as ressonâncias
- Comparação entre diferentes geometrias fica mais clara
- Educativo: mostra física acústica em ação
- Diferencial competitivo vs outras calculadoras

**Arquivos a modificar:**
- `src/screens/SimpleHomeScreen.js` - adicionar novo componente
- `src/components/ImpedanceSpectrumChart.js` - criar novo
- `src/utils/chartHelpers.js` - funções auxiliares de plotting

**Exemplo de código:**
```javascript
// ImpedanceSpectrumChart.js
export const ImpedanceSpectrumChart = ({ impedanceSpectrum, resonances }) => {
  // Renderizar gráfico usando react-native-svg
  // X: frequência, Y: magnitude
  // Destacar picos de ressonância
};
```

---

### 2. 🧪 Testes Unitários Completos
**Prioridade:** Alta
**Complexidade:** Média
**Tempo estimado:** 3-4 horas

**Descrição:**
Criar suite de testes abrangente para validar cálculos TMM.

**Tarefas:**
- [ ] Testes para Transfer Matrix calculations
  - [ ] `calculateCylindricalTransferMatrix()`
  - [ ] `calculateConicalTransferMatrix()`
  - [ ] `multiplyTransferMatrices()`
- [ ] Testes para operações de números complexos
  - [ ] `complexAdd()`, `complexMultiply()`, `complexDivide()`
- [ ] Testes para detecção de ressonâncias
  - [ ] `findResonancePeaks()`
  - [ ] `calculateResonanceAmplitude()`
  - [ ] `assessResonanceQuality()`
- [ ] Testes de integração completos
  - [ ] Didgeridoo cilíndrico simples
  - [ ] Didgeridoo cônico tradicional
  - [ ] Geometrias complexas com múltiplos segmentos
- [ ] Testes de validação física
  - [ ] Verificar determinante de matriz = 1 (lossless)
  - [ ] Verificar reciprocidade acústica
  - [ ] Comparar com valores teóricos conhecidos
- [ ] Testes de fallback
  - [ ] TMM falha → Simplified method
  - [ ] Simplified falha → Offline method

**Arquivos a criar:**
- `src/__tests__/services/AcousticEngine.TMM.test.js`
- `src/__tests__/services/TransferMatrix.test.js`
- `src/__tests__/services/ComplexNumbers.test.js`
- `src/__tests__/integration/AcousticCalculations.test.js`

**Casos de teste críticos:**
```javascript
describe('Transfer Matrix Method', () => {
  it('should calculate correct fundamental for 150cm cylinder', () => {
    // Expected: ~57 Hz
  });

  it('should find 4-6 harmonics for typical didgeridoo', () => {
    // Expected: fundamental + 3-5 harmonics
  });

  it('should have matrix determinant ≈ 1.0', () => {
    // Verify lossless approximation
  });
});
```

**Cobertura desejada:** >80% para AcousticEngine

---

### 3. 📚 Documentação Adicional
**Prioridade:** Média
**Complexidade:** Baixa
**Tempo estimado:** 2 horas

**Descrição:**
Expandir documentação técnica e criar guias para usuários.

**Tarefas:**
- [ ] Criar `docs/ACOUSTIC_THEORY.md`
  - [ ] Explicar Transfer Matrix Method
  - [ ] Diagramas da Webster Horn Equation
  - [ ] Referências bibliográficas completas
- [ ] Criar `docs/API_REFERENCE.md`
  - [ ] Documentar todos os métodos públicos do AcousticEngine
  - [ ] Exemplos de uso
  - [ ] Parâmetros e retornos
- [ ] Criar `docs/TUNING_GUIDE.md`
  - [ ] Como interpretar os resultados
  - [ ] O que significa fator de qualidade (Q)
  - [ ] Dicas para diferentes estilos (Yidaki, Mago, etc)
- [ ] Atualizar README.md
  - [ ] Adicionar seção sobre precisão dos cálculos
  - [ ] Mencionar TMM como diferencial
  - [ ] Badges de qualidade (coverage, build status)
- [ ] Criar FAQ técnico
  - [ ] Por que usar TMM vs fórmula simples?
  - [ ] Quão preciso é o cálculo?
  - [ ] Diferença entre amplitude e qualidade?

**Arquivos:**
- `docs/ACOUSTIC_THEORY.md` - novo
- `docs/API_REFERENCE.md` - novo
- `docs/TUNING_GUIDE.md` - novo
- `README.md` - atualizar
- `docs/FAQ.md` - novo

---

### 4. ⚡ Otimização de Performance
**Prioridade:** Média
**Complexidade:** Alta
**Tempo estimado:** 4-5 horas

**Descrição:**
Melhorar velocidade dos cálculos TMM sem perder precisão.

**Tarefas:**
- [ ] **Caching de resultados**
  - [ ] Cache de matrizes de transferência por segmento
  - [ ] Cache de espectro completo por geometria
  - [ ] Invalidação inteligente ao mudar geometria

- [ ] **Lazy loading**
  - [ ] Calcular espectro completo apenas quando solicitado
  - [ ] Calcular só fundamental + primeiros 3 harmônicos por padrão
  - [ ] Botão "análise completa" para espectro todo

- [ ] **Web Workers (plataforma web)**
  - [ ] Mover cálculos pesados para worker thread
  - [ ] Não bloquear UI durante análise
  - [ ] Progress indicator para cálculos longos

- [ ] **Otimização matemática**
  - [ ] Pre-calcular seno/cosseno para frequências comuns
  - [ ] Usar lookup tables para funções trigonométricas
  - [ ] Reduzir chamadas de Math.sqrt, Math.pow

- [ ] **Adaptive resolution**
  - [ ] Reduzir resolução em regiões sem picos
  - [ ] Aumentar resolução próximo a ressonâncias
  - [ ] Algoritmo adaptativo de sampling

- [ ] **Benchmarking**
  - [ ] Medir tempo de execução
  - [ ] Comparar antes/depois das otimizações
  - [ ] Target: <50ms para análise completa

**Arquivos a modificar:**
- `src/services/acoustic/AcousticEngine.js` - adicionar cache
- `src/services/cache/CalculationCache.js` - criar novo
- `src/workers/acousticWorker.js` - criar para web
- `src/services/performance/BenchmarkUtils.js` - criar novo

**Exemplo de implementação:**
```javascript
class AcousticEngine {
  constructor() {
    this.cache = new LRUCache(100); // Cache últimas 100 geometrias
    this.USE_ADAPTIVE_SAMPLING = true;
  }

  async analyzeGeometryTransferMatrix(points) {
    const cacheKey = this.getCacheKey(points);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // ... cálculo ...

    this.cache.set(cacheKey, result);
    return result;
  }
}
```

---

## 🔮 Melhorias Futuras (Backlog)

### 5. 🎨 Melhorias de UI/UX
- [ ] Animação ao detectar ressonâncias
- [ ] Comparação lado-a-lado de geometrias
- [ ] Histórico de análises
- [ ] Favoritos/marcadores
- [ ] Temas personalizados

### 6. 🔬 Funcionalidades Avançadas
- [ ] Análise de overblowing (toots)
- [ ] Predição de backpressure
- [ ] Simulação de voz mixing
- [ ] Cálculo de impedância de entrada do músico
- [ ] Modelagem de efeitos não-lineares

### 7. 🌐 Integração e Exportação
- [ ] Exportar dados para CSV/JSON
- [ ] Importar geometrias de outros formatos
- [ ] API REST para cálculos remotos
- [ ] Integração com CAD software
- [ ] Compartilhar análises via link

### 8. 📱 Mobile-specific
- [ ] Medição de didgeridoo com câmera (AR)
- [ ] Gravação e análise de áudio real
- [ ] Comparação áudio real vs calculado
- [ ] Tuner integrado

### 9. 🤖 Machine Learning
- [ ] Otimização automática de geometria
- [ ] Algoritmo genético para design customizado
- [ ] Predição de playability score
- [ ] Recomendações baseadas em preferências

---

## 📊 Priorização Sugerida

### Sprint 1 (Próxima semana)
1. ✅ Transfer Matrix Method - **CONCLUÍDO**
2. 🎯 Visualização do espectro de impedância
3. 🎯 Testes unitários básicos

### Sprint 2 (Semana seguinte)
1. Otimização de performance (cache básico)
2. Documentação expandida
3. Testes de integração completos

### Sprint 3 (Futuro próximo)
1. Análise de overblowing
2. Web Workers para performance
3. Melhorias de UI/UX

---

## 🎓 Recursos e Referências

### Papers Científicos
1. **Dan Mapes-Riordan (1991)**
   "Horn Modeling with Conical and Cylindrical Transmission Line Elements"
   Journal of the Audio Engineering Society, Paper 3194

2. **Fletcher & Rossing (1991)**
   "The Physics of Musical Instruments"
   Springer-Verlag

3. **Levine & Schwinger (1948)**
   "On the Radiation of Sound from an Unflanged Circular Pipe"
   Physical Review, Vol. 73

### Projetos Open-Source
- **DidgitaldDoo**: https://didgitaldoo.github.io
- **DidgeLab**: https://github.com/Didgitaldoo/didge-lab
- **didgmo**: https://sourceforge.net/projects/didgmo/
- **CADSD**: https://www.didgeridoo-physik.de

### Ferramentas Úteis
- **Spectrum Lab**: Para análise FFT de áudio
- **Audacity**: Gravação e análise de sons
- **OpenSCAD**: Modelagem 3D de geometrias

---

## 📝 Notas de Implementação

### Performance Targets
- Análise completa TMM: <100ms
- Análise simplificada: <10ms
- Renderização de UI: 60 FPS
- Tamanho de bundle: <500KB adicional

### Compatibilidade
- React Native: 0.79+
- Expo SDK: 53+
- iOS: 13+
- Android: 7.0+
- Web: Navegadores modernos

### Qualidade de Código
- Lint: 0 errors
- Test coverage: >80%
- TypeScript (futuro): Migração gradual
- Code review: Obrigatório para features críticas

---

**Última atualização:** 2025-10-08
**Versão atual:** 1.0.0 (com TMM)
**Próxima versão:** 1.1.0 (com visualização de espectro)
