import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const LanguageSelector = ({ currentLanguage, onLanguageChange, disabled = false }) => {
  const languages = localizationService.getAvailableLanguages();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{localizationService.t('language')}</Text>
      
      <View style={styles.languageOptions}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageOption,
              currentLanguage === language.code && styles.languageOptionActive,
              disabled && styles.languageOptionDisabled,
            ]}
            onPress={() => !disabled && onLanguageChange(language.code)}
            disabled={disabled}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flagText}>{language.flag}</Text>
              <Text style={[
                styles.languageLabel,
                currentLanguage === language.code && styles.languageLabelActive,
                disabled && styles.languageLabelDisabled,
              ]}>
                {language.name}
              </Text>
            </View>
            
            {currentLanguage === language.code && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  languageOptions: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageOptionActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  languageOptionDisabled: {
    opacity: 0.5,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  languageLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#374151',
  },
  languageLabelActive: {
    color: '#FFFFFF',
  },
  languageLabelDisabled: {
    color: '#9CA3AF',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});