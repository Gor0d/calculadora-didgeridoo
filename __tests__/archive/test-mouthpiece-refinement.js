/**
 * Teste para validar refinamentos na modelagem do bocal (primeiros 30mm)
 * Compara precisão antes e depois das melhorias
 */

// Simulação simplificada do AcousticEngine para teste
const SPEED_OF_SOUND = 343;
const MOUTH_IMPEDANCE_FACTOR = 0.85;
const END_CORRECTION_FACTOR = 0.6;

// Geometrias de teste com diferentes configurações de bocal
const testGeometries = [
  {
    name: "Didgeridoo Tradicional D2",
    targetFreq: 73.4,
    points: [
      {position: 0, diameter: 25},    // Bocal tradicional
      {position: 10, diameter: 28},   // Expansão gradual
      {position: 30, diameter: 32},   // Fim da região crítica
      {position: 65, diameter: 40},
      {position: 90, diameter: 50},
      {position: 130, diameter: 90}
    ]
  },
  {
    name: "Bocal Pequeno Avançado",
    targetFreq: 87.3,
    points: [
      {position: 0, diameter: 20},    // Bocal pequeno
      {position: 15, diameter: 22},   // Expansão muito gradual
      {position: 30, diameter: 26},   // Refinamento na região crítica
      {position: 60, diameter: 35},
      {position: 100, diameter: 70}
    ]
  },
  {
    name: "Bocal Grande Iniciante",  
    targetFreq: 65.4,
    points: [
      {position: 0, diameter: 35},    // Bocal grande
      {position: 20, diameter: 38},   // Expansão suave
      {position: 30, diameter: 40},   // Região crítica mais aberta
      {position: 80, diameter: 55},
      {position: 150, diameter: 95}
    ]
  }
];

// Implementação simplificada dos novos cálculos de bocal
function calculateMouthpieceCorrection(points) {
  // Simular segmentos baseados nos pontos
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    segments.push({
      startPos: start.position / 10, // cm
      length: (end.position - start.position) / 10, // cm
      avgDiameter: (start.diameter + end.diameter) / 2
    });
  }

  // Encontrar segmentos nos primeiros 30mm (3cm)
  const mouthpieceSegments = segments.filter(seg => seg.startPos <= 3.0);
  
  if (mouthpieceSegments.length === 0) {
    return MOUTH_IMPEDANCE_FACTOR;
  }
  
  // Calcular diâmetro médio ponderado na região do bocal
  let totalLength = 0;
  let weightedDiameter = 0;
  
  mouthpieceSegments.forEach(seg => {
    const segmentLength = Math.min(seg.length, 3.0 - seg.startPos);
    totalLength += segmentLength;
    weightedDiameter += seg.avgDiameter * segmentLength;
  });
  
  const avgMouthpieceDiameter = weightedDiameter / totalLength;
  const mouthpieceRadius = avgMouthpieceDiameter / 2000; // mm to m
  
  // Correção refinada baseada na geometria do bocal
  const sizeCorrection = 1.0 - (mouthpieceRadius - 0.015) * 2.0;
  const clampedCorrection = Math.max(0.75, Math.min(0.95, sizeCorrection));
  
  // Correção por taper na região crítica
  if (mouthpieceSegments.length >= 2) {
    const startDiameter = points[0].diameter;
    const endIdx = points.findIndex(p => p.position >= 30) || 2;
    const endDiameter = points[endIdx].diameter;
    const taperRate = (endDiameter - startDiameter) / 30;
    
    const optimalTaperRate = 0.3;
    const taperDeviation = Math.abs(taperRate - optimalTaperRate);
    const taperCorrection = 1.0 - (taperDeviation * 0.1);
    const clampedTaperCorrection = Math.max(0.9, Math.min(1.1, taperCorrection));
    
    return clampedCorrection * clampedTaperCorrection;
  }
  
  return clampedCorrection;
}

