import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { getDeviceInfo, getSpacing } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const spacing = getSpacing();

export const DynamicLogo = ({ theme, style, ...props }) => {
  const isDark = theme?.name === 'Dark';

  // Tamanhos responsivos - mesmo tamanho em ambos os modos
  const logoWidth = deviceInfo.isTablet ? 400 : 300;
  const logoHeight = deviceInfo.isTablet ? 113 : 85;

  // Selecionar logo baseado no tema
  const logoSource = isDark
    ? require('../../assets/logo_dark.png')  // Logo branco para modo escuro
    : require('../../assets/didgemap.png'); // Logo padrão para modo claro

  return (
    <View style={[
      styles.logoContainer,
      isDark && styles.logoContainerDark,
      style
    ]}>
      <Image
        source={logoSource}
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
    backgroundColor: 'transparent',
  },

  logoContainerDark: {
    backgroundColor: 'transparent',
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