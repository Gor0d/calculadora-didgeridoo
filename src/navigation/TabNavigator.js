import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { getDeviceInfo, getTypography, getSpacing, getIconSizes } from '../utils/responsive';
import { AppIcon } from '../components/IconSystem';
import { localizationService } from '../services/i18n/LocalizationService';
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
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#9CA3AF',
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingBottom: deviceInfo.safeAreaBottom + spacing.xs,
    paddingTop: spacing.sm,
    height: (deviceInfo.isTablet ? 70 : 60) + deviceInfo.safeAreaBottom,
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