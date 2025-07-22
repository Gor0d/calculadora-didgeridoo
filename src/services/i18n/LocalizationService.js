/**
 * Localization Service for Didgeridoo Calculator
 * Supports PT-BR and EN-US
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalizationService {
  constructor() {
    this.currentLanguage = 'pt-BR';
    this.translations = {
      'pt-BR': {
        // App General
        appName: 'Didgemap',
        appSubtitle: 'Calculadora Avançada de Didgeridoo',
        
        // Header Features
        acousticAnalysis: '🔍 Análise Acústica',
        visualization: '📊 Visualização',
        audioPreview: '🎵 Preview Sonoro',
        
        // Unit System
        unitSystem: '📏 Sistema de Unidades',
        metric: 'Métrico',
        imperial: 'Imperial',
        metricSubLabel: 'cm/mm',
        imperialSubLabel: 'inches',
        metricHelp: 'Use centímetros para posição e milímetros para diâmetro',
        imperialHelp: 'Use inches for both position and diameter (fractions supported)',
        
        // Quick Examples
        quickExamples: '⚡ Exemplos rápidos:',
        loadFile: '📂 Arquivo',
        traditional: '🎺 Tradicional',
        traditionalDesc: 'Clássico australiano',
        straight: '📏 Reto',
        straightDesc: 'Tubo uniforme',
        bell: '🔔 Campana',
        bellDesc: 'Abertura em sino',
        wavy: '🌊 Ondulado',
        wavyDesc: 'Variações suaves',
        aggressive: '⚡ Agressivo',
        aggressiveDesc: 'Mudanças bruscas',
        precision: '🎯 Precisão',
        precisionDesc: 'Medidas exatas',
        biodrone: '🔥 BioDrone',
        biodroneDesc: 'Design Renan',
        
        // Geometry Input
        geometryTitle: '📐 Geometria do Didgeridoo',
        geometryFormat: 'Formato: posição(cm) diâmetro(mm)',
        geometryFormatImperial: 'Formato: posição(") diâmetro(")',
        analyze: '🔬 Analisar',
        analyzing: '🔄 Analisando...',
        visualize: '📊 Visualizar',
        hide: '👁️ Ocultar',
        
        // Stats
        length: 'COMPRIMENTO',
        diameter: 'DIÂMETRO',
        points: 'PONTOS',
        volume: 'VOLUME',
        
        // Analysis Results
        analysisResults: '🎼 Resultados da Análise Acústica',
        harmonicSeries: 'Série Harmônica:',
        fundamental: 'Fundamental',
        harmonic: 'Harmônico',
        frequency: 'Freq',
        note: 'Nota',
        cents: 'Cents',
        amplitude: 'Amplitude',
        quality: 'Qualidade',
        playDrone: '🎵 Drone',
        playHarmonics: '🎺 Harmônicos',
        playFullSpectrum: '🎼 Espectro',
        
        // Audio
        playingDrone: '🎵 Drone do Didgeridoo',
        frequencyLabel: 'Frequência',
        noteLabel: 'Nota',
        lowFreq: '🔊 Grave - Vibrações lentas e pesadas',
        midFreq: '🎯 Médio - Vibrações balanceadas',
        highFreq: '⚡ Agudo - Vibrações rápidas e leves',
        
        // Projects
        recentProjects: '📂 Projetos Recentes',
        noProjects: 'Nenhum projeto salvo ainda.',
        saveProject: '💾 Salvar Projeto',
        newProject: 'Novo Projeto',
        enterProjectName: 'Digite o nome do projeto:',
        projectSaved: '✅ Projeto Salvo',
        projectSavedSuccess: 'foi salvo com sucesso!',
        loadProject: 'Carregar Projeto',
        confirmLoad: 'Deseja carregar este projeto? Dados não salvos serão perdidos.',
        load: 'Carregar',
        
        // Validation & Errors
        validationError: '⚠️ Erro de Validação',
        analysisError: 'Erro de Análise',
        audioError: 'Erro de Áudio',
        fileError: '⚠️ Arquivo com Problemas',
        fileLoaded: '✅ Arquivo Carregado',
        fileLoadedSuccess: 'foi carregado com sucesso!',
        insufficientPoints: 'Mínimo 2 pontos necessários',
        invalidSequence: 'deve ser maior que a anterior',
        lengthWarning: 'Comprimento muito longo',
        diameterWarning: 'Diâmetros fora da faixa típica',
        
        // Onboarding
        welcome: 'Bem-vindo ao Didgemap',
        welcomeSubtitle: 'A primeira calculadora científica de didgeridoo do mundo',
        welcomeDesc: 'Analise, projete e otimize didgeridoos com precisão profissional baseada em física acústica real.',
        analysisTitle: 'Análise Acústica Avançada',
        analysisSubtitle: 'Cálculos baseados em equações de Webster',
        analysisDesc: 'Digite medidas simples e obtenha frequências fundamentais, harmônicos e análise completa da resposta acústica.',
        visualizationTitle: 'Visualização em Tempo Real',
        visualizationSubtitle: 'Veja a geometria interna do seu instrumento',
        visualizationDesc: 'Visualize o perfil interno, estatísticas detalhadas e validação inteligente de medidas.',
        audioTitle: 'Preview Sonoro',
        audioSubtitle: 'Escute como seu didgeridoo vai soar',
        audioDesc: 'Síntese de áudio em tempo real com drone fundamental, harmônicos e espectro completo.',
        projectsTitle: 'Sistema de Projetos',
        projectsSubtitle: 'Salve e gerencie seus designs',
        projectsDesc: 'Salvamento automático, histórico de projetos e exportação de dados para uso profissional.',
        skip: 'Pular',
        next: 'Próximo',
        start: 'Começar',
        
        // Language
        language: '🌐 Idioma',
        portuguese: 'Português (BR)',
        english: 'English (US)',
        
        // Common Actions
        ok: 'OK',
        cancel: 'Cancelar',
        yes: 'Sim',
        no: 'Não',
        save: 'Salvar',
        delete: 'Excluir',
        edit: 'Editar',
        close: 'Fechar',
        
        // Settings
        settings: 'Configurações',
        settingsDesc: 'Personalize sua experiência',
        preferences: 'Preferências',
        hapticFeedback: 'Feedback Háptico',
        hapticFeedbackDesc: 'Vibração ao tocar botões',
        autoSave: 'Salvamento Automático',
        autoSaveDesc: 'Salvar projetos automaticamente',
        dataManagement: 'Gerenciamento de Dados',
        exportData: 'Exportar Dados',
        exportDataDesc: 'Fazer backup de todos os projetos',
        exportDataShort: 'Backup completo dos projetos',
        importData: 'Importar Dados',
        importDataDesc: 'Restaurar projetos de backup',
        importDataShort: 'Restaurar backup',
        advanced: 'Avançado',
        resetApp: 'Resetar Aplicativo',
        resetAppWarning: 'Isso irá apagar todos os dados. Continuar?',
        resetAppShort: 'Apagar todos os dados',
        resetOnboarding: 'Resetar Tutorial',
        resetOnboardingDesc: 'Mostrar tutorial inicial novamente',
        resetOnboardingSuccess: 'Tutorial será mostrado no próximo início!',
        about: 'Sobre',
        version: 'Versão',
        build: 'Build',
        developer: 'Desenvolvedor',
        madeWith: 'Feito com',
        forDidgeridoo: 'para didgeridoo',
        export: 'Exportar',
        import: 'Importar',
        reset: 'Resetar',
        
        // Navigation
        home: 'Início',
        projects: 'Projetos',
        
        // Additional translations
        geometryVisualization: 'Visualização da Geometria',
        geometryVisualizationDesc: 'Perfil interno do didgeridoo',
        pleaseEnterGeometry: 'Por favor, insira a geometria do didgeridoo',
        analysisCalculationFailed: 'Falha no cálculo acústico',
        unexpectedError: 'Erro inesperado durante a análise',
        audioNotReady: 'Sistema de áudio não está pronto',
        audioPlaybackError: 'Não foi possível reproduzir o som',
        saveError: 'Erro ao Salvar',
        noGeometryToSave: 'Nenhuma geometria para salvar',
        failedToSaveProject: 'Falha ao salvar projeto',
        fileLoadedWithErrors: 'foi carregado, mas contém erros',
        unknownError: 'Erro desconhecido',
        
        // Export/Import/Reset
        exportDataSuccess: 'Dados exportados com sucesso!',
        exportDataError: 'Erro ao exportar dados.',
        importDataSuccess: 'Dados importados com sucesso!',
        importDataError: 'Erro ao importar dados.',
        resetAppSuccess: 'Aplicativo resetado com sucesso!',
        resetAppError: 'Erro ao resetar aplicativo.',
        
        // Suggestions
        suggestions: 'Sugestões:',
        checkMeasurements: 'Verifique as medidas inseridas',
        useIncreasingPositions: 'Use posições crescentes',
        checkDiameters: 'Verifique os diâmetros',
        addMorePoints: 'Adicione mais pontos de medição',
        
        // QuickExamples
        shareDesign: 'Compartilhar Design',
        shareDesignDesc: 'Envie suas medidas para adicionarmos aqui!',
        yourDesign: 'Seu Design',
        fileLoadingNotImplemented: 'Carregamento de arquivo não implementado ainda'
      },
      
      'en-US': {
        // App General
        appName: 'Didgemap',
        appSubtitle: 'Advanced Didgeridoo Calculator',
        
        // Header Features
        acousticAnalysis: '🔍 Acoustic Analysis',
        visualization: '📊 Visualization',
        audioPreview: '🎵 Audio Preview',
        
        // Unit System
        unitSystem: '📏 Unit System',
        metric: 'Metric',
        imperial: 'Imperial',
        metricSubLabel: 'cm/mm',
        imperialSubLabel: 'inches',
        metricHelp: 'Use centimeters for position and millimeters for diameter',
        imperialHelp: 'Use inches for both position and diameter (fractions supported)',
        
        // Quick Examples
        quickExamples: '⚡ Quick examples:',
        loadFile: '📂 File',
        traditional: '🎺 Traditional',
        traditionalDesc: 'Classic Australian',
        straight: '📏 Straight',
        straightDesc: 'Uniform tube',
        bell: '🔔 Bell',
        bellDesc: 'Bell opening',
        wavy: '🌊 Wavy',
        wavyDesc: 'Smooth variations',
        aggressive: '⚡ Aggressive',
        aggressiveDesc: 'Sharp changes',
        precision: '🎯 Precision',
        precisionDesc: 'Exact measurements',
        biodrone: '🔥 BioDrone',
        biodroneDesc: 'Renan Design',
        
        // Geometry Input
        geometryTitle: '📐 Didgeridoo Geometry',
        geometryFormat: 'Format: position(cm) diameter(mm)',
        geometryFormatImperial: 'Format: position(") diameter(")',
        analyze: '🔬 Analyze',
        analyzing: '🔄 Analyzing...',
        visualize: '📊 Visualize',
        hide: '👁️ Hide',
        
        // Stats
        length: 'LENGTH',
        diameter: 'DIAMETER',
        points: 'POINTS',
        volume: 'VOLUME',
        
        // Analysis Results
        analysisResults: '🎼 Acoustic Analysis Results',
        harmonicSeries: 'Harmonic Series:',
        fundamental: 'Fundamental',
        harmonic: 'Harmonic',
        frequency: 'Freq',
        note: 'Note',
        cents: 'Cents',
        amplitude: 'Amplitude',
        quality: 'Quality',
        playDrone: '🎵 Drone',
        playHarmonics: '🎺 Harmonics',
        playFullSpectrum: '🎼 Spectrum',
        
        // Audio
        playingDrone: '🎵 Didgeridoo Drone',
        frequencyLabel: 'Frequency',
        noteLabel: 'Note',
        lowFreq: '🔊 Low - Slow and heavy vibrations',
        midFreq: '🎯 Mid - Balanced vibrations',
        highFreq: '⚡ High - Fast and light vibrations',
        
        // Projects
        recentProjects: '📂 Recent Projects',
        noProjects: 'No saved projects yet.',
        saveProject: '💾 Save Project',
        newProject: 'New Project',
        enterProjectName: 'Enter project name:',
        projectSaved: '✅ Project Saved',
        projectSavedSuccess: 'was saved successfully!',
        loadProject: 'Load Project',
        confirmLoad: 'Load this project? Unsaved data will be lost.',
        load: 'Load',
        
        // Validation & Errors
        validationError: '⚠️ Validation Error',
        analysisError: 'Analysis Error',
        audioError: 'Audio Error',
        fileError: '⚠️ File Issues',
        fileLoaded: '✅ File Loaded',
        fileLoadedSuccess: 'was loaded successfully!',
        insufficientPoints: 'Minimum 2 points required',
        invalidSequence: 'must be greater than previous',
        lengthWarning: 'Length very long',
        diameterWarning: 'Diameters outside typical range',
        
        // Onboarding
        welcome: 'Welcome to Didgemap',
        welcomeSubtitle: "The world's first scientific didgeridoo calculator",
        welcomeDesc: 'Analyze, design and optimize didgeridoos with professional precision based on real acoustic physics.',
        analysisTitle: 'Advanced Acoustic Analysis',
        analysisSubtitle: 'Calculations based on Webster equations',
        analysisDesc: 'Enter simple measurements and get fundamental frequencies, harmonics and complete acoustic response analysis.',
        visualizationTitle: 'Real-time Visualization',
        visualizationSubtitle: 'See your instrument internal geometry',
        visualizationDesc: 'Visualize internal profile, detailed statistics and intelligent measurement validation.',
        audioTitle: 'Audio Preview',
        audioSubtitle: 'Hear how your didgeridoo will sound',
        audioDesc: 'Real-time audio synthesis with fundamental drone, harmonics and full spectrum.',
        projectsTitle: 'Project System',
        projectsSubtitle: 'Save and manage your designs',
        projectsDesc: 'Auto-save, project history and data export for professional use.',
        skip: 'Skip',
        next: 'Next',
        start: 'Start',
        
        // Language
        language: '🌐 Language',
        portuguese: 'Português (BR)',
        english: 'English (US)',
        
        // Common Actions
        ok: 'OK',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        
        // Settings
        settings: 'Settings',
        settingsDesc: 'Customize your experience',
        preferences: 'Preferences',
        hapticFeedback: 'Haptic Feedback',
        hapticFeedbackDesc: 'Vibration when tapping buttons',
        autoSave: 'Auto Save',
        autoSaveDesc: 'Save projects automatically',
        dataManagement: 'Data Management',
        exportData: 'Export Data',
        exportDataDesc: 'Backup all projects',
        exportDataShort: 'Complete project backup',
        importData: 'Import Data',
        importDataDesc: 'Restore projects from backup',
        importDataShort: 'Restore backup',
        advanced: 'Advanced',
        resetApp: 'Reset App',
        resetAppWarning: 'This will delete all data. Continue?',
        resetAppShort: 'Delete all data',
        resetOnboarding: 'Reset Tutorial',
        resetOnboardingDesc: 'Show initial tutorial again',
        resetOnboardingSuccess: 'Tutorial will be shown on next start!',
        about: 'About',
        version: 'Version',
        build: 'Build',
        developer: 'Developer',
        madeWith: 'Made with',
        forDidgeridoo: 'for didgeridoo',
        export: 'Export',
        import: 'Import',
        reset: 'Reset',
        
        // Navigation
        home: 'Home',
        projects: 'Projects',
        
        // Additional translations
        geometryVisualization: 'Geometry Visualization',
        geometryVisualizationDesc: 'Internal didgeridoo profile',
        pleaseEnterGeometry: 'Please enter didgeridoo geometry',
        analysisCalculationFailed: 'Acoustic calculation failed',
        unexpectedError: 'Unexpected error during analysis',
        audioNotReady: 'Audio system not ready',
        audioPlaybackError: 'Could not play sound',
        saveError: 'Save Error',
        noGeometryToSave: 'No geometry to save',
        failedToSaveProject: 'Failed to save project',
        fileLoadedWithErrors: 'was loaded but contains errors',
        unknownError: 'Unknown error',
        
        // Export/Import/Reset
        exportDataSuccess: 'Data exported successfully!',
        exportDataError: 'Error exporting data.',
        importDataSuccess: 'Data imported successfully!',
        importDataError: 'Error importing data.',
        resetAppSuccess: 'App reset successfully!',
        resetAppError: 'Error resetting app.',
        
        // Suggestions
        suggestions: 'Suggestions:',
        checkMeasurements: 'Check entered measurements',
        useIncreasingPositions: 'Use increasing positions',
        checkDiameters: 'Check diameters',
        addMorePoints: 'Add more measurement points',
        
        // QuickExamples
        shareDesign: 'Share Design',
        shareDesignDesc: 'Send us your measurements to add here!',
        yourDesign: 'Your Design',
        fileLoadingNotImplemented: 'File loading not implemented yet'
      }
    };
  }

  /**
   * Initialize localization service
   */
  async initialize() {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && this.translations[savedLanguage]) {
        this.currentLanguage = savedLanguage;
      } else {
        // Auto-detect system language
        const systemLanguage = this.getSystemLanguage();
        this.currentLanguage = this.translations[systemLanguage] ? systemLanguage : 'pt-BR';
      }
    } catch (error) {
      console.warn('Error loading saved language:', error);
      this.currentLanguage = 'pt-BR';
    }
  }

  /**
   * Get system language
   */
  getSystemLanguage() {
    // For React Native, we can use the device locale
    // This is a simplified version - in production you'd use react-native-localize
    const locale = 'pt-BR'; // Default fallback
    
    if (locale.startsWith('en')) return 'en-US';
    if (locale.startsWith('pt')) return 'pt-BR';
    
    return 'pt-BR'; // Default
  }

  /**
   * Set current language
   */
  async setLanguage(language) {
    if (!this.translations[language]) {
      console.warn('Language not supported:', language);
      return false;
    }
    
    this.currentLanguage = language;
    
    try {
      await AsyncStorage.setItem('selectedLanguage', language);
      return true;
    } catch (error) {
      console.warn('Error saving language preference:', error);
      return false;
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' }
    ];
  }

  /**
   * Translate a key
   */
  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage][key] || 
                       this.translations['pt-BR'][key] || 
                       key;
    
    // Simple parameter substitution
    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param]);
    });
    
    return result;
  }

  /**
   * Get all translations for current language
   */
  getTranslations() {
    return this.translations[this.currentLanguage];
  }

  /**
   * Check if key exists
   */
  hasTranslation(key) {
    return !!this.translations[this.currentLanguage][key];
  }

  /**
   * Get RTL direction (always false for PT-BR and EN-US)
   */
  isRTL() {
    return false;
  }

  /**
   * Format number according to locale
   */
  formatNumber(number, decimals = 1) {
    if (this.currentLanguage === 'en-US') {
      return number.toFixed(decimals);
    } else {
      // PT-BR uses comma as decimal separator
      return number.toFixed(decimals).replace('.', ',');
    }
  }

  /**
   * Get decimal separator
   */
  getDecimalSeparator() {
    return this.currentLanguage === 'en-US' ? '.' : ',';
  }
}

// Export singleton instance
export const localizationService = new LocalizationService();