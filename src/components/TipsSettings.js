import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import userPreferences from '../services/settings/UserPreferences';
import * as Haptics from 'expo-haptics';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const TipsSettings = ({ visible, onClose }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const currentSettings = await userPreferences.initialize();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics não disponível
    }

    try {
      await userPreferences.set(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
    }
  };

  const resetSettings = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics não disponível
    }

    try {
      await userPreferences.resetCategory('tips');
      await loadSettings();
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>⚙️ Configurações de Dicas</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {!loading && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Dicas Diárias */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 Dicas do Dia</Text>
                  
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Mostrar Dicas</Text>
                      <Text style={styles.settingDescription}>
                        Exibir dicas úteis sobre didgeridoos
                      </Text>
                    </View>
                    <Switch
                      value={settings.showDailyTips}
                      onValueChange={(value) => handleSettingChange('showDailyTips', value)}
                      trackColor={{ false: '#4B5563', true: '#10B981' }}
                      thumbColor={settings.showDailyTips ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>

                  {settings.showDailyTips && (
                    <View style={styles.subSection}>
                      <Text style={styles.subSectionTitle}>Frequência das Dicas</Text>
                      
                      {[
                        { key: 'never', label: 'Nunca', desc: 'Desabilita todas as dicas' },
                        { key: 'daily', label: 'Diariamente', desc: 'Uma dica por dia' },
                        { key: 'weekly', label: 'Semanalmente', desc: 'Uma dica por semana' }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.key}
                          style={[
                            styles.radioOption,
                            settings.tipFrequency === option.key && styles.radioOptionActive
                          ]}
                          onPress={() => handleSettingChange('tipFrequency', option.key)}
                        >
                          <View style={styles.radioInfo}>
                            <Text style={[
                              styles.radioLabel,
                              settings.tipFrequency === option.key && styles.radioLabelActive
                            ]}>
                              {option.label}
                            </Text>
                            <Text style={styles.radioDescription}>
                              {option.desc}
                            </Text>
                          </View>
                          <View style={[
                            styles.radioCircle,
                            settings.tipFrequency === option.key && styles.radioCircleActive
                          ]}>
                            {settings.tipFrequency === option.key && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Tutorial Overlays */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎯 Tutoriais</Text>
                  
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Overlays de Tutorial</Text>
                      <Text style={styles.settingDescription}>
                        Mostrar dicas interativas na interface
                      </Text>
                    </View>
                    <Switch
                      value={settings.showTutorialOverlays}
                      onValueChange={(value) => handleSettingChange('showTutorialOverlays', value)}
                      trackColor={{ false: '#4B5563', true: '#10B981' }}
                      thumbColor={settings.showTutorialOverlays ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                </View>

                {/* UI Preferences */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎨 Interface</Text>
                  
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Feedback Háptico</Text>
                      <Text style={styles.settingDescription}>
                        Vibrações ao tocar botões
                      </Text>
                    </View>
                    <Switch
                      value={settings.hapticFeedback}
                      onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
                      trackColor={{ false: '#4B5563', true: '#10B981' }}
                      thumbColor={settings.hapticFeedback ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Animações</Text>
                      <Text style={styles.settingDescription}>
                        Efeitos visuais e transições
                      </Text>
                    </View>
                    <Switch
                      value={settings.animations}
                      onValueChange={(value) => handleSettingChange('animations', value)}
                      trackColor={{ false: '#4B5563', true: '#10B981' }}
                      thumbColor={settings.animations ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                </View>

                {/* Reset Section */}
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetSettings}
                  >
                    <Text style={styles.resetButtonText}>🔄 Restaurar Padrões</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando configurações...</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={onClose}
              >
                <Text style={styles.saveButtonText}>✅ Salvar e Fechar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.small,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  subSection: {
    marginTop: spacing.md,
    marginLeft: spacing.sm,
  },
  subSectionTitle: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  radioOptionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  radioInfo: {
    flex: 1,
  },
  radioLabel: {
    fontSize: typography.body,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  radioLabelActive: {
    color: '#10B981',
  },
  radioDescription: {
    fontSize: typography.caption,
    color: '#9CA3AF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#10B981',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    color: '#F87171',
    fontSize: typography.body,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: typography.body,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
});