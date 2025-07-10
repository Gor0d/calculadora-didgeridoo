import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    isSmall: false,
    isTablet: false,
    hasNotch: false,
    hasDynamicIsland: false,
    statusBarHeight: 0,
    safeAreaTop: 0,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const { width, height } = Dimensions.get('window');
      const statusBarHeight = getStatusBarHeight();
      
      // Detectar iPhone com Dynamic Island
      const hasDynamicIsland = Platform.OS === 'ios' && 
        (width === 393 || width === 430) && // iPhone 14 Pro/Pro Max
        statusBarHeight > 44;
      
      // Detectar notch
      const hasNotch = Platform.OS === 'ios' && statusBarHeight > 20;
      
      setDeviceInfo({
        width,
        height,
        isSmall: width < 375,
        isTablet: width >= 768,
        hasNotch,
        hasDynamicIsland,
        statusBarHeight,
        safeAreaTop: Math.max(statusBarHeight, 44),
      });
    };

    updateDeviceInfo();
    
    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);
    return () => subscription?.remove();
  }, []);

  return deviceInfo;
};