import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

const PROJECTS_KEY = '@didgemap_projects';
const CURRENT_PROJECT_KEY = '@didgemap_current_project';
const USER_SETTINGS_KEY = '@didgemap_user_settings';
const TEMPLATES_KEY = '@didgemap_templates';
const FAVORITES_KEY = '@didgemap_favorites';

// Template de projeto padrão
const DEFAULT_PROJECT_TEMPLATE = {
  name: 'Novo Projeto',
  description: '',
  category: 'tradicional',
  geometry: '0.00 0.030\n0.50 0.045\n1.50 0.080',
  soundSpeed: 343,
  mouthpieceDiameter: 28,
  tags: [],
  notes: '',
  isFavorite: false,
  version: '1.0'
};

// Categorias pré-definidas
const PROJECT_CATEGORIES = {
  tradicional: 'Didgeridoo Tradicional',
  moderno: 'Design Moderno',
  experimental: 'Experimental',
  bell: 'Formato Campana',
  straight: 'Formato Reto',
  conical: 'Formato Cônico'
};

export class ProjectStorage {
  // Método para inicializar templates padrão
  static async initializeDefaultTemplates() {
    try {
      const existingTemplates = await this.getTemplates();
      if (existingTemplates.length === 0) {
        const defaultTemplates = [
          {
            id: 'trad_1',
            name: 'Didgeridoo Tradicional',
            category: 'tradicional',
            geometry: '0.00 0.030\n0.20 0.035\n0.50 0.045\n1.00 0.060\n1.50 0.080',
            description: 'Design tradicional australiano com abertura gradual',
            isTemplate: true
          },
          {
            id: 'bell_1',
            name: 'Formato Campana',
            category: 'bell',
            geometry: '0.00 0.030\n0.50 0.035\n1.00 0.045\n1.30 0.065\n1.50 0.090',
            description: 'Abertura tipo campana para maior projeção',
            isTemplate: true
          },
          {
            id: 'straight_1',
            name: 'Tubo Reto',
            category: 'straight',
            geometry: '0.00 0.040\n0.50 0.040\n1.00 0.040\n1.50 0.040',
            description: 'Diâmetro constante para som puro',
            isTemplate: true
          }
        ];
        await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
    }
  }
  static async saveProject(project) {
    try {
      const projects = await this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      const projectData = {
        ...DEFAULT_PROJECT_TEMPLATE,
        ...project,
        version: '1.0',
        lastModified: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        projects[existingIndex] = { 
          ...projectData, 
          updatedAt: new Date().toISOString(),
          modificationCount: (projects[existingIndex].modificationCount || 0) + 1
        };
      } else {
        projects.unshift({ 
          ...projectData, 
          id: project.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modificationCount: 1
        });
      }
      
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      
      // Auto-backup dos projetos importantes
      if (project.isFavorite) {
        await this.backupProject(projectData);
      }
      
      return projectData;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  static async getAllProjects() {
    try {
      const projectsJson = await AsyncStorage.getItem(PROJECTS_KEY);
      return projectsJson ? JSON.parse(projectsJson) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  static async getProject(id) {
    try {
      const projects = await this.getAllProjects();
      return projects.find(p => p.id === id);
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }

  static async deleteProject(id) {
    try {
      const projects = await this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== id);
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  static async setCurrentProject(project) {
    try {
      await AsyncStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(project));
    } catch (error) {
      console.error('Error setting current project:', error);
    }
  }

  static async getCurrentProject() {
    try {
      const projectJson = await AsyncStorage.getItem(CURRENT_PROJECT_KEY);
      return projectJson ? JSON.parse(projectJson) : null;
    } catch (error) {
      console.error('Error loading current project:', error);
      return null;
    }
  }

  // Gerenciamento de templates
  static async getTemplates() {
    try {
      const templatesJson = await AsyncStorage.getItem(TEMPLATES_KEY);
      return templatesJson ? JSON.parse(templatesJson) : [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  static async saveTemplate(template) {
    try {
      const templates = await this.getTemplates();
      const templateData = {
        ...template,
        id: template.id || `template_${Date.now()}`,
        isTemplate: true,
        createdAt: new Date().toISOString()
      };
      
      templates.unshift(templateData);
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      return templateData;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Gerenciamento de favoritos
  static async toggleFavorite(projectId) {
    try {
      const projects = await this.getAllProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex >= 0) {
        projects[projectIndex].isFavorite = !projects[projectIndex].isFavorite;
        projects[projectIndex].updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return projects[projectIndex];
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  static async getFavoriteProjects() {
    try {
      const projects = await this.getAllProjects();
      return projects.filter(p => p.isFavorite);
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  // Busca e filtros
  static async searchProjects(query, filters = {}) {
    try {
      const projects = await this.getAllProjects();
      let filtered = projects;
      
      // Filtro por texto
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.notes?.toLowerCase().includes(searchTerm) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      // Filtro por categoria
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      // Filtro por favoritos
      if (filters.favoritesOnly) {
        filtered = filtered.filter(p => p.isFavorite);
      }
      
      // Filtro por data
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        filtered = filtered.filter(p => {
          const created = new Date(p.createdAt);
          return created >= start && created <= end;
        });
      }
      
      return filtered;
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  // Backup e restauração
  static async backupProject(project) {
    try {
      const backupData = {
        project,
        timestamp: new Date().toISOString(),
        version: '1.0',
        app: 'Didgemap Calculator'
      };
      
      const filename = `didgemap_backup_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
      return fileUri;
    } catch (error) {
      console.error('Error backing up project:', error);
      throw error;
    }
  }

  static async exportProject(project, format = 'json') {
    try {
      let content, filename, mimeType;
      
      switch (format) {
        case 'json':
          content = JSON.stringify(project, null, 2);
          filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          content = this.projectToCSV(project);
          filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'txt':
          content = this.projectToText(project);
          filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
          mimeType = 'text/plain';
          break;
          
        default:
          throw new Error('Formato não suportado');
      }
      
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Exportar ${project.name}`
        });
      }
      
      return fileUri;
    } catch (error) {
      console.error('Error exporting project:', error);
      throw error;
    }
  }

  static async importProject() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain'],
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        const content = await FileSystem.readAsStringAsync(result.uri);
        const projectData = JSON.parse(content);
        
        // Validar estrutura do projeto
        if (this.validateProjectStructure(projectData)) {
          // Gerar novo ID para evitar conflitos
          const importedProject = {
            ...projectData,
            id: `imported_${Date.now()}`,
            name: `${projectData.name} (Importado)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await this.saveProject(importedProject);
          return importedProject;
        } else {
          throw new Error('Arquivo de projeto inválido');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error importing project:', error);
      throw error;
    }
  }

  // Utilitários
  static validateProjectStructure(project) {
    return project && 
           typeof project.name === 'string' &&
           typeof project.geometry === 'string' &&
           project.geometry.trim().length > 0;
  }

  static projectToCSV(project) {
    let csv = 'Propriedade,Valor\n';
    csv += `Nome,"${project.name}"\n`;
    csv += `Categoria,"${project.category || 'N/A'}"\n`;
    csv += `Descrição,"${project.description || 'N/A'}"\n`;
    csv += `Criado em,"${project.createdAt}"\n`;
    csv += `Modificado em,"${project.updatedAt}"\n`;
    
    if (project.results && project.results.length > 0) {
      csv += '\nAnálise de Harmônicos:\n';
      csv += 'Harmônico,Frequência (Hz),Nota,Oitava,Cents\n';
      project.results.forEach((result, index) => {
        csv += `${index + 1},${result.frequency.toFixed(2)},${result.note},${result.octave},${result.centDiff}\n`;
      });
    }
    
    csv += '\nGeometria DIDGMO:\n';
    csv += project.geometry.split('\n').map(line => `"${line}"`).join('\n');
    
    return csv;
  }

  static projectToText(project) {
    let text = `PROJETO DIDGEMAP: ${project.name}\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Categoria: ${project.category || 'N/A'}\n`;
    text += `Descrição: ${project.description || 'Sem descrição'}\n`;
    text += `Criado: ${new Date(project.createdAt).toLocaleString()}\n`;
    text += `Modificado: ${new Date(project.updatedAt).toLocaleString()}\n\n`;
    
    if (project.results && project.results.length > 0) {
      text += `ANÁLISE ACÚSTICA:\n`;
      text += `-----------------\n`;
      project.results.forEach((result, index) => {
        text += `Harmônico ${index + 1}: ${result.frequency.toFixed(2)} Hz (${result.note}${result.octave})\n`;
      });
      text += '\n';
    }
    
    text += `GEOMETRIA DIDGMO:\n`;
    text += `-----------------\n`;
    text += project.geometry;
    
    if (project.notes) {
      text += `\n\nNOTAS:\n`;
      text += `------\n`;
      text += project.notes;
    }
    
    return text;
  }

  // Estatísticas e relatórios
  static async getProjectStatistics() {
    try {
      const projects = await this.getAllProjects();
      
      const stats = {
        totalProjects: projects.length,
        favoriteProjects: projects.filter(p => p.isFavorite).length,
        categoryCounts: {},
        averageFrequency: 0,
        mostUsedCategory: '',
        oldestProject: null,
        newestProject: null,
        totalModifications: projects.reduce((sum, p) => sum + (p.modificationCount || 0), 0)
      };
      
      // Contagem por categoria
      projects.forEach(project => {
        const category = project.category || 'sem_categoria';
        stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
      });
      
      // Categoria mais usada
      stats.mostUsedCategory = Object.keys(stats.categoryCounts)
        .reduce((a, b) => stats.categoryCounts[a] > stats.categoryCounts[b] ? a : b, '');
      
      // Projetos mais antigo e mais novo
      if (projects.length > 0) {
        stats.oldestProject = projects.reduce((oldest, project) => 
          new Date(project.createdAt) < new Date(oldest.createdAt) ? project : oldest
        );
        
        stats.newestProject = projects.reduce((newest, project) => 
          new Date(project.createdAt) > new Date(newest.createdAt) ? project : newest
        );
      }
      
      // Frequência média dos drones
      const dronesWithFreq = projects.filter(p => p.results && p.results[0]?.frequency);
      if (dronesWithFreq.length > 0) {
        stats.averageFrequency = dronesWithFreq.reduce((sum, p) => 
          sum + p.results[0].frequency, 0
        ) / dronesWithFreq.length;
      }
      
      return stats;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return null;
    }
  }

  static async exportProjectsToCSV() {
    try {
      const projects = await this.getAllProjects();
      let csv = 'Nome,Categoria,Frequência Drone,Nota,Comprimento,Favorito,Criado em,Modificado em\n';
      
      projects.forEach(project => {
        const drone = project.results?.[0];
        const geometry = project.geometry?.split('\n') || [];
        const length = geometry.length > 1 ? 
          parseFloat(geometry[geometry.length - 1]?.split(' ')[0] || '0') : 0;
        
        csv += `"${project.name}","${project.category || 'N/A'}",`;
        csv += `"${drone?.frequency?.toFixed(2) || 'N/A'}","${drone ? drone.note + drone.octave : 'N/A'}",`;
        csv += `"${length.toFixed(2)}m","${project.isFavorite ? 'Sim' : 'Não'}",`;
        csv += `"${new Date(project.createdAt).toLocaleString()}","${new Date(project.updatedAt).toLocaleString()}"\n`;
      });
      
      return csv;
    } catch (error) {
      console.error('Error exporting projects:', error);
      throw error;
    }
  }

  static async duplicateProject(projectId) {
    try {
      const originalProject = await this.getProject(projectId);
      if (!originalProject) throw new Error('Projeto não encontrado');
      
      const duplicatedProject = {
        ...originalProject,
        id: `copy_${Date.now()}`,
        name: `${originalProject.name} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modificationCount: 0,
        isFavorite: false
      };
      
      await this.saveProject(duplicatedProject);
      return duplicatedProject;
    } catch (error) {
      console.error('Error duplicating project:', error);
      throw error;
    }
  }
}