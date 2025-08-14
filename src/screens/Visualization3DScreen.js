import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Visualization3D } from '../components/Visualization3D';
import { getDeviceInfo } from '../utils/responsive';

const deviceInfo = getDeviceInfo();

export const Visualization3DScreen = ({ navigation, route }) => {
  const { analysisData, geometry } = route.params || {};

  return (
    <View style={styles.container}>
      <Visualization3D
        visible={true}
        onClose={() => navigation.goBack()}
        analysisData={analysisData}
        geometry={geometry}
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