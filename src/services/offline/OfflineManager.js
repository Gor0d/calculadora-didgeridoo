import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const OFFLINE_DATA_KEY = '@didgemap_offline_data';
const CACHE_VERSION_KEY = '@didgemap_cache_version';
const USER_PREFERENCES_KEY = '@didgemap_user_preferences';
const OFFLINE_CACHE_DIR = FileSystem.documentDirectory + 'cache/';

const CURRENT_CACHE_VERSION = '1.0.0';

// Default offline data
const DEFAULT_OFFLINE_DATA = {
  acousticTables: {
    frequencyMaps: {},
    impedanceProfiles: {},
    harmonicSeries: {}
  },
  geometryTemplates: [
    {
      id: 'traditional',
      name: 'Tradicional',
      geometry: '0.00 0.030\n0.20 0.035\n0.50 0.045\n1.00 0.060\n1.50 0.080',
      category: 'tradicional'
    },
    {
      id: 'bell',
      name: 'Campana',
      geometry: '0.00 0.030\n0.50 0.035\n1.00 0.045\n1.30 0.065\n1.50 0.090',
      category: 'bell'
    },
    {
      id: 'straight',
      name: 'Reto',
      geometry: '0.00 0.040\n0.50 0.040\n1.00 0.040\n1.50 0.040',
      category: 'straight'
    },
    {
      id: 'conical',
      name: 'Cônico',
      geometry: '0.00 0.025\n0.30 0.035\n0.60 0.045\n0.90 0.055\n1.20 0.065\n1.50 0.075',
      category: 'conical'
    }
  ],
  soundSpeedProfiles: {
    standard: { temperature: 20, humidity: 50, pressure: 1013, speed: 343 },
    hot: { temperature: 30, humidity: 60, pressure: 1013, speed: 349 },
    cold: { temperature: 0, humidity: 40, pressure: 1013, speed: 331 },
    highAltitude: { temperature: 20, humidity: 30, pressure: 850, speed: 335 }
  },
  materialProperties: {
    wood: { density: 600, youngModulus: 12000, dampingFactor: 0.02 },
    bamboo: { density: 400, youngModulus: 20000, dampingFactor: 0.015 },
    pvc: { density: 1400, youngModulus: 3000, dampingFactor: 0.05 },
    carbon: { density: 1600, youngModulus: 230000, dampingFactor: 0.005 }
  },
  noteFrequencies: {
    'C': [65.41, 130.81, 261.63, 523.25, 1046.50],
    'C#': [69.30, 138.59, 277.18, 554.37, 1108.73],
    'D': [73.42, 146.83, 293.66, 587.33, 1174.66],
    'D#': [77.78, 155.56, 311.13, 622.25, 1244.51],
    'E': [82.41, 164.81, 329.63, 659.25, 1318.51],
    'F': [87.31, 174.61, 349.23, 698.46, 1396.91],
    'F#': [92.50, 185.00, 369.99, 739.99, 1479.98],
    'G': [98.00, 196.00, 392.00, 783.99, 1567.98],
    'G#': [103.83, 207.65, 415.30, 830.61, 1661.22],
    'A': [110.00, 220.00, 440.00, 880.00, 1760.00],
    'A#': [116.54, 233.08, 466.16, 932.33, 1864.66],
    'B': [123.47, 246.94, 493.88, 987.77, 1975.53]
  }
};

export class OfflineManager {
  static isOfflineMode = false;
  static offlineData = null;