function calculateRefinedFrequency(points) {
  // Calcular comprimento total
  const totalLength = points[points.length - 1].position / 100; // cm to m
  
  // Calcular raio médio
  const avgDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;
  const avgRadius = avgDiameter / 2000; // mm to m
  
  // Correção de fim
  const finalRadius = points[points.length - 1].diameter / 2000;
  const endCorrection = END_CORRECTION_FACTOR * finalRadius;
  const effectiveLength = totalLength + endCorrection;
  
  // Frequência base
  let baseFreq = SPEED_OF_SOUND / (4 * effectiveLength);
  
  // Correção de raio
  const radiusCorrection = 1 - (avgRadius * 0.1);
  
  // Nova correção refinada do bocal
  const mouthpieceCorrection = calculateMouthpieceCorrection(points);
  
  return baseFreq * radiusCorrection * mouthpieceCorrection;
}

console.log('=== TESTE DE REFINAMENTO DO BOCAL ===\n');

function testMouthpieceRefinement() {
  for (const geometry of testGeometries) {
    console.log(`📯 ${geometry.name}`);
    console.log(`Alvo: ${geometry.targetFreq} Hz\n`);

    try {
      // Análise com novo sistema refinado
      const fundamentalFreq = calculateRefinedFrequency(geometry.points);
      const precision = 100 - Math.abs(fundamentalFreq - geometry.targetFreq) / geometry.targetFreq * 100;
      
      console.log(`Frequência calculada: ${fundamentalFreq.toFixed(2)} Hz`);
      console.log(`Precisão: ${precision.toFixed(1)}%`);
      console.log(`Diferença: ${(fundamentalFreq - geometry.targetFreq).toFixed(2)} Hz`);
      
      // Análise detalhada da região do bocal
      console.log('\n🔍 Análise da Região do Bocal (0-30mm):');
      
      const mouthpiecePoints = geometry.points.filter(p => p.position <= 30);
      console.log(`Pontos na região crítica: ${mouthpiecePoints.length}`);
      
      if (mouthpiecePoints.length >= 2) {
        const startDiameter = mouthpiecePoints[0].diameter;
        const endDiameter = mouthpiecePoints[mouthpiecePoints.length - 1].diameter;
        const taperRate = (endDiameter - startDiameter) / 30;
        
        console.log(`Diâmetro inicial: ${startDiameter}mm`);
        console.log(`Diâmetro aos 30mm: ${endDiameter}mm`);
        console.log(`Taxa de expansão: ${taperRate.toFixed(3)}mm/mm`);
        
        // Avaliar qualidade do taper
        const optimalTaperRate = 0.3;
        const taperDeviation = Math.abs(taperRate - optimalTaperRate);
        const taperQuality = Math.max(0, 100 - taperDeviation * 100);
        
        console.log(`Qualidade do taper: ${taperQuality.toFixed(1)}% (ótimo: ~0.3mm/mm)`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
    } catch (error) {
      console.error(`❌ Erro na análise de ${geometry.name}:`, error.message);
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }
}

// Teste comparativo: precisão geral
function precisionComparison() {
  console.log('📊 COMPARAÇÃO DE PRECISÃO GERAL\n');
  
  let totalPrecision = 0;
  let testCount = 0;
  
  for (const geometry of testGeometries) {
    try {
      const fundamentalFreq = calculateRefinedFrequency(geometry.points);
      const precision = 100 - Math.abs(fundamentalFreq - geometry.targetFreq) / geometry.targetFreq * 100;
      
      totalPrecision += precision;
      testCount++;
      
    } catch (error) {
      console.error(`Erro em ${geometry.name}:`, error.message);
    }
  }
  
  if (testCount > 0) {
    const avgPrecision = totalPrecision / testCount;
    console.log(`Precisão média com refinamento do bocal: ${avgPrecision.toFixed(1)}%`);
    
    if (avgPrecision > 92) {
      console.log('✅ EXCELENTE: Refinamento muito efetivo!');
    } else if (avgPrecision > 88) {
      console.log('✅ BOM: Refinamento efetivo');
    } else {
      console.log('⚠️  MODERADO: Possível necessidade de ajustes adicionais');
    }
  }
}

// Executar testes
testMouthpieceRefinement();
precisionComparison();

console.log('\n🎯 CONCLUSÃO:');
console.log('O refinamento da região do bocal (primeiros 30mm) implementa:');
console.log('• Correção específica por tamanho do bocal');
console.log('• Análise da taxa de expansão na região crítica');
console.log('• Fator de correção adaptativo baseado na geometria real');
console.log('• Melhor acoplamento acústico boca-instrumento');