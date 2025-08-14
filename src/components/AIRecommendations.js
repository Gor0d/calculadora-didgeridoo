import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import didgeridooAI from '../services/ai/DidgeridooAI';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

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
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '🎵 Olá! Sou seu assistente de IA para didgeridoo. Posso ajudar você a encontrar a estrutura perfeita para seu instrumento.\n\n💬 **Digite sua dúvida** ou descreva o tom que você quer\n🎤 **Grave um áudio** com o som que deseja alcançar\n⚙️ **Configure preferências** para recomendações detalhadas\n\n*Em breve: Mais funções de IA estarão disponíveis!*',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    if (visible && !showPreferences && !showChat && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [visible, showPreferences, showChat]);
  
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('tom') || input.includes('nota') || input.includes('frequen')) {
      return '🎵 **Análise de Tom**\n\nPara sugerir a estrutura ideal, preciso de mais informações:\n\n• Que tom específico você quer? (Ex: D2, C3)\n• É para iniciante ou avançado?\n• Prefere som grave ou agudo?\n\n💡 **Dica:** Use as ⚙️ Preferências para uma análise completa, ou grave um áudio do tom desejado!';
    }
    
    if (input.includes('tamanho') || input.includes('comprimento') || input.includes('diametro')) {
      return '📏 **Dimensões do Didgeridoo**\n\n**Estrutura básica recomendada:**\n\n• **Comprimento:** 120-150cm (tom D-C)\n• **Diâmetro boca:** 28-35mm\n• **Diâmetro final:** 8-12cm\n• **Conicidade:** Gradual, 2-3% por seção\n\n🔧 Para especificações exatas baseadas no seu tom, use as **Preferências** para gerar recomendações personalizadas!';
    }
    
    if (input.includes('construir') || input.includes('fazer') || input.includes('madeira') || input.includes('material')) {
      return '🔨 **Construção de Didgeridoo**\n\n**Materiais recomendados:**\n• Eucalipto (tradicional)\n• PVC (iniciantes)\n• Bambu (leve e natural)\n\n**Processo básico:**\n1. Definir geometria (use nossa calculadora!)\n2. Preparar material\n3. Perfuração/moldagem\n4. Acabamento interno\n5. Boquilha de cera\n\n⚙️ Use as **Preferências** para dicas específicas do seu projeto!';
    }
    
    return '🤖 **Assistente IA - Didgeridoo**\n\nEntendi sua pergunta! Atualmente posso ajudar com:\n\n✅ **Estruturas básicas** de didgeridoo\n✅ **Dimensões** por tom musical\n✅ **Dicas de construção** gerais\n\n🔜 **Em breve:**\n• Análise de áudio em tempo real\n• Sugestões por gravação\n• Chat com IA avançada\n• Diagnóstico acústico\n\n💡 Para recomendações detalhadas, use as ⚙️ **Preferências**!';
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão Necessária', 'Preciso de acesso ao microfone para gravar áudio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {}
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {}
      
      // Add audio message to chat
      const audioMessage = {
        id: Date.now(),
        type: 'user',
        content: '🎤 Áudio gravado',
        audioUri: uri,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, audioMessage]);
      
      // Simulate AI audio analysis
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: '🎵 **Análise de Áudio** (Em Desenvolvimento)\n\nRecebi seu áudio! Em breve poderei:\n\n🔍 **Analisar frequências** do som gravado\n📊 **Identificar tom fundamental**\n🎯 **Sugerir estrutura** específica\n📐 **Calcular dimensões** exatas\n\n💡 **Por enquanto:** Use as ⚙️ Preferências para configurar manualmente o tom desejado e receber recomendações detalhadas!',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao processar a gravação.');
    }
  };

  const renderChatMessage = (message) => {
    const isUser = message.type === 'user';
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.aiMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          {message.audioUri ? (
            <View style={styles.audioMessage}>
              <Text style={styles.audioText}>🎤 Áudio gravado</Text>
              <Text style={styles.audioHint}>(Análise em desenvolvimento)</Text>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText
            ]}>
              {message.content}
            </Text>
          )}
        </View>
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
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
              if (showChat && !selectedRecommendation) {
                onClose();
              } else if (selectedRecommendation) {
                setSelectedRecommendation(null);
                setShowChat(true);
              } else if (showPreferences) {
                setShowPreferences(false);
                setShowChat(true);
              } else {
                setShowChat(true);
                setRecommendations([]);
              }
            }}
          >
            <Text style={styles.backButtonText}>
              {showChat ? '✕' : '←'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {selectedRecommendation ? 'Detalhes' : showPreferences ? '🤖 IA - Preferências' : showChat ? '🤖 Assistente IA' : '🤖 Recomendações'}
          </Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              if (showChat) {
                setShowPreferences(true);
                setShowChat(false);
              } else {
                // Future: Add more AI features here
                Alert.alert('Em Breve', 'Mais funções de IA estarão disponíveis em breve!');
              }
            }}
          >
            <Text style={styles.headerButtonText}>
              {showChat ? '⚙️' : '+'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {showChat ? (
          <KeyboardAvoidingView 
            style={styles.chatContainer} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.messagesContainer} 
              showsVerticalScrollIndicator={false}
              ref={scrollViewRef => {
                scrollViewRef?.scrollToEnd({ animated: true });
              }}
            >
              {chatMessages.map(renderChatMessage)}
            </ScrollView>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Descreva o tom ou faça uma pergunta..."
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.actionButton, isRecording && styles.recordingButton]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Text style={styles.actionButtonText}>
                    {isRecording ? '⏹️' : '🎤'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, !inputText.trim() && styles.disabledButton]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  <Text style={styles.actionButtonText}>📤</Text>
                </TouchableOpacity>
              </View>
              {isRecording && (
                <Text style={styles.recordingText}>
                  🎤 Gravando... Toque em ⏹️ para parar
                </Text>
              )}
            </View>
          </KeyboardAvoidingView>
        ) : showPreferences ? (
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
            
            <TouchableOpacity 
              style={styles.backToChatButton} 
              onPress={() => {
                setShowPreferences(false);
                setShowChat(true);
              }}
            >
              <Text style={styles.backToChatButtonText}>💬 Voltar ao Chat</Text>
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
    color: '#10B981',
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
  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  messageContainer: {
    marginVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.xs,
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.body,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: typography.caption,
    color: '#9CA3AF',
    marginBottom: spacing.sm,
  },
  audioMessage: {
    alignItems: 'center',
  },
  audioText: {
    fontSize: typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  audioHint: {
    fontSize: typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.xs,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: '#FFFFFF',
    fontSize: typography.body,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 20,
  },
  recordingText: {
    fontSize: typography.small,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  backToChatButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  backToChatButtonText: {
    color: '#10B981',
    fontSize: typography.h4,
    fontWeight: '600',
  },
});