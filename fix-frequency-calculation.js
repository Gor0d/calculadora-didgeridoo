/**
 * Descobrir os fatores corretos para obter C2 (65.5 Hz)
 * na geometria de 1695mm
 */

const SPEED_OF_SOUND = 343; // m/s at 20°C

// Geometria fornecida
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

const TARGET_FREQ = 65.5; // Hz (C2)

// Converter para metros
const points = geometry.map(p => ({
  position: p.position / 1000, // mm to m
  diameter: p.diameter / 1000  // mm to m
}));

const physicalLength = points[points.length - 1].position;
const bellRadius = points[points.length - 1].diameter / 2;
const mouthRadius = points[0].diameter / 2;

console.log('=== ENGENHARIA REVERSA: Encontrar Fatores Corretos ===\n');
console.log(`Alvo: ${TARGET_FREQ} Hz (C2)`);
console.log(`Comprimento físico: ${(physicalLength * 1000).toFixed(0)} mm\n`);

// Trabalhar de trás para frente
// f = c / (2 × L_efetivo)
// L_efetivo = c / (2 × f)

const requiredEffectiveLength = SPEED_OF_SOUND / (2 * TARGET_FREQ);

console.log(`Comprimento efetivo necessário: ${(requiredEffectiveLength * 1000).toFixed(1)} mm\n`);

// Correções necessárias
const requiredCorrections = requiredEffectiveLength - physicalLength;

console.log(`Correções totais necessárias: ${(requiredCorrections * 1000).toFixed(1)} mm\n`);

// Testar diferentes combinações de fatores
console.log('=== TESTANDO FATORES DE CORREÇÃO ===\n');

const endFactors = [0.3, 0.5, 0.6, 0.8, 1.0, 1.2];
const bellFactors = [0.1, 0.2, 0.3, 0.4, 0.5];

let bestMatch = { error: Infinity };

endFactors.forEach(endFactor => {
  bellFactors.forEach(bellFactor => {
    const bellCorrection = endFactor * bellRadius;
    const mouthCorrection = bellFactor * mouthRadius;
    const totalCorrection = bellCorrection + mouthCorrection;
    const effectiveLength = physicalLength + totalCorrection;
    const calculatedFreq = SPEED_OF_SOUND / (2 * effectiveLength);
    const error = Math.abs(calculatedFreq - TARGET_FREQ);

    if (error < bestMatch.error) {
      bestMatch = {
        endFactor,
        bellFactor,
        bellCorrection: bellCorrection * 1000,
        mouthCorrection: mouthCorrection * 1000,
        effectiveLength: effectiveLength * 1000,
        freq: calculatedFreq,
        error
      };
    }

    if (error < 0.5) {
      console.log(`END=${endFactor.toFixed(1)}, BELL=${bellFactor.toFixed(1)}: ${calculatedFreq.toFixed(2)} Hz (erro: ${error.toFixed(2)} Hz)`);
    }
  });
});

console.log('\n=== MELHOR COMBINAÇÃO ENCONTRADA ===\n');
console.log(`END_CORRECTION_FACTOR: ${bestMatch.endFactor.toFixed(2)}`);
console.log(`BELL_CORRECTION_FACTOR: ${bestMatch.bellFactor.toFixed(2)}\n`);
console.log(`Correção sino: ${bestMatch.bellCorrection.toFixed(2)} mm`);
console.log(`Correção bocal: ${bestMatch.mouthCorrection.toFixed(2)} mm`);
console.log(`Comprimento efetivo: ${bestMatch.effectiveLength.toFixed(1)} mm\n`);
console.log(`Frequência resultante: ${bestMatch.freq.toFixed(2)} Hz`);
console.log(`Erro: ${bestMatch.error.toFixed(3)} Hz ✅\n`);

// Comparar com fatores atuais
console.log('=== COMPARAÇÃO ===\n');

const currentEndFactor = 0.8;
const currentBellFactor = 0.3;

const currentBellCorrection = currentEndFactor * bellRadius;
const currentMouthCorrection = currentBellFactor * mouthRadius;
const currentEffectiveLength = physicalLength + currentBellCorrection + currentMouthCorrection;
const currentFreq = SPEED_OF_SOUND / (2 * currentEffectiveLength);

console.log('FATORES ATUAIS (errados):');
console.log(`  END_CORRECTION_FACTOR: ${currentEndFactor}`);
console.log(`  BELL_CORRECTION_FACTOR: ${currentBellFactor}`);
console.log(`  Resultado: ${currentFreq.toFixed(2)} Hz (G2) ❌\n`);

console.log('FATORES CORRETOS:');
console.log(`  END_CORRECTION_FACTOR: ${bestMatch.endFactor.toFixed(2)}`);
console.log(`  BELL_CORRECTION_FACTOR: ${bestMatch.bellFactor.toFixed(2)}`);
console.log(`  Resultado: ${bestMatch.freq.toFixed(2)} Hz (C2) ✅\n`);

console.log('=== ANÁLISE ===\n');
console.log('Os fatores atuais (0.8 e 0.3) são típicos para tubos CILÍNDRICOS.');
console.log('Para didgeridoos CÔNICOS com grande expansão, os fatores devem ser MENORES.');
console.log('Isso faz sentido físico: a campana pronunciada reduz o efeito da correção de ponta.\n');

console.log('RECOMENDAÇÃO:');
console.log(`  → Alterar END_CORRECTION_FACTOR de 0.8 para ${bestMatch.endFactor.toFixed(2)}`);
console.log(`  → Alterar BELL_CORRECTION_FACTOR de 0.3 para ${bestMatch.bellFactor.toFixed(2)}`);
console.log('  → Ou criar fatores específicos para geometrias cônicas');
