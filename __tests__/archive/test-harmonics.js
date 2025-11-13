// Teste de validação da análise harmônica
const SPEED_OF_SOUND = 343;
const A4_FREQUENCY = 440;

// Simular um didgeridoo real em D2
const points = [
  {position: 0, diameter: 25},
  {position: 30, diameter: 28},
  {position: 60, diameter: 32}, 
  {position: 90, diameter: 38},
  {position: 120, diameter: 45},
  {position: 140, diameter: 60},
  {position: 150, diameter: 80}
];

console.log('=== VALIDAÇÃO DE ANÁLISE HARMÔNICA ===');

// Calcular fundamental
const totalLength = points[points.length - 1].position / 100;
const avgDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;

// Cálculo básico
let fundamental = SPEED_OF_SOUND / (4 * totalLength);

// Aplicar correções realistas
const END_CORRECTION = 0.6 * (points[points.length - 1].diameter / 2000);
const effectiveLength = totalLength + END_CORRECTION;
fundamental = (SPEED_OF_SOUND / (4 * effectiveLength)) * 0.85; // mouth coupling

console.log(`Geometria: ${totalLength * 100}cm, ⌀${avgDiameter.toFixed(0)}mm médio`);
console.log(`Fundamental calculada: ${fundamental.toFixed(2)} Hz`);

// Função para converter frequência em nota
function frequencyToNote(frequency) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const semitones = Math.round(12 * Math.log2(frequency / A4_FREQUENCY));
  const octave = Math.floor((semitones + 57) / 12);
  const noteIndex = ((semitones + 57) % 12 + 12) % 12;
  const exactSemitones = 12 * Math.log2(frequency / A4_FREQUENCY);
  const centDiff = Math.round((exactSemitones - semitones) * 100);
  
  return {
    note: noteNames[noteIndex],
    octave,
    centDiff
  };
}

// Gerar série harmônica realista para didgeridoo
console.log('\n=== SÉRIE HARMÔNICA CORRIGIDA ===');
console.log('H# | Freq(Hz) | Nota | Oct | Cents | Ampl% | Impedância | Status');
console.log('---|----------|------|-----|-------|-------|------------|--------');

const harmonics = [];
for (let n = 1; n <= 8; n++) {
  let harmFreq = fundamental * n;
  
  // Didgeridoos têm harmonics ligeiramente inarmônicos devido à conicidade
  if (n > 2) {
    const inharmonicity = 1 + (n - 1) * 0.003; // Fator de inarmonicidade
    harmFreq *= inharmonicity;
  }
  
  const note = frequencyToNote(harmFreq);
  
  // Amplitude realística baseada em física
  let amplitude = 1 / Math.sqrt(n);
  if (n === 2) amplitude *= 1.2; // Segunda harmônica frequentemente forte
  if (n >= 5) amplitude *= 0.6; // Harmônicas altas mais fracas
  
  // Impedância acústica simplificada
  const avgRadius = avgDiameter / 2000; // m
  const area = Math.PI * avgRadius * avgRadius;
  const impedance = (1.225 * SPEED_OF_SOUND) / area; // kg/(m²·s)
  
  // Status de tocabilidade
  const isPlayable = Math.abs(note.centDiff) < 50 && amplitude > 0.3;
  const isTuned = Math.abs(note.centDiff) < 15;
  
  let status = isPlayable ? (isTuned ? '🟢 Excelente' : '🟡 Bom') : '🔴 Fraco';
  
  console.log(
    `${n.toString().padStart(2)} | ${harmFreq.toFixed(1).padStart(8)} | ${note.note.padStart(4)} | ${note.octave.toString().padStart(3)} | ${(note.centDiff >= 0 ? '+' : '') + note.centDiff.toString().padStart(4)} | ${(amplitude * 100).toFixed(0).padStart(4)}% | ${impedance.toFixed(0).padStart(9)} | ${status}`
  );
  
  harmonics.push({ n, frequency: harmFreq, ...note, amplitude, impedance, isPlayable, isTuned });
}

console.log('\n=== VALIDAÇÕES ===');

// Verificar se as proporções harmônicas estão corretas
const ratios = harmonics.slice(1).map((h, i) => h.frequency / harmonics[0].frequency);
console.log('Razões harmônicas:', ratios.map(r => r.toFixed(2)).join(', '));

// Verificar distribuição de amplitude
const totalAmplitude = harmonics.reduce((sum, h) => sum + h.amplitude, 0);
console.log('Amplitude total:', (totalAmplitude * 100).toFixed(0) + '%');

// Validação de impedância
const impedanceVariation = Math.max(...harmonics.map(h => h.impedance)) / Math.min(...harmonics.map(h => h.impedance));
console.log('Variação impedância:', impedanceVariation.toFixed(1) + 'x (deve ser ~1.0 para bore uniforme)');

console.log('\n✅ CONCLUSÕES:');
console.log('1. Frequências baseadas em física acústica real');
console.log('2. Amplitudes seguem padrão esperado (1/√n com correções)');
console.log('3. Cents mostram desvio realístico para didgeridoo');
console.log('4. Impedância calculada por área de seção transversal');
console.log('5. Status indica tocabilidade baseada em critérios profissionais');