import React from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Platform, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeviceInfo } from '../../hooks/useDeviceInfo'; // Caminho correto: sai de ui/ -> sai de components/ -> entra em hooks/

export const ResponsiveLayout = ({ 
  children, 
  headerComponent, 
  backgroundColor = '#F5F5DC',
  headerGradient = ['#667eea', '#764ba2'],
  showStatusBar = true,
  statusBarStyle = 'light-content',
  contentContainerStyle = {},
  headerStyle = {}
}) => {
  const deviceInfo = useDeviceInfo();

  const getDynamicPadding = () => {
    if (deviceInfo.hasDynamicIsland) {
      return {
        paddingTop: 70, // Mais espaço para Dynamic Island
        paddingHorizontal: deviceInfo.isTablet ? 40 : 20,
      };
    } else if (deviceInfo.hasNotch) {
      return {
        paddingTop: 60, // Mais espaço para notch
        paddingHorizontal: deviceInfo.isTablet ? 40 : 16,
      };
    } else {
      return {
        paddingTop: deviceInfo.isTablet ? 60 : 50, // Mais espaço geral
        paddingHorizontal: deviceInfo.isSmall ? 12 : (deviceInfo.isTablet ? 40 : 16),
      };
    }
  };

  const getHeaderHeight = () => {
    if (deviceInfo.hasDynamicIsland) return 160; // Aumentado
    if (deviceInfo.hasNotch) return 140; // Aumentado
    if (deviceInfo.isTablet) return 150; // Aumentado
    return 120; // Aumentado
  };

  const getContentPadding = () => {
    if (deviceInfo.isTablet) {
      return {
        paddingHorizontal: 40,
        paddingTop: 20,
      };
    } else if (deviceInfo.isSmall) {
      return {
        paddingHorizontal: 12,
        paddingTop: 16,
      };
    } else {
      return {
        paddingHorizontal: 20,
        paddingTop: 20,
      };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {showStatusBar && (
        <StatusBar 
          barStyle={statusBarStyle}
          backgroundColor="transparent" 
          translucent={true}
        />
      )}
      
      {headerComponent && (
        <LinearGradient 
          colors={headerGradient} 
          style={[
            styles.header, 
            { 
              height: getHeaderHeight(),
              ...getDynamicPadding()
            },
            headerStyle
          ]}
        >
          {headerComponent}
        </LinearGradient>
      )}
      
      <View style={[
        styles.content,
        getContentPadding(),
        {
          marginTop: headerComponent ? -20 : 0,
        },
        contentContainerStyle
      ]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

// Hook utilitário para usar as informações do dispositivo
export const useResponsiveStyles = () => {
  const deviceInfo = useDeviceInfo();
  
  const getResponsiveValue = (small, medium, large, tablet) => {
    if (deviceInfo.isTablet) return tablet || large;
    if (deviceInfo.isSmall) return small;
    if (deviceInfo.width < 414) return medium || small;
    return large || medium || small;
  };

  const spacing = {
    xs: getResponsiveValue(4, 6, 8, 12),
    sm: getResponsiveValue(8, 12, 16, 20),
    md: getResponsiveValue(16, 20, 24, 32),
    lg: getResponsiveValue(24, 32, 40, 48),
    xl: getResponsiveValue(32, 40, 48, 64),
  };

  const fontSize = {
    xs: getResponsiveValue(10, 11, 12, 14),
    sm: getResponsiveValue(12, 13, 14, 16),
    md: getResponsiveValue(14, 15, 16, 18),
    lg: getResponsiveValue(16, 18, 20, 24),
    xl: getResponsiveValue(20, 22, 24, 28),
    xxl: getResponsiveValue(24, 28, 32, 36),
  };

  return {
    deviceInfo,
    getResponsiveValue,
    spacing,
    fontSize,
    isSmallDevice: deviceInfo.isSmall,
    isTablet: deviceInfo.isTablet,
    hasNotch: deviceInfo.hasNotch,
    hasDynamicIsland: deviceInfo.hasDynamicIsland,
  };
};

// Componente de Card responsivo
export const ResponsiveCard = ({ 
  children, 
  style = {}, 
  padding = 'md',
  margin = 'sm',
  backgroundColor = '#FFFFFF',
  borderRadius = 12,
  shadow = true 
}) => {
  const { spacing } = useResponsiveStyles();
  
  const cardStyle = {
    backgroundColor,
    borderRadius,
    padding: spacing[padding],
    margin: spacing[margin],
    ...(shadow && styles.cardShadow),
    ...style,
  };

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

// Componente de Text responsivo
export const ResponsiveText = ({ 
  children, 
  size = 'md', 
  style = {}, 
  color = '#333333',
  weight = 'normal',
  align = 'left',
  ...props 
}) => {
  const { fontSize } = useResponsiveStyles();
  
  const textStyle = {
    fontSize: fontSize[size],
    color,
    fontWeight: weight,
    textAlign: align,
    ...style,
  };

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

// Componente de Button responsivo
export const ResponsiveButton = ({ 
  onPress, 
  title, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  style = {},
  textStyle = {},
  children
}) => {
  const { spacing, fontSize } = useResponsiveStyles();
  
  const buttonSizes = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
    md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  };

  const buttonVariants = {
    primary: { backgroundColor: '#667eea' },
    secondary: { backgroundColor: '#6c757d' },
    success: { backgroundColor: '#28a745' },
    danger: { backgroundColor: '#dc3545' },
    outline: { 
      backgroundColor: 'transparent', 
      borderWidth: 2, 
      borderColor: '#667eea' 
    },
  };

  const buttonStyle = [
    styles.button,
    buttonSizes[size],
    buttonVariants[variant],
    disabled && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    { fontSize: fontSize[size] },
    variant === 'outline' && { color: '#667eea' },
    disabled && styles.buttonTextDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {children || (
        <Text style={buttonTextStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: '#999999',
  },
});

export default ResponsiveLayout;