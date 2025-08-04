import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProjectStorage } from '../services/storage/ProjectStorage';
import { AdvancedExport } from './AdvancedExport';
import { localizationService } from '../services/i18n/LocalizationService';
import { getDeviceInfo, getTypography, getSpacing, scale } from '../utils/responsive';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export const ProjectManager = ({ 
  visible, 
  onClose, 
  onProjectSelect, 
  currentProject 
}) => {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [selectedProjectForExport, setSelectedProjectForExport] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Novo projeto
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('tradicional');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = {
    all: 'Todos',
    tradicional: 'Tradicional',
    moderno: 'Moderno',
    experimental: 'Experimental',
    bell: 'Campana',
    straight: 'Reto',
    conical: 'Cônico'
  };

  const sortOptions = {
    recent: 'Mais Recente',
    name: 'Nome A-Z',
    favorite: 'Favoritos Primeiro',
    frequency: 'Por Frequência'
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, selectedCategory, showFavoritesOnly, sortBy]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await ProjectStorage.initializeDefaultTemplates();
      const [projectsData, templatesData] = await Promise.all([
        ProjectStorage.getAllProjects(),
        ProjectStorage.getTemplates()
      ]);
      
      setProjects(projectsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erro', 'Falha ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const applyFilters = () => {
    let filtered = [...projects];

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.notes?.toLowerCase().includes(query)
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Filtro por favoritos
    if (showFavoritesOnly) {
      filtered = filtered.filter(project => project.isFavorite);
    }

    // Ordenação
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'favorite':
        filtered.sort((a, b) => {
          if (a.isFavorite === b.isFavorite) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          }
          return b.isFavorite - a.isFavorite;
        });
        break;
      case 'frequency':
        filtered.sort((a, b) => {
          const freqA = a.results?.[0]?.frequency || 0;
          const freqB = b.results?.[0]?.frequency || 0;
          return freqA - freqB;
        });
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    setFilteredProjects(filtered);
  };

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    onClose();
  };

  const handleToggleFavorite = async (projectId) => {
    try {
      const updatedProject = await ProjectStorage.toggleFavorite(projectId);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? updatedProject : p
      ));
    } catch (error) {
      Alert.alert('Erro', 'Falha ao alterar favorito');
    }
  };

  const handleDeleteProject = (project) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o projeto "${project.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProjectStorage.deleteProject(project.id);
              setProjects(prev => prev.filter(p => p.id !== project.id));
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir projeto');
            }
          }
        }
      ]
    );
  };

  const handleDuplicateProject = async (project) => {
    try {
      const duplicated = await ProjectStorage.duplicateProject(project.id);
      setProjects(prev => [duplicated, ...prev]);
      Alert.alert('Sucesso', `Projeto "${duplicated.name}" criado com sucesso!`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao duplicar projeto');
    }
  };

  const handleExportProject = async (project) => {
    Alert.alert(
      'Exportar Projeto',
      'Escolha o tipo de exportação:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportação Simples',
          onPress: () => showSimpleExportOptions(project)
        },
        {
          text: 'Exportação Avançada',
          onPress: () => {
            setSelectedProjectForExport(project);
            setShowAdvancedExport(true);
          }
        }
      ]
    );
  };

  const showSimpleExportOptions = (project) => {
    Alert.alert(
      'Exportação Simples',
      'Escolha o formato:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'JSON',
          onPress: () => exportProject(project, 'json')
        },
        {
          text: 'CSV',
          onPress: () => exportProject(project, 'csv')
        },
        {
          text: 'Texto',
          onPress: () => exportProject(project, 'txt')
        }
      ]
    );
  };

  const exportProject = async (project, format) => {
    try {
      await ProjectStorage.exportProject(project, format);
      Alert.alert('Sucesso', `Projeto exportado como ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao exportar projeto');
    }
  };

  const handleCreateNewProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Erro', 'Nome do projeto é obrigatório');
      return;
    }

    try {
      const baseGeometry = selectedTemplate?.geometry || '0.00 0.030\n0.50 0.045\n1.50 0.080';
      
      const newProject = {
        name: newProjectName.trim(),
        category: newProjectCategory,
        description: newProjectDescription.trim(),
        geometry: baseGeometry,
        soundSpeed: 343,
        mouthpieceDiameter: 28,
        tags: [],
        notes: '',
        isFavorite: false
      };

      const savedProject = await ProjectStorage.saveProject(newProject);
      setProjects(prev => [savedProject, ...prev]);
      
      // Reset form
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTemplate(null);
      setShowNewProjectModal(false);
      
      Alert.alert('Sucesso', 'Projeto criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar projeto');
    }
  };

  const loadStatistics = async () => {
    try {
      const statsData = await ProjectStorage.getProjectStatistics();
      setStats(statsData);
      setShowStatsModal(true);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar estatísticas');
    }
  };

  const handleImportProject = async () => {
    try {
      const importedProject = await ProjectStorage.importProject();
      if (importedProject) {
        setProjects(prev => [importedProject, ...prev]);
        Alert.alert('Sucesso', 'Projeto importado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao importar projeto');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const ProjectCard = ({ project }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.projectCategory}>
            {categories[project.category] || project.category}
          </Text>
          {project.results && project.results[0] && (
            <Text style={styles.projectFrequency}>
              {project.results[0].frequency.toFixed(1)} Hz ({project.results[0].note}{project.results[0].octave})
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(project.id)}
        >
          <Text style={styles.favoriteIcon}>
            {project.isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.projectDescription} numberOfLines={2}>
        {project.description || 'Sem descrição'}
      </Text>

      <Text style={styles.projectDate}>
        Modificado: {formatDate(project.updatedAt)}
      </Text>

      <View style={styles.projectActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.selectButton]}
          onPress={() => handleProjectSelect(project)}
        >
          <Text style={styles.actionButtonText}>📂 Abrir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.duplicateButton]}
          onPress={() => handleDuplicateProject(project)}
        >
          <Text style={styles.actionButtonText}>📋 Copiar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={() => handleExportProject(project)}
        >
          <Text style={styles.actionButtonText}>📤 Exportar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProject(project)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Gerenciador de Projetos</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setShowNewProjectModal(true)}
            >
              <Text style={styles.controlButtonText}>➕ Novo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {Object.entries(categories).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  selectedCategory === key && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === key && styles.filterChipTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.toggleButton, showFavoritesOnly && styles.toggleButtonActive]}
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Text style={styles.toggleButtonText}>⭐ Só Favoritos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={loadStatistics}
            >
              <Text style={styles.controlButtonText}>📊 Stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleImportProject}
            >
              <Text style={styles.controlButtonText}>📥 Importar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setSelectedProjectForExport(null);
                setShowAdvancedExport(true);
              }}
              disabled={filteredProjects.length === 0}
            >
              <Text style={styles.controlButtonText}>📤 Lote</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project List */}
        <ScrollView
          style={styles.projectList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Carregando projetos...</Text>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'all' || showFavoritesOnly
                  ? 'Nenhum projeto encontrado com os filtros aplicados'
                  : 'Nenhum projeto encontrado\nCrie seu primeiro projeto!'}
              </Text>
            </View>
          ) : (
            filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </ScrollView>

        {/* New Project Modal */}
        <Modal visible={showNewProjectModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Novo Projeto</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Nome do projeto"
                value={newProjectName}
                onChangeText={setNewProjectName}
              />
              
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Descrição (opcional)"
                value={newProjectDescription}
                onChangeText={setNewProjectDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.modalLabel}>Categoria:</Text>
              <ScrollView horizontal style={styles.categorySelector}>
                {Object.entries(categories).filter(([key]) => key !== 'all').map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      newProjectCategory === key && styles.categoryChipActive
                    ]}
                    onPress={() => setNewProjectCategory(key)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      newProjectCategory === key && styles.categoryChipTextActive
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {templates.length > 0 && (
                <>
                  <Text style={styles.modalLabel}>Template (opcional):</Text>
                  <ScrollView horizontal style={styles.templateSelector}>
                    <TouchableOpacity
                      style={[
                        styles.templateChip,
                        !selectedTemplate && styles.templateChipActive
                      ]}
                      onPress={() => setSelectedTemplate(null)}
                    >
                      <Text style={styles.templateChipText}>Vazio</Text>
                    </TouchableOpacity>
                    {templates.map(template => (
                      <TouchableOpacity
                        key={template.id}
                        style={[
                          styles.templateChip,
                          selectedTemplate?.id === template.id && styles.templateChipActive
                        ]}
                        onPress={() => setSelectedTemplate(template)}
                      >
                        <Text style={styles.templateChipText}>{template.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowNewProjectModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCreateButton]}
                  onPress={handleCreateNewProject}
                >
                  <Text style={[styles.modalButtonText, styles.modalCreateButtonText]}>Criar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Statistics Modal */}
        <Modal visible={showStatsModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Estatísticas dos Projetos</Text>
              
              {stats && (
                <ScrollView style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total de Projetos:</Text>
                    <Text style={styles.statValue}>{stats.totalProjects}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Projetos Favoritos:</Text>
                    <Text style={styles.statValue}>{stats.favoriteProjects}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Categoria Mais Usada:</Text>
                    <Text style={styles.statValue}>
                      {categories[stats.mostUsedCategory] || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Frequência Média:</Text>
                    <Text style={styles.statValue}>
                      {stats.averageFrequency.toFixed(1)} Hz
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total de Modificações:</Text>
                    <Text style={styles.statValue}>{stats.totalModifications}</Text>
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCloseButton]}
                onPress={() => setShowStatsModal(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Advanced Export Modal */}
        <AdvancedExport
          visible={showAdvancedExport}
          onClose={() => {
            setShowAdvancedExport(false);
            setSelectedProjectForExport(null);
          }}
          project={selectedProjectForExport}
          projects={selectedProjectForExport ? undefined : filteredProjects}
        />
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
  controls: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.body,
  },
  controlButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '600',
  },
  filterRow: {
    marginBottom: spacing.sm,
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: typography.caption,
    color: '#64748B',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  toggleButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#F59E0B',
  },
  toggleButtonText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#374151',
  },
  projectList: {
    flex: 1,
    padding: spacing.md,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  projectCategory: {
    fontSize: typography.caption,
    color: '#6B7280',
    marginBottom: 2,
  },
  projectFrequency: {
    fontSize: typography.small,
    color: '#059669',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  projectDescription: {
    fontSize: typography.small,
    color: '#6B7280',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  projectDate: {
    fontSize: typography.caption,
    color: '#9CA3AF',
    marginBottom: spacing.sm,
  },
  projectActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#10B981',
  },
  duplicateButton: {
    backgroundColor: '#3B82F6',
  },
  exportButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flex: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    marginBottom: spacing.sm,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  categorySelector: {
    marginBottom: spacing.sm,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    fontSize: typography.caption,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  templateSelector: {
    marginBottom: spacing.md,
  },
  templateChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  templateChipActive: {
    backgroundColor: '#F59E0B',
  },
  templateChipText: {
    fontSize: typography.caption,
    color: '#92400E',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalCreateButton: {
    backgroundColor: '#10B981',
  },
  modalCloseButton: {
    backgroundColor: '#667eea',
    marginTop: spacing.md,
  },
  modalButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#374151',
  },
  modalCreateButtonText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    maxHeight: 300,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: typography.body,
    color: '#374151',
  },
  statValue: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#059669',
  },
});