import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { getDeviceInfo, getTypography, getSpacing, getIconSizes } from '../utils/responsive';
import { AppIcon } from '../components/IconSystem';
import { localizationService } from '../services/i18n/LocalizationService';
import { themeService } from '../services/theme/ThemeService';
import { SimpleHomeScreen } from '../screens/SimpleHomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();
const iconSizes = getIconSizes();

const TabIcon = ({ iconName, color, focused }) => (
  <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
    <AppIcon
      name={iconName}
      size={iconSizes.tabIcon}
      color={color}
    />
  </View>
);

export const TabNavigator = ({
  currentLanguage,
  onLanguageChange,
  currentUnit,
  onUnitChange,
  onExportData,
  onImportData,
  onResetApp,
  onResetOnboarding
}) => {
  // Theme support
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const colors = currentTheme.colors;

  useEffect(() => {
    const handleThemeChange = (newTheme) => {
      setCurrentTheme(newTheme);
    };

    themeService.addThemeChangeListener(handleThemeChange);

    return () => {
      themeService.removeThemeChangeListener(handleThemeChange);
    };
  }, []);

  return (
    <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            ...styles.tabBar,
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarLabel: localizationService.t('home'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="home" color={color} focused={focused} />
            ),
          }}
        >
          {(props) => (
            <SimpleHomeScreen
              {...props}
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              currentUnit={currentUnit}
              onUnitChange={onUnitChange}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Settings"
          options={{
            tabBarLabel: localizationService.t('settings'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="settings" color={color} focused={focused} />
            ),
          }}
        >
          {(props) => (
            <SettingsScreen
              {...props}
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              currentUnit={currentUnit}
              onUnitChange={onUnitChange}
              onExportData={onExportData}
              onImportData={onImportData}
              onResetApp={onResetApp}
              onResetOnboarding={onResetOnboarding}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    height: deviceInfo.isTablet ? 70 : 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  tabBarItem: {
    paddingTop: spacing.xs,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.sm,
    minWidth: 44, // Minimum touch target
    minHeight: 44,
  },
  tabIconFocused: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    transform: [{ scale: 1.05 }],
  },
});