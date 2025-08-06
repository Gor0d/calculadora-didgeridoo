import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProjectStorage } from '../../services/storage/ProjectStorage';

describe('ProjectStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('saveProject', () => {
    test('saves a valid project', async () => {
      const project = {
        id: 'test-project',
        name: 'Test Project',
        description: 'A test project',
        geometry: 'DIDGMO:1500,50,40,35,30,25,20',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await ProjectStorage.saveProject(project);
      
      expect(result.success).toBe(true);
      expect(result.project).toEqual(project);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('handles invalid project data', async () => {
      const invalidProject = {
        id: '',
        name: '',
        geometry: 'invalid-geometry'
      };

      const result = await ProjectStorage.saveProject(invalidProject);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles storage errors gracefully', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const project = {
        id: 'test-project',
        name: 'Test Project',
        geometry: 'DIDGMO:1500,50,40,35,30,25,20'
      };

      const result = await ProjectStorage.saveProject(project);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage error');
    });
  });

  describe('getProject', () => {
    test('retrieves existing project', async () => {
      const project = {
        id: 'test-project',
        name: 'Test Project',
        geometry: 'DIDGMO:1500,50,40,35,30,25,20'
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(project));
      
      const result = await ProjectStorage.getProject('test-project');
      
      expect(result).toEqual(project);
    });

    test('returns null for non-existent project', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await ProjectStorage.getProject('non-existent');
      
      expect(result).toBeNull();
    });

    test('handles corrupted project data', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('invalid-json');
      
      const result = await ProjectStorage.getProject('corrupted-project');
      
      expect(result).toBeNull();
    });
  });

  describe('getAllProjects', () => {
    test('retrieves all projects', async () => {
      const projects = [
        { id: 'project1', name: 'Project 1' },
        { id: 'project2', name: 'Project 2' }
      ];

      AsyncStorage.getAllKeys.mockResolvedValueOnce([
        'project_project1',
        'project_project2',
        'other_key'
      ]);
      
      AsyncStorage.multiGet.mockResolvedValueOnce([
        ['project_project1', JSON.stringify(projects[0])],
        ['project_project2', JSON.stringify(projects[1])]
      ]);
      
      const result = await ProjectStorage.getAllProjects();
      
      expect(result).toEqual(projects);
    });

    test('handles storage errors in getAllProjects', async () => {
      AsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await ProjectStorage.getAllProjects();
      
      expect(result).toEqual([]);
    });
  });

  describe('deleteProject', () => {
    test('deletes existing project', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ id: 'test' }));
      
      const result = await ProjectStorage.deleteProject('test');
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('project_test');
    });

    test('handles deletion of non-existent project', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await ProjectStorage.deleteProject('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('exportProject', () => {
    test('exports project in JSON format', async () => {
      const project = { id: 'test', name: 'Test', geometry: 'DIDGMO:1500,50' };
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(project));
      
      const result = await ProjectStorage.exportProject('test', 'json');
      
      expect(result.success).toBe(true);
      expect(result.data).toContain('"id":"test"');
      expect(result.filename).toContain('.json');
    });

    test('exports project in CSV format', async () => {
      const project = { 
        id: 'test', 
        name: 'Test', 
        geometry: 'DIDGMO:1500,50,40,35,30,25,20',
        description: 'Test project'
      };
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(project));
      
      const result = await ProjectStorage.exportProject('test', 'csv');
      
      expect(result.success).toBe(true);
      expect(result.data).toContain('Name,Description,Length');
      expect(result.filename).toContain('.csv');
    });
  });
});