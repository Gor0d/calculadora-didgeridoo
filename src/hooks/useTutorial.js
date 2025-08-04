import { useState, useEffect, useRef, useCallback } from 'react';
import { TutorialManager } from '../services/tutorial/TutorialManager';

export const useTutorial = (sectionName, context = {}) => {
  const [currentStep, setCurrentStep] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(null);
  const [elementRefs, setElementRefs] = useState({});
  const [elementBounds, setElementBounds] = useState({});
  
  const tutorialState = useRef({
    isActive: false,
    stepIndex: 0,
    section: null
  });

  // Initialize tutorial
  useEffect(() => {
    initializeTutorial();
  }, [sectionName]);

  // Check if tutorial should show based on context changes
  useEffect(() => {
    checkTutorialConditions();
  }, [context]);

  const initializeTutorial = async () => {
    try {
      const { progress: tutorialProgress, shouldShowWelcome } = await TutorialManager.initializeTutorial();
      setProgress(tutorialProgress);

      if (shouldShowWelcome && sectionName === 'welcome') {
        startTutorial('welcome');
      }
    } catch (error) {
      console.error('Error initializing tutorial:', error);
    }
  };

  const checkTutorialConditions = async () => {
    if (tutorialState.current.isActive) return;

    const shouldShow = await TutorialManager.shouldShowTutorial(sectionName, context);
    if (shouldShow) {
      startTutorial(sectionName);
    }
  };

  const startTutorial = async (section) => {
    try {
      const steps = TutorialManager.tutorialSteps[section];
      if (!steps || steps.length === 0) return;

      tutorialState.current = {
        isActive: true,
        stepIndex: 0,
        section: section
      };

      const firstStep = steps[0];
      const enhancedStep = await enhanceStep(firstStep, section, 0, steps.length);
      
      setCurrentStep(enhancedStep);
      setIsVisible(true);

      // Measure target element if needed
      if (firstStep.target && elementRefs[firstStep.target]) {
        measureElement(firstStep.target);
      }
    } catch (error) {
      console.error('Error starting tutorial:', error);
    }
  };

  const enhanceStep = async (step, section, index, total) => {
    const progress = await TutorialManager.getProgressStats();
    
    return {
      ...step,
      section: section,
      isFirst: index === 0,
      isLast: index === total - 1,
      progress: {
        current: index + 1,
        total: total,
        percentage: Math.round(((index + 1) / total) * 100),
        overall: progress
      }
    };
  };

  const nextStep = async () => {
    if (!tutorialState.current.isActive) return;

    const { section, stepIndex } = tutorialState.current;
    const steps = TutorialManager.tutorialSteps[section];
    
    if (stepIndex < steps.length - 1) {
      // Move to next step in current section
      const newIndex = stepIndex + 1;
      tutorialState.current.stepIndex = newIndex;

      const nextStepData = steps[newIndex];
      const enhancedStep = await enhanceStep(nextStepData, section, newIndex, steps.length);
      
      setCurrentStep(enhancedStep);

      // Measure target element if needed
      if (nextStepData.target && elementRefs[nextStepData.target]) {
        measureElement(nextStepData.target);
      }
    } else {
      // Section completed, check for next section
      await TutorialManager.markSectionCompleted(section);
      const nextSection = getNextSection(section);
      
      if (nextSection) {
        startTutorial(nextSection);
      } else {
        endTutorial();
      }
    }
  };

  const previousStep = async () => {
    if (!tutorialState.current.isActive || tutorialState.current.stepIndex <= 0) return;

    const { section, stepIndex } = tutorialState.current;
    const steps = TutorialManager.tutorialSteps[section];
    
    const newIndex = stepIndex - 1;
    tutorialState.current.stepIndex = newIndex;

    const prevStepData = steps[newIndex];
    const enhancedStep = await enhanceStep(prevStepData, section, newIndex, steps.length);
    
    setCurrentStep(enhancedStep);

    // Measure target element if needed
    if (prevStepData.target && elementRefs[prevStepData.target]) {
      measureElement(prevStepData.target);
    }
  };

  const skipTutorial = async () => {
    if (!tutorialState.current.isActive) return;

    const { section } = tutorialState.current;
    await TutorialManager.skipCurrentSection(section);
    endTutorial();
  };

  const endTutorial = () => {
    tutorialState.current = {
      isActive: false,
      stepIndex: 0,
      section: null
    };
    
    setCurrentStep(null);
    setIsVisible(false);
  };

  const getNextSection = (currentSection) => {
    const sectionOrder = ['welcome', 'basic_usage', 'advanced_features', 'project_management'];
    const currentIndex = sectionOrder.indexOf(currentSection);
    return currentIndex < sectionOrder.length - 1 ? sectionOrder[currentIndex + 1] : null;
  };

  const measureElement = (targetId) => {
    const ref = elementRefs[targetId];
    if (ref && ref.current) {
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        setElementBounds({
          [targetId]: {
            x: pageX,
            y: pageY,
            width,
            height
          }
        });
      });
    }
  };

  const registerRef = useCallback((targetId, ref) => {
    setElementRefs(prev => ({
      ...prev,
      [targetId]: ref
    }));
  }, []);

  const triggerStep = useCallback(async (stepId) => {
    const stepInfo = TutorialManager.getStepById(stepId);
    if (stepInfo) {
      const enhancedStep = await enhanceStep(stepInfo.step, stepInfo.section, 0, 1);
      setCurrentStep(enhancedStep);
      setIsVisible(true);

      if (stepInfo.step.target && elementRefs[stepInfo.step.target]) {
        measureElement(stepInfo.step.target);
      }
    }
  }, [elementRefs]);

  const resetTutorial = async () => {
    await TutorialManager.resetTutorial();
    setProgress({});
    endTutorial();
  };

  // Public API
  return {
    // State
    isVisible,
    currentStep,
    progress,
    isActive: tutorialState.current.isActive,
    
    // Actions  
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    endTutorial,
    resetTutorial,
    triggerStep,
    
    // Helpers
    registerRef,
    elementBounds: currentStep?.target ? elementBounds[currentStep.target] : null,
    
    // Tutorial management
    async enableTutorials() {
      await TutorialManager.enableTutorials();
    },
    
    async disableTutorials() {
      await TutorialManager.disableTutorials();
    },
    
    async getStats() {
      return await TutorialManager.getProgressStats();
    }
  };
};

