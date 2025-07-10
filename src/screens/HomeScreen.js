import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ResponsiveLayout } from '../components/ui/ResponsiveLayout';
import { ResponsiveCard } from '../components/ui/ResponsiveCard';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

export default function HomeScreen({ navigation }) {
  const deviceInfo = useDeviceInfo();
  const [recentProjects] = useState([
    { id: 1, name: 'Didgeridoo Tradicional', note: 'G2', length: '150cm', lastModified: '2 dias atrás' },
    { id: 2, name: 'Grave Profundo', note: 'D2', length: '180cm', lastModified: '1 semana atrás' }
  ]);
  const [stats] = useState({
    totalProjects: 12,
    favoriteNote: 'G2',
    qualityScore: 87
  });

  const quickAnalysis = () => {
    Alert.alert(
      'Análise Rápida',
      'Para um didgeridoo em Sol (G2):\n\n• Comprimento: 150-160cm\n• Diâmetro inicial: 28-32mm\n• Diâmetro final: 75-85mm\n• Frequência esperada: ~98Hz',
      [{ text: 'OK' }]
    );
  };

  const openProject = (project) => {
    Alert.alert(
      'Projeto',
      `${project.name}\n${project.note} • ${project.length}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => navigation.navigate('Designer') },
        { text: 'Analisar', onPress: () => navigation.navigate('Analyzer') }
      ]
    );
  };

  // Header responsivo
  const HeaderComponent = () => (
    <View style={styles.headerContent}>
      <View style={styles.headerLeft}>
        <Text style={[
          styles.greeting, 
          { fontSize: deviceInfo.isSmall ? 14 : 16 }
        ]}>
          Olá! 👋
        </Text>
        <Text style={[
          styles.title, 
          { fontSize: deviceInfo.isSmall ? 18 : 22 }
        ]}>
          Bem-vindo ao Didgemap
        </Text>
      </View>
      <TouchableOpacity style={[
        styles.profileButton,
        { 
          width: deviceInfo.isSmall ? 35 : 40,
          height: deviceInfo.isSmall ? 35 : 40,
        }
      ]}>
        <Text style={[
          styles.profileIcon,
          { fontSize: deviceInfo.isSmall ? 16 : 20 }
        ]}>👤</Text>
      </TouchableOpacity>
    </View>
  );

  // Quick Actions responsivas
  const QuickActions = () => (
    <ResponsiveCard spacing="tight">
      <Text style={[
        styles.sectionTitle,
        { fontSize: deviceInfo.isSmall ? 16 : 18 }
      ]}>
        ⚡ Ações Rápidas
      </Text>
      <View style={[
        styles.quickActionsGrid,
        { 
          gap: deviceInfo.isSmall ? 10 : 15,
        }
      ]}>
        <TouchableOpacity 
          style={[styles.quickActionCard, getQuickActionSize()]}
          onPress={() => navigation.navigate('Designer')}
        >
          <Text style={[
            styles.quickActionEmoji,
            { fontSize: deviceInfo.isSmall ? 24 : 30 }
          ]}>🎨</Text>
          <Text style={[
            styles.quickActionText,
            { fontSize: deviceInfo.isSmall ? 12 : 14 }
          ]}>Criar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, getQuickActionSize()]}
          onPress={() => navigation.navigate('Analyzer')}
        >
          <Text style={[
            styles.quickActionEmoji,
            { fontSize: deviceInfo.isSmall ? 24 : 30 }
          ]}>🔬</Text>
          <Text style={[
            styles.quickActionText,
            { fontSize: deviceInfo.isSmall ? 12 : 14 }
          ]}>Analisar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, getQuickActionSize()]}
          onPress={quickAnalysis}
        >
          <Text style={[
            styles.quickActionEmoji,
            { fontSize: deviceInfo.isSmall ? 24 : 30 }
          ]}>💡</Text>
          <Text style={[
            styles.quickActionText,
            { fontSize: deviceInfo.isSmall ? 12 : 14 }
          ]}>Dicas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, getQuickActionSize()]}
        >
          <Text style={[
            styles.quickActionEmoji,
            { fontSize: deviceInfo.isSmall ? 24 : 30 }
          ]}>📚</Text>
          <Text style={[
            styles.quickActionText,
            { fontSize: deviceInfo.isSmall ? 12 : 14 }
          ]}>Biblioteca</Text>
        </TouchableOpacity>
      </View>
    </ResponsiveCard>
  );

  const getQuickActionSize = () => ({
    minHeight: deviceInfo.isSmall ? 70 : 80,
    flex: deviceInfo.width < 350 ? 1 : 0.23,
  });

  return (
    <ResponsiveLayout 
      headerComponent={<HeaderComponent />}
      backgroundColor="#F5F5DC"
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Stats Cards */}
        <View style={[
          styles.statsContainer,
          { gap: deviceInfo.isSmall ? 10 : 15 }
        ]}>
          <ResponsiveCard spacing="tight" style={styles.statCard}>
            <Text style={[
              styles.statNumber,
              { fontSize: deviceInfo.isSmall ? 20 : 24 }
            ]}>
              {stats.totalProjects}
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: deviceInfo.isSmall ? 10 : 12 }
            ]}>
              Projetos
            </Text>
          </ResponsiveCard>
          
          <ResponsiveCard spacing="tight" style={styles.statCard}>
            <Text style={[
              styles.statNumber,
              { fontSize: deviceInfo.isSmall ? 20 : 24 }
            ]}>
              {stats.favoriteNote}
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: deviceInfo.isSmall ? 10 : 12 }
            ]}>
              Nota Favorita
            </Text>
          </ResponsiveCard>
          
          <ResponsiveCard spacing="tight" style={styles.statCard}>
            <Text style={[
              styles.statNumber,
              { fontSize: deviceInfo.isSmall ? 20 : 24, color: '#27ae60' }
            ]}>
              {stats.qualityScore}%
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: deviceInfo.isSmall ? 10 : 12 }
            ]}>
              Qualidade
            </Text>
          </ResponsiveCard>
        </View>
        
        {/* Insight Card */}
        <TouchableOpacity 
          style={[styles.insightCard, getInsightCardStyle()]}
          onPress={quickAnalysis}
        >
          <Text style={[
            styles.insightEmoji,
            { fontSize: deviceInfo.isSmall ? 20 : 24 }
          ]}>💡</Text>
          <View style={styles.insightContent}>
            <Text style={[
              styles.insightTitle,
              { fontSize: deviceInfo.isSmall ? 14 : 16 }
            ]}>
              Insight do Dia
            </Text>
            <Text style={[
              styles.insightText,
              { fontSize: deviceInfo.isSmall ? 11 : 13 }
            ]}>
              Sua nota favorita é G2. Experimente designs mais longos para graves!
            </Text>
          </View>
          <Text style={[
            styles.arrow,
            { fontSize: deviceInfo.isSmall ? 16 : 18 }
          ]}>→</Text>
        </TouchableOpacity>
        
        {/* Recent Projects */}
        <ResponsiveCard>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              { fontSize: deviceInfo.isSmall ? 16 : 18 }
            ]}>
              📁 Projetos Recentes
            </Text>
            <TouchableOpacity>
              <Text style={[
                styles.seeAllText,
                { fontSize: deviceInfo.isSmall ? 12 : 14 }
              ]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          
          {recentProjects.map(project => (
            <TouchableOpacity 
              key={project.id} 
              style={[styles.projectCard, getProjectCardStyle()]}
              onPress={() => openProject(project)}
            >
              <View style={[
                styles.projectIcon,
                { 
                  width: deviceInfo.isSmall ? 40 : 50,
                  height: deviceInfo.isSmall ? 40 : 50,
                }
              ]}>
                <Text style={[
                  styles.projectEmoji,
                  { fontSize: deviceInfo.isSmall ? 16 : 20 }
                ]}>🎵</Text>
              </View>
              <View style={styles.projectInfo}>
                <Text style={[
                  styles.projectName,
                  { fontSize: deviceInfo.isSmall ? 14 : 16 }
                ]}>
                  {project.name}
                </Text>
                <Text style={[
                  styles.projectDetails,
                  { fontSize: deviceInfo.isSmall ? 10 : 12 }
                ]}>
                  {project.note} • {project.length} • {project.lastModified}
                </Text>
              </View>
              <Text style={[
                styles.projectArrow,
                { fontSize: deviceInfo.isSmall ? 14 : 16 }
              ]}>→</Text>
            </TouchableOpacity>
          ))}
        </ResponsiveCard>
        
        {/* Tips */}
        <ResponsiveCard>
          <Text style={[
            styles.sectionTitle,
            { fontSize: deviceInfo.isSmall ? 16 : 18 }
          ]}>
            💡 Dica de Construção
          </Text>
          <View style={styles.tipCard}>
            <Text style={[
              styles.tipTitle,
              { fontSize: deviceInfo.isSmall ? 14 : 16 }
            ]}>
              🌡️ Temperatura e Afinação
            </Text>
            <Text style={[
              styles.tipText,
              { fontSize: deviceInfo.isSmall ? 12 : 14 }
            ]}>
              A temperatura afeta a velocidade do som. Em dias quentes (30°C), 
              use 350 m/s. Em dias frios (10°C), use 337 m/s.
            </Text>
          </View>
        </ResponsiveCard>
      </ScrollView>
    </ResponsiveLayout>
  );

  function getInsightCardStyle() {
    return {
      padding: deviceInfo.isSmall ? 15 : 20,
      marginBottom: deviceInfo.isSmall ? 15 : 25,
    };
  }

  function getProjectCardStyle() {
    return {
      padding: deviceInfo.isSmall ? 12 : 15,
      marginBottom: deviceInfo.isSmall ? 8 : 10,
    };
  }
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  profileButton: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    color: 'white',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionEmoji: {
    marginBottom: 5,
  },
  quickActionText: {
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DAA520',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightEmoji: {
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  insightText: {
    color: 'white',
    lineHeight: 18,
  },
  arrow: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#2E8B57',
    fontWeight: '600',
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  projectIcon: {
    borderRadius: 25,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  projectEmoji: {
    color: '#2E8B57',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  projectDetails: {
    color: '#666',
  },
  projectArrow: {
    color: '#2E8B57',
    fontWeight: 'bold',
  },
  tipCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  tipTitle: {
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  tipText: {
    color: '#333',
    lineHeight: 20,
  },
});