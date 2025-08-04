import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getTypography, getSpacing, scale } from '../utils/responsive';

const typography = getTypography();
const spacing = getSpacing();

export const SaveStatusIndicator = ({ 
  saveStatus, 
  saveMessage, 
  lastSaved, 
  isAutoSaving,
  onManualSave,
  compact = false 
}) => {
  const getSaveStatusIcon = () => {
    if (isAutoSaving) return '⏳';
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
    if (isAutoSaving) return '#F59E0B';
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

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = now - lastSaved;
    
    if (diff < 60000) { // < 1 minuto
      return `${Math.floor(diff / 1000)}s`;
    } else if (diff < 3600000) { // < 1 hora
      return `${Math.floor(diff / 60000)}m`;
    } else {
      return `${Math.floor(diff / 3600000)}h`;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { borderColor: getSaveStatusColor() }]}
        onPress={onManualSave}
        disabled={isAutoSaving}
      >
        <Text style={styles.compactIcon}>{getSaveStatusIcon()}</Text>
        {lastSaved && (
          <Text style={[styles.compactTime, { color: getSaveStatusColor() }]}>
            {getTimeSinceLastSave()}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: getSaveStatusColor() + '20' }]}>
      <View style={styles.statusRow}>
        <Text style={styles.icon}>{getSaveStatusIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: getSaveStatusColor() }]}>
            {isAutoSaving ? 'Auto-salvando...' : saveMessage}
          </Text>
          {lastSaved && !isAutoSaving && (
            <Text style={styles.timestamp}>
              Último salvamento: {getTimeSinceLastSave()} atrás
            </Text>
          )}
        </View>
      </View>
      
      {onManualSave && (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: getSaveStatusColor() }]}
          onPress={onManualSave}
          disabled={isAutoSaving}
        >
          <Text style={styles.saveButtonText}>💾</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: typography.caption,
    color: '#6B7280',
    marginTop: 2,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  compactIcon: {
    fontSize: 12,
  },
  compactTime: {
    fontSize: typography.caption,
    marginLeft: 4,
    fontWeight: '600',
  },
});

// Componente para exibir estatísticas de salvamento
export const SaveStatistics = ({ projects }) => {
  const autoSaveCount = projects.filter(p => p.lastAutoSave).length;
  const totalModifications = projects.reduce((sum, p) => sum + (p.modificationCount || 0), 0);
  const averageModifications = projects.length > 0 ? (totalModifications / projects.length).toFixed(1) : 0;
  
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Estatísticas de Salvamento</Text>
      
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Projetos com auto-save:</Text>
        <Text style={styles.statValue}>{autoSaveCount}</Text>
      </View>
      
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Total de modificações:</Text>
        <Text style={styles.statValue}>{totalModifications}</Text>
      </View>
      
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Média por projeto:</Text>
        <Text style={styles.statValue}>{averageModifications}</Text>
      </View>
    </View>
  );
};

const statsStyles = StyleSheet.create({
  statsContainer: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  statsTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.body,
    color: '#6B7280',
  },
  statValue: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#059669',
  },
});

// Mesclar estilos
Object.assign(styles, statsStyles);