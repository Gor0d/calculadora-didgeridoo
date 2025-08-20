import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing, getLayoutStyles } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { AppIcon } from './IconSystem';
import { ThemeToggle } from './ThemeToggle';
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
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/didgemap.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.logoTextContainer}>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {localizationService.t('appSubtitle')}
          </Text>
        </View>
      </View>
      
      {/* Quick Features as modern cards */}
      <View style={styles.headerFeatures}>
        <View style={[styles.featureCard, { backgroundColor: colors.surfaceBackground, borderColor: colors.border }]}>
          <AppIcon name="wave" size={16} color={colors.success} />
          <Text style={[styles.featureCardText, { color: colors.textSecondary }]}>
            {localizationService.t('acousticAnalysis')}
          </Text>
        </View>
        <View style={[styles.featureCard, { backgroundColor: colors.surfaceBackground, borderColor: colors.border }]}>
          <AppIcon name="chart" size={16} color={colors.secondary} />
          <Text style={[styles.featureCardText, { color: colors.textSecondary }]}>
            {localizationService.t('visualization')}
          </Text>
        </View>
        <View style={[styles.featureCard, { backgroundColor: colors.surfaceBackground, borderColor: colors.border }]}>
          <AppIcon name="sound" size={16} color={colors.accent} />
          <Text style={[styles.featureCardText, { color: colors.textSecondary }]}>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoImage: {
    width: deviceInfo.isTablet ? 400 : 300,
    height: deviceInfo.isTablet ? 113 : 85,
    marginBottom: spacing.xs,
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
  headerFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    maxWidth: deviceInfo.width - spacing.xl * 2,
  },
  featureCard: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureCardText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#475569',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});