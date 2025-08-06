import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../logging/Logger';

/**
 * User Preferences Manager
 * Handles all user-configurable settings
 */
class UserPreferences {
  constructor() {
    this.STORAGE_KEY = '@didgemap_user_preferences';
    this.defaultSettings = {
      // Tips & Tutorial
      showDailyTips: false, // Changed to false by default
      tipFrequency: 'never', // 'never', 'daily', 'weekly'
      showTutorialOverlays: true,
      
      // UI Preferences
      theme: 'light', // 'light', 'dark', 'auto'
      colorScheme: 'green', // 'green', 'blue', 'purple'
      animations: true,
      hapticFeedback: true,
      
      // Audio & Analysis
      autoCalculate: true,
      showAdvancedMetrics: false,
      audioPreview: true,
      measurementUnit: 'mm', // 'mm', 'cm', 'inches'
      
      // Performance
      enablePerformanceMode: false,
      cacheResults: true,
      backgroundSync: true,
      
      // Privacy
      crashReporting: true,
      analyticsOptIn: false,
      
      // Accessibility
      largeText: false,
      highContrast: false,
      reduceMotion: false
    };
    
    this.currentSettings = { ...this.defaultSettings };
    this.isInitialized = false;
  }

  /**
   * Initialize user preferences from storage
   */
  async initialize() {
    if (this.isInitialized) return this.currentSettings;

    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        this.currentSettings = {
          ...this.defaultSettings,
          ...parsedSettings
        };
        logger.info('User preferences loaded', { preferences: Object.keys(this.currentSettings) });
      } else {
        logger.info('Using default user preferences');
        await this.save(); // Save defaults
      }
      
      this.isInitialized = true;
      return this.currentSettings;
    } catch (error) {
      logger.error('Failed to load user preferences', error);
      this.currentSettings = { ...this.defaultSettings };
      this.isInitialized = true;
      return this.currentSettings;
    }
  }

  /**
   * Get all current settings
   */
  getAll() {
    return { ...this.currentSettings };
  }

  /**
   * Get specific setting
   */
  get(key) {
    return this.currentSettings[key] ?? this.defaultSettings[key];
  }

  /**
   * Set specific setting
   */
  async set(key, value) {
    try {
      this.currentSettings[key] = value;
      await this.save();
      logger.info(`User preference updated: ${key} = ${value}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update preference ${key}`, error);
      return false;
    }
  }

  /**
   * Set multiple settings at once
   */
  async setMultiple(settings) {
    try {
      this.currentSettings = {
        ...this.currentSettings,
        ...settings
      };
      await this.save();
      logger.info('Multiple preferences updated', { keys: Object.keys(settings) });
      return true;
    } catch (error) {
      logger.error('Failed to update multiple preferences', error);
      return false;
    }
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults() {
    try {
      this.currentSettings = { ...this.defaultSettings };
      await this.save();
      logger.info('User preferences reset to defaults');
      return true;
    } catch (error) {
      logger.error('Failed to reset preferences', error);
      return false;
    }
  }

  /**
   * Reset specific category
   */
  async resetCategory(category) {
    try {
      const categoryKeys = this.getCategoryKeys(category);
      categoryKeys.forEach(key => {
        this.currentSettings[key] = this.defaultSettings[key];
      });
      await this.save();
      logger.info(`Preferences category '${category}' reset`, { keys: categoryKeys });
      return true;
    } catch (error) {
      logger.error(`Failed to reset category ${category}`, error);
      return false;
    }
  }

  /**
   * Get keys for specific category
   */
  getCategoryKeys(category) {
    const categories = {
      tips: ['showDailyTips', 'tipFrequency', 'showTutorialOverlays'],
      ui: ['theme', 'colorScheme', 'animations', 'hapticFeedback'],
      audio: ['autoCalculate', 'showAdvancedMetrics', 'audioPreview', 'measurementUnit'],
      performance: ['enablePerformanceMode', 'cacheResults', 'backgroundSync'],
      privacy: ['crashReporting', 'analyticsOptIn'],
      accessibility: ['largeText', 'highContrast', 'reduceMotion']
    };
    return categories[category] || [];
  }

  /**
   * Save settings to storage
   */
  async save() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSettings));
      return true;
    } catch (error) {
      logger.error('Failed to save user preferences', error);
      return false;
    }
  }

  /**
   * Export settings for backup
   */
  export() {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      preferences: this.currentSettings
    };
  }

  /**
   * Import settings from backup
   */
  async import(exportData) {
    try {
      if (!exportData || !exportData.preferences) {
        throw new Error('Invalid export data');
      }

      const importedSettings = {
        ...this.defaultSettings,
        ...exportData.preferences
      };

      this.currentSettings = importedSettings;
      await this.save();
      logger.info('User preferences imported successfully');
      return true;
    } catch (error) {
      logger.error('Failed to import preferences', error);
      return false;
    }
  }

  /**
   * Check if user wants daily tips
   */
  shouldShowDailyTips() {
    return this.get('showDailyTips') && this.get('tipFrequency') !== 'never';
  }

  /**
   * Check if it's time for next tip based on frequency
   */
  async isTimeForNextTip() {
    if (!this.shouldShowDailyTips()) return false;

    try {
      const lastTipDate = await AsyncStorage.getItem('@last_tip_shown');
      const frequency = this.get('tipFrequency');
      
      if (!lastTipDate) return true;

      const lastDate = new Date(lastTipDate);
      const now = new Date();
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      switch (frequency) {
        case 'daily':
          return diffDays >= 1;
        case 'weekly':
          return diffDays >= 7;
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking tip timing', error);
      return false;
    }
  }

  /**
   * Mark tip as shown
   */
  async markTipShown() {
    try {
      await AsyncStorage.setItem('@last_tip_shown', new Date().toISOString());
      return true;
    } catch (error) {
      logger.error('Failed to mark tip as shown', error);
      return false;
    }
  }

  /**
   * Get settings for specific UI category
   */
  getUISettings() {
    return {
      theme: this.get('theme'),
      colorScheme: this.get('colorScheme'),
      animations: this.get('animations'),
      hapticFeedback: this.get('hapticFeedback')
    };
  }

  /**
   * Get accessibility settings
   */
  getAccessibilitySettings() {
    return {
      largeText: this.get('largeText'),
      highContrast: this.get('highContrast'),
      reduceMotion: this.get('reduceMotion')
    };
  }
}

// Create singleton instance
const userPreferences = new UserPreferences();

export default userPreferences;

// Export convenience methods
export const {
  initialize,
  get,
  set,
  setMultiple,
  getAll,
  shouldShowDailyTips,
  isTimeForNextTip,
  markTipShown
} = userPreferences;