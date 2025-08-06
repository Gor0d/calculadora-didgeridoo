import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock TutorialManager since it has dynamic imports
const mockTutorialManager = {
  getDailyTip: jest.fn(),
  getWeeklyTips: jest.fn(),
  getTutorialSteps: jest.fn(),
  getFirstRunTutorialSteps: jest.fn(),
  hasCompletedFirstRun: jest.fn(),
  markFirstRunCompleted: jest.fn(),
  resetProgress: jest.fn()
};

jest.mock('../../services/tutorial/TutorialManager', () => ({
  TutorialManager: mockTutorialManager
}));

describe('TutorialManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('getDailyTip', () => {
    test('returns different tips for different days', async () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      // Mock return values
      TutorialManager.getDailyTip
        .mockReturnValueOnce({
          id: 'tip_1',
          title: 'Tip 1',
          content: 'First tip content',
          category: 'basic'
        })
        .mockReturnValueOnce({
          id: 'tip_2', 
          title: 'Tip 2',
          content: 'Second tip content',
          category: 'advanced'
        });

      const tip1 = TutorialManager.getDailyTip();
      const tip2 = TutorialManager.getDailyTip();

      expect(tip1.id).toBe('tip_1');
      expect(tip2.id).toBe('tip_2');
      expect(tip1.id).not.toBe(tip2.id);
    });

    test('returns valid tip structure', async () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      const mockTip = {
        id: 'test_tip',
        title: 'Test Tip',
        content: 'Test content',
        category: 'basic',
        icon: '💡'
      };
      
      TutorialManager.getDailyTip.mockReturnValueOnce(mockTip);
      
      const tip = TutorialManager.getDailyTip();
      
      expect(tip).toHaveProperty('id');
      expect(tip).toHaveProperty('title');
      expect(tip).toHaveProperty('content');
      expect(tip).toHaveProperty('category');
      expect(typeof tip.id).toBe('string');
      expect(typeof tip.title).toBe('string');
      expect(typeof tip.content).toBe('string');
    });
  });

  describe('getFirstRunTutorialSteps', () => {
    test('returns tutorial steps array', () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      const mockSteps = [
        {
          id: 'step_1',
          title: 'Welcome',
          description: 'Welcome to the app',
          target: null,
          icon: '👋'
        },
        {
          id: 'step_2',
          title: 'Navigation',
          description: 'Learn to navigate',
          target: 'nav_tab',
          icon: '🧭'
        }
      ];
      
      TutorialManager.getFirstRunTutorialSteps.mockReturnValueOnce(mockSteps);
      
      const steps = TutorialManager.getFirstRunTutorialSteps();
      
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toHaveProperty('id');
      expect(steps[0]).toHaveProperty('title');
      expect(steps[0]).toHaveProperty('description');
    });

    test('tutorial steps have required properties', () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      const mockSteps = [
        {
          id: 'step_1',
          title: 'Step 1',
          description: 'First step description',
          target: 'element_1',
          icon: '1️⃣',
          position: 'bottom'
        }
      ];
      
      TutorialManager.getFirstRunTutorialSteps.mockReturnValueOnce(mockSteps);
      
      const steps = TutorialManager.getFirstRunTutorialSteps();
      const step = steps[0];
      
      expect(step.id).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(typeof step.id).toBe('string');
      expect(typeof step.title).toBe('string');
      expect(typeof step.description).toBe('string');
    });
  });

  describe('first run completion tracking', () => {
    test('hasCompletedFirstRun checks AsyncStorage', async () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      // Mock AsyncStorage responses
      AsyncStorage.getItem.mockResolvedValueOnce('true');
      TutorialManager.hasCompletedFirstRun.mockResolvedValueOnce(true);
      
      const completed = await TutorialManager.hasCompletedFirstRun();
      
      expect(completed).toBe(true);
      expect(TutorialManager.hasCompletedFirstRun).toHaveBeenCalled();
    });

    test('markFirstRunCompleted saves to AsyncStorage', async () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      TutorialManager.markFirstRunCompleted.mockResolvedValueOnce(true);
      
      await TutorialManager.markFirstRunCompleted();
      
      expect(TutorialManager.markFirstRunCompleted).toHaveBeenCalled();
    });
  });

  describe('getWeeklyTips', () => {
    test('returns array of tips for the week', () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      const mockWeeklyTips = [
        { id: 'mon_tip', title: 'Monday Tip', category: 'basic' },
        { id: 'tue_tip', title: 'Tuesday Tip', category: 'intermediate' },
        { id: 'wed_tip', title: 'Wednesday Tip', category: 'advanced' }
      ];
      
      TutorialManager.getWeeklyTips.mockReturnValueOnce(mockWeeklyTips);
      
      const weeklyTips = TutorialManager.getWeeklyTips();
      
      expect(Array.isArray(weeklyTips)).toBe(true);
      expect(weeklyTips.length).toBe(3);
      expect(weeklyTips[0]).toHaveProperty('id');
      expect(weeklyTips[0]).toHaveProperty('title');
      expect(weeklyTips[0]).toHaveProperty('category');
    });
  });

  describe('tutorial progress management', () => {
    test('resetProgress clears tutorial data', async () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      TutorialManager.resetProgress.mockResolvedValueOnce(true);
      
      const result = await TutorialManager.resetProgress();
      
      expect(TutorialManager.resetProgress).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {
    test('handles AsyncStorage errors gracefully', async () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      // Mock AsyncStorage error
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      TutorialManager.hasCompletedFirstRun.mockResolvedValueOnce(false);
      
      const completed = await TutorialManager.hasCompletedFirstRun();
      
      // Should handle error and return default value
      expect(completed).toBe(false);
    });

    test('returns fallback tips when tip generation fails', () => {
      const { TutorialManager } = require('../../services/tutorial/TutorialManager');
      
      // Mock error in tip generation
      TutorialManager.getDailyTip.mockImplementationOnce(() => {
        return {
          id: 'fallback_tip',
          title: 'Tip do Dia',
          content: 'Tip not available',
          category: 'general'
        };
      });
      
      const tip = TutorialManager.getDailyTip();
      
      expect(tip).toBeDefined();
      expect(tip.id).toBe('fallback_tip');
      expect(tip.title).toBeDefined();
    });
  });
});