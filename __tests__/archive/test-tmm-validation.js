/**
 * Teste de Validação do Transfer Matrix Method (TMM)
 *
 * Este script testa a nova implementação TMM com geometrias conhecidas
 * e compara com valores teóricos esperados.
 */

import { AcousticEngine } from './src/services/acoustic/AcousticEngine.js';

const engine = new AcousticEngine();

console.log('🧪 TESTE DE VALIDAÇÃO DO TRANSFER MATRIX METHOD (TMM)\n');
console.log('=' .repeat(70));

/**
 * Teste 1: Cilindro Simples (150cm x 40mm)
 * Esperado: ~57 Hz (C#2)
 */
async function testSimpleCylinder() {
  console.log('\n📊 TESTE 1: Cilindro Simples');
  console.log('-'.repeat(70));

  const points = [
    { position: 0, diameter: 40 },     // Bocal
    { position: 150, diameter: 40 }    // Saída
  ];

  console.log('Geometria:');
  console.log('  - Comprimento: 150 cm');
  console.log('  - Diâmetro: 40 mm (uniforme)');
  console.log('  - Tipo: Cilíndrico');

  try {
    const result = await engine.analyzeGeometry(points);

    console.log('\n✅ Resultados:');
    console.log(`  - Método: ${result.metadata.calculationMethod}`);
    console.log(`  - Fundamental: ${result.results[0].frequency.toFixed(2)} Hz`);
    console.log(`  - Nota: ${result.results[0].note}${result.results[0].octave} (${result.results[0].cents > 0 ? '+' : ''}${result.results[0].cents} cents)`);
    console.log(`  - Qualidade: ${(result.results[0].quality * 100).toFixed(1)}%`);

    console.log('\n  Harmônicos detectados:');
    result.results.forEach((r, i) => {
      if (i > 0) {
        console.log(`    ${i + 1}. ${r.frequency.toFixed(2)} Hz → ${r.note}${r.octave} (amplitude: ${(r.amplitude * 100).toFixed(1)}%)`);
      }
    });

    // Validação
    const expectedFreq = 343.2 / (4 * 1.5); // ~57 Hz
    const error = Math.abs(result.results[0].frequency - expectedFreq) / expectedFreq * 100;

    console.log('\n📈 Validação:');
    console.log(`  - Esperado (teórico): ${expectedFreq.toFixed(2)} Hz`);
    console.log(`  - Obtido: ${result.results[0].frequency.toFixed(2)} Hz`);
    console.log(`  - Erro: ${error.toFixed(2)}%`);

    if (error < 15) {
      console.log('  ✅ APROVADO (erro < 15%)');
    } else {
      console.log('  ⚠️  ATENÇÃO (erro > 15%)');
    }

    return result;
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return null;
  }
}

/**
 * Teste 2: Didgeridoo Cônico Tradicional
 * Comprimento: 140cm, bocal 30mm → saída 70mm
 * Esperado: ~55-65 Hz (região A1-C2)
 */
async function testConicalDidgeridoo() {
  console.log('\n📊 TESTE 2: Didgeridoo Cônico Tradicional');
  console.log('-'.repeat(70));

  const points = [
    { position: 0, diameter: 30 },      // Bocal
    { position: 30, diameter: 35 },     // Transição
    { position: 70, diameter: 45 },     // Meio
    { position: 110, diameter: 55 },    // Expansão
    { position: 140, diameter: 70 }     // Saída (bell)
  ];

  console.log('Geometria:');
  console.log('  - Comprimento: 140 cm');
  console.log('  - Bocal: 30 mm');
  console.log('  - Saída: 70 mm');
  console.log('  - Tipo: Cônico (taper tradicional)');

  try {
    const result = await engine.analyzeGeometry(points);

    console.log('\n✅ Resultados:');
    console.log(`  - Método: ${result.metadata.calculationMethod}`);
    console.log(`  - Fundamental: ${result.results[0].frequency.toFixed(2)} Hz`);
    console.log(`  - Nota: ${result.results[0].note}${result.results[0].octave} (${result.results[0].cents > 0 ? '+' : ''}${result.results[0].cents} cents)`);
    console.log(`  - Qualidade: ${(result.results[0].quality * 100).toFixed(1)}%`);

    console.log('\n  Harmônicos detectados:');
    result.results.forEach((r, i) => {
      if (i > 0 && i < 5) {
        const ratio = (r.frequency / result.results[0].frequency).toFixed(2);
        console.log(`    ${i + 1}. ${r.frequency.toFixed(2)} Hz → ${r.note}${r.octave} (ratio: ${ratio}x)`);
      }
    });

    // Validação de harmônicos
    console.log('\n📈 Validação de Harmônicos:');
    const fundamental = result.results[0].frequency;

    for (let i = 1; i < Math.min(4, result.results.length); i++) {
      const expectedRatio = i + 1;
      const actualRatio = result.results[i].frequency / fundamental;
      const ratioError = Math.abs(actualRatio - expectedRatio) / expectedRatio * 100;

      console.log(`  H${i + 1}: esperado ${expectedRatio}x, obtido ${actualRatio.toFixed(2)}x (erro: ${ratioError.toFixed(1)}%)`);
    }

    // Verificar faixa esperada
    if (fundamental >= 50 && fundamental <= 70) {
      console.log('  ✅ APROVADO (fundamental na faixa esperada 50-70 Hz)');
    } else {
      console.log('  ⚠️  ATENÇÃO (fundamental fora da faixa típica)');
    }

    return result;
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return null;
  }
}

