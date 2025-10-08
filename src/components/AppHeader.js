import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing, getLayoutStyles } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { AppIcon } from './IconSystem';
import { ThemeToggle } from './ThemeToggle';
import { DynamicLogo } from './DynamicLogo';
import { themeService } from '../services/theme/ThemeService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const AppHeader = () => {
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());

  useEffect(() => {
    const handleThemeChange = (newTheme) => {
      setCurrentTheme(newTheme);
    };

    themeService.addThemeChangeListener(handleThemeChange);
    
    return () => {
      themeService.removeThemeChangeListener(handleThemeChange);
    };
  }, []);

  const colors = currentTheme.colors;

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
      {/* Theme toggle in top right */}
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        <ThemeToggle />
      </View>
      
      {/* Main Logo Area */}
      <View style={styles.logoSection}>
        <DynamicLogo theme={currentTheme} />
        <View style={styles.logoTextContainer}>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {localizationService.t('appSubtitle')}
          </Text>
        </View>
      </View>
      
      {/* Features as simple text with separators */}
      <View style={styles.featuresLine}>
        <View style={styles.featureItem}>
          <AppIcon name="wave" size={14} color={colors.success} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            {localizationService.t('acousticAnalysis')}
          </Text>
        </View>
        
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        
        <View style={styles.featureItem}>
          <AppIcon name="chart" size={14} color={colors.secondary} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            {localizationService.t('visualization')}
          </Text>
        </View>
        
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        
        <View style={styles.featureItem}>
          <AppIcon name="sound" size={14} color={colors.accent} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            {localizationService.t('audioPreview')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: deviceInfo.isTablet ? 160 : deviceInfo.isLargeDevice ? 130 : 120,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: deviceInfo.isTablet ? typography.body : typography.small,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: deviceInfo.isTablet ? 400 : 320,
    lineHeight: (deviceInfo.isTablet ? typography.body : typography.small) * 1.4,
    letterSpacing: 0.2,
  },
  featuresLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  featureText: {
    fontSize: typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  separator: {
    width: 1,
    height: 16,
    marginHorizontal: spacing.md,
    opacity: 0.3,
  },
});