// Hook for managing tutorial progress across the app
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

  useEffect(() => {
    loadProgress();
    loadSettings();
  }, []);

  const loadProgress = async () => {
    try {
      const progressStats = await TutorialManager.getProgressStats();
      setStats(progressStats);
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const tutorialSettings = await TutorialManager.getTutorialSettings();
      setSettings(tutorialSettings);
    } catch (error) {
      console.error('Error loading tutorial settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await TutorialManager.saveTutorialSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating tutorial settings:', error);
    }
  };

  const resetAll = async () => {
    try {
      await TutorialManager.resetTutorial();
      await loadProgress();
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  };

  return {
    stats,
    settings,
    updateSettings,
    resetAll,
    refresh: loadProgress
  };
};

// Hook for contextual tips
export const useTips = (category = null) => {
  const [currentTip, setCurrentTip] = useState(null);
  
  const showRandomTip = async () => {
    try {
      const tip = await TutorialManager.getRandomTip(category);
      setCurrentTip(tip);
      return tip;
    } catch (error) {
      console.error('Error showing tip:', error);
      return null;
    }
  };

  const showTipForCategory = async (categoryName) => {
    try {
      const tip = await TutorialManager.getRandomTip(categoryName);
      setCurrentTip(tip);
      return tip;
    } catch (error) {
      console.error('Error showing category tip:', error);
      return null;
    }
  };

  const clearTip = () => {
    setCurrentTip(null);
  };

  return {
    currentTip,
    showRandomTip,
    showTipForCategory,
    clearTip
  };
};