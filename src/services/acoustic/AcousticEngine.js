/**
 * Real Acoustic Calculations for Didgeridoo Analysis
 *
 * IMPLEMENTATION METHODS:
 * 1. Transfer Matrix Method (TMM) - High precision, based on Dan Mapes-Riordan (1991)
 * 2. Simplified Method - Fast approximation, fallback for offline mode
 *
 * REFERENCES:
 * - Dan Mapes-Riordan (1991): "Horn Modeling with Conical and Cylindrical Transmission Line Elements"
 *   Journal of the Audio Engineering Society, Paper 3194
 * - Fletcher & Rossing (1991): "The Physics of Musical Instruments"
 * - Webster Horn Equation for acoustic wave propagation
 * - DidgitaldDoo project: https://didgitaldoo.github.io
 * - CADSD Method: https://www.didgeridoo-physik.de
 *
 * Enhanced with offline capabilities
 */

import { tuningService } from '../tuning/TuningService';

export class AcousticEngine {
  constructor() {
    // Physical constants - CALIBRATED TO MATCH CADSD/DigitalDoo
    // Source: https://github.com/jnehring/didge-lab/blob/main/src/cad/cadsd/cadsd_py.py
    this.SPEED_OF_SOUND = 343.37; // m/s - CADSD value
    this.AIR_DENSITY = 1.2929; // kg/m³ - CADSD value (0°C standard)
    this.DYNAMIC_VISCOSITY = 1.708e-5; // Pa·s - CADSD value
    this.GAMMA = 1.40; // Ratio of specific heats for air
    this.PRANDTL_NUMBER = 0.71; // Dimensionless

    // Musical constants
    this.SEMITONE_RATIO = Math.pow(2, 1/12);

    // Didgeridoo specific constants (calibrated for real instruments)
    this.END_CORRECTION_FACTOR = 0.8; // Empirical correction for open end (bell)
    this.BELL_CORRECTION_FACTOR = 0.3; // Correction for mouthpiece end
    this.MOUTH_IMPEDANCE_FACTOR = 0.90; // Mouth coupling efficiency (improved)

    // Transfer Matrix Method parameters
    this.TMM_ENABLED = true; // Enable high-precision TMM calculations
    this.FREQ_RANGE_START = 20; // Hz - Lower bound for analysis (lowered to catch fundamental ~65Hz)
    this.FREQ_RANGE_END = 1200; // Hz - Upper bound for analysis
    this.FREQ_STEP_LOW = 0.1; // Hz - Very high resolution for 20-200 Hz (fundamental + first harmonics)
    this.FREQ_STEP_HIGH = 0.25; // Hz - High resolution for 200-1200 Hz
    this.RESONANCE_THRESHOLD = 0.15; // Minimum relative magnitude for peak detection
  }

  /**
   * Calculate fundamental frequency and harmonics from geometry
   * Enhanced with offline capability and Transfer Matrix Method
   *
   * @param {Array} points - Array of {position, diameter} objects
   * @param {Object} offlineManager - Optional offline manager for fallback
   * @returns {Object} Analysis results with frequencies, notes, and metadata
   */
  async analyzeGeometry(points, offlineManager = null) {
    try {
      if (!points || points.length < 2) {
        throw new Error('Insufficient geometry points');
      }

      console.log('[AcousticEngine] Starting analysis with', points.length, 'points, TMM_ENABLED:', this.TMM_ENABLED);

      // Use Transfer Matrix Method if enabled (high precision)
      if (this.TMM_ENABLED) {
        try {
          const result = await this.analyzeGeometryTransferMatrix(points);
          console.log('[AcousticEngine] TMM analysis successful, returning', result.results?.length, 'harmonics');
          return result;
        } catch (tmmError) {
          console.warn('TMM analysis failed, falling back to simplified method:', tmmError);
        }
      }

      // Fallback to simplified online analysis
      console.log('[AcousticEngine] Using simplified online analysis');
      return await this.analyzeGeometryOnline(points);
    } catch (error) {
      console.warn('Online analysis failed, attempting offline analysis:', error);

      // Fallback to offline analysis if offline manager is available
      if (offlineManager) {
        try {
          return await offlineManager.analyzeGeometryOffline(points);
        } catch (offlineError) {
          console.error('Offline analysis also failed:', offlineError);
        }
      }

      // Final fallback to simplified calculation
      console.log('[AcousticEngine] Using simplified calculation as final fallback');
      return await this.analyzeGeometrySimplified(points);
    }
  }

  /**
   * Simplified analysis method as final fallback
   */
  async analyzeGeometrySimplified(points) {
    try {
      // Calculate basic measurements
      const totalLength = points[points.length - 1].position / 100; // cm to m
      const avgDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;
      const avgRadius = avgDiameter / 2000; // mm to m

      // OPEN TUBE: Get specific radii for both ends
      const bellRadius = points[points.length - 1].diameter / 2000; // mm to m (sino/bell)
      const mouthRadius = points[0].diameter / 2000; // mm to m (bocal/mouthpiece)

      // Add end corrections for BOTH ends (open-open tube)
      const bellCorrection = this.END_CORRECTION_FACTOR * bellRadius;
      const mouthCorrection = this.BELL_CORRECTION_FACTOR * mouthRadius;
      const effectiveLength = totalLength + bellCorrection + mouthCorrection;
      let fundamentalFreq = this.SPEED_OF_SOUND / (2 * effectiveLength);

      // ADAPTIVE SCALING: Adjust frequency based on taper ratio (empirical calibration)
      // This accounts for complex acoustic effects in conical didgeridoos
      const taperRatio = bellRadius / mouthRadius;
      let empiricalScaleFactor = 1.0;

      if (taperRatio > 2.5) {
        // Very conical (e.g., 30mm → 90mm): strong taper effect
        empiricalScaleFactor = 0.66;
      } else if (taperRatio > 1.5) {
        // Moderately conical: medium taper effect
        empiricalScaleFactor = 0.85;
      }
      // else: cylindrical or nearly cylindrical - no adjustment needed

      fundamentalFreq = fundamentalFreq * empiricalScaleFactor;

      // Generate basic harmonic series
      // OPEN TUBE: ALL harmonics (not just odd!)
      const harmonics = [];
      for (let n = 1; n <= 12; n++) {
        const freq = fundamentalFreq * n; // All harmonics for open tube
        if (freq >= 20 && freq <= 2000) {
          harmonics.push({
            frequency: freq,
            harmonic: n,
            ...this.frequencyToNote(freq),
            amplitude: 1 / Math.sqrt(n),
            quality: Math.max(0.3, 1 - (freq - 60) / 400)
          });
        }
      }
      
      return {
        results: harmonics,
        metadata: {
          effectiveLength: totalLength * 100,
          averageRadius: avgRadius * 1000,
          volume: Math.PI * avgRadius * avgRadius * totalLength * 1000000,
          isOfflineCalculation: true,
          calculationMethod: 'simplified_fallback'
        }
      };
    } catch (error) {
      console.error('Even simplified analysis failed:', error);
      throw new Error('Análise acústica falhou completamente');
    }
  }

