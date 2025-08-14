import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AIRecommendations } from '../components/AIRecommendations';
import { getDeviceInfo } from '../utils/responsive';

const deviceInfo = getDeviceInfo();

export const AIRecommendationsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <AIRecommendations
        visible={true}
        onClose={() => navigation.goBack()}
        onSelectRecommendation={(recommendation) => {
          // Navigate back to main tabs and pass recommendation data to home
          navigation.navigate('MainTabs', { 
            screen: 'Home', 
            params: { recommendation } 
          });
        }}
        initialPreferences={{
          targetNote: 'D',
          targetOctave: 2,
          experience: 'beginner'
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});