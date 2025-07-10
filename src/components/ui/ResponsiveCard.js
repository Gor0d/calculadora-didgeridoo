import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';

export const ResponsiveCard = ({ 
  children, 
  style, 
  spacing = 'normal' // 'tight', 'normal', 'loose'
}) => {
  const deviceInfo = useDeviceInfo();

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: 'white',
      borderRadius: deviceInfo.isSmall ? 12 : 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };

    const spacingMap = {
      tight: deviceInfo.isSmall ? 12 : 16,
      normal: deviceInfo.isSmall ? 16 : 20,
      loose: deviceInfo.isSmall ? 20 : 25,
    };

    return {
      ...baseStyle,
      padding: spacingMap[spacing],
      marginBottom: deviceInfo.isSmall ? 12 : 20,
    };
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};