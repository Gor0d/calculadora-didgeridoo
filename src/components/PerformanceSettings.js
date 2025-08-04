import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PerformanceManager } from '../services/performance/PerformanceManager';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const PerformanceSettings = ({ visible, onClose }) => {
  const [settings, setSettings] = useState(PerformanceManager.settings);
  const [deviceTier, setDeviceTier] = useState('medium');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [performanceStats, setPerformanceStats] = useState(null);

  useEffect(() => {
    if (visible) {
      loadPerformanceData();
    }
  }, [visible]);

  const loadPerformanceData = async () => {
    try {
      const tier = await PerformanceManager.detectDevicePerformance();
      const stats = PerformanceManager.getPerformanceStats();
      
      setDeviceTier(tier);
      setSettings(PerformanceManager.settings);
      setPerformanceStats(stats);
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      await PerformanceManager.updateSetting(key, value);
      setSettings({ ...settings, [key]: value });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar configuração');
    }
  };

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    try {
      await PerformanceManager.optimizeForDevice(deviceTier);
      setSettings(PerformanceManager.settings);
      Alert.alert('Sucesso', 'Otimizações aplicadas com base no seu dispositivo');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao aplicar otimizações automáticas');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleResetToDefaults = async () => {
    Alert.alert(
      'Restaurar Padrões',
      'Isso irá restaurar todas as configurações de performance aos valores padrão. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            try {
              const defaultSettings = await PerformanceManager.resetToDefaults();
              setSettings(defaultSettings);
              Alert.alert('Sucesso', 'Configurações restauradas');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao restaurar configurações');
            }
          }
        }
      ]
    );
  };

  const getDeviceTierInfo = () => {
    const tiers = {
      high: { label: 'Alto', color: '#10B981', description: 'Dispositivo potente' },
      medium: { label: 'Médio', color: '#F59E0B', description: 'Dispositivo moderado' },
      low: { label: 'Baixo', color: '#EF4444', description: 'Dispositivo limitado' }
    };
    return tiers[deviceTier] || tiers.medium;
  };

  const getRenderQualityLabel = (quality) => {
    const labels = {
      high: 'Alta Qualidade',
      medium: 'Qualidade Média',
      low: 'Baixa Qualidade'
    };
    return labels[quality] || quality;
  };

  const SettingRow = ({ label, description, value, onValueChange, disabled = false }) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#CBD5E1', true: '#10B981' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        disabled={disabled}
      />
    </View>
  );

  const tierInfo = getDeviceTierInfo();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Configurações de Performance</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {/* Device Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Informações do Dispositivo</Text>
            
            <View style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <Text style={styles.deviceLabel}>Nível de Performance</Text>
                <View style={[styles.deviceTier, { backgroundColor: tierInfo.color }]}>
                  <Text style={styles.deviceTierText}>{tierInfo.label}</Text>
                </View>
              </View>
              <Text style={styles.deviceDescription}>{tierInfo.description}</Text>
              
              <TouchableOpacity
                style={[styles.optimizeButton, isOptimizing && styles.optimizeButtonDisabled]}
                onPress={handleAutoOptimize}
                disabled={isOptimizing}
              >
                <Text style={styles.optimizeButtonText}>
                  {isOptimizing ? '⏳ Otimizando...' : '🚀 Otimizar Automaticamente'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Performance Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Configurações de Performance</Text>
            
            <View style={styles.settingsCard}>
              <SettingRow
                label="Otimização Automática"
                description="Ajusta configurações com base no dispositivo"
                value={settings.autoOptimize}
                onValueChange={(value) => handleSettingChange('autoOptimize', value)}
              />
              
              <SettingRow
                label="Animações"
                description="Habilita animações e transições"
                value={settings.enableAnimations}
                onValueChange={(value) => handleSettingChange('enableAnimations', value)}
              />
              
              <SettingRow
                label="Feedback Tátil"
                description="Vibrações ao tocar em elementos"
                value={settings.enableHaptics}
                onValueChange={(value) => handleSettingChange('enableHaptics', value)}
              />
              
              <SettingRow
                label="Processamento em Background"
                description="Permite cálculos em segundo plano"
                value={settings.enableBackgroundProcessing}
                onValueChange={(value) => handleSettingChange('enableBackgroundProcessing', value)}
              />
              
              <SettingRow
                label="Pré-carregamento"
                description="Carrega conteúdo antecipadamente"
                value={settings.enablePreloading}
                onValueChange={(value) => handleSettingChange('enablePreloading', value)}
              />
              
              <SettingRow
                label="Otimização de Memória"
                description="Monitora e otimiza uso de memória"
                value={settings.enableMemoryOptimization}
                onValueChange={(value) => handleSettingChange('enableMemoryOptimization', value)}
              />
            </View>
          </View>

          {/* Render Quality */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Qualidade de Renderização</Text>
            
            <View style={styles.qualityCard}>
              {['high', 'medium', 'low'].map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityOption,
                    settings.renderQuality === quality && styles.qualityOptionActive
                  ]}
                  onPress={() => handleSettingChange('renderQuality', quality)}
                >
                  <Text style={[
                    styles.qualityOptionText,
                    settings.renderQuality === quality && styles.qualityOptionTextActive
                  ]}>
                    {getRenderQualityLabel(quality)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.qualityDescription}>
              Qualidade mais baixa melhora a performance em dispositivos lentos
            </Text>
          </View>

          {/* Cache Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Configurações de Cache</Text>
            
            <View style={styles.cacheCard}>
              <View style={styles.cacheInfo}>
                <Text style={styles.cacheLabel}>Tamanho Máximo do Cache</Text>
                <Text style={styles.cacheValue}>{settings.maxCacheSize} MB</Text>
              </View>
              
              <View style={styles.cacheControls}>
                {[25, 50, 100].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.cacheButton,
                      settings.maxCacheSize === size && styles.cacheButtonActive
                    ]}
                    onPress={() => handleSettingChange('maxCacheSize', size)}
                  >
                    <Text style={[
                      styles.cacheButtonText,
                      settings.maxCacheSize === size && styles.cacheButtonTextActive
                    ]}>
                      {size}MB
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Timing Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ Configurações de Tempo</Text>
            
            <View style={styles.timingCard}>
              <View style={styles.timingRow}>
                <Text style={styles.timingLabel}>Debounce Delay</Text>
                <Text style={styles.timingValue}>{settings.debounceDelay}ms</Text>
              </View>
              
              <View style={styles.timingRow}>
                <Text style={styles.timingLabel}>Throttle Delay</Text>
                <Text style={styles.timingValue}>{settings.throttleDelay}ms</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Ações</Text>
            
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={handleResetToDefaults}
              >
                <Text style={styles.actionButtonText}>
                  🔄 Restaurar Padrões
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❓ Ajuda</Text>
            
            <View style={styles.helpCard}>
              <Text style={styles.helpText}>
                • Dispositivos mais lentos se beneficiam de animações desabilitadas
              </Text>
              <Text style={styles.helpText}>
                • Reduza a qualidade de renderização para melhor performance
              </Text>
              <Text style={styles.helpText}>
                • Cache menor usa menos memória mas pode ser mais lento
              </Text>
              <Text style={styles.helpText}>
                • Otimização automática ajusta as configurações para seu dispositivo
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },

  // Device styles
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deviceLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
  },
  deviceTier: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  deviceTierText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
  },
  deviceDescription: {
    fontSize: typography.small,
    color: '#6B7280',
    marginBottom: spacing.md,
  },
  optimizeButton: {
    backgroundColor: '#6366f1',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  optimizeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },

  // Settings styles
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingLabelDisabled: {
    color: '#9CA3AF',
  },
  settingDescription: {
    fontSize: typography.small,
    color: '#6B7280',
  },
  settingDescriptionDisabled: {
    color: '#D1D5DB',
  },

  // Quality styles
  qualityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qualityOption: {
    backgroundColor: '#F3F4F6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  qualityOptionActive: {
    backgroundColor: '#6366f1',
  },
  qualityOptionText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#6B7280',
  },
  qualityOptionTextActive: {
    color: '#FFFFFF',
  },
  qualityDescription: {
    fontSize: typography.small,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Cache styles
  cacheCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cacheInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cacheLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
  },
  cacheValue: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#6366f1',
  },
  cacheControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cacheButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  cacheButtonActive: {
    backgroundColor: '#6366f1',
  },
  cacheButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#6B7280',
  },
  cacheButtonTextActive: {
    color: '#FFFFFF',
  },

  // Timing styles
  timingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  timingLabel: {
    fontSize: typography.body,
    color: '#1F2937',
    fontWeight: '500',
  },
  timingValue: {
    fontSize: typography.body,
    color: '#6366f1',
    fontWeight: '600',
  },

  // Actions styles
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },

  // Help styles
  helpCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: spacing.md,
  },
  helpText: {
    fontSize: typography.small,
    color: '#1E40AF',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
});