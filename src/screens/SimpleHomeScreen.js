import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { AppHeader } from '../components/AppHeader';
import { UnitSelector } from '../components/UnitSelector';
import { GeometryInput } from '../components/GeometryInput';
import { QuickExamples } from '../components/QuickExamples';
import { ProjectManager } from '../components/ProjectManager';
import { AdvancedExport } from '../components/AdvancedExport';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { FirstRunTutorial } from '../components/FirstRunTutorial';
import { TipCard, FloatingTipManager, DailyTipCard } from '../components/TipCard';
import { TipsSettings } from '../components/TipsSettings';
import { PerformanceSettings } from '../components/PerformanceSettings';
import { OptimizedScrollView, OptimizedTouchableOpacity, OptimizedText } from '../components/OptimizedComponents';
import { AppIcon } from '../components/IconSystem';
import { Visualization3D } from '../components/Visualization3D';
import { AIRecommendations } from '../components/AIRecommendations';
import { useTutorial, useTips } from '../hooks/useTutorial';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceInfo, getTypography, getSpacing, scale } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { audioEngine } from '../services/audio/AudioEngine';
import { acousticEngine } from '../services/acoustic/AcousticEngine';
import { unitConverter } from '../services/units/UnitConverter';
import { ProjectStorage } from '../services/storage/ProjectStorage';
import userPreferences from '../services/settings/UserPreferences';
import { PerformanceManager } from '../services/performance/PerformanceManager';
import { OfflineManager } from '../services/offline/OfflineManager';
import { validateGeometryString, getGeometryStats } from '../utils/geometryValidator';
import { SCREEN_WIDTH } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