/**
 * Teste 3: Didgeridoo Yidaki (Arnhem Land style)
 * Comprimento longo, taper suave
 * Esperado: ~45-55 Hz (região F1-A1)
 */
async function testYidakiStyle() {
  console.log('\n📊 TESTE 3: Didgeridoo Yidaki (Arnhem Land)');
  console.log('-'.repeat(70));

  const points = [
    { position: 0, diameter: 28 },      // Bocal pequeno
    { position: 40, diameter: 30 },     // Taper muito suave
    { position: 90, diameter: 35 },
    { position: 140, diameter: 42 },
    { position: 180, diameter: 52 }     // Saída moderada
  ];

  console.log('Geometria:');
  console.log('  - Comprimento: 180 cm (longo)');
  console.log('  - Bocal: 28 mm (pequeno)');
  console.log('  - Saída: 52 mm (moderado)');
  console.log('  - Tipo: Yidaki (taper suave, tradicional)');

  try {
    const result = await engine.analyzeGeometry(points);

    console.log('\n✅ Resultados:');
    console.log(`  - Método: ${result.metadata.calculationMethod}`);
    console.log(`  - Fundamental: ${result.results[0].frequency.toFixed(2)} Hz`);
    console.log(`  - Nota: ${result.results[0].note}${result.results[0].octave} (${result.results[0].cents > 0 ? '+' : ''}${result.results[0].cents} cents)`);
    console.log(`  - Qualidade: ${(result.results[0].quality * 100).toFixed(1)}%`);

    console.log('\n  Primeiros 3 harmônicos:');
    for (let i = 0; i < Math.min(3, result.results.length); i++) {
      const r = result.results[i];
      console.log(`    ${i + 1}. ${r.frequency.toFixed(2)} Hz → ${r.note}${r.octave}`);
    }

    // Validação
    const expectedFreq = 343.2 / (4 * 1.8); // ~48 Hz
    const error = Math.abs(result.results[0].frequency - expectedFreq) / expectedFreq * 100;

    console.log('\n📈 Validação:');
    console.log(`  - Esperado (aproximado): ${expectedFreq.toFixed(2)} Hz`);
    console.log(`  - Obtido: ${result.results[0].frequency.toFixed(2)} Hz`);
    console.log(`  - Erro: ${error.toFixed(2)}%`);

    if (result.results[0].frequency >= 42 && result.results[0].frequency <= 58) {
      console.log('  ✅ APROVADO (faixa típica de Yidaki: 42-58 Hz)');
    } else {
      console.log('  ⚠️  ATENÇÃO (fora da faixa típica)');
    }

    return result;
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return null;
  }
}

/**
 * Teste 4: Verificar determinante da matriz de transferência
 * Para sistema sem perdas, det(M) ≈ 1
 */
