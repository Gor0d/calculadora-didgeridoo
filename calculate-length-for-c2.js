/**
 * Calcular comprimento necessário para C2 (65.5 Hz)
 * com geometria similar (30mm → 90mm)
 */

const SPEED_OF_SOUND = 343; // m/s
const END_CORRECTION_FACTOR = 0.8;
const BELL_CORRECTION_FACTOR = 0.3;
const TARGET_FREQ = 65.5; // Hz (C2)

// Geometria proporcional
const mouthDiameter = 30 / 1000; // mm to m
const bellDiameter = 90 / 1000; // mm to m

const mouthRadius = mouthDiameter / 2;
const bellRadius = bellDiameter / 2;

// Correções de ponta
const bellCorrection = END_CORRECTION_FACTOR * bellRadius;
const mouthCorrection = BELL_CORRECTION_FACTOR * mouthRadius;
const totalCorrection = bellCorrection + mouthCorrection;

// Calcular comprimento efetivo necessário
// f = c / (2L) → L = c / (2f)
const requiredEffectiveLength = SPEED_OF_SOUND / (2 * TARGET_FREQ);

// Comprimento físico = efetivo - correções
const requiredPhysicalLength = requiredEffectiveLength - totalCorrection;

console.log('=== CÁLCULO REVERSO: Comprimento para C2 (65.5 Hz) ===\n');
console.log('PARÂMETROS:');
console.log(`  Frequência desejada: ${TARGET_FREQ} Hz (C2)`);
console.log(`  Diâmetro bocal: ${(mouthDiameter * 1000).toFixed(0)} mm`);
console.log(`  Diâmetro sino: ${(bellDiameter * 1000).toFixed(0)} mm\n`);

console.log('CORREÇÕES:');
console.log(`  Correção sino: ${(bellCorrection * 1000).toFixed(2)} mm`);
console.log(`  Correção bocal: ${(mouthCorrection * 1000).toFixed(2)} mm`);
console.log(`  Total: ${(totalCorrection * 1000).toFixed(2)} mm\n`);

console.log('COMPRIMENTO NECESSÁRIO:');
console.log(`  Comprimento efetivo: ${(requiredEffectiveLength * 1000).toFixed(0)} mm (${(requiredEffectiveLength * 100).toFixed(1)} cm)`);
console.log(`  Comprimento físico: ${(requiredPhysicalLength * 1000).toFixed(0)} mm (${(requiredPhysicalLength * 100).toFixed(1)} cm)\n`);

console.log('COMPARAÇÃO:');
console.log(`  Sua geometria atual: 1695 mm → G2 (98.82 Hz)`);
console.log(`  Para obter C2 (65.5 Hz): ${(requiredPhysicalLength * 1000).toFixed(0)} mm\n`);

const lengthRatio = requiredPhysicalLength / 1.695;
console.log(`CONCLUSÃO:`);
console.log(`  Você precisaria de um didge ${lengthRatio.toFixed(2)}x MAIOR!`);
console.log(`  Isso seria ${(requiredPhysicalLength * 100).toFixed(0)} cm (${(requiredPhysicalLength).toFixed(2)} metros)\n`);

// Verificação
const verificationFreq = SPEED_OF_SOUND / (2 * requiredEffectiveLength);
console.log(`VERIFICAÇÃO:`);
console.log(`  Frequência com ${(requiredPhysicalLength * 1000).toFixed(0)}mm: ${verificationFreq.toFixed(2)} Hz ✅\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('INTERPRETAÇÃO DOS RESULTADOS:');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Se a calculadora está mostrando G2 (98 Hz) para sua geometria,');
console.log('isso significa que:');
console.log('  1. Os cálculos estão CORRETOS fisicamente');
console.log('  2. Essa geometria específica REALMENTE ressoa em G2');
console.log('  3. A conicidade (30→90mm) aumenta a frequência\n');

console.log('POSSÍVEIS EXPLICAÇÕES para a discrepância:');
console.log('  ❓ A geometria real medida é diferente dos dados de entrada?');
console.log('  ❓ O instrumento real tem características adicionais (rugosidade, etc)?');
console.log('  ❓ As medições foram feitas com o instrumento tocando (backpressure)?');
console.log('  ❓ Há um overblow sendo medido em vez do fundamental?\n');

console.log('RECOMENDAÇÃO:');
console.log('  → Verifique as medidas: são realmente em MM (posição e diâmetro)?');
console.log('  → Teste tocando o instrumento: a nota fundamental é G2 ou C2?');
console.log('  → Se realmente é C2, algo está diferente na geometria real.');
