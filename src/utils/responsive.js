import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Responsive scaling function with device type awareness
export const scale = (size) => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  
  // Apply more conservative scaling for larger devices
  let adjustedRatio = scaleRatio;
  if (SCREEN_WIDTH >= 768) {
    adjustedRatio = Math.min(scaleRatio, 1.5); // Limit tablet scaling
  } else if (SCREEN_WIDTH >= 414) {
    adjustedRatio = Math.min(scaleRatio, 1.3); // Limit large phone scaling
  }
  
  return Math.round(PixelRatio.roundToNearestPixel(size * adjustedRatio));
};

// Vertical scaling (for heights) with intelligent limits
export const verticalScale = (size) => {
  const scaleRatio = SCREEN_HEIGHT / BASE_HEIGHT;
  
  // More conservative vertical scaling to prevent overly tall elements
  const adjustedRatio = Math.min(scaleRatio, SCREEN_WIDTH >= 768 ? 1.3 : 1.4);
  return Math.round(PixelRatio.roundToNearestPixel(size * adjustedRatio));
};

// Moderate scaling (for responsive design)
export const moderateScale = (size, factor = 0.5) => {
  const scaledSize = scale(size);
  return Math.round(PixelRatio.roundToNearestPixel(size + (scaledSize - size) * factor));
};

// Get device info for responsive design
export const getDeviceInfo = () => {
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  
  // Device type detection
  const isSmallDevice = SCREEN_WIDTH < 375;
  const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
  const isLargeDevice = SCREEN_WIDTH >= 414;
  const isTablet = SCREEN_WIDTH >= 768;
  
  // iOS specific detection
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  // Dynamic Island detection (iPhone 14 Pro/Pro Max and newer)
  const hasDynamicIsland = isIOS && 
    ((SCREEN_WIDTH === 393 && SCREEN_HEIGHT === 852) || // iPhone 14 Pro
     (SCREEN_WIDTH === 430 && SCREEN_HEIGHT === 932) || // iPhone 14 Pro Max
     (SCREEN_WIDTH === 393 && SCREEN_HEIGHT === 852) || // iPhone 15 Pro
     (SCREEN_WIDTH === 430 && SCREEN_HEIGHT === 932));  // iPhone 15 Pro Max
  
  // Notch detection (iPhone X series)
  const hasNotch = isIOS && statusBarHeight > 20 && !hasDynamicIsland;
  
  // Safe area calculation with better Android support
  let safeAreaTop = 20; // Default
  let safeAreaBottom = 0; // Default
  
  if (isIOS) {
    safeAreaTop = Math.max(statusBarHeight, hasDynamicIsland ? 59 : hasNotch ? 44 : 20);
    safeAreaBottom = (hasNotch || hasDynamicIsland) ? 34 : 0;
  } else if (isAndroid) {
    safeAreaTop = Math.max(statusBarHeight || 24, 24);
    // Android devices with gesture navigation
    safeAreaBottom = SCREEN_HEIGHT > 800 ? 24 : 0;
  }
  
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isIOS,
    isAndroid,
    hasNotch,
    hasDynamicIsland,
    statusBarHeight,
    safeAreaTop,
    safeAreaBottom,
    usableHeight: SCREEN_HEIGHT - safeAreaTop - safeAreaBottom,
  };
};

// Responsive dimensions for different device types
export const getResponsiveDimensions = () => {
  const deviceInfo = getDeviceInfo();
  
  return {
    // Horizontal margins
    marginHorizontal: deviceInfo.isTablet ? scale(32) : 
                     deviceInfo.isLargeDevice ? scale(20) :
                     deviceInfo.isMediumDevice ? scale(16) : scale(12),
    
    // Vertical margins
    marginVertical: deviceInfo.isTablet ? verticalScale(24) :
                   deviceInfo.isLargeDevice ? verticalScale(16) :
                   verticalScale(12),
    
    // Card padding
    cardPadding: deviceInfo.isTablet ? scale(24) :
                deviceInfo.isLargeDevice ? scale(20) :
                deviceInfo.isMediumDevice ? scale(16) : scale(12),
    
    // Border radius
    borderRadius: deviceInfo.isTablet ? scale(20) :
                 deviceInfo.isLargeDevice ? scale(16) :
                 scale(12),
    
    // Button heights
    buttonHeight: deviceInfo.isTablet ? verticalScale(56) :
                 deviceInfo.isLargeDevice ? verticalScale(48) :
                 verticalScale(44),
    
    // Input heights
    inputHeight: deviceInfo.isTablet ? verticalScale(200) :
                deviceInfo.isLargeDevice ? verticalScale(180) :
                deviceInfo.isMediumDevice ? verticalScale(160) :
                verticalScale(140),
    
    // Header heights
    headerHeight: deviceInfo.isTablet ? verticalScale(120) :
                 deviceInfo.isLargeDevice ? verticalScale(100) :
                 verticalScale(80),
  };
};

