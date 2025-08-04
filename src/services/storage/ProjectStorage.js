import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { ProjectValidator } from '../validation/ProjectValidator';

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
      // Sanitizar dados de entrada
      const sanitizedProject = ProjectValidator.sanitizeProject(project);
      
      // Validar projeto antes de salvar
      const validation = ProjectValidator.validateForSave(sanitizedProject);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      const projects = await this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === sanitizedProject.id);
      
      const projectData = {
        ...DEFAULT_PROJECT_TEMPLATE,
        ...sanitizedProject,
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
          id: sanitizedProject.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modificationCount: 1
        });
      }
      
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      
      // Auto-backup dos projetos importantes
      if (projectData.isFavorite) {
        try {
          await this.backupProject(projectData);
        } catch (backupError) {
          console.warn('Auto-backup failed:', backupError);
          // Não falhar o salvamento por causa do backup
        }
      }
      
      return projectData;
    } catch (error) {
      console.error('Error saving project:', error);
      throw new Error(`Failed to save project: ${error.message}`);
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
      // Validar projeto antes de exportar
      const validation = ProjectValidator.validateForExport(project, format);
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }
      
      let content, filename, mimeType;
      
      // Gerar nome de arquivo seguro
      const safeFileName = project.name.replace(/[^a-zA-Z0-9\-_]/g, '_').substring(0, 50);
      
      switch (format) {
        case 'json':
          // Criar estrutura de exportação com metadados
          const exportData = {
            exportInfo: {
              app: 'Didgemap Calculator',
              version: '1.0',
              exportedAt: new Date().toISOString(),
              format: 'json'
            },
            project: project
          };
          content = JSON.stringify(exportData, null, 2);
          filename = `${safeFileName}_${Date.now()}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          content = this.projectToCSV(project);
          filename = `${safeFileName}_${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'txt':
          content = this.projectToText(project);
          filename = `${safeFileName}_${Date.now()}.txt`;
          mimeType = 'text/plain';
          break;
          
        default:
          throw new Error(`Formato não suportado: ${format}`);
      }
      
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Exportar ${project.name}`
        });
      }
      
      return {
        success: true,
        fileUri,
        filename,
        format,
        size: content.length
      };
    } catch (error) {
      console.error('Error exporting project:', error);
      throw new Error(`Failed to export project: ${error.message}`);
    }
  }

  static async importProject() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', 'text/csv'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return null;
      }
      
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      let projectData;
      
      // Detectar formato do arquivo
      const fileName = result.assets[0].name.toLowerCase();
      
      if (fileName.endsWith('.json')) {
        projectData = JSON.parse(content);
        
        // Se for backup do Didgemap, extrair projeto
        if (projectData.project && projectData.app === 'Didgemap Calculator') {
          projectData = projectData.project;
        }
      } else if (fileName.endsWith('.csv')) {
        projectData = this.parseCSVProject(content);
      } else {
        // Tentar como JSON primeiro, senão como texto
        try {
          projectData = JSON.parse(content);
        } catch {
          projectData = this.parseTextProject(content);
        }
      }
      
      // Validar e processar estrutura do projeto
      if (this.validateProjectStructure(projectData)) {
        // Gerar novo ID para evitar conflitos
        const importedProject = {
          ...DEFAULT_PROJECT_TEMPLATE,
          ...projectData,
          id: `imported_${Date.now()}`,
          name: `${projectData.name} (Importado)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modificationCount: 1,
          isImported: true,
          importedFrom: fileName,
          importedAt: new Date().toISOString()
        };
        
        await this.saveProject(importedProject);
        return importedProject;
      } else {
        throw new Error('Arquivo de projeto inválido ou formato não suportado');
      }
    } catch (error) {
      console.error('Error importing project:', error);
      if (error.message.includes('User cancelled')) {
        return null;
      }
      throw new Error(`Erro ao importar: ${error.message}`);
    }
  }

  // Parser para arquivos CSV
  static parseCSVProject(csvContent) {
    const lines = csvContent.split('\n');
    const project = { ...DEFAULT_PROJECT_TEMPLATE };
    
    let inGeometry = false;
    let geometryLines = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('Geometria DIDGMO:')) {
        inGeometry = true;
        continue;
      }
      
      if (inGeometry) {
        // Remover aspas da geometria
        const cleaned = trimmed.replace(/"/g, '');
        if (cleaned.match(/^\d+\.\d+\s+\d+\.\d+/)) {
          geometryLines.push(cleaned);
        }
        continue;
      }
      
      // Processar propriedades
      const [key, value] = line.split(',').map(s => s.replace(/"/g, '').trim());
      
      switch (key) {
        case 'Nome':
          project.name = value;
          break;
        case 'Categoria':
          project.category = value.toLowerCase();
          break;
        case 'Descrição':
          project.description = value !== 'N/A' ? value : '';
          break;
      }
    }
    
    if (geometryLines.length > 0) {
      project.geometry = geometryLines.join('\n');
    }
    
    return project;
  }

  // Parser para arquivos de texto
  static parseTextProject(textContent) {
    const project = { ...DEFAULT_PROJECT_TEMPLATE };
    const lines = textContent.split('\n');
    
    let inGeometry = false;
    let inNotes = false;
    let geometryLines = [];
    let notesLines = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('PROJETO DIDGEMAP:')) {
        project.name = trimmed.replace('PROJETO DIDGEMAP:', '').trim();
        continue;
      }
      
      if (trimmed.includes('Categoria:')) {
        project.category = trimmed.replace('Categoria:', '').trim().toLowerCase();
        continue;
      }
      
      if (trimmed.includes('Descrição:')) {
        const desc = trimmed.replace('Descrição:', '').trim();
        project.description = desc !== 'Sem descrição' ? desc : '';
        continue;
      }
      
      if (trimmed.includes('GEOMETRIA DIDGMO:')) {
        inGeometry = true;
        inNotes = false;
        continue;
      }
      
      if (trimmed.includes('NOTAS:')) {
        inGeometry = false;
        inNotes = true;
        continue;
      }
      
      if (inGeometry && trimmed.match(/^\d+\.\d+\s+\d+\.\d+/)) {
        geometryLines.push(trimmed);
      }
      
      if (inNotes && trimmed && !trimmed.match(/^-+$/)) {
        notesLines.push(trimmed);
      }
    }
    
    if (geometryLines.length > 0) {
      project.geometry = geometryLines.join('\n');
    }
    
    if (notesLines.length > 0) {
      project.notes = notesLines.join('\n');
    }
    
    return project;
  }

  // Utilitários - mantido por compatibilidade, mas usa o novo validador
  static validateProjectStructure(project) {
    const validation = ProjectValidator.validateProjectStructure(project);
    return validation.isValid;
  }
  
  // Método mais detalhado que retorna erros
  static validateProjectWithDetails(project) {
    return ProjectValidator.validateProjectStructure(project);
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

  // Auto-salvamento
  static async enableAutoSave(projectId, intervalMs = 30000) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        const currentProject = await this.getCurrentProject();
        if (currentProject && currentProject.id === projectId) {
          await this.saveProject({
            ...currentProject,
            lastAutoSave: new Date().toISOString()
          });
        }
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, intervalMs);
  }

  static disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Exportação em lote
  static async exportMultipleProjects(projects, format = 'json') {
    try {
      if (!projects || projects.length === 0) {
        throw new Error('Nenhum projeto selecionado para exportação');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let filename, content, mimeType;

      switch (format) {
        case 'json':
          content = JSON.stringify({
            exportInfo: {
              app: 'Didgemap Calculator',
              version: '1.0',
              exportedAt: new Date().toISOString(),
              totalProjects: projects.length
            },
            projects: projects
          }, null, 2);
          filename = `didgemap_projetos_${timestamp}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          content = await this.projectsToCSV(projects);
          filename = `didgemap_projetos_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;

        case 'zip':
          // Para futuro: compactar múltiplos arquivos
          content = await this.projectsToZip(projects);
          filename = `didgemap_projetos_${timestamp}.zip`;
          mimeType = 'application/zip';
          break;

        default:
          throw new Error('Formato não suportado');
      }

      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Exportar ${projects.length} projetos`
        });
      }

      return {
        success: true,
        fileUri,
        projectCount: projects.length,
        format
      };
    } catch (error) {
      console.error('Error exporting multiple projects:', error);
      throw error;
    }
  }

  // Converter múltiplos projetos para CSV
  static async projectsToCSV(projects) {
    let csv = 'Nome,Categoria,Frequência Drone,Nota,Comprimento (m),Favorito,Criado,Modificado,Tags,Descrição\n';
    
    projects.forEach(project => {
      const drone = project.results?.[0];
      const geometry = project.geometry?.split('\n') || [];
      const length = geometry.length > 1 ? 
        parseFloat(geometry[geometry.length - 1]?.split(' ')[0] || '0') : 0;
      
      const tags = project.tags ? project.tags.join(';') : '';
      const description = (project.description || '').replace(/"/g, '""');
      
      csv += `"${project.name}","${project.category || 'N/A'}",`;
      csv += `"${drone?.frequency?.toFixed(2) || 'N/A'}","${drone ? drone.note + drone.octave : 'N/A'}",`;
      csv += `"${length.toFixed(2)}","${project.isFavorite ? 'Sim' : 'Não'}",`;
      csv += `"${new Date(project.createdAt).toLocaleString()}","${new Date(project.updatedAt).toLocaleString()}",`;
      csv += `"${tags}","${description}"\n`;
    });
    
    return csv;
  }

  // Importação em lote
  static async importMultipleProjects() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return null;
      }

      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);

      let projects = [];

      // Verificar se é exportação do Didgemap
      if (data.exportInfo && data.projects) {
        projects = data.projects;
      } else if (Array.isArray(data)) {
        projects = data;
      } else {
        throw new Error('Formato de arquivo não reconhecido');
      }

      const importedProjects = [];
      const errors = [];

      for (let i = 0; i < projects.length; i++) {
        try {
          const project = projects[i];
          
          if (this.validateProjectStructure(project)) {
            const importedProject = {
              ...DEFAULT_PROJECT_TEMPLATE,
              ...project,
              id: `batch_imported_${Date.now()}_${i}`,
              name: `${project.name} (Importado)`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              modificationCount: 1,
              isImported: true,
              importedFrom: result.assets[0].name,
              importedAt: new Date().toISOString()
            };

            await this.saveProject(importedProject);
            importedProjects.push(importedProject);
          } else {
            errors.push(`Projeto ${project.name || i + 1}: estrutura inválida`);
          }
        } catch (error) {
          errors.push(`Projeto ${i + 1}: ${error.message}`);
        }
      }

      return {
        success: true,
        imported: importedProjects.length,
        total: projects.length,
        errors: errors,
        projects: importedProjects
      };
    } catch (error) {
      console.error('Error importing multiple projects:', error);
      throw new Error(`Erro na importação em lote: ${error.message}`);
    }
  }

  // Sincronização com armazenamento em nuvem (preparação futura)
  static async syncWithCloud(provider = 'icloud') {
    // Placeholder para sincronização futura
    console.log(`Cloud sync with ${provider} - not implemented yet`);
    return {
      success: false,
      message: 'Sincronização em nuvem não implementada ainda'
    };
  }

  // Limpeza de projetos antigos
  static async cleanupOldProjects(daysThreshold = 90) {
    try {
      const projects = await this.getAllProjects();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

      const toDelete = projects.filter(project => {
        const lastModified = new Date(project.updatedAt);
        return !project.isFavorite && lastModified < cutoffDate;
      });

      for (const project of toDelete) {
        await this.deleteProject(project.id);
      }

      return {
        deleted: toDelete.length,
        total: projects.length,
        threshold: daysThreshold
      };
    } catch (error) {
      console.error('Error cleaning up projects:', error);
      throw error;
    }
  }
}