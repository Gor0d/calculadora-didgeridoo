import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  BackHandler,
  Platform,
  PanResponder
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { AppIcon } from '../components/IconSystem';
import { getDeviceInfo, getTypography, getSpacing, scale } from '../utils/responsive';
import { localizationService } from '../services/i18n/LocalizationService';
import { unitConverter } from '../services/units/UnitConverter';
import { acousticEngine } from '../services/acoustic/AcousticEngine';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GeometryEditorScreen = ({ route, navigation }) => {
  const { initialGeometry = '', currentUnit = 'metric' } = route.params || {};
  
  // Editor state
  const [editablePoints, setEditablePoints] = useState([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editorZoom, setEditorZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(null);
  
  // Animation references
  const animatedZoom = useRef(new Animated.Value(1.0)).current;
  const animatedPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastPinchDistance = useRef(null);
  
  // Editor dimensions - full screen for better editing
  const editorDimensions = useMemo(() => {
    const margin = spacing.lg;
    const headerHeight = 120;
    const controlsHeight = 140;
    const availableHeight = SCREEN_HEIGHT - headerHeight - controlsHeight;
    
    return {
      width: SCREEN_WIDTH - (margin * 2),
      height: Math.max(availableHeight, 400),
      margin: margin
    };
  }, []);

  // Parse initial geometry into editable points
  useEffect(() => {
    if (initialGeometry && initialGeometry.trim()) {
      try {
        // Parse geometry string (format: "position diameter" per line)
        const lines = initialGeometry.trim().split('\n');
        const points = lines.map((line, index) => {
          const parts = line.trim().split(/[,\s]+/);
          if (parts.length >= 2) {
            return {
              id: index,
              position: parseFloat(parts[0]) || 0,
              diameter: parseFloat(parts[1]) || 30,
              x: 0, // Will be calculated
              y: 0  // Will be calculated
            };
          }
          return null;
        }).filter(Boolean);
        
        if (points.length > 0) {
          setEditablePoints(points);
        } else {
          createDefaultGeometry();
        }
      } catch (error) {
        console.warn('Error parsing geometry:', error);
        createDefaultGeometry();
      }
    } else {
      createDefaultGeometry();
    }
  }, [initialGeometry, currentUnit]);

  // Create default didgeridoo geometry
  const createDefaultGeometry = () => {
    const defaultPoints = [
      { id: 0, position: 0, diameter: 30, x: 0, y: 0 },      // Bocal
      { id: 1, position: 30, diameter: 32, x: 0, y: 0 },     // Transição
      { id: 2, position: 80, diameter: 35, x: 0, y: 0 },     // Meio
      { id: 3, position: 120, diameter: 40, x: 0, y: 0 },    // Expansão
      { id: 4, position: 150, diameter: 120, x: 0, y: 0 },   // Bell
    ];
    setEditablePoints(defaultPoints);
  };

  // Calculate screen positions for points
  const pointsWithScreenCoords = useMemo(() => {
    if (!editablePoints.length) return [];
    
    const maxPosition = Math.max(...editablePoints.map(p => p.position));
    const maxDiameter = Math.max(...editablePoints.map(p => p.diameter));
    
    // Scale for realistic proportions in editor
    const lengthScale = (editorDimensions.width - 40) / maxPosition;
    const diameterScale = Math.min((editorDimensions.height - 60) / (maxDiameter * 2), lengthScale * 2);
    
    return editablePoints.map(point => ({
      ...point,
      x: 20 + (point.position * lengthScale),
      y: editorDimensions.height / 2 - (point.diameter * diameterScale / 2)
    }));
  }, [editablePoints, editorDimensions]);

  // Generate SVG path for the didgeridoo
  const didgeridooPath = useMemo(() => {
    if (!pointsWithScreenCoords.length) return '';
    
    const points = pointsWithScreenCoords;
    const centerY = editorDimensions.height / 2;
    
    // Create smooth curve through points
    let pathData = `M ${points[0].x} ${centerY - points[0].diameter/4}`;
    
    // Top curve
    for (let i = 1; i < points.length; i++) {
      const prev = points[i-1];
      const curr = points[i];
      const controlX = prev.x + (curr.x - prev.x) * 0.5;
      pathData += ` Q ${controlX} ${centerY - prev.diameter/4} ${curr.x} ${centerY - curr.diameter/4}`;
    }
    
    // Bell opening
    const lastPoint = points[points.length - 1];
    pathData += ` L ${lastPoint.x} ${centerY - lastPoint.diameter/2}`;
    pathData += ` L ${lastPoint.x} ${centerY + lastPoint.diameter/2}`;
    
    // Bottom curve (reverse)
    for (let i = points.length - 1; i > 0; i--) {
      const curr = points[i];
      const prev = points[i-1];
      const controlX = curr.x - (curr.x - prev.x) * 0.5;
      pathData += ` Q ${controlX} ${centerY + curr.diameter/4} ${prev.x} ${centerY + prev.diameter/4}`;
    }
    
    pathData += ' Z';
    return pathData;
  }, [pointsWithScreenCoords, editorDimensions]);

  // Enhanced point selection and editing
  const handlePointPress = (pointIndex) => {
    if (selectedPointIndex === pointIndex) {
      setSelectedPointIndex(null); // Deselect if already selected
    } else {
      setSelectedPointIndex(pointIndex);
      performRealtimeAnalysis();
    }
  };

  // Mouse/Touch drag functionality for diameter adjustment
  const [dragStartY, setDragStartY] = useState(null);
  const [initialDiameter, setInitialDiameter] = useState(null);

  const handlePointDragStart = (pointIndex, event) => {
    setSelectedPointIndex(pointIndex);
    setIsDragging(true);
    
    // Get Y coordinate for both mouse and touch
    const clientY = event.nativeEvent.clientY || event.nativeEvent.pageY || 
                   (event.nativeEvent.touches && event.nativeEvent.touches[0].pageY);
    
    setDragStartY(clientY);
    setInitialDiameter(editablePoints[pointIndex]?.diameter || 30);
  };

  const handlePointDragMove = (event) => {
    if (!isDragging || selectedPointIndex === null || dragStartY === null) return;
    
    // Get Y coordinate for both mouse and touch
    const clientY = event.nativeEvent.clientY || event.nativeEvent.pageY || 
                   (event.nativeEvent.touches && event.nativeEvent.touches[0].pageY);
    
    const deltaY = dragStartY - clientY; // Inverted for intuitive up/down
    const newDiameter = Math.max(5, Math.min(300, initialDiameter + deltaY * 0.5));
    
    setEditablePoints(prev => prev.map((p, i) => 
      i === selectedPointIndex ? { ...p, diameter: newDiameter } : p
    ));
  };

  const handlePointDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartY(null);
      setInitialDiameter(null);
      performRealtimeAnalysis();
    }
  };

  // Add new point functionality
  const addNewPoint = () => {
    if (editablePoints.length >= 10) {
      Alert.alert('Limite Atingido', 'Máximo de 10 pontos permitidos.');
      return;
    }
    
    const maxPosition = Math.max(...editablePoints.map(p => p.position));
    const newPoint = {
      id: editablePoints.length,
      position: maxPosition + 20,
      diameter: 30,
      x: 0,
      y: 0
    };
    
    setEditablePoints(prev => [...prev, newPoint]);
    setSelectedPointIndex(editablePoints.length);
    performRealtimeAnalysis();
  };

  // Remove selected point
  const removeSelectedPoint = () => {
    if (selectedPointIndex === null) return;
    if (editablePoints.length <= 2) {
      Alert.alert('Erro', 'Mínimo de 2 pontos necessários.');
      return;
    }
    
    Alert.alert(
      'Remover Ponto',
      `Remover ponto ${selectedPointIndex + 1}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            setEditablePoints(prev => prev.filter((_, i) => i !== selectedPointIndex));
            setSelectedPointIndex(null);
            performRealtimeAnalysis();
          }
        }
      ]
    );
  };

  // Simplified zoom handlers
  const handleZoomIn = () => {
    setEditorZoom(Math.min(3.0, editorZoom + 0.25));
  };

  const handleZoomOut = () => {
    setEditorZoom(Math.max(0.5, editorZoom - 0.25));
  };

  // Simplified approach - remove complex pan/drag for web compatibility

  // Real-time acoustic analysis
  const performRealtimeAnalysis = async () => {
    try {
      if (editablePoints.length === 0) return;
      
      // Convert points back to geometry string (format: "position diameter")
      const sortedPoints = [...editablePoints].sort((a, b) => a.position - b.position);
      const geometryString = sortedPoints
        .map(p => `${p.position.toFixed(1)} ${p.diameter.toFixed(1)}`)
        .join('\n');
      
      // Perform acoustic analysis
      const analysis = await acousticEngine.calculateFundamental(geometryString, currentUnit);
      setRealtimeAnalysis(analysis);
    } catch (error) {
      console.warn('Real-time analysis failed:', error);
      setRealtimeAnalysis(null);
    }
  };

  // Convert geometry to template-compatible format
  const convertToTemplateFormat = (points, unit) => {
    const sortedPoints = [...points].sort((a, b) => a.position - b.position);
    
    if (unit === 'metric') {
      // For metric: position in cm, diameter in mm (template format)
      return sortedPoints.map(p => `${p.position.toFixed(0)} ${p.diameter.toFixed(0)}`).join('\n');
    } else {
      // For imperial: position in inches, diameter in inches
      const convertedPoints = sortedPoints.map(p => ({
        position: (p.position / 2.54).toFixed(1), // cm to inches
        diameter: (p.diameter / 25.4).toFixed(2)  // mm to inches
      }));
      return convertedPoints.map(p => `${p.position} ${p.diameter}`).join('\n');
    }
  };

  // Save and return to previous screen
  const saveGeometry = () => {
    if (editablePoints.length === 0) {
      Alert.alert('Erro', 'Nenhum ponto para salvar.');
      return;
    }
    
    // Convert to template-compatible format
    const geometryString = convertToTemplateFormat(editablePoints, currentUnit);
    
    // Calculate total length for display
    const sortedPoints = [...editablePoints].sort((a, b) => a.position - b.position);
    const totalLength = sortedPoints[sortedPoints.length - 1].position;
    const lengthUnit = currentUnit === 'metric' ? 'cm' : 'in';
    
    Alert.alert(
      'Geometria Salva!',
      `${sortedPoints.length} pontos salvos\nComprimento: ${totalLength.toFixed(1)}${lengthUnit}`,
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('SimpleHome', { 
              editedGeometry: geometryString,
              shouldAnalyze: true
            });
          }
        }
      ]
    );
  };

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Sair do Editor?',
        'Deseja salvar as alterações antes de sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair sem Salvar', 
            onPress: () => navigation.navigate('SimpleHome'),
            style: 'destructive'
          },
          { text: 'Salvar e Sair', onPress: saveGeometry }
        ]
      );
      return true;
    });

    return () => backHandler.remove();
  }, [editablePoints]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            Alert.alert(
              'Sair do Editor?',
              'Deseja salvar as alterações antes de sair?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Sair sem Salvar', 
                  onPress: () => navigation.navigate('SimpleHome'),
                  style: 'destructive' 
                },
                { text: 'Salvar e Sair', onPress: saveGeometry }
              ]
            );
          }}
        >
          <AppIcon name="back" size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Editor Visual</Text>
        
        <TouchableOpacity 
          style={styles.saveHeaderButton} 
          onPress={saveGeometry}
        >
          <AppIcon name="save" size={20} color="#FFFFFF" />
          <Text style={styles.saveHeaderButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {isDragging 
            ? '↕️ Arraste para cima/baixo para ajustar o diâmetro'
            : 'Toque para selecionar • Arraste para ajustar • Controles para precisão'
          }
        </Text>
        {realtimeAnalysis && (
          <Text style={styles.analysisText}>
            🎵 {realtimeAnalysis.fundamental?.toFixed(1) || '---'} Hz
          </Text>
        )}
      </View>

      {/* Main editor area */}
      <View 
        style={styles.editorContainer}
        onMoveShouldSetResponder={() => isDragging}
        onResponderMove={handlePointDragMove}
        onResponderRelease={handlePointDragEnd}
        onResponderTerminate={handlePointDragEnd}
      >
        <Animated.View
          style={[
            styles.svgContainer,
            {
              transform: [
                { scale: editorZoom },
                { translateX: panOffset.x },
                { translateY: panOffset.y }
              ]
            }
          ]}
        >
          <Svg
            width={editorDimensions.width}
            height={editorDimensions.height}
            viewBox={`0 0 ${editorDimensions.width} ${editorDimensions.height}`}
          >
            {/* Grid background */}
            <G>
              {Array.from({ length: 10 }, (_, i) => {
                const y = (i + 1) * editorDimensions.height / 11;
                return (
                  <Line
                    key={`grid-h-${i}`}
                    x1={0}
                    y1={y}
                    x2={editorDimensions.width}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="0.5"
                    strokeDasharray="3,3"
                  />
                );
              })}
              {Array.from({ length: 8 }, (_, i) => {
                const x = (i + 1) * editorDimensions.width / 9;
                return (
                  <Line
                    key={`grid-v-${i}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={editorDimensions.height}
                    stroke="#E2E8F0"
                    strokeWidth="0.5"
                    strokeDasharray="3,3"
                  />
                );
              })}
            </G>

            {/* Centerline */}
            <Line
              x1={0}
              y1={editorDimensions.height / 2}
              x2={editorDimensions.width}
              y2={editorDimensions.height / 2}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Didgeridoo shape */}
            <Path
              d={didgeridooPath}
              fill="rgba(16, 185, 129, 0.3)"
              stroke="#10B981"
              strokeWidth="2"
            />

            {/* Editable points */}
            {pointsWithScreenCoords.map((point, index) => (
              <G key={point.id}>
                {/* Larger touch area for selection and drag */}
                <Circle
                  cx={point.x}
                  cy={editorDimensions.height / 2}
                  r={20}
                  fill="transparent"
                  onPress={() => handlePointPress(index)}
                  onPressIn={(event) => handlePointDragStart(index, event)}
                  onPressOut={handlePointDragEnd}
                />
                
                {/* Visual point circle */}
                <Circle
                  cx={point.x}
                  cy={editorDimensions.height / 2}
                  r={selectedPointIndex === index ? (isDragging ? 16 : 14) : 10}
                  fill={selectedPointIndex === index ? (isDragging ? "#F59E0B" : "#EF4444") : "#10B981"}
                  stroke="#FFFFFF"
                  strokeWidth={isDragging && selectedPointIndex === index ? "4" : "3"}
                />
                
                {/* Selection ring */}
                {selectedPointIndex === index && (
                  <Circle
                    cx={point.x}
                    cy={editorDimensions.height / 2}
                    r={isDragging ? 26 : 22}
                    fill="none"
                    stroke={isDragging ? "#F59E0B" : "#EF4444"}
                    strokeWidth={isDragging ? "3" : "2"}
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Drag indicator */}
                {isDragging && selectedPointIndex === index && (
                  <>
                    <SvgText
                      x={point.x}
                      y={editorDimensions.height / 2 - 40}
                      fontSize="10"
                      fill="#F59E0B"
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      ↕️ DRAG
                    </SvgText>
                  </>
                )}
                
                {/* Position label */}
                <SvgText
                  x={point.x}
                  y={editorDimensions.height / 2 + 35}
                  fontSize="12"
                  fill="#374151"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {point.position.toFixed(0)}cm
                </SvgText>
                
                {/* Diameter label */}
                <SvgText
                  x={point.x}
                  y={editorDimensions.height / 2 - 25}
                  fontSize="12"
                  fill="#374151"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  ⌀{point.diameter.toFixed(0)}mm
                </SvgText>
              </G>
            ))}
          </Svg>
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Point Management */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.addButton]}
            onPress={addNewPoint}
          >
            <AppIcon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Adicionar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.removeButton, selectedPointIndex === null && styles.disabledButton]}
            onPress={removeSelectedPoint}
            disabled={selectedPointIndex === null}
          >
            <AppIcon name="close" size={16} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>

        {/* Zoom Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.zoomButton]}
            onPress={handleZoomOut}
          >
            <AppIcon name="down" size={16} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Zoom -</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={() => setEditorZoom(1.0)}
          >
            <Text style={styles.controlButtonText}>{(editorZoom * 100).toFixed(0)}%</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.zoomButton]}
            onPress={handleZoomIn}
          >
            <AppIcon name="up" size={16} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Zoom +</Text>
          </TouchableOpacity>
        </View>

        {/* Diameter adjustment for selected point */}
        {selectedPointIndex !== null && (
          <>
            <View style={styles.selectedPointInfo}>
              <Text style={styles.selectedPointLabel}>
                Ponto {selectedPointIndex + 1} selecionado
              </Text>
              <Text style={styles.selectedPointValue}>
                Diâmetro: {editablePoints[selectedPointIndex]?.diameter?.toFixed(1)}mm
              </Text>
            </View>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlButton, styles.adjustButton]}
                onPress={() => {
                  setEditablePoints(prev => prev.map((p, i) => 
                    i === selectedPointIndex ? { ...p, diameter: Math.max(5, p.diameter - 10) } : p
                  ));
                  performRealtimeAnalysis();
                }}
              >
                <AppIcon name="down" size={16} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>-10</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.adjustButton]}
                onPress={() => {
                  setEditablePoints(prev => prev.map((p, i) => 
                    i === selectedPointIndex ? { ...p, diameter: Math.max(5, p.diameter - 1) } : p
                  ));
                  performRealtimeAnalysis();
                }}
              >
                <Text style={styles.controlButtonText}>-1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.adjustButton]}
                onPress={() => {
                  setEditablePoints(prev => prev.map((p, i) => 
                    i === selectedPointIndex ? { ...p, diameter: Math.min(300, p.diameter + 1) } : p
                  ));
                  performRealtimeAnalysis();
                }}
              >
                <Text style={styles.controlButtonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.adjustButton]}
                onPress={() => {
                  setEditablePoints(prev => prev.map((p, i) => 
                    i === selectedPointIndex ? { ...p, diameter: Math.min(300, p.diameter + 10) } : p
                  ));
                  performRealtimeAnalysis();
                }}
              >
                <AppIcon name="up" size={16} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>+10</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  saveHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  saveHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  instructionsContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructionsText: {
    fontSize: typography.small,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  analysisText: {
    fontSize: typography.small,
    color: '#10B981',
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)'
    } : {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  svgContainer: {
    flex: 1,
  },
  controlsContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  selectedPointInfo: {
    backgroundColor: '#334155',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  controlButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    flexDirection: 'row',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
    } : {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  resetButton: {
    backgroundColor: '#64748B',
    flex: 0.6,
  },
  zoomButton: {
    backgroundColor: '#3B82F6',
  },
  addButton: {
    backgroundColor: '#10B981',
  },
  removeButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  adjustButton: {
    backgroundColor: '#8B5CF6',
    flex: 0.22,
  },
  selectedPointLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  selectedPointValue: {
    fontSize: typography.small,
    fontWeight: '500',
    color: '#10B981',
    textAlign: 'center',
  },
  controlButtonText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.xs,
  },
});