/**
 * Análise da Geometria Real Medida
 *
 * Valores parecem estar em mm, não cm!
 * Vamos converter e analisar
 */

const SPEED_OF_SOUND = 343.2; // m/s

// Dados originais (SUSPEITA: estão em mm)
const medidaOriginal = `0 30
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

console.log('🔬 ANÁLISE DE GEOMETRIA REAL MEDIDA\n');
console.log('='.repeat(70));

// Parsear dados
const linhas = medidaOriginal.trim().split('\n');
const pontos = linhas.map(linha => {
  const [pos, diam] = linha.trim().split(/\s+/).map(Number);
  return { posicao: pos, diametro: diam };
});

console.log('\n📊 DADOS ORIGINAIS:');
console.log(`  - ${pontos.length} pontos de medição`);
console.log(`  - Posição inicial: ${pontos[0].posicao}`);
console.log(`  - Posição final: ${pontos[pontos.length - 1].posicao}`);
console.log(`  - Diâmetro inicial: ${pontos[0].diametro}`);
console.log(`  - Diâmetro final: ${pontos[pontos.length - 1].diametro}`);

// HIPÓTESE 1: Valores estão em MM
console.log('\n' + '='.repeat(70));
console.log('💡 HIPÓTESE 1: Valores em MILÍMETROS (mm)');
console.log('='.repeat(70));

const comprimentoMM = pontos[pontos.length - 1].posicao; // 1695 mm
const comprimentoCM = comprimentoMM / 10; // 169.5 cm
const comprimentoM = comprimentoMM / 1000; // 1.695 m

console.log(`\n📏 Dimensões Convertidas:`);
console.log(`  - Comprimento: ${comprimentoMM} mm = ${comprimentoCM} cm = ${comprimentoM.toFixed(3)} m`);
console.log(`  - Bocal: ${pontos[0].diametro} mm = ${(pontos[0].diametro / 10).toFixed(1)} cm`);
console.log(`  - Saída: ${pontos[pontos.length - 1].diametro} mm = ${(pontos[pontos.length - 1].diametro / 10).toFixed(1)} cm`);
console.log(`  - Fator de taper: ${(pontos[pontos.length - 1].diametro / pontos[0].diametro).toFixed(2)}x`);

// Análise acústica (MM -> M)
const raioMedio = pontos.reduce((sum, p) => sum + (p.diametro / 2000), 0) / pontos.length;
const correcaoFim = 0.6 * (pontos[pontos.length - 1].diametro / 2000);
const comprimentoEfetivo = comprimentoM + correcaoFim;

const fundamentalBase = SPEED_OF_SOUND / (4 * comprimentoEfetivo);
const correcaoBocal = 0.85;
const fundamentalCorrigido = fundamentalBase * correcaoBocal;

console.log(`\n🎵 Análise Acústica (se valores em MM):`);
console.log(`  - Comprimento efetivo: ${(comprimentoEfetivo * 100).toFixed(1)} cm`);
console.log(`  - Raio médio: ${(raioMedio * 1000).toFixed(1)} mm`);
console.log(`  - Frequência fundamental: ${fundamentalCorrigido.toFixed(2)} Hz`);

// Converter para nota
const A4 = 440;
const semitons = 12 * Math.log2(fundamentalCorrigido / A4);
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteIndex = Math.round(semitons + 9) % 12;
const octave = Math.floor((semitons + 9) / 12) + 4;
const nota = noteNames[noteIndex < 0 ? noteIndex + 12 : noteIndex];

console.log(`  - Nota estimada: ${nota}${octave}`);

// Validação
if (fundamentalCorrigido >= 30 && fundamentalCorrigido <= 80) {
  console.log(`  ✅ VÁLIDO - Faixa típica de didgeridoo (30-80 Hz)`);
} else {
  console.log(`  ⚠️ ATENÇÃO - Fora da faixa típica`);
}

// HIPÓTESE 2: Valores estão em CM (como app espera)
console.log('\n' + '='.repeat(70));
console.log('💡 HIPÓTESE 2: Valores em CENTÍMETROS (cm)');
console.log('='.repeat(70));

const comprimentoCM2 = pontos[pontos.length - 1].posicao; // 1695 cm
const comprimentoM2 = comprimentoCM2 / 100; // 16.95 m

console.log(`\n📏 Dimensões:`);
console.log(`  - Comprimento: ${comprimentoCM2} cm = ${comprimentoM2.toFixed(2)} m`);
console.log(`  - Bocal: ${pontos[0].diametro} mm`);
console.log(`  - Saída: ${pontos[pontos.length - 1].diametro} mm`);

const raioMedio2 = pontos.reduce((sum, p) => sum + (p.diametro / 2000), 0) / pontos.length;
const correcaoFim2 = 0.6 * (pontos[pontos.length - 1].diametro / 2000);
const comprimentoEfetivo2 = comprimentoM2 + correcaoFim2;

const fundamentalBase2 = SPEED_OF_SOUND / (4 * comprimentoEfetivo2);
const fundamentalCorrigido2 = fundamentalBase2 * correcaoBocal;

console.log(`\n🎵 Análise Acústica (se valores em CM):`);
console.log(`  - Comprimento efetivo: ${(comprimentoEfetivo2 * 100).toFixed(1)} cm`);
console.log(`  - Frequência fundamental: ${fundamentalCorrigido2.toFixed(2)} Hz`);

if (fundamentalCorrigido2 >= 30 && fundamentalCorrigido2 <= 80) {
  console.log(`  ✅ VÁLIDO - Faixa típica de didgeridoo`);
} else {
  console.log(`  ❌ INVÁLIDO - Muito baixa! (${fundamentalCorrigido2.toFixed(0)} Hz é absurdo)`);
}

// CONCLUSÃO
console.log('\n' + '='.repeat(70));
console.log('🎯 CONCLUSÃO');
console.log('='.repeat(70));

if (fundamentalCorrigido >= 30 && fundamentalCorrigido <= 80) {
  console.log('\n✅ OS VALORES ESTÃO EM MILÍMETROS (mm)!\n');
  console.log('📋 Geometria Correta para o App (em CM):');
  console.log('\nCOMPRIMENTO: 169.5');
  console.log('DIÂMETROS:');
  pontos.forEach(p => {
    console.log(`${(p.posicao / 10).toFixed(1)},${(p.diametro / 10).toFixed(1)}`);
  });

  console.log('\n📝 String compacta para o app:');
  const geometryString = pontos.map(p => `${(p.posicao / 10).toFixed(1)},${(p.diametro / 10).toFixed(1)}`).join(' ');
  console.log(geometryString);

  console.log('\n🎵 Características do seu didgeridoo:');
  console.log(`  - Comprimento: ${comprimentoCM} cm (longo!)`);
  console.log(`  - Fundamental: ~${fundamentalCorrigido.toFixed(0)} Hz (${nota}${octave})`);
  console.log(`  - Tipo: Didgeridoo longo, baixo`);
  console.log(`  - Estilo: Similar a Yidaki tradicional`);
} else {
  console.log('\n⚠️ Valores originais podem estar em unidade diferente');
  console.log('Por favor, confirme as unidades de medida');
}

console.log('\n' + '='.repeat(70));
console.log('🔍 ANÁLISE DE GEOMETRIA DETALHADA\n');

// Detectar regiões da geometria
console.log('📊 Perfil do Bore (convertido para CM):');
let regiaoAtual = null;

for (let i = 0; i < pontos.length - 1; i++) {
  const p1 = pontos[i];
  const p2 = pontos[i + 1];

  const posCM1 = (p1.posicao / 10).toFixed(1);
  const posCM2 = (p2.posicao / 10).toFixed(1);
  const diamCM1 = (p1.diametro / 10).toFixed(1);
  const diamCM2 = (p2.diametro / 10).toFixed(1);

  const mudanca = p2.diametro - p1.diametro;

  let tipo = '';
  if (mudanca === 0) {
    tipo = '━━ Cilíndrico';
  } else if (mudanca > 0) {
    tipo = `↗️  Expansão (+${(mudanca / 10).toFixed(1)}cm)`;
  } else {
    tipo = `↘️  Redução (${(mudanca / 10).toFixed(1)}cm)`;
  }

  // Detectar regiões
  let nomeRegiao = '';
  if (p1.posicao < 300) {
    nomeRegiao = '[BOCAL]';
  } else if (p1.posicao < 800) {
    nomeRegiao = '[MEIO]';
  } else if (p1.posicao > 1400) {
    nomeRegiao = '[BELL/SAÍDA]';
  }

  console.log(`  ${posCM1}-${posCM2}cm: ⌀${diamCM1}→${diamCM2}cm ${tipo} ${nomeRegiao}`);
}

console.log('\n🎯 Características Especiais:');
console.log(`  - Bocal pequeno: ${pontos[0].diametro}mm (ótimo para controle)`);
console.log(`  - Expansão gradual no meio`);
console.log(`  - Bell grande: ${pontos[pontos.length - 1].diametro}mm (boa projeção)`);
console.log(`  - Comprimento ${comprimentoCM} cm = instrumento GRAVE`);

console.log('\n💡 Dicas de Uso:');
console.log(`  - Este é um didgeridoo de frequência baixa (~${fundamentalCorrigido.toFixed(0)} Hz)`);
console.log(`  - Ótimo para drones profundos e meditativos`);
console.log(`  - Requer mais ar devido ao comprimento`);
console.log(`  - Bell grande ajuda na projeção do som`);

console.log('\n' + '='.repeat(70));