// Optimized GeometryVisualization Component with Performance Controls
const GeometryVisualization = React.memo(({ geometry, isVisible, currentUnit = 'metric' }) => {
  // Skip rendering if not visible
  if (!isVisible) {
    return null;
  }

  const points = useMemo(() => {
    if (!geometry || !geometry.trim()) return [];
    
    // Use performance-aware debouncing for parsing
    try {
      return unitConverter.parseGeometry(geometry, currentUnit);
    } catch (error) {
      console.warn('Error parsing geometry for visualization:', error);
      return [];
    }
  }, [geometry, currentUnit]);

  const { svgDimensions, pathData, outerWallPath, controlPoints } = useMemo(() => {
    if (!geometry || !geometry.trim() || points.length < 2) {
      return { svgDimensions: null, pathData: null, outerWallPath: null, controlPoints: [] };
    }

    // Validate points data to prevent NaN calculations
    const validPoints = points.filter(p => 
      p && typeof p.position === 'number' && typeof p.diameter === 'number' &&
      !isNaN(p.position) && !isNaN(p.diameter) && p.diameter > 0 && p.position >= 0
    );

    if (validPoints.length < 2) {
      return { svgDimensions: null, pathData: null, outerWallPath: null, controlPoints: [] };
    }

    const maxPosition = Math.max(...validPoints.map(p => p.position));
    const maxDiameter = Math.max(...validPoints.map(p => p.diameter));
    const minDiameter = Math.min(...validPoints.map(p => p.diameter));

    // Ensure all calculated values are valid numbers
    if (!isFinite(maxPosition) || !isFinite(maxDiameter) || !isFinite(minDiameter) || 
        maxPosition <= 0 || maxDiameter <= 0 || minDiameter <= 0) {
      console.warn('Invalid geometry calculations:', { maxPosition, maxDiameter, minDiameter });
      return { svgDimensions: null, pathData: null, outerWallPath: null, controlPoints: [] };
    }

    // Calculate safe SVG dimensions with fallback values
    const safeScreenWidth = isFinite(SCREEN_WIDTH) ? SCREEN_WIDTH : 400;
    const safeSpacingXL = isFinite(spacing.xl) ? spacing.xl : 24;
    const safeSpacingMD = isFinite(spacing.md) ? spacing.md : 12;
    
    const svgHeight = deviceInfo.isTablet ? scale(200) : scale(150);
    const svgWidth = Math.min(safeScreenWidth - safeSpacingXL, deviceInfo.isTablet ? 500 : 350);
    const margin = safeSpacingMD;
    
    // Ensure positive dimensions before calculating scales
    const availableWidth = Math.max(svgWidth - margin * 2, 100);
    const availableHeight = Math.max(svgHeight - margin * 2, 100);
    
    const scaleX = availableWidth / maxPosition;
    const scaleY = availableHeight / maxDiameter;

    // Final validation to ensure all SVG dimensions are valid
    if (!isFinite(svgHeight) || !isFinite(svgWidth) || !isFinite(scaleX) || !isFinite(scaleY) ||
        svgHeight <= 0 || svgWidth <= 0 || scaleX <= 0 || scaleY <= 0) {
      console.warn('Invalid SVG dimensions:', { svgHeight, svgWidth, scaleX, scaleY, SCREEN_WIDTH, spacing: spacing.xl });
      return { svgDimensions: null, pathData: null, outerWallPath: null, controlPoints: [] };
    }
    
    // Create smooth curves for more realistic didgeridoo shape
    const createSmoothPath = (points, isTop = true) => {
      if (points.length < 2) return '';
      
      const coords = points.map(p => ({
        x: margin + p.position * scaleX,
        y: svgHeight / 2 + (isTop ? -1 : 1) * (p.diameter / 2) * scaleY
      }));

      let path = `M ${coords[0].x},${coords[0].y}`;
      
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const next = coords[i + 1];
        
        if (i === coords.length - 1 || !next) {
          // Last point - straight line
          path += ` L ${curr.x},${curr.y}`;
        } else {
          // Create smooth curve using quadratic bezier
          const cp1x = prev.x + (curr.x - prev.x) * 0.5;
          const cp1y = prev.y + (curr.y - prev.y) * 0.5;
          path += ` Q ${cp1x},${cp1y} ${curr.x},${curr.y}`;
        }
      }
      
      return path;
    };

    const topPath = createSmoothPath(validPoints, true);
    const bottomPath = createSmoothPath([...validPoints].reverse(), false);
    
    // Create closed path for the didgeridoo bore
    const pathData = `${topPath} ${bottomPath.replace('M', 'L')} Z`;

    // Create wall thickness for more realistic appearance
    const wallThickness = Math.min(scale(3), maxDiameter * scaleY * 0.1);
    const outerTopPath = validPoints.map(p => ({
      x: margin + p.position * scaleX,
      y: svgHeight / 2 - (p.diameter / 2 + wallThickness / scaleY) * scaleY
    }));

    const outerBottomPath = validPoints.map(p => ({
      x: margin + p.position * scaleX,
      y: svgHeight / 2 + (p.diameter / 2 + wallThickness / scaleY) * scaleY
    })).reverse();

    const outerWallPath = `M ${[...outerTopPath, ...outerBottomPath].map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    
    const controlPoints = validPoints.map((point, index) => {
      const x = margin + point.position * scaleX;
      const yTop = svgHeight / 2 - (point.diameter / 2) * scaleY;
      const yBottom = svgHeight / 2 + (point.diameter / 2) * scaleY;
      return { x, yTop, yBottom, index };
    });

    return {
      svgDimensions: { svgWidth, svgHeight, margin, maxPosition, maxDiameter, minDiameter },
      pathData,
      outerWallPath,
      controlPoints
    };
  }, [points, geometry]);

  if (!isVisible || !geometry || !geometry.trim() || points.length < 2 || !svgDimensions) return null;

  return (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>
        {localizationService.t('geometryVisualization')}
      </Text>
      
      <View style={styles.svgContainer}>
        <Svg width={svgDimensions.svgWidth} height={svgDimensions.svgHeight} viewBox={`0 0 ${svgDimensions.svgWidth} ${svgDimensions.svgHeight}`}>
          {/* Background */}
          <Rect 
            x="0" 
            y="0" 
            width={svgDimensions.svgWidth} 
            height={svgDimensions.svgHeight} 
            fill="#F8FAFC" 
            stroke="#CBD5E1" 
            strokeWidth="1"
          />
          
          {/* Center reference line */}
          <Line
            x1={svgDimensions.margin}
            y1={svgDimensions.svgHeight / 2}
            x2={svgDimensions.svgWidth - svgDimensions.margin}
            y2={svgDimensions.svgHeight / 2}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          
          {/* Outer wall (wood) */}
          {outerWallPath && (
            <Path
              d={outerWallPath}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth="2"
              opacity="0.8"
            />
          )}
          
          {/* Inner bore (hollow space) */}
          <Path
            d={pathData}
            fill="rgba(240, 240, 240, 0.9)"
            stroke="#10B981"
            strokeWidth="2"
          />
          
          {/* Measurement points with dimensions */}
          {controlPoints.map((point, index) => {
            const pointData = points[index];
            const isKeyPoint = index === 0 || index === controlPoints.length - 1 || index % 2 === 0;
            
            return (
              <G key={point.index}>
                <Circle cx={point.x} cy={point.yTop} r="3" fill="#059669" opacity="0.7" />
                <Circle cx={point.x} cy={point.yBottom} r="3" fill="#059669" opacity="0.7" />
                <Line 
                  x1={point.x} 
                  y1={point.yTop} 
                  x2={point.x} 
                  y2={point.yBottom}
                  stroke="#059669"
                  strokeWidth="1"
                  opacity="0.5"
                />
                
                {/* Position labels for key points */}
                {isKeyPoint && (
                  <>
                    {/* Position measurement (bottom) */}
                    <SvgText
                      x={point.x}
                      y={svgDimensions.svgHeight - 8}
                      fontSize="10"
                      fill="#6B7280"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {currentUnit === 'metric' ? 
                        `${pointData.position}cm` : 
                        unitConverter.formatLength(pointData.position, 'imperial')
                      }
                    </SvgText>
                    
                    {/* Diameter measurement (side) */}
                    <SvgText
                      x={point.x + 15}
                      y={svgDimensions.svgHeight / 2}
                      fontSize="9"
                      fill="#374151"
                      textAnchor="start"
                      fontFamily="monospace"
                    >
                      {currentUnit === 'metric' ? 
                        `⌀${pointData.diameter}mm` : 
                        `⌀${unitConverter.formatDiameter(pointData.diameter, 'imperial')}`
                      }
                    </SvgText>
                  </>
                )}
              </G>
            );
          })}
          
          {/* Mouthpiece indicator */}
          <Circle 
            cx={svgDimensions.margin} 
            cy={svgDimensions.svgHeight / 2} 
            r="6" 
            fill="#DC2626" 
            stroke="#B91C1C" 
            strokeWidth="2"
          />
          
          {/* Bell end indicator */}
          <Circle 
            cx={svgDimensions.svgWidth - svgDimensions.margin} 
            cy={svgDimensions.svgHeight / 2} 
            r="4" 
            fill="#2563EB" 
            stroke="#1D4ED8" 
            strokeWidth="2"
          />
          
          {/* Total length measurement */}
          <Line
            x1={svgDimensions.margin}
            y1={15}
            x2={svgDimensions.svgWidth - svgDimensions.margin}
            y2={15}
            stroke="#374151"
            strokeWidth="1"
            markerEnd="url(#arrowhead)"
          />
          <SvgText
            x={svgDimensions.svgWidth / 2}
            y={12}
            fontSize="11"
            fill="#374151"
            textAnchor="middle"
            fontWeight="bold"
          >
            {currentUnit === 'metric' ? 
              `Comprimento total: ${svgDimensions.maxPosition}cm` :
              `Total length: ${unitConverter.formatLength(svgDimensions.maxPosition, 'imperial')}`
            }
          </SvgText>
          
          {/* Diameter range */}
          <SvgText
            x={svgDimensions.svgWidth - 10}
            y={svgDimensions.svgHeight - 25}
            fontSize="10"
            fill="#374151"
            textAnchor="end"
            fontStyle="italic"
          >
            {currentUnit === 'metric' ? 
              `⌀ ${svgDimensions.minDiameter}-${svgDimensions.maxDiameter}mm` :
              `⌀ ${unitConverter.formatDiameter(svgDimensions.minDiameter, 'imperial')}-${unitConverter.formatDiameter(svgDimensions.maxDiameter, 'imperial')}`
            }
          </SvgText>
        </Svg>
      </View>
      
      <View style={styles.geometryInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{localizationService.t('length')}</Text>
          <Text style={styles.infoValue}>
            {svgDimensions.maxPosition.toFixed(1)} {currentUnit === 'metric' ? 'cm' : 'in'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{localizationService.t('diameter')}</Text>
          <Text style={styles.infoValue}>
            {svgDimensions.minDiameter.toFixed(1)}-{svgDimensions.maxDiameter.toFixed(1)} {currentUnit === 'metric' ? 'mm' : 'in'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{localizationService.t('points')}</Text>
          <Text style={styles.infoValue}>{points.length}</Text>
        </View>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>Bocal</Text>
          <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
          <Text style={styles.legendText}>Saída</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#8B4513' }]} />
          <Text style={styles.legendText}>Parede (madeira)</Text>
          <View style={[styles.legendDot, { backgroundColor: '#F0F0F0' }]} />
          <Text style={styles.legendText}>Bore interno</Text>
        </View>
      </View>
      
      <Text style={styles.visualizationHint}>
        {localizationService.t('geometryVisualizationDesc')}
      </Text>
    </View>
  );
});

// AnalysisResults Component
const AnalysisResults = React.memo(({ results, isVisible, onPlaySound, metadata }) => {
  const handlePlaySound = useCallback((type, data) => {
    onPlaySound(type, data);
  }, [onPlaySound]);

  if (!isVisible || !results || results.length === 0) return null;
  
  // Safety check for first result
  const firstResult = results[0];
  if (!firstResult || typeof firstResult.frequency !== 'number') {
    console.warn('Invalid analysis results - missing frequency:', results);
    return null;
  }

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>{localizationService.t('analysisResults')}</Text>
      
      {/* Fundamental Frequency Section */}
      <View style={styles.droneResult}>
        <View style={styles.droneInfo}>
          <Text style={styles.droneLabel}>{localizationService.t('fundamental')}</Text>
          <Text style={styles.droneFrequency}>{firstResult.frequency.toFixed(2)} Hz</Text>
          <Text style={styles.droneNote}>{firstResult.note}{firstResult.octave}</Text>
        </View>
        <View style={styles.droneAccuracy}>
          <Text style={styles.accuracyLabel}>{localizationService.t('quality')}</Text>
          <Text style={[
            styles.accuracyValue,
            { color: Math.abs(firstResult.centDiff) < 10 ? '#10B981' : '#EF4444' }
          ]}>
            {firstResult.centDiff > 0 ? '+' : ''}{firstResult.centDiff}¢
          </Text>
          <Text style={styles.accuracyStatus}>
            {Math.abs(firstResult.centDiff) < 10 ? '✅' : '⚠️'}
          </Text>
        </View>
      </View>
      
      {/* Professional Analysis Table */}
      {results.length > 0 && (
        <>
          <Text style={styles.harmonicsTitle}>Análise Completa de Harmônicos</Text>
          
          {/* Table Header */}
          <View style={styles.analysisTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>H#</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Freq (Hz)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Nota</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Oct</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cents</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Ampl</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Impedância</Text>
            </View>
            
            {/* Table Rows */}
            {results.slice(0, 6).map((result, index) => {
              const impedance = metadata?.impedanceProfile?.[Math.floor((index / results.length) * metadata.impedanceProfile.length)]?.impedance || 0;
              const isPlayable = Math.abs(result.centDiff) < 50 && result.amplitude > 0.3;
              
              return (
                <View key={index} style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  !isPlayable && styles.tableRowWeak
                ]}>
                  <Text style={[styles.tableCellText, { flex: 0.8, fontWeight: 'bold' }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.5 }]}>
                    {result.frequency.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.2, fontWeight: '600' }]}>
                    {result.note}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 0.8 }]}>
                    {result.octave}
                  </Text>
                  <Text style={[
                    styles.tableCellText, 
                    { flex: 1, color: Math.abs(result.centDiff) < 10 ? '#10B981' : Math.abs(result.centDiff) < 30 ? '#F59E0B' : '#EF4444' }
                  ]}>
                    {result.centDiff > 0 ? '+' : ''}{result.centDiff}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.2 }]}>
                    {(result.amplitude * 100).toFixed(0)}%
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.5 }]}>
                    {impedance.toFixed(0)}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Analysis Metadata */}
          {metadata && (
            <View style={styles.metadataContainer}>
              <Text style={styles.metadataTitle}>Parâmetros Físicos</Text>
              <View style={styles.metadataGrid}>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Comprimento Efetivo</Text>
                  <Text style={styles.metadataValue}>{metadata.effectiveLength.toFixed(1)} cm</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Raio Médio</Text>
                  <Text style={styles.metadataValue}>{metadata.averageRadius.toFixed(1)} mm</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Volume Interno</Text>
                  <Text style={styles.metadataValue}>{(metadata.volume / 1000).toFixed(1)} L</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Pontos de Análise</Text>
                  <Text style={styles.metadataValue}>{metadata.impedanceProfile?.length || 0}</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
      
      <View style={styles.soundPreviewContainer}>
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.droneButton]}
          onPress={() => handlePlaySound('drone', {
            fundamental: firstResult.frequency,
            harmonics: results.slice(1, 4).map(r => ({
              frequency: r.frequency,
              amplitude: r.amplitude || (0.8 / (results.indexOf(r) + 1))
            }))
          })}
        >
          <Text style={styles.soundPreviewText}>
            {localizationService.t('playDrone')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.harmonicsButton]}
          onPress={() => handlePlaySound('harmonics', results.map(r => r.frequency))}
        >
          <Text style={styles.soundPreviewText}>
            {localizationService.t('playHarmonics')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.fullSpectrumButton]}
          onPress={() => handlePlaySound('full', results.map(r => r.frequency))}
        >
          <Text style={styles.soundPreviewText}>
            {localizationService.t('playFullSpectrum')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Main HomeScreen Component (renamed from SimpleHomeScreen)
export const SimpleHomeScreen = ({ currentUnit, onUnitChange, currentLanguage, onLanguageChange }) => {
  const [geometry, setGeometry] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [geometryStats, setGeometryStats] = useState(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [showFirstRunTutorial, setShowFirstRunTutorial] = useState(false); // DESABILITADO PARA TESTE
  const [firstRunStep, setFirstRunStep] = useState(0);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [userSettings, setUserSettings] = useState({});
  const [shouldShowTips, setShouldShowTips] = useState(false);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);
  const [showTipsSettings, setShowTipsSettings] = useState(false);
  const [show3DVisualization, setShow3DVisualization] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [performanceInitialized, setPerformanceInitialized] = useState(false);

  // Tutorial system
  const tutorial = useTutorial('basic_usage', {
    hasResults: analysisResults.length > 0,
    hasProject: !!currentProject,
    hasGeometry: !!geometry.trim()
  });
  
  const tips = useTips('analysis');

  // Refs for tutorial targets
  const appHeaderRef = useRef(null);
  const quickExamplesRef = useRef(null);
  const unitSelectorRef = useRef(null);
  const geometryInputRef = useRef(null);
  const analyzeButtonRef = useRef(null);
  const visualizationToggleRef = useRef(null);
  const manageProjectsRef = useRef(null);
  const exportButtonRef = useRef(null);

  // Initialize user preferences
  useEffect(() => {
    const initializePreferences = async () => {
      try {
        const preferences = await userPreferences.initialize();
        setUserSettings(preferences);
        setShouldShowTips(userPreferences.shouldShowDailyTips());
      } catch (error) {
        console.error('Failed to initialize user preferences:', error);
      }
    };
    
    initializePreferences();
  }, []);

  // Register refs with tutorial system
  useEffect(() => {
    tutorial.registerRef('app_header', appHeaderRef);
    tutorial.registerRef('quick_examples', quickExamplesRef);
    tutorial.registerRef('unit_selector', unitSelectorRef);
    tutorial.registerRef('geometry_input', geometryInputRef);
    tutorial.registerRef('analyze_button', analyzeButtonRef);
    tutorial.registerRef('visualization_toggle', visualizationToggleRef);
    tutorial.registerRef('manage_projects_button', manageProjectsRef);
    tutorial.registerRef('export_button', exportButtonRef);
  }, []);

  // Check for first run
  useEffect(() => {
    const checkFirstRun = async () => {
      try {
        // TUTORIAL TEMPORARIAMENTE DESABILITADO PARA TESTE
        return;
        
        // const firstRunKey = '@didgemap_first_run_completed';
        // const completed = await AsyncStorage.getItem(firstRunKey);
        
        // if (completed !== 'true') {
        //   setIsFirstRun(true);
        //   setShowFirstRunTutorial(true);
        // }
      } catch (error) {
        console.error('Error checking first run:', error);
        // TUTORIAL DESABILITADO - não mostrar em caso de erro
        return;
      }
    };

    // Add small delay to ensure UI is mounted
    const timer = setTimeout(checkFirstRun, 500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize audio engine on component mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize();
        setIsAudioInitialized(true);
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    };
    initAudio();
  }, []);

  // Initialize performance optimizations
  useEffect(() => {
    const initPerformance = async () => {
      try {
        const result = await PerformanceManager.initializePerformanceOptimization();
        setPerformanceInitialized(true);
        console.log('Performance optimizations initialized:', result);
      } catch (error) {
        console.warn('Performance initialization failed:', error);
      }
    };

    initPerformance();

    // Cleanup on unmount
    return () => {
      PerformanceManager.cleanup();
    };
  }, []);

  const handlePlaySound = async (type, data) => {
    if (!isAudioInitialized) {
      Alert.alert(
        localizationService.t('audioError'), 
        localizationService.t('audioNotReady')
      );
      return;
    }

    try {
      switch (type) {
        case 'drone':
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
      Alert.alert(
        localizationService.t('audioError'), 
        localizationService.t('audioPlaybackError')
      );
      console.error('Audio playback error:', error);
    }
  };

  // Optimized geometry change handler with debouncing
  const debouncedValidation = useMemo(
    () => PerformanceManager.createOptimizedDebounce((text) => {
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
    }, 300),
    [currentUnit]
  );

  const handleGeometryChange = useCallback((text) => {
    const safeText = text || '';
    setGeometry(safeText);
    debouncedValidation(safeText);
  }, [debouncedValidation]);

  const handleAnalyze = async () => {
    if (!geometry || !geometry.trim()) {
      Alert.alert(
        localizationService.t('validationError'),
        localizationService.t('pleaseEnterGeometry')
      );
      return;
    }

    const validation = unitConverter.validateGeometry(geometry, currentUnit);
    if (!validation.valid) {
      Alert.alert(
        localizationService.t('validationError'),
        validation.errors.join('\n')
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await acousticEngine.analyzeGeometry(validation.points, OfflineManager);
      
      // Extract the results array from the response object
      const resultsArray = analysisResult && analysisResult.results ? analysisResult.results : analysisResult;
      const metadata = analysisResult && analysisResult.metadata ? analysisResult.metadata : null;
      
      setAnalysisResults(resultsArray);
      setAnalysisMetadata(metadata);
      setShowResults(true);
      
      // Show contextual tip for first analysis
      if (resultsArray.length > 0 && !currentProject) {
        setTimeout(() => {
          tips.showTipForCategory('analysis');
        }, 2000);
      }
      
      // Auto-save analysis
      const projectName = currentFileName || `Analysis_${new Date().toISOString().slice(0,10)}`;
      await ProjectStorage.saveProject({
        name: projectName,
        geometry,
        results: resultsArray,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        unit: currentUnit
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        localizationService.t('analysisError'),
        localizationService.t('analysisCalculationFailed')
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectExample = (exampleData) => {
    if (!exampleData || !exampleData.geometry) {
      console.warn('Invalid example data:', exampleData);
      return;
    }
    
    setGeometry(exampleData.geometry);
    setCurrentFileName(exampleData.name || '');
    setShowVisualization(false);
    setShowResults(false);
    
    // Validate new geometry
    try {
      const validation = unitConverter.validateGeometry(exampleData.geometry, currentUnit);
      if (validation.valid) {
        setGeometryStats(getGeometryStats(validation.points));
        setValidationErrors([]);
      } else {
        setValidationErrors(validation.errors);
      }
    } catch (error) {
      console.error('Error validating example geometry:', error);
      setValidationErrors(['Error validating geometry']);
    }
  };

  const handleLoadFile = async () => {
    setShowProjectManager(true);
  };

  const handleProjectSelect = (project) => {
    setCurrentProject(project);
    setGeometry(project.geometry || '');
    setCurrentFileName(project.name || '');
    
    // Load analysis results if available
    if (project.results) {
      setAnalysisResults(project.results);
      setAnalysisMetadata(project.metadata);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
    
    // Validate geometry
    if (project.geometry) {
      const validation = unitConverter.validateGeometry(project.geometry, currentUnit);
      if (validation.valid) {
        setGeometryStats(getGeometryStats(validation.points));
        setValidationErrors([]);
      } else {
        setValidationErrors(validation.errors);
      }
    }
    
    setShowVisualization(false);
  };

  const handleSaveCurrentProject = async () => {
    if (!geometry.trim()) {
      Alert.alert('Erro', 'Adicione geometria antes de salvar');
      return;
    }

    try {
      const projectData = {
        ...currentProject,
        name: currentFileName || `Projeto ${new Date().toLocaleDateString()}`,
        geometry,
        results: analysisResults,
        metadata: analysisMetadata,
        unit: currentUnit
      };

      const savedProject = await ProjectStorage.saveProject(projectData);
      setCurrentProject(savedProject);
      Alert.alert('Sucesso', 'Projeto salvo com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar projeto');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <FloatingTipManager category="general">
        <OptimizedScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
        <View ref={appHeaderRef}>
          <AppHeader />
        </View>
        
        <View ref={quickExamplesRef}>
          <QuickExamples 
            onSelectExample={handleSelectExample} 
            onLoadFile={handleLoadFile}
            currentUnit={currentUnit}
          />
        </View>

        <View ref={unitSelectorRef}>
          <UnitSelector
            currentUnit={currentUnit}
            onUnitChange={onUnitChange}
            disabled={isAnalyzing}
          />
        </View>
        
        <View ref={geometryInputRef}>
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
            tutorialRefs={{
              analyzeButton: analyzeButtonRef,
              visualizationToggle: visualizationToggleRef
            }}
          />
        </View>
      
      <GeometryVisualization 
        geometry={geometry}
        isVisible={showVisualization}
        currentUnit={currentUnit}
      />
      
      <AnalysisResults 
        results={analysisResults}
        isVisible={showResults}
        onPlaySound={handlePlaySound}
        metadata={analysisMetadata}
      />

      {/* Project Save Button */}
      {(geometry.trim() || currentProject) && (
        <View style={styles.saveProjectContainer}>
          <TouchableOpacity
            style={styles.saveProjectButton}
            onPress={handleSaveCurrentProject}
          >
            <Text style={styles.saveProjectText}>
              💾 {currentProject ? 'Atualizar Projeto' : 'Salvar Projeto'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            ref={manageProjectsRef}
            style={styles.manageProjectsButton}
            onPress={() => setShowProjectManager(true)}
          >
            <Text style={styles.manageProjectsText}>📁 Gerenciar</Text>
          </TouchableOpacity>
          
          {currentProject && analysisResults.length > 0 && (
            <TouchableOpacity
              ref={exportButtonRef}
              style={styles.exportButton}
              onPress={() => setShowAdvancedExport(true)}
            >
              <Text style={styles.exportButtonText}>📤 Exportar</Text>
            </TouchableOpacity>
          )}

          {/* Novos Botões de Recursos */}
          <View style={styles.newFeaturesContainer}>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => setShow3DVisualization(true)}
            >
              <Text style={styles.featureButtonText}>🎨 Visualização 3D</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => setShowAIRecommendations(true)}
            >
              <Text style={styles.featureButtonText}>🤖 Recomendações IA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => setShowTipsSettings(true)}
            >
              <Text style={styles.featureButtonText}>⚙️ Config. Dicas</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Teste para Dica - Apenas se habilitado */}
          {shouldShowTips && (
            <TouchableOpacity
              style={styles.testTipButton}
              onPress={() => {
                if (tips.currentTip) {
                  tips.clearTip();
                } else {
                  tips.getTip();
                }
              }}
            >
              <Text style={styles.testTipButtonText}>
                {tips.currentTip ? '❌ Fechar Dica' : '💡 Dica do Dia'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Project Manager Modal */}
      <ProjectManager
        visible={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        onProjectSelect={handleProjectSelect}
        currentProject={currentProject}
      />

      {/* Advanced Export Modal */}
      <AdvancedExport
        visible={showAdvancedExport}
        onClose={() => setShowAdvancedExport(false)}
        project={currentProject}
      />

      {/* Tutorial System */}
      <TutorialOverlay
        visible={tutorial.isVisible}
        step={tutorial.currentStep}
        elementBounds={tutorial.elementBounds}
        onNext={tutorial.nextStep}
        onPrevious={tutorial.previousStep}
        onSkip={tutorial.skipTutorial}
        onClose={tutorial.endTutorial}
      />

      {/* Dica do Dia - Apenas se usuário habilitou */}
      {shouldShowTips && (
        <DailyTipCard
          visible={!!tips.currentTip}
          tip={tips.currentTip}
          onClose={tips.clearTip}
        />
      )}

      {/* First Run Tutorial */}
      <FirstRunTutorial
        visible={showFirstRunTutorial}
        currentStep={firstRunStep}
        onStepChange={setFirstRunStep}
        registeredRefs={tutorial.registeredRefs}
        onComplete={async () => {
          try {
            const firstRunKey = '@didgemap_first_run_completed';
            await AsyncStorage.setItem(firstRunKey, 'true');
            setShowFirstRunTutorial(false);
            setIsFirstRun(false);
          } catch (error) {
            console.error('Error marking first run completed:', error);
            // Still close tutorial even on error
            setShowFirstRunTutorial(false);
            setIsFirstRun(false);
          }
        }}
      />
      {/* Tips Settings */}
      <TipsSettings
        visible={showTipsSettings}
        onClose={() => {
          setShowTipsSettings(false);
          // Atualizar configurações de dicas
          const checkTipsSettings = async () => {
            const newSetting = userPreferences.shouldShowDailyTips();
            setShouldShowTips(newSetting);
          };
          checkTipsSettings();
        }}
      />

      {/* 3D Visualization */}
      <Visualization3D
        visible={show3DVisualization}
        onClose={() => setShow3DVisualization(false)}
        analysisData={{
          frequencies: analysisResults.length > 0 ? {
            fundamental: analysisResults[0]?.frequency || 146.83,
            harmonics: analysisResults.slice(1, 6).map(r => r.frequency).filter(f => f)
          } : null,
          resonanceModes: analysisResults.length > 0 ? analysisResults.map(r => ({
            frequency: r.frequency,
            amplitude: r.amplitude || 1
          })) : null
        }}
        geometry={geometry ? (() => {
          try {
            const parts = geometry.split(':')[1]?.split(',');
            if (parts && parts.length > 1) {
              return {
                length: parseInt(parts[0]),
                diameters: parts.slice(1).map(d => parseInt(d))
              };
            }
          } catch (error) {
            console.warn('Error parsing geometry for 3D:', error);
          }
          return null;
        })() : null}
      />

      {/* AI Recommendations */}
      <AIRecommendations
        visible={showAIRecommendations}
        onClose={() => setShowAIRecommendations(false)}
        onSelectRecommendation={(recommendation) => {
          // Aplicar recomendação da IA
          if (recommendation.geometry) {
            setGeometry(recommendation.geometry);
            setCurrentProject({
              id: `ai_${Date.now()}`,
              name: recommendation.name,
              geometry: recommendation.geometry,
              source: 'ai_recommendation',
              createdAt: new Date().toISOString()
            });
            
            // Analisar automaticamente a nova geometria
            if (recommendation.geometry.trim()) {
              setTimeout(() => {
                handleAnalyze(recommendation.geometry);
              }, 500);
            }
          }
        }}
        initialPreferences={{
          targetNote: 'D',
          targetOctave: 2,
          experience: 'beginner'
        }}
      />
      </OptimizedScrollView>
      </FloatingTipManager>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  
  // Visualization styles
  visualizationContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  visualizationTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  svgContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  geometryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  visualizationHint: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  legendContainer: {
    marginVertical: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: typography.caption,
    color: '#6B7280',
    flex: 1,
  },
  
  // Analysis results styles
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  droneResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  droneInfo: {
    flex: 1,
  },
  droneLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#065F46',
  },
  droneFrequency: {
    fontSize: typography.h2,
    fontWeight: '900',
    color: '#10B981',
  },
  droneNote: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#059669',
  },
  droneAccuracy: {
    alignItems: 'flex-end',
  },
  accuracyLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#065F46',
  },
  accuracyValue: {
    fontSize: typography.h3,
    fontWeight: '700',
  },
  accuracyStatus: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#065F46',
  },
  harmonicsTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },
  harmonicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  harmonicItem: {
    width: '23%',
    backgroundColor: '#F3F4F6',
    padding: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  harmonicOrder: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#6B7280',
  },
  harmonicFrequency: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#1F2937',
  },
  harmonicNote: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#059669',
  },
  soundPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  soundPreviewButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  droneButton: {
    backgroundColor: '#10B981',
  },
  harmonicsButton: {
    backgroundColor: '#3B82F6',
  },
  fullSpectrumButton: {
    backgroundColor: '#8B5CF6',
  },
  soundPreviewText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Professional analysis table styles
  analysisTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableRowOdd: {
    backgroundColor: '#FFFFFF',
  },
  tableRowWeak: {
    opacity: 0.6,
  },
  tableCellText: {
    fontSize: typography.caption,
    color: '#374151',
    textAlign: 'center',
  },
  
  // Metadata styles
  metadataContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metadataTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metadataItem: {
    width: '48%',
    marginBottom: spacing.xs,
  },
  metadataLabel: {
    fontSize: typography.caption,
    color: '#6B7280',
    fontWeight: '600',
  },
  metadataValue: {
    fontSize: typography.small,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },

  // Project management styles
  saveProjectContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  saveProjectButton: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveProjectText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
  manageProjectsButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageProjectsText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
  testTipButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testTipButtonText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
  },
  newFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  featureButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureButtonText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});