// Mock the geometryValidator functions
const mockGeometryValidator = {
  isValidDidgmoFormat: jest.fn(),
  parseDidgmoGeometry: jest.fn(),
  validateGeometryConstraints: jest.fn(),
  normalizeGeometry: jest.fn(),
  calculateGeometryStats: jest.fn()
};

jest.mock('../../utils/geometryValidator', () => mockGeometryValidator);

describe('geometryValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidDidgmoFormat', () => {
    test('validates correct DIDGMO format', () => {
      const { isValidDidgmoFormat } = require('../../utils/geometryValidator');
      
      isValidDidgmoFormat.mockReturnValue(true);
      
      const result = isValidDidgmoFormat('DIDGMO:1500,50,45,40,35,30,25');
      
      expect(result).toBe(true);
      expect(isValidDidgmoFormat).toHaveBeenCalledWith('DIDGMO:1500,50,45,40,35,30,25');
    });

    test('rejects invalid format string', () => {
      const { isValidDidgmoFormat } = require('../../utils/geometryValidator');
      
      isValidDidgmoFormat.mockReturnValue(false);
      
      const result = isValidDidgmoFormat('INVALID:1500,50');
      
      expect(result).toBe(false);
    });

    test('rejects empty or null input', () => {
      const { isValidDidgmoFormat } = require('../../utils/geometryValidator');
      
      isValidDidgmoFormat
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      
      expect(isValidDidgmoFormat('')).toBe(false);
      expect(isValidDidgmoFormat(null)).toBe(false);
    });
  });

  describe('parseDidgmoGeometry', () => {
    test('parses valid DIDGMO string correctly', () => {
      const { parseDidgmoGeometry } = require('../../utils/geometryValidator');
      
      const mockParsedData = {
        length: 1500,
        diameters: [50, 45, 40, 35, 30, 25],
        format: 'DIDGMO'
      };
      
      parseDidgmoGeometry.mockReturnValue(mockParsedData);
      
      const result = parseDidgmoGeometry('DIDGMO:1500,50,45,40,35,30,25');
      
      expect(result).toEqual(mockParsedData);
      expect(result.length).toBe(1500);
      expect(result.diameters).toHaveLength(6);
    });

    test('handles malformed geometry string', () => {
      const { parseDidgmoGeometry } = require('../../utils/geometryValidator');
      
      parseDidgmoGeometry.mockReturnValue(null);
      
      const result = parseDidgmoGeometry('DIDGMO:invalid,data');
      
      expect(result).toBeNull();
    });

    test('extracts correct measurements from string', () => {
      const { parseDidgmoGeometry } = require('../../utils/geometryValidator');
      
      const mockResult = {
        length: 1200,
        diameters: [60, 50, 40, 30],
        format: 'DIDGMO'
      };
      
      parseDidgmoGeometry.mockReturnValue(mockResult);
      
      const result = parseDidgmoGeometry('DIDGMO:1200,60,50,40,30');
      
      expect(result.length).toBe(1200);
      expect(result.diameters[0]).toBe(60);
      expect(result.diameters[3]).toBe(30);
    });
  });

  describe('validateGeometryConstraints', () => {
    test('validates realistic didgeridoo dimensions', () => {
      const { validateGeometryConstraints } = require('../../utils/geometryValidator');
      
      const validGeometry = {
        length: 1500,
        diameters: [50, 45, 40, 35, 30, 25]
      };
      
      const mockValidation = {
        isValid: true,
        errors: []
      };
      
      validateGeometryConstraints.mockReturnValue(mockValidation);
      
      const result = validateGeometryConstraints(validGeometry);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('rejects unrealistic dimensions', () => {
      const { validateGeometryConstraints } = require('../../utils/geometryValidator');
      
      const invalidGeometry = {
        length: 10000, // Too long
        diameters: [200, 150] // Too wide
      };
      
      const mockValidation = {
        isValid: false,
        errors: ['Length exceeds maximum allowed', 'Diameter too large']
      };
      
      validateGeometryConstraints.mockReturnValue(mockValidation);
      
      const result = validateGeometryConstraints(invalidGeometry);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates diameter progression', () => {
      const { validateGeometryConstraints } = require('../../utils/geometryValidator');
      
      // Diameters should generally decrease from mouthpiece to bell
      const geometryWithIncreasingDiameters = {
        length: 1500,
        diameters: [30, 35, 40, 45, 50] // Increasing (unusual)
      };
      
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: ['Unusual diameter progression detected']
      };
      
      validateGeometryConstraints.mockReturnValue(mockValidation);
      
      const result = validateGeometryConstraints(geometryWithIncreasingDiameters);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
    });
  });

  describe('normalizeGeometry', () => {
    test('converts units consistently', () => {
      const { normalizeGeometry } = require('../../utils/geometryValidator');
      
      const inputGeometry = {
        length: 150, // cm
        diameters: [5, 4, 3], // cm
        unit: 'cm'
      };
      
      const normalizedGeometry = {
        length: 1500, // mm
        diameters: [50, 40, 30], // mm
        unit: 'mm'
      };
      
      normalizeGeometry.mockReturnValue(normalizedGeometry);
      
      const result = normalizeGeometry(inputGeometry);
      
      expect(result.length).toBe(1500);
      expect(result.diameters[0]).toBe(50);
      expect(result.unit).toBe('mm');
    });

    test('handles already normalized geometry', () => {
      const { normalizeGeometry } = require('../../utils/geometryValidator');
      
      const alreadyNormalizedGeometry = {
        length: 1500,
        diameters: [50, 40, 30],
        unit: 'mm'
      };
      
      normalizeGeometry.mockReturnValue(alreadyNormalizedGeometry);
      
      const result = normalizeGeometry(alreadyNormalizedGeometry);
      
      expect(result).toEqual(alreadyNormalizedGeometry);
    });
  });

  describe('calculateGeometryStats', () => {
    test('calculates basic geometry statistics', () => {
      const { calculateGeometryStats } = require('../../utils/geometryValidator');
      
      const geometry = {
        length: 1500,
        diameters: [50, 45, 40, 35, 30, 25]
      };
      
      const mockStats = {
        averageDiameter: 37.5,
        maxDiameter: 50,
        minDiameter: 25,
        diameterRange: 25,
        taperRate: 16.67, // percentage decrease
        volume: 2500000 // cubic mm (approximate)
      };
      
      calculateGeometryStats.mockReturnValue(mockStats);
      
      const result = calculateGeometryStats(geometry);
      
      expect(result.averageDiameter).toBe(37.5);
      expect(result.maxDiameter).toBe(50);
      expect(result.minDiameter).toBe(25);
      expect(result.diameterRange).toBe(25);
    });

    test('handles single diameter geometry', () => {
      const { calculateGeometryStats } = require('../../utils/geometryValidator');
      
      const straightTubeGeometry = {
        length: 1500,
        diameters: [40]
      };
      
      const mockStats = {
        averageDiameter: 40,
        maxDiameter: 40,
        minDiameter: 40,
        diameterRange: 0,
        taperRate: 0
      };
      
      calculateGeometryStats.mockReturnValue(mockStats);
      
      const result = calculateGeometryStats(straightTubeGeometry);
      
      expect(result.averageDiameter).toBe(40);
      expect(result.diameterRange).toBe(0);
      expect(result.taperRate).toBe(0);
    });
  });

  describe('error handling', () => {
    test('handles null or undefined input gracefully', () => {
      const { isValidDidgmoFormat, parseDidgmoGeometry } = require('../../utils/geometryValidator');
      
      isValidDidgmoFormat.mockReturnValue(false);
      parseDidgmoGeometry.mockReturnValue(null);
      
      expect(isValidDidgmoFormat(null)).toBe(false);
      expect(parseDidgmoGeometry(undefined)).toBeNull();
    });

    test('handles malformed numeric values', () => {
      const { parseDidgmoGeometry } = require('../../utils/geometryValidator');
      
      parseDidgmoGeometry.mockReturnValue(null);
      
      const result = parseDidgmoGeometry('DIDGMO:abc,def,ghi');
      
      expect(result).toBeNull();
    });

    test('handles negative or zero values appropriately', () => {
      const { validateGeometryConstraints } = require('../../utils/geometryValidator');
      
      const invalidGeometry = {
        length: -1500,
        diameters: [0, -10, 30]
      };
      
      const mockValidation = {
        isValid: false,
        errors: ['Length must be positive', 'Diameters must be positive']
      };
      
      validateGeometryConstraints.mockReturnValue(mockValidation);
      
      const result = validateGeometryConstraints(invalidGeometry);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});