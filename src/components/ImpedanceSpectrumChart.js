/**
 * ImpedanceSpectrumChart Component
 *
 * Visualiza o espectro completo de impedância calculado pelo Transfer Matrix Method
 * Mostra picos de ressonância e permite interação (zoom, pan, tooltip)
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import { Svg, Path, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { themeService } from '../services/theme/ThemeService';

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

export const ImpedanceSpectrumChart = ({
  impedanceSpectrum = null,
  resonances = [],
  visible = true,
  onClose = null
}) => {
  const [currentTheme] = useState(themeService.getCurrentTheme());
  const [selectedPeak, setSelectedPeak] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const colors = currentTheme.colors;

  // Se não houver dados, não renderiza
  if (!visible || !impedanceSpectrum || impedanceSpectrum.length === 0) {
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // Margens laterais
  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  /**
   * Processa dados do espectro para visualização
   */
  const processedData = useMemo(() => {
    if (!impedanceSpectrum || impedanceSpectrum.length === 0) return null;

    const frequencies = impedanceSpectrum.map(point => point.frequency);
    const magnitudes = impedanceSpectrum.map(point => point.magnitude);

    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const minMag = Math.min(...magnitudes);
    const maxMag = Math.max(...magnitudes);

    // Normalizar dados para coordenadas do gráfico
    const points = impedanceSpectrum.map(point => {
      const x = ((point.frequency - minFreq) / (maxFreq - minFreq)) * innerWidth;
      const y = innerHeight - ((point.magnitude - minMag) / (maxMag - minMag)) * innerHeight;

      return { x, y, frequency: point.frequency, magnitude: point.magnitude };
    });

    return {
      points,
      minFreq,
      maxFreq,
      minMag,
      maxMag,
      frequencies,
      magnitudes
    };
  }, [impedanceSpectrum, innerWidth, innerHeight]);

  /**
   * Gera path SVG para a curva do espectro
   */
  const spectrumPath = useMemo(() => {
    if (!processedData) return '';

    const { points } = processedData;

    let path = `M ${CHART_PADDING.left + points[0].x} ${CHART_PADDING.top + points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      path += ` L ${CHART_PADDING.left + points[i].x} ${CHART_PADDING.top + points[i].y}`;
    }

    return path;
  }, [processedData]);

  /**
   * Posiciona marcadores de ressonância no gráfico
   */
  const resonanceMarkers = useMemo(() => {
    if (!processedData || !resonances || resonances.length === 0) return [];

    const { minFreq, maxFreq, minMag, maxMag } = processedData;

    return resonances.map((res, index) => {
      // Encontrar ponto correspondente no espectro
      const point = impedanceSpectrum.find(p =>
        Math.abs(p.frequency - res.frequency) < 1.0
      );

      if (!point) return null;

      const x = ((res.frequency - minFreq) / (maxFreq - minFreq)) * innerWidth;
      const y = innerHeight - ((point.magnitude - minMag) / (maxMag - minMag)) * innerHeight;

      return {
        x: CHART_PADDING.left + x,
        y: CHART_PADDING.top + y,
        frequency: res.frequency,
        note: res.note,
        octave: res.octave,
        harmonic: res.harmonic,
        quality: res.quality,
        amplitude: res.amplitude
      };
    }).filter(Boolean);
  }, [processedData, resonances, impedanceSpectrum, innerWidth, innerHeight]);

  /**
   * Gera linhas de grade
   */
  const gridLines = useMemo(() => {
    if (!showGrid || !processedData) return { horizontal: [], vertical: [] };

    const horizontal = [];
    const vertical = [];

    // Linhas horizontais (magnitude)
    const numHorizontalLines = 5;
    for (let i = 0; i <= numHorizontalLines; i++) {
      const y = CHART_PADDING.top + (innerHeight / numHorizontalLines) * i;
      horizontal.push({
        key: `h-${i}`,
        y,
        value: processedData.maxMag - (processedData.maxMag - processedData.minMag) * (i / numHorizontalLines)
      });
    }

    // Linhas verticais (frequência)
    const numVerticalLines = 6;
    for (let i = 0; i <= numVerticalLines; i++) {
      const x = CHART_PADDING.left + (innerWidth / numVerticalLines) * i;
      vertical.push({
        key: `v-${i}`,
        x,
        value: processedData.minFreq + (processedData.maxFreq - processedData.minFreq) * (i / numVerticalLines)
      });
    }

    return { horizontal, vertical };
  }, [showGrid, processedData, innerWidth, innerHeight]);

  /**
   * Formata valores para exibição
   */
  const formatFrequency = (freq) => {
    return freq < 100 ? freq.toFixed(1) : Math.round(freq);
  };

  const formatMagnitude = (mag) => {
    return mag.toExponential(1);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>
            Espectro de Impedância
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transfer Matrix Method
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => setShowGrid(!showGrid)}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {showGrid ? '⊞' : '⊟'}
            </Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
              onPress={onClose}
            >
              <Text style={{ color: colors.text, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            {/* Grade */}
            {showGrid && (
              <G>
                {/* Linhas horizontais */}
                {gridLines.horizontal.map(line => (
                  <G key={line.key}>
                    <Line
                      x1={CHART_PADDING.left}
                      y1={line.y}
                      x2={chartWidth - CHART_PADDING.right}
                      y2={line.y}
                      stroke={colors.border}
                      strokeWidth="0.5"
                      strokeDasharray="3,3"
                    />
                    <SvgText
                      x={CHART_PADDING.left - 5}
                      y={line.y + 4}
                      fontSize="10"
                      fill={colors.textSecondary}
                      textAnchor="end"
                    >
                      {formatMagnitude(line.value)}
                    </SvgText>
                  </G>
                ))}

                {/* Linhas verticais */}
                {gridLines.vertical.map(line => (
                  <G key={line.key}>
                    <Line
                      x1={line.x}
                      y1={CHART_PADDING.top}
                      x2={line.x}
                      y2={CHART_HEIGHT - CHART_PADDING.bottom}
                      stroke={colors.border}
                      strokeWidth="0.5"
                      strokeDasharray="3,3"
                    />
                    <SvgText
                      x={line.x}
                      y={CHART_HEIGHT - CHART_PADDING.bottom + 15}
                      fontSize="10"
                      fill={colors.textSecondary}
                      textAnchor="middle"
                    >
                      {formatFrequency(line.value)}
                    </SvgText>
                  </G>
                ))}
              </G>
            )}

            {/* Eixos */}
            <Line
              x1={CHART_PADDING.left}
              y1={CHART_HEIGHT - CHART_PADDING.bottom}
              x2={chartWidth - CHART_PADDING.right}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              stroke={colors.text}
              strokeWidth="2"
            />
            <Line
              x1={CHART_PADDING.left}
              y1={CHART_PADDING.top}
              x2={CHART_PADDING.left}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              stroke={colors.text}
              strokeWidth="2"
            />

            {/* Curva do espectro */}
            <Path
              d={spectrumPath}
              stroke={colors.primary}
              strokeWidth="2"
              fill="none"
            />

            {/* Marcadores de ressonância */}
            {resonanceMarkers.map((marker, index) => {
              const isSelected = selectedPeak === index;
              const qualityColor = marker.quality > 0.7
                ? '#4CAF50'
                : marker.quality > 0.4
                ? '#FF9800'
                : '#F44336';

              return (
                <G key={`resonance-${index}`}>
                  {/* Linha vertical até o eixo */}
                  <Line
                    x1={marker.x}
                    y1={marker.y}
                    x2={marker.x}
                    y2={CHART_HEIGHT - CHART_PADDING.bottom}
                    stroke={qualityColor}
                    strokeWidth="1"
                    strokeDasharray="4,2"
                    opacity="0.5"
                  />

                  {/* Círculo no pico */}
                  <Circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelected ? 8 : 6}
                    fill={qualityColor}
                    stroke={colors.background}
                    strokeWidth="2"
                    onPress={() => setSelectedPeak(isSelected ? null : index)}
                  />

                  {/* Label do harmônico */}
                  <SvgText
                    x={marker.x}
                    y={marker.y - 15}
                    fontSize="12"
                    fill={qualityColor}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    H{marker.harmonic}
                  </SvgText>
                </G>
              );
            })}

            {/* Labels dos eixos */}
            <SvgText
              x={chartWidth / 2}
              y={CHART_HEIGHT - 5}
              fontSize="12"
              fill={colors.text}
              textAnchor="middle"
              fontWeight="bold"
            >
              Frequência (Hz)
            </SvgText>

            <SvgText
              x={15}
              y={CHART_HEIGHT / 2}
              fontSize="12"
              fill={colors.text}
              textAnchor="middle"
              fontWeight="bold"
              transform={`rotate(-90, 15, ${CHART_HEIGHT / 2})`}
            >
              Impedância (Pa·s/m³)
            </SvgText>
          </Svg>
        </View>
      </ScrollView>

      {/* Tooltip para pico selecionado */}
      {selectedPeak !== null && resonanceMarkers[selectedPeak] && (
        <View style={[styles.tooltip, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
              Harmônico:
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              H{resonanceMarkers[selectedPeak].harmonic}
            </Text>
          </View>

          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
              Frequência:
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              {resonanceMarkers[selectedPeak].frequency.toFixed(2)} Hz
            </Text>
          </View>

          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
              Nota:
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              {resonanceMarkers[selectedPeak].note}{resonanceMarkers[selectedPeak].octave}
            </Text>
          </View>

          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
              Qualidade:
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              {(resonanceMarkers[selectedPeak].quality * 100).toFixed(0)}%
            </Text>
          </View>

          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
              Amplitude:
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              {(resonanceMarkers[selectedPeak].amplitude * 100).toFixed(0)}%
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.closeTooltip, { backgroundColor: colors.primary }]}
            onPress={() => setSelectedPeak(null)}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Ótima qualidade (&gt;70%)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Boa qualidade (40-70%)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Baixa qualidade (&lt;40%)
          </Text>
        </View>
      </View>

      {/* Info sobre dados */}
      {processedData && (
        <View style={[styles.infoBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            📊 {impedanceSpectrum.length} pontos analisados • {resonances.length} ressonâncias detectadas
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            🔬 Faixa: {processedData.minFreq.toFixed(0)}-{processedData.maxFreq.toFixed(0)} Hz
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    marginVertical: 10,
  },
  tooltip: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  tooltipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeTooltip: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 11,
  },
  infoBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 11,
    marginBottom: 3,
  },
});
