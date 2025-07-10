import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Initialize Web Audio API if available
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      this.isInitialized = true;
      console.log('Audio engine initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async playDrone(frequency, duration = 3000, volume = 0.3) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (this.audioContext) {
        this.stopAll();
        
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
      } else {
        // Fallback notification
        console.log(`Playing drone: ${frequency} Hz for ${duration}ms`);
      }
    } catch (error) {
      console.error('Error playing drone:', error);
    }
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
        console.log(`Playing harmonics: ${frequencies.join(', ')} Hz`);
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
        console.log(`Playing full spectrum: ${frequencies.length} frequencies`);
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

  setVolume(volume) {
    // Store volume for future use
    this.volume = volume;
  }
}

// Create singleton instance
export const audioEngine = new AudioEngine();