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
    // Physical constants (20°C, 1 atm)
    this.SPEED_OF_SOUND = 343.2; // m/s at 20°C (more precise value)
    this.AIR_DENSITY = 1.204; // kg/m³ at 20°C (corrected value)
    this.DYNAMIC_VISCOSITY = 1.84e-5; // Pa·s (for viscothermal losses)
    this.GAMMA = 1.40; // Ratio of specific heats for air
    this.PRANDTL_NUMBER = 0.71; // Dimensionless

    // Musical constants
    this.SEMITONE_RATIO = Math.pow(2, 1/12);

    // Didgeridoo specific constants
    this.END_CORRECTION_FACTOR = 0.6; // Empirical correction for open end
    this.MOUTH_IMPEDANCE_FACTOR = 0.85; // Mouth coupling efficiency

    // Transfer Matrix Method parameters
    this.TMM_ENABLED = true; // Enable high-precision TMM calculations
    this.FREQ_RANGE_START = 30; // Hz - Lower bound for analysis
    this.FREQ_RANGE_END = 1000; // Hz - Upper bound for analysis
    this.FREQ_STEP_LOW = 0.5; // Hz - High resolution for 30-100 Hz
    this.FREQ_STEP_HIGH = 1.0; // Hz - Standard resolution for 100-1000 Hz
    this.RESONANCE_THRESHOLD = 0.4; // Minimum relative magnitude for peak detection
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

      // Use Transfer Matrix Method if enabled (high precision)
      if (this.TMM_ENABLED) {
        try {
          return await this.analyzeGeometryTransferMatrix(points);
        } catch (tmmError) {
          console.warn('TMM analysis failed, falling back to simplified method:', tmmError);
        }
      }

      // Fallback to simplified online analysis
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
      
      // Simple frequency calculation
      const fundamentalFreq = this.SPEED_OF_SOUND / (4 * totalLength);
      
      // Generate basic harmonic series
      const harmonics = [];
      for (let n = 1; n <= 6; n++) {
        const freq = fundamentalFreq * (2 * n - 1); // odd harmonics
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
   */
  calculateEffectiveLength(segments) {
    const physicalLength = segments.reduce((sum, seg) => sum + seg.length, 0);
    
    // Add end correction for open pipe
    const finalRadius = segments[segments.length - 1].r2;
    const endCorrection = this.END_CORRECTION_FACTOR * finalRadius;
    
    return physicalLength + endCorrection;
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
   */
  calculateFundamental(effectiveLength, averageRadius, segments = null) {
    // Base calculation for uniform tube
    let baseFreq = this.SPEED_OF_SOUND / (4 * effectiveLength);
    
    // Apply radius correction (larger radius = slightly lower frequency)
    const radiusCorrection = 1 - (averageRadius * 0.1); // Empirical factor
    
    // Apply refined mouthpiece correction if segments are available
    let mouthpieceCorrection = this.MOUTH_IMPEDANCE_FACTOR;
    if (segments && segments.length > 0) {
      mouthpieceCorrection = this.calculateMouthpieceCorrection(segments);
    }
    
    baseFreq *= mouthpieceCorrection;
    
    return baseFreq * radiusCorrection;
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
    
    // Generate first 6 harmonics
    for (let n = 2; n <= 6; n++) {
      let harmonic = fundamental * n;
      
      // Apply taper corrections (tapered instruments have shifted harmonics)
      if (n > 1) {
        const taperShift = taperFactor * Math.log(n) * 0.05; // Empirical
        harmonic *= (1 + taperShift);
      }
      
      // Apply harmonic suppression for higher orders
      // Amplitude decreases with harmonic number - deterministic approach
      const amplitude = 1 / Math.sqrt(n);

      // Include harmonic if amplitude is significant enough (>20%)
      if (amplitude > 0.2) {
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
    // Process geometry into segments
    const segments = this.processGeometryForTMM(points);

    // Generate frequency range for analysis
    const frequencies = this.generateFrequencyRange();

    // Calculate impedance spectrum across all frequencies
    const impedanceSpectrum = this.calculateImpedanceSpectrum(segments, frequencies);

    // Find resonance peaks (harmonics)
    const resonances = this.findResonancePeaks(frequencies, impedanceSpectrum);

    // Convert resonances to musical notes
    const results = resonances.map((freq, index) => ({
      frequency: freq,
      harmonic: index + 1,
      ...this.frequencyToNote(freq),
      amplitude: this.calculateResonanceAmplitude(freq, impedanceSpectrum, frequencies),
      quality: this.assessResonanceQuality(freq, impedanceSpectrum, frequencies)
    }));

    // Calculate metadata
    const totalLength = points[points.length - 1].position / 100; // cm to m
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
   * Adds position information to each segment
   */
  processGeometryForTMM(points) {
    const segments = [];
    let currentPosition = 0;

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
        taperRatio: r2 / r1,
        startPosition: currentPosition,
        endPosition: currentPosition + length
      });

      currentPosition += length;
    }

    return segments;
  }

  /**
   * Generate frequency range for analysis
   * Uses variable resolution: 0.5 Hz for 30-100 Hz, 1 Hz for 100-1000 Hz
   */
  generateFrequencyRange() {
    const frequencies = [];

    // High resolution for low frequencies (30-100 Hz)
    for (let f = this.FREQ_RANGE_START; f < 100; f += this.FREQ_STEP_LOW) {
      frequencies.push(f);
    }

    // Standard resolution for higher frequencies (100-1000 Hz)
    for (let f = 100; f <= this.FREQ_RANGE_END; f += this.FREQ_STEP_HIGH) {
      frequencies.push(f);
    }

    return frequencies;
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
   */
  calculateImpedanceAtFrequency(segments, frequency) {
    // Start with identity matrix
    let M = { A: 1, B: 0, C: 0, D: 1 };

    // Multiply transfer matrices for all segments
    for (const segment of segments) {
      const segmentMatrix = this.calculateTransferMatrix(segment, frequency);
      M = this.multiplyTransferMatrices(M, segmentMatrix);
    }

    // Calculate radiation impedance at the bell (open end)
    const bellRadius = segments[segments.length - 1].r2;
    const Zrad = this.calculateRadiationImpedance(bellRadius, frequency);

    // Calculate input impedance: Zin = (Zrad * A + B) / (Zrad * C + D)
    const numerator = this.complexAdd(
      this.complexMultiply(Zrad, { real: M.A, imag: 0 }),
      { real: M.B, imag: 0 }
    );
    const denominator = this.complexAdd(
      this.complexMultiply(Zrad, { real: M.C, imag: 0 }),
      { real: M.D, imag: 0 }
    );

    const Zin = this.complexDivide(numerator, denominator);

    return {
      real: Zin.real,
      imag: Zin.imag,
      magnitude: Math.sqrt(Zin.real * Zin.real + Zin.imag * Zin.imag),
      phase: Math.atan2(Zin.imag, Zin.real)
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
   * Simplified Levine-Schwinger model
   */
  calculateRadiationImpedance(radius, frequency) {
    const k = (2 * Math.PI * frequency) / this.SPEED_OF_SOUND;
    const ka = k * radius;
    const S = Math.PI * radius * radius;
    const Zc = this.AIR_DENSITY * this.SPEED_OF_SOUND / S;

    // Real part (radiation resistance)
    const real = Zc * 0.25 * ka * ka;

    // Imaginary part (radiation reactance)
    const imag = Zc * 0.61 * ka;

    return { real, imag };
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
   * Peaks indicate frequencies where the instrument naturally resonates
   */
  findResonancePeaks(frequencies, impedanceSpectrum) {
    const peaks = [];
    const magnitudes = impedanceSpectrum.map(z => z.magnitude);
    const maxMagnitude = Math.max(...magnitudes);
    const threshold = maxMagnitude * this.RESONANCE_THRESHOLD;

    // Find local maxima above threshold
    for (let i = 1; i < magnitudes.length - 1; i++) {
      const current = magnitudes[i];
      const prev = magnitudes[i - 1];
      const next = magnitudes[i + 1];

      // Check if it's a local maximum
      if (current > prev && current > next && current > threshold) {
        peaks.push(frequencies[i]);
      }
    }

    // Limit to first 6 harmonics (most relevant for didgeridoo playing)
    return peaks.slice(0, 6);
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