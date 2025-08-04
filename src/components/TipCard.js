import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TutorialManager } from '../services/tutorial/TutorialManager';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const TipCard = ({ 
  visible, 
  onClose, 
  category = null, 
  autoShow = false,
  showInterval = 30000 // 30 seconds
}) => {
  const [currentTip, setCurrentTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (visible) {
      showRandomTip();
    } else if (autoShow) {
      startAutoShow();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visible, autoShow, category]);

  const startAutoShow = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const settings = await TutorialManager.getTutorialSettings();
    if (!settings.showTips) return;

    intervalRef.current = setInterval(async () => {
      const tip = await TutorialManager.getRandomTip(category);
      if (tip) {
        setCurrentTip(tip);
        setIsVisible(true);
        showAnimation();
      }
    }, showInterval);
  };

  const showRandomTip = async () => {
    const tip = await TutorialManager.getRandomTip(category);
    if (tip) {
      setCurrentTip(tip);
      setIsVisible(true);
      showAnimation();
    }
  };

  const showAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideAnimation = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsVisible(false);
      if (callback) callback();
    });
  };

  const handleClose = () => {
    hideAnimation(() => {
      if (onClose) onClose();
    });
  };

  const handleNextTip = async () => {
    hideAnimation(async () => {
      // Small delay before showing next tip
      setTimeout(async () => {
        const tip = await TutorialManager.getRandomTip(category);
        if (tip) {
          setCurrentTip(tip);
          setIsVisible(true);
          showAnimation();
        }
      }, 100);
    });
  };

  if (!isVisible && !visible) return null;

  return (
    <>
      {/* Modal version for explicit display */}
      {visible && (
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={onClose}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            <View style={styles.modalContainer}>
              {currentTip && <TipContent tip={currentTip} onClose={onClose} onNext={handleNextTip} />}
            </View>
          </View>
        </Modal>
      )}

      {/* Floating version for auto-show */}
      {isVisible && !visible && currentTip && (
        <Animated.View
          style={[
            styles.floatingTip,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TipContent tip={currentTip} onClose={handleClose} onNext={handleNextTip} floating />
        </Animated.View>
      )}
    </>
  );
};

const TipContent = ({ tip, onClose, onNext, floating = false }) => {
  const containerStyle = floating ? styles.floatingContainer : styles.modalTipContainer;

  return (
    <Animated.View style={containerStyle}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.tipGradient}
      >
        {/* Header */}
        <View style={styles.tipHeader}>
          <View style={styles.tipIconContainer}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
          </View>
          <View style={styles.tipHeaderText}>
            <Text style={styles.tipCategory}>
              {getCategoryLabel(tip.category)}
            </Text>
            <Text style={styles.tipTitle}>{tip.title}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.tipContent}>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>

        {/* Actions */}
        <View style={styles.tipActions}>
          {!floating && (
            <TouchableOpacity style={styles.nextTipButton} onPress={onNext}>
              <Text style={styles.nextTipButtonText}>💡 Próxima Dica</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItButtonText}>
              {floating ? 'Entendi!' : 'Fechar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tip indicator */}
        <View style={styles.tipIndicator}>
          <Text style={styles.tipIndicatorText}>💡 Dica Didgemap</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const getCategoryLabel = (category) => {
  const labels = {
    geometry: 'Geometria',
    analysis: 'Análise',
    offline: 'Modo Offline',
    backup: 'Backup',
    construction: 'Construção',
    sound: 'Som',
    tips: 'Dicas Gerais'
  };
  return labels[category] || 'Dica';
};

// Floating Tip Manager Component
export const FloatingTipManager = ({ children, category = null }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <TipCard
        visible={false}
        autoShow={true}
        category={category}
        onClose={() => setShowTip(false)}
        showInterval={60000} // Show every minute
      />
    </View>
  );
};

// Manual Tip Trigger Component
export const TipTrigger = ({ category, children, style }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.tipTrigger, style]}
        onPress={() => setShowTip(true)}
      >
        {children || (
          <View style={styles.defaultTrigger}>
            <Text style={styles.triggerIcon}>💡</Text>
            <Text style={styles.triggerText}>Dica</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TipCard
        visible={showTip}
        category={category}
        onClose={() => setShowTip(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalTipContainer: {
    width: '100%',
  },

  // Floating styles
  floatingTip: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
    elevation: 10,
  },
  floatingContainer: {
    width: '100%',
  },

  // Common tip styles
  tipGradient: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipCategory: {
    fontSize: typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipTitle: {
    fontSize: typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  tipContent: {
    marginBottom: spacing.md,
  },
  tipDescription: {
    fontSize: typography.body,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nextTipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  nextTipButtonText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
  },
  gotItButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  gotItButtonText: {
    color: '#059669',
    fontSize: typography.body,
    fontWeight: '700',
  },
  tipIndicator: {
    alignItems: 'center',
  },
  tipIndicatorText: {
    fontSize: typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Trigger styles
  tipTrigger: {
    // Base styles for trigger
  },
  defaultTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  triggerIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  triggerText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
  },
});