/**
 * Tuning Service - Manages tuning reference (A4 frequency)
 * Supports both 440Hz (standard) and 432Hz (alternative) tuning
 */

export class TuningService {
  constructor() {
    this.TUNING_OPTIONS = {
      STANDARD: { name: 'A4 = 440Hz (Padrão)', frequency: 440, key: 'standard' },
      ALTERNATIVE: { name: 'A4 = 432Hz (Alternativo)', frequency: 432, key: 'alternative' }
    };
    
    this.currentTuning = this.TUNING_OPTIONS.STANDARD;
    this.listeners = [];
  }

  /**
   * Get available tuning options
   */
  getTuningOptions() {
    return Object.values(this.TUNING_OPTIONS);
  }

  /**
   * Get current tuning
   */
  getCurrentTuning() {
    return this.currentTuning;
  }

  /**
   * Set tuning by key
   */
  setTuning(tuningKey) {
    const tuning = Object.values(this.TUNING_OPTIONS).find(t => t.key === tuningKey);
    if (tuning) {
      const oldTuning = this.currentTuning;
      this.currentTuning = tuning;
      
      console.log(`🎵 Tuning changed: ${oldTuning.name} → ${tuning.name}`);
      
      // Notify listeners
      this.listeners.forEach(listener => {
        try {
          listener(tuning, oldTuning);
        } catch (error) {
          console.warn('Tuning listener error:', error);
        }
      });
      
      return true;
    }
    return false;
  }

  /**
   * Get current A4 frequency
   */
  getA4Frequency() {
    return this.currentTuning.frequency;
  }

  /**
   * Add listener for tuning changes
   */
  addTuningChangeListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  }

  /**
   * Remove tuning change listener
   */
  removeTuningChangeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Convert frequency from one tuning to another
   */
  convertFrequency(frequency, fromTuning, toTuning) {
    if (fromTuning === toTuning) return frequency;
    
    const ratio = toTuning / fromTuning;
    return frequency * ratio;
  }

  /**
   * Get tuning ratio compared to standard 440Hz
   */
  getTuningRatio() {
    return this.currentTuning.frequency / 440;
  }
}

// Create singleton instance
export const tuningService = new TuningService();