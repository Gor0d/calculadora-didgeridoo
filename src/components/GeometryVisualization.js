import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';

export default function GeometryVisualization({ geometry, width = 300, height = 200 }) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  const parseGeometry = () => {
    if (!geometry) return [];
    
    const lines = geometry.split('\n').filter(line => line.trim());
    const points = [];
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const position = parseFloat(parts[0]) * 1000; // Convert to mm
        const diameter = parseFloat(parts[1]) * 1000; // Convert to mm
        if (!isNaN(position) && !isNaN(diameter)) {
          points.push({ position, diameter });
        }
      }
    });
    
    return points;
  };

  const points = parseGeometry();
  
  if (!points || points.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>📐 Adicione pelo menos 2 pontos de geometria</Text>
      </View>
    );
  }

  // Calculate bounds with safety checks
  const validPoints = points.filter(p => p && typeof p.position === 'number' && typeof p.diameter === 'number');
  
  if (validPoints.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>📐 Dados de geometria inválidos</Text>
      </View>
    );
  }

  const maxPosition = Math.max(...validPoints.map(p => p.position));
  const maxDiameter = Math.max(...validPoints.map(p => p.diameter));
  const minDiameter = Math.min(...validPoints.map(p => p.diameter));
  
  // SVG dimensions with padding
  const padding = 40;
  const svgWidth = width;
  const svgHeight = height;
  const plotWidth = svgWidth - 2 * padding;
  const plotHeight = svgHeight - 2 * padding;
  
  // Scale factors
  const xScale = plotWidth / maxPosition;
  const yScale = plotHeight / (maxDiameter - minDiameter);
  const centerY = svgHeight / 2;

  // Generate path data for the bore profile
  const generatePath = () => {
    let pathData = '';
    
    validPoints.forEach((point, index) => {
      const x = padding + point.position * xScale * scale + translateX;
      const yTop = centerY - (point.diameter / 2) * yScale * scale + translateY;
      const yBottom = centerY + (point.diameter / 2) * yScale * scale + translateY;
      
      if (index === 0) {
        pathData += `M ${x} ${yTop} `;
      } else {
        pathData += `L ${x} ${yTop} `;
      }
    });
    
    // Complete the path by going back along the bottom
    for (let i = validPoints.length - 1; i >= 0; i--) {
      const point = validPoints[i];
      const x = padding + point.position * xScale * scale + translateX;
      const yBottom = centerY + (point.diameter / 2) * yScale * scale + translateY;
      pathData += `L ${x} ${yBottom} `;
    }
    
    pathData += 'Z';
    return pathData;
  };

  const generateGridLines = () => {
    const lines = [];
    const gridSpacing = 50; // mm
    
    if (!showGrid) return lines;
    
    // Vertical grid lines (position)
    for (let pos = 0; pos <= maxPosition; pos += gridSpacing) {
      const x = padding + pos * xScale * scale + translateX;
      if (x >= 0 && x <= svgWidth) {
        lines.push(
          <Line
            key={`v-${pos}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={svgHeight - padding}
            stroke="#e0e0e0"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        );
      }
    }
    
    // Horizontal grid lines (diameter)
    const diameterStep = 10; // mm
    for (let d = Math.floor(minDiameter / diameterStep) * diameterStep; d <= maxDiameter; d += diameterStep) {
      const y = centerY - (d - minDiameter) * yScale * scale + translateY;
      if (y >= padding && y <= svgHeight - padding) {
        lines.push(
          <Line
            key={`h-${d}`}
            x1={padding}
            y1={y}
            x2={svgWidth - padding}
            y2={y}
            stroke="#e0e0e0"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        );
      }
    }
    
    return lines;
  };

  const generateMeasurements = () => {
    if (!showMeasurements) return [];
    
    return validPoints.map((point, index) => {
      const x = padding + point.position * xScale * scale + translateX;
      const y = centerY + (point.diameter / 2) * yScale * scale + translateY + 15;
      
      return (
        <G key={`measure-${index}`}>
          <Circle
            cx={x}
            cy={centerY + translateY}
            r="2"
            fill="#e74c3c"
          />
          <SvgText
            x={x}
            y={y}
            fontSize="10"
            textAnchor="middle"
            fill="#666"
          >
            {(point.position / 1000).toFixed(2)}m
          </SvgText>
        </G>
      );
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // Para implementação futura com gestos
  // const onPanGestureEvent = (event) => {
  //   const { translationX, translationY, state } = event.nativeEvent;
  //   if (state === State.ACTIVE) {
  //     setTranslateX(translationX);
  //     setTranslateY(translationY);
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleZoomIn}>
            <Text style={styles.controlText}>🔍+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handleZoomOut}>
            <Text style={styles.controlText}>🔍-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handleReset}>
            <Text style={styles.controlText}>↺</Text>
          </TouchableOpacity>
          <Text style={styles.scaleText}>Zoom: {(scale * 100).toFixed(0)}%</Text>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity 
            style={[styles.toggleBtn, showGrid && styles.toggleActive]} 
            onPress={() => setShowGrid(!showGrid)}
          >
            <Text style={styles.toggleText}>📐 Grade</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, showMeasurements && styles.toggleActive]} 
            onPress={() => setShowMeasurements(!showMeasurements)}
          >
            <Text style={styles.toggleText}>📏 Medidas</Text>
          </TouchableOpacity>
        </View>

        {/* Pan Controls */}
        <View style={styles.panControls}>
          <View style={styles.panRow}>
            <TouchableOpacity 
              style={styles.panBtn} 
              onPress={() => setTranslateY(prev => prev - 20)}
            >
              <Text style={styles.panText}>↑</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.panRow}>
            <TouchableOpacity 
              style={styles.panBtn} 
              onPress={() => setTranslateX(prev => prev - 20)}
            >
              <Text style={styles.panText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.panBtn} 
              onPress={() => {setTranslateX(0); setTranslateY(0);}}
            >
              <Text style={styles.panText}>⊙</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.panBtn} 
              onPress={() => setTranslateX(prev => prev + 20)}
            >
              <Text style={styles.panText}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.panRow}>
            <TouchableOpacity 
              style={styles.panBtn} 
              onPress={() => setTranslateY(prev => prev + 20)}
            >
              <Text style={styles.panText}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* SVG Visualization */}
      <View style={styles.svgContainer}>
        <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
          {/* Grid */}
          {generateGridLines()}
          
          {/* Center line */}
          <Line
            x1={padding}
            y1={centerY + translateY}
            x2={svgWidth - padding}
            y2={centerY + translateY}
            stroke="#ccc"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Bore profile */}
          <Path
            d={generatePath()}
            fill="rgba(103, 126, 234, 0.3)"
            stroke="#667eea"
            strokeWidth="2"
          />
          
          {/* Measurements */}
          {generateMeasurements()}
        </Svg>
      </View>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          📏 Comprimento: {(maxPosition / 1000).toFixed(2)}m
        </Text>
        <Text style={styles.infoText}>
          📐 Diâmetro: {(minDiameter).toFixed(0)}mm - {(maxDiameter).toFixed(0)}mm
        </Text>
        <Text style={styles.infoText}>
          🎯 Pontos: {validPoints.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  controls: {
    marginBottom: 15,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  controlBtn: {
    backgroundColor: '#667eea',
    padding: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scaleText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  toggleBtn: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  toggleActive: {
    backgroundColor: '#28a745',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  panControls: {
    alignItems: 'center',
    marginTop: 10,
  },
  panRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panBtn: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  panText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  svgContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  svg: {
    borderRadius: 8,
  },
  infoPanel: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});