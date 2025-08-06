import { useState, useEffect, useCallback } from 'react';
import { TutorialManager } from '../services/tutorial/TutorialManager';

export const useTutorial = (sectionName = null, context = {}) => {
  const [tutorialState, setTutorialState] = useState({
    isVisible: false,
    currentStep: null,
    currentSection: sectionName,
    progress: {},
    settings: { enabled: true }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [registeredRefs, setRegisteredRefs] = useState({});

  useEffect(() => {
    initializeTutorial();
  }, []);

  const initializeTutorial = async () => {
    try {
      setIsLoading(true);
      const tutorialData = await TutorialManager.initializeTutorial();
      
      setTutorialState({
        isVisible: tutorialData.shouldShowWelcome,
        currentStep: tutorialData.currentStep?.step || null,
        currentSection: tutorialData.currentStep?.section || null,
        progress: tutorialData.progress,
        settings: tutorialData.settings
      });
    } catch (error) {
      console.error('Failed to initialize tutorial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTutorial = useCallback(async (sectionName = 'welcome') => {
    try {
      const steps = TutorialManager.tutorialSteps[sectionName];
      if (!steps || steps.length === 0) return;

      const firstStep = steps[0];
      setTutorialState(prev => ({
        ...prev,
        isVisible: true,
        currentStep: firstStep,
        currentSection: sectionName
      }));
    } catch (error) {
      console.error('Failed to start tutorial:', error);
    }
  }, []);

  const nextStep = useCallback(async () => {
    try {
      if (!tutorialState.currentSection || !tutorialState.currentStep) return;

      const nextStep = TutorialManager.getNextStepInSection(
        tutorialState.currentSection,
        tutorialState.currentStep.id
      );

      if (nextStep) {
        setTutorialState(prev => ({
          ...prev,
          currentStep: nextStep
        }));
      } else {
        // Seção concluída
        await TutorialManager.markSectionCompleted(tutorialState.currentSection);
        closeTutorial();
      }
    } catch (error) {
      console.error('Failed to go to next step:', error);
    }
  }, [tutorialState.currentSection, tutorialState.currentStep]);

  const previousStep = useCallback(async () => {
    try {
      if (!tutorialState.currentSection || !tutorialState.currentStep) return;

      const prevStep = TutorialManager.getPreviousStepInSection(
        tutorialState.currentSection,
        tutorialState.currentStep.id
      );

      if (prevStep) {
        setTutorialState(prev => ({
          ...prev,
          currentStep: prevStep
        }));
      }
    } catch (error) {
      console.error('Failed to go to previous step:', error);
    }
  }, [tutorialState.currentSection, tutorialState.currentStep]);

  const skipTutorial = useCallback(async () => {
    try {
      if (tutorialState.currentSection) {
        await TutorialManager.skipCurrentSection(tutorialState.currentSection);
      }
      closeTutorial();
    } catch (error) {
      console.error('Failed to skip tutorial:', error);
    }
  }, [tutorialState.currentSection]);

  const closeTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isVisible: false,
      currentStep: null,
      currentSection: null
    }));
  }, []);

  const resetTutorial = useCallback(async () => {
    try {
      await TutorialManager.resetTutorial();
      await initializeTutorial();
    } catch (error) {
      console.error('Failed to reset tutorial:', error);
    }
  }, []);

  const enableTutorials = useCallback(async () => {
    try {
      await TutorialManager.enableTutorials();
      setTutorialState(prev => ({
        ...prev,
        settings: { ...prev.settings, enabled: true }
      }));
    } catch (error) {
      console.error('Failed to enable tutorials:', error);
    }
  }, []);

  const disableTutorials = useCallback(async () => {
    try {
      await TutorialManager.disableTutorials();
      setTutorialState(prev => ({
        ...prev,
        isVisible: false,
        settings: { ...prev.settings, enabled: false }
      }));
    } catch (error) {
      console.error('Failed to disable tutorials:', error);
    }
  }, []);

  const shouldShowTutorial = useCallback(async (sectionName, context = {}) => {
    try {
      if (!tutorialState.settings.enabled) return false;
      return await TutorialManager.shouldShowTutorial(sectionName, context);
    } catch (error) {
      console.error('Failed to check tutorial condition:', error);
      return false;
    }
  }, [tutorialState.settings.enabled]);

  const getProgressStats = useCallback(async () => {
    try {
      return await TutorialManager.getProgressStats();
    } catch (error) {
      console.error('Failed to get progress stats:', error);
      return {
        totalSections: 0,
        completedSections: 0,
        progressPercentage: 0,
        isComplete: false
      };
    }
  }, []);

  const getRandomTip = useCallback(async (category = null) => {
    try {
      return await TutorialManager.getRandomTip(category);
    } catch (error) {
      console.error('Failed to get random tip:', error);
      return null;
    }
  }, []);

  const registerRef = useCallback((targetId, ref) => {
    setRegisteredRefs(prev => ({
      ...prev,
      [targetId]: ref
    }));
  }, []);

  const unregisterRef = useCallback((targetId) => {
    setRegisteredRefs(prev => {
      const newRefs = { ...prev };
      delete newRefs[targetId];
      return newRefs;
    });
  }, []);

  const getElementBounds = useCallback((targetId) => {
    const ref = registeredRefs[targetId];
    if (!ref?.current) return null;

    return new Promise((resolve) => {
      ref.current.measureInWindow((x, y, width, height) => {
        resolve({ x, y, width, height });
      });
    });
  }, [registeredRefs]);

  const endTutorial = useCallback(() => {
    closeTutorial();
  }, [closeTutorial]);

  return {
    // Estado
    isVisible: tutorialState.isVisible,
    currentStep: tutorialState.currentStep,
    currentSection: tutorialState.currentSection,
    isLoading,
    settings: tutorialState.settings,
    
    // Ações
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    closeTutorial,
    resetTutorial,
    enableTutorials,
    disableTutorials,
    
    // Utilitários
    shouldShowTutorial,
    getProgressStats,
    getRandomTip,
    
    // Gerenciamento de referências
    registerRef,
    unregisterRef,
    getElementBounds,
    registeredRefs,
    endTutorial
  };
};

