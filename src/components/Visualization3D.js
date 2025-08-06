import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert
} from 'react-native';
// import { GLView } from 'expo-gl'; // Disabled for compatibility
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

/**
 * 3D Visualization Component for Acoustic Analysis
 * Uses Three.js with WebGL for real-time 3D rendering
 */
export const Visualization3D = ({ 
  visible, 
  onClose, 
  analysisData,
  geometry 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('frequency'); // 'frequency', 'wave', 'resonance'
  const [isRotating, setIsRotating] = useState(true);
  const glRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Three.js scene when component becomes visible
  useEffect(() => {
    if (visible && !sceneRef.current) {
      initializeScene();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible]);

  const initializeScene = async () => {
    try {
      // Simulated 3D initialization for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize 3D scene:', error);
      setIsLoading(false);
      Alert.alert('Erro 3D', 'Funcionalidade 3D será implementada em breve');
    }
  };

  const setupLighting = (scene, THREE) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Point light for accent
    const pointLight = new THREE.PointLight(0x10b981, 1, 100);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);
  };

  const createVisualization = (scene, THREE) => {
    // Clear existing objects
    while (scene.children.length > 3) { // Keep lights
      scene.remove(scene.children[3]);
    }

    switch (viewMode) {
      case 'frequency':
        createFrequencyVisualization(scene, THREE);
        break;
      case 'wave':
        createWaveVisualization(scene, THREE);
        break;
      case 'resonance':
        createResonanceVisualization(scene, THREE);
        break;
    }
  };

  const createFrequencyVisualization = (scene, THREE) => {
    if (!analysisData?.frequencies) return;

    const frequencies = analysisData.frequencies;
    const fundamental = frequencies.fundamental || 110;
    const harmonics = frequencies.harmonics || [];
    
    // Create frequency bars in 3D space
    const maxHeight = 8;
    const baseRadius = 0.3;
    
    // Fundamental frequency (center, tallest)
    const fundamentalHeight = maxHeight;
    const fundamentalGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.8, fundamentalHeight, 8);
    const fundamentalMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x10b981,
      transparent: true,
      opacity: 0.9,
      shininess: 100
    });
    
    const fundamentalMesh = new THREE.Mesh(fundamentalGeometry, fundamentalMaterial);
    fundamentalMesh.position.set(0, fundamentalHeight / 2, 0);
    fundamentalMesh.castShadow = true;
    fundamentalMesh.receiveShadow = true;
    scene.add(fundamentalMesh);
    
    // Add label
    addTextLabel(scene, THREE, `${fundamental.toFixed(1)} Hz`, { x: 0, y: fundamentalHeight + 1, z: 0 });
    
    // Harmonics (surrounding the fundamental)
    harmonics.slice(0, 8).forEach((harmonic, index) => {
      const angle = (index / harmonics.length) * Math.PI * 2;
      const radius = 4;
      const height = (harmonic / (fundamental * 8)) * maxHeight;
      
      const harmonicGeometry = new THREE.CylinderGeometry(baseRadius * 0.6, baseRadius * 0.4, height, 6);
      const hue = (index / harmonics.length) * 0.8 + 0.1;
      const harmonicMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(hue, 0.7, 0.6),
        transparent: true,
        opacity: 0.8
      });
      
      const harmonicMesh = new THREE.Mesh(harmonicGeometry, harmonicMaterial);
      harmonicMesh.position.set(
        Math.cos(angle) * radius,
        height / 2,
        Math.sin(angle) * radius
      );
      harmonicMesh.castShadow = true;
      harmonicMesh.receiveShadow = true;
      scene.add(harmonicMesh);
      
      // Add harmonic label
      addTextLabel(scene, THREE, `${harmonic.toFixed(0)} Hz`, {
        x: Math.cos(angle) * radius,
        y: height + 0.5,
        z: Math.sin(angle) * radius
      });
    });
    
    // Add base platform
    const platformGeometry = new THREE.CylinderGeometry(6, 6, 0.2, 32);
    const platformMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2a2a3e,
      transparent: true,
      opacity: 0.6
    });
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platformMesh.position.y = -0.1;
    platformMesh.receiveShadow = true;
    scene.add(platformMesh);
  };

  const createWaveVisualization = (scene, THREE) => {
    if (!analysisData?.frequencies) return;

    const fundamental = analysisData.frequencies.fundamental || 110;
    
    // Create 3D wave representation
    const waveGeometry = new THREE.BufferGeometry();
    const wavePoints = [];
    const waveColors = [];
    
    const segments = 200;
    const amplitude = 2;
    const frequency = fundamental / 100;
    
    for (let i = 0; i < segments; i++) {
      const x = (i / segments) * 20 - 10;
      const y = Math.sin(x * frequency) * amplitude;
      const z = Math.cos(x * frequency * 0.5) * amplitude * 0.5;
      
      wavePoints.push(x, y, z);
      
      // Color based on amplitude
      const normalizedAmp = (y + amplitude) / (amplitude * 2);
      waveColors.push(
        0.1 + normalizedAmp * 0.9, // Red
        0.7 + normalizedAmp * 0.3, // Green
        0.5 + normalizedAmp * 0.5  // Blue
      );
    }
    
    waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wavePoints, 3));
    waveGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waveColors, 3));
    
    const waveMaterial = new THREE.LineBasicMaterial({ 
      vertexColors: true,
      linewidth: 3
    });
    
    const waveLine = new THREE.Line(waveGeometry, waveMaterial);
    scene.add(waveLine);
    
    // Add wave surface
    const surfaceGeometry = new THREE.PlaneGeometry(20, 8, 50, 20);
    const surfaceVertices = surfaceGeometry.attributes.position.array;
    
    for (let i = 0; i < surfaceVertices.length; i += 3) {
      const x = surfaceVertices[i];
      const z = surfaceVertices[i + 2];
      surfaceVertices[i + 1] = Math.sin(x * frequency) * amplitude * 0.3 + Math.cos(z * frequency) * amplitude * 0.2;
    }
    
    surfaceGeometry.attributes.position.needsUpdate = true;
    surfaceGeometry.computeVertexNormals();
    
    const surfaceMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      wireframe: true
    });
    
    const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surfaceMesh.rotation.x = -Math.PI / 2;
    surfaceMesh.position.y = -2;
    scene.add(surfaceMesh);
  };

  const createResonanceVisualization = (scene, THREE) => {
    if (!geometry?.length) return;

    const length = geometry.length || 1500;
    const diameters = geometry.diameters || [50, 40, 30, 25];
    
    // Create 3D didgeridoo tube
    const tubePoints = [];
    const segments = diameters.length;
    
    for (let i = 0; i < segments; i++) {
      const z = (i / (segments - 1)) * (length / 100) - (length / 200);
      const radius = diameters[i] / 100;
      tubePoints.push(new THREE.Vector3(0, 0, z));
    }
    
    // Create tube geometry using CatmullRomCurve3
    const curve = new THREE.CatmullRomCurve3(tubePoints);
    
    // Create custom tube geometry with varying radius
    const tubeGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const radialSegments = 12;
    const tubularSegments = segments * 4;
    
    for (let i = 0; i <= tubularSegments; i++) {
      const t = i / tubularSegments;
      const point = curve.getPoint(t);
      
      // Interpolate radius
      const radiusIndex = t * (diameters.length - 1);
      const lowerIndex = Math.floor(radiusIndex);
      const upperIndex = Math.ceil(radiusIndex);
      const factor = radiusIndex - lowerIndex;
      
      const radius = lowerIndex < diameters.length - 1
        ? (diameters[lowerIndex] + (diameters[upperIndex] - diameters[lowerIndex]) * factor) / 100
        : diameters[diameters.length - 1] / 100;
      
      // Create circle of vertices
      for (let j = 0; j <= radialSegments; j++) {
        const angle = (j / radialSegments) * Math.PI * 2;
        const x = point.x + Math.cos(angle) * radius;
        const y = point.y + Math.sin(angle) * radius;
        const z = point.z;
        
        vertices.push(x, y, z);
      }
    }
    
    // Create indices for tube surface
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = a + radialSegments + 1;
        const c = b + 1;
        const d = a + 1;
        
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    
    tubeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    tubeGeometry.setIndex(indices);
    tubeGeometry.computeVertexNormals();
    
    const tubeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8b4513,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tubeMesh.castShadow = true;
    tubeMesh.receiveShadow = true;
    scene.add(tubeMesh);
    
    // Add resonance points
    if (analysisData?.resonanceModes) {
      analysisData.resonanceModes.forEach((mode, index) => {
        const position = (index / analysisData.resonanceModes.length) * (length / 100) - (length / 200);
        const intensity = mode.amplitude || 1;
        
        const sphereGeometry = new THREE.SphereGeometry(0.2 * intensity, 8, 6);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff4444,
          emissive: 0x441111,
          transparent: true,
          opacity: 0.8
        });
        
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(0, 0, position);
        scene.add(sphereMesh);
      });
    }
  };

  const addTextLabel = (scene, THREE, text, position) => {
    // For now, we'll use a simple colored cube as a label placeholder
    // In a full implementation, you'd use THREE.TextGeometry or canvas-based labels
    const labelGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(position.x, position.y, position.z);
    scene.add(labelMesh);
  };

  const startAnimation = (THREE) => {
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
      
      if (isRotating) {
        sceneRef.current.rotation.y += 0.01;
      }
      
      // Animate objects based on view mode
      sceneRef.current.children.forEach((child, index) => {
        if (child.material && child.material.color) {
          // Subtle pulsing effect
          const time = Date.now() * 0.001;
          child.material.opacity = 0.7 + Math.sin(time + index) * 0.2;
        }
      });
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const handleViewModeChange = async (newMode) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    setViewMode(newMode);
    // 3D functionality will be implemented in future update
  };

  const toggleRotation = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    setIsRotating(!isRotating);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#0F1419', '#1a1a2e']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Visualização 3D</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 3D Viewport */}
        <View style={styles.viewport}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando visualização 3D...</Text>
            </View>
          ) : (
            <View style={styles.mockViewport}>
              <Text style={styles.mockTitle}>🎨 Visualização 3D</Text>
              <Text style={styles.mockSubtitle}>Em Breve!</Text>
              <Text style={styles.mockDescription}>
                Esta funcionalidade revolucionária permitirá:
                {'\n'}• Visualização 3D interativa do didgeridoo
                {'\n'}• Análise acústica em tempo real
                {'\n'}• Simulação de ondas sonoras
                {'\n'}• Exploração de geometrias complexas
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.viewModeContainer}>
            <Text style={styles.controlLabel}>Modo de Visualização:</Text>
            <View style={styles.viewModeButtons}>
              {[
                { key: 'frequency', label: '🎵 Frequências', desc: 'Espectro 3D' },
                { key: 'wave', label: '〰️ Ondas', desc: 'Forma de onda' },
                { key: 'resonance', label: '🔊 Ressonância', desc: 'Tubo 3D' }
              ].map((mode) => (
                <TouchableOpacity
                  key={mode.key}
                  style={[
                    styles.modeButton,
                    viewMode === mode.key && styles.modeButtonActive
                  ]}
                  onPress={() => handleViewModeChange(mode.key)}
                >
                  <Text style={[
                    styles.modeButtonText,
                    viewMode === mode.key && styles.modeButtonTextActive
                  ]}>
                    {mode.label}
                  </Text>
                  <Text style={styles.modeButtonDesc}>{mode.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isRotating && styles.actionButtonActive]}
              onPress={toggleRotation}
            >
              <Text style={styles.actionButtonText}>
                {isRotating ? '⏸️ Pausar' : '▶️ Rotacionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: deviceInfo.isIOS ? 50 : 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  viewport: {
    flex: 1,
    margin: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  glView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: typography.body,
  },
  mockViewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  mockTitle: {
    fontSize: typography.h1,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: spacing.md,
  },
  mockSubtitle: {
    fontSize: typography.h3,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  mockDescription: {
    fontSize: typography.body,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    padding: spacing.lg,
  },
  controlLabel: {
    fontSize: typography.small,
    color: '#9CA3AF',
    marginBottom: spacing.sm,
  },
  viewModeContainer: {
    marginBottom: spacing.lg,
  },
  viewModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#10B981',
  },
  modeButtonText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
    marginBottom: 2,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  modeButtonDesc: {
    color: '#9CA3AF',
    fontSize: typography.caption,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonActive: {
    backgroundColor: '#2563EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
});