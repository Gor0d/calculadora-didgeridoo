import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { AppIcon } from './IconSystem';
import { tuningService } from '../services/tuning/TuningService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const TuningSelector = ({ onTuningChange }) => {
  const [currentTuning, setCurrentTuning] = useState(tuningService.getCurrentTuning());
  const tuningOptions = tuningService.getTuningOptions();

  useEffect(() => {
    const handleTuningChange = (newTuning) => {
      setCurrentTuning(newTuning);
      if (onTuningChange) {
        onTuningChange(newTuning);
      }
    };

    tuningService.addTuningChangeListener(handleTuningChange);
    
    return () => {
      tuningService.removeTuningChangeListener(handleTuningChange);
    };
  }, [onTuningChange]);

  const handleTuningSelect = (tuning) => {
    tuningService.setTuning(tuning.key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppIcon name="sound" size={16} color="#6B7280" />
        <Text style={styles.headerText}>Afinação de Referência</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {tuningOptions.map((tuning) => (
          <TouchableOpacity
            key={tuning.key}
            style={[
              styles.optionButton,
              currentTuning.key === tuning.key && styles.selectedOption
            ]}
            onPress={() => handleTuningSelect(tuning)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.frequencyContainer}>
                <Text style={[
                  styles.frequencyText,
                  currentTuning.key === tuning.key && styles.selectedFrequencyText
                ]}>
                  {tuning.frequency}Hz
                </Text>
                {tuning.key === 'standard' && (
                  <View style={styles.standardBadge}>
                    <Text style={styles.standardBadgeText}>Padrão</Text>
                  </View>
                )}
                {tuning.key === 'alternative' && (
                  <View style={styles.alternativeBadge}>
                    <Text style={styles.alternativeBadgeText}>Natural</Text>
                  </View>
                )}
              </View>
              
              <Text style={[
                styles.optionText,
                currentTuning.key === tuning.key && styles.selectedOptionText
              ]}>
                {tuning.name}
              </Text>
              
              {currentTuning.key === tuning.key && (
                <View style={styles.checkIcon}>
                  <AppIcon name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.infoText}>
        A afinação afeta todas as notas calculadas e a reprodução de áudio
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#374151',
    marginLeft: spacing.xs,
  },
  optionsContainer: {
    flexDirection: deviceInfo.isTablet ? 'row' : 'column',
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flex: deviceInfo.isTablet ? 1 : undefined,
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  optionContent: {
    position: 'relative',
    alignItems: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  frequencyText: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
  },
  selectedFrequencyText: {
    color: '#FFFFFF',
  },
  standardBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  alternativeBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  standardBadgeText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alternativeBadgeText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: typography.small,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#E5E7EB',
  },
  checkIcon: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});