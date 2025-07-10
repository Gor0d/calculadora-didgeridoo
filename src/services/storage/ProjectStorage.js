import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = '@didgemap_projects';
const CURRENT_PROJECT_KEY = '@didgemap_current_project';

export class ProjectStorage {
  static async saveProject(project) {
    try {
      const projects = await this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      if (existingIndex >= 0) {
        projects[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
      } else {
        projects.unshift({ 
          ...project, 
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      return project;
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

  static async exportProjectsToCSV() {
    try {
      const projects = await this.getAllProjects();
      let csv = 'Nome,Comprimento,Frequência,Nota,Criado em\n';
      
      projects.forEach(project => {
        if (project.analysis && project.analysis.length > 0) {
          const drone = project.analysis[0];
          csv += `"${project.name}","${project.length || 'N/A'}","${drone.frequency}","${drone.note}${drone.octave}","${project.createdAt}"\n`;
        }
      });
      
      return csv;
    } catch (error) {
      console.error('Error exporting projects:', error);
      throw error;
    }
  }
}