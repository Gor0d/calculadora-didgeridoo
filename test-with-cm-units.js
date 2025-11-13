/**
 * Testar se as medidas são em CENTÍMETROS
 */

const SPEED_OF_SOUND = 343; // m/s
const END_CORRECTION_FACTOR = 0.8;
const BELL_CORRECTION_FACTOR = 0.3;

console.log('=== TESTE: Medidas em CENTÍMETROS ===\n');

// Geometria interpretada como CENTÍMETROS × MILÍMETROS
const geometry_CM = [
  { position: 0, diameter: 30 },      // 0 cm, 30 mm
  { position: 100, diameter: 30 },    // 100 cm, 30 mm
  { position: 200, diameter: 35 },    // 200 cm, 35 mm
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
  { position: 1695, diameter: 90 }    // 1695 cm = 16.95 METROS!
];

// Converter: position em CM, diameter em MM
const points_CM = geometry_CM.map(p => ({
  position: p.position / 100, // cm to m
  diameter: p.diameter / 1000  // mm to m
}));

const physicalLength_CM = points_CM[points_CM.length - 1].position;
const bellRadius_CM = points_CM[points_CM.length - 1].diameter / 2;
const mouthRadius_CM = points_CM[0].diameter / 2;

const bellCorrection_CM = END_CORRECTION_FACTOR * bellRadius_CM;
const mouthCorrection_CM = BELL_CORRECTION_FACTOR * mouthRadius_CM;
const effectiveLength_CM = physicalLength_CM + bellCorrection_CM + mouthCorrection_CM;

const freq_CM = SPEED_OF_SOUND / (2 * effectiveLength_CM);

console.log('INTERPRETAÇÃO: Posição em CENTÍMETROS\n');
console.log(`Comprimento físico: ${(physicalLength_CM * 100).toFixed(0)} cm = ${physicalLength_CM.toFixed(2)} metros`);
console.log(`  ⚠️ ISSO É ${physicalLength_CM.toFixed(1)} METROS! (impossível)\n`);
console.log(`Frequência calculada: ${freq_CM.toFixed(2)} Hz\n`);

// Agora testar: E se for 169.5 cm (não 1695)?
console.log('\n=== TESTE: E se o comprimento for 169.5 CM? ===\n');

const geometry_1695mm = [
  { position: 0, diameter: 30 },
  { position: 10, diameter: 30 },
  { position: 20, diameter: 35 },
  { position: 30, diameter: 35 },
  { position: 40, diameter: 35 },
  { position: 50, diameter: 35 },
  { position: 60, diameter: 35 },
  { position: 70, diameter: 35 },
  { position: 80, diameter: 40 },
  { position: 90, diameter: 45 },
  { position: 100, diameter: 45 },
  { position: 110, diameter: 40 },
  { position: 120, diameter: 40 },
  { position: 130, diameter: 50 },
  { position: 140, diameter: 55 },
  { position: 150, diameter: 60 },
  { position: 155, diameter: 65 },
  { position: 160, diameter: 70 },
  { position: 169.5, diameter: 90 }
];

const points_1695mm = geometry_1695mm.map(p => ({
  position: p.position / 100, // cm to m
  diameter: p.diameter / 1000  // mm to m
}));

const physicalLength_1695mm = points_1695mm[points_1695mm.length - 1].position;
const bellRadius_1695mm = points_1695mm[points_1695mm.length - 1].diameter / 2;
const mouthRadius_1695mm = points_1695mm[0].diameter / 2;

const bellCorrection_1695mm = END_CORRECTION_FACTOR * bellRadius_1695mm;
const mouthCorrection_1695mm = BELL_CORRECTION_FACTOR * mouthRadius_1695mm;
const effectiveLength_1695mm = physicalLength_1695mm + bellCorrection_1695mm + mouthCorrection_1695mm;

const freq_1695mm = SPEED_OF_SOUND / (2 * effectiveLength_1695mm);

console.log('INTERPRETAÇÃO: 169.5 cm (não 1695)\n');
console.log(`Comprimento físico: ${(physicalLength_1695mm * 100).toFixed(1)} cm`);
console.log(`Frequência calculada: ${freq_1695mm.toFixed(2)} Hz`);
console.log(`  → Isso dá G2, não C2!\n`);

// TESTE CRUCIAL: Se o resultado da calculadora mostra C2,
// qual seria o comprimento real?
console.log('\n=== ANÁLISE CRUCIAL ===\n');
console.log('Se a calculadora mostra C2 (65.5 Hz), existem 3 possibilidades:\n');
console.log('1. O comprimento é ~2580mm (258 cm), não 1695mm');
console.log('2. Há algo diferente na geometria (formato de campana, etc)');
console.log('3. Os fatores de correção da calculadora estão ajustados\n');

console.log('Vamos verificar: qual comprimento daria C2?\n');

const targetFreq = 65.5;
const requiredEffLen = SPEED_OF_SOUND / (2 * targetFreq);

// Assumindo mesmos diâmetros
const testBellCorr = END_CORRECTION_FACTOR * (90 / 2000);
const testMouthCorr = BELL_CORRECTION_FACTOR * (30 / 2000);
const requiredPhysLen = requiredEffLen - testBellCorr - testMouthCorr;

console.log(`Para obter C2 (65.5 Hz):`);
console.log(`  Comprimento efetivo necessário: ${(requiredEffLen * 100).toFixed(1)} cm`);
console.log(`  Comprimento físico necessário: ${(requiredPhysLen * 100).toFixed(1)} cm (${(requiredPhysLen * 1000).toFixed(0)} mm)\n`);

console.log('═══════════════════════════════════════════════════════');
console.log('CONCLUSÃO:');
console.log('═══════════════════════════════════════════════════════\n');
console.log('Se você está vendo C2 na calculadora com essa geometria,');
console.log('então a calculadora está usando FATORES DE CORREÇÃO DIFERENTES');
console.log('dos valores teóricos padrão (0.8 e 0.3).\n');
console.log('Isso pode ser intencional para ajustar aos didges reais!');
