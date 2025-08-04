import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  MaterialIcons, 
  Ionicons, 
  Feather, 
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome5
} from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

// Sistema de ícones personalizado para o app de didgeridoo
export const AppIcon = ({ 
  name, 
  size = 24, 
  color = '#6B7280', 
  style,
  ...props 
}) => {
  const iconStyle = [styles.iconContainer, style];

  const renderIcon = () => {
    switch (name) {
      // Ícones de navegação
      case 'home':
        return <MaterialIcons name="home" size={size} color={color} {...props} />;
      case 'settings':
        return <Ionicons name="settings-outline" size={size} color={color} {...props} />;
      case 'calculate':
        return <MaterialIcons name="calculate" size={size} color={color} {...props} />;
      
      // Ícones de ação
      case 'analyze':
        return <MaterialCommunityIcons name="waveform" size={size} color={color} {...props} />;
      case 'play':
        return <Ionicons name="play-circle-outline" size={size} color={color} {...props} />;
      case 'pause':
        return <Ionicons name="pause-circle-outline" size={size} color={color} {...props} />;
      case 'stop':
        return <Ionicons name="stop-circle-outline" size={size} color={color} {...props} />;
      case 'record':
        return <MaterialIcons name="fiber-manual-record" size={size} color={color} {...props} />;
      
      // Ícones de visualização
      case 'visualization':
        return <MaterialCommunityIcons name="chart-line" size={size} color={color} {...props} />;
      case 'graph':
        return <Feather name="bar-chart-2" size={size} color={color} {...props} />;
      case 'wave':
        return <MaterialCommunityIcons name="sine-wave" size={size} color={color} {...props} />;
      case 'spectrum':
        return <MaterialCommunityIcons name="waveform" size={size} color={color} {...props} />;
      
      // Ícones de projeto
      case 'project':
        return <MaterialIcons name="folder-open" size={size} color={color} {...props} />;
      case 'save':
        return <MaterialIcons name="save" size={size} color={color} {...props} />;
      case 'load':
        return <MaterialIcons name="folder-open" size={size} color={color} {...props} />;
      case 'new':
        return <MaterialIcons name="add-circle-outline" size={size} color={color} {...props} />;
      case 'delete':
        return <MaterialIcons name="delete-outline" size={size} color={color} {...props} />;
      
      // Ícones de exportação
      case 'export':
        return <MaterialIcons name="file-upload" size={size} color={color} {...props} />;
      case 'import':
        return <MaterialIcons name="file-download" size={size} color={color} {...props} />;
      case 'share':
        return <Ionicons name="share-outline" size={size} color={color} {...props} />;
      case 'pdf':
        return <MaterialCommunityIcons name="file-pdf-box" size={size} color={color} {...props} />;
      case 'audio':
        return <MaterialIcons name="audiotrack" size={size} color={color} {...props} />;
      
      // Ícones de configuração
      case 'language':
        return <MaterialIcons name="language" size={size} color={color} {...props} />;
      case 'units':
        return <MaterialCommunityIcons name="ruler" size={size} color={color} {...props} />;
      case 'offline':
        return <MaterialCommunityIcons name="wifi-off" size={size} color={color} {...props} />;
      case 'online':
        return <MaterialCommunityIcons name="wifi" size={size} color={color} {...props} />;
      case 'performance':
        return <MaterialCommunityIcons name="speedometer" size={size} color={color} {...props} />;
      
      // Ícones de tutorial
      case 'tutorial':
        return <MaterialIcons name="school" size={size} color={color} {...props} />;
      case 'help':
        return <MaterialIcons name="help-outline" size={size} color={color} {...props} />;
      case 'info':
        return <MaterialIcons name="info-outline" size={size} color={color} {...props} />;
      case 'tips':
        return <MaterialCommunityIcons name="lightbulb-outline" size={size} color={color} {...props} />;
      
      // Ícones de status
      case 'success':
        return <MaterialIcons name="check-circle" size={size} color={color} {...props} />;
      case 'error':
        return <MaterialIcons name="error-outline" size={size} color={color} {...props} />;
      case 'warning':
        return <MaterialIcons name="warning" size={size} color={color} {...props} />;
      case 'loading':
        return <MaterialCommunityIcons name="loading" size={size} color={color} {...props} />;
      
      // Ícones de navegação
      case 'back':
        return <Ionicons name="arrow-back" size={size} color={color} {...props} />;
      case 'forward':
        return <Ionicons name="arrow-forward" size={size} color={color} {...props} />;
      case 'up':
        return <Ionicons name="chevron-up" size={size} color={color} {...props} />;
      case 'down':
        return <Ionicons name="chevron-down" size={size} color={color} {...props} />;
      case 'close':
        return <Ionicons name="close" size={size} color={color} {...props} />;
      
      // Ícone especial do didgeridoo (customizado)
      case 'didgeridoo':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2 12L22 12M2 12C2 10 3 8 5 8H19C21 8 22 10 22 12M2 12C2 14 3 16 5 16H19C21 16 22 14 22 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="3" cy="12" r="1" fill={color} />
            <Circle cx="21" cy="12" r="2" fill={color} opacity="0.5" />
          </Svg>
        );
      
      // Ícone de frequência
      case 'frequency':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 12H21M7 8V16M11 6V18M15 4V20M19 7V17"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        );
      
      // Ícone de harmônicos
      case 'harmonics':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2 12C2 12 4 8 6 12C8 16 10 8 12 12C14 16 16 8 18 12C20 16 22 12 22 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      
      // Ícone de geometria
      case 'geometry':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2 20L8 4L14 12L20 2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="2" cy="20" r="2" fill={color} opacity="0.3" />
            <Circle cx="8" cy="4" r="2" fill={color} opacity="0.5" />
            <Circle cx="14" cy="12" r="2" fill={color} opacity="0.7" />
            <Circle cx="20" cy="2" r="2" fill={color} />
          </Svg>
        );
      
      default:
        return <MaterialIcons name="help-outline" size={size} color={color} {...props} />;
    }
  };

  return (
    <View style={iconStyle}>
      {renderIcon()}
    </View>
  );
};

// Componente para ícones com badges
export const BadgedIcon = ({ 
  name, 
  size = 24, 
  color = '#6B7280', 
  badgeCount, 
  badgeColor = '#EF4444',
  style 
}) => {
  return (
    <View style={[styles.badgedIconContainer, style]}>
      <AppIcon name={name} size={size} color={color} />
      {badgeCount > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// Componente para ícones animados
export const AnimatedIcon = ({ 
  name, 
  size = 24, 
  color = '#6B7280', 
  isActive = false,
  activeColor = '#10B981',
  style 
}) => {
  const iconColor = isActive ? activeColor : color;
  
  return (
    <View style={[styles.animatedIconContainer, style, isActive && styles.activeIcon]}>
      <AppIcon name={name} size={size} color={iconColor} />
    </View>
  );
};

// Componente para botões com ícones
export const IconButton = ({ 
  name, 
  size = 24, 
  color = '#6B7280', 
  backgroundColor = 'transparent',
  onPress,
  disabled = false,
  style,
  children
}) => {
  const buttonStyle = [
    styles.iconButton,
    { backgroundColor },
    disabled && styles.disabledButton,
    style
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.7}
    >
      <AppIcon 
        name={name} 
        size={size} 
        color={disabled ? '#9CA3AF' : color} 
      />
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgedIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  animatedIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 4,
    transition: 'all 0.2s ease',
  },
  activeIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    transform: [{ scale: 1.1 }],
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    minWidth: 44,
    minHeight: 44,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AppIcon;