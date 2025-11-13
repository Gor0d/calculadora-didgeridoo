/**
 * Unit Conversion Service for Didgeridoo Calculator
 * Supports metric (cm/mm) and imperial (inches/fractions) units
 */

export class UnitConverter {
  constructor() {
    // Conversion constants
    this.CM_TO_INCHES = 0.393701;
    this.MM_TO_INCHES = 0.0393701;
    this.INCHES_TO_CM = 2.54;
    this.INCHES_TO_MM = 25.4;
    
    // Common fractions used in woodworking
    this.COMMON_FRACTIONS = [
      { decimal: 0, fraction: '0"' },
      { decimal: 0.0625, fraction: '1/16"' },
      { decimal: 0.125, fraction: '1/8"' },
      { decimal: 0.1875, fraction: '3/16"' },
      { decimal: 0.25, fraction: '1/4"' },
      { decimal: 0.3125, fraction: '5/16"' },
      { decimal: 0.375, fraction: '3/8"' },
      { decimal: 0.4375, fraction: '7/16"' },
      { decimal: 0.5, fraction: '1/2"' },
      { decimal: 0.5625, fraction: '9/16"' },
      { decimal: 0.625, fraction: '5/8"' },
      { decimal: 0.6875, fraction: '11/16"' },
      { decimal: 0.75, fraction: '3/4"' },
      { decimal: 0.8125, fraction: '13/16"' },
      { decimal: 0.875, fraction: '7/8"' },
      { decimal: 0.9375, fraction: '15/16"' },
    ];
  }

  /**
   * Convert length from metric to imperial
   */
  cmToInches(cm) {
    return cm * this.CM_TO_INCHES;
  }

  /**
   * Convert length from imperial to metric
   */
  inchesToCm(inches) {
    return inches * this.INCHES_TO_CM;
  }

  /**
   * Convert diameter from metric to imperial
   */
  mmToInches(mm) {
    return mm * this.MM_TO_INCHES;
  }

  /**
   * Convert diameter from imperial to metric
   */
  inchesToMm(inches) {
    return inches * this.INCHES_TO_MM;
  }

  /**
   * Convert decimal inches to fractional representation
   */
  decimalToFraction(decimal) {
    const whole = Math.floor(decimal);
    const fractional = decimal - whole;
    
    // Find closest fraction
    let closest = this.COMMON_FRACTIONS[0];
    let minDiff = Math.abs(fractional - closest.decimal);
    
    for (const frac of this.COMMON_FRACTIONS) {
      const diff = Math.abs(fractional - frac.decimal);
      if (diff < minDiff) {
        minDiff = diff;
        closest = frac;
      }
    }
    
    // Format result
    if (whole === 0) {
      return closest.fraction;
    } else if (closest.decimal === 0) {
      return `${whole}"`;
    } else {
      return `${whole} ${closest.fraction.replace('"', '')}"`;
    }
  }

  /**
   * Parse fractional inches to decimal
   */
  fractionToDecimal(fractionStr) {
    try {
      // Remove quotes and clean up
      let str = fractionStr.replace(/"/g, '').trim();
      
      // Handle whole numbers
      if (!str.includes('/') && !str.includes(' ')) {
        return parseFloat(str) || 0;
      }
      
      let whole = 0;
      let fraction = 0;
      
      // Split whole and fractional parts
      if (str.includes(' ')) {
        const parts = str.split(' ');
        whole = parseInt(parts[0]) || 0;
        str = parts[1];
      }
      
      // Parse fraction
      if (str.includes('/')) {
        const [num, den] = str.split('/');
        fraction = (parseInt(num) || 0) / (parseInt(den) || 1);
      } else {
        fraction = parseFloat(str) || 0;
      }
      
      return whole + fraction;
    } catch (error) {
      console.warn('Error parsing fraction:', fractionStr, error);
      return 0;
    }
  }

  /**
   * Format length based on unit system
   */
  formatLength(value, unit) {
    if (unit === 'metric') {
      return `${value.toFixed(1)}cm`;
    } else {
      const inches = this.cmToInches(value);
      return this.decimalToFraction(inches);
    }
  }

  /**
   * Format diameter based on unit system
   */
  formatDiameter(value, unit) {
    if (unit === 'metric') {
      return `${value.toFixed(1)}mm`;
    } else {
      const inches = this.mmToInches(value);
      return this.decimalToFraction(inches);
    }
  }

  /**
   * Parse geometry string and convert to metric if needed
   */
  parseGeometry(geometryText, currentUnit) {
    if (!geometryText || typeof geometryText !== 'string') {
      return [];
    }
    
    const lines = geometryText.split('\n');
    const points = [];
    
    for (const line of lines) {
      const trimmed = line.split('#')[0].trim(); // Remove comments
      if (!trimmed) continue;
      
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        let position = parseFloat(parts[0]);
        let diameter = parseFloat(parts[1]);
        
        // Convert imperial to metric if needed
        if (currentUnit === 'imperial') {
          // Handle fractional inches for position
          if (parts[0].includes('/') || parts[0].includes('"')) {
            position = this.fractionToDecimal(parts[0]);
            position = this.inchesToCm(position);
          }
          
          // Handle fractional inches for diameter
          if (parts[1].includes('/') || parts[1].includes('"')) {
            diameter = this.fractionToDecimal(parts[1]);
            diameter = this.inchesToMm(diameter);
          }
        }
        
        if (!isNaN(position) && !isNaN(diameter) && diameter > 0) {
          points.push({ position, diameter });
        }
      }
    }
    
    return points;
  }

