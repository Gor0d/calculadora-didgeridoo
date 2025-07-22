import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { AppWrapper } from './src/components/AppWrapper';
import { TabNavigator } from './src/navigation/TabNavigator';
import { unitConverter } from './src/services/units/UnitConverter';
import { localizationService } from './src/services/i18n/LocalizationService';
import { ProjectStorage } from './src/services/storage/ProjectStorage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [currentUnit, setCurrentUnit] = useState('metric');
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  // Initialize localization on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize localization
        await localizationService.initialize();
        setCurrentLanguage(localizationService.getCurrentLanguage());
        setIsI18nInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsI18nInitialized(true); // Still show app even if i18n fails
      }
    };

    initApp();
  }, []);

  const handleUnitChange = (newUnit) => {
    if (newUnit === currentUnit) return;
    setCurrentUnit(newUnit);
  };

  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;
    
    try {
      const success = await localizationService.setLanguage(newLanguage);
      if (success) {
        setCurrentLanguage(newLanguage);
        // Force re-render of all translated components
        setIsI18nInitialized(false);
        setTimeout(() => setIsI18nInitialized(true), 100);
      }
    } catch (error) {
      console.warn('Error changing language:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const projects = await ProjectStorage.getAllProjects();
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        projects,
        settings: {
          language: currentLanguage,
          unit: currentUnit,
        }
      };

      // This would typically save to a file or share
      console.log('Export data:', exportData);
      Alert.alert(
        localizationService.t('exportData'),
        localizationService.t('exportDataSuccess'),
        [{ text: localizationService.t('ok') }]
      );
    } catch (error) {
      Alert.alert(
        localizationService.t('exportData'),
        localizationService.t('exportDataError'),
        [{ text: localizationService.t('ok') }]
      );
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importData = JSON.parse(fileContent);
        
        // Validate and import data
        if (importData.projects) {
          for (const project of importData.projects) {
            await ProjectStorage.saveProject(project);
          }
          
          Alert.alert(
            localizationService.t('importData'),
            localizationService.t('importDataSuccess'),
            [{ text: localizationService.t('ok') }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        localizationService.t('importData'),
        localizationService.t('importDataError'),
        [{ text: localizationService.t('ok') }]
      );
    }
  };

  const handleResetApp = async () => {
    try {
      await ProjectStorage.clearAllProjects();
      setCurrentUnit('metric');
      setCurrentLanguage('pt-BR');
      await localizationService.setLanguage('pt-BR');
      
      Alert.alert(
        localizationService.t('resetApp'),
        localizationService.t('resetAppSuccess'),
        [{ text: localizationService.t('ok') }]
      );
    } catch (error) {
      Alert.alert(
        localizationService.t('resetApp'),
        localizationService.t('resetAppError'),
        [{ text: localizationService.t('ok') }]
      );
    }
  };

  // Don't render until i18n is initialized
  if (!isI18nInitialized) {
    return null;
  }

  return (
    <AppWrapper>
      <TabNavigator
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        currentUnit={currentUnit}
        onUnitChange={handleUnitChange}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetApp={handleResetApp}
      />
    </AppWrapper>
  );
}
const GeometryVisualization = React.memo(({ geometry, isVisible, currentUnit = 'metric' }) => {
  const points = useMemo(() => {
    if (!isVisible || !geometry.trim()) return [];
    
    // Use unit converter to parse geometry correctly
    try {
      return unitConverter.parseGeometry(geometry, currentUnit);
    } catch (error) {
      console.warn('Error parsing geometry for visualization:', error);
      return [];
    }
  }, [geometry, isVisible, currentUnit]);

  const { svgDimensions, pathData, controlPoints } = useMemo(() => {
    if (!isVisible || !geometry.trim() || points.length < 2) {
      return { svgDimensions: null, pathData: null, controlPoints: [] };
    }

    const maxPosition = Math.max(...points.map(p => p.position));
    const maxDiameter = Math.max(...points.map(p => p.diameter));
    const minDiameter = Math.min(...points.map(p => p.diameter));

    const svgHeight = deviceInfo.isTablet ? scale(200) : scale(150);
    const svgWidth = Math.min(SCREEN_WIDTH - spacing.xl, deviceInfo.isTablet ? 500 : 350);
    const margin = spacing.md;
    const scaleX = (svgWidth - margin * 2) / maxPosition;
    const scaleY = (svgHeight - margin * 2) / maxDiameter;
    
    const topPath = points.map(p => ({
      x: margin + p.position * scaleX,
      y: svgHeight / 2 - (p.diameter / 2) * scaleY
    }));

    const bottomPath = points.map(p => ({
      x: margin + p.position * scaleX,
      y: svgHeight / 2 + (p.diameter / 2) * scaleY
    })).reverse();

    const pathData = `M ${[...topPath, ...bottomPath].map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    
    const controlPoints = points.map((point, index) => {
      const x = margin + point.position * scaleX;
      const yTop = svgHeight / 2 - (point.diameter / 2) * scaleY;
      const yBottom = svgHeight / 2 + (point.diameter / 2) * scaleY;
      return { x, yTop, yBottom, index };
    });

    return {
      svgDimensions: { svgWidth, svgHeight, margin, maxPosition, maxDiameter, minDiameter },
      pathData,
      controlPoints
    };
  }, [points, isVisible, geometry]);

  if (!isVisible || !geometry.trim() || points.length < 2) return null;

  return (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>📐 Visualização da Geometria</Text>
      
      <View style={styles.svgContainer}>
        <Svg width={svgDimensions.svgWidth} height={svgDimensions.svgHeight} viewBox={`0 0 ${svgDimensions.svgWidth} ${svgDimensions.svgHeight}`}>
          {/* Background rectangle */}
          <Rect 
            x="0" 
            y="0" 
            width={svgDimensions.svgWidth} 
            height={svgDimensions.svgHeight} 
            fill="#F8FAFC" 
            stroke="#CBD5E1" 
            strokeWidth="2"
          />
          
          {/* Test elements */}
          <Circle cx={svgDimensions.svgWidth/2} cy={svgDimensions.svgHeight/2} r="10" fill="#FF0000" />
          <Line x1={20} y1={20} x2={svgDimensions.svgWidth-20} y2={20} stroke="#000000" strokeWidth="2" />
          
          {/* Center line */}
          <Line
            x1={svgDimensions.margin}
            y1={svgDimensions.svgHeight / 2}
            x2={svgDimensions.svgWidth - svgDimensions.margin}
            y2={svgDimensions.svgHeight / 2}
            stroke="#94A3B8"
            strokeWidth="2"
          />
          
          {/* Didgeridoo shape - optimized */}
          <Path
            d={pathData}
            fill="rgba(16, 185, 129, 0.4)"
            stroke="#10B981"
            strokeWidth="3"
          />
          
          {/* Control points - optimized */}
          {controlPoints.map((point) => (
            <G key={point.index}>
              <Circle cx={point.x} cy={point.yTop} r="5" fill="#EF4444" />
              <Circle cx={point.x} cy={point.yBottom} r="5" fill="#EF4444" />
            </G>
          ))}
        </Svg>
      </View>
      
      <View style={styles.geometryInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>COMPRIMENTO</Text>
          <Text style={styles.infoValue}>{svgDimensions.maxPosition.toFixed(1)} cm</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>DIÂMETRO</Text>
          <Text style={styles.infoValue}>{svgDimensions.minDiameter.toFixed(1)}-{svgDimensions.maxDiameter.toFixed(1)} mm</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>PONTOS</Text>
          <Text style={styles.infoValue}>{points.length}</Text>
        </View>
      </View>
      
      <Text style={styles.visualizationHint}>💡 Visualização do perfil interno do didgeridoo</Text>
    </View>
  );
});

// Analysis Results Component - Optimized with memoization
const AnalysisResults = React.memo(({ results, isVisible, onPlaySound }) => {
  const handlePlaySound = useCallback((type, data) => {
    onPlaySound(type, data);
  }, [onPlaySound]);

  if (!isVisible || !results || results.length === 0) return null;

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>📊 Resultados da Análise</Text>
      
      <View style={styles.droneResult}>
        <View style={styles.droneInfo}>
          <Text style={styles.droneLabel}>DRONE (Fundamental)</Text>
          <Text style={styles.droneFrequency}>{Math.round(results[0].frequency)} Hz</Text>
          <Text style={styles.droneNote}>{results[0].note}{results[0].octave}</Text>
        </View>
        <View style={styles.droneAccuracy}>
          <Text style={styles.accuracyLabel}>AFINAÇÃO</Text>
          <Text style={[
            styles.accuracyValue,
            { color: Math.abs(results[0].centDiff) < 10 ? '#10B981' : '#EF4444' }
          ]}>
            {results[0].centDiff > 0 ? '+' : ''}{results[0].centDiff}¢
          </Text>
          <Text style={styles.accuracyStatus}>
            {Math.abs(results[0].centDiff) < 10 ? '✅ Afinado' : '⚠️ Desafinado'}
          </Text>
        </View>
      </View>
      
      {results.length > 1 && (
        <>
          <Text style={styles.harmonicsTitle}>🎺 Harmônicos (Trombetas)</Text>
          <View style={styles.harmonicsGrid}>
            {results.slice(1, 5).map((result, index) => (
              <View key={index} style={styles.harmonicItem}>
                <Text style={styles.harmonicOrder}>{index + 2}º</Text>
                <Text style={styles.harmonicFrequency}>{Math.round(result.frequency)}Hz</Text>
                <Text style={styles.harmonicNote}>{result.note}{result.octave}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      
      <View style={styles.soundPreviewContainer}>
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.droneButton]}
          onPress={() => handlePlaySound('drone', {
            fundamental: results[0].frequency,
            harmonics: results.slice(1, 4).map(r => ({
              frequency: r.frequency,
              amplitude: r.amplitude || (0.8 / (results.indexOf(r) + 1)) // Decreasing amplitude
            }))
          })}
        >
          <Text style={styles.soundPreviewText}>🎵 Drone ({Math.round(results[0].frequency)}Hz)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.harmonicsButton]}
          onPress={() => handlePlaySound('harmonics', results.map(r => r.frequency))}
        >
          <Text style={styles.soundPreviewText}>🎺 Harmônicos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.fullSpectrumButton]}
          onPress={() => handlePlaySound('full', results.map(r => r.frequency))}
        >
          <Text style={styles.soundPreviewText}>🎼 Espectro Completo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Recent Projects Component
const RecentProjects = ({ projects, onLoadProject, onSaveProject }) => {
  if (!projects || projects.length === 0) {
    return (
      <View style={styles.projectsContainer}>
        <View style={styles.projectsHeader}>
          <Text style={styles.projectsTitle}>📁 Projetos Recentes</Text>
          <TouchableOpacity style={styles.saveProjectButton} onPress={onSaveProject}>
            <Text style={styles.saveProjectText}>💾 Salvar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.noProjectsText}>Nenhum projeto salvo ainda. Analise uma geometria e ela será automaticamente salva!</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.projectsContainer}>
      <View style={styles.projectsHeader}>
        <Text style={styles.projectsTitle}>📁 Projetos Recentes</Text>
        <TouchableOpacity style={styles.saveProjectButton} onPress={onSaveProject}>
          <Text style={styles.saveProjectText}>💾 Salvar</Text>
        </TouchableOpacity>
      </View>
      
      {projects.slice(0, 5).map((project, index) => {
        const droneNote = project.analysis && project.analysis[0] 
          ? `${project.analysis[0].note}${project.analysis[0].octave} (${Math.round(project.analysis[0].frequency)}Hz)`
          : 'Não analisado';
          
        return (
          <TouchableOpacity
            key={project.id || index}
            style={styles.projectItem}
            onPress={() => onLoadProject(project)}
          >
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDetails}>
                {droneNote} • {formatDate(project.updatedAt || project.createdAt)}
              </Text>
              {project.stats && (
                <Text style={styles.projectStats}>
                  {project.stats.totalLength.toFixed(0)}cm • {project.stats.pointCount} pontos
                </Text>
              )}
            </View>
            <Text style={styles.projectArrow}>→</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Main App Component
export default function App() {
  const [geometry, setGeometry] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [geometryStats, setGeometryStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUnit, setCurrentUnit] = useState('metric');
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  // Initialize audio engine and load projects on component mount
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize localization
        await localizationService.initialize();
        setCurrentLanguage(localizationService.getCurrentLanguage());
        setIsI18nInitialized(true);
        
        // Initialize audio
        await audioEngine.initialize();
        setIsAudioInitialized(true);
        
        // Load projects
        const projects = await ProjectStorage.getAllProjects();
        setRecentProjects(projects);
        
        // Load current project if exists
        const current = await ProjectStorage.getCurrentProject();
        if (current) {
          setCurrentProject(current);
          setGeometry(current.geometry);
          setCurrentFileName(current.name);
          
          // Validate loaded geometry
          const validation = validateGeometryString(current.geometry);
          if (validation.isValid) {
            setGeometryStats(getGeometryStats(validation.points));
          }
        }
      } catch (error) {
        console.warn('App initialization failed:', error);
      }
    };
    initApp();
  }, []);

  const handlePlaySound = async (type, data) => {
    if (!isAudioInitialized) {
      Alert.alert('Áudio Indisponível', 'O sistema de áudio não foi inicializado corretamente.');
      return;
    }

    try {
      switch (type) {
        case 'drone':
          // data should have: { fundamental, harmonics }
          const fundamental = data.fundamental || data;
          const harmonics = data.harmonics || [];
          await audioEngine.playDrone(fundamental, 3000, 0.3, harmonics);
          break;
        case 'harmonics':
          await audioEngine.playHarmonics(data, 2000, 0.2);
          break;
        case 'full':
          await audioEngine.playFullSpectrum(data, 4000, 0.25);
          break;
      }
    } catch (error) {
      Alert.alert('Erro de Áudio', 'Não foi possível reproduzir o som.');
      console.error('Audio playback error:', error);
    }
  };

  const handleGeometryChange = (text) => {
    setGeometry(text);
    
    // Real-time validation using unit converter
    if (text.trim()) {
      const validation = unitConverter.validateGeometry(text, currentUnit);
      setValidationErrors(validation.valid ? [] : [validation.errors[0]]);
      
      if (validation.valid && validation.points.length > 0) {
        setGeometryStats(getGeometryStats(validation.points));
      } else {
        setGeometryStats(null);
      }
    } else {
      setValidationErrors([]);
      setGeometryStats(null);
    }
  };

  const handleAnalyze = async () => {
    if (!geometry.trim()) {
      Alert.alert(localizationService.t('analysisError'), localizationService.t('analysisError'));
      return;
    }

    // Validate geometry before analysis using unit converter
    const validation = unitConverter.validateGeometry(geometry, currentUnit);
    if (!validation.valid) {
      const error = validation.errors[0];
      const suggestions = suggestFixes(error);
      
      Alert.alert(
        localizationService.t('validationError'),
        `${error.message}\n\n${localizationService.t('suggestions')}\n${suggestions.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsAnalyzing(true);
    setShowResults(false);
    
    try {
      // Real acoustic analysis
      const analysisResult = await acousticEngine.analyzeGeometry(validation.points);
      
      if (!analysisResult.success) {
        Alert.alert(
          'Erro de Análise',
          `Falha no cálculo acústico: ${analysisResult.error}`,
          [{ text: 'OK' }]
        );
        setIsAnalyzing(false);
        return;
      }

      // Format results for UI
      const formattedResults = analysisResult.results.map(result => ({
        frequency: result.frequency,
        note: result.note,
        octave: result.octave,
        centDiff: result.centDiff,
        harmonic: result.harmonic,
        amplitude: result.amplitude,
        quality: result.quality
      }));

      setAnalysisResults(formattedResults);
      setIsAnalyzing(false);
      setShowResults(true);
      
      // Auto-save project after successful analysis
      if (geometry.trim()) {
        await saveCurrentProject(formattedResults, analysisResult.metadata);
      }
      
    } catch (error) {
      Alert.alert(
        'Erro de Análise',
        `Erro inesperado: ${error.message}`,
        [{ text: 'OK' }]
      );
      setIsAnalyzing(false);
    }
  };

  const saveCurrentProject = async (analysisResults = null, metadata = null) => {
    try {
      const validation = validateGeometryString(geometry);
      if (!validation.isValid) return;

      const projectData = {
        id: currentProject?.id || null,
        name: currentFileName || `Projeto ${new Date().toLocaleDateString()}`,
        geometry: geometry.trim(),
        analysis: analysisResults || analysisResults,
        stats: geometryStats,
        metadata: metadata,
        length: geometryStats?.totalLength || null,
      };

      const savedProject = await ProjectStorage.saveProject(projectData);
      setCurrentProject(savedProject);
      await ProjectStorage.setCurrentProject(savedProject);
      
      // Refresh recent projects
      const projects = await ProjectStorage.getAllProjects();
      setRecentProjects(projects);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleSaveProject = async () => {
    if (!geometry.trim()) {
      Alert.alert('Erro', 'Não há geometria para salvar');
      return;
    }

    Alert.prompt(
      'Salvar Projeto',
      'Nome do projeto:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salvar',
          onPress: async (projectName) => {
            if (projectName && projectName.trim()) {
              setCurrentFileName(projectName.trim());
              await saveCurrentProject();
              Alert.alert('✅ Salvo', `Projeto "${projectName}" foi salvo com sucesso!`);
            }
          }
        }
      ],
      'plain-text',
      currentFileName
    );
  };

  const handleSelectExample = (exampleData, exampleName) => {
    handleGeometryChange(exampleData);
    setCurrentFileName(exampleName);
    setShowResults(false);
    setShowVisualization(true);
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === currentUnit) return;
    
    // Convert existing geometry to new unit system if there is any
    if (geometry.trim()) {
      try {
        const currentPoints = unitConverter.parseGeometry(geometry, currentUnit);
        if (currentPoints.length > 0) {
          const convertedGeometry = unitConverter.formatGeometryForDisplay(currentPoints, newUnit);
          setGeometry(convertedGeometry);
        }
      } catch (error) {
        console.warn('Error converting units:', error);
        // If conversion fails, clear geometry to avoid confusion
        setGeometry('');
      }
    }
    
    setCurrentUnit(newUnit);
    setValidationErrors([]);
    setGeometryStats(null);
  };

  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;
    
    try {
      const success = await localizationService.setLanguage(newLanguage);
      if (success) {
        setCurrentLanguage(newLanguage);
        // Force re-render of all translated components
        setIsI18nInitialized(false);
        setTimeout(() => setIsI18nInitialized(true), 100);
      }
    } catch (error) {
      console.warn('Error changing language:', error);
    }
  };

  const handleLoadFile = (fileContent, fileName) => {
    handleGeometryChange(fileContent);
    setCurrentFileName(fileName);
    setShowResults(false);
    setShowVisualization(true);
    
    // Validate loaded file using unit converter
    const validation = unitConverter.validateGeometry(fileContent, currentUnit);
    if (!validation.valid) {
      Alert.alert(
        '⚠️ Arquivo com Problemas',
        `"${fileName}" foi carregado, mas contém erros:\n${validation.errors[0]?.message || 'Erro desconhecido'}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('✅ Arquivo Carregado', `"${fileName}" foi carregado com sucesso!`);
    }
  };

  const handleLoadProject = async (project) => {
    Alert.alert(
      '📁 Carregar Projeto',
      `Carregar "${project.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Carregar', 
          onPress: async () => {
            handleGeometryChange(project.geometry);
            setCurrentFileName(project.name);
            setCurrentProject(project);
            setShowResults(false);
            setShowVisualization(true);
            
            // Load analysis results if available
            if (project.analysis && project.analysis.length > 0) {
              setAnalysisResults(project.analysis);
              setShowResults(true);
            }
            
            await ProjectStorage.setCurrentProject(project);
          }
        }
      ]
    );
  };

  // Don't render until i18n is initialized
  if (!isI18nInitialized) {
    return null;
  }

  return (
    <AppWrapper>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader />
        
        <QuickExamples 
          onSelectExample={handleSelectExample} 
          onLoadFile={handleLoadFile}
          currentUnit={currentUnit}
        />
        
        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          disabled={isAnalyzing}
        />

        <UnitSelector
          currentUnit={currentUnit}
          onUnitChange={handleUnitChange}
          disabled={isAnalyzing}
        />
        
        <GeometryInput
          geometry={geometry}
          onGeometryChange={handleGeometryChange}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          currentFileName={currentFileName}
          onToggleVisualization={() => setShowVisualization(!showVisualization)}
          showVisualization={showVisualization}
          validationErrors={validationErrors}
          geometryStats={geometryStats}
          currentUnit={currentUnit}
        />
        
        <GeometryVisualization 
          geometry={geometry}
          isVisible={showVisualization}
          currentUnit={currentUnit}
        />
        
        <AnalysisResults 
          results={analysisResults}
          isVisible={showResults}
          onPlaySound={handlePlaySound}
        />
        
        <RecentProjects 
          projects={recentProjects}
          onLoadProject={handleLoadProject}
          onSaveProject={handleSaveProject}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎵 Didgemap • Calculadora profissional de didgeridoo
          </Text>
        </View>
      </ScrollView>
    </AppWrapper>
  );
}

