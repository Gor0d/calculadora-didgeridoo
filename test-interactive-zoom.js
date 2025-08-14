/**
 * Teste das funcionalidades interativas de zoom e pan
 * Simula gestos de pinch, pan e mouse wheel
 */

// Simular estado da visualização interativa
class InteractiveVisualization {
  constructor() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.minZoom = 0.5;
    this.maxZoom = 3.0;
  }

  // Simular pinch zoom (dois dedos)
  pinchZoom(startDistance, endDistance, initialZoom = this.zoom) {
    if (startDistance <= 0 || endDistance <= 0) return this.zoom;
    
    const scale = endDistance / startDistance;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, initialZoom * scale));
    
    console.log(`🤏 Pinch: ${startDistance.toFixed(0)}px → ${endDistance.toFixed(0)}px`);
    console.log(`   Escala: ${scale.toFixed(2)}x`);
    console.log(`   Zoom: ${this.zoom.toFixed(2)} → ${newZoom.toFixed(2)}`);
    
    this.zoom = newZoom;
    return this.zoom;
  }

  // Simular pan (arrastar)
  pan(deltaX, deltaY) {
    if (this.zoom <= 1.0) {
      console.log(`☝️ Pan bloqueado: zoom ${this.zoom.toFixed(2)} ≤ 1.0`);
      return { x: this.panX, y: this.panY };
    }

    const newPanX = this.panX + deltaX * 0.5; // Damping factor
    const newPanY = this.panY + deltaY * 0.5;
    
    console.log(`☝️ Pan: (${deltaX.toFixed(0)}, ${deltaY.toFixed(0)})`);
    console.log(`   Offset: (${this.panX.toFixed(0)}, ${this.panY.toFixed(0)}) → (${newPanX.toFixed(0)}, ${newPanY.toFixed(0)})`);
    
    this.panX = newPanX;
    this.panY = newPanY;
    return { x: this.panX, y: this.panY };
  }

  // Simular mouse wheel
  mouseWheel(deltaY) {
    const delta = deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));
    
    console.log(`🖱️  Mouse wheel: deltaY=${deltaY}`);
    console.log(`   Zoom: ${this.zoom.toFixed(2)} → ${newZoom.toFixed(2)}`);
    
    this.zoom = newZoom;
    return this.zoom;
  }

  // Reset para posição inicial
  reset() {
    console.log(`🔄 Reset: zoom ${this.zoom.toFixed(2)} → 1.0, pan (${this.panX.toFixed(0)}, ${this.panY.toFixed(0)}) → (0, 0)`);
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  // Estado atual
  getState() {
    return {
      zoom: this.zoom,
      pan: { x: this.panX, y: this.panY },
      isZoomedIn: this.zoom > 1.0,
      isPanned: Math.abs(this.panX) > 10 || Math.abs(this.panY) > 10
    };
  }
}

console.log('=== TESTE DE FUNCIONALIDADES INTERATIVAS ===\n');

const visualization = new InteractiveVisualization();

// Teste 1: Pinch Zoom
console.log('🤏 TESTE 1: PINCH ZOOM\n');

console.log('Simulando pinch zoom (afastar dedos):');
visualization.pinchZoom(100, 150); // 1.5x zoom
console.log(`Estado: zoom=${visualization.getState().zoom.toFixed(2)}\n`);

console.log('Simulando pinch zoom (aproximar dedos):');  
visualization.pinchZoom(150, 100, visualization.zoom); // 0.67x zoom
console.log(`Estado: zoom=${visualization.getState().zoom.toFixed(2)}\n`);

console.log('Testando limites de zoom:');
visualization.pinchZoom(100, 500); // Muito zoom
console.log(`Estado: zoom=${visualization.getState().zoom.toFixed(2)} (limitado)\n`);

// Teste 2: Pan (Arrastar)
console.log('☝️ TESTE 2: PAN (ARRASTAR)\n');

console.log('Tentando pan com zoom 1.0 (deve ser bloqueado):');
visualization.reset();
visualization.pan(50, 30);
console.log(`Estado: ${JSON.stringify(visualization.getState(), null, 2)}\n`);

