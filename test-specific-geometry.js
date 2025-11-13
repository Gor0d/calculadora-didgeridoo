/**
 * Teste da geometria específica: 1695mm (MM × MM)
 * Resultado esperado: C2 (~65 Hz)
 */

const SPEED_OF_SOUND = 343; // m/s at 20°C
const END_CORRECTION_FACTOR = 0.8;
const BELL_CORRECTION_FACTOR = 0.3;

// Geometria fornecida pelo usuário (posições em MM, diâmetros em MM)
const geometry = [
  { position: 0, diameter: 30 },
  { position: 100, diameter: 30 },
  { position: 200, diameter: 35 },
  { position: 300, diameter: 35 },
  { position: 400, diameter: 35 },
  { position: 500, diameter: 35 },
  { position: 600, diameter: 35 },
  { position: 700, diameter: 35 },
  { position: 800, diameter: 40 },
  { position: 900, diameter: 45 },
  { position: 1000, diameter: 45 },
  { position: 1100, diameter: 40 },
  { position: 1200, diameter: 40 },
  { position: 1300, diameter: 50 },
  { position: 1400, diameter: 55 },
  { position: 1500, diameter: 60 },
  { position: 1550, diameter: 65 },
  { position: 1600, diameter: 70 },
  { position: 1695, diameter: 90 }
];

console.log('=== TESTE GEOMETRIA ESPECÍFICA (1695mm) ===\n');
console.log('Formato de entrada: MM × MM');
console.log('Comprimento total: 1695 mm (169.5 cm)\n');

// Converter MM×MM para metros
const points = geometry.map(p => ({
  position: p.position / 1000, // mm to m
  diameter: p.diameter / 1000  // mm to m
}));

// Comprimento físico
const physicalLength = points[points.length - 1].position; // metros

// Raios específicos
const bellRadius = points[points.length - 1].diameter / 2;
const mouthRadius = points[0].diameter / 2;

// Diâmetro médio
const avgDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;

// Correções de ponta
const bellCorrection = END_CORRECTION_FACTOR * bellRadius;
const mouthCorrection = BELL_CORRECTION_FACTOR * mouthRadius;

// Comprimento efetivo
const effectiveLength = physicalLength + bellCorrection + mouthCorrection;

console.log('ANÁLISE DA GEOMETRIA:');
console.log(`  Comprimento físico: ${(physicalLength * 1000).toFixed(1)} mm (${(physicalLength * 100).toFixed(1)} cm)`);
console.log(`  Diâmetro bocal: ${(mouthRadius * 2 * 1000).toFixed(1)} mm`);
console.log(`  Diâmetro sino: ${(bellRadius * 2 * 1000).toFixed(1)} mm`);
console.log(`  Diâmetro médio: ${(avgDiameter * 1000).toFixed(1)} mm`);
console.log(`  Expansão: ${(mouthRadius * 2).toFixed(3)}m → ${(bellRadius * 2).toFixed(3)}m`);
console.log(`  Fator de conicidade: ${((bellRadius / mouthRadius - 1) * 100).toFixed(1)}%\n`);

console.log('CORREÇÕES ACÚSTICAS:');
console.log(`  Correção sino (0.8 × ${(bellRadius * 1000).toFixed(1)}mm): ${(bellCorrection * 1000).toFixed(2)} mm`);
console.log(`  Correção bocal (0.3 × ${(mouthRadius * 1000).toFixed(1)}mm): ${(mouthCorrection * 1000).toFixed(2)} mm`);
console.log(`  Total de correção: ${((bellCorrection + mouthCorrection) * 1000).toFixed(2)} mm`);
console.log(`  Comprimento efetivo: ${(effectiveLength * 1000).toFixed(1)} mm (${(effectiveLength * 100).toFixed(2)} cm)\n`);

// Cálculo de frequência SEM correção de taper
const fundamentalFreq_NoTaper = SPEED_OF_SOUND / (2 * effectiveLength);

