/**
 * Teste para verificar os cálculos acústicos
 */

const { acousticEngine } = require('./src/services/acoustic/AcousticEngine.js');
const { tuningService } = require('./src/services/tuning/TuningService.js');

// Dados fornecidos pelo usuário
const geometry = `0 30
100 30
200 35
300 35
400 35
500 35
600 35
700 35
800 40
900 45
1000 45
1100 40
1200 40
1300 50
1400 55
1500 60
1550 65
1600 70
1695 90`;

console.log('🧪 Testando Cálculos Acústicos\n');
console.log('=' .repeat(60));

// Parse geometry
const lines = geometry.trim().split('\n');
const points = lines.map(line => {
  const [position, diameter] = line.trim().split(/\s+/).map(Number);
  return { position, diameter };
});

console.log(`\n📏 Geometria:`);
console.log(`   Comprimento total: ${points[points.length - 1].position} cm (${(points[points.length - 1].position / 100).toFixed(2)} m)`);
console.log(`   Diâmetro bocal: ${points[0].diameter} mm`);
console.log(`   Diâmetro final: ${points[points.length - 1].diameter} mm`);
console.log(`   Número de pontos: ${points.length}`);

// Testar análise
(async () => {
  try {
    console.log('\n🔬 Executando análise acústica...\n');

    const results = await acousticEngine.analyzeGeometry(points);

    console.log('✅ Análise completa!\n');
    console.log(`Método usado: ${results.metadata.calculationMethod}`);
    console.log(`Comprimento efetivo: ${results.metadata.effectiveLength.toFixed(2)} cm`);
    console.log(`Raio médio: ${results.metadata.averageRadius.toFixed(2)} mm`);
    console.log(`Volume: ${results.metadata.volume.toFixed(0)} cm³`);

    console.log('\n📊 Frequências Encontradas:\n');
    console.log('Nº  | Freq (Hz) | Nota   | Oitava | Cents | Amplitude');
    console.log('-'.repeat(60));

    results.results.forEach((result, index) => {
      const harmonicNum = index + 1;
      const freq = result.frequency.toFixed(1);
      const note = result.note.padEnd(2);
      const octave = result.octave;
      const cents = result.cents > 0 ? `+${result.cents}` : result.cents;
      const amplitude = (result.amplitude * 100).toFixed(0) + '%';

      console.log(`${harmonicNum.toString().padStart(2)}  | ${freq.padStart(7)} | ${note}${octave}    | ${octave}      | ${cents.toString().padStart(5)} | ${amplitude}`);
    });

    // Verificação esperada
    console.log('\n\n🎯 Verificação:');
    console.log('-'.repeat(60));

    const fundamental = results.results[0];
    const expectedFundamental = 65; // C2 esperado

    console.log(`\nDrone esperado: C2 (~65 Hz)`);
    console.log(`Drone calculado: ${fundamental.note}${fundamental.octave} (${fundamental.frequency.toFixed(1)} Hz)`);

    if (fundamental.frequency >= 60 && fundamental.frequency <= 70) {
      console.log('✅ Fundamental está no range correto!');
    } else {
      console.log(`❌ Fundamental fora do esperado! Diferença: ${(fundamental.frequency - expectedFundamental).toFixed(1)} Hz`);
    }

    console.log(`\nNúmero de trombetas (harmônicos): ${results.results.length - 1}`);
    if (results.results.length >= 8) {
      console.log('✅ Pelo menos 8 notas diferentes encontradas!');
    } else {
      console.log(`⚠️  Apenas ${results.results.length} notas encontradas (esperado: 8+)`);
    }

  } catch (error) {
    console.error('\n❌ Erro na análise:', error.message);
    console.error(error.stack);
  }
})();
