import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TipsSettings } from '../components/TipsSettings';
import { getDeviceInfo } from '../utils/responsive';

const deviceInfo = getDeviceInfo();

export const TipsSettingsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TipsSettings
        visible={true}
        onClose={() => navigation.goBack()}
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