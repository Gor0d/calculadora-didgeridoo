import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PanResponder,
  Animated,
  Modal
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
import { PerformanceSettings } from '../components/PerformanceSettings';
import { OptimizedScrollView, OptimizedTouchableOpacity, OptimizedText } from '../components/OptimizedComponents';
import { AppIcon } from '../components/IconSystem';
import { TuningSelector } from '../components/TuningSelector';
import { themeService } from '../services/theme/ThemeService';
import { useTutorial } from '../hooks/useTutorial';
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
const GeometryVisualization = React.memo(({ geometry, isVisible, currentUnit = 'metric', visualizationZoom = 1.0, setVisualizationZoom, visualizationMode = 'technical', setVisualizationMode, panOffset, setPanOffset, analysisResults = [] }) => {
  // Skip rendering if not visible
  if (!isVisible) {
    return null;
  }
  
  // Theme support
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const colors = currentTheme.colors;

  useEffect(() => {
    const handleThemeChange = (newTheme) => {
      setCurrentTheme(newTheme);
    };

    themeService.addThemeChangeListener(handleThemeChange);
    
    return () => {
      themeService.removeThemeChangeListener(handleThemeChange);
    };
  }, []);
  
  // Animated values for smooth interactions
  const animatedZoom = useRef(new Animated.Value(visualizationZoom)).current;
  const animatedPan = useRef(new Animated.ValueXY(panOffset)).current;
  const lastPinchDistance = useRef(null);
  const lastZoom = useRef(visualizationZoom);
  
  // Update animated values when props change
  useEffect(() => {
    Animated.timing(animatedZoom, {
      toValue: visualizationZoom,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [visualizationZoom, animatedZoom]);
  
  useEffect(() => {
    Animated.timing(animatedPan, {
      toValue: panOffset,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [panOffset, animatedPan]);

  // Calculate real-time note estimation when no analysis results
  const estimatedNote = useMemo(() => {
    if (analysisResults.length > 0) {
      return `${analysisResults[0].note} (${analysisResults[0].frequency.toFixed(0)}Hz)`;
    }
    
    if (!geometry || !geometry.trim()) return 'N/A';
    
    try {
      const points = unitConverter.parseGeometry(geometry, currentUnit);
      if (points.length < 2) return 'N/A';
      
      // Quick frequency estimation based on geometry
      const effectiveLength = Math.max(...points.map(p => p.position));
      const averageDiameter = points.reduce((sum, p) => sum + p.diameter, 0) / points.length;
      
      // Simplified acoustic formula for fundamental frequency
      const speedOfSound = 343; // m/s at 20°C
      const lengthInMeters = effectiveLength / (currentUnit === 'metric' ? 100 : 39.37);
      const frequency = speedOfSound / (2 * lengthInMeters);
      
      // Convert frequency to note
      const A4 = 440;
      const C0 = A4 * Math.pow(2, -4.75);
      const noteNumber = Math.round(12 * Math.log2(frequency / C0));
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octave = Math.floor(noteNumber / 12);
      const note = noteNames[noteNumber % 12];
      
      return `${note}${octave} (${frequency.toFixed(0)}Hz)`;
    } catch (error) {
      return 'N/A';
    }
  }, [geometry, currentUnit, analysisResults]);

  // Helper function to calculate distance between two touches
  const getDistance = (touches) => {
    if (touches.length < 2) return 0;
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Pan responder for touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { nativeEvent } = event;
        if (nativeEvent.touches.length === 2) {
          // Start pinch gesture
          lastPinchDistance.current = getDistance(nativeEvent.touches);
          lastZoom.current = visualizationZoom;
        }
      },
      onPanResponderMove: (event, gesture) => {
        const { nativeEvent } = event;
        
        if (nativeEvent.touches.length === 2) {
          // Pinch zoom
          const currentDistance = getDistance(nativeEvent.touches);
          if (lastPinchDistance.current && currentDistance > 0) {
            const scale = currentDistance / lastPinchDistance.current;
            const newZoom = Math.max(0.5, Math.min(3.0, lastZoom.current * scale));
            setVisualizationZoom(newZoom);
          }
        } else if (nativeEvent.touches.length === 1 && visualizationZoom > 1.0) {
          // Pan when zoomed in
          const newPanX = panOffset.x + gesture.dx * 0.5;
          const newPanY = panOffset.y + gesture.dy * 0.5;
          setPanOffset({ x: newPanX, y: newPanY });
        }
      },
      onPanResponderRelease: () => {
        lastPinchDistance.current = null;
      },
    })
  ).current;

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

  const { svgDimensions, pathData, scaleMarks, validPoints } = useMemo(() => {
    if (!geometry || !geometry.trim() || points.length < 2) {
      return { svgDimensions: null, pathData: null, scaleMarks: [], validPoints: [] };
    }

    // Validate points data to prevent NaN calculations
    const validPoints = points.filter(p => 
      p && typeof p.position === 'number' && typeof p.diameter === 'number' &&
      !isNaN(p.position) && !isNaN(p.diameter) && p.diameter > 0 && p.position >= 0
    );

    if (validPoints.length < 2) {
      return { svgDimensions: null, pathData: null, scaleMarks: [], validPoints: [] };
    }

    const maxPosition = Math.max(...validPoints.map(p => p.position));
    const maxDiameter = Math.max(...validPoints.map(p => p.diameter));
    const minDiameter = Math.min(...validPoints.map(p => p.diameter));

    // Ensure all calculated values are valid numbers
    if (!isFinite(maxPosition) || !isFinite(maxDiameter) || !isFinite(minDiameter) || 
        maxPosition <= 0 || maxDiameter <= 0 || minDiameter <= 0) {
      console.warn('Invalid geometry calculations:', { maxPosition, maxDiameter, minDiameter });
      return { svgDimensions: null, pathData: null, scaleMarks: [] };
    }

    // Proportions more realistic to didgeridoo dimensions
    const safeScreenWidth = isFinite(SCREEN_WIDTH) ? SCREEN_WIDTH : 400;
    const safeSpacingXL = isFinite(spacing.xl) ? spacing.xl : 24;
    const safeSpacingMD = isFinite(spacing.md) ? spacing.md : 12;
    
    // Calculate dimensions based on visualization mode - FULL WIDTH
    const realAspectRatio = maxPosition / (maxDiameter / 10); // Convert mm to cm for true ratio
    const svgWidth = safeScreenWidth - safeSpacingXL * 0.5; // Use almost full screen width
    const margin = safeSpacingMD * 0.6; // Even smaller margins for maximum space
    
    let svgHeight, scaleX, scaleY, targetAspectRatio;
    
    if (visualizationMode === 'real') {
      // Modo Real: proporções verdadeiras (fica muito fino mas é real)
      targetAspectRatio = Math.max(15, Math.min(realAspectRatio, 50)); // Allow extreme ratios
      const idealHeight = svgWidth / targetAspectRatio;
      svgHeight = Math.max(idealHeight, deviceInfo.isTablet ? scale(40) : scale(30)); // Very thin
      
      const availableWidth = Math.max(svgWidth - margin * 2, 100);
      const availableHeight = Math.max(svgHeight - margin * 3, 20);
      
      const baseScaleX = availableWidth / maxPosition;
      const baseScaleY = availableHeight / maxDiameter;
      
      scaleX = baseScaleX * visualizationZoom;
      scaleY = baseScaleY * visualizationZoom;
      
    } else {
      // Modo Técnico: comprimento real + diâmetro amplificado para visibilidade - AUMENTADO
      const technicalAspectRatio = Math.max(6, Math.min(realAspectRatio / 3, 12)); // Better ratio for visibility
      const idealHeight = svgWidth / technicalAspectRatio;
      svgHeight = Math.max(idealHeight, deviceInfo.isTablet ? scale(160) : scale(140)); // Much taller for better detail
      targetAspectRatio = technicalAspectRatio;
      
      const availableWidth = Math.max(svgWidth - margin * 2, 100);
      const availableHeight = Math.max(svgHeight - margin * 3, 60);
      
      const baseScaleX = availableWidth / maxPosition; // Comprimento real
      const baseScaleY = availableHeight / maxDiameter; // Diâmetro amplificado
      
      scaleX = baseScaleX * visualizationZoom;
      scaleY = baseScaleY * visualizationZoom;
    }

    // Final validation to ensure all SVG dimensions are valid
    if (!isFinite(svgHeight) || !isFinite(svgWidth) || !isFinite(scaleX) || !isFinite(scaleY) ||
        svgHeight <= 0 || svgWidth <= 0 || scaleX <= 0 || scaleY <= 0) {
      console.warn('Invalid SVG dimensions:', { svgHeight, svgWidth, scaleX, scaleY, SCREEN_WIDTH, spacing: spacing.xl });
      return { svgDimensions: null, pathData: null, scaleMarks: [], validPoints: [] };
    }
    
    // Create technical profile view - simple lines showing the bore
    const topCoords = validPoints.map(p => ({
      x: margin + p.position * scaleX,
      y: svgHeight / 2 - (p.diameter / 2) * scaleY
    }));

    const bottomCoords = validPoints.map(p => ({
      x: margin + p.position * scaleX,
      y: svgHeight / 2 + (p.diameter / 2) * scaleY
    }));

    // Create simple straight-line segments (technical style)
    const topPath = `M ${topCoords.map(c => `${c.x},${c.y}`).join(' L ')}`;
    const bottomPath = `M ${bottomCoords.map(c => `${c.x},${c.y}`).join(' L ')}`;
    
    // Create closed rectangular sections for each segment
    let pathData = '';
    for (let i = 0; i < validPoints.length - 1; i++) {
      const x1 = margin + validPoints[i].position * scaleX;
      const x2 = margin + validPoints[i + 1].position * scaleX;
      const y1Top = svgHeight / 2 - (validPoints[i].diameter / 2) * scaleY;
      const y1Bottom = svgHeight / 2 + (validPoints[i].diameter / 2) * scaleY;
      const y2Top = svgHeight / 2 - (validPoints[i + 1].diameter / 2) * scaleY;
      const y2Bottom = svgHeight / 2 + (validPoints[i + 1].diameter / 2) * scaleY;
      
      pathData += `M ${x1},${y1Top} L ${x2},${y2Top} L ${x2},${y2Bottom} L ${x1},${y1Bottom} Z `;
    }

    // Generate scale marks with zoom-aware spacing to prevent overlap - 20CM INTERVALS
    const scaleMarks = [];
    const baseScaleStep = 200; // Fixed 200mm = 20cm intervals
    // Simplify to always show labels on main marks to ensure visibility
    const actualStep = baseScaleStep; // Keep consistent 20cm intervals
    
    for (let pos = 0; pos <= maxPosition; pos += actualStep) {
      const x = margin + pos * scaleX;
      scaleMarks.push({
        x,
        position: pos,
        isMajor: true // All marks are major to ensure labels are visible
      });
    }

    return {
      svgDimensions: { 
        svgWidth, 
        svgHeight, 
        margin, 
        maxPosition, 
        maxDiameter, 
        minDiameter,
        scaleX,
        scaleY
      },
      pathData,
      scaleMarks,
      validPoints
    };
  }, [points, geometry, visualizationZoom, visualizationMode]);

  if (!isVisible || !geometry || !geometry.trim() || points.length < 2 || !svgDimensions) return null;

  return (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>
        {localizationService.t('geometryVisualization')}
      </Text>
      
      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <Text style={styles.modeLabel}>Modo de Visualização:</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity 
            style={[styles.modeButton, visualizationMode === 'technical' && styles.modeButtonActive]}
            onPress={() => setVisualizationMode('technical')}
          >
            <Text style={[styles.modeButtonText, visualizationMode === 'technical' && styles.modeButtonTextActive]}>
              🔧 Técnico
            </Text>
            <Text style={styles.modeButtonDesc}>Visível</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, visualizationMode === 'real' && styles.modeButtonActive]}
            onPress={() => setVisualizationMode('real')}
          >
            <Text style={[styles.modeButtonText, visualizationMode === 'real' && styles.modeButtonTextActive]}>
              📏 Real
            </Text>
            <Text style={styles.modeButtonDesc}>Proporção fiel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <View style={styles.controlsLeft}>
          {Platform.OS === 'web' && (
            <Text style={styles.webInstructions}>
              🖱️ Roda do mouse: zoom • Arrastar: mover gráfico
            </Text>
          )}
        </View>
        
        <View style={styles.controlsCenter}>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setVisualizationZoom(Math.max(0.5, visualizationZoom - 0.25))}
          >
            <Text style={styles.zoomButtonText}>🔍-</Text>
          </TouchableOpacity>
          
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>{(visualizationZoom * 100).toFixed(0)}%</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setVisualizationZoom(Math.min(3.0, visualizationZoom + 0.25))}
          >
            <Text style={styles.zoomButtonText}>🔍+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.zoomButton, styles.resetButton]}
            onPress={() => setVisualizationZoom(1.0)}
          >
            <Text style={styles.zoomButtonText}>⚪</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlsRight}>
          <Text style={styles.modeText}>
            {visualizationMode === 'real' ? '📏 Real' : '🔧 Técnica'}
          </Text>
        </View>
      </View>

      {/* Interactive container with horizontal ScrollView */}
      <View style={styles.svgContainerWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center', // Center horizontally
            paddingHorizontal: spacing.sm, // Reduced padding for more space
            minWidth: Math.max(svgDimensions.svgWidth * visualizationZoom + spacing.md * 4, SCREEN_WIDTH * visualizationZoom),
          }}
          style={styles.svgScrollContainer}
          {...panResponder.panHandlers}
          onWheel={(event) => {
            // Mouse wheel zoom for desktop
            if (Platform.OS === 'web') {
              event.preventDefault();
              const delta = event.deltaY > 0 ? -0.1 : 0.1;
              const newZoom = Math.max(0.5, Math.min(3.0, visualizationZoom + delta));
              setVisualizationZoom(newZoom);
            }
          }}
        >

        <Animated.View
          style={{
            width: svgDimensions.svgWidth * visualizationZoom,
            height: svgDimensions.svgHeight * visualizationZoom,
            transform: [
              { translateX: animatedPan.x },
              { translateY: animatedPan.y },
            ],
            alignSelf: 'center', // Always center the visualization
          }}
        >
          <Svg 
            width={svgDimensions.svgWidth * visualizationZoom} 
            height={svgDimensions.svgHeight * visualizationZoom} 
            viewBox={`0 0 ${svgDimensions.svgWidth} ${svgDimensions.svgHeight}`}
          >
          {/* Clean background */}
          <Rect 
            x="0" 
            y="0" 
            width={svgDimensions.svgWidth} 
            height={svgDimensions.svgHeight} 
            fill="#FFFFFF" 
            stroke="#E5E7EB" 
            strokeWidth="1"
          />
          
          {/* Scale grid - like technical drawing */}
          {scaleMarks.map((mark, index) => (
            <G key={index}>
              {/* Vertical scale lines */}
              <Line
                x1={mark.x}
                y1={svgDimensions.margin}
                x2={mark.x}
                y2={svgDimensions.svgHeight - svgDimensions.margin}
                stroke={mark.isMajor ? "#D1D5DB" : "#F3F4F6"}
                strokeWidth={mark.isMajor ? "1" : "0.5"}
              />
              
              {/* Scale labels - OUTSIDE the graph */}
              {mark.isMajor && (
                <SvgText
                  x={mark.x}
                  y={svgDimensions.svgHeight - svgDimensions.margin + 15}
                  fontSize="12"
                  fill="#374151"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {currentUnit === 'metric' 
                    ? `${(mark.position / 10).toFixed(0)}cm` 
                    : `${(mark.position / 25.4).toFixed(1)}"`
                  }
                </SvgText>
              )}
              
              {/* Scale labels - INSIDE the graph (above the instrument) */}
              {mark.isMajor && mark.position > 0 && (
                <SvgText
                  x={mark.x}
                  y={svgDimensions.margin - 5}
                  fontSize="11"
                  fill="#DC2626"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {currentUnit === 'metric' 
                    ? `${(mark.position / 10).toFixed(0)}cm` 
                    : `${(mark.position / 25.4).toFixed(1)}"`
                  }
                </SvgText>
              )}
            </G>
          ))}
          
          {/* Horizontal reference lines */}
          <Line
            x1={svgDimensions.margin}
            y1={svgDimensions.svgHeight / 2}
            x2={svgDimensions.svgWidth - svgDimensions.margin}
            y2={svgDimensions.svgHeight / 2}
            stroke="#E5E7EB"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />

          {/* Y-axis diameter markings */}
          {(() => {
            const centerY = svgDimensions.svgHeight / 2;
            const diameterMarks = [];
            const maxRadius = Math.max(svgDimensions.maxDiameter / 2, 50); // Min 5cm radius for visibility
            const radiusStep = currentUnit === 'metric' ? 50 : 50; // 5cm steps in metric, maintain for imperial
            
            // Create marks above and below center line
            for (let radius = radiusStep; radius <= maxRadius + radiusStep; radius += radiusStep) {
              const yOffset = radius * svgDimensions.scaleY;
              if (centerY - yOffset > svgDimensions.margin && centerY + yOffset < svgDimensions.svgHeight - svgDimensions.margin) {
                const diameter = radius * 2;
                const displayValue = currentUnit === 'metric' 
                  ? `${(diameter / 10).toFixed(0)}cm`  // Convert mm to cm
                  : `${(diameter / 25.4).toFixed(1)}"`; // Convert mm to inches
                
                diameterMarks.push(
                  <G key={`diameter-${radius}`}>
                    {/* Top mark */}
                    <Line
                      x1={svgDimensions.margin - 5}
                      y1={centerY - yOffset}
                      x2={svgDimensions.margin}
                      y2={centerY - yOffset}
                      stroke="#9CA3AF"
                      strokeWidth="1"
                    />
                    <SvgText
                      x={svgDimensions.margin - 10}
                      y={centerY - yOffset + 4}
                      fontSize="11"
                      fill="#374151"
                      textAnchor="end"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {displayValue}
                    </SvgText>
                    
                    {/* Bottom mark */}
                    <Line
                      x1={svgDimensions.margin - 8}
                      y1={centerY + yOffset}
                      x2={svgDimensions.margin}
                      y2={centerY + yOffset}
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                    />
                    <SvgText
                      x={svgDimensions.margin - 10}
                      y={centerY + yOffset + 4}
                      fontSize="11"
                      fill="#374151"
                      textAnchor="end"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {displayValue}
                    </SvgText>
                  </G>
                );
              }
            }
            return diameterMarks;
          })()}

          {/* Y-axis label only (X-axis is clear from the measurements) */}
          <SvgText
            x={15}
            y={svgDimensions.svgHeight / 2}
            fontSize="12"
            fill="#374151"
            textAnchor="middle"
            fontWeight="600"
            transform={`rotate(-90, 15, ${svgDimensions.svgHeight / 2})`}
          >
            {currentUnit === 'metric' ? 'Diâmetro (cm)' : 'Diameter (inches)'}
          </SvgText>
          
          {/* Technical bore profile - simple and clean */}
          <Path
            d={pathData}
            fill="none"
            stroke="#1F2937"
            strokeWidth="1.5"
          />

          {/* Professional measurements - position and diameter in mm like text format */}
          {(() => {
            const isSmallScreen = svgDimensions.svgWidth < 400;
            const fontSize = isSmallScreen ? "8" : "9";
            const measurements = [];
            
            // Create measurements every 25mm (2.5cm intervals like the text example)
            const stepMm = 250; // 25mm intervals in our coordinate system (250 = 25mm * 10)
            const maxPosition = svgDimensions.maxPosition * 10; // Convert to mm
            
            // Start from 0
            for (let positionMm = 0; positionMm <= maxPosition; positionMm += stepMm) {
              // Find diameter at this position by interpolation
              let diameter = 0;
              
              // Handle position 0 separately
              if (positionMm === 0) {
                diameter = validPoints[0]?.diameter || 0;
              } else {
                // Find the two closest points for interpolation
                const closestIndex = validPoints.reduce((closest, point, index) => {
                  const distance = Math.abs(point.position - positionMm);
                  const closestDistance = Math.abs(validPoints[closest].position - positionMm);
                  return distance < closestDistance ? index : closest;
                }, 0);
                
                // Interpolate between points if needed
                if (closestIndex < validPoints.length - 1) {
                  const p1 = validPoints[closestIndex];
                  const p2 = validPoints[closestIndex + 1];
                  
                  if (positionMm >= p1.position && positionMm <= p2.position) {
                    // Interpolate
                    const ratio = (positionMm - p1.position) / (p2.position - p1.position);
                    diameter = p1.diameter + (p2.diameter - p1.diameter) * ratio;
                  } else if (positionMm < p1.position && closestIndex > 0) {
                    // Use previous point for extrapolation
                    const p0 = validPoints[closestIndex - 1];
                    const ratio = (positionMm - p0.position) / (p1.position - p0.position);
                    diameter = p0.diameter + (p1.diameter - p0.diameter) * ratio;
                  } else {
                    diameter = p1.diameter;
                  }
                } else {
                  diameter = validPoints[closestIndex].diameter;
                }
              }
              
              // Calculate SVG position
              const x = svgDimensions.margin + (positionMm / 10) * svgDimensions.scaleX;
              const yTop = svgDimensions.svgHeight / 2 - (diameter / 2) * svgDimensions.scaleY;
              const yBottom = svgDimensions.svgHeight / 2 + (diameter / 2) * svgDimensions.scaleY;
              const yCenter = svgDimensions.svgHeight / 2;
              
              // Convert to mm for display (matching text format)
              const displayPosition = (positionMm / 10).toFixed(0); // Convert to mm and remove decimals
              const displayDiameter = (diameter).toFixed(1); // Keep 1 decimal like 29.5
              
              // Only show if within bounds
              if (x >= svgDimensions.margin && x <= svgDimensions.svgWidth - svgDimensions.margin) {
                measurements.push(
                  <G key={`text-format-${positionMm}`}>
                    {/* Position in mm - TOP (inside graph) */}
                    <SvgText
                      x={x}
                      y={Math.max(svgDimensions.margin + 15, yTop - (isSmallScreen ? 10 : 14))}
                      fontSize={fontSize}
                      fill={colors?.error || "#DC2626"}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {displayPosition}
                    </SvgText>
                    
                    {/* Diameter in mm - BOTTOM (inside graph) */}
                    <SvgText
                      x={x}
                      y={Math.min(svgDimensions.svgHeight - svgDimensions.margin - 5, yBottom + (isSmallScreen ? 12 : 16))}
                      fontSize={fontSize}
                      fill={colors?.primary || "#059669"}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {displayDiameter}
                    </SvgText>
                    
                    {/* Vertical measurement line */}
                    <Line
                      x1={x}
                      y1={yTop - (isSmallScreen ? 8 : 12)}
                      x2={x}
                      y2={yBottom + (isSmallScreen ? 10 : 14)}
                      stroke={colors?.textSecondary || "#6B7280"}
                      strokeWidth="1"
                      opacity="0.4"
                      strokeDasharray="2,1"
                    />
                    
                    {/* Horizontal diameter indicator */}
                    <Line
                      x1={x - (diameter / 2) * svgDimensions.scaleY * 0.8}
                      y1={yCenter}
                      x2={x + (diameter / 2) * svgDimensions.scaleY * 0.8}
                      y2={yCenter}
                      stroke={colors?.primary || "#059669"}
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    
                    {/* Center point indicator */}
                    <Circle
                      cx={x}
                      cy={yCenter}
                      r="1.5"
                      fill={colors?.textSecondary || "#6B7280"}
                      opacity="0.8"
                    />
                  </G>
                );
              }
            }
            
            return measurements;
          })()}
          
          {/* Section dividers */}
          {points.map((point, index) => (
            <Line
              key={index}
              x1={svgDimensions.margin + point.position * svgDimensions.scaleX}
              y1={svgDimensions.svgHeight / 2 - (point.diameter / 2) * svgDimensions.scaleY - 3}
              x2={svgDimensions.margin + point.position * svgDimensions.scaleX}
              y2={svgDimensions.svgHeight / 2 + (point.diameter / 2) * svgDimensions.scaleY + 3}
              stroke="#6B7280"
              strokeWidth="1"
              opacity="0.7"
            />
          ))}
          
          {/* Dimension line at bottom */}
          <G>
            <Line
              x1={svgDimensions.margin}
              y1={svgDimensions.svgHeight - svgDimensions.margin + 20}
              x2={svgDimensions.svgWidth - svgDimensions.margin}
              y2={svgDimensions.svgHeight - svgDimensions.margin + 20}
              stroke="#1F2937"
              strokeWidth="1"
            />
            
            {/* Start and end marks */}
            <Line x1={svgDimensions.margin} y1={svgDimensions.svgHeight - svgDimensions.margin + 18} 
                  x2={svgDimensions.margin} y2={svgDimensions.svgHeight - svgDimensions.margin + 22} 
                  stroke="#1F2937" strokeWidth="1" />
            <Line x1={svgDimensions.svgWidth - svgDimensions.margin} y1={svgDimensions.svgHeight - svgDimensions.margin + 18} 
                  x2={svgDimensions.svgWidth - svgDimensions.margin} y2={svgDimensions.svgHeight - svgDimensions.margin + 22} 
                  stroke="#1F2937" strokeWidth="1" />
          </G>
          
          {/* Axis labels */}
          <SvgText
            x={svgDimensions.svgWidth / 2}
            y={svgDimensions.svgHeight - 4}
            fontSize="11"
            fill="#6B7280"
            textAnchor="middle"
            fontFamily="monospace"
          >
            geometry / m
          </SvgText>
          </Svg>
        </Animated.View>
        </ScrollView>

        {/* Reset pan button when panned */}
        {(Math.abs(panOffset.x) > 10 || Math.abs(panOffset.y) > 10) && (
          <TouchableOpacity 
            style={styles.resetPanButton}
            onPress={() => setPanOffset({ x: 0, y: 0 })}
          >
            <Text style={styles.resetPanButtonText}>📍 Centralizar</Text>
          </TouchableOpacity>
        )}
      </View>
      

      {/* Technical excavation data - exactly what's needed for carving */}
      <View style={styles.excavationDataContainer}>
        <View style={styles.excavationHeader}>
          <AppIcon name="construct" size={18} color="#059669" />
          <Text style={styles.excavationDataTitle}>Dados de Geometria</Text>
        </View>
        <Text style={styles.excavationDataSubtitle}>
        </Text>
        
        <View style={styles.excavationTable}>
          <View style={styles.excavationTableHeader}>
            <Text style={styles.excavationHeaderCell}>
              {currentUnit === 'metric' ? 'Posição (cm)' : 'Position (in)'}
            </Text>
            <Text style={styles.excavationHeaderCell}>
              {currentUnit === 'metric' ? 'Diâmetro (mm)' : 'Diameter (in)'}
            </Text>
            <Text style={styles.excavationHeaderCell}>
              {currentUnit === 'metric' ? 'Raio (mm)' : 'Radius (in)'}
            </Text>
          </View>
          
          <ScrollView style={styles.excavationTableScrollView} showsVerticalScrollIndicator={false}>
            {(() => {
              const excavationPoints = [];
              const step = currentUnit === 'metric' ? 100 : 101.6; // 10cm or ~4 inches
              const maxPos = svgDimensions.maxPosition * 10; // Convert to mm
              
              for (let pos = 0; pos <= maxPos; pos += step) {
                // Find the closest actual point or interpolate
                let diameter = 0;
                const closestPointIndex = validPoints.reduce((closest, point, index) => {
                  const distance = Math.abs(point.position - pos);
                  const closestDistance = Math.abs(validPoints[closest].position - pos);
                  return distance < closestDistance ? index : closest;
                }, 0);
                
                // Simple interpolation for positions between actual points
                if (closestPointIndex < validPoints.length - 1) {
                  const p1 = validPoints[closestPointIndex];
                  const p2 = validPoints[closestPointIndex + 1];
                  const ratio = (pos - p1.position) / (p2.position - p1.position);
                  diameter = p1.diameter + (p2.diameter - p1.diameter) * ratio;
                } else {
                  diameter = validPoints[closestPointIndex].diameter;
                }
                
                const displayPos = currentUnit === 'metric' ? (pos / 10).toFixed(0) : (pos / 254).toFixed(1);
                const displayDiameter = currentUnit === 'metric' ? diameter.toFixed(0) : (diameter / 25.4).toFixed(2);
                const displayRadius = currentUnit === 'metric' ? (diameter / 2).toFixed(0) : (diameter / 50.8).toFixed(2);
                
                excavationPoints.push(
                  <View key={pos} style={[
                    styles.excavationTableRow,
                    pos === 0 && styles.excavationTableRowFirst,
                    pos >= maxPos - step/2 && styles.excavationTableRowLast
                  ]}>
                    <Text style={styles.excavationDataCell}>{displayPos}</Text>
                    <Text style={styles.excavationDataCell}>{displayDiameter}</Text>
                    <Text style={styles.excavationDataCell}>{displayRadius}</Text>
                  </View>
                );
              }
              return excavationPoints;
            })()}
          </ScrollView>
        </View>
        
        <View style={styles.excavationTipContainer}>
          <AppIcon name="information-circle" size={16} color="#3B82F6" />
          <Text style={styles.excavationTip}>
            <Text style={styles.excavationTipBold}>Dica:</Text> Use o raio para marcar com compasso na madeira
          </Text>
        </View>
      </View>
      
      {/* Enhanced legend with measurement guide */}
      <View style={styles.fixedLegend}>
        <View style={styles.legendHeader}>
          <Text style={styles.fixedLegendTitle}>LEGENDA</Text>
        </View>
        
        {/* Professional measurement guide legend */}
        <View style={styles.measurementLegend}>
          <Text style={styles.measurementLegendTitle}>📐 Formato Texto: Posição Diâmetro (em mm)</Text>
          <View style={styles.measurementLegendItems}>
            <View style={styles.measurementLegendItem}>
              <View style={[styles.colorIndicator, { backgroundColor: colors?.error || '#DC2626' }]} />
              <Text style={styles.measurementLegendText}>Posição (mm) - Superior</Text>
            </View>
            <View style={styles.measurementLegendItem}>
              <View style={[styles.colorIndicator, { backgroundColor: colors?.primary || '#059669' }]} />
              <Text style={styles.measurementLegendText}>Diâmetro (mm) - Inferior</Text>
            </View>
            <View style={styles.measurementLegendItem}>
              <View style={[styles.colorIndicator, { backgroundColor: colors?.textSecondary || '#6B7280' }]} />
              <Text style={styles.measurementLegendText}>Linhas guia</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.legendStats}>
          <View style={styles.legendStat}>
            <AppIcon name="ruler" size={12} color="#059669" />
            <Text style={styles.legendStatText}>
              {svgDimensions.maxPosition.toFixed(1)}cm
            </Text>
          </View>
          <View style={styles.legendStat}>
            <AppIcon name="location" size={12} color="#3B82F6" />
            <Text style={styles.legendStatText}>
              {validPoints.length} pontos
            </Text>
          </View>
          <View style={styles.legendStat}>
            <AppIcon name="musical-notes" size={12} color="#8B5CF6" />
            <Text style={styles.legendStatText}>
              {estimatedNote !== 'N/A' ? estimatedNote : 'Analisar'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

// AnalysisResults Component
const AnalysisResults = React.memo(({ results, isVisible, onPlaySound, metadata }) => {
  const [isPlayingHarmonics, setIsPlayingHarmonics] = useState(false);
  const [showHarmonicsModal, setShowHarmonicsModal] = useState(false);
  
  const handlePlaySound = useCallback(async (type, data) => {
    if (type === 'harmonics_sequence') {
      setIsPlayingHarmonics(true);
      // Duration = number of harmonics * 1000ms each
      const totalDuration = data.length * 1000;
      setTimeout(() => {
        setIsPlayingHarmonics(false);
      }, totalDuration);
    }
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
      
      <>
        {/* Fundamental Frequency Section */}
      <View style={styles.droneResult}>
        <View style={styles.droneInfo}>
          <Text style={styles.droneLabel}>{localizationService.t('fundamental')}</Text>
          <Text style={styles.droneFrequency}>{firstResult.frequency.toFixed(2)} Hz</Text>
          <Text style={styles.droneNote}>{firstResult.note} {firstResult.frequency.toFixed(0)}Hz</Text>
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
          <Text style={styles.harmonicsTitle}>📊 Análise Profissional de Harmônicos</Text>
          <Text style={styles.harmonicsSubtitle}>Baseada em cálculos acústicos avançados para didgeridoo</Text>
          
          {/* Table Header */}
          <View style={styles.analysisTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Freq [Hz]</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Nota</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Oitava</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Cents</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Ampl %</Text>
            </View>
            
            {/* Table Rows */}
            {results.slice(0, 8).map((result, index) => {
              const harmonicRatio = index === 0 ? 1.0 : (result.frequency / results[0].frequency);
              const expectedRatio = index + 1;
              const inharmonicity = Math.abs(harmonicRatio - expectedRatio);
              
              const isPlayable = Math.abs(result.centDiff || 0) < 50 && (result.amplitude || 0) > 0.2;
              const isTuned = Math.abs(result.centDiff || 0) < 15;
              const isStrong = (result.amplitude || 0) > 0.4;
              
              let statusIcon = '🔴';
              let statusText = 'Fraco';
              if (isPlayable) {
                if (isTuned && isStrong) {
                  statusIcon = '🟢';
                  statusText = 'Excelente';
                } else if (isTuned || isStrong) {
                  statusIcon = '🟡';
                  statusText = 'Bom';
                } else {
                  statusIcon = '🟠';
                  statusText = 'Regular';
                }
              }
              
              return (
                <View key={index} style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  !isPlayable && styles.tableRowWeak,
                  index === 0 && styles.fundamentalRow
                ]}>
                  <Text style={[styles.tableCellText, { flex: 1.2, fontFamily: 'monospace' }]}>
                    {result.frequency.toFixed(0)}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 0.8, fontWeight: '600' }]}>
                    {(() => {
                      if (!result.note) return '-';
                      const notePart = result.note.replace(/\d+$/, '');
                      return notePart || '-';
                    })()}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 0.8, fontFamily: 'monospace' }]}>
                    {(() => {
                      if (!result.frequency) return '-';
                      // Calcular oitava baseada na frequência
                      const A4 = 440;
                      const C0 = A4 * Math.pow(2, -4.75);
                      const noteNumber = Math.round(12 * Math.log2(result.frequency / C0));
                      const octave = Math.floor(noteNumber / 12);
                      return octave.toString();
                    })()}
                  </Text>
                  <Text style={[
                    styles.tableCellText, 
                    { 
                      flex: 1.0, 
                      fontFamily: 'monospace',
                      color: Math.abs(result.centDiff || 0) < 10 ? '#10B981' : 
                             Math.abs(result.centDiff || 0) < 30 ? '#F59E0B' : '#EF4444'
                    }
                  ]}>
                    {result.centDiff >= 0 ? '+' : ''}{(result.centDiff || 0).toFixed(0)}
                  </Text>
                  <Text style={[
                    styles.tableCellText, 
                    { 
                      flex: 1.2, 
                      fontFamily: 'monospace',
                      color: (result.amplitude || 0) > 0.5 ? '#10B981' : 
                             (result.amplitude || 0) > 0.3 ? '#F59E0B' : '#6B7280'
                    }
                  ]}>
                    {((result.amplitude || 0) * 100).toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Professional Analysis Summary */}
          <View style={styles.analysisSummary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>🎵 Tom Fundamental</Text>
                <Text style={styles.summaryValue}>{results[0]?.note} {results[0]?.frequency.toFixed(0)}Hz</Text>
                <Text style={styles.summarySubvalue}>{results[0]?.frequency.toFixed(1)} Hz</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>🎯 Precisão</Text>
                <Text style={[styles.summaryValue, {
                  color: Math.abs(results[0]?.centDiff || 0) < 10 ? '#10B981' : '#F59E0B'
                }]}>
                  {Math.abs(results[0]?.centDiff || 0) < 10 ? 'Afinado' : 'Desafinado'}
                </Text>
                <Text style={styles.summarySubvalue}>{results[0]?.centDiff || 0}¢</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>📈 Harmônicos Fortes</Text>
                <Text style={styles.summaryValue}>
                  {results.filter(r => (r.amplitude || 0) > 0.4).length}
                </Text>
                <Text style={styles.summarySubvalue}>de {results.length} total</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>🔧 Tocabilidade</Text>
                <Text style={[styles.summaryValue, {
                  color: results.filter(r => Math.abs(r.centDiff || 0) < 30).length >= 3 ? '#10B981' : '#F59E0B'
                }]}>
                  {results.filter(r => Math.abs(r.centDiff || 0) < 30).length >= 3 ? 'Boa' : 'Difícil'}
                </Text>
                <Text style={styles.summarySubvalue}>para iniciantes</Text>
              </View>
            </View>
          </View>
          
          {/* Technical Parameters */}
          {metadata && (
            <View style={styles.metadataContainer}>
              <Text style={styles.metadataTitle}>🔬 Parâmetros Técnicos</Text>
              <View style={styles.metadataGrid}>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Comprimento Efetivo</Text>
                  <Text style={styles.metadataValue}>{metadata.effectiveLength.toFixed(1)} cm</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Volume Interno</Text>
                  <Text style={styles.metadataValue}>
                    {(() => {
                      // Calculate internal volume from geometry stats if available
                      const volume = metadata.volume || (metadata.averageRadius ? 
                        Math.PI * Math.pow(metadata.averageRadius, 2) * metadata.effectiveLength / 10 : 0);
                      return (volume / 1000).toFixed(1) + 'L';
                    })()}
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Impedância Média</Text>
                  <Text style={styles.metadataValue}>
                    {metadata.impedanceProfile?.length ? 
                      (metadata.impedanceProfile.reduce((sum, p) => sum + p.impedance, 0) / metadata.impedanceProfile.length / 1000).toFixed(0) + 'k'
                      : 'N/A'
                    }
                  </Text>
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
            🎵 {localizationService.t('playDrone')}
          </Text>
          <Text style={[styles.soundPreviewText, styles.frequencyText]}>
            {firstResult.frequency.toFixed(1)}Hz
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.soundPreviewButton, 
            styles.trombetasButton,
            isPlayingHarmonics && styles.playingButton
          ]}
          onPress={() => handlePlaySound('harmonics_sequence', results)}
          disabled={isPlayingHarmonics}
        >
          <Text style={styles.soundPreviewText}>
            {isPlayingHarmonics ? '🎵 Tocando...' : '🎵 Sequência'}
          </Text>
          <Text style={[styles.soundPreviewText, styles.notesText]}>
            {results.slice(0, 3).map(r => r.note).join(' → ')}...
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.soundPreviewButton, styles.exploreButton]}
          onPress={() => setShowHarmonicsModal(true)}
        >
          <Text style={styles.soundPreviewText}>
            🎼 Explorar
          </Text>
          <Text style={[styles.soundPreviewText, styles.notesText]}>
            {results.length} harmônicos
          </Text>
        </TouchableOpacity>
      </View>
      </>

      {/* Harmonics Modal */}
      <Modal
        visible={showHarmonicsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHarmonicsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎼 Explorar Harmônicos</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHarmonicsModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Toque em qualquer harmônico para escutar individualmente
            </Text>
            
            <View style={styles.harmonicsGrid}>
              {results.map((harmonic, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.harmonicCard,
                    index === 0 && styles.fundamentalCard
                  ]}
                  onPress={() => handlePlaySound('drone', {
                    fundamental: harmonic.frequency,
                    harmonics: []
                  })}
                >
                  <View style={styles.harmonicCardHeader}>
                    <Text style={styles.harmonicNumber}>
                      {index === 0 ? 'Fund.' : `H${index}`}
                    </Text>
                    <Text style={styles.harmonicNote}>{harmonic.note}</Text>
                  </View>
                  
                  <Text style={styles.harmonicFreq}>
                    {harmonic.frequency.toFixed(1)}Hz
                  </Text>
                  
                  <Text style={styles.harmonicCents}>
                    {harmonic.centDiff > 0 ? '+' : ''}{harmonic.centDiff} cents
                  </Text>
                  
                  <View style={styles.amplitudeBar}>
                    <View 
                      style={[
                        styles.amplitudeFill,
                        { width: `${(harmonic.amplitude || 0.8) * 100}%` }
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  styles.sequenceButton,
                  isPlayingHarmonics && styles.playingButton
                ]}
                onPress={() => handlePlaySound('harmonics_sequence', results)}
                disabled={isPlayingHarmonics}
              >
                <Text style={styles.modalActionText}>
                  {isPlayingHarmonics ? '🎵 Tocando Sequência...' : '🎵 Tocar Sequência Completa'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
});

// Main HomeScreen Component (renamed from SimpleHomeScreen)
export const SimpleHomeScreen = ({ navigation, route, currentUnit, onUnitChange, currentLanguage, onLanguageChange }) => {
  const [geometry, setGeometry] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const colors = currentTheme.colors;
  const [showResults, setShowResults] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationZoom, setVisualizationZoom] = useState(1.0);
  const [visualizationMode, setVisualizationMode] = useState('technical'); // 'real' or 'technical'
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [currentFileName, setCurrentFileName] = useState('');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [geometryStats, setGeometryStats] = useState(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [showFirstRunTutorial, setShowFirstRunTutorial] = useState(false);

  // Handle edited geometry from GeometryEditor
  useEffect(() => {
    if (route?.params?.editedGeometry) {
      setGeometry(route.params.editedGeometry);
      setShowVisualization(true);
      
      // Auto-analyze if requested
      if (route.params.shouldAnalyze) {
        // Delay to allow state to update
        setTimeout(() => {
          handleAnalyze();
        }, 100);
      }
      
      // Clear the params to prevent re-triggering
      navigation.setParams({ editedGeometry: null, shouldAnalyze: false });
    }
  }, [route?.params?.editedGeometry]);
  const [firstRunStep, setFirstRunStep] = useState(0);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [userSettings, setUserSettings] = useState({});
  const [isQuickExporting, setIsQuickExporting] = useState(false);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [performanceInitialized, setPerformanceInitialized] = useState(false);

  // Tutorial system
  const tutorial = useTutorial('basic_usage', {
    hasResults: analysisResults.length > 0,
    hasProject: !!currentProject,
    hasGeometry: !!geometry.trim()
  });
  

  // Refs for tutorial targets
  const appHeaderRef = useRef(null);
  const scrollViewRef = useRef(null);
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

  // Theme change listener
  useEffect(() => {
    const handleThemeChange = (newTheme) => {
      setCurrentTheme(newTheme);
    };

    themeService.addThemeChangeListener(handleThemeChange);
    
    return () => {
      themeService.removeThemeChangeListener(handleThemeChange);
    };
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

  // Handle data from other screens
  useEffect(() => {
    if (route?.params?.recommendation) {
      const { recommendation } = route.params;
      if (recommendation.geometry) {
        setGeometry(recommendation.geometry);
        setCurrentProject({
          id: `ai_${Date.now()}`,
          name: recommendation.name,
          geometry: recommendation.geometry,
          source: 'ai_recommendation',
          createdAt: new Date().toISOString()
        });
        
        // Auto-analyze the new geometry
        if (recommendation.geometry.trim()) {
          setTimeout(() => {
            handleAnalyze();
          }, 500);
        }
      }
    }
  }, [route?.params]);

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
        case 'trombetas':
          await audioEngine.playTrombetas(data, 800, 0.4);
          break;
        case 'harmonics_sequence':
          // Tocar harmônicos em sequência com pause entre cada um
          await audioEngine.playHarmonicsSequence(data, 1000, 0.5);
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

  const handleQuickExport = async (format) => {
    if (!currentProject || analysisResults.length === 0) {
      Alert.alert('Erro', 'Nenhum projeto ou resultado disponível para exportação');
      return;
    }

    setIsQuickExporting(true);
    
    try {
      const { ExportManager } = await import('../services/export/ExportManager');
      
      const project = {
        ...currentProject,
        results: analysisResults,
        metadata: metadata
      };

      let result;
      switch (format) {
        case 'pdf':
        case 'html':
        case 'png':
          result = await ExportManager.exportToPDF(project, {
            includeGeometry: true,
            includeAnalysis: true,
            includeVisualization: false, // Skip SVG for quick export
            includeNotes: true,
            template: 'professional',
            format: format
          });
          break;
        default:
          throw new Error('Formato não suportado');
      }

      if (result.success) {
        const formatNames = {
          pdf: 'PDF',
          html: 'HTML', 
          png: 'PNG'
        };
        
        Alert.alert(
          'Exportação Concluída!',
          `Arquivo ${formatNames[format]} baixado com sucesso:\n${result.filename}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Quick export error:', error);
      Alert.alert(
        'Erro na Exportação',
        error.message || 'Ocorreu um erro durante a exportação rápida.'
      );
    } finally {
      setIsQuickExporting(false);
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
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      {/* <FloatingTipManager category="general"> */}
        <OptimizedScrollView
          ref={scrollViewRef}
          style={[styles.container, { backgroundColor: colors.background }]}
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
            onNewProject={() => {
              // Auto-scroll to geometry input after example selection
              setTimeout(() => {
                geometryInputRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
                  if (pageY) {
                    scrollViewRef.current?.scrollTo?.({ y: pageY - 100, animated: true });
                  }
                });
              }, 300);
            }}
          />
        </View>

        <View ref={unitSelectorRef}>
          <UnitSelector
            currentUnit={currentUnit}
            onUnitChange={onUnitChange}
            disabled={isAnalyzing}
          />
        </View>

        <TuningSelector
          onTuningChange={(tuning) => {
            console.log('Tuning changed to:', tuning.name);
            // Force re-analysis when tuning changes if there are results
            if (analysisResults.length > 0) {
              handleAnalyze();
            }
          }}
        />
        
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
        visualizationZoom={visualizationZoom}
        setVisualizationZoom={setVisualizationZoom}
        visualizationMode={visualizationMode}
        setVisualizationMode={setVisualizationMode}
        panOffset={panOffset}
        setPanOffset={setPanOffset}
        analysisResults={analysisResults}
      />
      
      <AnalysisResults 
        results={analysisResults}
        isVisible={showResults}
        onPlaySound={handlePlaySound}
        metadata={analysisMetadata}
      />

      {/* Project Management Section */}
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
            <View style={styles.exportContainer}>
              <TouchableOpacity
                ref={exportButtonRef}
                style={styles.exportButton}
                onPress={() => setShowAdvancedExport(true)}
              >
                <Text style={styles.exportButtonText}>📤 Exportar Completo</Text>
              </TouchableOpacity>
              
              {/* Quick Export Options */}
              <View style={styles.quickExportContainer}>
                <TouchableOpacity
                  style={styles.quickExportButton}
                  onPress={() => handleQuickExport('pdf')}
                >
                  <Text style={styles.quickExportText}>📄 PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickExportButton}
                  onPress={() => handleQuickExport('png')}
                >
                  <Text style={styles.quickExportText}>🖼️ PNG</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickExportButton}
                  onPress={() => handleQuickExport('html')}
                >
                  <Text style={styles.quickExportText}>🌐 HTML</Text>
                </TouchableOpacity>
              </View>
            </View>
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

      {/* Tutorial System - DESABILITADO PARA APRESENTAÇÃO */}
      {false && (
        <TutorialOverlay
          visible={tutorial.isVisible}
          step={tutorial.currentStep}
          elementBounds={tutorial.elementBounds}
          onNext={tutorial.nextStep}
          onPrevious={tutorial.previousStep}
          onSkip={tutorial.skipTutorial}
          onClose={tutorial.endTutorial}
        />
      )}


      {/* First Run Tutorial - DESABILITADO PARA APRESENTAÇÃO */}
      {false && (
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
      )}

      {/* Removed modal components - now using navigation */}
      </OptimizedScrollView>
      {/* </FloatingTipManager> */}
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
    paddingBottom: spacing.xxl + 60, // Extra padding for tab bar
  },
  
  // Visualization styles
  visualizationContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  visualizationTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  svgContainerWrapper: {
    marginBottom: spacing.md,
    marginHorizontal: 2, // Minimal side margins for full width
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center', // Center the content
    justifyContent: 'center', // Center vertically
  },
  svgScrollContainer: {
    maxHeight: deviceInfo.isTablet ? 600 : 500, // Increased height limit
    minHeight: deviceInfo.isTablet ? 300 : 250, // Minimum height
  },
  svgContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: spacing.sm,
  },
  controlsLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  controlsCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  webInstructions: {
    fontSize: typography.caption,
    color: '#64748B',
    fontWeight: '500',
  },
  modeText: {
    fontSize: typography.caption,
    color: '#374151',
    fontWeight: '600',
  },
  zoomButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  resetButton: {
    backgroundColor: '#10B981',
  },
  zoomButtonText: {
    fontSize: typography.small,
    color: '#374151',
    fontWeight: '600',
  },
  zoomIndicator: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  zoomText: {
    fontSize: typography.small,
    color: '#374151',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modeToggle: {
    marginBottom: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modeLabel: {
    fontSize: typography.small,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: '#10B981',
  },
  modeButtonText: {
    fontSize: typography.small,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  modeButtonDesc: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
  },
  resetPanButton: {
    position: 'absolute',
    top: -40, // Moved up above the SVG container  
    right: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderRadius: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    zIndex: 10,
  },
  resetPanButtonText: {
    fontSize: typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
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
  
  // Legend styles
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendText: {
    fontSize: typography.caption,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  
  // Excavation data table styles
  excavationDataContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 400,
  },
  excavationDataTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  excavationDataSubtitle: {
    fontSize: typography.small,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  excavationTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  excavationTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingVertical: spacing.sm,
  },
  excavationHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.small,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: spacing.xs,
  },
  excavationTableScrollView: {
    maxHeight: 200,
  },
  excavationTableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  excavationTableRowFirst: {
    backgroundColor: '#F0F9FF',
  },
  excavationTableRowLast: {
    backgroundColor: '#FEF2F2',
  },
  excavationDataCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.small,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: spacing.xs,
  },
  excavationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  excavationTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  excavationTip: {
    fontSize: typography.caption,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  excavationTipBold: {
    fontWeight: '700',
    color: '#10B981',
  },
  visualizationHint: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingsRow: {
    flexDirection: deviceInfo.isTablet ? 'row' : 'column',
    gap: spacing.md,
    alignItems: deviceInfo.isTablet ? 'flex-start' : 'stretch',
  },
  themeToggle: {
    alignSelf: deviceInfo.isTablet ? 'flex-start' : 'center',
    marginTop: deviceInfo.isTablet ? spacing.lg : 0,
  },
  technicalLegend: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#374151',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  legendSubtitle: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fixedLegend: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    zIndex: 10, // Always on top
  },
  fixedLegendTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#374151',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  fixedLegendSubtitle: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  legendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendStatText: {
    fontSize: typography.caption,
    color: '#6B7280',
    fontWeight: '600',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendText: {
    fontSize: typography.caption,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  
  // Measurement legend styles
  measurementLegend: {
    backgroundColor: '#FAFBFC',
    borderRadius: 6,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  measurementLegendTitle: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  measurementLegendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  measurementLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flex: 1,
    minWidth: '30%',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  measurementLegendText: {
    fontSize: typography.caption,
    color: '#4B5563',
    fontWeight: '500',
  },
  measurementLegendNote: {
    fontSize: typography.caption,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  
  // Analysis results styles
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    fontSize: typography.h3,
    fontWeight: '900',
    color: '#10B981',
  },
  droneNote: {
    fontSize: typography.body,
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
    fontSize: typography.body,
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  harmonicsSubtitle: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
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
    borderRadius: 12,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 75,
  },
  droneButton: {
    backgroundColor: '#059669',
  },
  trombetasButton: {
    backgroundColor: '#DC2626',
  },
  exploreButton: {
    backgroundColor: '#3B82F6',
  },
  playingButton: {
    backgroundColor: '#059669',
    opacity: 0.8,
  },
  soundPreviewText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  frequencyText: {
    fontSize: typography.caption,
    fontWeight: '500',
    opacity: 0.9,
  },
  notesText: {
    fontSize: typography.caption,
    fontWeight: '500',
    opacity: 0.9,
    maxWidth: '100%',
  },
  
  // Trombetas-only visualization styles
  trombetasOnlyContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  trombetasTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  trombetasSubtitle: {
    fontSize: typography.small,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  trombetasSequence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  trombetaNote: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  trombetaNoteNumber: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: spacing.xs,
  },
  trombetaNoteValue: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: spacing.xs,
  },
  trombetaFrequency: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: '#B91C1C',
    fontFamily: 'monospace',
  },
  backToDroneButton: {
    backgroundColor: '#059669',
    marginTop: spacing.sm,
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
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  fundamentalRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
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
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    paddingHorizontal: 2,
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
    width: '32%',
    marginBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // New Analysis Summary Styles
  analysisSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: typography.caption,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: typography.body,
    color: '#1F2937',
    fontWeight: '700',
    textAlign: 'center',
  },
  summarySubvalue: {
    fontSize: typography.caption,
    color: '#9CA3AF',
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Project management styles
  saveProjectContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  saveProjectButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: scale(52),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveProjectText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
  manageProjectsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: scale(52),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  manageProjectsText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
  exportContainer: {
    marginVertical: spacing.sm,
  },
  exportButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: scale(52),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  quickExportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickExportButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickExportText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: typography.h3,
    fontWeight: '600',
    color: '#374151',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalSubtitle: {
    fontSize: typography.body,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  harmonicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  harmonicCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fundamentalCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  harmonicCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  harmonicNumber: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  harmonicNote: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
  },
  harmonicFreq: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#059669',
    marginBottom: spacing.xs,
  },
  harmonicCents: {
    fontSize: typography.caption,
    color: '#6B7280',
    marginBottom: spacing.sm,
  },
  amplitudeBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  amplitudeFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  modalActions: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalActionButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sequenceButton: {
    backgroundColor: '#DC2626',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },
});