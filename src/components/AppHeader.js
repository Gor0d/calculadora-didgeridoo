import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing, getLayoutStyles } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const AppHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#059669', '#10B981']}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.headerTitle}>🎵 {localizationService.t('appName')}</Text>
      <Text style={styles.headerSubtitle}>{localizationService.t('appSubtitle')}</Text>
      <View style={styles.headerFeatures}>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>{localizationService.t('acousticAnalysis')}</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>{localizationService.t('visualization')}</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>{localizationService.t('audioPreview')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: spacing.xl,
    borderBottomRightRadius: spacing.xl,
    overflow: 'hidden',
    minHeight: deviceInfo.isTablet ? 160 : deviceInfo.isLargeDevice ? 120 : 100,
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: typography.bodySmall,
    color: '#A5F3FC',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: spacing.md,
    maxWidth: deviceInfo.isTablet ? 400 : 280,
  },
  headerFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
    maxWidth: deviceInfo.width - spacing.xl,
  },
  featureBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureBadgeText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});