// Typography scaling
export const getTypography = () => {
  const deviceInfo = getDeviceInfo();
  
  const baseScale = deviceInfo.isTablet ? 1.3 :
                   deviceInfo.isLargeDevice ? 1.1 :
                   deviceInfo.isMediumDevice ? 1.0 : 0.9;
  
  return {
    // Headers
    h1: moderateScale(32 * baseScale),
    h2: moderateScale(28 * baseScale),
    h3: moderateScale(24 * baseScale),
    h4: moderateScale(20 * baseScale),
    h5: moderateScale(18 * baseScale),
    h6: moderateScale(16 * baseScale),
    
    // Body text
    body: moderateScale(16 * baseScale),
    bodySmall: moderateScale(14 * baseScale),
    caption: moderateScale(12 * baseScale),
    
    // UI elements
    button: moderateScale(16 * baseScale),
    input: moderateScale(16 * baseScale),
    badge: moderateScale(12 * baseScale),
  };
};

// Spacing system
export const getSpacing = () => {
  const deviceInfo = getDeviceInfo();
  
  const baseUnit = deviceInfo.isTablet ? 8 : 
                  deviceInfo.isLargeDevice ? 6 :
                  deviceInfo.isMediumDevice ? 5 : 4;
  
  return {
    xs: scale(baseUnit),           // 4-8px
    sm: scale(baseUnit * 2),       // 8-16px  
    md: scale(baseUnit * 3),       // 12-24px
    lg: scale(baseUnit * 4),       // 16-32px
    xl: scale(baseUnit * 6),       // 24-48px
    xxl: scale(baseUnit * 8),      // 32-64px
  };
};

// Layout helpers
export const getLayoutStyles = () => {
  const deviceInfo = getDeviceInfo();
  const dimensions = getResponsiveDimensions();
  const spacing = getSpacing();
  
  return {
    container: {
      flex: 1,
      paddingTop: deviceInfo.safeAreaTop,
      paddingBottom: deviceInfo.safeAreaBottom,
      paddingHorizontal: dimensions.marginHorizontal,
    },
    
    safeArea: {
      paddingTop: deviceInfo.safeAreaTop,
      paddingBottom: deviceInfo.safeAreaBottom,
    },
    
    card: {
      padding: dimensions.cardPadding,
      borderRadius: dimensions.borderRadius,
      marginBottom: spacing.md,
    },
    
    button: {
      height: dimensions.buttonHeight,
      borderRadius: dimensions.borderRadius / 2,
      paddingHorizontal: spacing.lg,
    },
    
    input: {
      minHeight: dimensions.inputHeight,
      borderRadius: dimensions.borderRadius / 2,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  };
};

// Breakpoints for responsive design
export const getBreakpoints = () => ({
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
});

// Function to get responsive values based on screen size
export const useResponsiveValue = (values) => {
  if (typeof values !== 'object') return values;
  
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isTablet && values.tablet) return values.tablet;
  if (deviceInfo.isLargeDevice && values.large) return values.large;
  if (deviceInfo.isMediumDevice && values.medium) return values.medium;
  if (deviceInfo.isSmallDevice && values.small) return values.small;
  
  return values.default || values;
};

// Enhanced icon sizing system
export const getIconSizes = () => {
  const deviceInfo = getDeviceInfo();
  
  const baseScale = deviceInfo.isTablet ? 1.4 :
                   deviceInfo.isLargeDevice ? 1.2 :
                   deviceInfo.isMediumDevice ? 1.0 : 0.9;
  
  return {
    xs: scale(12 * baseScale),
    sm: scale(16 * baseScale),
    md: scale(20 * baseScale),
    lg: scale(24 * baseScale),
    xl: scale(28 * baseScale),
    xxl: scale(32 * baseScale),
    xxxl: scale(40 * baseScale),
    
    // Specific use cases
    tabIcon: scale(22 * baseScale),
    buttonIcon: scale(18 * baseScale),
    headerIcon: scale(26 * baseScale),
    cardIcon: scale(20 * baseScale)
  };
};

// Enhanced layout helpers with better island support
export const getLayoutConstraints = () => {
  const deviceInfo = getDeviceInfo();
  
  return {
    // Maximum content width for readability
    maxContentWidth: deviceInfo.isTablet ? scale(800) : SCREEN_WIDTH,
    
    // Minimum touch target size (following accessibility guidelines)
    minTouchTarget: scale(44),
    
    // Recommended spacing for dynamic island
    dynamicIslandSpacing: deviceInfo.hasDynamicIsland ? scale(16) : 0,
    
    // Safe scrollable height
    safeScrollHeight: deviceInfo.usableHeight - scale(100),
    
    // Optimal card width for different screen sizes
    cardWidth: deviceInfo.isTablet ? '45%' : '100%',
    
    // Grid system
    gridCols: deviceInfo.isTablet ? 3 : deviceInfo.isLargeDevice ? 2 : 1
  };
};

// Export screen dimensions for direct access
export { SCREEN_WIDTH, SCREEN_HEIGHT };