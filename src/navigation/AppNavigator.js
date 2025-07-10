import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import DesignerScreen from '../screens/DesignerScreen';
import AnalyzerScreen from '../screens/AnalyzerScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#2E8B57',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#DAA520',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Início',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>
                🏠
              </Text>
            ),
          }}
        />
        <Tab.Screen 
          name="Designer" 
          component={DesignerScreen}
          options={{
            tabBarLabel: 'Designer',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>
                🎨
              </Text>
            ),
          }}
        />
        <Tab.Screen 
          name="Analyzer" 
          component={AnalyzerScreen}
          options={{
            tabBarLabel: 'Analyzer',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>
                🔬
              </Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}