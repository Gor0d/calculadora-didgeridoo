/**
 * MeasurementUnitSelector Component
 *
 * Permite converter automaticamente entre CM e MM para as medidas de posição
 * Útil quando o usuário tem medidas em milímetros
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { themeService } from '../services/theme/ThemeService';
import { getTypography, getSpacing } from '../utils/responsive';

const typography = getTypography();
const spacing = getSpacing();

export const MeasurementUnitSelector = ({
  geometry,
  onGeometryConverted,
  visible = true
}) => {
  const [currentTheme] = useState(themeService.getCurrentTheme());
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedSourceUnit, setSelectedSourceUnit] = useState('mm'); // mm ou cm
  const colors = currentTheme.colors;

  /**
   * Detecta automaticamente se valores parecem estar em MM
   */
  const detectUnit = (geometryString) => {
    if (!geometryString || !geometryString.trim()) return null;

    try {
      const lines = geometryString.trim().split(/[\n\s]+/);
      const positions = [];

      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 1) {
          const pos = parseFloat(parts[0]);
          if (!isNaN(pos)) positions.push(pos);
        }
      }

      if (positions.length < 2) return null;

      const maxPosition = Math.max(...positions);

      // Se maior posição > 300, provavelmente está em MM
      if (maxPosition > 300) {
        return {
          detected: 'mm',
          maxValue: maxPosition,
          suggestion: 'Valores parecem estar em MILÍMETROS'
        };
      } else {
        return {
          detected: 'cm',
          maxValue: maxPosition,
          suggestion: 'Valores parecem estar em CENTÍMETROS'
        };
      }
    } catch (error) {
      return null;
    }
  };

  /**
   * Converte geometria de MM para CM
   * Formato otimizado para o GeometryInput (linha por ponto)
   */
  const convertMmToCm = (geometryString) => {
    const lines = geometryString.trim().split(/[\n\s]+/);
    const converted = [];

    for (const line of lines) {
      // Aceita formato: "0 30" ou "0,30"
      const parts = line.split(/[,\s]+/).map(v => v.trim());
      if (parts.length >= 2) {
        const pos = parseFloat(parts[0]);
        const diam = parseFloat(parts[1]);

        if (!isNaN(pos) && !isNaN(diam)) {
          const posCm = (pos / 10).toFixed(1);
          const diamCm = (diam / 10).toFixed(1);
          // Formato: "posição diâmetro" (separado por espaço)
          converted.push(`${posCm} ${diamCm}`);
        }
      }
    }

    // Retorna uma linha por ponto (formato que GeometryInput entende)
    return converted.join('\n');
  };

  /**
   * Converte geometria de CM para MM
   * Formato otimizado para o GeometryInput (linha por ponto)
   */
  const convertCmToMm = (geometryString) => {
    const lines = geometryString.trim().split(/[\n\s]+/);
    const converted = [];

    for (const line of lines) {
      // Aceita formato: "0 3" ou "0,3"
      const parts = line.split(/[,\s]+/).map(v => v.trim());
      if (parts.length >= 2) {
        const pos = parseFloat(parts[0]);
        const diam = parseFloat(parts[1]);

        if (!isNaN(pos) && !isNaN(diam)) {
          const posMm = Math.round(pos * 10);
          const diamMm = Math.round(diam * 10);
          // Formato: "posição diâmetro" (separado por espaço)
          converted.push(`${posMm} ${diamMm}`);
        }
      }
    }

    // Retorna uma linha por ponto (formato que GeometryInput entende)
    return converted.join('\n');
  };

  /**
   * Abre modal de conversão
   */
  const handleOpenConverter = () => {
    setInputText(geometry || '');

    // Detectar unidade automaticamente
    const detection = detectUnit(geometry);
    if (detection) {
      setSelectedSourceUnit(detection.detected);
    }

    setShowConversionModal(true);
  };

  /**
   * Converte e aplica
   */
  const handleConvert = () => {
    if (!inputText.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma geometria para converter');
      return;
    }

    try {
      let converted;

      if (selectedSourceUnit === 'mm') {
        converted = convertMmToCm(inputText);
      } else {
        converted = convertCmToMm(inputText);
      }

      onGeometryConverted(converted);
      setShowConversionModal(false);

      Alert.alert(
        'Conversão Realizada!',
        `Geometria convertida de ${selectedSourceUnit.toUpperCase()} para ${selectedSourceUnit === 'mm' ? 'CM' : 'MM'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível converter. Verifique o formato da geometria.');
    }
  };

  /**
   * Botão de conversão rápida
   */
  const handleQuickConvert = () => {
    if (!geometry || !geometry.trim()) {
      handleOpenConverter();
      return;
    }

    const detection = detectUnit(geometry);

    if (!detection) {
      handleOpenConverter();
      return;
    }

    if (detection.detected === 'mm') {
      Alert.alert(
        '🔍 Detecção Automática',
        `Detectamos que seus valores parecem estar em MILÍMETROS (posição máxima: ${detection.maxValue}mm).\n\nDeseja converter para CENTÍMETROS?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Converter para CM',
            onPress: () => {
              const converted = convertMmToCm(geometry);
              onGeometryConverted(converted);
              Alert.alert('✅ Convertido!', 'Geometria convertida de MM para CM');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Conversão Manual',
        'Valores parecem estar em centímetros. Deseja abrir o conversor para fazer ajustes manuais?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Abrir Conversor', onPress: handleOpenConverter }
        ]
      );
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Botão de conversão rápida */}
      <TouchableOpacity
        style={[styles.quickButton, { backgroundColor: colors.primary }]}
        onPress={handleQuickConvert}
      >
        <Text style={styles.quickButtonIcon}>🔄</Text>
        <Text style={styles.quickButtonText}>Converter MM ↔ CM</Text>
      </TouchableOpacity>

      {/* Modal de conversão */}
      <Modal
        visible={showConversionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConversionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                🔄 Conversor de Unidades
              </Text>
              <TouchableOpacity
                onPress={() => setShowConversionModal(false)}
                style={styles.closeButton}
              >
                <Text style={{ fontSize: 24, color: colors.textSecondary }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Seletor de unidade de origem */}
              <Text style={[styles.label, { color: colors.text }]}>
                Unidade dos valores originais:
              </Text>

              <View style={styles.unitButtons}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    selectedSourceUnit === 'mm' && styles.unitButtonActive,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedSourceUnit('mm')}
                >
                  <Text style={[
                    styles.unitButtonText,
                    selectedSourceUnit === 'mm' && styles.unitButtonTextActive,
                    { color: selectedSourceUnit === 'mm' ? '#fff' : colors.text }
                  ]}>
                    Milímetros (mm)
                  </Text>
                  <Text style={[styles.unitExample, { color: selectedSourceUnit === 'mm' ? '#fff' : colors.textSecondary }]}>
                    Ex: 1695 mm
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    selectedSourceUnit === 'cm' && styles.unitButtonActive,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedSourceUnit('cm')}
                >
                  <Text style={[
                    styles.unitButtonText,
                    selectedSourceUnit === 'cm' && styles.unitButtonTextActive,
                    { color: selectedSourceUnit === 'cm' ? '#fff' : colors.text }
                  ]}>
                    Centímetros (cm)
                  </Text>
                  <Text style={[styles.unitExample, { color: selectedSourceUnit === 'cm' ? '#fff' : colors.textSecondary }]}>
                    Ex: 169.5 cm
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Preview da conversão */}
              {detectUnit(inputText) && (
                <View style={[styles.detectionBox, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.detectionText, { color: colors.textSecondary }]}>
                    🔍 {detectUnit(inputText).suggestion}
                  </Text>
                  <Text style={[styles.detectionValue, { color: colors.text }]}>
                    Posição máxima: {detectUnit(inputText).maxValue}
                  </Text>
                </View>
              )}

              {/* Área de texto */}
              <Text style={[styles.label, { color: colors.text }]}>
                Cole sua geometria aqui:
              </Text>

              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                multiline
                numberOfLines={10}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Cole aqui (ex: 0 30\n100 30\n200 35...)"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Info */}
              <View style={[styles.infoBox, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  💡 <Text style={{ fontWeight: '600' }}>Formato aceito:</Text>
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  • Uma linha por ponto
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  • Formato: posição diâmetro
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  • Separado por espaço ou vírgula
                </Text>
              </View>

              {/* Botões de ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowConversionModal(false)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.convertButton, { backgroundColor: colors.primary }]}
                  onPress={handleConvert}
                >
                  <Text style={styles.convertButtonText}>
                    Converter para {selectedSourceUnit === 'mm' ? 'CM' : 'MM'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  quickButtonIcon: {
    fontSize: 18,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalScroll: {
    flex: 1,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  unitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  unitButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  unitButtonTextActive: {
    color: '#fff',
  },
  unitExample: {
    fontSize: typography.caption,
  },
  detectionBox: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  detectionText: {
    fontSize: typography.caption,
    marginBottom: 2,
  },
  detectionValue: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  textInput: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  infoBox: {
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  infoText: {
    fontSize: typography.caption,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  convertButton: {
    backgroundColor: '#3B82F6',
  },
  convertButtonText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: '600',
  },
});