  /**
   * Convert geometry to display format
   */
  formatGeometryForDisplay(points, targetUnit) {
    return points.map(point => {
      if (targetUnit === 'metric') {
        return `${point.position} ${point.diameter}`;
      } else {
        const posInches = this.cmToInches(point.position);
        const diamInches = this.mmToInches(point.diameter);
        return `${this.decimalToFraction(posInches)} ${this.decimalToFraction(diamInches)}`;
      }
    }).join('\n');
  }

  /**
   * Get example geometry for current unit system
   */
  getExampleGeometry(unit) {
    if (unit === 'metric') {
      return `0 28    # início: 28mm
50 26   # 50cm: 26mm
100 30  # 100cm: 30mm
150 38  # final: 38mm`;
    } else {
      return `0" 1 1/8"    # start: 1⅛"
19 3/4" 1"      # 19¾": 1"
39 3/8" 1 3/16" # 39⅜": 1³⁄₁₆"
59" 1 1/2"      # 59": 1½"`;
    }
  }

  /**
   * Get placeholder text for geometry input
   */
  getPlaceholderText(unit) {
    // This will be handled by the component using localizationService
    if (unit === 'metric') {
      return 'Formato: posição(cm) diâmetro(mm)';
    } else {
      return 'Format: position(") diameter(")';
    }
  }

  /**
   * Get unit display names
   */
  getUnitDisplayName(unit) {
    return unit === 'metric' ? 'Métrico (cm/mm)' : 'Imperial (inches)';
  }

  /**
   * Validate geometry input for current unit system
   */
  validateGeometry(geometryText, unit) {
    const errors = [];
    const points = this.parseGeometry(geometryText, unit);
    
    if (points.length < 2) {
      errors.push({
        type: 'insufficient_points',
        message: 'Minimum 2 points required' // Will be localized in component
      });
      return { valid: false, errors, points: [] };
    }
    
    // Check for increasing positions
    for (let i = 1; i < points.length; i++) {
      if (points[i].position <= points[i-1].position) {
        errors.push({
          type: 'invalid_sequence',
          message: `Posição ${i+1} deve ser maior que a anterior`
        });
      }
    }
    
    // Check reasonable ranges
    const maxLength = points[points.length - 1].position;
    const minDiam = Math.min(...points.map(p => p.diameter));
    const maxDiam = Math.max(...points.map(p => p.diameter));
    
    if (unit === 'metric') {
      // Allow up to 400cm (4m) for flexibility, warn if over 300cm
      if (maxLength > 400) {
        errors.push({
          type: 'length_warning',
          message: 'Comprimento muito longo (>4m)'
        });
      } else if (maxLength > 300) {
        // Just a warning, not an error
        console.warn('Comprimento longo (>3m), mas aceitável');
      }

      if (minDiam < 10 || maxDiam > 150) {
        errors.push({
          type: 'diameter_warning',
          message: 'Diâmetros fora da faixa típica (10-150mm)'
        });
      }
    } else {
      const lengthInches = this.cmToInches(maxLength);
      const minDiamInches = this.mmToInches(minDiam);
      const maxDiamInches = this.mmToInches(maxDiam);
      
      if (lengthInches > 118) { // ~10 feet
        errors.push({
          type: 'length_warning',
          message: 'Length very long (>10 feet)'
        });
      }
      if (minDiamInches < 0.4 || maxDiamInches > 4) {
        errors.push({
          type: 'diameter_warning',
          message: 'Diameters outside typical range (0.4"-4")'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      points
    };
  }
}

// Export singleton instance
export const unitConverter = new UnitConverter();