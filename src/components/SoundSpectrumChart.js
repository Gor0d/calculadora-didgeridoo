/**
 * SoundSpectrumChart Component
 *
 * Visualiza o espectro sonoro (amplitudes relativas dos harmônicos)
 * Mostra barras verticais para cada harmônico detectado
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { Svg, Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { themeService } from '../services/theme/ThemeService';

const CHART_HEIGHT = 250;
const CHART_PADDING = { top: 20, right: 20, bottom: 60, left: 50 };

export const SoundSpectrumChart = ({
  harmonics = [],
  visible = true,
  onClose = null
}) => {
  const [currentTheme] = useState(themeService.getCurrentTheme());
  const [selectedHarmonic, setSelectedHarmonic] = useState(null);
  const colors = currentTheme.colors;

  // Se não houver dados, não renderiza
  if (!visible || !harmonics || harmonics.length === 0) {
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // Margens laterais
  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  /**
   * Processa dados dos harmônicos
   */
  const processedData = useMemo(() => {
    if (!harmonics || harmonics.length === 0) return null;

    const maxAmplitude = Math.max(...harmonics.map(h => h.amplitude || 1));
    const barWidth = innerWidth / (harmonics.length * 1.5); // Espaçamento entre barras

    const bars = harmonics.map((harmonic, index) => {
      const amplitude = harmonic.amplitude || 1;
      const normalizedAmplitude = amplitude / maxAmplitude;
      const barHeight = normalizedAmplitude * innerHeight;
      const x = CHART_PADDING.left + (index * barWidth * 1.5);
      const y = CHART_PADDING.top + (innerHeight - barHeight);

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        frequency: harmonic.frequency,
        note: `${harmonic.note}${harmonic.octave}`,
        amplitude: amplitude,
        harmonic: harmonic.harmonic || (index + 1)
      };
    });

    return { bars, maxAmplitude };
  }, [harmonics, innerWidth, innerHeight]);

  if (!processedData) return null;

  const { bars, maxAmplitude } = processedData;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          🎵 Espectro Sonoro (Sound Spectrum)
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Amplitudes relativas dos harmônicos detectados
      </Text>

      {/* Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <Svg
          width={Math.max(chartWidth, bars.length * 80)}
          height={CHART_HEIGHT}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
            const y = CHART_PADDING.top + innerHeight * (1 - ratio);
            return (
              <G key={`grid-${idx}`}>
                <Line
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={CHART_PADDING.left + innerWidth}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity={0.3}
                />
                <SvgText
                  x={CHART_PADDING.left - 10}
                  y={y + 5}
                  fontSize="10"
                  fill={colors.textSecondary}
                  textAnchor="end"
                >
                  {(ratio * 100).toFixed(0)}%
                </SvgText>
              </G>
            );
          })}

          {/* Bars */}
          {bars.map((bar, index) => (
            <G key={`bar-${index}`}>
              {/* Bar */}
              <Rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={selectedHarmonic === index ? colors.accent : colors.primary}
                opacity={selectedHarmonic === null || selectedHarmonic === index ? 0.8 : 0.4}
                onPress={() => setSelectedHarmonic(selectedHarmonic === index ? null : index)}
              />

              {/* Harmonic number */}
              <SvgText
                x={bar.x + bar.width / 2}
                y={CHART_PADDING.top + innerHeight + 15}
                fontSize="10"
                fill={colors.textPrimary}
                textAnchor="middle"
                fontWeight="bold"
              >
                H{bar.harmonic}
              </SvgText>

              {/* Frequency */}
              <SvgText
                x={bar.x + bar.width / 2}
                y={CHART_PADDING.top + innerHeight + 30}
                fontSize="9"
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {bar.frequency.toFixed(1)}Hz
              </SvgText>

              {/* Note */}
              <SvgText
                x={bar.x + bar.width / 2}
                y={CHART_PADDING.top + innerHeight + 45}
                fontSize="10"
                fill={colors.accent}
                textAnchor="middle"
                fontWeight="bold"
              >
                {bar.note}
              </SvgText>
            </G>
          ))}

          {/* Axes */}
          <Line
            x1={CHART_PADDING.left}
            y1={CHART_PADDING.top}
            x2={CHART_PADDING.left}
            y2={CHART_PADDING.top + innerHeight}
            stroke={colors.textPrimary}
            strokeWidth="2"
          />
          <Line
            x1={CHART_PADDING.left}
            y1={CHART_PADDING.top + innerHeight}
            x2={CHART_PADDING.left + innerWidth}
            y2={CHART_PADDING.top + innerHeight}
            stroke={colors.textPrimary}
            strokeWidth="2"
          />

          {/* Y-axis label */}
          <SvgText
            x={15}
            y={CHART_HEIGHT / 2}
            fontSize="12"
            fill={colors.textSecondary}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${CHART_HEIGHT / 2})`}
          >
            Amplitude Relativa
          </SvgText>
        </Svg>
      </ScrollView>

      {/* Selected harmonic info */}
      {selectedHarmonic !== null && (
        <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            <Text style={{ fontWeight: 'bold' }}>Harmônico {bars[selectedHarmonic].harmonic}</Text>
            {' • '}
            {bars[selectedHarmonic].frequency.toFixed(2)} Hz
            {' • '}
            {bars[selectedHarmonic].note}
            {' • '}
            Amplitude: {(bars[selectedHarmonic].amplitude * 100).toFixed(1)}%
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
          💡 Toque em uma barra para ver detalhes
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
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
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
  },
  legend: {
    marginTop: 10,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
