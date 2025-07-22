/**
 * Geometry Validation Utilities for Didgeridoo Calculator
 */

export class GeometryValidationError extends Error {
  constructor(message, line = null, details = null) {
    super(message);
    this.name = 'GeometryValidationError';
    this.line = line;
    this.details = details;
  }
}

export const VALIDATION_RULES = {
  MIN_LENGTH: 50, // cm
  MAX_LENGTH: 300, // cm
  MIN_DIAMETER: 15, // mm
  MAX_DIAMETER: 80, // mm
  MIN_POINTS: 2,
  MAX_POINTS: 50,
  MAX_POSITION_GAP: 50, // cm
};

/**
 * Parse geometry string into structured data
 */
export const parseGeometry = (geometryText) => {
  if (!geometryText || typeof geometryText !== 'string') {
    throw new GeometryValidationError('Geometria deve ser uma string válida');
  }

  const lines = geometryText.split('\n').map(line => line.trim());
  const points = [];
  const errors = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      return;
    }

    // Remove inline comments
    const cleanLine = line.split('#')[0].split('//')[0].trim();
    if (!cleanLine) return;

    // Parse position and diameter
    const parts = cleanLine.split(/\s+/);
    
    if (parts.length < 2) {
      errors.push(new GeometryValidationError(
        `Linha ${lineNumber}: Formato inválido. Use: posição(cm) diâmetro(mm)`,
        lineNumber,
        { line, parts }
      ));
      return;
    }

    const position = parseFloat(parts[0]);
    const diameter = parseFloat(parts[1]);

    // Validate numbers
    if (isNaN(position)) {
      errors.push(new GeometryValidationError(
        `Linha ${lineNumber}: Posição deve ser um número válido`,
        lineNumber,
        { line, position: parts[0] }
      ));
      return;
    }

    if (isNaN(diameter)) {
      errors.push(new GeometryValidationError(
        `Linha ${lineNumber}: Diâmetro deve ser um número válido`,
        lineNumber,
        { line, diameter: parts[1] }
      ));
      return;
    }

    // Validate ranges
    if (position < 0) {
      errors.push(new GeometryValidationError(
        `Linha ${lineNumber}: Posição não pode ser negativa`,
        lineNumber,
        { position }
      ));
    }

    if (diameter <= 0) {
      errors.push(new GeometryValidationError(
        `Linha ${lineNumber}: Diâmetro deve ser positivo`,
        lineNumber,
        { diameter }
      ));
    }

    if (diameter < VALIDATION_RULES.MIN_DIAMETER || diameter > VALIDATION_RULES.MAX_DIAMETER) {
      errors.push(new GeometryValidationError(
        `Linha ${lineNumber}: Diâmetro deve estar entre ${VALIDATION_RULES.MIN_DIAMETER}-${VALIDATION_RULES.MAX_DIAMETER}mm`,
        lineNumber,
        { diameter, min: VALIDATION_RULES.MIN_DIAMETER, max: VALIDATION_RULES.MAX_DIAMETER }
      ));
    }

    if (errors.length === 0 || errors.filter(e => e.line === lineNumber).length === 0) {
      points.push({ position, diameter, line: lineNumber });
    }
  });

  if (errors.length > 0) {
    throw errors[0]; // Return first error
  }

  return points.sort((a, b) => a.position - b.position);
};

/**
 * Validate complete geometry structure
 */
