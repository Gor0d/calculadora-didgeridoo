import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { themeService } from '../services/theme/ThemeService';
import { AppIcon } from '../components/IconSystem';
import { LanguageSelector } from '../components/LanguageSelector';
import { UnitSelector } from '../components/UnitSelector';
import { OfflineSettings } from '../components/OfflineSettings';
import { TutorialSettings } from '../components/TutorialSettings';
import { PerformanceSettings } from '../components/PerformanceSettings';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const SettingsScreen = ({
  currentLanguage,
  onLanguageChange,
  currentUnit,
  onUnitChange,
  onExportData,
  onImportData,
  onResetApp,
  onResetOnboarding
}) => {
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOfflineSettings, setShowOfflineSettings] = useState(false);
  const [showTutorialSettings, setShowTutorialSettings] = useState(false);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);

  // Theme support
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const colors = currentTheme.colors;

  useEffect(() => {
    const handleThemeChange = (newTheme) => {
      setCurrentTheme(newTheme);
    };

    themeService.addThemeChangeListener(handleThemeChange);

    return () => {
      themeService.removeThemeChangeListener(handleThemeChange);
    };
  }, []);

  const handleExportData = () => {
    Alert.alert(
      localizationService.t('exportData'),
      localizationService.t('exportDataDesc'),
      [
        { text: localizationService.t('cancel'), style: 'cancel' },
        { text: localizationService.t('export'), onPress: onExportData }
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      localizationService.t('importData'),
      localizationService.t('importDataDesc'),
      [
        { text: localizationService.t('cancel'), style: 'cancel' },
        { text: localizationService.t('import'), onPress: onImportData }
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      localizationService.t('resetApp'),
      localizationService.t('resetAppWarning'),
      [
        { text: localizationService.t('cancel'), style: 'cancel' },
        { 
          text: localizationService.t('reset'), 
          style: 'destructive',
          onPress: onResetApp 
        }
      ]
    );
  };

  const appVersion = "1.0.0";
  const buildNumber = "1";

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary, colors.success]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerTitleContainer}>
          <AppIcon name="settings" size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{localizationService.t('settings')}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{localizationService.t('settingsDesc')}</Text>
      </View>

      {/* Language Settings */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{localizationService.t('language')}</Text>
        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </View>

      {/* Unit Settings */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{localizationService.t('unitSystem')}</Text>
        <UnitSelector
          currentUnit={currentUnit}
          onUnitChange={onUnitChange}
        />
      </View>

      {/* App Preferences */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{localizationService.t('preferences')}</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>{localizationService.t('hapticFeedback')}</Text>
            <Text style={styles.preferenceDesc}>{localizationService.t('hapticFeedbackDesc')}</Text>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            thumbColor={hapticFeedback ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>{localizationService.t('autoSave')}</Text>
            <Text style={styles.preferenceDesc}>{localizationService.t('autoSaveDesc')}</Text>
          </View>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            thumbColor={autoSave ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{localizationService.t('dataManagement')}</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowTutorialSettings(true)}>
          <View style={styles.actionContent}>
            <AppIcon name="tutorial" size={24} color="#10B981" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Tutorial e Ajuda</Text>
              <Text style={styles.actionDesc}>Configurar tutoriais e dicas</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowPerformanceSettings(true)}>
          <View style={styles.actionContent}>
            <AppIcon name="performance" size={24} color="#F59E0B" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Performance</Text>
              <Text style={styles.actionDesc}>Otimizar para seu dispositivo</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowOfflineSettings(true)}>
          <View style={styles.actionContent}>
            <AppIcon name="offline" size={24} color="#6366F1" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Configurações Offline</Text>
              <Text style={styles.actionDesc}>Gerenciar modo offline e cache</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <View style={styles.actionContent}>
            <AppIcon name="export" size={24} color="#059669" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{localizationService.t('exportData')}</Text>
              <Text style={styles.actionDesc}>{localizationService.t('exportDataShort')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleImportData}>
          <View style={styles.actionContent}>
            <AppIcon name="import" size={24} color="#0891B2" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{localizationService.t('importData')}</Text>
              <Text style={styles.actionDesc}>{localizationService.t('importDataShort')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Advanced Settings */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.sectionTitle}>{localizationService.t('advanced')}</Text>
          <Text style={styles.toggleIcon}>{showAdvanced ? '🔼' : '🔽'}</Text>
        </TouchableOpacity>
        
        {showAdvanced && (
          <View style={styles.advancedContent}>
            <TouchableOpacity style={styles.actionButton} onPress={onResetOnboarding}>
              <View style={styles.actionContent}>
                <AppIcon name="tutorial" size={24} color="#F59E0B" />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{localizationService.t('resetOnboarding')}</Text>
                  <Text style={styles.actionDesc}>{localizationService.t('resetOnboardingDesc')}</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleResetApp}>
              <View style={styles.actionContent}>
                <AppIcon name="delete" size={24} color="#DC2626" />
                <View style={styles.actionText}>
                  <Text style={[styles.actionTitle, styles.dangerText]}>{localizationService.t('resetApp')}</Text>
                  <Text style={styles.actionDesc}>{localizationService.t('resetAppShort')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{localizationService.t('about')}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{localizationService.t('version')}</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{localizationService.t('build')}</Text>
            <Text style={styles.infoValue}>{buildNumber}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{localizationService.t('developer')}</Text>
            <Text style={styles.infoValue}>Emerson Guimarães</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {localizationService.t('madeWith')} ❤️ {localizationService.t('forDidgeridoo')}
        </Text>
      </View>
      
      {/* Tutorial Settings Modal */}
      <TutorialSettings
        visible={showTutorialSettings}
        onClose={() => setShowTutorialSettings(false)}
      />
      
      {/* Performance Settings Modal */}
      <PerformanceSettings
        visible={showPerformanceSettings}
        onClose={() => setShowPerformanceSettings(false)}
      />
      
      {/* Offline Settings Modal */}
      <OfflineSettings
        visible={showOfflineSettings}
        onClose={() => setShowOfflineSettings(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: deviceInfo.safeAreaTop + spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: spacing.xl,
    borderBottomRightRadius: spacing.xl,
    overflow: 'hidden',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: typography.body,
    color: '#A5F3FC',
    textAlign: 'center',
    fontWeight: '400',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: spacing.lg,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: spacing.xs,
  },
  preferenceDesc: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    lineHeight: typography.bodySmall * 1.4,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: spacing.xs,
  },
  dangerText: {
    color: '#DC2626',
  },
  actionDesc: {
    fontSize: typography.bodySmall,
    color: '#64748B',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  toggleIcon: {
    fontSize: 16,
    color: '#64748B',
  },
  advancedContent: {
    marginTop: -spacing.md,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: typography.body,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: typography.body,
    color: '#1E293B',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: deviceInfo.safeAreaBottom + spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.bodySmall,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});