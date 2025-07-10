import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Svg, Line, Circle, Path, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// Responsive scaling
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}

// App Header Component
const AppHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.headerTitle}>🎵 Didgemap</Text>
      <Text style={styles.headerSubtitle}>Calculadora Avançada de Didgeridoo</Text>
      <View style={styles.headerFeatures}>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>🔍 Análise Acústica</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>📊 Visualização</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>🎵 Preview Sonoro</Text>
        </View>
      </View>
    </View>
  );
};

// Quick Examples Component
const QuickExamples = ({ onSelectExample, onLoadFile }) => {
  const examples = [
    { name: '🎺 Tradicional', data: `0 28\n50 26\n100 30\n150 38`, desc: 'Clássico australiano' },
    { name: '📏 Reto', data: `0 30\n50 30\n100 30\n150 30`, desc: 'Tubo uniforme' },
    { name: '🔔 Campana', data: `0 25\n80 28\n120 35\n150 50`, desc: 'Abertura em sino' },
    { name: '🌊 Ondulado', data: `0 28\n30 32\n60 28\n90 35\n120 30\n150 40`, desc: 'Variações suaves' },
    { name: '⚡ Agressivo', data: `0 25\n40 22\n80 35\n110 28\n150 45`, desc: 'Mudanças bruscas' },
    { name: '🎯 Precisão', data: `0 29.5\n25 28.2\n50 27.8\n75 29.1\n100 31.5\n125 34.2\n150 37.8`, desc: 'Medidas exatas' },
    { name: '🔥 BioDrone', data: `0 28\n40 26\n80 29\n120 33\n160 38`, desc: 'Design Renan' },
  ];

  const handleLoadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        onLoadFile(fileContent, result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o arquivo');
    }
  };

  return (
    <View style={styles.examplesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ Exemplos rápidos:</Text>
        <TouchableOpacity style={styles.loadFileButton} onPress={handleLoadFile}>
          <Text style={styles.loadFileText}>📁 Carregar (.txt)</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exampleScrollContainer}>
        {examples.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exampleCard}
            onPress={() => onSelectExample(example.data, example.name)}
          >
            <Text style={styles.exampleName}>{example.name}</Text>
            <Text style={styles.exampleDesc}>{example.desc}</Text>
            <Text style={styles.exampleLines}>{example.data.split('\n').length} pontos</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={[styles.exampleCard, styles.addCustomCard]}
          onPress={() => Alert.alert(
            'Compartilhar Design',
            'Envie suas medidas para adicionarmos aqui!'
          )}
        >
          <Text style={styles.addCustomText}>➕</Text>
          <Text style={styles.addCustomLabel}>Seu Design</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Geometry Input Component
const GeometryInput = ({ geometry, onGeometryChange, onAnalyze, isAnalyzing, currentFileName, onToggleVisualization, showVisualization }) => {
  return (
    <View style={styles.geometryContainer}>
      <View style={styles.inputHeader}>
        <Text style={styles.inputTitle}>📐 Geometria do Didgeridoo</Text>
        {currentFileName && (
          <View style={styles.fileNameBadge}>
            <Text style={styles.fileNameText}>📄 {currentFileName}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.inputSubtitle}>Formato: posição(cm) diâmetro(mm)</Text>
      
      <TextInput
        style={styles.geometryInput}
        value={geometry}
        onChangeText={onGeometryChange}
        placeholder="0 28    # início: 28mm\n50 26   # 50cm: 26mm\n100 30  # 100cm: 30mm\n150 38  # final: 38mm"
        multiline
        textAlignVertical="top"
        placeholderTextColor="#94A3B8"
      />
      
      <View style={styles.inputActions}>
        <TouchableOpacity
          style={[styles.button, styles.analyzeButton]}
          onPress={onAnalyze}
          disabled={isAnalyzing || !geometry.trim()}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? "🔄 Analisando..." : "🔬 Analisar"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.visualizeButton]}
          onPress={onToggleVisualization}
          disabled={!geometry.trim()}
        >
          <Text style={styles.buttonText}>
            {showVisualization ? '👁️ Ocultar' : '📊 Visualizar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Geometry Visualization Component
const GeometryVisualization = ({ geometry, isVisible }) => {
  if (!isVisible || !geometry.trim()) return null;

  const parseGeometry = (text) => {
    return text.split('\n')
      .map(line => line.trim().split(/\s+/))
      .filter(parts => parts.length >= 2)
      .map(parts => ({
        position: parseFloat(parts[0]),
        diameter: parseFloat(parts[1])
      }))
      .filter(p => !isNaN(p.position) && !isNaN(p.diameter))
      .sort((a, b) => a.position - b.position);
  };

  const points = parseGeometry(geometry);
  if (points.length < 2) return null;

  const maxPosition = Math.max(...points.map(p => p.position));
  const maxDiameter = Math.max(...points.map(p => p.diameter));
  const minDiameter = Math.min(...points.map(p => p.diameter));

  const svgHeight = normalize(180);
  const svgWidth = SCREEN_WIDTH - normalize(40);
  const margin = normalize(20);
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

  return (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>📐 Visualização da Geometria</Text>
      
      <Svg width={svgWidth} height={svgHeight} style={styles.geometrySvg}>
        {/* Grid lines */}
     // In your GeometryVisualization component, replace the grid lines section with:

{Array.from({ length: 5 }).map((_, i) => (
  <Line
    key={`grid-${i}`}
    x1={margin + (i * (svgWidth - margin * 2)) / 4}
    y1={margin}
    x2={margin + (i * (svgWidth - margin * 2)) / 4}
    y2={svgHeight - margin}
    stroke="#E2E8F0"
    strokeWidth="1"
    strokeDasharray="2,2"
  />
))}
        
        {/* Center line */}
        <Line
          x1={margin}
          y1={svgHeight / 2}
          x2={svgWidth - margin}
          y2={svgHeight / 2}
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        
        {/* Didgeridoo shape */}
        <Path
          d={pathData}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="#6366F1"
          strokeWidth="2"
        />
        
        {/* Control points */}
        {points.map((point, index) => {
          const x = margin + point.position * scaleX;
          const yTop = svgHeight / 2 - (point.diameter / 2) * scaleY;
          const yBottom = svgHeight / 2 + (point.diameter / 2) * scaleY;
          
          return (
            <G key={index}>
              <Circle cx={x} cy={yTop} r="3" fill="#EF4444" />
              <Circle cx={x} cy={yBottom} r="3" fill="#EF4444" />
              <Line 
                x1={x} y1={yTop} 
                x2={x} y2={yBottom} 
                stroke="#EF4444" 
                strokeWidth="1" 
                strokeDasharray="2,2" 
              />
            </G>
          );
        })}
      </Svg>
      
      <View style={styles.geometryInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>COMPRIMENTO</Text>
          <Text style={styles.infoValue}>{maxPosition.toFixed(1)} cm</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>DIÂMETRO</Text>
          <Text style={styles.infoValue}>{minDiameter.toFixed(1)}-{maxDiameter.toFixed(1)} mm</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>PONTOS</Text>
          <Text style={styles.infoValue}>{points.length}</Text>
        </View>
      </View>
      
      <Text style={styles.visualizationHint}>💡 Visualização do perfil interno do didgeridoo</Text>
    </View>
  );
};

// Analysis Results Component
const AnalysisResults = ({ results, isVisible }) => {
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
      
      <TouchableOpacity
        style={styles.soundPreviewButton}
        onPress={() => Alert.alert('Preview Sonoro', 'Esta funcionalidade será implementada em breve!')}
      >
        <Text style={styles.soundPreviewText}>🎵 Preview Sonoro</Text>
      </TouchableOpacity>
    </View>
  );
};

// Recent Projects Component
const RecentProjects = ({ projects, onLoadProject }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <View style={styles.projectsContainer}>
      <Text style={styles.projectsTitle}>📁 Projetos Recentes</Text>
      
      {projects.slice(0, 3).map((project, index) => (
        <TouchableOpacity
          key={index}
          style={styles.projectItem}
          onPress={() => onLoadProject(project)}
        >
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectDetails}>{project.note} • {project.date}</Text>
          </View>
          <Text style={styles.projectArrow}>→</Text>
        </TouchableOpacity>
      ))}
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
  
  const recentProjects = [
    {
      name: 'Didgeridoo D2',
      date: '2 dias atrás',
      note: 'D2 (73.4Hz)',
      geometry: `0 28\n50 26\n100 30\n150 38`
    },
    {
      name: 'Tubo Experimental',
      date: '1 semana atrás', 
      note: 'F2 (87Hz)',
      geometry: `0 25\n75 28\n150 45`
    }
  ];

  const handleAnalyze = async () => {
    if (!geometry.trim()) {
      Alert.alert('Erro', 'Por favor, insira a geometria do didgeridoo');
      return;
    }
    
    setIsAnalyzing(true);
    setShowResults(false);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock results based on geometry
    const mockResults = [
      { frequency: 73.4, note: 'D', octave: 2, centDiff: -5 },
      { frequency: 146.8, note: 'D', octave: 3, centDiff: -5 },
      { frequency: 220.2, note: 'A', octave: 3, centDiff: +12 },
      { frequency: 293.6, note: 'D', octave: 4, centDiff: -5 },
      { frequency: 367.0, note: 'F#', octave: 4, centDiff: +8 },
    ];
    
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const handleSelectExample = (exampleData, exampleName) => {
    setGeometry(exampleData);
    setCurrentFileName(exampleName);
    setShowResults(false);
    setShowVisualization(true);
  };

  const handleLoadFile = (fileContent, fileName) => {
    setGeometry(fileContent);
    setCurrentFileName(fileName);
    setShowResults(false);
    setShowVisualization(true);
    Alert.alert('✅ Arquivo Carregado', `"${fileName}" foi carregado com sucesso!`);
  };

  const handleLoadProject = (project) => {
    Alert.alert(
      '📁 Carregar Projeto',
      `Carregar "${project.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Carregar', 
          onPress: () => {
            setGeometry(project.geometry);
            setCurrentFileName(project.name);
            setShowResults(false);
            setShowVisualization(true);
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader />
      
      <QuickExamples 
        onSelectExample={handleSelectExample} 
        onLoadFile={handleLoadFile}
      />
      
      <GeometryInput
        geometry={geometry}
        onGeometryChange={setGeometry}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        currentFileName={currentFileName}
        onToggleVisualization={() => setShowVisualization(!showVisualization)}
        showVisualization={showVisualization}
      />
      
      <GeometryVisualization 
        geometry={geometry}
        isVisible={showVisualization}
      />
      
      <AnalysisResults 
        results={analysisResults}
        isVisible={showResults}
      />
      
      <RecentProjects 
        projects={recentProjects}
        onLoadProject={handleLoadProject}
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎵 Didgemap • Calculadora profissional de didgeridoo
        </Text>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: normalize(40),
  },
  headerContainer: {
    paddingVertical: normalize(24),
    marginBottom: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: normalize(24),
    borderBottomRightRadius: normalize(24),
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: normalize(32),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: normalize(4),
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: normalize(16),
    color: '#A5F3FC',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: normalize(12),
  },
  headerFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: normalize(8),
    gap: normalize(8),
  },
  featureBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureBadgeText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  examplesSection: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  sectionTitle: {
    fontSize: normalize(16),
    color: '#64748B',
    fontWeight: '600',
  },
  loadFileButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    borderWidth: 1.5,
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  loadFileText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#22D3EE',
  },
  exampleScrollContainer: {
    paddingRight: normalize(20),
  },
  exampleCard: {
    width: SCREEN_WIDTH * 0.4,
    minWidth: normalize(140),
    height: normalize(100),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: normalize(12),
    marginRight: normalize(12),
    justifyContent: 'space-between',
    shadowColor: '#6366F1',
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
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: normalize(4),
  },
  exampleDesc: {
    fontSize: normalize(12),
    color: '#64748B',
    marginBottom: normalize(4),
  },
  exampleLines: {
    fontSize: normalize(11),
    color: '#94A3B8',
  },
  addCustomText: {
    fontSize: normalize(20),
    color: '#F472B6',
    textAlign: 'center',
  },
  addCustomLabel: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#F472B6',
    textAlign: 'center',
  },
  geometryContainer: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(16),
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  inputTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#1E293B',
  },
  fileNameBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  fileNameText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#6366F1',
  },
  inputSubtitle: {
    fontSize: normalize(14),
    color: '#64748B',
    marginBottom: normalize(12),
  },
  geometryInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: normalize(12),
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontFamily: 'Courier',
    fontSize: normalize(14),
    padding: normalize(12),
    minHeight: normalize(180),
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(16),
    gap: normalize(12),
  },
  button: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButton: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
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
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  visualizationContainer: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(16),
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  visualizationTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: normalize(12),
  },
  geometrySvg: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: normalize(12),
  },
  geometryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(12),
    paddingTop: normalize(12),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: normalize(12),
    color: '#64748B',
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  infoValue: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#1E293B',
  },
  visualizationHint: {
    fontSize: normalize(12),
    color: '#64748B',
    textAlign: 'center',
    marginTop: normalize(12),
  },
  resultsContainer: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(16),
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: normalize(16),
  },
  droneResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 114, 182, 0.1)',
    padding: normalize(16),
    borderRadius: normalize(12),
    borderLeftWidth: 5,
    borderLeftColor: '#F472B6',
    marginBottom: normalize(16),
  },
  droneInfo: {
    flex: 1,
  },
  droneLabel: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#F472B6',
    marginBottom: normalize(4),
  },
  droneFrequency: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: '#F472B6',
    marginBottom: normalize(4),
  },
  droneNote: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#1E293B',
  },
  droneAccuracy: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: normalize(12),
    borderRadius: normalize(8),
    minWidth: normalize(80),
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: normalize(12),
    color: '#64748B',
    marginBottom: normalize(4),
  },
  accuracyValue: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  accuracyStatus: {
    fontSize: normalize(12),
    color: '#64748B',
  },
  harmonicsTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: normalize(12),
  },
  harmonicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(12),
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  harmonicItem: {
    width: '48%',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: normalize(12),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#6366F1',
    alignItems: 'center',
  },
  harmonicOrder: {
    fontSize: normalize(12),
    color: '#64748B',
    marginBottom: normalize(4),
  },
  harmonicFrequency: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: normalize(4),
  },
  harmonicNote: {
    fontSize: normalize(14),
    color: '#1E293B',
  },
  soundPreviewButton: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    padding: normalize(12),
    borderRadius: normalize(8),
    borderWidth: 1.5,
    borderColor: '#22D3EE',
    alignItems: 'center',
  },
  soundPreviewText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#22D3EE',
  },
  projectsContainer: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(16),
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  projectsTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: normalize(12),
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: normalize(2),
  },
  projectDetails: {
    fontSize: normalize(12),
    color: '#64748B',
  },
  projectArrow: {
    fontSize: normalize(16),
    color: '#6366F1',
  },
  footer: {
    paddingVertical: normalize(16),
    alignItems: 'center',
  },
  footerText: {
    fontSize: normalize(12),
    color: '#94A3B8',
    textAlign: 'center',
  },
});