import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { AppWrapper } from './src/components/AppWrapper';
import { TabNavigator } from './src/navigation/TabNavigator';
import OnboardingScreen from './src/components/OnboardingScreen';
import { unitConverter } from './src/services/units/UnitConverter';
import { localizationService } from './src/services/i18n/LocalizationService';
import { ProjectStorage } from './src/services/storage/ProjectStorage';
import { OfflineManager } from './src/services/offline/OfflineManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [currentUnit, setCurrentUnit] = useState('metric');
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  // Initialize app on start
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize localization
        await localizationService.initialize();
        setCurrentLanguage(localizationService.getCurrentLanguage());
        setIsI18nInitialized(true);

        // Initialize offline manager
        console.log('Initializing offline manager...');
        await OfflineManager.initialize();

        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
        
        setIsAppInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsI18nInitialized(true);
        setIsAppInitialized(true);
      }
    };

    initApp();
  }, []);

  const handleUnitChange = (newUnit) => {
    if (newUnit === currentUnit) return;
    setCurrentUnit(newUnit);
  };

  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;
    
    try {
      const success = await localizationService.setLanguage(newLanguage);
      if (success) {
        setCurrentLanguage(newLanguage);
        // Force re-render of all translated components
        setIsI18nInitialized(false);
        setTimeout(() => setIsI18nInitialized(true), 100);
      }
    } catch (error) {
      console.warn('Error changing language:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const projects = await ProjectStorage.getAllProjects();
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        projects,
        settings: {
          language: currentLanguage,
          unit: currentUnit,
        }
      };

      // This would typically save to a file or share
      console.log('Export data:', exportData);
      Alert.alert(
        localizationService.t('exportData'),
        localizationService.t('exportDataSuccess'),
        [{ text: localizationService.t('ok') }]
      );
    } catch (error) {
      Alert.alert(
        localizationService.t('exportData'),
        localizationService.t('exportDataError'),
        [{ text: localizationService.t('ok') }]
      );
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importData = JSON.parse(fileContent);
        
        // Validate and import data
        if (importData.projects) {
          for (const project of importData.projects) {
            await ProjectStorage.saveProject(project);
          }
          
          Alert.alert(
            localizationService.t('importData'),
            localizationService.t('importDataSuccess'),
            [{ text: localizationService.t('ok') }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        localizationService.t('importData'),
        localizationService.t('importDataError'),
        [{ text: localizationService.t('ok') }]
      );
    }
  };

  const handleResetApp = async () => {
    try {
      await ProjectStorage.clearAllProjects();
      setCurrentUnit('metric');
      setCurrentLanguage('pt-BR');
      await localizationService.setLanguage('pt-BR');
      
      Alert.alert(
        localizationService.t('resetApp'),
        localizationService.t('resetAppSuccess'),
        [{ text: localizationService.t('ok') }]
      );
    } catch (error) {
      Alert.alert(
        localizationService.t('resetApp'),
        localizationService.t('resetAppError'),
        [{ text: localizationService.t('ok') }]
      );
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      setShowOnboarding(false);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      Alert.alert(
        localizationService.t('resetOnboarding'),
        localizationService.t('resetOnboardingSuccess'),
        [{ text: localizationService.t('ok') }]
      );
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  // Don't render until app is fully initialized
  if (!isAppInitialized || !isI18nInitialized) {
    return null;
  }

  // Show onboarding if user hasn't seen it
  if (showOnboarding) {
    return (
      <AppWrapper>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper>
      <TabNavigator
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        currentUnit={currentUnit}
        onUnitChange={handleUnitChange}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetApp={handleResetApp}
        onResetOnboarding={handleResetOnboarding}
      />
    </AppWrapper>
  );
}