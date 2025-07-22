import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { SimpleHomeScreen } from '../screens/SimpleHomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

const TabIcon = ({ iconText, color, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, { color }]}>{iconText}</Text>
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
              <TabIcon iconText="🏠" color={color} focused={focused} />
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
              <TabIcon iconText="⚙️" color={color} focused={focused} />
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
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: deviceInfo.safeAreaBottom,
    paddingTop: spacing.sm,
    height: 60 + deviceInfo.safeAreaBottom,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  },
  tabIcon: {
    fontSize: 22,
  },
});