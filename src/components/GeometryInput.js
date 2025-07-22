import React from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';
import { getDeviceInfo, getTypography, getSpacing, getResponsiveDimensions } from '../utils/responsive';
import { unitConverter } from '../services/units/UnitConverter';
import { localizationService } from '../services/i18n/LocalizationService';

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
  return (
    <View style={styles.geometryContainer}>
      <Text style={styles.inputTitle}>{localizationService.t('geometryTitle')}</Text>
      
      {currentFileName && (
        <View style={styles.fileNameBadge}>
          <Text style={styles.fileNameText}>📄 {currentFileName}</Text>
        </View>
      )}
      
      <Text style={styles.inputSubtitle}>
        {currentUnit === 'metric' 
          ? localizationService.t('geometryFormat') 
          : localizationService.t('geometryFormatImperial')
        }
      </Text>
      
      <TextInput
        style={styles.geometryInput}
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
          <Text style={styles.validationErrorText}>
            ⚠️ {validationErrors[0].message}
          </Text>
        </View>
      )}
      
      {/* Geometry Stats */}
      {geometryStats && (
        <View style={styles.geometryStatsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{localizationService.t('length')}</Text>
            <Text style={styles.statValue}>
              {unitConverter.formatLength(geometryStats.totalLength, currentUnit)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{localizationService.t('diameter')}</Text>
            <Text style={styles.statValue}>
              {unitConverter.formatDiameter(geometryStats.minDiameter, currentUnit)}-{unitConverter.formatDiameter(geometryStats.maxDiameter, currentUnit)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{localizationService.t('points')}</Text>
            <Text style={styles.statValue}>{geometryStats.pointCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{localizationService.t('volume')}</Text>
            <Text style={styles.statValue}>{localizationService.formatNumber(geometryStats.volume / 1000, 1)}L</Text>
          </View>
        </View>
      )}
      
      <View style={styles.inputActions}>
        <TouchableOpacity
          style={[styles.button, styles.analyzeButton]}
          onPress={onAnalyze}
          disabled={isAnalyzing || !geometry.trim()}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? localizationService.t('analyzing') : localizationService.t('analyze')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.visualizeButton]}
          onPress={onToggleVisualization}
          disabled={!geometry.trim()}
        >
          <Text style={styles.buttonText}>
            {showVisualization ? localizationService.t('hide') : localizationService.t('visualize')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  geometryContainer: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.borderRadius,
    padding: dimensions.cardPadding,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputTitle: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: spacing.sm,
    textAlign: 'center',
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
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: dimensions.borderRadius / 2,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontFamily: 'Courier',
    fontSize: typography.input,
    padding: spacing.md,
    minHeight: dimensions.inputHeight,
    textAlignVertical: 'top',
  },
  validationErrorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  validationErrorText: {
    fontSize: typography.bodySmall,
    color: '#DC2626',
    fontWeight: '500',
  },
  geometryStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.caption,
    color: '#16A34A',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#15803D',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: dimensions.buttonHeight,
    borderRadius: dimensions.borderRadius / 2,
    alignItems: 'center',
    justifyContent: 'center',
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