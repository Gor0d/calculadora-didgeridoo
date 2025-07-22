import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './OnboardingScreen';
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
      const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboardingCompleted === 'true') {
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.warn('Error checking onboarding status:', error);
      setShowOnboarding(true); // Show onboarding if there's an error
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
    <View style={styles.container}>
      <StatusBar 
        barStyle={showOnboarding ? "light-content" : "dark-content"}
        backgroundColor={showOnboarding ? "transparent" : "#F8FAFC"}
        translucent={deviceInfo.isIOS}
      />
      
      {showOnboarding ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});