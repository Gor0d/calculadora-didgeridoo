import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';
import { AppIcon } from './IconSystem';
import { getDeviceInfo, getTypography, getSpacing, getResponsiveDimensions } from '../utils/responsive';
import { unitConverter } from '../services/units/UnitConverter';
import { localizationService } from '../services/i18n/LocalizationService';
import { themeService } from '../services/theme/ThemeService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();
const dimensions = getResponsiveDimensions();

export const GeometryInput = ({ 
  geometry, 
  onGeometryChange, 
  onAnalyze, 
  isAnalyzing, 
  currentFileName, 
  onToggleVisualization, 
  showVisualization,
  validationErrors,
  geometryStats,
  currentUnit = 'metric'
}) => {
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

  return (
    <View style={[styles.geometryContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <Text style={[styles.inputTitle, { color: colors.textPrimary }]}>{localizationService.t('geometryTitle')}</Text>
      
      {currentFileName && (
        <View style={styles.fileNameBadge}>
          <AppIcon name="document" size={14} color="#6B7280" />
          <Text style={[styles.fileNameText, { color: colors.textSecondary }]}>{currentFileName}</Text>
        </View>
      )}
      
      <Text style={[styles.inputSubtitle, { color: colors.textSecondary }]}>
        {currentUnit === 'metric' 
          ? localizationService.t('geometryFormat') 
          : localizationService.t('geometryFormatImperial')
        }
      </Text>
      
      <TextInput
        style={[styles.geometryInput, { backgroundColor: colors.surfaceBackground, borderColor: colors.border, color: colors.textPrimary }]}
        value={geometry}
        onChangeText={onGeometryChange}
        placeholder={unitConverter.getExampleGeometry(currentUnit)}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#94A3B8"
      />
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <View style={styles.validationErrorContainer}>
          <AppIcon name="warning" size={16} color="#DC2626" />
          <Text style={[styles.validationErrorText, { color: colors.error }]}>
            {validationErrors[0].message}
          </Text>
        </View>
      )}
      
      {/* Geometry Stats - Only 2 parameters as requested */}
      {geometryStats && (
        <View style={[styles.geometryStatsContainer, { backgroundColor: colors.surfaceBackground, borderColor: colors.border }]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              <View style={styles.statHeader}>
                <AppIcon name="ruler" size={14} color="#059669" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Comprimento Efetivo</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {unitConverter.formatLength(geometryStats.totalLength, currentUnit)}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              <View style={styles.statHeader}>
                <AppIcon name="droplet" size={14} color="#DC2626" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Volume Interno</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{localizationService.formatNumber(geometryStats.volume / 1000, 1)}L</Text>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.inputActions}>
        <TouchableOpacity
          style={[styles.button, styles.analyzeButton]}
          onPress={onAnalyze}
          disabled={isAnalyzing || !geometry.trim()}
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
            {isAnalyzing ? localizationService.t('analyzing') : localizationService.t('analyze')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.visualizeButton]}
          onPress={onToggleVisualization}
          disabled={!geometry.trim()}
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
            {showVisualization ? localizationService.t('hide') : localizationService.t('visualize')}
          </Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  geometryContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.sm,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  fileNameBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: spacing.md,
    alignSelf: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fileNameText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  inputSubtitle: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    marginBottom: spacing.md,
  },
  geometryInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    color: '#1E293B',
    fontFamily: 'monospace',
    fontSize: typography.body,
    padding: spacing.lg,
    minHeight: dimensions.inputHeight * 1.2,
    textAlignVertical: 'top',
    lineHeight: typography.body * 1.4,
  },
  fileNameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  fileNameText: {
    fontSize: typography.caption,
    color: '#64748B',
    fontWeight: '500',
  },
  validationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  validationErrorText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: '#DC2626',
    fontWeight: '500',
  },
  geometryStatsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption,
    color: '#6B7280',
    fontWeight: '600',
  },
  statValue: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: dimensions.buttonHeight * 1.1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  visualizeButton: {
    backgroundColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    fontSize: typography.button,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});