console.log('Pan com zoom > 1.0:');
visualization.zoom = 2.0;
visualization.pan(50, 30);
console.log(`Estado: ${JSON.stringify(visualization.getState(), null, 2)}\n`);

console.log('Continuando pan:');
visualization.pan(-100, 20);
console.log(`Estado: ${JSON.stringify(visualization.getState(), null, 2)}\n`);

// Teste 3: Mouse Wheel
console.log('🖱️  TESTE 3: MOUSE WHEEL\n');

visualization.reset();
console.log('Scroll para baixo (zoom out):');
visualization.mouseWheel(1);
console.log(`Estado: zoom=${visualization.getState().zoom.toFixed(2)}\n`);

console.log('Scroll para cima (zoom in):');
visualization.mouseWheel(-1);
visualization.mouseWheel(-1);
console.log(`Estado: zoom=${visualization.getState().zoom.toFixed(2)}\n`);

// Teste 4: Cenários de Uso
console.log('🎯 TESTE 4: CENÁRIOS DE USO REALISTAS\n');

console.log('Cenário: Análise detalhada do bocal');
visualization.reset();
console.log('1. Fazer zoom 2x no bocal:');
visualization.pinchZoom(100, 200);
console.log('2. Pan para focar região do bocal:');
visualization.pan(-50, 0);
console.log(`Estado final: ${JSON.stringify(visualization.getState(), null, 2)}\n`);

console.log('Cenário: Navegação rápida:');
console.log('1. Zoom máximo com mouse wheel:');
for (let i = 0; i < 20; i++) {
  visualization.mouseWheel(-1);
}
console.log('2. Explorar geometria com pan:');
visualization.pan(100, 0);  // Direita
visualization.pan(-200, 0); // Esquerda
visualization.pan(100, 50); // Centro-baixo
console.log(`Estado final: ${JSON.stringify(visualization.getState(), null, 2)}\n`);

// Teste 5: Validação de Limites
console.log('⚠️  TESTE 5: VALIDAÇÃO DE LIMITES\n');

visualization.reset();
console.log('Testando zoom mínimo:');
for (let i = 0; i < 10; i++) {
  visualization.mouseWheel(1);
}
console.log(`Zoom final: ${visualization.getState().zoom.toFixed(2)} (min: 0.5)\n`);

console.log('Testando zoom máximo:');
visualization.reset();
for (let i = 0; i < 30; i++) {
  visualization.mouseWheel(-1);
}
console.log(`Zoom final: ${visualization.getState().zoom.toFixed(2)} (max: 3.0)\n`);

console.log('🎯 RESUMO DAS FUNCIONALIDADES IMPLEMENTADAS:\n');

console.log('📱 GESTOS MÓVEIS:');
console.log('✅ Pinch zoom (dois dedos afastando/aproximando)');
console.log('✅ Pan habilitado apenas quando zoom > 1.0');
console.log('✅ Damping factor para movimentos suaves');
console.log('✅ Limites de zoom (0.5x - 3.0x)');
console.log('');

console.log('🖥️  DESKTOP:');
console.log('✅ Mouse wheel para zoom incremental');
console.log('✅ Prevenção de scroll da página durante zoom');
console.log('✅ Compatibilidade web/desktop');
console.log('');

console.log('🎨 INTERFACE:');
console.log('✅ Hint visual de gestos quando zoom = 1.0');
console.log('✅ Botão "Centralizar" quando panned');
console.log('✅ Botão reset de zoom nos controles');
console.log('✅ Animações suaves (Animated API)');
console.log('');

console.log('🔧 FUNCIONALIDADES TÉCNICAS:');
console.log('✅ PanResponder para multi-touch');
console.log('✅ Cálculo de distância entre dedos para pinch');
console.log('✅ Animated.Value para performance');
console.log('✅ Overflow hidden para container');
console.log('');

console.log('📊 CASOS DE USO COBERTOS:');
console.log('• Análise detalhada de regiões específicas (bocal, expansão)');
console.log('• Navegação rápida em geometrias complexas (muitos pontos)');
console.log('• Zoom preciso para medições');
console.log('• Exploração livre da forma do didgeridoo');
console.log('• Compatibilidade mobile e desktop');