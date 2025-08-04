import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const TUTORIAL_PROGRESS_KEY = '@didgemap_tutorial_progress';
const TUTORIAL_SETTINGS_KEY = '@didgemap_tutorial_settings';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export class TutorialManager {
  static tutorialSteps = {
    welcome: [
      {
        id: 'welcome_1',
        title: 'Bem-vindo ao Didgemap!',
        description: 'Sua ferramenta profissional para análise acústica de didgeridoo',
        icon: '🎺',
        type: 'intro',
        duration: 3000,
        actions: [
          { type: 'highlight', target: 'app_header' },
          { type: 'pulse', target: 'main_container' }
        ]
      },
      {
        id: 'welcome_2',
        title: 'O que você pode fazer',
        description: 'Analise geometrias, calcule frequências, visualize designs e exporte relatórios profissionais',
        icon: '✨',
        type: 'feature_overview',
        duration: 4000,
        features: [
          { icon: '📐', text: 'Análise de geometria' },
          { icon: '🎵', text: 'Cálculo de frequências' },
          { icon: '📊', text: 'Visualização 3D' },
          { icon: '📤', text: 'Exportação profissional' }
        ]
      }
    ],

    basic_usage: [
      {
        id: 'basic_1',
        title: 'Exemplos Rápidos',
        description: 'Comece com um exemplo pré-definido para ver o app em ação',
        target: 'quick_examples',
        position: 'bottom',
        type: 'tooltip',
        highlightPadding: 10,
        actions: [
          { type: 'highlight', target: 'quick_examples' },
          { type: 'point', direction: 'up' }
        ]
      },
      {
        id: 'basic_2',
        title: 'Seletor de Unidades',
        description: 'Escolha entre sistema métrico ou imperial para suas medidas',
        target: 'unit_selector',
        position: 'bottom',
        type: 'tooltip',
        actions: [
          { type: 'highlight', target: 'unit_selector' }
        ]
      },
      {
        id: 'basic_3',
        title: 'Entrada de Geometria',
        description: 'Digite ou cole sua geometria DIDGMO aqui. Cada linha deve conter posição e diâmetro',
        target: 'geometry_input',
        position: 'top',
        type: 'tooltip',
        example: '0.00 0.030\n0.50 0.045\n1.50 0.080',
        actions: [
          { type: 'highlight', target: 'geometry_input' },
          { type: 'type_text', text: '0.00 0.030\n0.50 0.045\n1.50 0.080' }
        ]
      },
      {
        id: 'basic_4',
        title: 'Botão Analisar',
        description: 'Clique aqui para calcular as frequências e harmônicos do seu didgeridoo',
        target: 'analyze_button',
        position: 'top',
        type: 'tooltip',
        actions: [
          { type: 'highlight', target: 'analyze_button' },
          { type: 'pulse', target: 'analyze_button' }
        ]
      }
    ],

    advanced_features: [
      {
        id: 'advanced_1',
        title: 'Visualização Interativa',
        description: 'Ative a visualização para ver seu didgeridoo em 2D com medidas detalhadas',
        target: 'visualization_toggle',
        position: 'bottom',
        type: 'tooltip',
        actions: [
          { type: 'highlight', target: 'visualization_toggle' }
        ]
      },
      {
        id: 'advanced_2',
        title: 'Controles de Visualização',
        description: 'Use zoom, pan e grade para explorar sua geometria em detalhes',
        target: 'visualization_controls',
        position: 'bottom',
        type: 'tooltip',
        conditional: 'visualization_visible',
        actions: [
          { type: 'highlight', target: 'visualization_controls' }
        ]
      },
      {
        id: 'advanced_3',
        title: 'Preview Sonoro',
        description: 'Ouça como seu didgeridoo soaria com síntese de áudio baseada na análise',
        target: 'audio_preview',
        position: 'top',
        type: 'tooltip',
        conditional: 'results_visible',
        actions: [
          { type: 'highlight', target: 'audio_preview' }
        ]
      }
    ],

    project_management: [
      {
        id: 'project_1',
        title: 'Gerenciamento de Projetos',
        description: 'Salve, organize e gerencie seus designs de didgeridoo',
        target: 'manage_projects_button',
        position: 'top',
        type: 'tooltip',
        actions: [
          { type: 'highlight', target: 'manage_projects_button' }
        ]
      },
      {
        id: 'project_2',
        title: 'Exportação Avançada',
        description: 'Exporte relatórios PDF, áudio sintético e dados técnicos',
        target: 'export_button',
        position: 'top',
        type: 'tooltip',
        conditional: 'project_has_results',
        actions: [
          { type: 'highlight', target: 'export_button' }
        ]
      }
    ],

    tips_and_tricks: [
      {
        id: 'tips_1',
        title: 'Dica: Geometria Precisa',
        description: 'Use pelo menos 4-6 pontos para melhor precisão. Mais pontos = melhor análise',
        icon: '💡',
        type: 'tip',
        category: 'geometry'
      },
      {
        id: 'tips_2',
        title: 'Dica: Interpretação de Resultados',
        description: 'Cents próximos de 0 indicam afinação perfeita. ±20 cents ainda é aceitável',
        icon: '🎯',
        type: 'tip',
        category: 'analysis'
      },
      {
        id: 'tips_3',
        title: 'Dica: Modo Offline',
        description: 'O app funciona completamente offline. Acesse as configurações para mais opções',
        icon: '📱',
        type: 'tip',
        category: 'offline'
      },
      {
        id: 'tips_4',
        title: 'Dica: Backup de Projetos',
        description: 'Projetos favoritos são automaticamente salvos em backup. Marque os importantes!',
        icon: '⭐',
        type: 'tip',
        category: 'backup'
      }
    ]
  };

  static async initializeTutorial() {
    try {
      const progress = await this.getTutorialProgress();
      const settings = await this.getTutorialSettings();
      
      return {
        progress,
        settings,
        shouldShowWelcome: !progress.welcome?.completed,
        currentStep: this.getCurrentStep(progress)
      };
    } catch (error) {
      console.error('Error initializing tutorial:', error);
      return {
        progress: {},
        settings: { enabled: true, autoPlay: true },
        shouldShowWelcome: true,
        currentStep: null
      };
    }
  }

  static async getTutorialProgress() {
    try {
      const progressJson = await AsyncStorage.getItem(TUTORIAL_PROGRESS_KEY);
      return progressJson ? JSON.parse(progressJson) : {};
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
      return {};
    }
  }

  static async saveTutorialProgress(progress) {
    try {
      await AsyncStorage.setItem(TUTORIAL_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving tutorial progress:', error);
    }
  }

  static async getTutorialSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(TUTORIAL_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {
        enabled: true,
        autoPlay: true,
        showTips: true,
        animationSpeed: 'normal'
      };
    } catch (error) {
      console.error('Error loading tutorial settings:', error);
      return { enabled: true, autoPlay: true, showTips: true, animationSpeed: 'normal' };
    }
  }

  static async saveTutorialSettings(settings) {
    try {
      await AsyncStorage.setItem(TUTORIAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving tutorial settings:', error);
    }
  }

  static getCurrentStep(progress) {
    // Find the first incomplete tutorial section
    for (const [sectionName, steps] of Object.entries(this.tutorialSteps)) {
      if (!progress[sectionName]?.completed) {
        const completedSteps = progress[sectionName]?.steps || [];
        const nextStep = steps.find(step => !completedSteps.includes(step.id));
        return nextStep ? { section: sectionName, step: nextStep } : null;
      }
    }
    return null;
  }

  static async markStepCompleted(sectionName, stepId) {
    try {
      const progress = await this.getTutorialProgress();
      
      if (!progress[sectionName]) {
        progress[sectionName] = { steps: [], completed: false };
      }
      
      if (!progress[sectionName].steps.includes(stepId)) {
        progress[sectionName].steps.push(stepId);
      }

      // Check if all steps in section are completed
      const sectionSteps = this.tutorialSteps[sectionName];
      if (sectionSteps && progress[sectionName].steps.length >= sectionSteps.length) {
        progress[sectionName].completed = true;
      }

      await this.saveTutorialProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error marking step completed:', error);
      return null;
    }
  }

  static async markSectionCompleted(sectionName) {
    try {
      const progress = await this.getTutorialProgress();
      
      if (!progress[sectionName]) {
        progress[sectionName] = { steps: [], completed: false };
      }
      
      // Mark all steps as completed
      const sectionSteps = this.tutorialSteps[sectionName];
      if (sectionSteps) {
        progress[sectionName].steps = sectionSteps.map(step => step.id);
        progress[sectionName].completed = true;
      }

      await this.saveTutorialProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error marking section completed:', error);
      return null;
    }
  }

  static async resetTutorial() {
    try {
      await AsyncStorage.removeItem(TUTORIAL_PROGRESS_KEY);
      return {};
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      return null;
    }
  }

  static async shouldShowTutorial(sectionName, context = {}) {
    try {
      const settings = await this.getTutorialSettings();
      if (!settings.enabled) return false;

      const progress = await this.getTutorialProgress();
      if (progress[sectionName]?.completed) return false;

      // Check contextual conditions
      switch (sectionName) {
        case 'welcome':
          return !progress.welcome?.completed;
        case 'basic_usage':
          return progress.welcome?.completed && !progress.basic_usage?.completed;
        case 'advanced_features':
          return context.hasResults && !progress.advanced_features?.completed;
        case 'project_management':
          return context.hasProject && !progress.project_management?.completed;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking tutorial condition:', error);
      return false;
    }
  }

  static getNextStepInSection(sectionName, currentStepId) {
    const steps = this.tutorialSteps[sectionName];
    if (!steps) return null;

    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex === -1 || currentIndex >= steps.length - 1) return null;

    return steps[currentIndex + 1];
  }

  static getPreviousStepInSection(sectionName, currentStepId) {
    const steps = this.tutorialSteps[sectionName];
    if (!steps) return null;

    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex <= 0) return null;

    return steps[currentIndex - 1];
  }

  static getStepById(stepId) {
    for (const [sectionName, steps] of Object.entries(this.tutorialSteps)) {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        return { section: sectionName, step: step };
      }
    }
    return null;
  }

  static calculateStepPosition(target, position, elementBounds) {
    if (!elementBounds) return { top: SCREEN_HEIGHT / 2, left: SCREEN_WIDTH / 2 };

    const { x, y, width, height } = elementBounds;
    const padding = 20;

    switch (position) {
      case 'top':
        return {
          top: y - padding,
          left: x + width / 2,
          anchor: 'bottom'
        };
      case 'bottom':
        return {
          top: y + height + padding,
          left: x + width / 2,
          anchor: 'top'
        };
      case 'left':
        return {
          top: y + height / 2,
          left: x - padding,
          anchor: 'right'
        };
      case 'right':
        return {
          top: y + height / 2,
          left: x + width + padding,
          anchor: 'left'
        };
      case 'center':
      default:
        return {
          top: y + height / 2,
          left: x + width / 2,
          anchor: 'center'
        };
    }
  }

  static generateTooltipStyle(position, anchor) {
    const baseStyle = {
      position: 'absolute',
      maxWidth: 280,
      backgroundColor: '#1F2937',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000
    };

    // Adjust positioning based on anchor
    switch (anchor) {
      case 'top':
        return { ...baseStyle, marginTop: 0 };
      case 'bottom':
        return { ...baseStyle, marginTop: -20 };
      case 'left':
        return { ...baseStyle, marginLeft: 0 };
      case 'right':
        return { ...baseStyle, marginLeft: -20 };
      case 'center':
      default:
        return { ...baseStyle, marginTop: -10, marginLeft: -140 };
    }
  }

  static async getRandomTip(category = null) {
    try {
      const settings = await this.getTutorialSettings();
      if (!settings.showTips) return null;

      const tips = this.tutorialSteps.tips_and_tricks;
      const filteredTips = category 
        ? tips.filter(tip => tip.category === category)
        : tips;

      if (filteredTips.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * filteredTips.length);
      return filteredTips[randomIndex];
    } catch (error) {
      console.error('Error getting random tip:', error);
      return null;
    }
  }

  static async getProgressStats() {
    try {
      const progress = await this.getTutorialProgress();
      const totalSections = Object.keys(this.tutorialSteps).length - 1; // Exclude tips
      const completedSections = Object.values(progress).filter(p => p.completed).length;
      
      let totalSteps = 0;
      let completedSteps = 0;

      Object.entries(this.tutorialSteps).forEach(([sectionName, steps]) => {
        if (sectionName === 'tips_and_tricks') return;
        
        totalSteps += steps.length;
        const sectionProgress = progress[sectionName];
        if (sectionProgress) {
          completedSteps += sectionProgress.steps?.length || 0;
        }
      });

      return {
        totalSections,
        completedSections,
        totalSteps,
        completedSteps,
        progressPercentage: Math.round((completedSteps / totalSteps) * 100),
        isComplete: completedSections >= totalSections
      };
    } catch (error) {
      console.error('Error calculating progress stats:', error);
      return {
        totalSections: 0,
        completedSections: 0,
        totalSteps: 0,
        completedSteps: 0,
        progressPercentage: 0,
        isComplete: false
      };
    }
  }

  static async enableTutorials() {
    const settings = await this.getTutorialSettings();
    settings.enabled = true;
    await this.saveTutorialSettings(settings);
  }

  static async disableTutorials() {
    const settings = await this.getTutorialSettings();
    settings.enabled = false;
    await this.saveTutorialSettings(settings);
  }

  static async skipCurrentSection(sectionName) {
    await this.markSectionCompleted(sectionName);
  }
}