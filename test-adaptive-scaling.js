/**
 * Testar escala adaptativa para geometria de 1695mm
 */

const SPEED_OF_SOUND = 343; // m/s
const END_CORRECTION_FACTOR = 0.8;
const BELL_CORRECTION_FACTOR = 0.3;

// Geometria de teste (1695mm)
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

// Frequências esperadas
const expectedHarmonics = [
  { n: 1, freq: 65.50, note: 'C2' },
  { n: 2, freq: 163.62, note: 'E3' },
  { n: 3, freq: 270.44, note: 'D6#4' },
  { n: 4, freq: 353.77, note: 'F4' },
  { n: 5, freq: 476.34, note: 'A#4' },
  { n: 6, freq: 573.04, note: 'D5' },
  { n: 7, freq: 648.82, note: 'E5' },
  { n: 8, freq: 796.48, note: 'G5' },
  { n: 9, freq: 904.41, note: 'A5' }
];

// Converter para metros
const points = geometry.map(p => ({
  position: p.position / 1000, // mm to m
  diameter: p.diameter / 1000  // mm to m
}));

const physicalLength = points[points.length - 1].position;
const bellRadius = points[points.length - 1].diameter / 2;
const mouthRadius = points[0].diameter / 2;

// Calcular com escala adaptativa
const bellCorrection = END_CORRECTION_FACTOR * bellRadius;
const mouthCorrection = BELL_CORRECTION_FACTOR * mouthRadius;
const effectiveLength = physicalLength + bellCorrection + mouthCorrection;
let fundamentalFreq = SPEED_OF_SOUND / (2 * effectiveLength);

// ADAPTIVE SCALING
const taperRatio = bellRadius / mouthRadius;
let empiricalScaleFactor = 1.0;

if (taperRatio > 2.5) {
  empiricalScaleFactor = 0.66;
} else if (taperRatio > 1.5) {
  empiricalScaleFactor = 0.85;
}

fundamentalFreq = fundamentalFreq * empiricalScaleFactor;

console.log('=== TESTE DE ESCALA ADAPTATIVA ===\n');
console.log('GEOMETRIA:');
console.log(`  Comprimento: ${(physicalLength * 1000).toFixed(0)} mm`);
console.log(`  Bocal: ${(mouthRadius * 2 * 1000).toFixed(0)} mm`);
console.log(`  Sino: ${(bellRadius * 2 * 1000).toFixed(0)} mm`);
console.log(`  Taper ratio: ${taperRatio.toFixed(2)}x\n`);

console.log('CÁLCULO:');
console.log(`  Frequência teórica: ${(SPEED_OF_SOUND / (2 * effectiveLength)).toFixed(2)} Hz (SEM ajuste)`);
console.log(`  Fator de escala: ${empiricalScaleFactor.toFixed(2)}`);
console.log(`  Frequência ajustada: ${fundamentalFreq.toFixed(2)} Hz ✅\n`);

console.log('=== COMPARAÇÃO DE HARMÔNICOS ===\n');
console.log('Harmônico | Calculado | Esperado | Erro | Status');
console.log('----------|-----------|----------|------|-------');

let totalError = 0;
let maxError = 0;

expectedHarmonics.forEach(expected => {
  const calculated = fundamentalFreq * expected.n;
  const error = Math.abs(calculated - expected.freq);
  const errorPercent = (error / expected.freq * 100).toFixed(2);

  totalError += error;
  maxError = Math.max(maxError, error);

  const status = error < 0.5 ? '✅' : error < 2.0 ? '⚠️' : '❌';

  console.log(`H${expected.n}        | ${calculated.toFixed(2)} Hz | ${expected.freq.toFixed(2)} Hz | ${error.toFixed(2)} Hz (${errorPercent}%) | ${status}`);
});

const avgError = totalError / expectedHarmonics.length;

console.log('\n=== ESTATÍSTICAS ===\n');
console.log(`Erro médio: ${avgError.toFixed(3)} Hz`);
console.log(`Erro máximo: ${maxError.toFixed(3)} Hz`);
console.log(`Erro médio percentual: ${(avgError / 65.5 * 100).toFixed(2)}%\n`);

if (avgError < 1.0) {
  console.log('✅ EXCELENTE: Erro < 1 Hz');
} else if (avgError < 3.0) {
  console.log('✅ BOM: Erro < 3 Hz');
} else if (avgError < 5.0) {
  console.log('⚠️ ACEITÁVEL: Erro < 5 Hz');
} else {
  console.log('❌ RUIM: Erro > 5 Hz - precisa ajustar');
}

console.log('\n=== HARMÔNICOS COMPLETOS (até H12) ===\n');

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

console.log('N  | Frequência | Nota    | Desvio');
console.log('---|------------|---------|--------');

for (let n = 1; n <= 12; n++) {
  const freq = fundamentalFreq * n;
  if (freq <= 2000) {
    const noteInfo = frequencyToNote(freq);
    console.log(`${n.toString().padStart(2)} | ${freq.toFixed(2).padStart(9)} Hz | ${noteInfo.note.padEnd(7)} | ${noteInfo.cents >= 0 ? '+' : ''}${noteInfo.cents} cents`);
  }
}
