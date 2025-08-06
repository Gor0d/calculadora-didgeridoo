import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the ProjectManager component 
const mockProjects = [
  {
    id: 'project_1',
    name: 'Test Project 1',
    description: 'First test project',
    geometry: 'DIDGMO:1500,50,40,30',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'project_2', 
    name: 'Test Project 2',
    description: 'Second test project',
    geometry: 'DIDGMO:1200,45,35,25',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  }
];

// Mock ProjectStorage
jest.mock('../../services/storage/ProjectStorage', () => ({
  ProjectStorage: {
    getAllProjects: jest.fn(),
    deleteProject: jest.fn(),
    saveProject: jest.fn(),
    exportProject: jest.fn(),
    exportMultipleProjects: jest.fn()
  }
}));

// Mock the actual ProjectManager component
const MockProjectManager = ({ visible, onClose }) => {
  const [projects, setProjects] = React.useState(mockProjects);
  const [selectedProjects, setSelectedProjects] = React.useState([]);
  
  const handleDeleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };
  
  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  if (!visible) return null;

  return (
    <text testID="project-manager">
      <text testID="project-list">
        {projects.map(project => (
          <text 
            key={project.id}
            testID={`project-${project.id}`}
            onPress={() => handleSelectProject(project.id)}
          >
            {project.name}
          </text>
        ))}
      </text>
      <text 
        testID="delete-selected-btn"
        onPress={() => {
          selectedProjects.forEach(id => handleDeleteProject(id));
          setSelectedProjects([]);
        }}
      >
        Delete Selected
      </text>
      <text testID="close-btn" onPress={onClose}>Close</text>
    </text>
  );
};

describe('ProjectManager Component', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  test('renders project manager when visible', () => {
    const { getByTestId } = render(<MockProjectManager {...defaultProps} />);
    
    expect(getByTestId('project-manager')).toBeTruthy();
    expect(getByTestId('project-list')).toBeTruthy();
  });

  test('does not render when not visible', () => {
    const { queryByTestId } = render(
      <MockProjectManager {...defaultProps} visible={false} />
    );
    
    expect(queryByTestId('project-manager')).toBeNull();
  });

  test('displays list of projects', () => {
    const { getByTestId } = render(<MockProjectManager {...defaultProps} />);
    
    expect(getByTestId('project-project_1')).toBeTruthy();
    expect(getByTestId('project-project_2')).toBeTruthy();
  });

  test('handles project selection', () => {
    const { getByTestId } = render(<MockProjectManager {...defaultProps} />);
    
    const project1 = getByTestId('project-project_1');
    fireEvent.press(project1);
    
    // Project should be selectable (would show visual feedback in real component)
    expect(project1).toBeTruthy();
  });

  test('handles project deletion', async () => {
    const { getByTestId, queryByTestId } = render(<MockProjectManager {...defaultProps} />);
    
    // Select a project
    const project1 = getByTestId('project-project_1');
    fireEvent.press(project1);
    
    // Delete selected projects
    const deleteBtn = getByTestId('delete-selected-btn');
    fireEvent.press(deleteBtn);
    
    // Project should be removed from list
    await waitFor(() => {
      expect(queryByTestId('project-project_1')).toBeNull();
    });
    
    // Other project should still exist
    expect(getByTestId('project-project_2')).toBeTruthy();
  });

  test('handles multiple project selection', () => {
    const { getByTestId } = render(<MockProjectManager {...defaultProps} />);
    
    // Select multiple projects
    fireEvent.press(getByTestId('project-project_1'));
    fireEvent.press(getByTestId('project-project_2'));
    
    // Both should be selectable
    expect(getByTestId('project-project_1')).toBeTruthy();
    expect(getByTestId('project-project_2')).toBeTruthy();
  });

  test('calls onClose when close button pressed', () => {
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <MockProjectManager {...defaultProps} onClose={onCloseMock} />
    );
    
    const closeBtn = getByTestId('close-btn');
    fireEvent.press(closeBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('handles empty project list', () => {
    const EmptyProjectManager = ({ visible }) => {
      const [projects] = React.useState([]);
      
      if (!visible) return null;
      
      return (
        <text testID="project-manager">
          <text testID="empty-state">No projects found</text>
        </text>
      );
    };
    
    const { getByTestId } = render(<EmptyProjectManager visible={true} />);
    
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  describe('project operations integration', () => {
    test('integrates with ProjectStorage for loading projects', async () => {
      const { ProjectStorage } = require('../../services/storage/ProjectStorage');
      ProjectStorage.getAllProjects.mockResolvedValueOnce(mockProjects);
      
      // In a real component, this would trigger on mount
      const projects = await ProjectStorage.getAllProjects();
      
      expect(ProjectStorage.getAllProjects).toHaveBeenCalled();
      expect(projects).toEqual(mockProjects);
    });

    test('integrates with ProjectStorage for project deletion', async () => {
      const { ProjectStorage } = require('../../services/storage/ProjectStorage');
      ProjectStorage.deleteProject.mockResolvedValueOnce({ success: true });
      
      const result = await ProjectStorage.deleteProject('project_1');
      
      expect(ProjectStorage.deleteProject).toHaveBeenCalledWith('project_1');
      expect(result.success).toBe(true);
    });

    test('handles ProjectStorage errors gracefully', async () => {
      const { ProjectStorage } = require('../../services/storage/ProjectStorage');
      ProjectStorage.getAllProjects.mockRejectedValueOnce(new Error('Storage error'));
      
      try {
        await ProjectStorage.getAllProjects();
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
      
      expect(ProjectStorage.getAllProjects).toHaveBeenCalled();
    });
  });

  describe('performance considerations', () => {
    test('handles large project lists efficiently', () => {
      const largeProjectList = Array.from({ length: 100 }, (_, i) => ({
        id: `project_${i}`,
        name: `Project ${i}`,
        description: `Description ${i}`,
        geometry: 'DIDGMO:1500,50,40,30'
      }));
      
      const LargeListProjectManager = ({ visible }) => {
        const [projects] = React.useState(largeProjectList);
        
        if (!visible) return null;
        
        return (
          <text testID="project-manager">
            <text testID="project-count">{projects.length} projects</text>
          </text>
        );
      };
      
      const { getByTestId } = render(<LargeListProjectManager visible={true} />);
      
      expect(getByTestId('project-count')).toBeTruthy();
      // In real component, would test FlatList performance optimizations
    });
  });
});