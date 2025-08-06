import { AcousticEngine } from '../../services/acoustic/AcousticEngine';

describe('AcousticEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseGeometry', () => {
    test('parses valid DIDGMO format correctly', () => {
      const geometry = 'DIDGMO:1500,50,45,40,35,30,25,20';
      const result = AcousticEngine.parseGeometry(geometry);
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1500);
      expect(result.data.diameters).toEqual([50, 45, 40, 35, 30, 25, 20]);
      expect(result.data.format).toBe('DIDGMO');
    });

    test('handles empty geometry string', () => {
      const result = AcousticEngine.parseGeometry('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('handles invalid format', () => {
      const geometry = 'INVALID:1500,50';
      const result = AcousticEngine.parseGeometry(geometry);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('format');
    });

    test('handles malformed DIDGMO data', () => {
      const geometry = 'DIDGMO:invalid,data';
      const result = AcousticEngine.parseGeometry(geometry);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('calculateFrequencies', () => {
    test('calculates frequencies for valid geometry', () => {
      const geometry = {
        length: 1500,
        diameters: [50, 40, 30],
        format: 'DIDGMO'
      };
      
      const result = AcousticEngine.calculateFrequencies(geometry);
      
      expect(result.success).toBe(true);
      expect(result.data.fundamental).toBeGreaterThan(0);
      expect(result.data.harmonics).toBeInstanceOf(Array);
      expect(result.data.harmonics.length).toBeGreaterThan(0);
    });

    test('handles invalid geometry data', () => {
      const invalidGeometry = {
        length: 0,
        diameters: []
      };
      
      const result = AcousticEngine.calculateFrequencies(invalidGeometry);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('calculates correct fundamental frequency range', () => {
      const geometry = {
        length: 1500, // 1.5m should give around 110-120 Hz
        diameters: [50, 40, 30],
        format: 'DIDGMO'
      };
      
      const result = AcousticEngine.calculateFrequencies(geometry);
      
      expect(result.success).toBe(true);
      expect(result.data.fundamental).toBeGreaterThan(100);
      expect(result.data.fundamental).toBeLessThan(130);
    });
  });

  describe('analyzeTone', () => {
    test('analyzes tone characteristics correctly', () => {
      const frequencies = {
        fundamental: 110,
        harmonics: [220, 330, 440, 550]
      };
      
      const result = AcousticEngine.analyzeTone(frequencies);
      
      expect(result.success).toBe(true);
      expect(result.data.note).toBeDefined();
      expect(result.data.pitch).toBeDefined();
      expect(result.data.characteristics).toBeDefined();
    });

    test('handles invalid frequency data', () => {
      const invalidFrequencies = {
        fundamental: 0,
        harmonics: []
      };
      
      const result = AcousticEngine.analyzeTone(invalidFrequencies);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('calculateResonantModes', () => {
    test('calculates resonant modes for given geometry', () => {
      const geometry = {
        length: 1500,
        diameters: [50, 45, 40, 35, 30, 25]
      };
      
      const result = AcousticEngine.calculateResonantModes(geometry);
      
      expect(result.success).toBe(true);
      expect(result.data.modes).toBeInstanceOf(Array);
      expect(result.data.modes.length).toBeGreaterThan(0);
      
      // Check that modes are in ascending frequency order
      const frequencies = result.data.modes.map(mode => mode.frequency);
      const sortedFrequencies = [...frequencies].sort((a, b) => a - b);
      expect(frequencies).toEqual(sortedFrequencies);
    });

    test('handles empty geometry', () => {
      const emptyGeometry = {
        length: 0,
        diameters: []
      };
      
      const result = AcousticEngine.calculateResonantModes(emptyGeometry);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getQualityMetrics', () => {
    test('calculates quality metrics for valid analysis', () => {
      const analysisData = {
        fundamental: 110,
        harmonics: [220, 330, 440],
        geometry: {
          length: 1500,
          diameters: [50, 40, 30]
        }
      };
      
      const result = AcousticEngine.getQualityMetrics(analysisData);
      
      expect(result.success).toBe(true);
      expect(result.data.clarity).toBeDefined();
      expect(result.data.richness).toBeDefined();
      expect(result.data.balance).toBeDefined();
      expect(result.data.overall).toBeDefined();
      
      // Quality scores should be between 0 and 100
      expect(result.data.clarity).toBeGreaterThanOrEqual(0);
      expect(result.data.clarity).toBeLessThanOrEqual(100);
      expect(result.data.overall).toBeGreaterThanOrEqual(0);
      expect(result.data.overall).toBeLessThanOrEqual(100);
    });

    test('handles missing analysis data', () => {
      const result = AcousticEngine.getQualityMetrics({});
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('integration tests', () => {
    test('full analysis pipeline works correctly', () => {
      const geometryString = 'DIDGMO:1500,50,45,40,35,30,25';
      
      // Parse geometry
      const parseResult = AcousticEngine.parseGeometry(geometryString);
      expect(parseResult.success).toBe(true);
      
      // Calculate frequencies
      const freqResult = AcousticEngine.calculateFrequencies(parseResult.data);
      expect(freqResult.success).toBe(true);
      
      // Analyze tone
      const toneResult = AcousticEngine.analyzeTone(freqResult.data);
      expect(toneResult.success).toBe(true);
      
      // Calculate quality metrics
      const qualityResult = AcousticEngine.getQualityMetrics({
        ...freqResult.data,
        geometry: parseResult.data
      });
      expect(qualityResult.success).toBe(true);
      
      // Verify complete analysis structure
      expect(toneResult.data.note).toBeDefined();
      expect(qualityResult.data.overall).toBeGreaterThan(0);
    });

    test('handles various didgeridoo lengths correctly', () => {
      const testCases = [
        { length: 1200, expectedRange: [130, 150] }, // Shorter = higher pitch
        { length: 1500, expectedRange: [110, 125] }, // Standard length
        { length: 1800, expectedRange: [90, 110] }   // Longer = lower pitch
      ];
      
      testCases.forEach(({ length, expectedRange }) => {
        const geometryString = `DIDGMO:${length},50,40,30`;
        const parseResult = AcousticEngine.parseGeometry(geometryString);
        const freqResult = AcousticEngine.calculateFrequencies(parseResult.data);
        
        expect(freqResult.success).toBe(true);
        expect(freqResult.data.fundamental).toBeGreaterThanOrEqual(expectedRange[0]);
        expect(freqResult.data.fundamental).toBeLessThanOrEqual(expectedRange[1]);
      });
    });
  });
});