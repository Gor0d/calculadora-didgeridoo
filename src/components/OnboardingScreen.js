import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

const OnboardingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: localizationService.t('welcome'),
      subtitle: localizationService.t('welcomeSubtitle'),
      icon: '🎵',
      description: localizationService.t('welcomeDesc'),
      gradient: ['#059669', '#10B981'],
    },
    {
      id: 'analysis',
      title: localizationService.t('analysisTitle'),
      subtitle: localizationService.t('analysisSubtitle'),
      icon: '🔬',
      description: localizationService.t('analysisDesc'),
      gradient: ['#06B6D4', '#3B82F6'],
    },
    {
      id: 'visualization',
      title: localizationService.t('visualizationTitle'),
      subtitle: localizationService.t('visualizationSubtitle'),
      icon: '📊',
      description: localizationService.t('visualizationDesc'),
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'audio',
      title: localizationService.t('audioTitle'),
      subtitle: localizationService.t('audioSubtitle'),
      icon: '🎺',
      description: localizationService.t('audioDesc'),
      gradient: ['#F59E0B', '#EF4444'],
    },
    {
      id: 'projects',
      title: localizationService.t('projectsTitle'),
      subtitle: localizationService.t('projectsSubtitle'),
      icon: '📁',
      description: localizationService.t('projectsDesc'),
      gradient: ['#10B981', '#059669'],
    },
  ];

  const handleNext = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue anyway
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue anyway
    }
    onComplete();
  };

  const handleComplete = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue anyway
    }
    onComplete();
  };

  const handleDotPress = async (index) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue anyway
    }
    setCurrentStep(index);
  };

  const renderIcon = (step) => {
    return (
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{step.icon}</Text>
      </View>
    );
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={currentStepData.gradient}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.stepContainer}>
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            {renderIcon(currentStepData)}
          </View>
          
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>
      </View>

      {/* Navigation Dots */}
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentStep ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{localizationService.t('skip')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentStep === steps.length - 1 ? localizationService.t('start') : localizationService.t('next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: deviceInfo.safeAreaTop + spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  iconText: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: typography.body * 1.5,
    maxWidth: deviceInfo.isTablet ? 500 : 300,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: deviceInfo.safeAreaBottom + spacing.lg,
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontSize: typography.button,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    minWidth: 100,
    alignItems: 'center',
  },
  nextText: {
    fontSize: typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default OnboardingScreen;