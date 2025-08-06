import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTutorial } from '../../hooks/useTutorial';

describe('useTutorial Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useTutorial());
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.registeredRefs).toEqual({});
  });

  test('starts tutorial successfully', async () => {
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await result.current.startTutorial('basic');
    });
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.currentSection).toBe('basic');
  });

  test('ends tutorial and saves progress', async () => {
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await result.current.startTutorial('basic');
    });
    
    await act(async () => {
      await result.current.endTutorial();
    });
    
    expect(result.current.isActive).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('tutorial_completed'),
      expect.any(String)
    );
  });

  test('registers and retrieves component refs', () => {
    const { result } = renderHook(() => useTutorial());
    const mockRef = { current: null };
    
    act(() => {
      result.current.registerRef('testComponent', mockRef);
    });
    
    expect(result.current.registeredRefs.testComponent).toBe(mockRef);
  });

  test('navigates to next step', async () => {
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await result.current.startTutorial('basic');
    });
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(1);
  });

  test('navigates to previous step', async () => {
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await result.current.startTutorial('basic');
      result.current.nextStep();
    });
    
    act(() => {
      result.current.prevStep();
    });
    
    expect(result.current.currentStep).toBe(0);
  });

  test('does not go below step 0', async () => {
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await result.current.startTutorial('basic');
    });
    
    act(() => {
      result.current.prevStep();
    });
    
    expect(result.current.currentStep).toBe(0);
  });

  test('handles tutorial completion check', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('true');
    
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      const isCompleted = await result.current.isTutorialCompleted('basic');
      expect(isCompleted).toBe(true);
    });
  });

  test('handles storage errors gracefully', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
    
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await result.current.startTutorial('basic');
      // Should not throw error
      await result.current.endTutorial();
    });
    
    expect(result.current.isActive).toBe(false);
  });
});