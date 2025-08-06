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
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TutorialManager } from '../services/tutorial/TutorialManager';
import { getDeviceInfo, getTypography, getSpacing, scale } from '../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const TutorialOverlay = ({
  visible,
  step,
  targetRef,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  elementBounds
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightBounds, setHighlightBounds] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && step) {
      calculatePositions();
      startEntryAnimation();
      startPulseAnimation();
    } else {
      startExitAnimation();
    }
  }, [visible, step, elementBounds]);

  const calculatePositions = () => {
    if (!step || !elementBounds) return;

    // Calculate tooltip position
    const position = TutorialManager.calculateStepPosition(
      step.target,
      step.position || 'bottom',
      elementBounds
    );
    setTooltipPosition(position);

    // Calculate highlight bounds
    const padding = step.highlightPadding || 8;
    setHighlightBounds({
      x: elementBounds.x - padding,
      y: elementBounds.y - padding,
      width: elementBounds.width + padding * 2,
      height: elementBounds.height + padding * 2
    });
  };

  const startEntryAnimation = () => {
    setIsAnimating(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      })
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const startExitAnimation = () => {
    if (!visible) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
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
    
    if (step && onNext) {
      // Encontrar seção do step
      let sectionName = null;
      for (const [section, steps] of Object.entries(TutorialManager.tutorialSteps)) {
        if (steps.find(s => s.id === step.id)) {
          sectionName = section;
          break;
        }
      }
      
      if (sectionName) {
        await TutorialManager.markStepCompleted(sectionName, step.id);
      }
      onNext();
    }
  };

  const handleSkip = async () => {
    if (step && onSkip) {
      // Encontrar seção do step
      let sectionName = null;
      for (const [section, steps] of Object.entries(TutorialManager.tutorialSteps)) {
        if (steps.find(s => s.id === step.id)) {
          sectionName = section;
          break;
        }
      }
      
      if (sectionName) {
        await TutorialManager.skipCurrentSection(sectionName);
      }
      onSkip();
    }
  };

  if (!visible || !step) return null;

  const tooltipStyle = TutorialManager.generateTooltipStyle(
    step.position || 'bottom',
    tooltipPosition.anchor
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Dark overlay background */}
        <Animated.View style={[styles.darkBackground, { opacity: fadeAnim }]} />
        
        {/* Highlight cutout effect */}
        {highlightBounds && (
          <Animated.View style={[styles.highlightContainer, { opacity: highlightAnim }]}>
            {/* Top dark area */}
            <View style={[styles.darkArea, { height: highlightBounds.y }]} />
            
            {/* Middle row with left, highlight, right */}
            <View style={[styles.middleRow, { height: highlightBounds.height }]}>
              <View style={[styles.darkArea, { width: highlightBounds.x }]} />
              
              {/* Highlighted element area */}
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
                {/* Glowing border effect */}
                <View style={styles.glowBorder} />
                <View style={styles.innerGlow} />
              </Animated.View>
              
              <View style={[styles.darkArea, { flex: 1 }]} />
            </View>
            
            {/* Bottom dark area */}
            <View style={[styles.darkArea, { flex: 1 }]} />
          </Animated.View>
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            tooltipStyle,
            {
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.tooltipGradient}
          >
            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                {step.icon || '🎯'}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipTitle}>{step.title}</Text>
              <Text style={styles.tooltipDescription}>{step.description}</Text>
              
              {/* Example code for geometry input */}
              {step.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Exemplo:</Text>
                  <Text style={styles.exampleCode}>{step.example}</Text>
                </View>
              )}

              {/* Feature list for overview steps */}
              {step.features && (
                <View style={styles.featuresContainer}>
                  {step.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                      <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.tooltipActions}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Pular Tutorial</Text>
              </TouchableOpacity>
              
              <View style={styles.navigationButtons}>
                {onPrevious && (
                  <TouchableOpacity style={styles.prevButton} onPress={onPrevious}>
                    <Text style={styles.prevButtonText}>← Anterior</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>
                    {step.isLast ? 'Concluir' : 'Próximo →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress indicator */}
            {step.progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${step.progress.percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {step.progress.current} de {step.progress.total}
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Pointer arrow */}
          <View style={[styles.pointer, getPointerStyle(tooltipPosition.anchor)]} />
        </Animated.View>

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const getPointerStyle = (anchor) => {
  const basePointer = {
    position: 'absolute',
    width: 0,
    height: 0,
  };

  switch (anchor) {
    case 'top':
      return {
        ...basePointer,
        bottom: -8,
        left: '50%',
        marginLeft: -8,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#374151',
      };
    case 'bottom':
      return {
        ...basePointer,
        top: -8,
        left: '50%',
        marginLeft: -8,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#1F2937',
      };
    case 'left':
      return {
        ...basePointer,
        right: -8,
        top: '50%',
        marginTop: -8,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#374151',
      };
    case 'right':
      return {
        ...basePointer,
        left: -8,
        top: '50%',
        marginTop: -8,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderRightWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#1F2937',
      };
    default:
      return { display: 'none' };
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  darkBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  highlightContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  darkArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.6)',
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  tooltipGradient: {
    borderRadius: 12,
    padding: spacing.md,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: 30,
  },
  tooltipContent: {
    marginBottom: spacing.md,
  },
  tooltipTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  tooltipDescription: {
    fontSize: typography.body,
    color: '#D1D5DB',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  exampleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  exampleLabel: {
    fontSize: typography.small,
    color: '#9CA3AF',
    marginBottom: spacing.xs,
  },
  exampleCode: {
    fontSize: typography.small,
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  featuresContainer: {
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  featureText: {
    fontSize: typography.small,
    color: '#D1D5DB',
    flex: 1,
  },
  tooltipActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: spacing.sm,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.small,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  prevButtonText: {
    fontSize: typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  nextButtonText: {
    fontSize: typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.caption,
    color: '#9CA3AF',
  },
  pointer: {
    zIndex: 1001,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});