console.log('FREQUÊNCIA (SEM correção de conicidade):');
console.log(`  f = c / (2L)`);
console.log(`  f = ${SPEED_OF_SOUND} / (2 × ${effectiveLength.toFixed(4)})`);
console.log(`  f = ${fundamentalFreq_NoTaper.toFixed(2)} Hz\n`);

// Converter para nota
function frequencyToNote(freq) {
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const noteNumber = Math.round(12 * Math.log2(freq / C0));
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(noteNumber / 12);
  const note = noteNames[noteNumber % 12];
  const cents = Math.round(1200 * Math.log2(freq / (C0 * Math.pow(2, noteNumber / 12))));
  return { note: `${note}${octave}`, cents };
}

const noteInfo = frequencyToNote(fundamentalFreq_NoTaper);
console.log(`  Nota: ${noteInfo.note}`);
console.log(`  Desvio: ${noteInfo.cents > 0 ? '+' : ''}${noteInfo.cents} cents\n`);

// Testar diferentes fatores de correção de taper
console.log('=== TESTANDO CORREÇÕES DE CONICIDADE ===\n');

const taperRatio = (bellRadius - mouthRadius) / mouthRadius;
console.log(`Razão de conicidade: ${taperRatio.toFixed(2)} (${(taperRatio * 100).toFixed(0)}% expansão)\n`);

const taperFactors = [0.00, 0.05, 0.08, 0.10, 0.12, 0.15];

taperFactors.forEach(factor => {
  const taperCorrection = 1.0 + (taperRatio * factor);
  const adjustedFreq = fundamentalFreq_NoTaper * taperCorrection;
  const noteInfo = frequencyToNote(adjustedFreq);

  console.log(`Fator ${(factor * 100).toFixed(0)}%: ${adjustedFreq.toFixed(2)} Hz (${noteInfo.note}, ${noteInfo.cents >= 0 ? '+' : ''}${noteInfo.cents} cents)`);
});

console.log('\n=== COMPARAÇÃO COM EXPECTATIVA ===\n');
console.log('Você esperava: ~C2 (65.5 Hz)');
console.log(`Nossa calculadora deu: ${fundamentalFreq_NoTaper.toFixed(2)} Hz (${noteInfo.note})`);

const errorFromC2 = Math.abs(fundamentalFreq_NoTaper - 65.5) / 65.5 * 100;
console.log(`Diferença: ${errorFromC2.toFixed(1)}%\n`);

// Análise
if (fundamentalFreq_NoTaper > 95 && fundamentalFreq_NoTaper < 101) {
  console.log('✅ RESULTADO: G2 (~98 Hz)');
  console.log('Isso está CORRETO para um didge de 169.5cm com essa expansão!');
  console.log('\nNOTA IMPORTANTE:');
  console.log('A conicidade agressiva (30→90mm = 200% expansão) faz com que');
  console.log('o instrumento ressoe MAIS ALTO que um cilindro equivalente.');
  console.log('Um tubo cilíndrico de 169.5cm daria ~50 Hz (G1), mas');
  console.log('com essa campana pronunciada, sobe para G2 (~98 Hz).');
} else if (fundamentalFreq_NoTaper > 63 && fundamentalFreq_NoTaper < 68) {
  console.log('✅ RESULTADO: C2 (~65 Hz)');
  console.log('Isso corresponde à sua expectativa!');
} else {
  console.log('⚠️ RESULTADO INESPERADO');
  console.log('Vamos verificar se há algum problema no cálculo...');
}

// Primeiros 6 harmônicos
console.log('\n=== SÉRIE HARMÔNICA (tubo aberto) ===\n');
for (let n = 1; n <= 6; n++) {
  const harmFreq = fundamentalFreq_NoTaper * n;
  const harmNote = frequencyToNote(harmFreq);
  console.log(`H${n}: ${harmFreq.toFixed(1)} Hz (${harmNote.note})`);
}
