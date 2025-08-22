import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';
import { localizationService } from '../i18n/LocalizationService';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize Web Audio API if available (web/desktop only)
      if (typeof window !== 'undefined' && window.AudioContext) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (webAudioError) {
          console.warn('Web Audio not available:', webAudioError);
        }
      }

      this.isInitialized = true;
      console.log('Audio engine initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      // Still mark as initialized for basic functionality
      this.isInitialized = true;
    }
  }

  async playDrone(frequency, duration = 3000, volume = 0.3, harmonics = []) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log(`🎵 Playing didgeridoo drone:`, {
        fundamental: `${frequency.toFixed(1)}Hz`,
        harmonics: harmonics.map(h => `${h.frequency.toFixed(1)}Hz`),
        duration: `${duration}ms`
      });
      
      if (this.audioContext) {
        this.stopAll();
        
        // Create fundamental frequency
        this.createOscillator(frequency, volume, duration);
        
        // Create harmonics
        harmonics.forEach((harmonic, index) => {
          const harmonicVolume = volume * harmonic.amplitude * (0.7 - index * 0.1); // Decreasing volume
          this.createOscillator(harmonic.frequency, harmonicVolume, duration);
        });
        
      } else {
        // Mobile: Generate synthetic tone using expo-audio
        await this.playMobileTone(frequency, duration, volume, harmonics);
      }
    } catch (error) {
      console.error('Error playing drone:', error);
    }
  }

  createOscillator(frequency, volume, duration) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Configure oscillator for didgeridoo-like sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Configure filter for warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    // Configure envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, this.audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(volume * 0.8, this.audioContext.currentTime + duration / 1000 - 0.5);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
    
    // Connect audio graph
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Start and schedule stop
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
    
    this.oscillators.push({ oscillator, gainNode, filter });
    
    // Add breathing effect
    this.addBreathingEffect(gainNode, duration / 1000);
  }

  async playMobileTone(frequency, duration, volume, harmonics) {
    try {
      console.log(`🎵 Mobile tone: ${frequency.toFixed(1)}Hz with ${harmonics.length} harmonics`);
      
      // For now, use a pre-generated tone sound or system beep
      // This is a simplified approach that should work reliably
      await this.playSystemBeep(frequency, duration);
      
    } catch (error) {
      console.warn('Mobile tone generation failed, using haptic fallback:', error);
      // Fallback to enhanced haptic feedback
      try {
        const pulseCount = Math.min(Math.floor(duration / 400), 8);
        for (let i = 0; i < pulseCount; i++) {
          setTimeout(async () => {
            await Haptics.impactAsync(
              i % 3 === 0 ? Haptics.ImpactFeedbackStyle.Heavy :
              i % 3 === 1 ? Haptics.ImpactFeedbackStyle.Medium : 
              Haptics.ImpactFeedbackStyle.Light
            );
          }, i * 400);
        }
      } catch (hapticError) {
        console.log('Haptic feedback not available');
      }
    }
  }

  async playSystemBeep(frequency, duration) {
    try {
      console.log(`🎵 Haptic drone simulation: ${frequency.toFixed(1)}Hz for ${duration}ms`);
      
      // Initial notification
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Create rhythm pattern based on frequency
      const isLow = frequency < 100;
      const isMid = frequency >= 100 && frequency < 200;
      const isHigh = frequency >= 200;
      
      // Different patterns for different frequency ranges
      let pattern = [];
      let intervals = [];
      
      if (isLow) {
        // Low frequencies: slow, heavy pulses
        pattern = [
          Haptics.ImpactFeedbackStyle.Heavy,
          Haptics.ImpactFeedbackStyle.Heavy,
          Haptics.ImpactFeedbackStyle.Medium,
          Haptics.ImpactFeedbackStyle.Heavy
        ];
        intervals = [0, 600, 1200, 1800];
      } else if (isMid) {
        // Mid frequencies: medium rhythm
        pattern = [
          Haptics.ImpactFeedbackStyle.Medium,
          Haptics.ImpactFeedbackStyle.Medium,
          Haptics.ImpactFeedbackStyle.Light,
          Haptics.ImpactFeedbackStyle.Medium,
          Haptics.ImpactFeedbackStyle.Medium
        ];
        intervals = [0, 400, 800, 1200, 1600];
      } else {
        // High frequencies: faster, lighter pulses
        pattern = [
          Haptics.ImpactFeedbackStyle.Light,
          Haptics.ImpactFeedbackStyle.Light,
          Haptics.ImpactFeedbackStyle.Light,
          Haptics.ImpactFeedbackStyle.Medium,
          Haptics.ImpactFeedbackStyle.Light,
          Haptics.ImpactFeedbackStyle.Light
        ];
        intervals = [0, 250, 500, 750, 1000, 1250];
      }
      
      // Execute pattern
      for (let i = 0; i < pattern.length; i++) {
        setTimeout(async () => {
          try {
            await Haptics.impactAsync(pattern[i]);
          } catch (error) {
            console.warn(`Haptic ${i} failed:`, error);
          }
        }, intervals[i]);
      }
      
      // Show frequency info to user
      setTimeout(() => {
        const description = isLow ? localizationService.t('lowFreq') : 
                           isMid ? localizationService.t('midFreq') : 
                           localizationService.t('highFreq');
        
        Alert.alert(
          localizationService.t('playingDrone'),
          `${localizationService.t('frequencyLabel')}: ${frequency.toFixed(1)}Hz\n${localizationService.t('noteLabel')}: ${this.frequencyToNote(frequency)}\n\n${description}`,
          [{ text: localizationService.t('ok') }],
          { cancelable: true }
        );
      }, 100);
      
    } catch (error) {
      console.warn('System beep failed:', error);
      throw error;
    }
  }

  frequencyToNote(frequency) {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const semitones = Math.round(12 * Math.log2(frequency / A4));
    const octave = Math.floor(semitones / 12) + 4;
    const noteIndex = ((semitones % 12) + 12) % 12;
    
    return `${noteNames[noteIndex]}${octave}`;
  }


  async playHarmonics(frequencies, duration = 2000, volume = 0.2) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (this.audioContext) {
        this.stopAll();
        
        frequencies.slice(1, 6).forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            
            const harmVolume = volume / (index + 1);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(harmVolume, this.audioContext.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(harmVolume * 0.4, this.audioContext.currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.8);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.8);
            
            this.oscillators.push({ oscillator, gainNode });
          }, index * 300);
        });
      } else {
        console.log(`🎺 Harmônicos: ${frequencies.slice(1, 6).map(f => Math.round(f)).join(', ')} Hz`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error playing harmonics:', error);
    }
  }

  async playFullSpectrum(frequencies, duration = 4000, volume = 0.25) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      if (this.audioContext) {
        this.stopAll();
        
        frequencies.forEach((freq, index) => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.type = index === 0 ? 'sawtooth' : 'sine';
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          
          const harmVolume = index === 0 ? volume : volume * 0.4 / (index + 1);
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(harmVolume, this.audioContext.currentTime + 0.2);
          gainNode.gain.linearRampToValueAtTime(harmVolume * 0.8, this.audioContext.currentTime + 0.5);
          gainNode.gain.setValueAtTime(harmVolume * 0.8, this.audioContext.currentTime + duration / 1000 - 0.3);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + duration / 1000);
          
          this.oscillators.push({ oscillator, gainNode });
        });
      } else {
        console.log(`🎼 Espectro Completo: ${frequencies.length} frequências`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      console.error('Error playing full spectrum:', error);
    }
  }

  addBreathingEffect(gainNode, duration) {
    if (!this.audioContext) return;
    
    const breathingRate = 0.3; // Hz
    const breathingDepth = 0.2;
    
    for (let t = 0; t < duration; t += 0.1) {
      const time = this.audioContext.currentTime + t;
      const breathing = 1 + breathingDepth * Math.sin(2 * Math.PI * breathingRate * t);
      gainNode.gain.setValueAtTime(
        gainNode.gain.value * breathing,
        time
      );
    }
  }

  stopAll() {
    this.oscillators.forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    this.oscillators = [];
  }

  async playTrombetas(notes, noteDuration = 800, volume = 0.4) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log(`🎺 Playing trombetas sequence:`, {
        notes: notes.map(note => `${note.note}${note.octave}`),
        noteDuration: `${noteDuration}ms`,
        totalDuration: `${notes.length * noteDuration}ms`
      });
      
      if (this.audioContext) {
        this.stopAll();
        
        // Play each note in sequence
        notes.forEach((noteData, index) => {
          const startTime = this.audioContext.currentTime + (index * noteDuration / 1000);
          this.createNoteOscillator(noteData.frequency, volume, noteDuration, startTime);
        });
        
      } else {
        // Mobile fallback - play each note with delay
        for (let i = 0; i < notes.length; i++) {
          setTimeout(async () => {
            await this.playMobileTone(notes[i].frequency, noteDuration, volume, []);
          }, i * noteDuration);
        }
      }
      
    } catch (error) {
      console.warn('Trombetas playback failed:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async playHarmonicsSequence(harmonics, noteDuration = 1000, volume = 0.5) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log(`🎵 Playing harmonics sequence:`, {
        harmonics: harmonics.map(h => `${h.note} ${h.frequency.toFixed(0)}Hz`),
        noteDuration: `${noteDuration}ms`,
        totalDuration: `${harmonics.length * noteDuration}ms`
      });
      
      if (this.audioContext) {
        this.stopAll();
        
        // Play each harmonic in sequence
        harmonics.forEach((harmonic, index) => {
          const startTime = this.audioContext.currentTime + (index * noteDuration / 1000);
          // Use a sine wave for cleaner harmonic tones
          this.createHarmonicOscillator(harmonic.frequency, volume, noteDuration, startTime);
        });
        
      } else {
        // Mobile fallback - play each harmonic with delay
        for (let i = 0; i < harmonics.length; i++) {
          setTimeout(async () => {
            await this.playMobileTone(harmonics[i].frequency, noteDuration, volume, []);
          }, i * noteDuration);
        }
      }
      
    } catch (error) {
      console.warn('Harmonics sequence playback failed:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  createNoteOscillator(frequency, volume, duration, startTime = null) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Configure oscillator for trumpet-like sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime || this.audioContext.currentTime);
    
    // Configure filter for brass instrument character
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency * 1.5, startTime || this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, startTime || this.audioContext.currentTime);
    
    // Quick attack and decay for trumpet articulation
    const start = startTime || this.audioContext.currentTime;
    const end = start + duration / 1000;
    
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(volume, start + 0.05); // Quick attack
    gainNode.gain.setValueAtTime(volume * 0.9, start + 0.1);
    gainNode.gain.setValueAtTime(volume * 0.8, end - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, end); // Quick release
    
    // Connect audio graph
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Start and schedule stop
    oscillator.start(start);
    oscillator.stop(end);
    
    this.oscillators.push({ oscillator, gainNode, filter });
  }

  createHarmonicOscillator(frequency, volume, duration, startTime = null) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Configure oscillator for pure harmonic tone
    oscillator.type = 'sine'; // Pure sine wave for clean harmonics
    oscillator.frequency.setValueAtTime(frequency, startTime || this.audioContext.currentTime);
    
    // Smooth envelope for harmonic sequence
    const start = startTime || this.audioContext.currentTime;
    const end = start + duration / 1000;
    
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(volume, start + 0.1); // Gentle attack
    gainNode.gain.setValueAtTime(volume * 0.9, end - 0.2);
    gainNode.gain.linearRampToValueAtTime(0, end); // Gentle release
    
    // Connect audio graph
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Start and schedule stop
    oscillator.start(start);
    oscillator.stop(end);
    
    this.oscillators.push({ oscillator, gainNode });
  }

  setVolume(volume) {
    // Store volume for future use
    this.volume = volume;
  }
}

// Create singleton instance
export const audioEngine = new AudioEngine();