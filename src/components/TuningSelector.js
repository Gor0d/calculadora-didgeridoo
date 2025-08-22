import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

  const handleToggleTuning = () => {
    const nextTuning = currentTuning.key === 'standard' ? 'alternative' : 'standard';
    tuningService.setTuning(nextTuning);
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <AppIcon name="sound" size={12} color="#6B7280" />
        <Text style={styles.switchLabel}>Afinação:</Text>
        
        <TouchableOpacity
          style={[
            styles.switch,
            currentTuning.key === 'alternative' && styles.switchActive
          ]}
          onPress={handleToggleTuning}
          activeOpacity={0.8}
        >
          <View style={styles.switchTrack}>
            <Text style={[
              styles.switchText,
              styles.switchTextLeft,
              currentTuning.key === 'standard' && styles.switchTextActive
            ]}>440</Text>
            <Text style={[
              styles.switchText,
              styles.switchTextRight,
              currentTuning.key === 'alternative' && styles.switchTextActive
            ]}>432</Text>
          </View>
          <View style={[
            styles.switchThumb,
            currentTuning.key === 'alternative' && styles.switchThumbActive
          ]} />
        </TouchableOpacity>
        
        <Text style={styles.hzLabel}>Hz</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  switchLabel: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: '#6B7280',
  },
  switch: {
    position: 'relative',
    width: 70,
    height: 30,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#3B82F6',
  },
  switchTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  switchThumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    left: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  switchThumbActive: {
    left: 42,
  },
  switchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  switchTextLeft: {
    marginLeft: 2,
  },
  switchTextRight: {
    marginRight: 2,
  },
  switchTextActive: {
    color: '#FFFFFF',
  },
  hzLabel: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: '#6B7280',
  },
});