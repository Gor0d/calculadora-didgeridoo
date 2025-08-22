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
                <AppIcon name="check" size={14} color="#FFFFFF" />
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
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'left',
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  unitOptions: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 6,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: spacing.md,
    minHeight: 40,
  },
  unitOptionActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    fontSize: typography.small,
    fontWeight: '600',
    color: '#1E293B',
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
    color: '#64748B',
    fontWeight: '500',
  },
  unitSublabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  unitSublabelDisabled: {
    color: '#CBD5E1',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  helpText: {
    fontSize: typography.caption,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: typography.caption * 1.4,
    fontStyle: 'italic',
  },
});