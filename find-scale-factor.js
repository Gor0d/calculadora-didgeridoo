/**
 * Encontrar fator de escala global para ajustar frequências
 */

const SPEED_OF_SOUND = 343; // m/s
const END_CORRECTION_FACTOR = 0.8;
const BELL_CORRECTION_FACTOR = 0.3;

// Dados reais
const physicalLength = 1695 / 1000; // mm to m
const bellRadius = 90 / 2000; // mm to m
const mouthRadius = 30 / 2000; // mm to m
const measuredFreq = 65.5; // Hz (C2)

// Cálculo teórico atual
const bellCorrection = END_CORRECTION_FACTOR * bellRadius;
const mouthCorrection = BELL_CORRECTION_FACTOR * mouthRadius;
const effectiveLength = physicalLength + bellCorrection + mouthCorrection;
const theoreticalFreq = SPEED_OF_SOUND / (2 * effectiveLength);

console.log('=== ENCONTRAR FATOR DE ESCALA GLOBAL ===\n');
console.log('SITUAÇÃO ATUAL:');
console.log(`  Comprimento físico: 1695 mm`);
console.log(`  Frequência calculada: ${theoreticalFreq.toFixed(2)} Hz (G2)`);
console.log(`  Frequência medida: ${measuredFreq.toFixed(2)} Hz (C2)`);
console.log(`  Razão: ${(measuredFreq / theoreticalFreq).toFixed(4)}\n`);

// Fator de escala necessário
const scaleFactor = measuredFreq / theoreticalFreq;

console.log('FATOR DE ESCALA:');
console.log(`  scaleFactor = ${scaleFactor.toFixed(4)}`);
console.log(`  Isso significa: multiplicar frequência por ${scaleFactor.toFixed(4)}\n`);

// Ou equivalentemente, multiplicar comprimento efetivo
const lengthScaleFactor = 1 / scaleFactor;
console.log('OU (equivalente):');
console.log(`  lengthScaleFactor = ${lengthScaleFactor.toFixed(4)}`);
console.log(`  Isso significa: multiplicar comprimento efetivo por ${lengthScaleFactor.toFixed(4)}\n`);

// Verificação
const adjustedFreq = theoreticalFreq * scaleFactor;
console.log('VERIFICAÇÃO:');
console.log(`  Frequência ajustada: ${adjustedFreq.toFixed(2)} Hz ✅\n`);

console.log('═══════════════════════════════════════════════════════\n');

console.log('INTERPRETAÇÃO:\n');

if (scaleFactor < 0.7) {
  console.log('🔴 PROBLEMA: O fator de escala é muito baixo (<0.7)');
  console.log('   Isso indica que pode haver erro nos dados de entrada:\n');
  console.log('   POSSIBILIDADES:');
  console.log('   1. As medidas de posição NÃO são em MM');
  console.log('      → Se forem em CM, o comprimento seria 169.5m (impossível)');
  console.log('      → Se houver fator 10 de erro, seria 169.5mm (muito curto)');
  console.log('   2. A frequência medida não é o fundamental');
  console.log('      → Pode ser um overblow (2º harmônico)');
  console.log('      → Se for 2º harmônico: fundamental = 32.75 Hz (muito baixo)');
  console.log('   3. Há algo estruturalmente diferente no didge real');
  console.log('      → Câmaras internas, septo, etc.\n');
} else if (scaleFactor < 0.85) {
  console.log('🟡 ATENÇÃO: O fator de escala indica ajuste significativo');
  console.log('   Isso pode ser normal para didgeridoos com geometrias complexas.\n');
  console.log('   SOLUÇÕES:');
  console.log('   1. Aplicar fator de escala global:');
  console.log(`      → freq_final = freq_calculada × ${scaleFactor.toFixed(4)}`);
  console.log('   2. Usar modelo mais complexo (TMM com perdas)');
  console.log('   3. Calibrar empiricamente para cada tipo de didge\n');
} else {
  console.log('✅ NORMAL: Pequeno ajuste necessário');
  console.log('   Isso está dentro do esperado para variações reais.\n');
}

console.log('═══════════════════════════════════════════════════════\n');

console.log('IMPLEMENTAÇÃO SUGERIDA:\n');

console.log('Opção A: FATOR DE ESCALA GLOBAL (simples)');
console.log('```javascript');
console.log('const fundamentalFreq = (SPEED_OF_SOUND / (2 * effectiveLength));');
console.log(`const EMPIRICAL_SCALE_FACTOR = ${scaleFactor.toFixed(4)}; // Calibrado`);
console.log('const adjustedFreq = fundamentalFreq * EMPIRICAL_SCALE_FACTOR;');
console.log('```\n');

console.log('Opção B: DETECÇÃO DE TIPO (adaptativo)');
console.log('```javascript');
console.log('const taperRatio = bellRadius / mouthRadius;');
console.log('let scaleFactor = 1.0;');
console.log('if (taperRatio > 2.5) { // Muito cônico');
console.log(`  scaleFactor = ${scaleFactor.toFixed(4)}; // Ajuste para cônicos`);
console.log('} else if (taperRatio > 1.5) { // Moderadamente cônico');
console.log('  scaleFactor = 0.85;');
console.log('} // else: cilíndrico, sem ajuste');
console.log('const adjustedFreq = fundamentalFreq * scaleFactor;');
console.log('```\n');

console.log('Opção C: MODO DE CALIBRAÇÃO (profissional)');
console.log('```javascript');
console.log('// Permitir usuário inserir frequência medida');
console.log('// Calcular e salvar fator personalizado');
console.log('// Aplicar em cálculos futuros');
console.log('```\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('RECOMENDAÇÃO: Use Opção B (detecção adaptativa)\n');
console.log('Isso mantém a precisão para PVC cilíndrico');
console.log('e ajusta automaticamente para didges cônicos reais.');
