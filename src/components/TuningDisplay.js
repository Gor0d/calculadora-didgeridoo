/**
 * TuningDisplay Component
 *
 * Exibe afinação de forma visual e clara, similar à imagem de referência
 * Mostra: Frequência | Nome da Nota | Diferença em Centavos (com cores)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { themeService } from '../services/theme/ThemeService';
import { getTypography, getSpacing, getDeviceInfo } from '../utils/responsive';

const typography = getTypography();
const spacing = getSpacing();
const deviceInfo = getDeviceInfo();
const screenWidth = Dimensions.get('window').width;

export const TuningDisplay = ({
  results = [],
  visible = true,
  onPlayNote = null
}) => {
  const [currentTheme] = useState(themeService.getCurrentTheme());
  const colors = currentTheme.colors;

  if (!visible || !results || results.length === 0) {
    return null;
  }

  /**
   * Determina cor baseado em centavos de diferença
   */
  const getCentsColor = (cents) => {
    const absCents = Math.abs(cents);

    if (absCents <= 10) {
      return '#10B981'; // Verde - Muito afinado
    } else if (absCents <= 25) {
      return '#F59E0B'; // Laranja - Razoável
    } else {
      return '#EF4444'; // Vermelho - Desafinado
    }
  };

  /**
   * Formata centavos com sinal
   */
  const formatCents = (cents) => {
    const rounded = Math.round(cents);
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          🎵 Afinação
        </Text>
      </View>

      {/* Tabela de Afinação */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.table}>
          {/* Header da Tabela */}
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerCell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                frequência
              </Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                nome_da_nota
              </Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                diferenca_centavo
              </Text>
            </View>
          </View>

          {/* Linhas da Tabela */}
          <View style={styles.tableBody}>
            {results.map((result, index) => {
              const centsColor = getCentsColor(result.cents || result.centDiff || 0);
              const isPlayable = onPlayNote !== null;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tableRow,
                    { backgroundColor: colors.cardBackground },
                    index === 0 && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 2 },
                    isPlayable && { backgroundColor: colors.surfaceBackground }
                  ]}
                  onPress={() => isPlayable && onPlayNote(result)}
                  disabled={!isPlayable}
                  activeOpacity={0.7}
                >
                  {/* Frequência */}
                  <View style={styles.cell}>
                    <Text style={[styles.cellText, { color: colors.text }]}>
                      {result.frequency.toFixed(2)}
                    </Text>
                  </View>

                  {/* Nome da Nota */}
                  <View style={styles.cell}>
                    <Text style={[styles.noteText, { color: colors.text }]}>
                      {result.note}{result.octave || ''}
                    </Text>
                  </View>

                  {/* Diferença em Centavos */}
                  <View style={styles.cell}>
                    <Text style={[
                      styles.centsText,
                      { color: centsColor }
                    ]}>
                      {formatCents(result.cents || result.centDiff || 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            ±10¢ (Afinado)
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            ±25¢ (Razoável)
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            &gt;25¢ (Desafinado)
          </Text>
        </View>
      </View>

      {/* Info */}
      {results.length > 0 && (
        <View style={[styles.infoBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 <Text style={{ fontWeight: '600' }}>Dica:</Text> Centavos (¢) medem a diferença da afinação. 100¢ = 1 semitom.
          </Text>
          {onPlayNote && (
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              🔊 Toque em uma nota para ouvir
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: 'bold',
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerCell: {
    flex: 1,
    minWidth: deviceInfo.isTablet ? 120 : 90,
    paddingHorizontal: spacing.xs,
  },
  headerText: {
    fontSize: deviceInfo.isTablet ? typography.body : typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableBody: {
    gap: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: deviceInfo.isTablet ? spacing.md : spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  tableRowClickable: {
    backgroundColor: '#F3F4F6',
  },
  fundamentalRow: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  cell: {
    flex: 1,
    minWidth: deviceInfo.isTablet ? 120 : 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  cellText: {
    fontSize: deviceInfo.isTablet ? typography.h3 : typography.body,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  noteText: {
    fontSize: deviceInfo.isTablet ? typography.h2 : typography.h3,
    fontWeight: 'bold',
  },
  centsText: {
    fontSize: deviceInfo.isTablet ? typography.h3 : typography.body,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.caption,
  },
  infoBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
  },
  infoText: {
    fontSize: typography.caption,
    marginBottom: 4,
  },
});