// Hook para tutorial simples com apenas tooltip
export const useSimpleTutorial = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const showTooltip = useCallback((config) => {
    setActiveTooltip({
      id: Date.now(),
      title: config.title,
      description: config.description,
      position: config.position || 'bottom',
      target: config.target,
      duration: config.duration || 5000,
      ...config
    });

    if (config.duration && config.duration > 0) {
      setTimeout(() => {
        setActiveTooltip(null);
      }, config.duration);
    }
  }, []);

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  return {
    activeTooltip,
    showTooltip,
    hideTooltip
  };
};

// Hook para dicas específicas por categoria
export const useTips = (category = null) => {
  const [currentTip, setCurrentTip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTip = useCallback(async () => {
    try {
      setIsLoading(true);
      const tip = await TutorialManager.getRandomTip(category);
      setCurrentTip(tip);
      return tip;
    } catch (error) {
      console.error('Failed to get tip:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  const getNewTip = useCallback(async () => {
    return await getTip();
  }, [getTip]);

  const clearTip = useCallback(() => {
    setCurrentTip(null);
  }, []);

  const showSpecificTip = useCallback((tip) => {
    setCurrentTip(tip);
  }, []);

  const showTipForCategory = useCallback(async (category) => {
    try {
      setIsLoading(true);
      const tip = await TutorialManager.getRandomTip(category);
      if (tip) {
        setCurrentTip(tip);
      }
      return tip;
    } catch (error) {
      console.error('Failed to show tip for category:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTip();
  }, [getTip]);

  return {
    currentTip,
    isLoading,
    getTip,
    getNewTip,
    clearTip,
    showSpecificTip,
    showTipForCategory
  };
};

// Hook específico para dica do dia
export const useDailyTip = () => {
  const [dailyTip, setDailyTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadDailyTip = useCallback(async () => {
    try {
      setIsLoading(true);
      const tip = await TutorialManager.getDailyTip();
      setDailyTip(tip);
      return tip;
    } catch (error) {
      console.error('Failed to load daily tip:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showDailyTip = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideDailyTip = useCallback(() => {
    setIsVisible(false);
  }, []);

  const getWeeklyTips = useCallback(async () => {
    try {
      return await TutorialManager.getWeeklyTips();
    } catch (error) {
      console.error('Failed to get weekly tips:', error);
      return [];
    }
  }, []);

  const getTipCategories = useCallback(() => {
    return TutorialManager.getTipCategories();
  }, []);

  const getTipsByCategory = useCallback(async (category) => {
    try {
      return await TutorialManager.getTipsByCategory(category);
    } catch (error) {
      console.error('Failed to get tips by category:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadDailyTip();
  }, [loadDailyTip]);

  return {
    dailyTip,
    isVisible,
    isLoading,
    showDailyTip,
    hideDailyTip,
    loadDailyTip,
    getWeeklyTips,
    getTipCategories,
    getTipsByCategory
  };
};

// Hook para progresso e configurações do tutorial
export const useTutorialProgress = () => {
  const [stats, setStats] = useState({
    totalSections: 0,
    completedSections: 0,
    totalSteps: 0,
    completedSteps: 0,
    progressPercentage: 0,
    isComplete: false
  });
  const [settings, setSettings] = useState({
    enabled: true,
    autoPlay: true,
    showTips: true,
    animationSpeed: 'normal'
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [progressStats, tutorialSettings] = await Promise.all([
        TutorialManager.getProgressStats(),
        TutorialManager.getTutorialSettings()
      ]);
      
      setStats(progressStats);
      setSettings(tutorialSettings);
    } catch (error) {
      console.error('Failed to load tutorial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await TutorialManager.saveTutorialSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }, [settings]);

  const resetAll = useCallback(async () => {
    try {
      setIsLoading(true);
      await TutorialManager.resetTutorial();
      await loadData();
    } catch (error) {
      console.error('Failed to reset tutorial:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    stats,
    settings,
    isLoading,
    updateSettings,
    resetAll,
    refresh
  };
};