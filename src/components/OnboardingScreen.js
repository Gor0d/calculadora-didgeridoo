import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  PanResponder
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
  const handAnimRef = useRef(new Animated.Value(0)).current;
  const pulseAnimRef = useRef(new Animated.Value(1)).current;

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
      gradient: ['#065f46', '#10B981'],
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
      gradient: ['#047857', '#059669'],
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

  useEffect(() => {
    startHandAnimation();
    startPulseAnimation();
  }, [currentStep]);

  const startHandAnimation = () => {
    // Animação suave de deslizar da mão
    Animated.loop(
      Animated.sequence([
        Animated.timing(handAnimRef, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(handAnimRef, {
          toValue: 0,
          duration: 2000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimRef, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimRef, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Optional: Add visual feedback during swipe
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        
        if (Math.abs(dx) > 50 || Math.abs(vx) > 0.5) {
          if (dx > 0) {
            // Swipe right - previous step
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
            }
          } else {
            // Swipe left - next step
            handleNext();
          }
        }
      }
    })
  ).current;

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

      <View style={styles.stepContainer} {...panResponder.panHandlers}>
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            {renderIcon(currentStepData)}
          </View>
          
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>
      </View>

      {/* Animated Hand Gesture */}
      <Animated.View style={[
        styles.handContainer,
        {
          transform: [
            {
              translateX: handAnimRef.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 50]
              })
            },
            { scale: pulseAnimRef }
          ],
          opacity: handAnimRef.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0.4, 1, 1, 0.4]
          })
        }
      ]}>
        <Text style={styles.handEmoji}>👆</Text>
        <View style={styles.swipeIndicator}>
          <Text style={styles.swipeText}>Deslize ou toque</Text>
        </View>
      </Animated.View>

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
  handContainer: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    alignItems: 'center',
  },
  handEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  swipeIndicator: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  swipeText: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OnboardingScreen;