import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { getDeviceInfo, getSpacing } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const spacing = getSpacing();

export const DynamicLogo = ({ theme, style, ...props }) => {
  const isDark = theme?.name === 'Dark';

  // Definir tamanhos responsivos
  const logoWidth = deviceInfo.isTablet ? 400 : 300;
  const logoHeight = deviceInfo.isTablet ? 113 : 85;

  return (
    <View style={[
      styles.logoContainer,
      isDark && styles.logoContainerDark,
      style
    ]}>
      <Image 
        source={require('../../assets/didgemap.png')} 
        style={[
          styles.logoImage,
          { width: logoWidth, height: logoHeight },
          isDark && styles.logoImageDark
        ]}
        resizeMode="contain"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    // Modo claro - sem decoração
    backgroundColor: 'transparent',
  },
  
  logoContainerDark: {
    // Modo escuro - container com fundo sutil
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  logoImage: {
    // Base da imagem
    marginBottom: spacing.xs,
  },
  
  logoImageDark: {
    // Melhorias para modo escuro
    opacity: 0.95,
    // Glow effect sutil
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});