  // Inicialização do modo offline
  static async initialize() {
    try {
      // Verificar se o diretório de cache existe
      const cacheInfo = await FileSystem.getInfoAsync(OFFLINE_CACHE_DIR);
      if (!cacheInfo.exists) {
        await FileSystem.makeDirectoryAsync(OFFLINE_CACHE_DIR, { intermediates: true });
      }

      // Verificar versão do cache
      const cacheVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);
      const shouldUpdateCache = !cacheVersion || cacheVersion !== CURRENT_CACHE_VERSION;

      if (shouldUpdateCache) {
        await this.updateOfflineCache();
      }

      // Carregar dados offline
      await this.loadOfflineData();
      
      console.log('OfflineManager initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing offline manager:', error);
      // Usar dados padrão em caso de erro
      this.offlineData = DEFAULT_OFFLINE_DATA;
      return false;
    }
  }

  // Atualizar cache offline
  static async updateOfflineCache() {
    try {
      console.log('Updating offline cache...');
      
      // Salvar dados padrão
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(DEFAULT_OFFLINE_DATA));
      
      // Gerar tabelas de frequência pré-calculadas
      await this.generateFrequencyTables();
      
      // Atualizar versão do cache
      await AsyncStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      
      console.log('Offline cache updated successfully');
    } catch (error) {
      console.error('Error updating offline cache:', error);
      throw error;
    }
  }

  // Gerar tabelas de frequência pré-calculadas para performance
  static async generateFrequencyTables() {
    try {
      const frequencyMaps = {};
      
      // Gerar mapas para diferentes comprimentos comuns
      const commonLengths = [1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0];
      const soundSpeeds = [331, 343, 349]; // Frio, normal, quente
      
      for (const length of commonLengths) {
        for (const speed of soundSpeeds) {
          const key = `${length}_${speed}`;
          frequencyMaps[key] = this.calculateHarmonicSeries(speed, length);
        }
      }
      
      // Salvar no cache
      const offlineData = await this.getOfflineData();
      offlineData.acousticTables.frequencyMaps = frequencyMaps;
      
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Error generating frequency tables:', error);
    }
  }

  // Calcular série harmônica offline
  static calculateHarmonicSeries(soundSpeed, length, maxHarmonics = 12) {
    const harmonics = [];
    
    for (let n = 1; n <= maxHarmonics; n++) {
      const harmonicOrder = 2 * n - 1; // 1, 3, 5, 7, etc.
      const frequency = (soundSpeed / (4 * length)) * harmonicOrder;
      
      if (frequency >= 20 && frequency <= 2000) {
        const noteInfo = this.getClosestNote(frequency);
        harmonics.push({
          harmonic: n,
          order: harmonicOrder,
          frequency: frequency,
          note: noteInfo.note,
          octave: noteInfo.octave,
          centDiff: noteInfo.centDiff,
          amplitude: this.calculateAmplitude(n)
        });
      }
    }
    
    return harmonics;
  }

  // Calcular amplitude estimada do harmônico
  static calculateAmplitude(harmonicNumber) {
    // Modelo simplificado: amplitude decresce com o número do harmônico
    return Math.max(0.1, 1.0 / Math.sqrt(harmonicNumber));
  }

  // Encontrar nota mais próxima offline
  static getClosestNote(frequency) {
    if (!this.offlineData?.noteFrequencies) {
      // Fallback calculation
      const A4 = 440.0;
      const noteNumber = Math.round(12 * Math.log2(frequency / A4));
      const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
      const noteName = noteNames[((noteNumber % 12) + 12) % 12];
      const octave = Math.floor(noteNumber / 12) + 4;
      const exactFreq = A4 * Math.pow(2, noteNumber / 12);
      const centDiff = 1200 * Math.log2(frequency / exactFreq);
      
      return {
        note: noteName,
        octave: octave,
        centDiff: Math.round(centDiff * 10) / 10
      };
    }

    const noteFreqs = this.offlineData.noteFrequencies;
    let closestNote = 'C';
    let closestOctave = 4;
    let minDiff = Infinity;

    Object.entries(noteFreqs).forEach(([noteName, frequencies]) => {
      frequencies.forEach((freq, octaveIndex) => {
        const diff = Math.abs(frequency - freq);
        if (diff < minDiff) {
          minDiff = diff;
          closestNote = noteName;
          closestOctave = octaveIndex + 1;
        }
      });
    });

    const exactFreq = noteFreqs[closestNote][closestOctave - 1];
    const centDiff = exactFreq ? 1200 * Math.log2(frequency / exactFreq) : 0;

    return {
      note: closestNote,
      octave: closestOctave,
      centDiff: Math.round(centDiff * 10) / 10
    };
  }

  // Carregar dados offline do AsyncStorage
  static async loadOfflineData() {
    try {
      const dataJson = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      if (dataJson) {
        this.offlineData = JSON.parse(dataJson);
      } else {
        this.offlineData = DEFAULT_OFFLINE_DATA;
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
      this.offlineData = DEFAULT_OFFLINE_DATA;
    }
  }

  // Obter dados offline
  static async getOfflineData() {
    if (!this.offlineData) {
      await this.loadOfflineData();
    }
    return this.offlineData;
  }

  // Análise acústica offline
  static async analyzeGeometryOffline(geometryPoints) {
    try {
      if (!geometryPoints || geometryPoints.length < 2) {
        throw new Error('Geometria inválida');
      }

      // Calcular comprimento efetivo
      const totalLength = geometryPoints[geometryPoints.length - 1].position / 100; // cm to m
      
      // Calcular raio médio
      const avgDiameter = geometryPoints.reduce((sum, p) => sum + p.diameter, 0) / geometryPoints.length;
      const avgRadius = avgDiameter / 2000; // mm to m
      
      // Calcular volume interno aproximado
      let volume = 0;
      for (let i = 1; i < geometryPoints.length; i++) {
        const prev = geometryPoints[i - 1];
        const curr = geometryPoints[i];
        const length = (curr.position - prev.position) / 100; // cm to m
        const avgDiam = (prev.diameter + curr.diameter) / 2000; // mm to m
        const radius = avgDiam / 2;
        volume += Math.PI * radius * radius * length;
      }

      // Usar velocidade do som padrão ou da configuração
      const soundSpeed = 343; // m/s

      // Verificar cache de frequências
      const cacheKey = `${totalLength.toFixed(1)}_${soundSpeed}`;
      const offlineData = await this.getOfflineData();
      
      let harmonics;
      if (offlineData.acousticTables.frequencyMaps[cacheKey]) {
        harmonics = offlineData.acousticTables.frequencyMaps[cacheKey];
      } else {
        // Calcular em tempo real
        harmonics = this.calculateHarmonicSeries(soundSpeed, totalLength);
      }

      // Aplicar correções baseadas na geometria
      const correctedHarmonics = this.applyGeometryCorrections(harmonics, geometryPoints);

      // Metadata adicional
      const metadata = {
        effectiveLength: totalLength * 100, // em cm
        averageRadius: avgRadius * 1000, // em mm
        volume: volume * 1000000, // em cm³
        isOfflineCalculation: true,
        calculationMethod: 'offline_simplified',
        soundSpeed: soundSpeed,
        timestamp: new Date().toISOString()
      };

      return {
        results: correctedHarmonics,
        metadata: metadata
      };

    } catch (error) {
      console.error('Error in offline analysis:', error);
      throw error;
    }
  }

  // Aplicar correções baseadas na geometria específica
  static applyGeometryCorrections(harmonics, geometryPoints) {
    return harmonics.map((harmonic, index) => {
      // Fator de correção baseado na variação do diâmetro
      const diameters = geometryPoints.map(p => p.diameter);
      const minDiameter = Math.min(...diameters);
      const maxDiameter = Math.max(...diameters);
      const expansionRatio = maxDiameter / minDiameter;
      
      // Correção da frequência baseada na expansão
      const frequencyCorrection = 1.0 - (expansionRatio - 1.0) * 0.05;
      const correctedFrequency = harmonic.frequency * frequencyCorrection;
      
      // Correção da amplitude baseada no harmônico
      const amplitudeCorrection = Math.exp(-0.1 * index);
      const correctedAmplitude = harmonic.amplitude * amplitudeCorrection;
      
      // Recalcular nota com frequência corrigida
      const noteInfo = this.getClosestNote(correctedFrequency);
      
      return {
        ...harmonic,
        frequency: correctedFrequency,
        amplitude: correctedAmplitude,
        note: noteInfo.note,
        octave: noteInfo.octave,
        centDiff: noteInfo.centDiff
      };
    });
  }

  // Verificar conectividade
  static async checkConnectivity() {
    try {
      // Tentar fazer uma requisição simples
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        timeout: 3000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Alternar modo offline
  static async setOfflineMode(enabled) {
    this.isOfflineMode = enabled;
    await AsyncStorage.setItem('@didgemap_offline_mode', JSON.stringify(enabled));
    
    if (enabled && !this.offlineData) {
      await this.initialize();
    }
  }

  // Verificar se está em modo offline
  static async isOffline() {
    try {
      const offlineModeJson = await AsyncStorage.getItem('@didgemap_offline_mode');
      const manualOfflineMode = offlineModeJson ? JSON.parse(offlineModeJson) : false;
      
      if (manualOfflineMode) {
        return true;
      }
      
      // Verificar conectividade automaticamente
      const hasConnection = await this.checkConnectivity();
      return !hasConnection;
    } catch (error) {
      return true; // Assumir offline em caso de erro
    }
  }

  // Obter configurações do usuário
  static async getUserPreferences() {
    try {
      const prefsJson = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      return prefsJson ? JSON.parse(prefsJson) : {
        preferredUnit: 'metric',
        defaultSoundSpeed: 343,
        autoOfflineMode: true,
        cacheLevel: 'normal'
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {};
    }
  }

  // Salvar configurações do usuário
  static async saveUserPreferences(preferences) {
    try {
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  // Limpar cache offline
  static async clearCache() {
    try {
      await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
      await AsyncStorage.removeItem(CACHE_VERSION_KEY);
      
      // Limpar diretório de cache
      const cacheInfo = await FileSystem.getInfoAsync(OFFLINE_CACHE_DIR);
      if (cacheInfo.exists) {
        await FileSystem.deleteAsync(OFFLINE_CACHE_DIR);
      }
      
      console.log('Offline cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Obter status do sistema offline
  static async getStatus() {
    const isOfflineMode = await this.isOffline();
    const cacheVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);
    const preferences = await this.getUserPreferences();
    
    const cacheInfo = await FileSystem.getInfoAsync(OFFLINE_CACHE_DIR);
    let cacheSize = 0;
    if (cacheInfo.exists) {
      try {
        const files = await FileSystem.readDirectoryAsync(OFFLINE_CACHE_DIR);
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(OFFLINE_CACHE_DIR + file);
          cacheSize += fileInfo.size || 0;
        }
      } catch (error) {
        console.warn('Error calculating cache size:', error);
      }
    }

    return {
      isOffline: isOfflineMode,
      cacheVersion: cacheVersion || 'none',
      currentVersion: CURRENT_CACHE_VERSION,
      cacheSize: Math.round(cacheSize / 1024), // KB
      hasOfflineData: !!this.offlineData,
      preferences
    };
  }
}