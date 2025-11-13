/**
 * Teste direto do TMM com geometria de 1695mm
 * Simula o que acontece na aplicação real
 */

// Importar módulos necessários (simulado)
const { acousticEngine } = require('./src/services/acoustic/AcousticEngine.js');

// Geometria de teste (formato CM × MM)
const geometryText = `0 30
10 30
20 35
30 35
40 35
50 35
60 35
70 35
80 40
90 45
100 45
110 40
120 40
130 50
140 55
150 60
155 65
160 70
169.5 90`;

// Parse geometry
const lines = geometryText.trim().split('\n');
const points = lines.map(line => {
  const [position, diameter] = line.trim().split(/\s+/).map(parseFloat);
  return { position, diameter };
});

console.log('=== TESTE TMM DIRETO ===\n');
console.log(`Pontos de geometria: ${points.length}`);
console.log(`Comprimento: ${points[points.length - 1].position} cm\n`);

// Testar análise
(async () => {
  try {
    console.log('Executando análise TMM...\n');

    const result = await acousticEngine.analyzeGeometry(points);

    console.log('=== RESULTADOS ===\n');
    console.log(`Método usado: ${result.metadata.calculationMethod}`);
    console.log(`Comprimento efetivo: ${result.metadata.effectiveLength.toFixed(1)} cm\n`);

    console.log('RESSONÂNCIAS ENCONTRADAS:\n');
    console.log('N  | Frequência | Nota    | Desvio   | Amplitude | Qualidade');
    console.log('---|------------|---------|----------|-----------|----------');

    result.results.forEach((res, idx) => {
      if (idx < 12) { // Primeiros 12
        console.log(
          `${(idx + 1).toString().padStart(2)} | ` +
          `${res.frequency.toFixed(2).padStart(9)} Hz | ` +
          `${(res.note + res.octave).padEnd(7)} | ` +
          `${(res.cents >= 0 ? '+' : '')}${res.cents.toString().padStart(3)} cents | ` +
          `${res.amplitude.toFixed(2).padStart(8)} | ` +
          `${res.quality.toFixed(2).padStart(8)}`
        );
      }
    });

    console.log('\n=== FREQUÊNCIAS ESPERADAS ===\n');
    const expected = [
      { n: 1, freq: 65.50, note: 'C2' },
      { n: 2, freq: 163.62, note: 'E3' },
      { n: 3, freq: 270.44, note: 'D6#4' },
      { n: 4, freq: 353.77, note: 'F4' },
      { n: 5, freq: 476.34, note: 'A#4' },
      { n: 6, freq: 573.04, note: 'D5' }
    ];

    console.log('N  | Calculado  | Esperado   | Erro');
    console.log('---|------------|------------|--------');

    expected.forEach(exp => {
      const calc = result.results[exp.n - 1];
      if (calc) {
        const error = Math.abs(calc.frequency - exp.freq);
        const errorPercent = (error / exp.freq * 100).toFixed(1);
        console.log(
          `${exp.n.toString().padStart(2)} | ` +
          `${calc.frequency.toFixed(2).padStart(9)} Hz | ` +
          `${exp.freq.toFixed(2).padStart(9)} Hz | ` +
          `${error.toFixed(2)} Hz (${errorPercent}%)`
        );
      }
    });

  } catch (error) {
    console.error('ERRO:', error.message);
    console.error(error.stack);
  }
})();
