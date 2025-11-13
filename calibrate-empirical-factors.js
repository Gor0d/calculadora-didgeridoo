/**
 * CALIBRAÇÃO EMPÍRICA DOS FATORES
 * Baseado em dados REAIS de didgeridoos
 */

const SPEED_OF_SOUND = 343; // m/s

// Dados de calibração (medições reais)
const calibrationData = [
  {
    name: 'Didge Real 1695mm',
    positionMM: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1550, 1600, 1695],
    diameterMM: [30, 30, 35, 35, 35, 35, 35, 35, 40, 45, 45, 40, 40, 50, 55, 60, 65, 70, 90],
    measuredFreq: 65.5, // C2 - MEDIÇÃO REAL
    note: 'C2'
  },
  // Você pode adicionar mais medições reais aqui
];

console.log('=== CALIBRAÇÃO EMPÍRICA BASEADA EM MEDIÇÕES REAIS ===\n');

// Para cada dado de calibração, encontrar os fatores ideais
calibrationData.forEach((data, idx) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`CALIBRAÇÃO ${idx + 1}: ${data.name}`);
  console.log(`${'='.repeat(70)}\n`);

  // Converter para metros
  const points = data.positionMM.map((pos, i) => ({
    position: pos / 1000, // mm to m
    diameter: data.diameterMM[i] / 1000  // mm to m
  }));

  const physicalLength = points[points.length - 1].position;
  const bellRadius = points[points.length - 1].diameter / 2;
  const mouthRadius = points[0].diameter / 2;

  console.log('GEOMETRIA:');
  console.log(`  Comprimento: ${(physicalLength * 1000).toFixed(0)} mm`);
  console.log(`  Bocal: ${(mouthRadius * 2 * 1000).toFixed(0)} mm`);
  console.log(`  Sino: ${(bellRadius * 2 * 1000).toFixed(0)} mm`);
  console.log(`  Expansão: ${(bellRadius / mouthRadius).toFixed(2)}x\n`);

  console.log('MEDIÇÃO REAL:');
  console.log(`  Frequência: ${data.measuredFreq.toFixed(2)} Hz`);
  console.log(`  Nota: ${data.note}\n`);

  // Calcular comprimento efetivo necessário
  const requiredEffLength = SPEED_OF_SOUND / (2 * data.measuredFreq);
  const requiredCorrection = requiredEffLength - physicalLength;

  console.log('ANÁLISE:');
  console.log(`  L_efetivo necessário: ${(requiredEffLength * 1000).toFixed(1)} mm`);
  console.log(`  Correção total necessária: ${(requiredCorrection * 1000).toFixed(1)} mm\n`);

  // Buscar melhor combinação de fatores
  let bestFit = { error: Infinity };

  // Testar range mais amplo de fatores
  for (let endF = 0.1; endF <= 3.0; endF += 0.1) {
    for (let mouthF = 0.1; mouthF <= 3.0; mouthF += 0.1) {
      const bellCorr = endF * bellRadius;
      const mouthCorr = mouthF * mouthRadius;
      const effLen = physicalLength + bellCorr + mouthCorr;
      const calcFreq = SPEED_OF_SOUND / (2 * effLen);
      const error = Math.abs(calcFreq - data.measuredFreq);

      if (error < bestFit.error) {
        bestFit = {
          endFactor: endF,
          mouthFactor: mouthF,
          bellCorrection: bellCorr,
          mouthCorrection: mouthCorr,
          effectiveLength: effLen,
          frequency: calcFreq,
          error
        };
      }
    }
  }

  console.log('FATORES CALIBRADOS:');
  console.log(`  END_CORRECTION_FACTOR = ${bestFit.endFactor.toFixed(2)}`);
  console.log(`  MOUTH_CORRECTION_FACTOR = ${bestFit.mouthFactor.toFixed(2)}\n`);

  console.log('RESULTADO:');
  console.log(`  Correção sino: ${(bestFit.bellCorrection * 1000).toFixed(2)} mm`);
  console.log(`  Correção bocal: ${(bestFit.mouthCorrection * 1000).toFixed(2)} mm`);
  console.log(`  L_efetivo: ${(bestFit.effectiveLength * 1000).toFixed(1)} mm`);
  console.log(`  Frequência calculada: ${bestFit.frequency.toFixed(2)} Hz`);
  console.log(`  Erro: ${bestFit.error.toFixed(4)} Hz`);

  if (bestFit.error < 0.01) {
    console.log(`  ✅ PERFEITO!\n`);
  } else if (bestFit.error < 0.1) {
    console.log(`  ✅ EXCELENTE!\n`);
  } else if (bestFit.error < 1.0) {
    console.log(`  ✅ BOM!\n`);
  }

  // Comparar com fatores teóricos
  const theoreticalBellCorr = 0.8 * bellRadius;
  const theoreticalMouthCorr = 0.3 * mouthRadius;
  const theoreticalEffLen = physicalLength + theoreticalBellCorr + theoreticalMouthCorr;
  const theoreticalFreq = SPEED_OF_SOUND / (2 * theoreticalEffLen);

  console.log('COMPARAÇÃO COM FATORES TEÓRICOS:');
  console.log(`  Teóricos (0.8, 0.3): ${theoreticalFreq.toFixed(2)} Hz`);
  console.log(`  Calibrados (${bestFit.endFactor.toFixed(2)}, ${bestFit.mouthFactor.toFixed(2)}): ${bestFit.frequency.toFixed(2)} Hz`);
  console.log(`  Diferença: ${Math.abs(theoreticalFreq - data.measuredFreq).toFixed(2)} Hz vs ${bestFit.error.toFixed(4)} Hz\n`);
});

console.log('\n' + '='.repeat(70));
console.log('RECOMENDAÇÕES FINAIS');
console.log('='.repeat(70) + '\n');

console.log('Baseado nas calibrações, os fatores de correção devem ser:');
console.log('  END_CORRECTION_FACTOR: ajustável por tipo de geometria');
console.log('  MOUTH_CORRECTION_FACTOR: ajustável por tipo de geometria\n');

console.log('OPÇÕES DE IMPLEMENTAÇÃO:\n');

console.log('1. FATORES FIXOS CALIBRADOS (mais simples):');
console.log('   → Use os fatores encontrados acima');
console.log('   → Bom para a maioria dos casos\n');

console.log('2. FATORES ADAPTATIVOS (mais preciso):');
console.log('   → Detecte tipo de geometria (cilíndrica vs cônica)');
console.log('   → Ajuste fatores automaticamente');
console.log('   → Melhor para todos os tipos de didges\n');

console.log('3. CALIBRAÇÃO POR USUÁRIO (máxima precisão):');
console.log('   → Permita usuário calibrar com um didge real');
console.log('   → Salve fatores personalizados');
console.log('   → Ideal para luthiers profissionais\n');
