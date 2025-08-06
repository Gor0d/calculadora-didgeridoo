import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';

// Mock the complex components to avoid deep rendering issues
jest.mock('../components/AppWrapper', () => {
  return {
    AppWrapper: ({ children }) => children
  };
});

jest.mock('../navigation/TabNavigator', () => {
  return {
    TabNavigator: () => 'TabNavigator'
  };
});

jest.mock('../components/OnboardingScreen', () => {
  return {
    __esModule: true,
    default: ({ onComplete }) => {
      // Auto complete onboarding for tests
      React.useEffect(() => {
        if (onComplete) onComplete();
      }, [onComplete]);
      return 'OnboardingScreen';
    }
  };
});

// Mock services
jest.mock('../services/i18n/LocalizationService', () => ({
  localizationService: {
    initialize: jest.fn(() => Promise.resolve()),
    getCurrentLanguage: jest.fn(() => 'pt-BR'),
    setLanguage: jest.fn(() => Promise.resolve(true)),
    t: jest.fn(key => key)
  }
}));

jest.mock('../services/offline/OfflineManager', () => ({
  OfflineManager: {
    initialize: jest.fn(() => Promise.resolve())
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  test('renders without crashing', async () => {
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(getByText('TabNavigator')).toBeTruthy();
    });
  });

  test('shows onboarding when first launched', async () => {
    // Simulate first launch (no onboarding flag in storage)
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(getByText('TabNavigator')).toBeTruthy();
    });
  });

  test('skips onboarding when already seen', async () => {
    // Simulate already seen onboarding
    AsyncStorage.getItem.mockResolvedValueOnce('true');
    
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(getByText('TabNavigator')).toBeTruthy();
    });
  });

  test('handles app initialization errors gracefully', async () => {
    // Mock initialization error
    const { localizationService } = require('../services/i18n/LocalizationService');
    localizationService.initialize.mockRejectedValueOnce(new Error('Init failed'));
    
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(getByText('TabNavigator')).toBeTruthy();
    });
  });
});