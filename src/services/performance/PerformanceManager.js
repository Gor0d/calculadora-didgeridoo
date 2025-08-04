import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class PerformanceManager {
  static STORAGE_KEY = '@didgemap_performance_settings';
  
  static deviceTiers = {
    HIGH: 'high',
    MEDIUM: 'medium', 
    LOW: 'low'
  };

  static settings = {
    enableAnimations: true,
    enableHaptics: true,
    enableBackgroundProcessing: true,
    maxCacheSize: 50, // MB
    renderQuality: 'high', // high, medium, low
    autoOptimize: true,
    debounceDelay: 300,
    throttleDelay: 100,
    enablePreloading: true,
    enableMemoryOptimization: true
  };

  static async initializePerformanceOptimization() {
    try {
      // Load saved settings
      const savedSettings = await this.loadSettings();
      this.settings = { ...this.settings, ...savedSettings };

      // Detect device performance tier
      const deviceTier = await this.detectDevicePerformance();
      
      // Auto-optimize based on device
      if (this.settings.autoOptimize) {
        await this.optimizeForDevice(deviceTier);
      }

      // Initialize memory monitoring
      this.startMemoryMonitoring();

      return {
        settings: this.settings,
        deviceTier,
        optimizationsApplied: this.settings.autoOptimize
      };
    } catch (error) {
      console.error('Performance initialization error:', error);
      return { settings: this.settings, deviceTier: 'medium', optimizationsApplied: false };
    }
  }

  static async detectDevicePerformance() {
    try {
      // Use memory and processing indicators to determine tier
      const memoryInfo = await this.getMemoryInfo();
      const processingSpeed = await this.measureProcessingSpeed();
      
      if (memoryInfo.availableMemory > 4000 && processingSpeed > 50) {
        return this.deviceTiers.HIGH;
      } else if (memoryInfo.availableMemory > 2000 && processingSpeed > 25) {
        return this.deviceTiers.MEDIUM;
      } else {
        return this.deviceTiers.LOW;
      }
    } catch (error) {
      console.error('Device detection error:', error);
      return this.deviceTiers.MEDIUM; // Safe default
    }
  }

  static async getMemoryInfo() {
    // Mock implementation - in real app would use native modules
    return {
      totalMemory: Platform.OS === 'ios' ? 6000 : 4000, // MB
      availableMemory: Platform.OS === 'ios' ? 3000 : 2000, // MB
      usedMemory: Platform.OS === 'ios' ? 3000 : 2000 // MB
    };
  }

  static async measureProcessingSpeed() {
    const start = Date.now();
    
    // Perform calculation-intensive task
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    
    const duration = Date.now() - start;
    return Math.max(1, 100 - duration); // Higher score = better performance
  }

  static async optimizeForDevice(deviceTier) {
    const optimizations = {
      [this.deviceTiers.HIGH]: {
        enableAnimations: true,
        enableHaptics: true,
        enableBackgroundProcessing: true,
        maxCacheSize: 100,
        renderQuality: 'high',
        debounceDelay: 150,
        throttleDelay: 50,
        enablePreloading: true,
        enableMemoryOptimization: false
      },
      [this.deviceTiers.MEDIUM]: {
        enableAnimations: true,
        enableHaptics: true,
        enableBackgroundProcessing: true,
        maxCacheSize: 50,
        renderQuality: 'medium',
        debounceDelay: 300,
        throttleDelay: 100,
        enablePreloading: true,
        enableMemoryOptimization: true
      },
      [this.deviceTiers.LOW]: {
        enableAnimations: false,
        enableHaptics: false,
        enableBackgroundProcessing: false,
        maxCacheSize: 25,
        renderQuality: 'low',
        debounceDelay: 500,
        throttleDelay: 200,
        enablePreloading: false,
        enableMemoryOptimization: true
      }
    };

    this.settings = { ...this.settings, ...optimizations[deviceTier] };
    await this.saveSettings();
  }

  static createOptimizedDebounce(func, delay = null) {
    const actualDelay = delay || this.settings.debounceDelay;
    let timeoutId;
    
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), actualDelay);
    };
  }

  static createOptimizedThrottle(func, delay = null) {
    const actualDelay = delay || this.settings.throttleDelay;
    let lastRun = 0;
    
    return function (...args) {
      const now = Date.now();
      if (now - lastRun >= actualDelay) {
        func.apply(this, args);
        lastRun = now;
      }
    };
  }

  static startMemoryMonitoring() {
    if (!this.settings.enableMemoryOptimization) return;

    // Check memory usage every 30 seconds
    this.memoryMonitorInterval = setInterval(async () => {
      try {
        const memoryInfo = await this.getMemoryInfo();
        const memoryUsage = (memoryInfo.usedMemory / memoryInfo.totalMemory) * 100;
        
        if (memoryUsage > 80) {
          this.triggerMemoryCleanup();
        }
      } catch (error) {
        console.error('Memory monitoring error:', error);
      }
    }, 30000);
  }

  static triggerMemoryCleanup() {
    try {
      // Clear old cache entries
      this.clearOldCacheEntries();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      console.log('Memory cleanup performed');
    } catch (error) {
      console.error('Memory cleanup error:', error);
    }
  }

  static clearOldCacheEntries() {
    // Implementation would clear cached calculations, images, etc.
    console.log('Clearing old cache entries');
  }

  static optimizeImageRendering(quality = null) {
    const renderQuality = quality || this.settings.renderQuality;
    
    return {
      high: { resizeMode: 'contain', quality: 1.0 },
      medium: { resizeMode: 'contain', quality: 0.8 },
      low: { resizeMode: 'contain', quality: 0.6 }
    }[renderQuality];
  }

  static optimizeAnimationConfig(baseConfig) {
    if (!this.settings.enableAnimations) {
      return { duration: 0 };
    }

    const speedMultiplier = {
      high: 1.0,
      medium: 0.8,
      low: 0.5
    }[this.settings.renderQuality] || 1.0;

    return {
      ...baseConfig,
      duration: (baseConfig.duration || 300) * speedMultiplier
    };
  }

  static shouldEnableFeature(featureName) {
    const featureMap = {
      animations: this.settings.enableAnimations,
      haptics: this.settings.enableHaptics,
      backgroundProcessing: this.settings.enableBackgroundProcessing,
      preloading: this.settings.enablePreloading
    };

    return featureMap[featureName] ?? true;
  }

  static async updateSetting(key, value) {
    this.settings[key] = value;
    await this.saveSettings();
  }

  static async loadSettings() {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading performance settings:', error);
      return {};
    }
  }

  static async saveSettings() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving performance settings:', error);
    }
  }

  static async resetToDefaults() {
    this.settings = {
      enableAnimations: true,
      enableHaptics: true,
      enableBackgroundProcessing: true,
      maxCacheSize: 50,
      renderQuality: 'high',
      autoOptimize: true,
      debounceDelay: 300,
      throttleDelay: 100,
      enablePreloading: true,
      enableMemoryOptimization: true
    };
    
    await this.saveSettings();
    return this.settings;
  }

  static cleanup() {
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }
  }

  static getPerformanceStats() {
    return {
      settings: this.settings,
      memoryMonitoring: !!this.memoryMonitorInterval,
      optimizationsActive: this.settings.autoOptimize
    };
  }
}