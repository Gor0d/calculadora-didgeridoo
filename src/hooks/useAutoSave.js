import { useEffect, useRef, useState } from 'react';
import { ProjectStorage } from '../services/storage/ProjectStorage';

export const useAutoSave = (project, enabled = false, intervalMs = 30000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const intervalRef = useRef(null);
  const lastProjectRef = useRef(null);

  useEffect(() => {
    if (enabled && project && project.id) {
      // Iniciar auto-salvamento
      intervalRef.current = setInterval(async () => {
        try {
          // Verificar se o projeto mudou desde o último salvamento
          const currentProjectString = JSON.stringify(project);
          const lastProjectString = JSON.stringify(lastProjectRef.current);
          
          if (currentProjectString !== lastProjectString) {
            setIsAutoSaving(true);
            
            const savedProject = await ProjectStorage.saveProject({
              ...project,
              lastAutoSave: new Date().toISOString()
            });
            
            lastProjectRef.current = project;
            setLastSaved(new Date());
            setIsAutoSaving(false);
            
            console.log(`Auto-save successful for project: ${project.name}`);
          }
        } catch (error) {
          console.warn('Auto-save failed:', error);
          setIsAutoSaving(false);
        }
      }, intervalMs);

      // Cleanup anterior se existir
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Parar auto-salvamento
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [enabled, project?.id, intervalMs]);

  // Cleanup no desmonte
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerManualSave = async () => {
    if (!project) return false;
    
    try {
      setIsAutoSaving(true);
      
      const savedProject = await ProjectStorage.saveProject({
        ...project,
        lastManualSave: new Date().toISOString()
      });
      
      setLastSaved(new Date());
      setIsAutoSaving(false);
      
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      setIsAutoSaving(false);
      return false;
    }
  };

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = now - lastSaved;
    
    if (diff < 60000) { // < 1 minuto
      return `${Math.floor(diff / 1000)} segundos atrás`;
    } else if (diff < 3600000) { // < 1 hora
      return `${Math.floor(diff / 60000)} minutos atrás`;
    } else {
      return `${Math.floor(diff / 3600000)} horas atrás`;
    }
  };

  return {
    isAutoSaving,
    lastSaved,
    triggerManualSave,
    getTimeSinceLastSave
  };
};

// Hook para status de salvamento visual
export const useSaveStatus = () => {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [saveMessage, setSaveMessage] = useState('');

  const setSaving = (message = 'Salvando...') => {
    setSaveStatus('saving');
    setSaveMessage(message);
  };

  const setSaved = (message = 'Salvo') => {
    setSaveStatus('saved');
    setSaveMessage(message);
  };

  const setUnsaved = (message = 'Não salvo') => {
    setSaveStatus('unsaved');
    setSaveMessage(message);
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return '⏳';
      case 'saved':
        return '✅';
      case 'unsaved':
        return '❌';
      default:
        return '💾';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return '#F59E0B';
      case 'saved':
        return '#10B981';
      case 'unsaved':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return {
    saveStatus,
    saveMessage,
    setSaving,
    setSaved,
    setUnsaved,
    getSaveStatusIcon,
    getSaveStatusColor
  };
};