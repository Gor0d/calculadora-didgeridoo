import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OfflineManager } from '../services/offline/OfflineManager';
import { localizationService } from '../services/i18n/LocalizationService';
import { getDeviceInfo, getTypography, getSpacing, scale } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const OfflineSettings = ({ visible, onClose }) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [manualOfflineMode, setManualOfflineMode] = useState(false);

  useEffect(() => {
    if (visible) {
      loadStatus();
    }
  }, [visible]);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const statusData = await OfflineManager.getStatus();
      setStatus(statusData);
      setPreferences(statusData.preferences || {});
      setManualOfflineMode(statusData.isOffline && statusData.preferences?.autoOfflineMode !== true);
    } catch (error) {
      console.error('Error loading offline status:', error);
      Alert.alert('Erro', 'Falha ao carregar status offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOfflineMode = async (enabled) => {
    try {
      setIsLoading(true);
      await OfflineManager.setOfflineMode(enabled);
      setManualOfflineMode(enabled);
      
      // Update preferences
      const newPreferences = {
        ...preferences,
        autoOfflineMode: !enabled
      };
      await OfflineManager.saveUserPreferences(newPreferences);
      setPreferences(newPreferences);
      
      await loadStatus();
      
      Alert.alert(
        'Modo Offline',
        enabled 
          ? 'Modo offline ativado. O app funcionará sem conexão com internet.'
          : 'Modo offline desativado. O app usará conexão quando disponível.'
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao alterar modo offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Isso removerá todos os dados offline armazenados. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await OfflineManager.clearCache();
              await loadStatus();
              Alert.alert('Sucesso', 'Cache offline limpo com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar cache');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRefreshCache = async () => {
    try {
      setIsLoading(true);
      await OfflineManager.updateOfflineCache();
      await loadStatus();
      Alert.alert('Sucesso', 'Cache offline atualizado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar cache');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCacheSize = (sizeKB) => {
    if (sizeKB < 1024) {
      return `${sizeKB} KB`;
    } else if (sizeKB < 1024 * 1024) {
      return `${(sizeKB / 1024).toFixed(1)} MB`;
    } else {
      return `${(sizeKB / (1024 * 1024)).toFixed(1)} GB`;
    }
  };

  const getConnectionStatus = () => {
    if (!status) return 'Verificando...';
    
    if (manualOfflineMode) {
      return '🔴 Offline (Manual)';
    } else if (status.isOffline) {
      return '🟡 Offline (Sem conexão)';
    } else {
      return '🟢 Online';
    }
  };

  const StatusItem = ({ label, value, color = '#374151' }) => (
    <View style={styles.statusItem}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Configurações Offline</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : (
            <>
              {/* Connection Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status da Conexão</Text>
                <View style={styles.statusCard}>
                  <Text style={styles.connectionStatus}>
                    {getConnectionStatus()}
                  </Text>
                  <Text style={styles.connectionDescription}>
                    {status?.isOffline 
                      ? 'Funcionando em modo offline com dados armazenados localmente'
                      : 'Conectado à internet com recursos completos'
                    }
                  </Text>
                </View>
              </View>

              {/* Manual Offline Toggle */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Controle Manual</Text>
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>Forçar Modo Offline</Text>
                    <Text style={styles.toggleDescription}>
                      Desativar conexão e usar apenas dados locais
                    </Text>
                  </View>
                  <Switch
                    value={manualOfflineMode}
                    onValueChange={handleToggleOfflineMode}
                    trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                    thumbColor={manualOfflineMode ? '#FFFFFF' : '#FFFFFF'}
                    disabled={isLoading}
                  />
                </View>
              </View>

              {/* Cache Information */}
              {status && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Informações do Cache</Text>
                  <View style={styles.statusGrid}>
                    <StatusItem 
                      label="Versão do Cache" 
                      value={status.cacheVersion === status.currentVersion ? 'Atualizada' : 'Desatualizada'}
                      color={status.cacheVersion === status.currentVersion ? '#10B981' : '#F59E0B'}
                    />
                    <StatusItem 
                      label="Tamanho do Cache" 
                      value={formatCacheSize(status.cacheSize)}
                    />
                    <StatusItem 
                      label="Dados Disponíveis" 
                      value={status.hasOfflineData ? 'Sim' : 'Não'}
                      color={status.hasOfflineData ? '#10B981' : '#EF4444'}
                    />
                    <StatusItem 
                      label="Versão Atual" 
                      value={status.currentVersion}
                    />
                  </View>
                </View>
              )}

              {/* Offline Capabilities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recursos Offline</Text>
                <View style={styles.capabilitiesList}>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityIcon}>✅</Text>
                    <Text style={styles.capabilityText}>Análise acústica completa</Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityIcon}>✅</Text>
                    <Text style={styles.capabilityText}>Cálculo de harmônicos</Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityIcon}>✅</Text>
                    <Text style={styles.capabilityText}>Visualização de geometria</Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityIcon}>✅</Text>
                    <Text style={styles.capabilityText}>Gerenciamento de projetos</Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityIcon}>✅</Text>
                    <Text style={styles.capabilityText}>Exportação de dados</Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityIcon}>⚠️</Text>
                    <Text style={styles.capabilityText}>Síntese de áudio (limitada)</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ações</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.refreshButton]}
                    onPress={handleRefreshCache}
                    disabled={isLoading}
                  >
                    <Text style={styles.actionButtonText}>🔄 Atualizar Cache</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.clearButton]}
                    onPress={handleClearCache}
                    disabled={isLoading}
                  >
                    <Text style={styles.actionButtonText}>🗑️ Limpar Cache</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dicas</Text>
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipText}>
                    💡 O modo offline permite usar o app sem conexão com internet
                  </Text>
                  <Text style={styles.tipText}>
                    📱 Todos os projetos são salvos localmente no dispositivo
                  </Text>
                  <Text style={styles.tipText}>
                    ⚡ A análise offline é otimizada para economia de bateria
                  </Text>
                  <Text style={styles.tipText}>
                    🔄 Atualize o cache regularmente para melhores resultados
                  </Text>
                </View>
              </View>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: '#6B7280',
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionStatus: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  connectionDescription: {
    fontSize: typography.small,
    color: '#6B7280',
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: typography.small,
    color: '#6B7280',
  },
  statusGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusLabel: {
    fontSize: typography.body,
    color: '#374151',
  },
  statusValue: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  capabilitiesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  capabilityIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 20,
  },
  capabilityText: {
    fontSize: typography.body,
    color: '#374151',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButton: {
    backgroundColor: '#10B981',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: typography.small,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});