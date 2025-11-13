/**
 * VALIDATION SCRIPT FOR ACOUSTIC CALCULATIONS
 *
 * This script validates the acoustic calculations against known physics formulas
 */

// Test geometry (from user)
const testGeometry = `
0 30
10 30
20 35
30 35
40 35
50 35
60 35
70 35
80 40
90 45
100 45
110 40
120 40
130 50
140 55
150 60
155 65
160 70
169.5 90
`;

// Physics constants
const SPEED_OF_SOUND = 343; // m/s at 20°C
const END_CORRECTION_FACTOR = 0.8;
const BELL_CORRECTION_FACTOR = 0.3;

// Parse geometry
function parseGeometry(text) {
  const lines = text.trim().split('\n');
  const points = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const position = parseFloat(parts[0]); // cm
      const diameter = parseFloat(parts[1]); // mm
      if (!isNaN(position) && !isNaN(diameter)) {
        points.push({ position, diameter });
      }
    }
  }

  return points;
}

// Calculate expected frequency
function calculateExpectedFrequency(points) {
  // Physical length
  const physicalLength = points[points.length - 1].position / 100; // cm to m

  // Average diameter
  const avgDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;
  const avgRadius = avgDiameter / 2000; // mm to m

  // End corrections
  const bellRadius = points[points.length - 1].diameter / 2000; // mm to m
  const mouthRadius = points[0].diameter / 2000; // mm to m

  const bellCorrection = END_CORRECTION_FACTOR * bellRadius;
  const mouthCorrection = BELL_CORRECTION_FACTOR * mouthRadius;

  // Effective length
  const effectiveLength = physicalLength + bellCorrection + mouthCorrection;

  // Open tube formula: f = c / (2L)
  const fundamentalFreq = SPEED_OF_SOUND / (2 * effectiveLength);

  console.log('=== VALIDATION RESULTS ===\n');
  console.log(`Physical length: ${(physicalLength * 100).toFixed(1)} cm`);
  console.log(`Average diameter: ${avgDiameter.toFixed(1)} mm`);
  console.log(`Average radius: ${(avgRadius * 1000).toFixed(2)} mm`);
  console.log(`\nEnd Corrections:`);
  console.log(`  Bell correction: ${(bellCorrection * 100).toFixed(2)} cm (radius: ${(bellRadius * 1000).toFixed(1)}mm)`);
  console.log(`  Mouth correction: ${(mouthCorrection * 100).toFixed(2)} cm (radius: ${(mouthRadius * 1000).toFixed(1)}mm)`);
  console.log(`  Total correction: ${((bellCorrection + mouthCorrection) * 100).toFixed(2)} cm`);
  console.log(`\nEffective length: ${(effectiveLength * 100).toFixed(2)} cm`);
  console.log(`\nFundamental frequency: ${fundamentalFreq.toFixed(2)} Hz`);

  // Convert to note
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const noteNumber = Math.round(12 * Math.log2(fundamentalFreq / C0));
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(noteNumber / 12);
  const note = noteNames[noteNumber % 12];

  console.log(`Musical note: ${note}${octave}`);

  // Calculate first 6 harmonics
  console.log(`\n=== HARMONICS (OPEN TUBE - ALL HARMONICS) ===`);
  for (let n = 1; n <= 6; n++) {
    const freq = fundamentalFreq * n;
    const harmNoteNumber = Math.round(12 * Math.log2(freq / C0));
    const harmOctave = Math.floor(harmNoteNumber / 12);
    const harmNote = noteNames[harmNoteNumber % 12];
    console.log(`H${n}: ${freq.toFixed(1)} Hz (${harmNote}${harmOctave})`);
  }

  // Expected ranges
  console.log(`\n=== EXPECTED RANGES ===`);
  console.log(`For a ${(physicalLength * 100).toFixed(1)}cm didgeridoo:`);
  console.log(`  Typical range: 70-100 Hz (D2-G2)`);
  console.log(`  Our calculation: ${fundamentalFreq.toFixed(1)} Hz (${note}${octave})`);

  const percentDiff = Math.abs((fundamentalFreq - 85) / 85 * 100);
  if (percentDiff < 20) {
    console.log(`  ✅ WITHIN EXPECTED RANGE`);
  } else {
    console.log(`  ⚠️ OUTSIDE EXPECTED RANGE (${percentDiff.toFixed(1)}% deviation)`);
  }

  return {
    frequency: fundamentalFreq,
    note: `${note}${octave}`,
    physicalLength: physicalLength * 100,
    effectiveLength: effectiveLength * 100
  };
}

// Run validation
const points = parseGeometry(testGeometry);
const result = calculateExpectedFrequency(points);

console.log(`\n=== FORMULA VERIFICATION ===`);
console.log(`Open tube formula: f = c / (2L)`);
console.log(`  c = ${SPEED_OF_SOUND} m/s`);
console.log(`  L = ${(result.effectiveLength / 100).toFixed(4)} m`);
console.log(`  f = ${SPEED_OF_SOUND} / (2 × ${(result.effectiveLength / 100).toFixed(4)})`);
console.log(`  f = ${SPEED_OF_SOUND} / ${(2 * result.effectiveLength / 100).toFixed(4)}`);
console.log(`  f = ${result.frequency.toFixed(2)} Hz`);

console.log(`\n✅ Validation complete!`);
