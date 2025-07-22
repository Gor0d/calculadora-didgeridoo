import React from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getDeviceInfo, getTypography, getSpacing, getResponsiveDimensions } from '../utils/responsive';
import { unitConverter } from '../services/units/UnitConverter';
import { localizationService } from '../services/i18n/LocalizationService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();
const dimensions = getResponsiveDimensions();

export const QuickExamples = ({ onSelectExample, onLoadFile, currentUnit = 'metric' }) => {
  // Base examples in metric (cm/mm)
  const metricExamples = [
    { name: localizationService.t('traditional'), data: `0 28\n50 26\n100 30\n150 38`, desc: localizationService.t('traditionalDesc') },
    { name: localizationService.t('straight'), data: `0 30\n50 30\n100 30\n150 30`, desc: localizationService.t('straightDesc') },
    { name: localizationService.t('bell'), data: `0 25\n80 28\n120 35\n150 50`, desc: localizationService.t('bellDesc') },
    { name: localizationService.t('wavy'), data: `0 28\n30 32\n60 28\n90 35\n120 30\n150 40`, desc: localizationService.t('wavyDesc') },
    { name: localizationService.t('aggressive'), data: `0 25\n40 22\n80 35\n110 28\n150 45`, desc: localizationService.t('aggressiveDesc') },
    { name: localizationService.t('precision'), data: `0 29.5\n25 28.2\n50 27.8\n75 29.1\n100 31.5\n125 34.2\n150 37.8`, desc: localizationService.t('precisionDesc') },
    { name: localizationService.t('biodrone'), data: `0 28\n40 26\n80 29\n120 33\n160 38`, desc: localizationService.t('biodroneDesc') },
    { name: 'Renan D-155', data: `0 30\n10 30\n20 30\n30 30\n40 30\n50 30\n60 30\n70 35\n80 35\n90 40\n100 40\n110 40\n120 45\n130 55\n140 50\n150 75\n155 75`, desc: 'Template profissional do Renan - D155cm' },
  ];

  // Convert examples to current unit system
  const examples = metricExamples.map(example => {
    if (currentUnit === 'imperial') {
      try {
        const points = unitConverter.parseGeometry(example.data, 'metric');
        const convertedData = unitConverter.formatGeometryForDisplay(points, 'imperial');
        return { ...example, data: convertedData };
      } catch (error) {
        console.warn('Error converting example to imperial:', error);
        return example;
      }
    }
    return example;
  });

  const handleLoadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        onLoadFile(fileContent, result.assets[0].name);
      }
    } catch (error) {
      Alert.alert(localizationService.t('fileError'), localizationService.t('fileError'));
    }
  };

  return (
    <View style={styles.examplesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{localizationService.t('quickExamples')}</Text>
        <TouchableOpacity style={styles.loadFileButton} onPress={handleLoadFile}>
          <Text style={styles.loadFileText}>{localizationService.t('loadFile')}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exampleScrollContainer}>
        {examples.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exampleCard}
            onPress={() => onSelectExample({ geometry: example.data, name: example.name })}
          >
            <Text style={styles.exampleName}>{example.name}</Text>
            <Text style={styles.exampleDesc}>{example.desc}</Text>
            <Text style={styles.exampleLines}>{example.data.split('\n').length} {localizationService.t('points').toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={[styles.exampleCard, styles.addCustomCard]}
          onPress={() => Alert.alert(
            localizationService.t('shareDesign') || 'Compartilhar Design',
            localizationService.t('shareDesignDesc') || 'Envie suas medidas para adicionarmos aqui!'
          )}
        >
          <Text style={styles.addCustomText}>➕</Text>
          <Text style={styles.addCustomLabel}>{localizationService.t('yourDesign') || 'Seu Design'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  examplesSection: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h5,
    color: '#64748B',
    fontWeight: '600',
  },
  loadFileButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  loadFileText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#22D3EE',
  },
  exampleScrollContainer: {
    paddingRight: spacing.lg,
  },
  exampleCard: {
    width: deviceInfo.width * 0.4,
    minWidth: deviceInfo.isTablet ? 180 : 140,
    height: deviceInfo.isTablet ? 120 : 100,
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.borderRadius,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    marginRight: spacing.md,
    justifyContent: 'space-between',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addCustomCard: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F472B6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleName: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: spacing.xs,
  },
  exampleDesc: {
    fontSize: typography.caption,
    color: '#64748B',
    marginBottom: spacing.xs,
  },
  exampleLines: {
    fontSize: typography.caption,
    color: '#94A3B8',
  },
  addCustomText: {
    fontSize: typography.h4,
    color: '#F472B6',
    textAlign: 'center',
  },
  addCustomLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#F472B6',
    textAlign: 'center',
  },
});