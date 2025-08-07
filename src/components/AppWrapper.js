import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './OnboardingScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { getDeviceInfo } from '../utils/responsive';

const ONBOARDING_KEY = '@didgemap_onboarding_completed';
const deviceInfo = getDeviceInfo();

export const AppWrapper = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // TEMPORARIAMENTE DESABILITADO PARA TESTE
      setShowOnboarding(false);
      
      // const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
      // if (onboardingCompleted === 'true') {
      //   setShowOnboarding(false);
      // } else {
      //   setShowOnboarding(true);
      // }
    } catch (error) {
      console.warn('Error checking onboarding status:', error);
      setShowOnboarding(false); // Não mostrar onboarding se houver erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.warn('Error saving onboarding status:', error);
      setShowOnboarding(false); // Still proceed even if saving fails
    }
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar 
          barStyle={showOnboarding ? "light-content" : "dark-content"}
          backgroundColor={showOnboarding ? "#10B981" : "#F8FAFC"}
          translucent={false}
        />
        
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          {showOnboarding ? (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          ) : (
            <View style={styles.childrenContainer}>
              {children}
            </View>
          )}
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  childrenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});