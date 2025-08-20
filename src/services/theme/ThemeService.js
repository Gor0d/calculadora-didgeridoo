/**
 * Theme Service - Manages dark/light mode
 */

export const THEMES = {
  light: {
    name: 'Light',
    colors: {
      // Background colors
      background: '#FFFFFF',
      surfaceBackground: '#F8FAFC',
      cardBackground: '#FFFFFF',
      
      // Text colors
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      
      // Border colors
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      borderDark: '#D1D5DB',
      
      // Status colors
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      
      // Brand colors
      primary: '#059669',
      secondary: '#3B82F6',
      accent: '#8B5CF6',
      
      // SVG colors
      svgStroke: '#1F2937',
      svgFill: 'none',
      gridLine: '#E5E7EB',
      gridLineMajor: '#D1D5DB',
      
      // Shadow
      shadowColor: '#000000',
    }
  },
  
  dark: {
    name: 'Dark',
    colors: {
      // Background colors
      background: '#111827',
      surfaceBackground: '#1F2937',
      cardBackground: '#374151',
      
      // Text colors
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      
      // Border colors
      border: '#4B5563',
      borderLight: '#374151',
      borderDark: '#6B7280',
      
      // Status colors
      success: '#34D399',
      error: '#F87171',
      warning: '#FBBF24',
      info: '#60A5FA',
      
      // Brand colors
      primary: '#10B981',
      secondary: '#60A5FA',
      accent: '#A78BFA',
      
      // SVG colors
      svgStroke: '#F9FAFB',
      svgFill: 'none',
      gridLine: '#4B5563',
      gridLineMajor: '#6B7280',
      
      // Shadow
      shadowColor: '#000000',
    }
  }
};

export class ThemeService {
  constructor() {
    this.currentTheme = THEMES.light;
    this.listeners = [];
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get theme colors
   */
  getColors() {
    return this.currentTheme.colors;
  }

  /**
   * Switch to theme
   */
  setTheme(themeName) {
    if (THEMES[themeName]) {
      const oldTheme = this.currentTheme;
      this.currentTheme = THEMES[themeName];
      
      console.log(`🎨 Theme changed: ${oldTheme.name} → ${this.currentTheme.name}`);
      
      // Notify listeners
      this.listeners.forEach(listener => {
        try {
          listener(this.currentTheme, oldTheme);
        } catch (error) {
          console.warn('Theme listener error:', error);
        }
      });
      
      return true;
    }
    return false;
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme() {
    const newTheme = this.currentTheme === THEMES.light ? 'dark' : 'light';
    return this.setTheme(newTheme);
  }

  /**
   * Check if current theme is dark
   */
  isDark() {
    return this.currentTheme === THEMES.dark;
  }

  /**
   * Add theme change listener
   */
  addThemeChangeListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  }

  /**
   * Remove theme change listener
   */
  removeThemeChangeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Object.keys(THEMES).map(key => ({
      key,
      name: THEMES[key].name,
      isDark: key === 'dark'
    }));
  }
}

// Create singleton instance
export const themeService = new ThemeService();