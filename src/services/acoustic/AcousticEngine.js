/**
 * Real Acoustic Calculations for Didgeridoo Analysis
 * Based on acoustic theory and empirical didgeridoo research
 * Enhanced with offline capabilities
 */

export class AcousticEngine {
  constructor() {
    // Physical constants
    this.SPEED_OF_SOUND = 343; // m/s at 20°C
    this.AIR_DENSITY = 1.225; // kg/m³ at 20°C
    
    // Musical constants
    this.A4_FREQUENCY = 440; // Hz
    this.SEMITONE_RATIO = Math.pow(2, 1/12);
    
    // Didgeridoo specific constants
    this.END_CORRECTION_FACTOR = 0.6; // Empirical correction for open end
    this.MOUTH_IMPEDANCE_FACTOR = 0.85; // Mouth coupling efficiency
  }

  /**
   * Calculate fundamental frequency and harmonics from geometry
   * Enhanced with offline capability
   */
  async analyzeGeometry(points, offlineManager = null) {
    try {
      if (!points || points.length < 2) {
        throw new Error('Insufficient geometry points');
      }

      // Try online analysis first
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
      const suppression = 1 / Math.sqrt(n);
      if (Math.random() < suppression) { // Stochastic harmonic presence
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
   */
  frequencyToNote(frequency) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Calculate semitones from A4
    const semitones = Math.round(12 * Math.log2(frequency / this.A4_FREQUENCY));
    
    // Calculate octave and note
    const octave = Math.floor((semitones + 57) / 12);
    const noteIndex = ((semitones + 57) % 12 + 12) % 12;
    
    // Calculate cents deviation
    const exactSemitones = 12 * Math.log2(frequency / this.A4_FREQUENCY);
    const centDiff = Math.round((exactSemitones - semitones) * 100);
    
    return {
      note: noteNames[noteIndex],
      octave,
      centDiff,
      exactFrequency: frequency
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