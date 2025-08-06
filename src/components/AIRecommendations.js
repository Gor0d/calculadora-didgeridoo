import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import didgeridooAI from '../services/ai/DidgeridooAI';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const AIRecommendations = ({ 
  visible, 
  onClose, 
  onSelectRecommendation,
  initialPreferences = {} 
}) => {
  const [preferences, setPreferences] = useState({
    targetNote: 'D',
    targetOctave: 2,
    playStyle: 'traditional',
    experience: 'beginner',
    size: 'standard',
    toneCharacter: 'balanced',
    budget: 'medium',
    materials: ['wood'],
    ...initialPreferences
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    if (visible && !showPreferences && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [visible, showPreferences]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      const result = await didgeridooAI.recommendDidgeridoo(preferences);
      
      if (result.success) {
        setRecommendations(result.recommendations);
      } else {
        Alert.alert('Erro IA', 'Não foi possível gerar recomendações: ' + result.error);
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
      Alert.alert('Erro', 'Falha ao conectar com sistema de IA');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateRecommendations = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics não disponível
    }

    setShowPreferences(false);
    await generateRecommendations();
  };

  const handleSelectRecommendation = async (recommendation) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics não disponível
    }

    setSelectedRecommendation(recommendation);
  };

  const handleUseRecommendation = async () => {
    if (selectedRecommendation && onSelectRecommendation) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        // Haptics não disponível
      }

      onSelectRecommendation(selectedRecommendation);
      onClose();
    }
  };

  const renderPreferenceSelector = (title, key, options) => (
    <View style={styles.preferenceGroup}>
      <Text style={styles.preferenceTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              preferences[key] === option.value && styles.optionButtonActive
            ]}
            onPress={() => handlePreferenceChange(key, option.value)}
          >
            <Text style={[
              styles.optionText,
              preferences[key] === option.value && styles.optionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecommendationCard = (recommendation, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.recommendationCard,
        selectedRecommendation === recommendation && styles.recommendationCardSelected
      ]}
      onPress={() => handleSelectRecommendation(recommendation)}
    >
      <LinearGradient
        colors={selectedRecommendation === recommendation ? 
          ['#10B981', '#059669'] : 
          ['#374151', '#4B5563']}
        style={styles.cardGradient}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{recommendation.name}</Text>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>
                {recommendation.source === 'ai' ? '🤖 IA' : '🏛️ Tradicional'}
              </Text>
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{Math.round(recommendation.score)}%</Text>
          </View>
        </View>

        {/* Características */}
        <View style={styles.characteristicsContainer}>
          {recommendation.characteristics?.slice(0, 4).map(char => (
            <View key={char} style={styles.characteristicTag}>
              <Text style={styles.characteristicText}>{char}</Text>
            </View>
          ))}
        </View>

        {/* Informações Musicais */}
        <View style={styles.musicalInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🎵 Tom:</Text>
            <Text style={styles.infoValue}>
              {recommendation.targetNote}{recommendation.octave}
            </Text>
          </View>
          {recommendation.analysis?.fundamentalFrequency && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔊 Freq:</Text>
              <Text style={styles.infoValue}>
                {Math.round(recommendation.analysis.fundamentalFrequency)} Hz
              </Text>
            </View>
          )}
        </View>

        {/* Visualização da Geometria */}
        {recommendation.geometry && (
          <View style={styles.geometryPreview}>
            <Text style={styles.geometryTitle}>Perfil do Bore:</Text>
            {renderGeometryVisualization(recommendation.geometry)}
          </View>
        )}

        {/* Confiança */}
        {recommendation.confidence && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confiança da IA:</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${recommendation.confidence * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(recommendation.confidence * 100)}%
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderGeometryVisualization = (geometryString) => {
    try {
      const parts = geometryString.split(':')[1]?.split(',');
      if (!parts || parts.length < 2) return null;
      
      const length = parseInt(parts[0]);
      const diameters = parts.slice(1).map(d => parseInt(d));
      
      const svgWidth = SCREEN_WIDTH - 80;
      const svgHeight = 80;
      const maxDiameter = Math.max(...diameters);
      const scale = (svgHeight - 20) / maxDiameter;
      
      const points = diameters.map((d, i) => ({
        x: (i / (diameters.length - 1)) * (svgWidth - 20) + 10,
        y: svgHeight / 2,
        radius: d * scale / 2
      }));
      
      return (
        <Svg width={svgWidth} height={svgHeight} style={styles.geometrySvg}>
          {/* Top line */}
          <Line
            x1={points[0].x}
            y1={points[0].y - points[0].radius}
            x2={points[points.length - 1].x}
            y2={points[points.length - 1].y - points[points.length - 1].radius}
            stroke="#10B981"
            strokeWidth="2"
          />
          
          {/* Bottom line */}
          <Line
            x1={points[0].x}
            y1={points[0].y + points[0].radius}
            x2={points[points.length - 1].x}
            y2={points[points.length - 1].y + points[points.length - 1].radius}
            stroke="#10B981"
            strokeWidth="2"
          />
          
          {/* Diameter points */}
          {points.map((point, i) => (
            <Circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#FFFFFF"
            />
          ))}
          
          {/* Length label */}
          <SvgText
            x={svgWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#9CA3AF"
          >
            {length}mm
          </SvgText>
        </Svg>
      );
    } catch (error) {
      return <Text style={styles.geometryError}>Erro na visualização</Text>;
    }
  };

  const renderDetailedView = () => {
    if (!selectedRecommendation) return null;
    
    const rec = selectedRecommendation;
    
    return (
      <ScrollView style={styles.detailView} showsVerticalScrollIndicator={false}>
        <Text style={styles.detailTitle}>{rec.name}</Text>
        
        {/* Análise Detalhada */}
        {rec.analysis && (
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>📊 Análise Acústica</Text>
            
            <View style={styles.analysisGrid}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Frequência Fundamental</Text>
                <Text style={styles.analysisValue}>
                  {Math.round(rec.analysis.fundamentalFrequency)} Hz
                </Text>
              </View>
              
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Diâmetro Médio</Text>
                <Text style={styles.analysisValue}>
                  {rec.analysis.bore?.averageDiameter} mm
                </Text>
              </View>
              
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Razão de Afilamento</Text>
                <Text style={styles.analysisValue}>
                  {rec.analysis.bore?.taperRatio}%
                </Text>
              </View>
              
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Volume Interno</Text>
                <Text style={styles.analysisValue}>
                  {rec.analysis.volume} cm³
                </Text>
              </View>
            </View>
            
            {/* Tocabilidade */}
            {rec.analysis.playability && (
              <View style={styles.playabilitySection}>
                <Text style={styles.subSectionTitle}>🎯 Tocabilidade</Text>
                <Text style={styles.playabilityText}>
                  • Controle de respiração: {rec.analysis.playability.breathControl}
                </Text>
                <Text style={styles.playabilityText}>
                  • Contrapressão: {rec.analysis.playability.backpressure}
                </Text>
                <Text style={styles.playabilityText}>
                  • Amigável para iniciantes: {rec.analysis.playability.beginnerFriendly ? 'Sim' : 'Não'}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Dicas de Construção */}
        {rec.buildingTips && rec.buildingTips.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>🔨 Dicas de Construção</Text>
            {rec.buildingTips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        )}
        
        {/* Estimativa de Custo */}
        {rec.estimatedCost && (
          <View style={styles.costSection}>
            <Text style={styles.sectionTitle}>💰 Estimativa de Custo</Text>
            <View style={styles.costBreakdown}>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Total Estimado:</Text>
                <Text style={styles.costValue}>
                  ${rec.estimatedCost.estimatedCost} {rec.estimatedCost.currency}
                </Text>
              </View>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Tempo Estimado:</Text>
                <Text style={styles.costValue}>{rec.estimatedCost.timeEstimate}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Botão de Usar */}
        <TouchableOpacity style={styles.useButton} onPress={handleUseRecommendation}>
          <Text style={styles.useButtonText}>✅ Usar Esta Configuração</Text>
        </TouchableOpacity>
      </ScrollView>
    );
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
        colors={['#0F172A', '#1E293B']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (!showPreferences && !selectedRecommendation) {
                setShowPreferences(true);
                setRecommendations([]);
              } else if (selectedRecommendation) {
                setSelectedRecommendation(null);
              } else {
                onClose();
              }
            }}
          >
            <Text style={styles.backButtonText}>
              {!showPreferences && !selectedRecommendation ? '⚙️' : selectedRecommendation ? '←' : '✕'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {selectedRecommendation ? 'Detalhes' : showPreferences ? '🤖 IA - Preferências' : '🤖 Recomendações IA'}
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        {showPreferences ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.introText}>
              Configure suas preferências para receber recomendações personalizadas de didgeridoo
            </Text>

            {renderPreferenceSelector('🎵 Tom Desejado', 'targetNote', [
              { value: 'C', label: 'C' }, { value: 'D', label: 'D' },
              { value: 'E', label: 'E' }, { value: 'F', label: 'F' },
              { value: 'G', label: 'G' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }
            ])}

            {renderPreferenceSelector('🎼 Oitava', 'targetOctave', [
              { value: 2, label: '2ª' }, { value: 3, label: '3ª' }, { value: 4, label: '4ª' }
            ])}

            {renderPreferenceSelector('🎯 Estilo de Toque', 'playStyle', [
              { value: 'traditional', label: 'Tradicional' },
              { value: 'modern', label: 'Moderno' },
              { value: 'meditative', label: 'Meditativo' },
              { value: 'rhythmic', label: 'Rítmico' }
            ])}

            {renderPreferenceSelector('📚 Experiência', 'experience', [
              { value: 'beginner', label: 'Iniciante' },
              { value: 'intermediate', label: 'Intermediário' },
              { value: 'advanced', label: 'Avançado' }
            ])}

            {renderPreferenceSelector('📏 Tamanho', 'size', [
              { value: 'compact', label: 'Compacto' },
              { value: 'standard', label: 'Padrão' },
              { value: 'large', label: 'Grande' }
            ])}

            {renderPreferenceSelector('🎨 Caráter do Tom', 'toneCharacter', [
              { value: 'bright', label: 'Brilhante' },
              { value: 'deep', label: 'Profundo' },
              { value: 'balanced', label: 'Equilibrado' },
              { value: 'complex', label: 'Complexo' }
            ])}

            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={handleGenerateRecommendations}
            >
              <Text style={styles.generateButtonText}>🚀 Gerar Recomendações</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : selectedRecommendation ? (
          renderDetailedView()
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🤖 IA analisando suas preferências...</Text>
                <Text style={styles.loadingSubtext}>
                  Processando milhares de configurações acústicas
                </Text>
              </View>
            ) : recommendations.length > 0 ? (
              <>
                <Text style={styles.resultsHeader}>
                  {recommendations.length} recomendações encontradas para {preferences.targetNote}{preferences.targetOctave}
                </Text>
                {recommendations.map(renderRecommendationCard)}
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  Nenhuma recomendação encontrada. Tente ajustar suas preferências.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#10B981',
  },
  headerTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  introText: {
    fontSize: typography.body,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  preferenceGroup: {
    marginBottom: spacing.xl,
  },
  preferenceTitle: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#10B981',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: typography.small,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  generateButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: typography.h4,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.h3,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  loadingSubtext: {
    fontSize: typography.body,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  resultsHeader: {
    fontSize: typography.h4,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  recommendationCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recommendationCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  sourceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sourceTagText: {
    fontSize: typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scoreValue: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  characteristicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  characteristicTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  characteristicText: {
    fontSize: typography.caption,
    color: '#FFFFFF',
  },
  musicalInfo: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoValue: {
    fontSize: typography.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  geometryPreview: {
    marginBottom: spacing.md,
  },
  geometryTitle: {
    fontSize: typography.small,
    color: '#10B981',
    marginBottom: spacing.xs,
  },
  geometrySvg: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
  },
  geometryError: {
    color: '#9CA3AF',
    fontSize: typography.caption,
    fontStyle: 'italic',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: spacing.sm,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailView: {
    flex: 1,
  },
  detailTitle: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  analysisSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: spacing.md,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: 8,
  },
  analysisLabel: {
    fontSize: typography.caption,
    color: '#9CA3AF',
    marginBottom: spacing.xs,
  },
  analysisValue: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playabilitySection: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: spacing.md,
    borderRadius: 8,
  },
  subSectionTitle: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: spacing.sm,
  },
  playabilityText: {
    fontSize: typography.small,
    color: '#D1D5DB',
    marginBottom: spacing.xs,
  },
  tipsSection: {
    marginBottom: spacing.xl,
  },
  tipText: {
    fontSize: typography.small,
    color: '#D1D5DB',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  costSection: {
    marginBottom: spacing.xl,
  },
  costBreakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: 8,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  costLabel: {
    fontSize: typography.small,
    color: '#9CA3AF',
  },
  costValue: {
    fontSize: typography.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  useButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: typography.h4,
    fontWeight: '700',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  noResultsText: {
    fontSize: typography.body,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});