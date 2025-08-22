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
              <View style={styles.cardHeader}>
                <Text style={[
                  styles.exampleName,
                  selectedExample === index && styles.exampleNameSelected
                ]}>
                  {example.name}
                </Text>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>
                    {example.data.split('\n').length}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#10B981',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newProjectText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.xs,
  },
  loadFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  loadFileText: {
    fontSize: typography.caption,
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
    width: deviceInfo.isTablet ? 180 : 160,
    minWidth: deviceInfo.isTablet ? 180 : 160,
    height: deviceInfo.isTablet ? 110 : 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    marginRight: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#64748B',
  },
  exampleCardSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    transform: [{ scale: 1.03 }],
  },
  exampleName: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
    flex: 1,
    marginRight: spacing.xs,
  },
  exampleNameSelected: {
    color: '#059669',
  },
});