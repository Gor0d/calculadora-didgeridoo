import { Dimensions, PixelRatio, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Responsive scaling function
export const scale = (size) => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(size * scaleRatio));
};

// Vertical scaling (for heights)
export const verticalScale = (size) => {
  const scaleRatio = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(PixelRatio.roundToNearestPixel(size * scaleRatio));
};

// Moderate scaling (for responsive design)
export const moderateScale = (size, factor = 0.5) => {
  return scale(size) + (scale(size) - size) * factor;
};

// Get device info for responsive design
export const getDeviceInfo = () => {
  const statusBarHeight = getStatusBarHeight();
  
  // Device type detection
  const isSmallDevice = SCREEN_WIDTH < 375;
  const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
  const isLargeDevice = SCREEN_WIDTH >= 414;
  const isTablet = SCREEN_WIDTH >= 768;
  
  // iOS specific detection
  const isIOS = Platform.OS === 'ios';
  
  // Dynamic Island detection (iPhone 14 Pro/Pro Max and newer)
  const hasDynamicIsland = isIOS && 
    ((SCREEN_WIDTH === 393 && SCREEN_HEIGHT === 852) || // iPhone 14 Pro
     (SCREEN_WIDTH === 430 && SCREEN_HEIGHT === 932) || // iPhone 14 Pro Max
     (SCREEN_WIDTH === 393 && SCREEN_HEIGHT === 852) || // iPhone 15 Pro
     (SCREEN_WIDTH === 430 && SCREEN_HEIGHT === 932));  // iPhone 15 Pro Max
  
  // Notch detection (iPhone X series)
  const hasNotch = isIOS && statusBarHeight > 20 && !hasDynamicIsland;
  
  // Safe area calculation
  const safeAreaTop = Math.max(statusBarHeight, hasDynamicIsland ? 59 : hasNotch ? 44 : 20);
  const safeAreaBottom = isIOS && (hasNotch || hasDynamicIsland) ? 34 : 0;
  
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isIOS,
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

// Export screen dimensions for direct access
export { SCREEN_WIDTH, SCREEN_HEIGHT };