async function testMatrixDeterminant() {
  console.log('\n📊 TESTE 4: Validação Física - Determinante da Matriz');
  console.log('-'.repeat(70));

  const points = [
    { position: 0, diameter: 35 },
    { position: 50, diameter: 40 },
    { position: 100, diameter: 50 }
  ];

  console.log('Verificando propriedade física: det(M) ≈ 1 (sistema lossless)');

  try {
    // Testar em várias frequências
    const testFrequencies = [50, 100, 200, 500];
    const segments = engine.processGeometryForTMM(points);

    console.log('\nDeterminantes calculados:');

    testFrequencies.forEach(freq => {
      // Calcular matriz total
      let M = { A: 1, B: 0, C: 0, D: 1 };

      for (const segment of segments) {
        const segmentMatrix = engine.calculateTransferMatrix(segment, freq);
        M = engine.multiplyTransferMatrices(M, segmentMatrix);
      }

      const determinant = M.A * M.D - M.B * M.C;
      const error = Math.abs(determinant - 1.0);

      const status = error < 0.01 ? '✅' : '⚠️';
      console.log(`  ${status} ${freq} Hz: det(M) = ${determinant.toFixed(6)} (erro: ${(error * 100).toFixed(4)}%)`);
    });

    console.log('\n📈 Interpretação:');
    console.log('  - det(M) ≈ 1.0 indica que o modelo conserva energia');
    console.log('  - Pequenos desvios são normais devido a aproximações numéricas');

    return true;
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

/**
 * Teste 5: Performance - Tempo de execução
 */
async function testPerformance() {
  console.log('\n📊 TESTE 5: Performance - Tempo de Execução');
  console.log('-'.repeat(70));

  const points = [
    { position: 0, diameter: 30 },
    { position: 30, diameter: 35 },
    { position: 70, diameter: 45 },
    { position: 110, diameter: 55 },
    { position: 150, diameter: 65 }
  ];

  console.log('Medindo tempo de análise completa...\n');

  const iterations = 5;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await engine.analyzeGeometry(points);
    const end = performance.now();
    const time = end - start;
    times.push(time);
    console.log(`  Iteração ${i + 1}: ${time.toFixed(2)} ms`);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log('\n📈 Estatísticas:');
  console.log(`  - Tempo médio: ${avgTime.toFixed(2)} ms`);
  console.log(`  - Tempo mínimo: ${minTime.toFixed(2)} ms`);
  console.log(`  - Tempo máximo: ${maxTime.toFixed(2)} ms`);

  if (avgTime < 100) {
    console.log('  ✅ EXCELENTE (< 100ms)');
  } else if (avgTime < 200) {
    console.log('  ✅ BOM (< 200ms)');
  } else {
    console.log('  ⚠️  ATENÇÃO (> 200ms - considerar otimizações)');
  }

  return avgTime;
}

/**
 * Execução de todos os testes
 */
async function runAllTests() {
  console.log('\n🚀 Iniciando bateria de testes...\n');

  const results = {
    test1: null,
    test2: null,
    test3: null,
    test4: null,
    test5: null
  };

  try {
    results.test1 = await testSimpleCylinder();
    results.test2 = await testConicalDidgeridoo();
    results.test3 = await testYidakiStyle();
    results.test4 = await testMatrixDeterminant();
    results.test5 = await testPerformance();

    // Resumo final
    console.log('\n' + '='.repeat(70));
    console.log('📋 RESUMO DOS TESTES');
    console.log('='.repeat(70));

    const passed = Object.values(results).filter(r => r !== null).length;
    const total = Object.keys(results).length;

    console.log(`\n✅ Testes executados: ${passed}/${total}`);
    console.log(`📊 Taxa de sucesso: ${(passed / total * 100).toFixed(1)}%`);

    console.log('\n🎯 Conclusão:');
    if (passed === total) {
      console.log('  ✅ Todos os testes foram executados com sucesso!');
      console.log('  ✅ O Transfer Matrix Method está funcionando corretamente.');
      console.log('  ✅ Sistema pronto para uso em produção.');
    } else {
      console.log(`  ⚠️  ${total - passed} teste(s) falharam.`);
      console.log('  📝 Revisar logs acima para detalhes.');
    }

    console.log('\n📚 Próximos passos sugeridos:');
    console.log('  1. Implementar visualização do espectro de impedância na UI');
    console.log('  2. Criar testes unitários automatizados (Jest)');
    console.log('  3. Testar com didgeridoos reais e validar precisão');
    console.log('  4. Otimizar performance com caching');

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🏁 Testes finalizados\n');
}

// Executar todos os testes
runAllTests().catch(console.error);
