import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTutorialProgress } from '../hooks/useTutorial';
import { TutorialManager } from '../services/tutorial/TutorialManager';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const TutorialSettings = ({ visible, onClose }) => {
  const { stats, settings, updateSettings, resetAll, refresh } = useTutorialProgress();
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (visible) {
      refresh();
    }
  }, [visible]);

  const handleToggleSetting = async (key, value) => {
    await updateSettings({ [key]: value });
  };

  const handleResetTutorial = () => {
    Alert.alert(
      'Reiniciar Tutorial',
      'Isso irá reiniciar todo o progresso do tutorial. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await resetAll();
              Alert.alert('Sucesso', 'Tutorial reiniciado com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao reiniciar tutorial');
            } finally {
              setIsResetting(false);
            }
          }
        }
      ]
    );
  };

  const handleStartTutorial = async (sectionName) => {
    try {
      // This would trigger a specific tutorial section
      Alert.alert(
        'Tutorial Iniciado',
        `O tutorial "${getSectionLabel(sectionName)}" será iniciado quando você fechar esta tela.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao iniciar tutorial');
    }
  };

  const handleStartFirstRunTutorial = () => {
    Alert.alert(
      'Refazer Tutorial Completo',
      'Isso irá reiniciar o tutorial de introdução completo do aplicativo. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Iniciar', 
          onPress: () => {
            // Trigger first run tutorial
            TutorialManager.resetFirstRun().then(() => {
              Alert.alert(
                'Tutorial Reiniciado',
                'O tutorial será iniciado quando você reiniciar o aplicativo.',
                [{ text: 'OK' }]
              );
            });
          }
        }
      ]
    );
  };

  const getSectionLabel = (sectionName) => {
    const labels = {
      welcome: 'Boas-vindas',
      basic_usage: 'Uso Básico',
      advanced_features: 'Recursos Avançados',
      project_management: 'Gerenciamento de Projetos'
    };
    return labels[sectionName] || sectionName;
  };

  const getCompletionIcon = (isCompleted) => {
    return isCompleted ? '✅' : '⏳';
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Configurações do Tutorial</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {/* Progress Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Progresso Geral</Text>
            
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Conclusão do Tutorial</Text>
                <Text style={styles.progressPercentage}>{stats.progressPercentage}%</Text>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${stats.progressPercentage}%` }
                  ]} 
                />
              </View>

              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatNumber}>{stats.completedSteps}</Text>
                  <Text style={styles.progressStatLabel}>Passos Concluídos</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatNumber}>{stats.totalSteps}</Text>
                  <Text style={styles.progressStatLabel}>Total de Passos</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatNumber}>{stats.completedSections}</Text>
                  <Text style={styles.progressStatLabel}>Seções Completas</Text>
                </View>
              </View>

              {stats.isComplete && (
                <View style={styles.completionBadge}>
                  <Text style={styles.completionText}>🎉 Tutorial Completo!</Text>
                </View>
              )}

              {/* Start Tutorial Button */}
              <TouchableOpacity 
                style={styles.startTutorialButton}
                onPress={handleStartFirstRunTutorial}
              >
                <Text style={styles.startTutorialButtonText}>🎯 Refazer Tutorial Completo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tutorial Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Seções do Tutorial</Text>
            
            {Object.entries(TutorialManager.tutorialSteps).map(([sectionName, steps]) => {
              if (sectionName === 'tips_and_tricks') return null;
              
              const sectionProgress = stats[sectionName] || { completed: false, steps: [] };
              const isCompleted = sectionProgress.completed;
              const completedSteps = sectionProgress.steps?.length || 0;
              
              return (
                <View key={sectionName} style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionInfo}>
                      <Text style={styles.sectionName}>
                        {getCompletionIcon(isCompleted)} {getSectionLabel(sectionName)}
                      </Text>
                      <Text style={styles.sectionProgress}>
                        {completedSteps}/{steps.length} passos concluídos
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={[
                        styles.sectionButton,
                        isCompleted ? styles.sectionButtonCompleted : styles.sectionButtonActive
                      ]}
                      onPress={() => handleStartTutorial(sectionName)}
                    >
                      <Text style={[
                        styles.sectionButtonText,
                        isCompleted && styles.sectionButtonTextCompleted
                      ]}>
                        {isCompleted ? 'Revisar' : 'Iniciar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.sectionProgressBar}>
                    <View 
                      style={[
                        styles.sectionProgressFill, 
                        { width: `${(completedSteps / steps.length) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Tutorial Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
            
            <View style={styles.settingsCard}>
              <SettingRow
                label="Tutorial Ativo"
                description="Habilita ou desabilita o sistema de tutorial"
                value={settings.enabled}
                onValueChange={(value) => handleToggleSetting('enabled', value)}
              />
              
              <SettingRow
                label="Reprodução Automática"
                description="Inicia tutorials automaticamente baseado no contexto"
                value={settings.autoPlay}
                onValueChange={(value) => handleToggleSetting('autoPlay', value)}
                disabled={!settings.enabled}
              />
              
              <SettingRow
                label="Mostrar Dicas"
                description="Exibe dicas contextuais durante o uso"
                value={settings.showTips}
                onValueChange={(value) => handleToggleSetting('showTips', value)}
                disabled={!settings.enabled}
              />
            </View>
          </View>

          {/* Speed Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎬 Velocidade das Animações</Text>
            
            <View style={styles.speedCard}>
              {['slow', 'normal', 'fast'].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedOption,
                    settings.animationSpeed === speed && styles.speedOptionActive
                  ]}
                  onPress={() => handleToggleSetting('animationSpeed', speed)}
                >
                  <Text style={[
                    styles.speedOptionText,
                    settings.animationSpeed === speed && styles.speedOptionTextActive
                  ]}>
                    {speed === 'slow' ? 'Lenta' : speed === 'normal' ? 'Normal' : 'Rápida'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Ações</Text>
            
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={handleResetTutorial}
                disabled={isResetting}
              >
                <Text style={styles.actionButtonText}>
                  {isResetting ? '⏳ Reiniciando...' : '🔄 Reiniciar Tutorial'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.refreshButton]}
                onPress={refresh}
              >
                <Text style={styles.actionButtonText}>
                  🔃 Atualizar Progresso
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❓ Ajuda</Text>
            
            <View style={styles.helpCard}>
              <Text style={styles.helpText}>
                • O tutorial irá guiá-lo pelas principais funcionalidades do app
              </Text>
              <Text style={styles.helpText}>
                • Você pode pular qualquer seção usando o botão "Pular Tutorial"
              </Text>
              <Text style={styles.helpText}>
                • Dicas contextuais aparecem automaticamente conforme você usa o app
              </Text>
              <Text style={styles.helpText}>
                • Seu progresso é salvo automaticamente
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

  // Progress styles
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: typography.h2,
    fontWeight: '900',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressStatLabel: {
    fontSize: typography.caption,
    color: '#6B7280',
    textAlign: 'center',
  },
  completionBadge: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  completionText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
  },

  // Section styles
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  sectionProgress: {
    fontSize: typography.small,
    color: '#6B7280',
  },
  sectionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  sectionButtonActive: {
    backgroundColor: '#667eea',
  },
  sectionButtonCompleted: {
    backgroundColor: '#F3F4F6',
  },
  sectionButtonText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionButtonTextCompleted: {
    color: '#6B7280',
  },
  sectionProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  sectionProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
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

  // Speed styles
  speedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speedOption: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  speedOptionActive: {
    backgroundColor: '#667eea',
  },
  speedOptionText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#6B7280',
  },
  speedOptionTextActive: {
    color: '#FFFFFF',
  },

  // Actions styles
  actionsCard: {
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
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#EF4444',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },

  // Start Tutorial Button
  startTutorialButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startTutorialButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '700',
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