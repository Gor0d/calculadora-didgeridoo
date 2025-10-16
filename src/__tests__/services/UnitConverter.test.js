import { unitConverter } from '../../services/units/UnitConverter';

describe('UnitConverter', () => {
  describe('parseGeometry', () => {
    test('parses metric geometry correctly', () => {
      const geometry = '0,30;50,28;100,25';
      const points = unitConverter.parseGeometry(geometry, 'metric');

      expect(points).toHaveLength(3);
      expect(points[0]).toEqual({ position: 0, diameter: 30 });
      expect(points[1]).toEqual({ position: 50, diameter: 28 });
      expect(points[2]).toEqual({ position: 100, diameter: 25 });
    });

    test('parses imperial geometry and converts to metric', () => {
      const geometry = '0,1.18;20,1.10;40,0.98';
      const points = unitConverter.parseGeometry(geometry, 'imperial');

      expect(points).toHaveLength(3);
      expect(points[0].position).toBeCloseTo(0, 1);
      expect(points[0].diameter).toBeCloseTo(30, 0);
    });

    test('handles empty geometry string', () => {
      expect(() => {
        unitConverter.parseGeometry('', 'metric');
      }).toThrow();
    });

    test('handles invalid format', () => {
      expect(() => {
        unitConverter.parseGeometry('invalid', 'metric');
      }).toThrow();
    });
  });

  describe('convertLength', () => {
    test('converts cm to inches correctly', () => {
      const inches = unitConverter.convertLength(100, 'metric', 'imperial');
      expect(inches).toBeCloseTo(39.37, 1);
    });

    test('converts inches to cm correctly', () => {
      const cm = unitConverter.convertLength(39.37, 'imperial', 'metric');
      expect(cm).toBeCloseTo(100, 1);
    });

    test('returns same value for same unit', () => {
      const value = 100;
      expect(unitConverter.convertLength(value, 'metric', 'metric')).toBe(value);
    });
  });

  describe('convertDiameter', () => {
    test('converts mm to inches correctly', () => {
      const inches = unitConverter.convertDiameter(25.4, 'metric', 'imperial');
      expect(inches).toBeCloseTo(1, 2);
    });

    test('converts inches to mm correctly', () => {
      const mm = unitConverter.convertDiameter(1, 'imperial', 'metric');
      expect(mm).toBeCloseTo(25.4, 1);
    });
  });

  describe('formatGeometry', () => {
    test('formats points to geometry string', () => {
      const points = [
        { position: 0, diameter: 30 },
        { position: 50, diameter: 28 },
        { position: 100, diameter: 25 }
      ];

      const geometry = unitConverter.formatGeometry(points, 'metric');
      expect(geometry).toBe('0,30;50,28;100,25');
    });

    test('formats imperial geometry with proper precision', () => {
      const points = [
        { position: 0, diameter: 1.18 },
        { position: 20, diameter: 1.10 }
      ];

      const geometry = unitConverter.formatGeometry(points, 'imperial');
      expect(geometry).toContain('0,1.18');
    });
  });

  describe('validateGeometry', () => {
    test('validates correct geometry', () => {
      const geometry = '0,30;50,28;100,25';
      expect(unitConverter.validateGeometry(geometry)).toBe(true);
    });

    test('rejects empty geometry', () => {
      expect(unitConverter.validateGeometry('')).toBe(false);
    });

    test('rejects invalid format', () => {
      expect(unitConverter.validateGeometry('invalid')).toBe(false);
    });

    test('rejects negative values', () => {
      expect(unitConverter.validateGeometry('0,30;-10,28')).toBe(false);
    });
  });
});
