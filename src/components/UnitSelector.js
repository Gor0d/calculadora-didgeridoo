import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const UnitSelector = ({ currentUnit, onUnitChange, disabled = false }) => {
  const units = [
    { key: 'metric', label: localizationService.t('metric'), sublabel: localizationService.t('metricSubLabel') },
    { key: 'imperial', label: localizationService.t('imperial'), sublabel: localizationService.t('imperialSubLabel') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{localizationService.t('unitSystem')}</Text>
      
      <View style={styles.unitOptions}>
        {units.map((unit) => (
          <TouchableOpacity
            key={unit.key}
            style={[
              styles.unitOption,
              currentUnit === unit.key && styles.unitOptionActive,
              disabled && styles.unitOptionDisabled,
            ]}
            onPress={() => !disabled && onUnitChange(unit.key)}
            disabled={disabled}
          >
            <View style={styles.unitContent}>
              <Text style={[
                styles.unitLabel,
                currentUnit === unit.key && styles.unitLabelActive,
                disabled && styles.unitLabelDisabled,
              ]}>
                {unit.label}
              </Text>
              <Text style={[
                styles.unitSublabel,
                currentUnit === unit.key && styles.unitSublabelActive,
                disabled && styles.unitSublabelDisabled,
              ]}>
                {unit.sublabel}
              </Text>
            </View>
            
            {currentUnit === unit.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.helpText}>
        {currentUnit === 'metric' 
          ? localizationService.t('metricHelp')
          : localizationService.t('imperialHelp')
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    } : {
      boxShadow: '0px 4px 8px rgba(16, 185, 129, 0.1)',
    }),
    elevation: 4,
  },
  title: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  unitOptions: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  unitOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 6,
    padding: spacing.md,
    transition: 'all 0.2s ease',
  },
  unitOptionActive: {
    backgroundColor: '#10B981',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    } : {
      boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.3)',
    }),
    elevation: 3,
  },
  unitOptionDisabled: {
    opacity: 0.5,
  },
  unitContent: {
    flex: 1,
    alignItems: 'center',
  },
  unitLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  unitLabelActive: {
    color: '#FFFFFF',
  },
  unitLabelDisabled: {
    color: '#94A3B8',
  },
  unitSublabel: {
    fontSize: typography.caption,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unitSublabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  unitSublabelDisabled: {
    color: '#CBD5E1',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: typography.caption,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: typography.caption * 1.4,
    fontStyle: 'italic',
  },
});