  /**
   * Online analysis method (original logic)
   */
  async analyzeGeometryOnline(points) {
    try {
      // Convert geometry to SI units and validate
      const segments = this.processGeometry(points);
      
      // Calculate acoustic properties
      const effectiveLength = this.calculateEffectiveLength(segments);
      const averageRadius = this.calculateAverageRadius(segments);
      
      // Calculate fundamental frequency with refined mouthpiece modeling
      const fundamentalFreq = this.calculateFundamental(effectiveLength, averageRadius, segments);
      
      // Calculate harmonic series
      const harmonics = this.calculateHarmonics(fundamentalFreq, segments);
      
      // Convert to musical notes
      const results = harmonics.map((freq, index) => ({
        frequency: freq,
        harmonic: index + 1,
        ...this.frequencyToNote(freq),
        amplitude: this.calculateHarmonicAmplitude(index, segments),
        quality: this.assessHarmonicQuality(freq, segments)
      }));

      return {
        results,
        metadata: {
          effectiveLength: effectiveLength * 100, // Convert back to cm
          averageRadius: averageRadius * 1000, // Convert back to mm
          volume: this.calculateVolume(segments),
          impedanceProfile: this.calculateImpedanceProfile(segments),
          isOfflineCalculation: false,
          calculationMethod: 'online_advanced'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process and validate geometry points
   */
  processGeometry(points) {
    const segments = [];
    
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      
      const length = (p2.position - p1.position) / 100; // Convert cm to m
      const r1 = p1.diameter / 2000; // Convert mm to m (radius)
      const r2 = p2.diameter / 2000;
      
      if (length <= 0 || r1 <= 0 || r2 <= 0) {
        throw new Error(`Invalid segment: length=${length}, r1=${r1}, r2=${r2}`);
      }
      
      segments.push({
        length,
        r1,
        r2,
        averageRadius: (r1 + r2) / 2,
        taperRatio: r2 / r1
      });
    }
    
    return segments;
  }

  /**
   * Calculate effective acoustic length with end corrections
   * Didgeridoo is an OPEN TUBE with corrections at both ends
   */
  calculateEffectiveLength(segments) {
    const physicalLength = segments.reduce((sum, seg) => sum + seg.length, 0);

    // Add end correction for bell (open end)
    const bellRadius = segments[segments.length - 1].r2;
    const bellCorrection = this.END_CORRECTION_FACTOR * bellRadius;

    // Add correction for mouthpiece (acoustically open despite physical constraint)
    const mouthRadius = segments[0].r1;
    const mouthCorrection = this.BELL_CORRECTION_FACTOR * mouthRadius;

    return physicalLength + bellCorrection + mouthCorrection;
  }

  /**
   * Calculate volume-weighted average radius
   */
  calculateAverageRadius(segments) {
    let totalVolume = 0;
    let weightedRadius = 0;
    
    segments.forEach(segment => {
      const volume = this.calculateSegmentVolume(segment);
      totalVolume += volume;
      weightedRadius += segment.averageRadius * volume;
    });
    
    return weightedRadius / totalVolume;
  }

  /**
   * Calculate fundamental frequency using Webster's horn equation approximation
   * CORRECTED: Didgeridoo is an OPEN TUBE (f = c / 2L, not c / 4L)
   */
  calculateFundamental(effectiveLength, averageRadius, segments = null) {
    // Base calculation for OPEN TUBE (both ends open acoustically)
    let baseFreq = this.SPEED_OF_SOUND / (2 * effectiveLength);

    // Apply taper correction - tapered instruments resonate higher
    // REDUCED from 0.30 to 0.12 for realistic didgeridoo behavior
    let taperCorrection = 1.0;
    if (segments && segments.length > 0) {
      const taperFactor = this.calculateTaperFactor(segments);
      // Moderate taper increases effective frequency
      taperCorrection = 1.0 + (taperFactor * 0.12); // Can increase up to ~12%
    }

    // Apply refined mouthpiece correction if segments are available
    let mouthpieceCorrection = this.MOUTH_IMPEDANCE_FACTOR;
    if (segments && segments.length > 0) {
      mouthpieceCorrection = this.calculateMouthpieceCorrection(segments);
    }

    // REMOVED problematic radiusCorrection that could give negative results
    // Radius effects are already captured in end corrections

    return baseFreq * mouthpieceCorrection * taperCorrection;
  }

  /**
   * Calculate refined mouthpiece correction based on first 30mm geometry
   * More accurate modeling of the critical mouthpiece region
   */
  calculateMouthpieceCorrection(segments) {
    // Find segments within first 30mm
    const mouthpieceSegments = segments.filter(seg => seg.startPos <= 3.0); // 3cm = 30mm
    
    if (mouthpieceSegments.length === 0) {
      return this.MOUTH_IMPEDANCE_FACTOR; // Fallback to default
    }
    
    // Calculate average diameter in mouthpiece region
    let totalLength = 0;
    let weightedDiameter = 0;
    
    mouthpieceSegments.forEach(seg => {
      const segmentLength = Math.min(seg.length, 3.0 - seg.startPos);
      totalLength += segmentLength;
      weightedDiameter += seg.avgDiameter * segmentLength;
    });
    
    const avgMouthpieceDiameter = weightedDiameter / totalLength;
    const mouthpieceRadius = avgMouthpieceDiameter / 2000; // mm to m
    
    // Refined correction based on mouthpiece geometry
    // Smaller mouthpieces have better coupling efficiency
    const sizeCorrection = 1.0 - (mouthpieceRadius - 0.015) * 2.0; // Optimal around 15mm radius
    const clampedCorrection = Math.max(0.75, Math.min(0.95, sizeCorrection));
    
    // Apply taper correction for first 30mm
    const taperCorrection = this.calculateMouthpieceTaperCorrection(mouthpieceSegments);
    
    return clampedCorrection * taperCorrection;
  }

  /**
   * Calculate taper correction specifically for mouthpiece region
   */
  calculateMouthpieceTaperCorrection(mouthpieceSegments) {
    if (mouthpieceSegments.length < 2) return 1.0;
    
    // Calculate rate of change in first 30mm
    const startDiameter = mouthpieceSegments[0].avgDiameter;
    const endDiameter = mouthpieceSegments[mouthpieceSegments.length - 1].avgDiameter;
    const taperRate = (endDiameter - startDiameter) / 30; // mm per mm
    
    // Gentle taper improves acoustic coupling
    // Too rapid taper creates reflections and reduces efficiency
    const optimalTaperRate = 0.3; // 0.3mm increase per mm length
    const taperDeviation = Math.abs(taperRate - optimalTaperRate);
    const taperCorrection = 1.0 - (taperDeviation * 0.1);
    
    return Math.max(0.9, Math.min(1.1, taperCorrection));
  }

  /**
   * Calculate harmonic series with taper effects
   */
  calculateHarmonics(fundamental, segments) {
    const harmonics = [fundamental];

    // Calculate taper factor
    const taperFactor = this.calculateTaperFactor(segments);

    // Generate first 12 harmonics (increased for complex geometries)
    for (let n = 2; n <= 12; n++) {
      let harmonic = fundamental * n;

      // Apply taper corrections (tapered instruments have shifted harmonics)
      if (n > 1) {
        const taperShift = taperFactor * Math.log(n) * 0.05; // Empirical
        harmonic *= (1 + taperShift);
      }

      // Apply harmonic suppression for higher orders
      // Amplitude decreases with harmonic number - deterministic approach
      const amplitude = 1 / Math.sqrt(n);

      // Include harmonic if amplitude is significant enough (>15% - reduced threshold)
      if (amplitude > 0.15) {
        harmonics.push(harmonic);
      }
    }

    return harmonics;
  }

  /**
   * Calculate taper factor (measure of how much the bore changes)
   */
  calculateTaperFactor(segments) {
    let maxTaper = 0;
    let avgTaper = 0;
    
    segments.forEach(segment => {
      const taper = Math.abs(Math.log(segment.taperRatio));
      maxTaper = Math.max(maxTaper, taper);
      avgTaper += taper;
    });
    
    avgTaper /= segments.length;
    return (maxTaper + avgTaper) / 2;
  }

  /**
   * Calculate harmonic amplitude based on physics
   */
  calculateHarmonicAmplitude(harmonicIndex, segments) {
    // Base amplitude decreases with harmonic order
    let amplitude = 1 / (harmonicIndex + 1);
    
    // Taper enhances certain harmonics
    const taperFactor = this.calculateTaperFactor(segments);
    if (harmonicIndex === 1) { // Second harmonic often enhanced in didgeridoos
      amplitude *= (1 + taperFactor * 0.5);
    }
    
    return Math.max(0.1, Math.min(1.0, amplitude));
  }

  /**
   * Assess harmonic quality (how well it resonates)
   */
  assessHarmonicQuality(frequency, segments) {
    // Higher frequencies are generally harder to play
    const frequencyFactor = Math.max(0.3, 1 - (frequency - 60) / 400);
    
    // Taper affects playability
    const taperFactor = this.calculateTaperFactor(segments);
    const taperBonus = Math.min(0.3, taperFactor);
    
    return Math.min(1.0, frequencyFactor + taperBonus);
  }

  /**
   * Convert frequency to musical note
   * High-precision implementation following standard music theory
   */
  frequencyToNote(frequency) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Get current A4 frequency from tuning service (typically 440 Hz or 432 Hz)
    const A4_FREQUENCY = tuningService.getA4Frequency();

    // Calculate exact semitones from A4 using logarithmic scale
    // Formula: semitones = 12 * log2(f / A4)
    const exactSemitones = 12 * Math.log2(frequency / A4_FREQUENCY);

    // Round to nearest semitone for note name
    const roundedSemitones = Math.round(exactSemitones);

    // Calculate cents deviation (1 semitone = 100 cents)
    const cents = Math.round((exactSemitones - roundedSemitones) * 100);

    // Convert semitones to note and octave
    // A4 is at semitone 0, C0 is 57 semitones below A4
    const noteNumber = roundedSemitones + 9; // +9 because A is 9 semitones from C
    const octave = Math.floor(noteNumber / 12) + 4; // A4 is in octave 4
    const noteIndex = ((noteNumber % 12) + 12) % 12; // Handle negative modulo

    return {
      note: noteNames[noteIndex],
      octave,
      cents, // Renamed from centDiff for clarity
      centDiff: cents, // Keep for backward compatibility
      exactFrequency: frequency,
      // Additional precision info
      exactSemitones: parseFloat(exactSemitones.toFixed(2))
    };
  }

  /**
   * Calculate segment volume (truncated cone)
   */
  calculateSegmentVolume(segment) {
    const { length, r1, r2 } = segment;
    return Math.PI * length * (r1 * r1 + r1 * r2 + r2 * r2) / 3;
  }

  /**
   * Calculate total internal volume
   */
  calculateVolume(segments) {
    return segments.reduce((total, segment) => {
      return total + this.calculateSegmentVolume(segment);
    }, 0) * 1000000; // Convert m³ to cm³
  }

  /**
   * Calculate impedance profile along the bore
   */
  calculateImpedanceProfile(segments) {
    const profile = [];
    let position = 0;
    
    segments.forEach(segment => {
      const impedance = this.calculateSegmentImpedance(segment);
      profile.push({
        position: position * 100, // Convert to cm
        impedance,
        reflection: this.calculateReflection(segment)
      });
      position += segment.length;
    });
    
    return profile;
  }

  /**
   * Calculate acoustic impedance for a segment
   */
  calculateSegmentImpedance(segment) {
    const area = Math.PI * segment.averageRadius * segment.averageRadius;
    return (this.AIR_DENSITY * this.SPEED_OF_SOUND) / area;
  }

  /**
   * Calculate reflection coefficient
   */
  calculateReflection(segment) {
    if (segment.taperRatio === 1) return 0; // No taper, no reflection

    const impedanceRatio = segment.r1 * segment.r1 / (segment.r2 * segment.r2);
    return (impedanceRatio - 1) / (impedanceRatio + 1);
  }

  // ============================================================================
  // TRANSFER MATRIX METHOD (TMM) - High Precision Analysis
  // Based on Dan Mapes-Riordan (1991) and Webster Horn Equation
  // ============================================================================

  /**
   * Analyze geometry using Transfer Matrix Method
   * This is the high-precision method used by DidgitaldDoo and CADSD
   *
   * @param {Array} points - Array of {position, diameter} objects
   * @returns {Object} Analysis results with full impedance spectrum
   */
  async analyzeGeometryTransferMatrix(points) {
    console.log('[TMM] Starting Transfer Matrix Method analysis');

    // IMPORTANT: Normalize geometry direction - always mouthpiece (small) to bell (large)
    // DigitalDoo and CADSD expect geometry from mouthpiece to bell
    const firstDiameter = points[0].diameter;
    const lastDiameter = points[points.length - 1].diameter;

    let normalizedPoints = points;
    if (firstDiameter > lastDiameter) {
      // Geometry is reversed (bell → mouthpiece), need to flip it
      console.log('[TMM] ⚠️  Geometry is reversed! Flipping from bell→mouth to mouth→bell');
      console.log('[TMM] Before flip: First diameter =', firstDiameter, 'mm, Last diameter =', lastDiameter, 'mm');

      // Reverse the array and recalculate positions from 0
      const maxPosition = points[points.length - 1].position;
      normalizedPoints = [...points].reverse().map(p => ({
        position: maxPosition - p.position,
        diameter: p.diameter
      })).reverse();

      // Ensure position starts at 0
      const minPos = normalizedPoints[0].position;
      if (minPos !== 0) {
        normalizedPoints = normalizedPoints.map(p => ({
          position: p.position - minPos,
          diameter: p.diameter
        }));
      }

      console.log('[TMM] After flip: First diameter =', normalizedPoints[0].diameter, 'mm, Last diameter =', normalizedPoints[normalizedPoints.length - 1].diameter, 'mm');
    } else {
      console.log('[TMM] ✓ Geometry is correctly oriented (mouth→bell)');
      console.log('[TMM] First diameter =', firstDiameter, 'mm, Last diameter =', lastDiameter, 'mm');
    }

    // Process geometry into segments
    const segments = this.processGeometryForTMM(normalizedPoints);
    console.log('[TMM] Processed', segments.length, 'segments');

    // Calculate geometry parameters for calibration (using normalized points)
    const mouthRadius = normalizedPoints[0].diameter / 2000;
    const bellRadius = normalizedPoints[normalizedPoints.length - 1].diameter / 2000;
    const physicalLength = normalizedPoints[normalizedPoints.length - 1].position / 100;
    const taperRatio = bellRadius / mouthRadius;

    // Calculate calibration factor based on DigitalDoo empirical data
    // Reference: 1695mm, 30mm→90mm (taper ratio 3.0) gives fundamental 65.5 Hz
    // Our TMM without calibration gives ~31 Hz for this geometry
    // Calibration factor varies with taper ratio
    const calibrationFactor = this.calculateCalibrationFactor(taperRatio, physicalLength);
    console.log('[TMM] Taper ratio:', taperRatio.toFixed(2), 'Calibration factor:', calibrationFactor.toFixed(3));

    // Generate frequency range for analysis (scaled by calibration)
    const frequencies = this.generateFrequencyRange();
    console.log('[TMM] Analyzing', frequencies.length, 'frequencies from', frequencies[0], 'to', frequencies[frequencies.length - 1], 'Hz');

    // Calculate impedance spectrum across all frequencies
    const impedanceSpectrum = this.calculateImpedanceSpectrum(segments, frequencies);
    console.log('[TMM] Calculated impedance spectrum');

    // Find resonance peaks from TMM impedance spectrum
    let tmmResonances = this.findResonancePeaks(frequencies, impedanceSpectrum);
    console.log('[TMM] TMM resonances (raw):', tmmResonances.map(f => f.toFixed(2) + 'Hz').join(', '));

    // Use TMM resonances directly (now using CADSD algorithm)
    const resonances = tmmResonances.slice(0, 12);
    console.log('[TMM] Using TMM resonances:', resonances.map(f => f.toFixed(2) + 'Hz').join(', '));

    // Convert resonances to musical notes
    const results = resonances.map((freq, index) => ({
      frequency: freq,
      harmonic: index + 1,
      ...this.frequencyToNote(freq),
      amplitude: this.calculateResonanceAmplitude(freq, impedanceSpectrum, frequencies),
      quality: this.assessResonanceQuality(freq, impedanceSpectrum, frequencies)
    }));

    console.log('[TMM] Returning', results.length, 'results');

    // Calculate metadata (using normalized points)
    const totalLength = normalizedPoints[normalizedPoints.length - 1].position / 100; // cm to m
    const avgRadius = this.calculateAverageRadius(segments);

    return {
      results,
      metadata: {
        effectiveLength: totalLength * 100,
        averageRadius: avgRadius * 1000,
        volume: this.calculateVolume(segments),
        impedanceSpectrum: this.formatImpedanceSpectrum(frequencies, impedanceSpectrum),
        isOfflineCalculation: false,
        calculationMethod: 'transfer_matrix_method'
      }
    };
  }

  /**
   * Process geometry points for Transfer Matrix Method
   * Following CADSD approach - subdivide segments for better accuracy
   * The CADSD method includes end correction in the radiation impedance formula
   *
   * Source: didge-lab cadsd_py.py
   */
  processGeometryForTMM(points) {
    console.log('[TMM-CADSD] Processing geometry - First point:', points[0], 'Last point:', points[points.length - 1]);
    const segments = [];
    let currentPosition = 0;

    // Calculate overall geometry parameters
    // NOTE: position is in CM (from UI), diameter is in MM
    const mouthDiameter = points[0].diameter;
    const bellDiameter = points[points.length - 1].diameter;
    const expansionRatio = bellDiameter / mouthDiameter;
    const physicalLength = points[points.length - 1].position / 100; // cm to m

    console.log('[TMM-CADSD] Expansion ratio:', expansionRatio.toFixed(2), '(', mouthDiameter, 'mm ->', bellDiameter, 'mm)');
    console.log('[TMM-CADSD] Physical length:', (physicalLength * 1000).toFixed(1), 'mm');

    // CADSD subdivides segments into smaller pieces for better accuracy
    // Target segment length: ~10mm (0.01m) for precise TMM calculation
    const TARGET_SEGMENT_LENGTH = 0.01; // 10mm segments

    // Process physical segments with subdivision
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      const totalLength = (p2.position - p1.position) / 100; // Convert cm to m
      const r1 = p1.diameter / 2000; // Convert mm to m (radius)
      const r2 = p2.diameter / 2000;

      if (totalLength <= 0 || r1 <= 0 || r2 <= 0) {
        throw new Error(`Invalid segment: length=${totalLength}, r1=${r1}, r2=${r2}`);
      }

      // Calculate number of subdivisions
      const numSubdivisions = Math.max(1, Math.ceil(totalLength / TARGET_SEGMENT_LENGTH));
      const subLength = totalLength / numSubdivisions;

      // Create subdivided segments with linear interpolation of radius
      for (let j = 0; j < numSubdivisions; j++) {
        const t1 = j / numSubdivisions;
        const t2 = (j + 1) / numSubdivisions;
        const subR1 = r1 + (r2 - r1) * t1;
        const subR2 = r1 + (r2 - r1) * t2;

        segments.push({
          length: subLength,
          r1: subR1,
          r2: subR2,
          averageRadius: (subR1 + subR2) / 2,
          taperRatio: subR2 / subR1,
          startPosition: currentPosition,
          endPosition: currentPosition + subLength
        });

        currentPosition += subLength;
      }
    }

    console.log('[TMM-CADSD] Total segments after subdivision:', segments.length);
    console.log('[TMM-CADSD] Total physical length:', (currentPosition * 1000).toFixed(1), 'mm');

    return segments;
  }

  /**
   * Calculate empirical calibration factor to match DigitalDoo results
   * Based on reference measurements and acoustic theory
   *
   * Reference data from DigitalDoo (1695mm, 30mm→90mm, taper ratio 3.0):
   * Fundamental: 65.50 Hz (vs ~31 Hz from pure TMM)
   * Calibration factor: 65.50 / 31 ≈ 2.113
   *
   * This calibration accounts for:
   * - Spherical wave propagation in conical bore
   * - Complex impedance matching at mouthpiece
   * - Non-linear acoustic effects
   */
  calculateCalibrationFactor(taperRatio, physicalLength) {
    // Reference calibration point: taper 3.0, length 1.695m → factor 2.113
    const referenceTaper = 3.0;
    const referenceLength = 1.695;
    const referenceFactor = 2.113;

    // Taper ratio influence (empirical from acoustic theory)
    // Higher taper = frequencies raised more above cylindrical
    let taperInfluence;
    if (taperRatio <= 1.0) {
      // Cylindrical or reverse taper - minimal elevation
      taperInfluence = 1.0;
    } else if (taperRatio <= 2.0) {
      // Slight to moderate cone
      taperInfluence = 1.0 + (taperRatio - 1.0) * 0.5;
    } else if (taperRatio <= 4.0) {
      // Moderate to strong cone (most didgeridoos)
      taperInfluence = 1.5 + (taperRatio - 2.0) * 0.3;
    } else {
      // Extreme cone
      taperInfluence = 2.1 + (taperRatio - 4.0) * 0.1;
    }

    // Normalize taper influence relative to reference
    const referenceTaperInfluence = 1.5 + (referenceTaper - 2.0) * 0.3; // = 1.8
    const taperAdjustment = taperInfluence / referenceTaperInfluence;

    // Length influence (longer = slightly lower frequencies relative to TMM)
    const lengthRatio = physicalLength / referenceLength;
    const lengthAdjustment = Math.pow(lengthRatio, -0.05); // Very small effect

    const finalFactor = referenceFactor * taperAdjustment * lengthAdjustment;

    console.log('[TMM Calibration] Taper influence:', taperInfluence.toFixed(3),
                'Taper adj:', taperAdjustment.toFixed(3),
                'Length adj:', lengthAdjustment.toFixed(3),
                'Final factor:', finalFactor.toFixed(3));

    return finalFactor;
  }

  /**
   * Get frequency multiplier for conical bore
   * Based on acoustic theory: cone fundamental is higher than cylinder of same length
   *
   * For a truncated cone (didgeridoo), the frequency is raised by a factor that
   * depends on the taper ratio (bell/mouth diameter ratio)
   *
   * Reference: UNSW Physics - frequencies raised by 1.06 to 1.38 relative to cylinder
   */
  getConeFrequencyMultiplier(taperRatio) {
    if (taperRatio <= 1.0) {
      // Cylindrical or reverse taper
      return 1.0;
    }

    // Empirical formula based on DigitalDoo calibration data:
    // taper 1.36 (1400mm, 28→38mm): f1 = 69.19 Hz, cylinder would be ~61 Hz → mult ~1.13
    // taper 3.00 (1695mm, 30→90mm): f1 = 65.50 Hz, cylinder would be ~50 Hz → mult ~1.31

    // Linear interpolation between these points
    if (taperRatio <= 1.5) {
      return 1.0 + (taperRatio - 1.0) * 0.26; // 1.0 to 1.13
    } else if (taperRatio <= 3.0) {
      return 1.13 + (taperRatio - 1.5) * 0.12; // 1.13 to 1.31
    } else {
      return 1.31 + (taperRatio - 3.0) * 0.05; // Gradually increasing
    }
  }

  /**
   * Generate frequency range for analysis
   * Uses variable resolution for optimal peak detection
   */
  generateFrequencyRange() {
    const frequencies = [];

    // Very high resolution for low frequencies (20-200 Hz) - fundamental and early harmonics
    for (let f = this.FREQ_RANGE_START; f < 200; f += this.FREQ_STEP_LOW) {
      frequencies.push(f);
    }

    // High resolution for mid-high frequencies (200-1200 Hz)
    for (let f = 200; f <= this.FREQ_RANGE_END; f += this.FREQ_STEP_HIGH) {
      frequencies.push(f);
    }

    console.log('[TMM] Frequency range: ', this.FREQ_RANGE_START, '-', this.FREQ_RANGE_END, 'Hz,', frequencies.length, 'points');

    return frequencies;
  }

  /**
   * Calculate resonance frequencies for a conical bore
   * Based on empirical calibration with DigitalDoo
   *
   * DigitalDoo uses a specific formula that produces consistent results.
   * Through analysis of reference data, we reverse-engineered the pattern:
   *
   * Reference data from DigitalDoo:
   * - 1400mm, 28mm→38mm (taper 1.36): 69.19, 181.54, 298.34, 417.08, 536.21, 654.46, 773.81, 894.02
   * - 1695mm, 30mm→90mm (taper 3.00): 65.50, 163.62, 270.44, 353.77, 476.34, 573.04, 648.82, 796.48
   *
   * Analysis of harmonic ratios shows a NON-LINEAR pattern:
   * Taper 1.36: f_n/f_1 = 1, 2.624, 4.312, 6.027, 7.749, 9.459, 11.183, 12.920
   * The delta from n: 0, 0.624, 1.312, 2.027, 2.749, 3.459, 4.183, 4.920
   * These deltas follow pattern: 0.624 + 0.688*(n-2) for n≥2, approximately 0.69*(n-1)
   */
  calculateConicalResonances(physicalLength, mouthRadius, bellRadius) {
    const resonances = [];
    const c = this.SPEED_OF_SOUND;

    // Taper ratio
    const taperRatio = bellRadius / mouthRadius;

    // Calculate diameters for end correction
    const bellDiameter = bellRadius * 2;

    // End correction: 0.3 × bell diameter (UNSW formula)
    const endCorrection = 0.3 * bellDiameter;

    // Effective acoustic length
    const effectiveLength = physicalLength + endCorrection;

    // Calculate base frequency (open-open cylinder)
    const baseFreq = c / (2 * effectiveLength);

    // DigitalDoo fundamental frequency calibration:
    // For taper 1.36: f1 = 69.19 Hz, baseFreq ≈ 121.58 Hz → factor = 0.5690
    // For taper 3.00: f1 = 65.50 Hz, baseFreq ≈ 99.63 Hz → factor = 0.6574
    // Linear interpolation: factor = 0.5690 + 0.0539 * (taper - 1.36)
    const f1_factor = 0.5690 + 0.0539 * (taperRatio - 1.36);
    const fundamental = baseFreq * Math.max(0.5, Math.min(0.75, f1_factor));

    console.log('[Conical] Base freq:', baseFreq.toFixed(2), 'Hz');
    console.log('[Conical] Taper ratio:', taperRatio.toFixed(2));
    console.log('[Conical] f1 factor:', f1_factor.toFixed(3));
    console.log('[Conical] Fundamental:', fundamental.toFixed(2), 'Hz');

    // DigitalDoo harmonic series analysis:
    //
    // For taper 1.36 (1400mm, 28→38mm):
    // n:     1       2       3       4       5       6       7       8
    // freq:  69.19   181.54  298.34  417.08  536.21  654.46  773.81  894.02
    // ratio: 1       2.624   4.312   6.027   7.749   9.459   11.183  12.920
    // Δn:    0       0.624   1.312   2.027   2.749   3.459   4.183   4.920
    //
    // Pattern for Δn: approximately 0.69 * (n - 1)
    // So f_n/f_1 = n + 0.69 * (n - 1) = n * 1.69 - 0.69
    //
    // For taper 3.00 (1695mm, 30→90mm):
    // freq:  65.50   163.62  270.44  353.77  476.34  573.04  648.82  796.48
    // ratio: 1       2.498   4.129   5.401   7.272   8.748   9.906   12.160
    // Δn:    0       0.498   1.129   1.401   2.272   2.748   2.906   4.160
    //
    // The pattern is more complex for high taper - harmonics are compressed
    // Delta factor decreases with taper: 0.69 at taper 1.36, ~0.5 at taper 3.0

    // Calibrate delta factor based on taper ratio
    // deltaFactor = 0.69 - 0.115 * (taper - 1.36)
    const deltaFactor = 0.69 - 0.115 * (taperRatio - 1.36);
    const clampedDeltaFactor = Math.max(0.3, Math.min(0.8, deltaFactor));

    console.log('[Conical] Delta factor:', clampedDeltaFactor.toFixed(3));

    // Generate harmonics using the calibrated formula
    // f_n = f_1 * (n + deltaFactor * (n - 1))
    for (let n = 1; n <= 12; n++) {
      const ratio = n + clampedDeltaFactor * (n - 1);
      const freq = fundamental * ratio;

      if (freq >= 20 && freq <= 1200) {
        resonances.push(freq);
      }
    }

    // Log expected vs calculated for verification
    console.log('[Conical] Generated resonances:', resonances.map(f => f.toFixed(2) + 'Hz').join(', '));

    return resonances;
  }

  /**
   * Calculate complete impedance spectrum using Transfer Matrix Method
   *
   * For each frequency:
   * 1. Build transfer matrix for each segment
   * 2. Multiply matrices to get total transfer matrix
   * 3. Calculate input impedance from radiation impedance
   *
   * @param {Array} segments - Array of segment objects
   * @param {Array} frequencies - Array of frequencies to analyze
   * @returns {Array} Array of complex impedance values {real, imag, magnitude, phase}
   */
  calculateImpedanceSpectrum(segments, frequencies) {
    const spectrum = [];

    for (const freq of frequencies) {
      const impedance = this.calculateImpedanceAtFrequency(segments, freq);
      spectrum.push(impedance);
    }

    return spectrum;
  }

  /**
   * Calculate impedance at a single frequency
   * Using CADSD method with viscothermal losses
   *
   * Based on: https://github.com/jnehring/didge-lab/blob/main/src/cad/cadsd/cadsd_py.py
   * Transfer matrix method with complex hyperbolic functions
   */
  calculateImpedanceAtFrequency(segments, frequency) {
    const omega = 2 * Math.PI * frequency;

    // Start with identity matrix (all complex)
    let M = {
      A: { real: 1, imag: 0 },
      B: { real: 0, imag: 0 },
      C: { real: 0, imag: 0 },
      D: { real: 1, imag: 0 }
    };

    // Multiply transfer matrices for all segments using CADSD method
    for (const segment of segments) {
      const segmentMatrix = this.calculateCADSDTransferMatrix(segment, omega);
      M = this.multiplyComplexMatrices(M, segmentMatrix);
    }

    // Calculate radiation impedance at the bell (open end) using CADSD formula
    const bellRadius = segments[segments.length - 1].r2;
    const bellDiameter = bellRadius * 2;
    const Zrad = this.calculateCADSDRadiationImpedance(bellDiameter, omega);

    // Zin = (A * Zrad + B) / (C * Zrad + D)
    const numerator = this.complexAdd(
      this.complexMultiply(M.A, Zrad),
      M.B
    );
    const denominator = this.complexAdd(
      this.complexMultiply(M.C, Zrad),
      M.D
    );

    const Zin = this.complexDivide(numerator, denominator);
    const magnitude = Math.sqrt(Zin.real * Zin.real + Zin.imag * Zin.imag);

    return {
      real: Zin.real,
      imag: Zin.imag,
      magnitude: magnitude,
      phase: Math.atan2(Zin.imag, Zin.real)
    };
  }

  /**
   * Calculate CADSD transfer matrix for a segment
   * Implements the exact CADSD algorithm with viscothermal losses
   *
   * Source: cadsd_py.py from didge-lab
   */
  calculateCADSDTransferMatrix(segment, omega) {
    const { r1, r2, length } = segment;
    const d0 = r1 * 2; // diameter at start (m)
    const d1 = r2 * 2; // diameter at end (m)
    const L = length;  // length (m)

    const c = this.SPEED_OF_SOUND;
    const p = this.AIR_DENSITY;
    const n = this.DYNAMIC_VISCOSITY;

    // Cross-sectional areas
    const a0 = Math.PI * d0 * d0 / 4;
    const a1 = Math.PI * d1 * d1 / 4;
    const a01 = Math.PI * Math.pow(d0 + d1, 2) / 16; // intermediate area

    // Characteristic impedance at input
    const r0 = p * c / a0;

    // Reynolds number-based term for viscothermal losses
    const rvw = Math.sqrt(p * omega * a01 / (n * Math.PI));

    // Complex wave number with losses (Tw = kw * (1.045/rvw + j*(1 + 1.045/rvw)))
    const kw = omega / c;
    const lossReal = kw * 1.045 / rvw;
    const lossImag = kw * (1.0 + 1.045 / rvw);
    const Tw = { real: lossReal, imag: lossImag };

    // Complex characteristic impedance with losses
    // Zcw = r0*(1 + 0.369/rvw) - j*r0*0.369/rvw
    const Zcw = {
      real: r0 * (1.0 + 0.369 / rvw),
      imag: -r0 * 0.369 / rvw
    };

    // Check if cylindrical (d0 ≈ d1) or conical
    if (Math.abs(d0 - d1) < 0.0001) {
      // Cylindrical segment
      return this.calculateCADSDCylindricalMatrix(Tw, Zcw, L);
    } else {
      // Conical segment
      return this.calculateCADSDConicalMatrix(d0, d1, Tw, Zcw, L);
    }
  }

  /**
   * CADSD cylindrical segment transfer matrix
   * y[0][0] = cosh(Tw*L), y[0][1] = Zcw*sinh(Tw*L)
   * y[1][0] = sinh(Tw*L)/Zcw, y[1][1] = cosh(Tw*L)
   */
  calculateCADSDCylindricalMatrix(Tw, Zcw, L) {
    // Complex multiplication: Tw * L
    const TwL = { real: Tw.real * L, imag: Tw.imag * L };

    // Complex hyperbolic functions
    const coshTwL = this.complexCosh(TwL);
    const sinhTwL = this.complexSinh(TwL);

    return {
      A: coshTwL,
      B: this.complexMultiply(Zcw, sinhTwL),
      C: this.complexDivide(sinhTwL, Zcw),
      D: coshTwL
    };
  }

  /**
   * CADSD conical segment transfer matrix
   * Uses spherical wave approximation for conical horn
   */
  calculateCADSDConicalMatrix(d0, d1, Tw, Zcw, L) {
    // Taper angle
    const phi = Math.atan(Math.abs(d1 - d0) / (2 * L));
    const sinPhi = Math.sin(phi);

    // Distances from virtual apex
    // l = |d1 - d0| / (2 * sin(phi))
    const l = Math.abs(d1 - d0) / (2 * sinPhi);
    const x1 = d1 / (2 * sinPhi);
    const x0 = x1 - l;

    // Prevent numerical issues
    if (x0 < 0.001 || x1 < 0.001) {
      return this.calculateCADSDCylindricalMatrix(Tw, Zcw, L);
    }

    // Complex: Tw * l
    const Twl = { real: Tw.real * l, imag: Tw.imag * l };

    // Complex hyperbolic functions
    const coshTwl = this.complexCosh(Twl);
    const sinhTwl = this.complexSinh(Twl);

    // Complex: Tw * x0, Tw * x1
    const Twx0 = { real: Tw.real * x0, imag: Tw.imag * x0 };
    const Twx1 = { real: Tw.real * x1, imag: Tw.imag * x1 };

    // CADSD conical matrix elements:
    // y[0][0] = x1/x0 * (cosh(Tw*l) - sinh(Tw*l)/(Tw*x1))
    // y[0][1] = x0/x1 * Zcw * sinh(Tw*l)
    // y[1][0] = ((x1/x0 - 1/(Tw²*x0²))*sinh(Tw*l) + Tw*l/(Tw*x0)²*cosh(Tw*l)) / Zcw
    // y[1][1] = x0/x1 * (cosh(Tw*l) + sinh(Tw*l)/(Tw*x0))

    const x1_x0 = x1 / x0;
    const x0_x1 = x0 / x1;

    // y[0][0] = x1/x0 * (cosh - sinh/(Tw*x1))
    const sinhDivTwx1 = this.complexDivide(sinhTwl, Twx1);
    const A_inner = this.complexSubtract(coshTwl, sinhDivTwx1);
    const A = this.complexScale(A_inner, x1_x0);

    // y[0][1] = x0/x1 * Zcw * sinh
    const B_inner = this.complexMultiply(Zcw, sinhTwl);
    const B = this.complexScale(B_inner, x0_x1);

    // y[1][1] = x0/x1 * (cosh + sinh/(Tw*x0))
    const sinhDivTwx0 = this.complexDivide(sinhTwl, Twx0);
    const D_inner = this.complexAdd(coshTwl, sinhDivTwx0);
    const D = this.complexScale(D_inner, x0_x1);

    // y[1][0] is more complex
    // ((x1/x0 - 1/(Tw²*x0²))*sinh + Tw*l/(Tw*x0)²*cosh) / Zcw
    const Tw2 = this.complexMultiply(Tw, Tw);
    const Tw2x02 = this.complexScale(Tw2, x0 * x0);
    const invTw2x02 = this.complexDivide({ real: 1, imag: 0 }, Tw2x02);
    const term1_coef = this.complexSubtract({ real: x1_x0, imag: 0 }, invTw2x02);
    const term1 = this.complexMultiply(term1_coef, sinhTwl);

    const Twx0_2 = this.complexMultiply(Twx0, Twx0);
    const TwlDivTwx02 = this.complexDivide(Twl, Twx0_2);
    const term2 = this.complexMultiply(TwlDivTwx02, coshTwl);

    const C_num = this.complexAdd(term1, term2);
    const C = this.complexDivide(C_num, Zcw);

    return { A, B, C, D };
  }

  /**
   * CADSD radiation impedance formula
   * Based on Levine-Schwinger unflanged pipe radiation impedance
   *
   * The original formula is:
   * Za = 0.5 * Zc * (ka² + j*0.6133*ka) where ka = k*a = ω*radius/c
   *
   * For better match with DigitalDoo, we use adaptive end correction factor
   * that depends on bell diameter (larger bells need smaller factor)
   *
   * Calibration based on DigitalDoo reference data:
   * - 1400mm, 28→38mm (taper 1.36): factor 2.8 gives ±0.3% accuracy
   * - 1695mm, 30→90mm (taper 3.00): factor needs to be lower (~2.2)
   *
   * Pattern: larger bell diameter → lower factor (less end correction)
   */
  calculateCADSDRadiationImpedance(diameter, omega) {
    const c = this.SPEED_OF_SOUND;
    const p = this.AIR_DENSITY;
    const radius = diameter / 2;
    const area = Math.PI * radius * radius;
    const Zc = p * c / area;

    // ka = k * a = (ω/c) * radius
    const ka = omega * radius / c;

    // Adaptive factor based on bell diameter (in meters)
    // Reference calibration:
    //   38mm bell: factor = 2.8 (perfect match)
    //   90mm bell: factor = 2.2 (estimated from error pattern)
    //
    // Linear interpolation: factor = 2.8 - 0.0115 * (diameter_mm - 38)
    // This gives: 38mm → 2.8, 90mm → 2.2
    const diameter_mm = diameter * 1000; // Convert m to mm
    const adaptiveFactor = 2.8 - 0.0115 * (diameter_mm - 38);

    // Clamp factor to reasonable range (2.0 to 3.0)
    const factor = Math.max(2.0, Math.min(3.0, adaptiveFactor));

    // Levine-Schwinger unflanged pipe with adaptive end correction:
    // Real: proportional to (ka)²
    // Imag: affects end correction - higher value = lower frequencies
    const real = 0.5 * Zc * ka * ka;
    const imag = 0.5 * Zc * factor * ka;

    return { real, imag };
  }

  // Complex hyperbolic functions
  complexCosh(z) {
    // cosh(a+bi) = cosh(a)cos(b) + i*sinh(a)sin(b)
    const coshA = Math.cosh(z.real);
    const sinhA = Math.sinh(z.real);
    const cosB = Math.cos(z.imag);
    const sinB = Math.sin(z.imag);
    return {
      real: coshA * cosB,
      imag: sinhA * sinB
    };
  }

  complexSinh(z) {
    // sinh(a+bi) = sinh(a)cos(b) + i*cosh(a)sin(b)
    const coshA = Math.cosh(z.real);
    const sinhA = Math.sinh(z.real);
    const cosB = Math.cos(z.imag);
    const sinB = Math.sin(z.imag);
    return {
      real: sinhA * cosB,
      imag: coshA * sinB
    };
  }

  complexSubtract(z1, z2) {
    return { real: z1.real - z2.real, imag: z1.imag - z2.imag };
  }

  complexScale(z, scalar) {
    return { real: z.real * scalar, imag: z.imag * scalar };
  }

  /**
   * Calculate COMPLEX transfer matrix for a segment
   */
  calculateTransferMatrixComplex(segment, frequency) {
    const { r1, r2, length } = segment;
    const omega = 2 * Math.PI * frequency;
    const k = omega / this.SPEED_OF_SOUND;

    // For cylindrical segment (r1 ≈ r2)
    if (Math.abs(r1 - r2) < 0.0001) {
      return this.calculateCylindricalMatrixComplex(r1, length, k);
    }

    // For conical segment
    return this.calculateConicalMatrixComplex(r1, r2, length, k);
  }

  /**
   * Complex transfer matrix for cylindrical segment
   * [cos(kL),      j*Zc*sin(kL)]
   * [j*sin(kL)/Zc, cos(kL)     ]
   */
  calculateCylindricalMatrixComplex(radius, length, k) {
    const S = Math.PI * radius * radius;
    const Zc = (this.AIR_DENSITY * this.SPEED_OF_SOUND) / S;
    const kL = k * length;
    const cosKL = Math.cos(kL);
    const sinKL = Math.sin(kL);

    return {
      A: { real: cosKL, imag: 0 },
      B: { real: 0, imag: Zc * sinKL },      // j * Zc * sin(kL)
      C: { real: 0, imag: sinKL / Zc },      // j * sin(kL) / Zc
      D: { real: cosKL, imag: 0 }
    };
  }

  /**
   * Complex transfer matrix for conical segment
   * Based on Benade (1988) and Caussé/Kergomard/Lurton (1984)
   * Using spherical wave propagation in conical horn
   *
   * The key insight is that for a cone, waves propagate as spherical waves
   * from the virtual apex, so we use kx1 and kx2 (distances from apex)
   */
  calculateConicalMatrixComplex(r1, r2, length, k) {
    const deltaR = Math.abs(r2 - r1);

    if (deltaR < 0.0001) {
      // Nearly cylindrical
      return this.calculateCylindricalMatrixComplex((r1 + r2) / 2, length, k);
    }

    // Calculate distances from virtual apex (xi)
    // For expanding cone (r2 > r1): x1 < x2
    const x1 = r1 * length / deltaR;
    const x2 = r2 * length / deltaR;

    // Prevent numerical issues
    if (x1 < 0.001 || x2 < 0.001) {
      return this.calculateCylindricalMatrixComplex((r1 + r2) / 2, length, k);
    }

    // Characteristic impedance at input
    const S1 = Math.PI * r1 * r1;
    const rho_c = this.AIR_DENSITY * this.SPEED_OF_SOUND;
    const Zc1 = rho_c / S1;

    // Wave parameters - using distances from apex
    const kx1 = k * x1;
    const kx2 = k * x2;

    // Spherical wave functions at each position
    const sin1 = Math.sin(kx1);
    const cos1 = Math.cos(kx1);
    const sin2 = Math.sin(kx2);
    const cos2 = Math.cos(kx2);

    // Benade/Caussé formulation for conical horn transfer matrix
    // Using spherical wave basis functions: sin(kx)/x and cos(kx)/x

    // sin(kx2-kx1) and cos(kx2-kx1) via angle subtraction
    const sin_diff = sin2 * cos1 - cos2 * sin1; // sin(kx2 - kx1)
    const cos_diff = cos2 * cos1 + sin2 * sin1; // cos(kx2 - kx1)

    const ratio = x2 / x1; // = r2/r1

    // Transfer matrix elements (Benade formulation)
    // A = (x2/x1) * [cos(kx2-kx1) + sin(kx2-kx1)/(kx1)]
    const A_real = ratio * cos_diff + sin_diff / kx1;
    const A_imag = 0;

    // B = j * Zc1 * (x2/x1) * sin(kx2-kx1)
    const B_real = 0;
    const B_imag = Zc1 * ratio * sin_diff;

    // C = j/Zc1 * [(x1/x2)*sin(kx2-kx1) + (1/kx1 - 1/kx2)*cos(kx2-kx1) - sin(kx2-kx1)/(kx1*kx2)]
    const C_term1 = (1 / ratio) * sin_diff;
    const C_term2 = (1/kx1 - 1/kx2) * cos_diff;
    const C_term3 = sin_diff / (kx1 * kx2);
    const C_real = 0;
    const C_imag = (C_term1 + C_term2 - C_term3) / Zc1;

    // D = (x1/x2) * [cos(kx2-kx1) - sin(kx2-kx1)/(kx2)]
    const D_real = (1 / ratio) * cos_diff - sin_diff / kx2;
    const D_imag = 0;

    return {
      A: { real: A_real, imag: A_imag },
      B: { real: B_real, imag: B_imag },
      C: { real: C_real, imag: C_imag },
      D: { real: D_real, imag: D_imag }
    };
  }

  /**
   * Multiply two complex 2x2 matrices
   */
  multiplyComplexMatrices(M1, M2) {
    return {
      A: this.complexAdd(
        this.complexMultiply(M1.A, M2.A),
        this.complexMultiply(M1.B, M2.C)
      ),
      B: this.complexAdd(
        this.complexMultiply(M1.A, M2.B),
        this.complexMultiply(M1.B, M2.D)
      ),
      C: this.complexAdd(
        this.complexMultiply(M1.C, M2.A),
        this.complexMultiply(M1.D, M2.C)
      ),
      D: this.complexAdd(
        this.complexMultiply(M1.C, M2.B),
        this.complexMultiply(M1.D, M2.D)
      )
    };
  }

  /**
   * Calculate transfer matrix for a conical segment
   * Based on Dan Mapes-Riordan (1991) method
   *
   * For a conical segment, the transfer matrix is:
   * [ A  B ]
   * [ C  D ]
   *
   * Where A, B, C, D are complex numbers derived from acoustic theory
   */
  calculateTransferMatrix(segment, frequency) {
    const { r1, r2, length } = segment;
    const omega = 2 * Math.PI * frequency;
    const k = omega / this.SPEED_OF_SOUND; // Wave number

    // For cylindrical segment (r1 ≈ r2)
    if (Math.abs(r1 - r2) < 0.0001) {
      return this.calculateCylindricalTransferMatrix(r1, length, k);
    }

    // For conical segment
    return this.calculateConicalTransferMatrix(r1, r2, length, k);
  }

  /**
   * Transfer matrix for cylindrical segment
   */
  calculateCylindricalTransferMatrix(radius, length, k) {
    const S = Math.PI * radius * radius;
    const Zc = (this.AIR_DENSITY * this.SPEED_OF_SOUND) / S;
    const kL = k * length;

    // A = cos(kL), D = cos(kL)
    const A = Math.cos(kL);
    const D = Math.cos(kL);

    // B = j * Zc * sin(kL)
    const B = Zc * Math.sin(kL); // Imaginary part stored as real

    // C = j * sin(kL) / Zc
    const C = Math.sin(kL) / Zc; // Imaginary part stored as real

    return { A, B, C, D };
  }

  /**
   * Transfer matrix for conical segment
   * Uses effective position method for cone
   */
  calculateConicalTransferMatrix(r1, r2, length, k) {
    // Virtual apex method for conical sections
    // x1 and x2 are distances from virtual apex
    const x1 = (r1 !== r2) ? r1 * length / (r2 - r1) : length;
    const x2 = x1 + length;

    // Prevent division by zero
    if (Math.abs(x1) < 0.001 || Math.abs(x2) < 0.001) {
      return this.calculateCylindricalTransferMatrix((r1 + r2) / 2, length, k);
    }

    const kx = k * (x2 - x1);
    const cosKx = Math.cos(kx);
    const sinKx = Math.sin(kx);

    // Matrix elements for conical section
    const A = (r2 / r1) * cosKx - (sinKx / (k * x1));
    const D = (r1 / r2) * cosKx + (sinKx / (k * x2));

    const S1 = Math.PI * r1 * r1;
    const S2 = Math.PI * r2 * r2;
    const B = (this.AIR_DENSITY * this.SPEED_OF_SOUND / (Math.sqrt(S1 * S2))) * sinKx;

    const C = sinKx / (this.AIR_DENSITY * this.SPEED_OF_SOUND * Math.sqrt(S1 * S2));

    return { A, B, C, D };
  }

  /**
   * Calculate radiation impedance at the open end (bell)
   * Based on Levine-Schwinger model with corrections for large apertures
   */
  calculateRadiationImpedance(radius, frequency) {
    const k = (2 * Math.PI * frequency) / this.SPEED_OF_SOUND;
    const ka = k * radius;
    const S = Math.PI * radius * radius;
    const Zc = this.AIR_DENSITY * this.SPEED_OF_SOUND / S;

    // For small ka (ka < 1): use Levine-Schwinger approximation
    // For larger ka: the radiation impedance approaches Zc
    if (ka < 0.5) {
      // Real part (radiation resistance)
      const real = Zc * 0.25 * ka * ka;
      // Imaginary part (radiation reactance) - unflanged pipe
      const imag = Zc * 0.6133 * ka;
      return { real, imag };
    } else if (ka < 2) {
      // Intermediate regime - smooth transition
      const real = Zc * 0.25 * ka * ka / (1 + 0.5 * ka * ka);
      const imag = Zc * 0.6133 * ka / (1 + 0.25 * ka * ka);
      return { real, imag };
    } else {
      // Large ka - approaches characteristic impedance
      const real = Zc * 0.5;
      const imag = Zc * 0.3;
      return { real, imag };
    }
  }

  /**
   * Multiply two 2x2 transfer matrices
   */
  multiplyTransferMatrices(M1, M2) {
    return {
      A: M1.A * M2.A + M1.B * M2.C,
      B: M1.A * M2.B + M1.B * M2.D,
      C: M1.C * M2.A + M1.D * M2.C,
      D: M1.C * M2.B + M1.D * M2.D
    };
  }

  // Complex number operations
  complexAdd(z1, z2) {
    return { real: z1.real + z2.real, imag: z1.imag + z2.imag };
  }

  complexMultiply(z1, z2) {
    return {
      real: z1.real * z2.real - z1.imag * z2.imag,
      imag: z1.real * z2.imag + z1.imag * z2.real
    };
  }

  complexDivide(z1, z2) {
    const denominator = z2.real * z2.real + z2.imag * z2.imag;
    if (denominator === 0) {
      return { real: 0, imag: 0 };
    }
    return {
      real: (z1.real * z2.real + z1.imag * z2.imag) / denominator,
      imag: (z1.imag * z2.real - z1.real * z2.imag) / denominator
    };
  }

  /**
   * Find resonance peaks in impedance spectrum
   * Using CADSD algorithm: detect when impedance transitions from increasing to decreasing
   *
   * This is a simple but effective method:
   * - Track if impedance is ascending (lastImpedance < currentImpedance)
   * - When it transitions from ascending to descending, that's a peak
   *
   * Source: didge-lab didgmo.py FFT class
   */
  findResonancePeaks(frequencies, impedanceSpectrum) {
    const peaks = [];
    const magnitudes = impedanceSpectrum.map(z => z.magnitude);

    const maxMagnitude = Math.max(...magnitudes);
    const minMagnitude = Math.min(...magnitudes);

    console.log('[TMM-CADSD] Impedance magnitude range:', minMagnitude.toExponential(2), 'to', maxMagnitude.toExponential(2));

    // CADSD peak detection: find where impedance transitions from ascending to descending
    let ascending = true;
    let lastImpedance = 0;
    const detectedPeaks = [];

    for (let i = 0; i < magnitudes.length; i++) {
      const impedance = magnitudes[i];
      const freq = frequencies[i];

      // Peak detection: when impedance goes from ascending to descending
      if (impedance < lastImpedance && ascending) {
        // We found a peak at the previous point
        if (freq >= 20 && freq <= 1200) {
          detectedPeaks.push({
            frequency: frequencies[i - 1],
            magnitude: magnitudes[i - 1],
            normalizedAmplitude: magnitudes[i - 1] / maxMagnitude
          });
        }
        ascending = false;
      }

      // Track if we're ascending
      if (impedance > lastImpedance) {
        ascending = true;
      }

      lastImpedance = impedance;
    }

    console.log('[TMM-CADSD] Found', detectedPeaks.length, 'peaks using CADSD algorithm');

    // Filter out peaks that are too close together (keep the higher one)
    const filteredPeaks = [];
    const minFreqSeparation = 30; // Hz minimum between peaks

    for (const peak of detectedPeaks) {
      const tooClose = filteredPeaks.some(existing =>
        Math.abs(existing.frequency - peak.frequency) < minFreqSeparation
      );
      if (!tooClose) {
        filteredPeaks.push(peak);
      } else {
        // Keep the one with higher magnitude
        const nearbyIdx = filteredPeaks.findIndex(existing =>
          Math.abs(existing.frequency - peak.frequency) < minFreqSeparation
        );
        if (nearbyIdx >= 0 && peak.magnitude > filteredPeaks[nearbyIdx].magnitude) {
          filteredPeaks[nearbyIdx] = peak;
        }
      }
    }

    // Sort by frequency and take first 12
    filteredPeaks.sort((a, b) => a.frequency - b.frequency);
    const topPeaks = filteredPeaks.slice(0, 12);

    // Log the peaks we found
    topPeaks.forEach((peak, idx) => {
      peaks.push(peak.frequency);
      console.log('[TMM-CADSD] Resonance #' + (idx + 1) + ':', peak.frequency.toFixed(2), 'Hz, amplitude:', (peak.normalizedAmplitude * 100).toFixed(1) + '%');
    });

    console.log('[TMM-CADSD] Returning', peaks.length, 'resonances');

    return peaks;
  }

  /**
   * Calculate relative amplitude of a resonance peak
   */
  calculateResonanceAmplitude(frequency, impedanceSpectrum, frequencies) {
    const index = frequencies.findIndex(f => Math.abs(f - frequency) < 0.5);
    if (index === -1) return 0.5;

    const magnitude = impedanceSpectrum[index].magnitude;
    const maxMagnitude = Math.max(...impedanceSpectrum.map(z => z.magnitude));

    return magnitude / maxMagnitude;
  }

  /**
   * Assess quality of a resonance (how well it will play)
   */
  assessResonanceQuality(frequency, impedanceSpectrum, frequencies) {
    const index = frequencies.findIndex(f => Math.abs(f - frequency) < 0.5);
    if (index === -1) return 0.5;

    // Calculate Q-factor (sharpness of peak)
    const peakMagnitude = impedanceSpectrum[index].magnitude;
    const halfPowerLevel = peakMagnitude / Math.sqrt(2);

    // Find bandwidth at half power
    let leftIndex = index;
    let rightIndex = index;

    while (leftIndex > 0 && impedanceSpectrum[leftIndex].magnitude > halfPowerLevel) {
      leftIndex--;
    }

    while (rightIndex < impedanceSpectrum.length - 1 &&
           impedanceSpectrum[rightIndex].magnitude > halfPowerLevel) {
      rightIndex++;
    }

    const bandwidth = frequencies[rightIndex] - frequencies[leftIndex];
    const Q = frequency / bandwidth;

    // Higher Q (sharper peak) = better quality, but normalize to 0-1 range
    // Typical didgeridoo Q is 5-20
    const normalizedQ = Math.min(1.0, Q / 20);

    return normalizedQ;
  }

  /**
   * Format impedance spectrum for visualization
   * Returns limited data points to avoid overwhelming the UI
   */
  formatImpedanceSpectrum(frequencies, impedanceSpectrum) {
    const step = Math.max(1, Math.floor(frequencies.length / 200)); // Max 200 points
    const formatted = [];

    for (let i = 0; i < frequencies.length; i += step) {
      formatted.push({
        frequency: frequencies[i],
        magnitude: impedanceSpectrum[i].magnitude,
        phase: impedanceSpectrum[i].phase
      });
    }

    return formatted;
  }

  /**
   * Validate calculation results
   */
  validateResults(results) {
    if (!results || results.length === 0) {
      throw new Error('No calculation results');
    }

    // Check fundamental frequency is reasonable for didgeridoo
    const fundamental = results[0].frequency;
    if (fundamental < 30 || fundamental > 200) {
      console.warn(`Unusual fundamental frequency: ${fundamental} Hz`);
    }

    // Check harmonic ratios
    for (let i = 1; i < results.length; i++) {
      const ratio = results[i].frequency / results[0].frequency;
      const expectedRatio = i + 1;
      if (Math.abs(ratio - expectedRatio) > 0.5) {
        console.warn(`Unusual harmonic ratio ${i + 1}: ${ratio}`);
      }
    }

    return true;
  }
}

// Export singleton instance
export const acousticEngine = new AcousticEngine();