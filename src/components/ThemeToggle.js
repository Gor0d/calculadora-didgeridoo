import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AppIcon } from './IconSystem';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { themeService } from '../services/theme/ThemeService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const ThemeToggle = ({ style }) => {
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const colors = currentTheme.colors;

  useEffect(() => {
    const handleThemeChange = (newTheme) => {
      setCurrentTheme(newTheme);
    };

    themeService.addThemeChangeListener(handleThemeChange);
    
    return () => {
      themeService.removeThemeChangeListener(handleThemeChange);
    };
  }, []);

  const handleToggle = () => {
    themeService.toggleTheme();
  };

  const isDark = themeService.isDark();

  return (
    <TouchableOpacity 
      style={[styles.toggleContainer, { borderColor: colors.border, backgroundColor: colors.cardBackground }, style]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.toggleContent}>
        <AppIcon 
          name={isDark ? "moon" : "sunny"} 
          size={18} 
          color={isDark ? "#FBBF24" : "#F59E0B"} 
        />
        <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      </View>
      <View style={[styles.indicator, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]}>
        <View style={[
          styles.indicatorDot, 
          { 
            backgroundColor: isDark ? "#FBBF24" : "#F59E0B",
            transform: [{ translateX: isDark ? 16 : 0 }]
          }
        ]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    minWidth: 100,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toggleText: {
    fontSize: typography.small,
    fontWeight: '600',
  },
  indicator: {
    width: 32,
    height: 16,
    borderRadius: 8,
    position: 'relative',
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 2,
    left: 2,
  },
});