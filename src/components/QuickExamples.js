import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet
} from 'react-native';
import { AppIcon } from './IconSystem';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getDeviceInfo, getTypography, getSpacing, getResponsiveDimensions } from '../utils/responsive';
import { unitConverter } from '../services/units/UnitConverter';
import { localizationService } from '../services/i18n/LocalizationService';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();
const dimensions = getResponsiveDimensions();

export const QuickExamples = ({ onSelectExample, onLoadFile, currentUnit = 'metric', onNewProject }) => {
  const [selectedExample, setSelectedExample] = useState(null);
  
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

  const handleSelectExample = (example, index) => {
    setSelectedExample(index);
    onSelectExample({ geometry: example.data, name: example.name });
    
    // Auto-scroll to geometry table (if available)
    if (onNewProject) {
      setTimeout(() => {
        onNewProject();
      }, 300);
    }
  };

  return (
    <View style={styles.examplesSection}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity 
          style={styles.newProjectButton} 
          onPress={() => onNewProject && onNewProject()}
        >
          <AppIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.newProjectText}>{localizationService.t('newProject') || 'Novo Projeto'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loadFileButton} onPress={handleLoadFile}>
          <AppIcon name="folder" size={14} color="#3B82F6" />
          <Text style={styles.loadFileText}>{localizationService.t('loadFile')}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.exampleScrollContainer}
        style={styles.exampleScrollView}
      >
        {examples.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.exampleCard,
              selectedExample === index && styles.exampleCardSelected
            ]}
            onPress={() => handleSelectExample(example, index)}
          >
            <View style={styles.cardContent}>
              <Text style={[
                styles.exampleName,
                selectedExample === index && styles.exampleNameSelected
              ]}>
                {example.name}
              </Text>
              <Text style={styles.exampleDesc} numberOfLines={2} ellipsizeMode="tail">
                {example.desc}
              </Text>
              <Text style={styles.exampleLines}>
                {example.data.split('\n').length} {localizationService.t('points').toLowerCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={[styles.exampleCard, styles.addCustomCard]}
          onPress={() => Alert.alert(
            localizationService.t('shareDesign') || 'Compartilhar Design',
            localizationService.t('shareDesignDesc') || 'Envie suas medidas para adicionarmos aqui!'
          )}
        >
          <AppIcon name="plus" size={24} color="#8B5CF6" />
          <Text style={styles.addCustomLabel}>{localizationService.t('yourDesign') || 'Seu Design'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  examplesSection: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: '#10B981',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  newProjectText: {
    fontSize: typography.button,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: spacing.xs,
  },
  loadFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  loadFileText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: spacing.xs,
  },
  exampleScrollView: {
    marginHorizontal: -spacing.xs,
  },
  exampleScrollContainer: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.xl,
    alignItems: 'flex-start',
  },
  exampleCard: {
    width: deviceInfo.isTablet ? 200 : 160,
    minWidth: deviceInfo.isTablet ? 200 : 160,
    minHeight: deviceInfo.isTablet ? 140 : 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
    marginRight: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
  },
  exampleCardSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    transform: [{ scale: 1.03 }],
  },
  addCustomCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: deviceInfo.isTablet ? 140 : 120,
  },
  exampleName: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  exampleNameSelected: {
    color: '#059669',
  },
  exampleDesc: {
    fontSize: typography.caption,
    color: '#64748B',
    marginVertical: spacing.xs,
    lineHeight: typography.caption * 1.3,
    textAlign: 'left',
    flexShrink: 1,
  },
  exampleLines: {
    fontSize: typography.caption,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'left',
  },
  addCustomText: {
    fontSize: typography.h3,
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  addCustomLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
});