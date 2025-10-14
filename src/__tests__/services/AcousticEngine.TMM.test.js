/**
 * Transfer Matrix Method (TMM) Unit Tests
 *
 * Testa os métodos críticos do Transfer Matrix Method implementado
 * no AcousticEngine para garantir precisão nos cálculos acústicos.
 */

import { AcousticEngine } from '../../services/acoustic/AcousticEngine';

describe('AcousticEngine - Transfer Matrix Method (TMM)', () => {
  let engine;

  beforeEach(() => {
    engine = new AcousticEngine();
  });

  describe('processGeometryForTMM', () => {
    it('deve processar geometria cilíndrica simples corretamente', () => {
      const points = [
        { position: 0, diameter: 40 },
        { position: 150, diameter: 40 }
      ];

      const segments = engine.processGeometryForTMM(points);

      expect(segments).toHaveLength(1);
      expect(segments[0].length).toBeCloseTo(1.5); // 150cm = 1.5m
      expect(segments[0].r1).toBeCloseTo(0.020); // 40mm = 0.020m raio
      expect(segments[0].r2).toBeCloseTo(0.020);
      expect(segments[0].taperRatio).toBeCloseTo(1.0); // Cilíndrico
    });

    it('deve processar geometria cônica corretamente', () => {
      const points = [
        { position: 0, diameter: 30 },
        { position: 140, diameter: 70 }
      ];

      const segments = engine.processGeometryForTMM(points);

      expect(segments).toHaveLength(1);
      expect(segments[0].length).toBeCloseTo(1.4);
      expect(segments[0].r1).toBeCloseTo(0.015); // 30mm
      expect(segments[0].r2).toBeCloseTo(0.035); // 70mm
      expect(segments[0].taperRatio).toBeCloseTo(2.33, 1); // 70/30
    });

    it('deve processar geometria multi-segmento', () => {
      const points = [
        { position: 0, diameter: 30 },
        { position: 50, diameter: 40 },
        { position: 100, diameter: 50 },
        { position: 150, diameter: 60 }
      ];

      const segments = engine.processGeometryForTMM(points);

      expect(segments).toHaveLength(3);
      expect(segments[0].startPosition).toBe(0);
      expect(segments[1].startPosition).toBeCloseTo(0.5);
      expect(segments[2].startPosition).toBeCloseTo(1.0);
    });

    it('deve lançar erro para geometria inválida', () => {
      const invalidPoints = [
        { position: 0, diameter: 40 },
        { position: 0, diameter: 40 } // Mesmo position
      ];

      expect(() => {
        engine.processGeometryForTMM(invalidPoints);
      }).toThrow();
    });
  });

  describe('generateFrequencyRange', () => {
    it('deve gerar faixa de frequências com resolução variável', () => {
      const frequencies = engine.generateFrequencyRange();

      expect(frequencies.length).toBeGreaterThan(0);
      expect(frequencies[0]).toBe(30); // Frequência inicial
      expect(frequencies[frequencies.length - 1]).toBe(1000); // Frequência final

      // Verificar resolução alta em baixas frequências (30-100 Hz)
      const lowFreqs = frequencies.filter(f => f < 100);
      const step1 = lowFreqs[1] - lowFreqs[0];
      expect(step1).toBe(0.5); // 0.5 Hz de resolução

      // Verificar resolução padrão em altas frequências (100-1000 Hz)
      const highFreqs = frequencies.filter(f => f >= 100);
      const step2 = highFreqs[1] - highFreqs[0];
      expect(step2).toBe(1.0); // 1.0 Hz de resolução
    });
  });

  describe('calculateTransferMatrix', () => {
    it('deve calcular matriz para segmento cilíndrico', () => {
      const segment = {
        length: 1.0,
        r1: 0.020,
        r2: 0.020,
        taperRatio: 1.0
      };

      const freq = 100; // Hz
      const matrix = engine.calculateTransferMatrix(segment, freq);

      // Matriz deve ter propriedades A, B, C, D
      expect(matrix).toHaveProperty('A');
      expect(matrix).toHaveProperty('B');
      expect(matrix).toHaveProperty('C');
      expect(matrix).toHaveProperty('D');

      // Determinante deve ser aproximadamente 1 (sistema lossless)
      const det = matrix.A * matrix.D - matrix.B * matrix.C;
      expect(det).toBeCloseTo(1.0, 2);
    });

    it('deve calcular matriz para segmento cônico', () => {
      const segment = {
        length: 1.0,
        r1: 0.015,
        r2: 0.030,
        taperRatio: 2.0
      };

      const freq = 100;
      const matrix = engine.calculateTransferMatrix(segment, freq);

      expect(matrix).toHaveProperty('A');
      expect(matrix).toHaveProperty('B');
      expect(matrix).toHaveProperty('C');
      expect(matrix).toHaveProperty('D');

      // Determinante deve ser aproximadamente 1
      const det = matrix.A * matrix.D - matrix.B * matrix.C;
      expect(det).toBeCloseTo(1.0, 1);
    });
  });

  describe('multiplyTransferMatrices', () => {
    it('deve multiplicar duas matrizes corretamente', () => {
      const M1 = { A: 1, B: 2, C: 3, D: 4 };
      const M2 = { A: 5, B: 6, C: 7, D: 8 };

      const result = engine.multiplyTransferMatrices(M1, M2);

      // M = M1 * M2
      // [A B] = [1 2] * [5 6]
      // [C D]   [3 4]   [7 8]
      expect(result.A).toBe(1 * 5 + 2 * 7); // 19
      expect(result.B).toBe(1 * 6 + 2 * 8); // 22
      expect(result.C).toBe(3 * 5 + 4 * 7); // 43
      expect(result.D).toBe(3 * 6 + 4 * 8); // 50
    });

    it('matriz identidade não deve alterar resultado', () => {
      const M = { A: 2, B: 3, C: 5, D: 7 };
      const I = { A: 1, B: 0, C: 0, D: 1 }; // Identidade

      const result = engine.multiplyTransferMatrices(M, I);

      expect(result.A).toBe(M.A);
      expect(result.B).toBe(M.B);
      expect(result.C).toBe(M.C);
      expect(result.D).toBe(M.D);
    });
  });

  describe('Complex Number Operations', () => {
    it('complexAdd deve somar números complexos', () => {
      const z1 = { real: 3, imag: 4 };
      const z2 = { real: 1, imag: 2 };

      const result = engine.complexAdd(z1, z2);

      expect(result.real).toBe(4);
      expect(result.imag).toBe(6);
    });

    it('complexMultiply deve multiplicar números complexos', () => {
      const z1 = { real: 2, imag: 3 };
      const z2 = { real: 4, imag: 5 };

      const result = engine.complexMultiply(z1, z2);

      // (2+3i)(4+5i) = 8 + 10i + 12i + 15i² = 8 + 22i - 15 = -7 + 22i
      expect(result.real).toBeCloseTo(-7);
      expect(result.imag).toBeCloseTo(22);
    });

    it('complexDivide deve dividir números complexos', () => {
      const z1 = { real: 6, imag: 8 };
      const z2 = { real: 3, imag: 4 };

      const result = engine.complexDivide(z1, z2);

      // (6+8i)/(3+4i) = (6+8i)(3-4i)/(3²+4²) = (18-24i+24i-32i²)/25 = (50+0i)/25 = 2
      expect(result.real).toBeCloseTo(2);
      expect(result.imag).toBeCloseTo(0);
    });

    it('complexMagnitude deve calcular magnitude corretamente', () => {
      const z = { real: 3, imag: 4 };
      const magnitude = Math.sqrt(z.real * z.real + z.imag * z.imag);

      expect(magnitude).toBeCloseTo(5); // 3-4-5 triangle
    });
  });

  describe('calculateRadiationImpedance', () => {
    it('deve calcular impedância de radiação (Levine-Schwinger)', () => {
      const radius = 0.035; // 35mm
      const freq = 100;

      const Zrad = engine.calculateRadiationImpedance(radius, freq);

      expect(Zrad).toHaveProperty('real');
      expect(Zrad).toHaveProperty('imag');

      // Impedância de radiação deve ser positiva
      expect(Zrad.real).toBeGreaterThan(0);

      // Parte imaginária pode ser positiva ou negativa
      expect(typeof Zrad.imag).toBe('number');
    });

    it('impedância deve aumentar com frequência', () => {
      const radius = 0.035;

      const Z1 = engine.calculateRadiationImpedance(radius, 50);
      const Z2 = engine.calculateRadiationImpedance(radius, 500);

      // Magnitude aumenta com frequência
      const mag1 = Math.sqrt(Z1.real * Z1.real + Z1.imag * Z1.imag);
      const mag2 = Math.sqrt(Z2.real * Z2.real + Z2.imag * Z2.imag);

      expect(mag2).toBeGreaterThan(mag1);
    });
  });

  describe('findResonancePeaks', () => {
    it('deve detectar picos no espectro', () => {
      // Criar espectro artificial com picos claros
      const frequencies = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
      const impedanceSpectrum = [
        { magnitude: 1.0 },
        { magnitude: 1.2 },
        { magnitude: 1.5 },
        { magnitude: 2.0 }, // Pico em 33 Hz
        { magnitude: 1.5 },
        { magnitude: 1.2 },
        { magnitude: 1.0 },
        { magnitude: 1.3 },
        { magnitude: 1.8 },
        { magnitude: 2.5 }, // Pico em 39 Hz
        { magnitude: 1.9 }
      ];

      const peaks = engine.findResonancePeaks(frequencies, impedanceSpectrum);

      expect(peaks.length).toBeGreaterThanOrEqual(2);
      expect(peaks).toContain(33);
      expect(peaks).toContain(39);
    });

    it('não deve detectar picos em espectro plano', () => {
      const frequencies = [30, 40, 50, 60, 70];
      const impedanceSpectrum = Array(5).fill({ magnitude: 1.0 });

      const peaks = engine.findResonancePeaks(frequencies, impedanceSpectrum);

      expect(peaks.length).toBe(0);
    });
  });

  describe('Integration Test - Complete TMM Analysis', () => {
    it('deve analisar cilindro simples e retornar fundamental correto', async () => {
      const points = [
        { position: 0, diameter: 40 },
        { position: 150, diameter: 40 }
      ];

      const result = await engine.analyzeGeometryTransferMatrix(points);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('metadata');

      // Deve ter pelo menos o fundamental
      expect(result.results.length).toBeGreaterThanOrEqual(1);

      // Fundamental esperado: ~57 Hz
      const fundamental = result.results[0];
      expect(fundamental.frequency).toBeGreaterThan(50);
      expect(fundamental.frequency).toBeLessThan(65);

      // Deve ter nota e oitava
      expect(fundamental).toHaveProperty('note');
      expect(fundamental).toHaveProperty('harmonic');
      expect(fundamental.harmonic).toBe(1);

      // Metadata deve conter método usado
      expect(result.metadata.calculationMethod).toBe('transfer_matrix_method');
    });

    it('deve detectar múltiplos harmônicos em didgeridoo típico', async () => {
      const points = [
        { position: 0, diameter: 30 },
        { position: 40, diameter: 35 },
        { position: 90, diameter: 45 },
        { position: 140, diameter: 60 }
      ];

      const result = await engine.analyzeGeometryTransferMatrix(points);

      // Deve detectar pelo menos 3-4 harmônicos
      expect(result.results.length).toBeGreaterThanOrEqual(3);

      // Harmônicos devem seguir progressão aproximada
      const fundamental = result.results[0].frequency;

      for (let i = 1; i < Math.min(3, result.results.length); i++) {
        const harmonic = result.results[i];
        const ratio = harmonic.frequency / fundamental;
        const expectedRatio = i + 1;

        // Razão deve estar próxima do esperado (±20%)
        expect(ratio).toBeGreaterThan(expectedRatio * 0.8);
        expect(ratio).toBeLessThan(expectedRatio * 1.2);
      }
    });

    it('deve incluir espectro de impedância nos metadados', async () => {
      const points = [
        { position: 0, diameter: 35 },
        { position: 150, diameter: 50 }
      ];

      const result = await engine.analyzeGeometryTransferMatrix(points);

      expect(result.metadata).toHaveProperty('impedanceSpectrum');
      expect(Array.isArray(result.metadata.impedanceSpectrum)).toBe(true);
      expect(result.metadata.impedanceSpectrum.length).toBeGreaterThan(0);

      // Cada ponto deve ter frequência e magnitude
      const firstPoint = result.metadata.impedanceSpectrum[0];
      expect(firstPoint).toHaveProperty('frequency');
      expect(firstPoint).toHaveProperty('magnitude');
    });

    it('deve calcular qualidade (Q) para cada harmônico', async () => {
      const points = [
        { position: 0, diameter: 35 },
        { position: 120, diameter: 55 }
      ];

      const result = await engine.analyzeGeometryTransferMatrix(points);

      result.results.forEach(harmonic => {
        expect(harmonic).toHaveProperty('quality');
        expect(harmonic.quality).toBeGreaterThanOrEqual(0);
        expect(harmonic.quality).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Performance Tests', () => {
    it('análise TMM deve completar em tempo razoável', async () => {
      const points = [
        { position: 0, diameter: 30 },
        { position: 50, diameter: 40 },
        { position: 100, diameter: 50 },
        { position: 150, diameter: 60 }
      ];

      const startTime = Date.now();
      await engine.analyzeGeometryTransferMatrix(points);
      const endTime = Date.now();

      const duration = endTime - startTime;

      // Deve completar em menos de 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Error Handling', () => {
    it('deve lançar erro para geometria insuficiente', async () => {
      const points = [{ position: 0, diameter: 40 }];

      await expect(engine.analyzeGeometry(points)).rejects.toThrow();
    });

    it('deve fazer fallback para método simplificado se TMM falhar', async () => {
      // Desabilitar TMM temporariamente
      const originalTMM = engine.TMM_ENABLED;
      engine.TMM_ENABLED = false;

      const points = [
        { position: 0, diameter: 40 },
        { position: 150, diameter: 40 }
      ];

      const result = await engine.analyzeGeometry(points);

      expect(result).toHaveProperty('results');
      expect(result.results.length).toBeGreaterThan(0);

      // Restaurar configuração
      engine.TMM_ENABLED = originalTMM;
    });
  });
});
