import { audioEngine } from '../../services/audio/AudioEngine';

describe('AudioEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('initializes audio context', async () => {
      await audioEngine.initialize();
      expect(audioEngine.isInitialized).toBe(true);
    });

    test('handles multiple initialization calls', async () => {
      await audioEngine.initialize();
      await audioEngine.initialize();
      expect(audioEngine.isInitialized).toBe(true);
    });
  });

  describe('playFrequency', () => {
    beforeEach(async () => {
      await audioEngine.initialize();
    });

    test('plays valid frequency', async () => {
      await expect(audioEngine.playFrequency(440)).resolves.not.toThrow();
    });

    test('rejects invalid frequency (too low)', async () => {
      await expect(audioEngine.playFrequency(10)).rejects.toThrow();
    });

    test('rejects invalid frequency (too high)', async () => {
      await expect(audioEngine.playFrequency(25000)).rejects.toThrow();
    });

    test('handles negative frequency', async () => {
      await expect(audioEngine.playFrequency(-100)).rejects.toThrow();
    });
  });

  describe('playHarmonicSeries', () => {
    beforeEach(async () => {
      await audioEngine.initialize();
    });

    test('plays harmonic series correctly', async () => {
      const harmonics = [
        { frequency: 110, amplitude: 1.0 },
        { frequency: 220, amplitude: 0.5 },
        { frequency: 330, amplitude: 0.3 }
      ];

      await expect(audioEngine.playHarmonicSeries(harmonics)).resolves.not.toThrow();
    });

    test('handles empty harmonic array', async () => {
      await expect(audioEngine.playHarmonicSeries([])).rejects.toThrow();
    });

    test('validates harmonic data structure', async () => {
      const invalidHarmonics = [{ frequency: 110 }]; // missing amplitude
      await expect(audioEngine.playHarmonicSeries(invalidHarmonics)).rejects.toThrow();
    });
  });

  describe('stopPlayback', () => {
    test('stops playback safely', async () => {
      await audioEngine.initialize();
      await audioEngine.playFrequency(440);
      await expect(audioEngine.stopPlayback()).resolves.not.toThrow();
    });

    test('handles stop without playing', async () => {
      await expect(audioEngine.stopPlayback()).resolves.not.toThrow();
    });
  });

  describe('setVolume', () => {
    test('sets valid volume', () => {
      expect(() => audioEngine.setVolume(0.5)).not.toThrow();
    });

    test('clamps volume to valid range', () => {
      audioEngine.setVolume(1.5); // above max
      expect(audioEngine.getVolume()).toBe(1.0);

      audioEngine.setVolume(-0.5); // below min
      expect(audioEngine.getVolume()).toBe(0);
    });
  });

  describe('generateWaveform', () => {
    test('generates valid waveform for sine wave', () => {
      const waveform = audioEngine.generateWaveform(440, 'sine', 1.0);

      expect(waveform).toBeInstanceOf(Float32Array);
      expect(waveform.length).toBeGreaterThan(0);
    });

    test('handles different wave types', () => {
      const types = ['sine', 'square', 'sawtooth', 'triangle'];

      types.forEach(type => {
        const waveform = audioEngine.generateWaveform(440, type, 1.0);
        expect(waveform).toBeInstanceOf(Float32Array);
      });
    });
  });
});
