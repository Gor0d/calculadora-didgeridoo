import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing, useResponsiveValue, getLayoutConstraints } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();
const layoutConstraints = getLayoutConstraints();

// Container principal responsivo
export const ResponsiveContainer = ({ children, style, padding = true }) => {
  const containerStyle = [
    styles.container,
    padding && styles.containerPadding,
    style
  ];

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// ScrollView otimizado para diferentes dispositivos
export const ResponsiveScrollView = ({ children, style, contentContainerStyle, ...props }) => {
  const scrollStyle = [styles.scrollView, style];
  const contentStyle = [
    styles.scrollContent,
    deviceInfo.isTablet && styles.scrollContentTablet,
    contentContainerStyle
  ];

  return (
    <ScrollView
      style={scrollStyle}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// Header responsivo com gradiente
export const ResponsiveHeader = ({ 
  title, 
  subtitle, 
  icon, 
  colors = ['#059669', '#10B981'],
  style,
  children 
}) => {
  return (
    <View style={[styles.header, style]}>
      <LinearGradient
        colors={colors}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerContent}>
        {title && (
          <View style={styles.headerTitleContainer}>
            {icon}
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}
        {subtitle && (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        )}
        {children}
      </View>
    </View>
  );
};

// Card responsivo
export const ResponsiveCard = ({ 
  children, 
  style, 
  padding = true,
  shadow = true,
  ...props 
}) => {
  const cardStyle = [
    styles.card,
    padding && styles.cardPadding,
    shadow && styles.cardShadow,
    deviceInfo.isTablet && styles.cardTablet,
    style
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

// Section responsiva
export const ResponsiveSection = ({ 
  title, 
  children, 
  style, 
  titleStyle,
  spacing: sectionSpacing = 'lg' 
}) => {
  const sectionStyles = [
    styles.section,
    { marginBottom: spacing[sectionSpacing] },
    style
  ];

  return (
    <View style={sectionStyles}>
      {title && (
        <Text style={[styles.sectionTitle, titleStyle]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

// Grid responsivo
export const ResponsiveGrid = ({ 
  children, 
  columns, 
  gap = 'md', 
  style 
}) => {
  const cols = columns || layoutConstraints.gridCols;
  const itemWidth = `${(100 / cols) - 2}%`;
  
  return (
    <View style={[styles.grid, { gap: spacing[gap] }, style]}>
      {React.Children.map(children, (child, index) => (
        <View style={[styles.gridItem, { width: itemWidth }]} key={index}>
          {child}
        </View>
      ))}
    </View>
  );
};

// Button container responsivo
export const ResponsiveButtonContainer = ({ 
  children, 
  direction = 'column',
  gap = 'md',
  style 
}) => {
  const containerStyle = [
    styles.buttonContainer,
    { 
      flexDirection: deviceInfo.isTablet && direction === 'row' ? 'row' : 'column',
      gap: spacing[gap]
    },
    style
  ];

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// Safe area wrapper
export const ResponsiveSafeArea = ({ children, style, includeTop = true, includeBottom = true }) => {
  const safeAreaStyle = [
    styles.safeArea,
    includeTop && { paddingTop: deviceInfo.safeAreaTop },
    includeBottom && { paddingBottom: deviceInfo.safeAreaBottom },
    style
  ];

  return (
    <View style={safeAreaStyle}>
      {children}
    </View>
  );
};

// Layout para island devices
export const ResponsiveIslandLayout = ({ children, style }) => {
  if (!deviceInfo.hasDynamicIsland) {
    return children;
  }

  return (
    <View style={[styles.islandLayout, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    maxWidth: layoutConstraints.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  containerPadding: {
    paddingHorizontal: useResponsiveValue({
      small: spacing.md,
      medium: spacing.lg,
      large: spacing.xl,
      tablet: spacing.xxl
    }),
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  scrollContentTablet: {
    paddingHorizontal: spacing.lg,
  },
  
  header: {
    paddingTop: deviceInfo.safeAreaTop + spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: useResponsiveValue({
      small: spacing.lg,
      tablet: spacing.xxl
    }),
    borderBottomRightRadius: useResponsiveValue({
      small: spacing.lg,
      tablet: spacing.xxl
    }),
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: layoutConstraints.maxContentWidth,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: typography.body * 1.4,
  },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: useResponsiveValue({
      small: 12,
      tablet: 16
    }),
    marginBottom: spacing.md,
  },
  cardPadding: {
    padding: useResponsiveValue({
      small: spacing.md,
      tablet: spacing.lg
    }),
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTablet: {
    marginHorizontal: spacing.sm,
  },
  
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  
  buttonContainer: {
    width: '100%',
  },
  
  safeArea: {
    flex: 1,
  },
  
  islandLayout: {
    paddingTop: layoutConstraints.dynamicIslandSpacing,
  },
});

export default {
  ResponsiveContainer,
  ResponsiveScrollView,
  ResponsiveHeader,
  ResponsiveCard,
  ResponsiveSection,
  ResponsiveGrid,
  ResponsiveButtonContainer,
  ResponsiveSafeArea,
  ResponsiveIslandLayout
};