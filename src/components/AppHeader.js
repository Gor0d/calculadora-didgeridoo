import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing, getLayoutStyles } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { AppIcon } from './IconSystem';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const AppHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Main Logo Area */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIconContainer}>
          <AppIcon name="music" size={deviceInfo.isTablet ? 40 : 32} color="#FFFFFF" />
        </View>
        <View style={styles.logoTextContainer}>
          <Text style={styles.headerTitle}>{localizationService.t('appName')}</Text>
          <Text style={styles.headerSubtitle}>{localizationService.t('appSubtitle')}</Text>
        </View>
      </View>
      
      {/* Quick Features as modern cards */}
      <View style={styles.headerFeatures}>
        <View style={styles.featureCard}>
          <AppIcon name="wave" size={16} color="#10B981" />
          <Text style={styles.featureCardText}>{localizationService.t('acousticAnalysis')}</Text>
        </View>
        <View style={styles.featureCard}>
          <AppIcon name="chart" size={16} color="#3B82F6" />
          <Text style={styles.featureCardText}>{localizationService.t('visualization')}</Text>
        </View>
        <View style={styles.featureCard}>
          <AppIcon name="sound" size={16} color="#8B5CF6" />
          <Text style={styles.featureCardText}>{localizationService.t('audioPreview')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    minHeight: deviceInfo.isTablet ? 180 : deviceInfo.isLargeDevice ? 140 : 120,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIconContainer: {
    width: deviceInfo.isTablet ? 52 : 44,
    height: deviceInfo.isTablet ? 52 : 44,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: (deviceInfo.isTablet ? 52 : 44) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoTextContainer: {
    alignItems: 'flex-start',
    flex: 1,
  },
  headerTitle: {
    fontSize: deviceInfo.isTablet ? typography.h1 * 1.2 : typography.h1,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: spacing.xs,
    textShadow: '0px 2px 8px rgba(0,0,0,0.3)',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    fontWeight: '500',
    maxWidth: deviceInfo.isTablet ? 400 : 280,
    lineHeight: typography.small * 1.3,
  },
  headerFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    maxWidth: deviceInfo.width - spacing.xl * 2,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureCardText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});