import React, { useState, useEffect, useMemo } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { AppIcon } from './IconSystem';
import { getDeviceInfo, getTypography, getSpacing, getResponsiveDimensions } from '../utils/responsive';
import { unitConverter } from '../services/units/UnitConverter';
import { localizationService } from '../services/i18n/LocalizationService';
import { themeService } from '../services/theme/ThemeService';
import { acousticEngine } from '../services/acoustic/AcousticEngine';

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
  const [tableMode, setTableMode] = useState(true);
  const [geometryPairs, setGeometryPairs] = useState([{ position: '', diameter: '' }]);
  const [lastGeometry, setLastGeometry] = useState('');
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

  // Parse geometry string into pairs - only when geometry changes from external source (templates)
  useEffect(() => {
    // Only sync when geometry changed externally (not from our own edits)
    if (geometry !== lastGeometry) {
      setLastGeometry(geometry);
      
      if (geometry) {
        try {
          const points = unitConverter.parseGeometry(geometry, currentUnit);
          const pairs = points.map(point => ({
            position: point.position.toString(),
            diameter: point.diameter.toString()
          }));
          if (pairs.length > 0) {
            setGeometryPairs([...pairs, { position: '', diameter: '' }]);
          }
        } catch (error) {
          // Keep current pairs if parsing fails
        }
      } else {
        // If geometry is empty, reset to single empty pair
        setGeometryPairs([{ position: '', diameter: '' }]);
      }
    }
  }, [geometry, currentUnit, lastGeometry]);

  // Calculate real-time note estimation
  const estimatedNote = useMemo(() => {
    if (!geometry || !geometry.trim()) return null;
    
    try {
      const points = unitConverter.parseGeometry(geometry, currentUnit);
      if (points.length < 2) return null;
      
      // Quick frequency estimation based on geometry
      const effectiveLength = Math.max(...points.map(p => p.position));
      const averageDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;
      
      // Simplified acoustic formula for fundamental frequency
      const speedOfSound = 343; // m/s at 20°C
      const lengthInMeters = effectiveLength / (currentUnit === 'metric' ? 100 : 39.37);
      const frequency = speedOfSound / (2 * lengthInMeters);
      
      // Convert frequency to note
      const A4 = 440;
      const C0 = A4 * Math.pow(2, -4.75);
      const noteNumber = Math.round(12 * Math.log2(frequency / C0));
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octave = Math.floor(noteNumber / 12);
      const note = noteNames[noteNumber % 12];
      
      return `${note}${octave} (${frequency.toFixed(0)}Hz)`;
    } catch (error) {
      return null;
    }
  }, [geometry, currentUnit]);

  const handlePairChange = (index, field, value) => {
    const newPairs = [...geometryPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    
    // Add new empty row if last row is being filled
    if (index === newPairs.length - 1 && (newPairs[index].position || newPairs[index].diameter)) {
      newPairs.push({ position: '', diameter: '' });
    }
    
    setGeometryPairs(newPairs);
    
    // Convert pairs back to geometry string
    // Keep pairs that have at least one field filled, but only convert complete pairs to geometry
    const validPairs = newPairs.filter(pair => pair.position && pair.diameter);
    const geometryString = validPairs.map(pair => `${pair.position} ${pair.diameter}`).join('\n');
    setLastGeometry(geometryString); // Update tracking to prevent sync loop
    onGeometryChange(geometryString);
  };

  const isPositionOrderIncorrect = (pairs, index) => {
    if (index === 0 || !pairs[index].position || !pairs[index-1].position) return false;
    const currentPos = parseFloat(pairs[index].position);
    const prevPos = parseFloat(pairs[index-1].position);
    return currentPos <= prevPos;
  };

  const removePair = (index) => {
    if (geometryPairs.length > 1) {
      const newPairs = geometryPairs.filter((_, i) => i !== index);
      setGeometryPairs(newPairs);
      
      const validPairs = newPairs.filter(pair => pair.position && pair.diameter);
      const geometryString = validPairs.map(pair => `${pair.position} ${pair.diameter}`).join('\n');
      setLastGeometry(geometryString); // Update tracking to prevent sync loop
      onGeometryChange(geometryString);
    }
  };

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
          ? '📏 Posição 0 = bocal, crescente = final. Posição(cm), Diâmetro(mm)' 
          : '📏 Posição 0 = bocal, crescente = final. Posição("), Diâmetro(")'}
      </Text>
      
        <View style={[styles.analysisTable, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.tableHeader, { backgroundColor: colors.primary || '#1F2937' }]}>
            <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Posição</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Diâmetro</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>Ação</Text>
          </View>
          <ScrollView style={styles.tableScrollView} nestedScrollEnabled>
            {geometryPairs.map((pair, index) => (
              <View key={index} style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                isPositionOrderIncorrect(geometryPairs, index) && styles.tableRowWarning
              ]}>
                <TextInput
                  style={[
                    styles.tableCellInput, 
                    { flex: 1.0, color: colors.textPrimary },
                    isPositionOrderIncorrect(geometryPairs, index) && styles.inputWarning
                  ]}
                  value={pair.position}
                  onChangeText={(value) => handlePairChange(index, 'position', value)}
                  placeholder={currentUnit === 'metric' ? '0' : '0'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.tableCellInput, { flex: 1.0, color: colors.textPrimary }]}
                  value={pair.diameter}
                  onChangeText={(value) => handlePairChange(index, 'diameter', value)}
                  placeholder={currentUnit === 'metric' ? '25' : '1.0'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
                <View style={[styles.tableCell, { flex: 0.7 }]}>
                  {geometryPairs.length > 1 && index < geometryPairs.length - 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePair(index)}
                    >
                      <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: 'bold', lineHeight: 16 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <View style={styles.validationErrorContainer}>
          <AppIcon name="warning" size={16} color="#DC2626" />
          <Text style={[styles.validationErrorText, { color: colors.error }]}>
            {validationErrors[0].message}
          </Text>
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
        
        {geometry.trim() && (
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={() => {
              setGeometryPairs([{ position: '', diameter: '' }]);
              setLastGeometry('');
              onGeometryChange('');
            }}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Redefinir
            </Text>
          </TouchableOpacity>
        )}
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
  spreadsheetContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
  },
  spreadsheetHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: spacing.sm,
  },
  columnHeader: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
    color: '#64748B',
  },
  geometryInput: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: '#1E293B',
    fontFamily: 'monospace',
    fontSize: typography.small,
    padding: spacing.md,
    minHeight: dimensions.inputHeight,
    textAlignVertical: 'top',
    lineHeight: typography.small * 1.4,
  },
  spreadsheetInput: {
    marginTop: 0,
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
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  button: {
    flex: 1,
    height: dimensions.buttonHeight * 1.1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  resetButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    fontSize: typography.button,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Mode toggle styles
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 6,
    gap: spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: '#1F2937',
  },
  modeButtonText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  
  // Table styles (similar to analysis table)
  analysisTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: 40,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableScrollView: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    minHeight: 44,
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableRowOdd: {
    backgroundColor: '#FFFFFF',
  },
  tableCellInput: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: 'monospace',
    minHeight: 36,
    textAlignVertical: 'center',
  },
  tableCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minHeight: 36,
  },
  removeButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  tableRowWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  inputWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 4,
  },
});