export const validateGeometry = (points) => {
  if (!Array.isArray(points)) {
    throw new GeometryValidationError('Pontos devem ser um array válido');
  }

  // Check minimum points
  if (points.length < VALIDATION_RULES.MIN_POINTS) {
    throw new GeometryValidationError(
      `Mínimo de ${VALIDATION_RULES.MIN_POINTS} pontos necessários`
    );
  }

  // Check maximum points
  if (points.length > VALIDATION_RULES.MAX_POINTS) {
    throw new GeometryValidationError(
      `Máximo de ${VALIDATION_RULES.MAX_POINTS} pontos permitidos`
    );
  }

  // Check total length
  const totalLength = points[points.length - 1].position - points[0].position;
  if (totalLength < VALIDATION_RULES.MIN_LENGTH) {
    throw new GeometryValidationError(
      `Comprimento mínimo: ${VALIDATION_RULES.MIN_LENGTH}cm`
    );
  }

  if (totalLength > VALIDATION_RULES.MAX_LENGTH) {
    throw new GeometryValidationError(
      `Comprimento máximo: ${VALIDATION_RULES.MAX_LENGTH}cm`
    );
  }

  // Check for duplicate positions
  const positions = points.map(p => p.position);
  const uniquePositions = [...new Set(positions)];
  if (positions.length !== uniquePositions.length) {
    throw new GeometryValidationError(
      'Posições duplicadas não são permitidas'
    );
  }

  // Check for reasonable gaps
  for (let i = 1; i < points.length; i++) {
    const gap = points[i].position - points[i-1].position;
    if (gap > VALIDATION_RULES.MAX_POSITION_GAP) {
      throw new GeometryValidationError(
        `Gap muito grande entre pontos: ${gap.toFixed(1)}cm (máximo: ${VALIDATION_RULES.MAX_POSITION_GAP}cm)`,
        points[i].line
      );
    }
  }

  // Validate first position starts at 0 or close to 0
  if (points[0].position > 5) {
    throw new GeometryValidationError(
      'Primeira posição deve começar em 0cm ou próximo de 0cm'
    );
  }

  return true;
};

/**
 * Complete validation pipeline
 */
export const validateGeometryString = (geometryText) => {
  try {
    const points = parseGeometry(geometryText);
    validateGeometry(points);
    return { isValid: true, points, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      points: [], 
      errors: [error],
      message: error.message,
      line: error.line
    };
  }
};

/**
 * Get geometry statistics for UI display
 */
export const getGeometryStats = (points) => {
  if (!points || points.length === 0) {
    return null;
  }

  const positions = points.map(p => p.position);
  const diameters = points.map(p => p.diameter);

  return {
    totalLength: Math.max(...positions) - Math.min(...positions),
    minDiameter: Math.min(...diameters),
    maxDiameter: Math.max(...diameters),
    avgDiameter: diameters.reduce((a, b) => a + b, 0) / diameters.length,
    pointCount: points.length,
    taperRatio: Math.max(...diameters) / Math.min(...diameters),
    volume: calculateApproximateVolume(points)
  };
};

/**
 * Calculate approximate internal volume
 */
const calculateApproximateVolume = (points) => {
  if (points.length < 2) return 0;

  let volume = 0;
  for (let i = 1; i < points.length; i++) {
    const length = points[i].position - points[i-1].position;
    const r1 = points[i-1].diameter / 20; // Convert mm to cm and radius
    const r2 = points[i].diameter / 20;
    
    // Truncated cone volume formula
    const segmentVolume = (Math.PI * length / 3) * (r1*r1 + r1*r2 + r2*r2);
    volume += segmentVolume;
  }
  
  return volume; // cm³
};

/**
 * Suggest fixes for common validation errors
 */
export const suggestFixes = (error) => {
  const suggestions = [];

  if (error.message.includes('Formato inválido')) {
    suggestions.push('Use o formato: posição(cm) diâmetro(mm)');
    suggestions.push('Exemplo: 0 28');
  }

  if (error.message.includes('Diâmetro deve estar entre')) {
    suggestions.push(`Diâmetros realistas: ${VALIDATION_RULES.MIN_DIAMETER}-${VALIDATION_RULES.MAX_DIAMETER}mm`);
    suggestions.push('Didgeridoos típicos: 25-40mm');
  }

  if (error.message.includes('Comprimento')) {
    suggestions.push(`Comprimento ideal: ${VALIDATION_RULES.MIN_LENGTH}-${VALIDATION_RULES.MAX_LENGTH}cm`);
    suggestions.push('Didgeridoos tradicionais: 120-180cm');
  }

  if (error.message.includes('Gap muito grande')) {
    suggestions.push(`Mantenha gaps menores que ${VALIDATION_RULES.MAX_POSITION_GAP}cm`);
    suggestions.push('Adicione pontos intermediários para transições suaves');
  }

  return suggestions;
};