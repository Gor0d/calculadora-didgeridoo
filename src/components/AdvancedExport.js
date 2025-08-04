import React, { useState } from 'react';
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
import { ExportManager } from '../services/export/ExportManager';
import { localizationService } from '../services/i18n/LocalizationService';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const AdvancedExport = ({ 
  visible, 
  onClose, 
  project,
  projects = [] // For batch export
}) => {
  const [exportType, setExportType] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    // PDF/Report options
    includeGeometry: true,
    includeAnalysis: true,
    includeVisualization: true,
    includeNotes: true,
    includeTechnicalSpecs: true,
    includeRecommendations: true,
    includeComparison: false,
    
    // Audio options
    includeDrone: true,
    includeHarmonics: true,
    includeSpectrum: false,
    audioDuration: 5000,
    audioVolume: 30,
    audioFormat: 'wav',
    
    // General options
    template: 'professional',
    format: 'html'
  });

  const exportTypes = [
    {
      id: 'pdf',
      name: 'Relatório PDF',
      icon: '📄',
      description: 'Relatório completo em formato PDF profissional'
    },
    {
      id: 'audio',
      name: 'Síntese de Áudio',
      icon: '🎵',
      description: 'Arquivos de áudio com drone e harmônicos'
    },
    {
      id: 'advanced',
      name: 'Relatório Avançado',
      icon: '📊',
      description: 'Análise técnica detalhada com recomendações'
    },
    {
      id: 'batch',
      name: 'Exportação em Lote',
      icon: '📁',
      description: 'Exportar múltiplos projetos simultaneamente'
    }
  ];

  const handleExport = async () => {
    if (!project && exportType !== 'batch') {
      Alert.alert('Erro', 'Nenhum projeto selecionado para exportação');
      return;
    }

    if (exportType === 'batch' && (!projects || projects.length === 0)) {
      Alert.alert('Erro', 'Nenhum projeto disponível para exportação em lote');
      return;
    }

    setIsExporting(true);
    
    try {
      let result;
      
      switch (exportType) {
        case 'pdf':
          result = await ExportManager.exportToPDF(project, {
            includeGeometry: exportOptions.includeGeometry,
            includeAnalysis: exportOptions.includeAnalysis,
            includeVisualization: exportOptions.includeVisualization,
            includeNotes: exportOptions.includeNotes,
            template: exportOptions.template
          });
          break;
          
        case 'audio':
          result = await ExportManager.exportToAudio(project, {
            format: exportOptions.audioFormat,
            duration: exportOptions.audioDuration,
            includeDrone: exportOptions.includeDrone,
            includeHarmonics: exportOptions.includeHarmonics,
            includeSpectrum: exportOptions.includeSpectrum,
            volume: exportOptions.audioVolume / 100
          });
          break;
          
        case 'advanced':
          result = await ExportManager.exportAdvancedReport(project, {
            includeComparison: exportOptions.includeComparison,
            includeTechnicalSpecs: exportOptions.includeTechnicalSpecs,
            includeRecommendations: exportOptions.includeRecommendations,
            includeVisualization: exportOptions.includeVisualization,
            format: exportOptions.format
          });
          break;
          
        case 'batch':
          result = await ExportManager.exportMultipleProjects(projects, {
            format: exportOptions.format,
            includeTechnicalSpecs: exportOptions.includeTechnicalSpecs,
            includeRecommendations: exportOptions.includeRecommendations
          });
          break;
          
        default:
          throw new Error('Tipo de exportação não suportado');
      }
      
      if (result.success) {
        Alert.alert(
          'Exportação Concluída!',
          getSuccessMessage(exportType, result),
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        throw new Error('Falha na exportação');
      }
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Erro na Exportação',
        error.message || 'Ocorreu um erro durante a exportação. Tente novamente.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const getSuccessMessage = (type, result) => {
    switch (type) {
      case 'pdf':
        return `Relatório PDF gerado com sucesso!\nArquivo: ${result.filename}`;
      case 'audio':
        return `${result.files?.length || 1} arquivo(s) de áudio gerado(s) com sucesso!`;
      case 'advanced':
        return `Relatório avançado gerado com sucesso!\nArquivo: ${result.filename}`;
      case 'batch':
        const successful = result.results?.filter(r => r.success).length || 0;
        const total = result.results?.length || 0;
        return `Exportação em lote concluída!\n${successful}/${total} projetos exportados com sucesso.`;
      default:
        return 'Exportação concluída com sucesso!';
    }
  };

  const updateOption = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const OptionSwitch = ({ label, description, optionKey, disabled = false }) => (
    <View style={[styles.optionRow, disabled && styles.optionDisabled]}>
      <View style={styles.optionInfo}>
        <Text style={[styles.optionLabel, disabled && styles.optionLabelDisabled]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.optionDescription, disabled && styles.optionDescriptionDisabled]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={exportOptions[optionKey]}
        onValueChange={(value) => updateOption(optionKey, value)}
        trackColor={{ false: '#CBD5E1', true: '#10B981' }}
        thumbColor={exportOptions[optionKey] ? '#FFFFFF' : '#FFFFFF'}
        disabled={disabled}
      />
    </View>
  );

  const OptionSelector = ({ label, options, optionKey }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              exportOptions[optionKey] === option.value && styles.selectorOptionActive
            ]}
            onPress={() => updateOption(optionKey, option.value)}
          >
            <Text style={[
              styles.selectorOptionText,
              exportOptions[optionKey] === option.value && styles.selectorOptionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderExportOptions = () => {
    switch (exportType) {
      case 'pdf':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Opções do Relatório PDF</Text>
            
            <OptionSwitch
              label="Incluir Geometria"
              description="Tabela detalhada com pontos de geometria"
              optionKey="includeGeometry"
            />
            
            <OptionSwitch
              label="Incluir Análise"
              description="Resultados da análise acústica"
              optionKey="includeAnalysis"
            />
            
            <OptionSwitch
              label="Incluir Visualização"
              description="Gráficos e diagramas da geometria"
              optionKey="includeVisualization"
            />
            
            <OptionSwitch
              label="Incluir Notas"
              description="Notas e observações do projeto"
              optionKey="includeNotes"
            />

            <OptionSelector
              label="Template"
              optionKey="template"
              options={[
                { value: 'professional', label: 'Profissional' },
                { value: 'simple', label: 'Simples' },
                { value: 'detailed', label: 'Detalhado' }
              ]}
            />
          </View>
        );

      case 'audio':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Opções de Síntese de Áudio</Text>
            
            <OptionSwitch
              label="Incluir Drone"
              description="Frequência fundamental com harmônicos"
              optionKey="includeDrone"
            />
            
            <OptionSwitch
              label="Incluir Harmônicos"
              description="Série harmônica separada"
              optionKey="includeHarmonics"
            />
            
            <OptionSwitch
              label="Incluir Espectro"
              description="Espectro completo de frequências"
              optionKey="includeSpectrum"
            />

            <View style={styles.parameterContainer}>
              <Text style={styles.parameterLabel}>
                Duração: {(exportOptions.audioDuration / 1000).toFixed(1)}s
              </Text>
              <View style={styles.parameterButtons}>
                <TouchableOpacity
                  style={styles.parameterButton}
                  onPress={() => updateOption('audioDuration', Math.max(1000, exportOptions.audioDuration - 1000))}
                >
                  <Text style={styles.parameterButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.parameterButton}
                  onPress={() => updateOption('audioDuration', Math.min(10000, exportOptions.audioDuration + 1000))}
                >
                  <Text style={styles.parameterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.parameterContainer}>
              <Text style={styles.parameterLabel}>
                Volume: {exportOptions.audioVolume}%
              </Text>
              <View style={styles.parameterButtons}>
                <TouchableOpacity
                  style={styles.parameterButton}
                  onPress={() => updateOption('audioVolume', Math.max(10, exportOptions.audioVolume - 10))}
                >
                  <Text style={styles.parameterButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.parameterButton}
                  onPress={() => updateOption('audioVolume', Math.min(100, exportOptions.audioVolume + 10))}
                >
                  <Text style={styles.parameterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <OptionSelector
              label="Formato de Áudio"
              optionKey="audioFormat"
              options={[
                { value: 'wav', label: 'WAV (alta qualidade)' },
                { value: 'mp3', label: 'MP3 (compacto)' },
                { value: 'ogg', label: 'OGG (código aberto)' }
              ]}
            />
          </View>
        );

      case 'advanced':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Opções do Relatório Avançado</Text>
            
            <OptionSwitch
              label="Especificações Técnicas"
              description="Parâmetros físicos e acústicos detalhados"
              optionKey="includeTechnicalSpecs"
            />
            
            <OptionSwitch
              label="Recomendações"
              description="Sugestões de melhoria e otimização"
              optionKey="includeRecommendations"
            />
            
            <OptionSwitch
              label="Comparação"
              description="Comparar com designs tradicionais"
              optionKey="includeComparison"
            />
            
            <OptionSwitch
              label="Visualização"
              description="Gráficos e diagramas avançados"
              optionKey="includeVisualization"
            />

            <OptionSelector
              label="Formato de Saída"
              optionKey="format"
              options={[
                { value: 'html', label: 'HTML (visualização)' },
                { value: 'json', label: 'JSON (dados)' },
                { value: 'csv', label: 'CSV (planilha)' }
              ]}
            />
          </View>
        );

      case 'batch':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Exportação em Lote</Text>
            
            <View style={styles.batchInfo}>
              <Text style={styles.batchInfoText}>
                📁 {projects.length} projeto(s) serão exportados
              </Text>
              <Text style={styles.batchInfoSubtext}>
                Cada projeto será exportado como um relatório separado
              </Text>
            </View>

            <OptionSwitch
              label="Especificações Técnicas"
              description="Incluir em todos os relatórios"
              optionKey="includeTechnicalSpecs"
            />
            
            <OptionSwitch
              label="Recomendações"
              description="Incluir em todos os relatórios"
              optionKey="includeRecommendations"
            />

            <OptionSelector
              label="Formato"
              optionKey="format"
              options={[
                { value: 'html', label: 'HTML' },
                { value: 'json', label: 'JSON' },
                { value: 'csv', label: 'CSV' }
              ]}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Exportação Avançada</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {project && (
            <Text style={styles.headerSubtitle}>
              Projeto: {project.name}
            </Text>
          )}
        </LinearGradient>

        <ScrollView style={styles.content}>
          {/* Export Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Exportação</Text>
            <View style={styles.typeGrid}>
              {exportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    exportType === type.id && styles.typeCardActive,
                    (type.id === 'batch' && (!projects || projects.length === 0)) && styles.typeCardDisabled
                  ]}
                  onPress={() => setExportType(type.id)}
                  disabled={type.id === 'batch' && (!projects || projects.length === 0)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeName,
                    exportType === type.id && styles.typeNameActive
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    exportType === type.id && styles.typeDescriptionActive
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Export Options */}
          {renderExportOptions()}

          {/* Export Button */}
          <View style={styles.exportButtonContainer}>
            <TouchableOpacity
              style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
              onPress={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.exportButtonText}>Exportando...</Text>
                </View>
              ) : (
                <Text style={styles.exportButtonText}>
                  🚀 Iniciar Exportação
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>ℹ️ Informações</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                • Os arquivos exportados serão salvos no diretório de documentos do app
              </Text>
              <Text style={styles.infoText}>
                • Você pode compartilhar os arquivos usando o menu de compartilhamento
              </Text>
              <Text style={styles.infoText}>
                • Relatórios PDF são otimizados para impressão em papel A4
              </Text>
              <Text style={styles.infoText}>
                • Arquivos de áudio são sínteses aproximadas baseadas na análise
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
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#F0F4FF',
  },
  typeCardDisabled: {
    opacity: 0.5,
  },
  typeIcon: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  typeName: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  typeNameActive: {
    color: '#667eea',
  },
  typeDescription: {
    fontSize: typography.small,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  typeDescriptionActive: {
    color: '#4C51BF',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  optionLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionLabelDisabled: {
    color: '#9CA3AF',
  },
  optionDescription: {
    fontSize: typography.small,
    color: '#6B7280',
  },
  optionDescriptionDisabled: {
    color: '#D1D5DB',
  },
  selectorContainer: {
    marginVertical: spacing.sm,
  },
  selectorLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  selectorOptionActive: {
    backgroundColor: '#667eea',
  },
  selectorOptionText: {
    fontSize: typography.small,
    color: '#374151',
    fontWeight: '500',
  },
  selectorOptionTextActive: {
    color: '#FFFFFF',
  },
  parameterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  parameterLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#1F2937',
  },
  parameterButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  parameterButton: {
    width: 32,
    height: 32,
    backgroundColor: '#667eea',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parameterButtonText: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontWeight: 'bold',
  },
  batchInfo: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  batchInfoText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#059669',
    marginBottom: spacing.xs,
  },
  batchInfoSubtext: {
    fontSize: typography.small,
    color: '#047857',
  },
  exportButtonContainer: {
    marginVertical: spacing.lg,
  },
  exportButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  exportButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: typography.h3,
    fontWeight: '700',
  },
  infoSection: {
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },
  infoContainer: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: spacing.md,
  },
  infoText: {
    fontSize: typography.small,
    color: '#1E40AF',
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
});