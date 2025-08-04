import { useState, useEffect, useCallback, useMemo } from 'react';
import { PerformanceManager } from '../services/performance/PerformanceManager';

export const usePerformance = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState(PerformanceManager.settings);
  const [deviceTier, setDeviceTier] = useState('medium');

  useEffect(() => {
    const initializePerformance = async () => {
      try {
        const result = await PerformanceManager.initializePerformanceOptimization();
        setSettings(result.settings);
        setDeviceTier(result.deviceTier);
        setIsInitialized(true);
      } catch (error) {
        console.error('Performance initialization failed:', error);
        setIsInitialized(true); // Continue with defaults
      }
    };

    initializePerformance();

    return () => {
      PerformanceManager.cleanup();
    };
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    try {
      await PerformanceManager.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update performance setting:', error);
    }
  }, []);

  const optimizeForDevice = useCallback(async () => {
    try {
      await PerformanceManager.optimizeForDevice(deviceTier);
      setSettings(PerformanceManager.settings);
    } catch (error) {
      console.error('Failed to optimize for device:', error);
    }
  }, [deviceTier]);

  const createDebounced = useCallback((func, delay) => {
    return PerformanceManager.createOptimizedDebounce(func, delay);
  }, []);

  const createThrottled = useCallback((func, delay) => {
    return PerformanceManager.createOptimizedThrottle(func, delay);
  }, []);

  const shouldEnableFeature = useCallback((featureName) => {
    return PerformanceManager.shouldEnableFeature(featureName);
  }, []);

  const getAnimationConfig = useCallback((baseConfig) => {
    return PerformanceManager.optimizeAnimationConfig(baseConfig);
  }, []);

  const getImageConfig = useCallback((quality) => {
    return PerformanceManager.optimizeImageRendering(quality);
  }, []);

  return {
    isInitialized,
    settings,
    deviceTier,
    updateSetting,
    optimizeForDevice,
    createDebounced,
    createThrottled,
    shouldEnableFeature,
    getAnimationConfig,
    getImageConfig
  };
};

export const useOptimizedCallback = (callback, deps, delay = null) => {
  const debouncedCallback = useMemo(() => {
    return PerformanceManager.createOptimizedDebounce(callback, delay);
  }, [callback, delay, ...deps]);

  return debouncedCallback;
};

export const useThrottledCallback = (callback, deps, delay = null) => {
  const throttledCallback = useMemo(() => {
    return PerformanceManager.createOptimizedThrottle(callback, delay);
  }, [callback, delay, ...deps]);

  return throttledCallback;
};

export const useConditionalRender = (condition, fallback = null) => {
  return useMemo(() => {
    const animationsEnabled = PerformanceManager.shouldEnableFeature('animations');
    return condition && animationsEnabled ? true : fallback;
  }, [condition, fallback]);
};