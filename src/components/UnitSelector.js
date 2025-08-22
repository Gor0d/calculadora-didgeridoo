import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppIcon } from './IconSystem';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const UnitSelector = ({ currentUnit, onUnitChange, disabled = false }) => {
  const handleToggleUnit = () => {
    if (!disabled) {
      const nextUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
      onUnitChange(nextUnit);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <AppIcon name="ruler" size={12} color="#6B7280" />
        <Text style={styles.switchLabel}>Unidades:</Text>
        
        <TouchableOpacity
          style={[
            styles.switch,
            currentUnit === 'imperial' && styles.switchActive,
            disabled && styles.switchDisabled
          ]}
          onPress={handleToggleUnit}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <View style={styles.switchTrack}>
            <Text style={[
              styles.switchText,
              styles.switchTextLeft,
              currentUnit === 'metric' && styles.switchTextActive
            ]}>cm</Text>
            <Text style={[
              styles.switchText,
              styles.switchTextRight,
              currentUnit === 'imperial' && styles.switchTextActive
            ]}>in</Text>
          </View>
          <View style={[
            styles.switchThumb,
            currentUnit === 'imperial' && styles.switchThumbActive
          ]} />
        </TouchableOpacity>
        
        <Text style={styles.unitLabel}>
          {currentUnit === 'metric' ? 'Métrico' : 'Imperial'}
        </Text>
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
    backgroundColor: '#10B981',
  },
  switchDisabled: {
    opacity: 0.5,
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
  unitLabel: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: '#6B7280',
  },
});