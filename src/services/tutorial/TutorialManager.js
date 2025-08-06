import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const TUTORIAL_PROGRESS_KEY = '@didgemap_tutorial_progress';
const TUTORIAL_SETTINGS_KEY = '@didgemap_tutorial_settings';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export class TutorialManager {
  static tutorialSteps = {
    first_run: [
      {
        id: 'intro_1',
        title: 'Bem-vindo ao Didgemap! 🎺',
        description: 'Sua calculadora profissional para análise acústica de didgeridoos. Vamos fazer um tour rápido!',
        icon: '👋',
        type: 'intro',
        target: 'app_header',
        position: 'bottom',
        highlightPadding: 12,
        isSkippable: false
      },
      {
        id: 'intro_2',
        title: 'Exemplos Prontos',
        description: 'Comece rapidamente com nossos exemplos pré-definidos. Perfeito para aprender!',
        icon: '🚀',
        type: 'feature',
        target: 'quick_examples',
        position: 'bottom',
        highlightPadding: 10
      },
      {
        id: 'intro_3',
        title: 'Escolha a Unidade',
        description: 'Selecione metros ou milímetros para suas medidas. O app converte automaticamente.',
        icon: '📏',
        type: 'feature',
        target: 'unit_selector',
        position: 'bottom',
        highlightPadding: 8
      },
      {
        id: 'intro_4',
        title: 'Digite sua Geometria',
        description: 'Insira as medidas do seu didgeridoo aqui. Formato: posição diâmetro (uma por linha)',
        icon: '✏️',
        type: 'input',
        target: 'geometry_input',
        position: 'top',
        highlightPadding: 12,
        example: '0.00 0.030\n0.50 0.045\n1.50 0.080'
      },
      {
        id: 'intro_5',
        title: 'Analisar!',
        description: 'Clique aqui para calcular as frequências e características acústicas',
        icon: '🔬',
        type: 'action',
        target: 'analyze_button',
        position: 'top',
        highlightPadding: 10,
        actionRequired: true
      },
      {
        id: 'intro_6',
        title: 'Projetos',
        description: 'Salve, organize e gerencie seus designs aqui. Seus projetos ficam seguros offline!',
        icon: '📁',
        type: 'feature',
        target: 'manage_projects_button',
        position: 'top',
        highlightPadding: 10
      },
      {
        id: 'intro_7',
        title: 'Pronto para Começar! ✨',
        description: 'Tutorial concluído! Explore o app e crie didgeridoos incríveis. Acesse as configurações para rever este tutorial.',
        icon: '🎉',
        type: 'completion',
        target: null,
        position: 'center',
        isLast: true
      }
    ],

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
      // Dicas de Geometria
      {
        id: 'tips_1',
        title: 'Geometria Precisa',
        description: 'Use pelo menos 4-6 pontos para melhor precisão. Mais pontos = melhor análise acústica',
        icon: '📐',
        type: 'tip',
        category: 'geometry'
      },
      {
        id: 'tips_5',
        title: 'Pontos Estratégicos',
        description: 'Concentre pontos nas mudanças de diâmetro. Transições suaves precisam de mais detalhes',
        icon: '🔍',
        type: 'tip',
        category: 'geometry'
      },
      {
        id: 'tips_6',
        title: 'Início e Fim',
        description: 'Sempre comece em 0.00 e termine no comprimento total. Isso garante análise completa',
        icon: '📏',
        type: 'tip',
        category: 'geometry'
      },
      {
        id: 'tips_7',
        title: 'Unidades Consistentes',
        description: 'Mantenha a mesma unidade em toda geometria. Misturar mm e cm pode confundir a análise',
        icon: '⚖️',
        type: 'tip',
        category: 'geometry'
      },

      // Dicas de Análise
      {
        id: 'tips_2',
        title: 'Interpretação de Cents',
        description: 'Cents próximos de 0 = afinação perfeita. ±20 cents = aceitável. ±50 cents = desafinado',
        icon: '🎯',
        type: 'tip',
        category: 'analysis'
      },
      {
        id: 'tips_8',
        title: 'Frequência Fundamental',
        description: 'A nota mais grave determina a afinação. Harmônicos secundários criam o timbre único',
        icon: '🎵',
        type: 'tip',
        category: 'analysis'
      },
      {
        id: 'tips_9',
        title: 'Velocidade do Som',
        description: 'Temperatura afeta a velocidade do som. 20°C = 343 m/s. Ajuste para condições reais',
        icon: '🌡️',
        type: 'tip',
        category: 'analysis'
      },
      {
        id: 'tips_10',
        title: 'Ressonâncias Múltiplas',
        description: 'Didgeridoos têm várias frequências ressonantes. A primeira é mais audível',
        icon: '🔊',
        type: 'tip',
        category: 'analysis'
      },

      // Dicas de Construção
      {
        id: 'tips_11',
        title: 'Diâmetro do Bocal',
        description: 'Bocal de 30-35mm é ideal para iniciantes. Menores = mais difíceis, maiores = menos controle',
        icon: '🔧',
        type: 'tip',
        category: 'construction'
      },
      {
        id: 'tips_12',
        title: 'Conicidade Gradual',
        description: 'Mudanças suaves de diâmetro soam melhor que transições abruptas',
        icon: '📈',
        type: 'tip',
        category: 'construction'
      },
      {
        id: 'tips_13',
        title: 'Acabamento Interno',
        description: 'Superfície interna lisa melhora a ressonância. Lixar bem vale a pena!',
        icon: '✨',
        type: 'tip',
        category: 'construction'
      },
      {
        id: 'tips_14',
        title: 'Comprimento vs Afinação',
        description: 'Mais longo = mais grave. 1.2-1.5m = Dó. 1.5-2.0m = Lá. Mais de 2m = muito grave',
        icon: '📐',
        type: 'tip',
        category: 'construction'
      },

      // Dicas de Som e Técnica
      {
        id: 'tips_15',
        title: 'Respiração Circular',
        description: 'O som contínuo depende da técnica, não só do instrumento. Pratique!',
        icon: '🫁',
        type: 'tip',
        category: 'sound'
      },
      {
        id: 'tips_16',
        title: 'Overtones Naturais',
        description: 'Harmônicos aparecem naturalmente. Não force - deixe o instrumento ressoar',
        icon: '🎶',
        type: 'tip',
        category: 'sound'
      },
      {
        id: 'tips_17',
        title: 'Posição da Língua',
        description: 'Mudanças sutis na posição da língua alteram significativamente o timbre',
        icon: '👅',
        type: 'tip',
        category: 'sound'
      },

      // Dicas Técnicas do App
      {
        id: 'tips_3',
        title: 'Modo Offline',
        description: 'O app funciona completamente offline. Todos os cálculos são locais',
        icon: '📱',
        type: 'tip',
        category: 'offline'
      },
      {
        id: 'tips_4',
        title: 'Backup Automático',
        description: 'Projetos favoritos são salvos automaticamente. Use ⭐ para marcar importantes',
        icon: '💾',
        type: 'tip',
        category: 'backup'
      },
      {
        id: 'tips_18',
        title: 'Exportação Profissional',
        description: 'Exporte relatórios PDF com gráficos para documentar seus projetos',
        icon: '📊',
        type: 'tip',
        category: 'export'
      },
      {
        id: 'tips_19',
        title: 'Comparar Projetos',
        description: 'Use o gerenciador para comparar diferentes designs e suas frequências',
        icon: '⚖️',
        type: 'tip',
        category: 'comparison'
      },

      // Dicas de Design
      {
        id: 'tips_20',
        title: 'Design Bell vs Straight',
        description: 'Bell = mais harmônicos complexos. Straight = som mais limpo e direto',
        icon: '🎺',
        type: 'tip',
        category: 'design'
      },
      {
        id: 'tips_21',
        title: 'Proporção Áurea',
        description: 'Alguns construtores usam proporção áurea (1.618) para posicionar expansões',
        icon: '📏',
        type: 'tip',
        category: 'design'
      },
      {
        id: 'tips_22',
        title: 'Material Importa',
        description: 'Madeira densa = som mais focado. Madeira leve = mais harmônicos',
        icon: '🌳',
        type: 'tip',
        category: 'material'
      },

      // Dicas Avançadas
      {
        id: 'tips_23',
        title: 'Análise Espectral',
        description: 'Use o preview sonoro para ouvir como diferentes geometrias afetam o timbre',
        icon: '🔊',
        type: 'tip',
        category: 'advanced'
      },
      {
        id: 'tips_24',
        title: 'Temperatura e Umidade',
        description: 'Condições ambientais afetam madeira e som. Considere isso no design',
        icon: '🌡️',
        type: 'tip',
        category: 'environmental'
      },
      {
        id: 'tips_25',
        title: 'Iteração é Chave',
        description: 'Grandes didgeridoos vêm de muitas iterações. Teste, ajuste, repita!',
        icon: '🔄',
        type: 'tip',
        category: 'process'
      },

      // Dicas Culturais
      {
        id: 'tips_26',
        title: 'Respeito Cultural',
        description: 'Didgeridoo é sagrado para aborígenes australianos. Aprenda com respeito',
        icon: '🙏',
        type: 'tip',
        category: 'cultural'
      },
      {
        id: 'tips_27',
        title: 'Tradição vs Inovação',
        description: 'Balance tradições milenares com inovação moderna no seu design',
        icon: '⚖️',
        type: 'tip',
        category: 'cultural'
      },

      // Dicas de Performance
      {
        id: 'tips_28',
        title: 'Otimização do App',
        description: 'Para análises mais rápidas, use menos pontos em testes iniciais',
        icon: '⚡',
        type: 'tip',
        category: 'performance'
      },
      {
        id: 'tips_29',
        title: 'Cache Inteligente',
        description: 'O app salva automaticamente análises recentes para acesso rápido',
        icon: '🧠',
        type: 'tip',
        category: 'performance'
      },
      {
        id: 'tips_30',
        title: 'Visualização 3D',
        description: 'Use a visualização para detectar problemas na geometria visualmente',
        icon: '👁️',
        type: 'tip',
        category: 'visualization'
      }
    ]
  };

  static async initializeTutorial() {
    try {
      const progress = await this.getTutorialProgress();
      const settings = await this.getTutorialSettings();
      const hasCompletedFirstRun = await this.hasCompletedFirstRun();
      
      return {
        progress,
        settings,
        shouldShowWelcome: !progress.welcome?.completed,
        shouldShowFirstRunTutorial: !hasCompletedFirstRun,
        isFirstRun: !hasCompletedFirstRun,
        currentStep: this.getCurrentStep(progress)
      };
    } catch (error) {
      console.error('Error initializing tutorial:', error);
      return {
        progress: {},
        settings: { enabled: true, autoPlay: true },
        shouldShowWelcome: true,
        shouldShowFirstRunTutorial: true,
        isFirstRun: true,
        currentStep: null
      };
    }
  }

  static async hasCompletedFirstRun() {
    try {
      const firstRunKey = '@didgemap_first_run_completed';
      const completed = await AsyncStorage.getItem(firstRunKey);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking first run:', error);
      return false;
    }
  }

  static async markFirstRunCompleted() {
    try {
      const firstRunKey = '@didgemap_first_run_completed';
      await AsyncStorage.setItem(firstRunKey, 'true');
      return true;
    } catch (error) {
      console.error('Error marking first run completed:', error);
      return false;
    }
  }

  static async resetFirstRun() {
    try {
      const firstRunKey = '@didgemap_first_run_completed';
      await AsyncStorage.removeItem(firstRunKey);
      return true;
    } catch (error) {
      console.error('Error resetting first run:', error);
      return false;
    }
  }

  static getFirstRunTutorialSteps() {
    return this.tutorialSteps.first_run;
  }

  static async completeFirstRunTutorial() {
    try {
      // Mark first run as completed
      await this.markFirstRunCompleted();
      
      // Mark welcome section as completed too
      await this.markSectionCompleted('welcome');
      
      return true;
    } catch (error) {
      console.error('Error completing first run tutorial:', error);
      return false;
    }
  }

  static async startManualTutorial() {
    try {
      // This allows users to restart tutorial from settings
      return this.tutorialSteps.first_run;
    } catch (error) {
      console.error('Error starting manual tutorial:', error);
      return [];
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

  static async getDailyTip() {
    try {
      const settings = await this.getTutorialSettings();
      if (!settings.showTips) return null;

      const tips = this.tutorialSteps.tips_and_tricks;
      if (tips.length === 0) return null;

      // Use a data atual para garantir a mesma dica por dia
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
      
      // Rotaciona através de todas as dicas baseado no dia do ano
      const tipIndex = dayOfYear % tips.length;
      const dailyTip = { ...tips[tipIndex], isDailyTip: true };

      return dailyTip;
    } catch (error) {
      console.error('Error getting daily tip:', error);
      return null;
    }
  }

  static async getWeeklyTips() {
    try {
      const settings = await this.getTutorialSettings();
      if (!settings.showTips) return [];

      const tips = this.tutorialSteps.tips_and_tricks;
      if (tips.length === 0) return [];

      // Retorna 7 dicas para a semana
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
      const weeklyTips = [];

      for (let i = 0; i < 7; i++) {
        const tipIndex = (dayOfYear + i) % tips.length;
        weeklyTips.push({
          ...tips[tipIndex],
          dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][i],
          isWeeklyTip: true
        });
      }

      return weeklyTips;
    } catch (error) {
      console.error('Error getting weekly tips:', error);
      return [];
    }
  }

  static async getTipsByCategory(category) {
    try {
      const settings = await this.getTutorialSettings();
      if (!settings.showTips) return [];

      const tips = this.tutorialSteps.tips_and_tricks;
      return tips.filter(tip => tip.category === category);
    } catch (error) {
      console.error('Error getting tips by category:', error);
      return [];
    }
  }

  static getTipCategories() {
    const tips = this.tutorialSteps.tips_and_tricks;
    const categories = [...new Set(tips.map(tip => tip.category))];
    
    return categories.map(category => ({
      id: category,
      name: this.getCategoryDisplayName(category),
      count: tips.filter(tip => tip.category === category).length
    }));
  }

  static getCategoryDisplayName(category) {
    const names = {
      geometry: 'Geometria',
      analysis: 'Análise',
      construction: 'Construção', 
      sound: 'Som & Técnica',
      offline: 'Modo Offline',
      backup: 'Backup',
      export: 'Exportação',
      comparison: 'Comparação',
      design: 'Design',
      material: 'Materiais',
      advanced: 'Avançado',
      environmental: 'Ambiente',
      process: 'Processo',
      cultural: 'Cultural',
      performance: 'Performance',
      visualization: 'Visualização'
    };
    return names[category] || category;
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