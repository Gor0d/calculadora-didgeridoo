import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { TipsSettingsScreen } from '../screens/TipsSettingsScreen';
import { AIRecommendationsScreen } from '../screens/AIRecommendationsScreen';
import { Visualization3DScreen } from '../screens/Visualization3DScreen';

const Stack = createStackNavigator();

export const AppNavigator = (props) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F8FAFC',
          },
          headerTintColor: '#1F2937',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          options={{ headerShown: false }}
        >
          {(navigationProps) => <TabNavigator {...props} {...navigationProps} />}
        </Stack.Screen>
        
        <Stack.Screen 
          name="TipsSettings" 
          component={TipsSettingsScreen}
          options={{
            title: 'Configurações de Dicas',
            headerBackTitleVisible: false,
          }}
        />
        
        <Stack.Screen 
          name="AIRecommendations" 
          component={AIRecommendationsScreen}
          options={{
            title: 'Recomendações IA',
            headerBackTitleVisible: false,
          }}
        />
        
        <Stack.Screen 
          name="Visualization3D" 
          component={Visualization3DScreen}
          options={{
            title: 'Visualização 3D',
            headerBackTitleVisible: false,
          }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};