// Styles
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: deviceInfo.safeAreaTop,
    paddingHorizontal: dimensions.marginHorizontal,
    paddingBottom: deviceInfo.safeAreaBottom + spacing.xxl,
  },
  headerContainer: {
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: dimensions.borderRadius,
    borderBottomRightRadius: dimensions.borderRadius,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: typography.body,
    color: '#A5F3FC',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: spacing.md,
  },
  headerFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  featureBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureBadgeText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  examplesSection: {
    marginBottom: spacing.md,
    marginBottom: typography.body,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body,
    color: '#64748B',
    fontWeight: '600',
  },
  loadFileButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  loadFileText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#22D3EE',
  },
  exampleScrollContainer: {
    paddingRight: spacing.lg,
  },
  exampleCard: {
    width: SCREEN_WIDTH * 0.4,
    minWidth: scale(140),
    height: scale(100),
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    marginRight: spacing.md,
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addCustomCard: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F472B6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleName: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: spacing.xs,
  },
  exampleDesc: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    marginBottom: spacing.xs,
  },
  exampleLines: {
    fontSize: typography.caption,
    color: '#94A3B8',
  },
  addCustomText: {
    fontSize: typography.h5,
    color: '#F472B6',
    textAlign: 'center',
  },
  addCustomLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#F472B6',
    textAlign: 'center',
  },
  geometryContainer: {
    marginBottom: spacing.md,
    marginBottom: typography.body,
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.borderRadius,
    padding: dimensions.cardPadding,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inputTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: '#1E293B',
  },
  fileNameBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  fileNameText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#10B981',
  },
  inputSubtitle: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    marginBottom: spacing.md,
  },
  geometryInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: spacing.md,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontFamily: 'Courier',
    fontSize: typography.bodySmall,
    padding: spacing.md,
    minHeight: scale(180),
    textAlignVertical: 'top',
  },
  validationErrorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  validationErrorText: {
    fontSize: typography.caption,
    color: '#DC2626',
    fontWeight: '500',
  },
  geometryStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.caption,
    color: '#16A34A',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#15803D',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: typography.body,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  visualizeButton: {
    backgroundColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  visualizationContainer: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.borderRadius,
    padding: dimensions.cardPadding,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  visualizationTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: spacing.md,
  },
  svgContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  geometrySvg: {
    borderRadius: spacing.sm,
  },
  geometryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#1E293B',
  },
  visualizationHint: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  resultsContainer: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.borderRadius,
    padding: dimensions.cardPadding,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: typography.body,
  },
  droneResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 114, 182, 0.1)',
    padding: dimensions.cardPadding,
    borderRadius: spacing.md,
    borderLeftWidth: 5,
    borderLeftColor: '#F472B6',
    marginBottom: typography.body,
  },
  droneInfo: {
    flex: 1,
  },
  droneLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#F472B6',
    marginBottom: spacing.xs,
  },
  droneFrequency: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#F472B6',
    marginBottom: spacing.xs,
  },
  droneNote: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: '#1E293B',
  },
  droneAccuracy: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: spacing.md,
    borderRadius: spacing.sm,
    minWidth: scale(80),
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    marginBottom: spacing.xs,
  },
  accuracyValue: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  accuracyStatus: {
    fontSize: typography.bodySmall,
    color: '#64748B',
  },
  harmonicsTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: spacing.md,
  },
  harmonicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: typography.body,
  },
  harmonicItem: {
    width: '48%',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  harmonicOrder: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    marginBottom: spacing.xs,
  },
  harmonicFrequency: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: spacing.xs,
  },
  harmonicNote: {
    fontSize: typography.bodySmall,
    color: '#1E293B',
  },
  soundPreviewContainer: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  soundPreviewButton: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  droneButton: {
    backgroundColor: 'rgba(244, 114, 182, 0.1)',
    borderColor: '#F472B6',
  },
  harmonicsButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#10B981',
  },
  fullSpectrumButton: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: '#22D3EE',
  },
  soundPreviewText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#1E293B',
  },
  projectsContainer: {
    marginBottom: spacing.md,
    marginBottom: typography.body,
    backgroundColor: '#FFFFFF',
    borderRadius: dimensions.borderRadius,
    padding: dimensions.cardPadding,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  projectsTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveProjectButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  saveProjectText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#16A34A',
  },
  noProjectsText: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.lg,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  projectDetails: {
    fontSize: typography.bodySmall,
    color: '#64748B',
    marginBottom: 2,
  },
  projectStats: {
    fontSize: typography.caption,
    color: '#94A3B8',
  },
  projectArrow: {
    fontSize: typography.body,
    color: '#10B981',
  },
  footer: {
    paddingVertical: typography.body,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.bodySmall,
    color: '#94A3B8',
    textAlign: 'center',
  },
});