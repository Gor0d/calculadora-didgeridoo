import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// TutorialManager will be imported dynamically
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const FirstRunTutorial = ({ 
  visible, 
  onComplete, 
  registeredRefs = {},
  currentStep = 0,
  onStepChange 
}) => {
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [highlightBounds, setHighlightBounds] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadTutorialSteps();
      
      // Disable back button during tutorial
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && tutorialSteps.length > 0 && currentStep < tutorialSteps.length) {
      calculateElementBounds();
      startEntryAnimation();
      startPulseAnimation();
    }
  }, [visible, currentStep, tutorialSteps, registeredRefs]);

  const loadTutorialSteps = async () => {
    try {
      const { TutorialManager } = await import('../services/tutorial/TutorialManager');
      const steps = TutorialManager.getFirstRunTutorialSteps();
      setTutorialSteps(steps);
    } catch (error) {
      console.error('Error loading tutorial steps:', error);
      // Fallback steps if import fails
      setTutorialSteps([
        {
          id: 'intro_1',
          title: 'Bem-vindo ao Didgemap! 🎺',
          description: 'Sua calculadora profissional para análise acústica de didgeridoos. Vamos começar!',
          icon: '👋',
          type: 'intro',
          target: null,
          position: 'center',
          isLast: true
        }
      ]);
    }
  };

  const calculateElementBounds = async () => {
    const step = tutorialSteps[currentStep];
    if (!step || !step.target || !registeredRefs[step.target]) {
      setHighlightBounds(null);
      return;
    }

    try {
      const ref = registeredRefs[step.target];
      if (ref?.current) {
        ref.current.measureInWindow((x, y, width, height) => {
          const padding = step.highlightPadding || 8;
          setHighlightBounds({
            x: Math.max(0, x - padding),
            y: Math.max(0, y - padding),
            width: Math.min(SCREEN_WIDTH - x + padding, width + padding * 2),
            height: height + padding * 2
          });
        });
      }
    } catch (error) {
      console.error('Error calculating bounds:', error);
      setHighlightBounds(null);
    }
  };

  const startEntryAnimation = () => {
    setIsAnimating(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      })
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ]).start(() => {
        if (visible) pulse();
      });
    };
    pulse();
  };

  const handleNext = async () => {
    if (isAnimating) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    const step = tutorialSteps[currentStep];
    
    if (step?.isLast) {
      // Complete tutorial - just call onComplete, let parent handle storage
      onComplete?.();
    } else if (currentStep < tutorialSteps.length - 1) {
      // Go to next step
      onStepChange?.(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    if (isAnimating || currentStep <= 0) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    onStepChange?.(currentStep - 1);
  };

  if (!visible || tutorialSteps.length === 0 || currentStep >= tutorialSteps.length) {
    return null;
  }

  const step = tutorialSteps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}} // Prevent closing
    >
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Dark background with highlight cutout */}
        <Animated.View style={[styles.darkBackground, { opacity: fadeAnim }]} />
        
        {/* Highlight effect */}
        {highlightBounds && (
          <Animated.View style={[styles.highlightContainer, { opacity: highlightAnim }]}>
            {/* Top dark area */}
            <View style={[styles.darkArea, { height: highlightBounds.y }]} />
            
            {/* Middle row with highlight */}
            <View style={[styles.middleRow, { height: highlightBounds.height }]}>
              <View style={[styles.darkArea, { width: highlightBounds.x }]} />
              
              <Animated.View
                style={[
                  styles.highlightArea,
                  {
                    width: highlightBounds.width,
                    height: highlightBounds.height,
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <View style={styles.glowBorder} />
                <View style={styles.innerGlow} />
              </Animated.View>
              
              <View style={[styles.darkArea, { flex: 1 }]} />
            </View>
            
            {/* Bottom dark area */}
            <View style={[styles.darkArea, { flex: 1 }]} />
          </Animated.View>
        )}

        {/* Tutorial tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.tooltipGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {currentStep + 1} de {tutorialSteps.length}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.description}>{step.description}</Text>
              
              {step.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Exemplo:</Text>
                  <Text style={styles.exampleCode}>{step.example}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
                  <Text style={styles.prevButtonText}>← Anterior</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {step.isLast ? '🎉 Concluir' : 'Próximo →'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  darkBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  highlightContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  darkArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  highlightArea: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 25,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.8)',
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  tooltip: {
    position: 'absolute',
    bottom: 60,
    left: spacing.lg,
    right: spacing.lg,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  tooltipGradient: {
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepIcon: {
    fontSize: 20,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: typography.caption,
    color: '#9CA3AF',
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  content: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body,
    color: '#D1D5DB',
    lineHeight: 22,
    textAlign: 'center',
  },
  exampleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  exampleLabel: {
    fontSize: typography.small,
    color: '#9CA3AF',
    marginBottom: spacing.xs,
  },
  exampleCode: {
    fontSize: typography.small,
    color: '#10B981',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  prevButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
});