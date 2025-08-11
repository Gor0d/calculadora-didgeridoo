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
  Animated
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
const GeometryVisualization = React.memo(({ geometry, isVisible, currentUnit = 'metric', visualizationZoom = 1.0, setVisualizationZoom, visualizationMode = 'technical', setVisualizationMode, panOffset, setPanOffset }) => {
  // Skip rendering if not visible
  if (!isVisible) {
    return null;
  }
  
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

  const { svgDimensions, pathData, scaleMarks } = useMemo(() => {
    if (!geometry || !geometry.trim() || points.length < 2) {
      return { svgDimensions: null, pathData: null, scaleMarks: [] };
    }

    // Validate points data to prevent NaN calculations
    const validPoints = points.filter(p => 
      p && typeof p.position === 'number' && typeof p.diameter === 'number' &&
      !isNaN(p.position) && !isNaN(p.diameter) && p.diameter > 0 && p.position >= 0
    );

    if (validPoints.length < 2) {
      return { svgDimensions: null, pathData: null, scaleMarks: [] };
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
    
    // Calculate dimensions based on visualization mode
    const realAspectRatio = maxPosition / (maxDiameter / 10); // Convert mm to cm for true ratio
    const svgWidth = Math.min(safeScreenWidth - safeSpacingXL, deviceInfo.isTablet ? 700 : 380);
    const margin = safeSpacingMD;
    
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
      // Modo Técnico: comprimento real + diâmetro amplificado para visibilidade
      const technicalAspectRatio = Math.max(8, Math.min(realAspectRatio / 3, 15)); // Reduce ratio for visibility
      const idealHeight = svgWidth / technicalAspectRatio;
      svgHeight = Math.max(idealHeight, deviceInfo.isTablet ? scale(100) : scale(80)); // Taller for detail
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
      return { svgDimensions: null, pathData: null, scaleMarks: [] };
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

    // Generate scale marks with zoom-aware spacing to prevent overlap
    const scaleMarks = [];
    const baseScaleStep = maxPosition > 100 ? 20 : maxPosition > 50 ? 10 : 5;
    // Adjust label density based on zoom to prevent text overlap
    const zoomAdjustedStep = baseScaleStep * Math.max(1, visualizationZoom / 2);
    const actualStep = Math.ceil(zoomAdjustedStep / baseScaleStep) * baseScaleStep; // Round to nice numbers
    
    for (let pos = 0; pos <= maxPosition; pos += actualStep) {
      const x = margin + pos * scaleX;
      scaleMarks.push({
        x,
        position: pos,
        isMajor: pos % (actualStep * 2) === 0
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
      scaleMarks
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

      {/* Interactive container with horizontal ScrollView */}
      <View style={styles.svgContainerWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            minWidth: Math.max(svgDimensions.svgWidth * visualizationZoom + spacing.md * 2, SCREEN_WIDTH),
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
            width: Math.max(svgDimensions.svgWidth * visualizationZoom + spacing.md * 2, SCREEN_WIDTH),
            transform: [
              { translateX: animatedPan.x },
              { translateY: animatedPan.y },
            ],
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
              
              {/* Scale labels */}
              {mark.isMajor && (
                <SvgText
                  x={mark.x}
                  y={svgDimensions.svgHeight - svgDimensions.margin + 12}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {mark.position}
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
          
          {/* Technical bore profile - simple and clean */}
          <Path
            d={pathData}
            fill="none"
            stroke="#1F2937"
            strokeWidth="1.5"
          />
          
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
      
      <View style={styles.technicalLegend}>
        <Text style={styles.legendTitle}>📐 Vista Técnica - Perfil do Bore Interno</Text>
        <Text style={styles.legendSubtitle}>
          Comprimento: {svgDimensions.maxPosition.toFixed(1)}cm | 
          Bore: ⌀{svgDimensions.minDiameter.toFixed(0)}-{svgDimensions.maxDiameter.toFixed(0)}mm
        </Text>
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
          <Text style={styles.harmonicsTitle}>📊 Análise Profissional de Harmônicos</Text>
          <Text style={styles.harmonicsSubtitle}>Baseada em cálculos acústicos avançados para didgeridoo</Text>
          
          {/* Table Header */}
          <View style={styles.analysisTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>H#</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.4 }]}>Freq (Hz)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Nota</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>Oct</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Cents</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.9 }]}>Ampl</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.4 }]}>Razão</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Status</Text>
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
                  <Text style={[styles.tableCellText, { flex: 0.6, fontWeight: 'bold', color: index === 0 ? '#10B981' : '#374151' }]}>
                    {index === 0 ? 'F0' : `H${index}`}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.4, fontFamily: 'monospace' }]}>
                    {result.frequency.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.0, fontWeight: '600' }]}>
                    {result.note || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 0.7 }]}>
                    {result.octave || '-'}
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
                  <Text style={[styles.tableCellText, { flex: 0.9, fontFamily: 'monospace' }]}>
                    {((result.amplitude || 0) * 100).toFixed(0)}%
                  </Text>
                  <Text style={[styles.tableCellText, { 
                    flex: 1.4, 
                    fontFamily: 'monospace',
                    color: inharmonicity < 0.1 ? '#10B981' : inharmonicity < 0.3 ? '#F59E0B' : '#EF4444'
                  }]}>
                    {harmonicRatio.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.0, fontSize: 11 }]}>
                    {statusIcon} {statusText}
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
                <Text style={styles.summaryValue}>{results[0]?.note}{results[0]?.octave}</Text>
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
                  <Text style={styles.metadataLabel}>Diâmetro Médio</Text>
                  <Text style={styles.metadataValue}>{(metadata.averageRadius * 2).toFixed(1)} mm</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Volume Interno</Text>
                  <Text style={styles.metadataValue}>{(metadata.volume / 1000).toFixed(2)} L</Text>
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
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Método de Cálculo</Text>
                  <Text style={styles.metadataValue}>
                    {metadata.calculationMethod === 'online_advanced' ? '🟢 Avançado' : 
                     metadata.calculationMethod === 'simplified_fallback' ? '🟡 Simplificado' : '🔴 Básico'}
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Correções Aplicadas</Text>
                  <Text style={styles.metadataValue}>Extremidade + Boca</Text>
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
export const SimpleHomeScreen = ({ navigation, route, currentUnit, onUnitChange, currentLanguage, onLanguageChange }) => {
  const [geometry, setGeometry] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
  const [firstRunStep, setFirstRunStep] = useState(0);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [userSettings, setUserSettings] = useState({});
  const [shouldShowTips, setShouldShowTips] = useState(false);
  const [isQuickExporting, setIsQuickExporting] = useState(false);
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
    <View style={styles.safeContainer}>
      {/* <FloatingTipManager category="general"> */}
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
        visualizationZoom={visualizationZoom}
        setVisualizationZoom={setVisualizationZoom}
        visualizationMode={visualizationMode}
        setVisualizationMode={setVisualizationMode}
        panOffset={panOffset}
        setPanOffset={setPanOffset}
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

          {/* Feature Buttons Row */}
          <View style={styles.newFeaturesContainer}>
            <TouchableOpacity
              style={[styles.featureButton, styles.disabledFeatureButton]}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  '🎨 Visualização 3D',
                  'Esta funcionalidade estará disponível em breve!\n\n• Visualização 3D interativa\n• Análise visual de ondas sonoras\n• Simulação de ressonância\n• Controles de ângulo e zoom',
                  [{ text: 'OK', style: 'default' }]
                );
              }}
            >
              <Text style={styles.featureButtonText}>🔒 3D</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.featureButton, styles.disabledFeatureButton]}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  '🤖 Recomendações de IA',
                  'Esta funcionalidade estará disponível em breve!\n\n• Chat inteligente com IA\n• Análise de áudio gravado\n• Sugestões personalizadas\n• Recomendações por tom',
                  [{ text: 'OK', style: 'default' }]
                );
              }}
            >
              <Text style={styles.featureButtonText}>🔒 IA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.featureButton}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Tips Settings button pressed');
                navigation.navigate('TipsSettings');
              }}
            >
              <Text style={styles.featureButtonText}>⚙️ Dicas</Text>
            </TouchableOpacity>

            {/* Daily Tip Button - Only if enabled */}
            {shouldShowTips && (
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => {
                  if (tips.currentTip) {
                    tips.clearTip();
                  } else {
                    tips.getTip();
                  }
                }}
              >
                <Text style={styles.featureButtonText}>
                  {tips.currentTip ? '❌' : '💡'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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

      {/* Dica do Dia - Apenas se usuário habilitou */}
      {shouldShowTips && (
        <DailyTipCard
          visible={!!tips.currentTip}
          tip={tips.currentTip}
          onClose={tips.clearTip}
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

      {/* Removed modal components - now using navigation */}
      </OptimizedScrollView>
      {/* </FloatingTipManager> */}
    </View>
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
    marginVertical: spacing.sm,
    borderRadius: 12,
    padding: spacing.md,
    paddingTop: spacing.md, // Normal padding
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
  svgContainerWrapper: {
    marginBottom: spacing.md,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  svgScrollContainer: {
    maxHeight: 300, // Limit height for better UX
  },
  svgContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: spacing.xs,
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
  visualizationHint: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
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
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  harmonicsSubtitle: {
    fontSize: typography.small,
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
    fontSize: typography.caption,
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
    width: '48%',
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
    marginVertical: spacing.sm,
    gap: spacing.md,
  },
  saveProjectButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: scale(50),
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
    backgroundColor: '#3B82F6',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: scale(50),
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
  exportContainer: {
    marginVertical: spacing.sm,
  },
  exportButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: scale(50),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickExportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickExportButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
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
  newFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  featureButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(48),
    minWidth: scale(48),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  disabledFeatureButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  featureButtonText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
});