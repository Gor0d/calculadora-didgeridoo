// Serviço de validação de projetos
export class ProjectValidator {
  
  // Validação básica de estrutura do projeto
  static validateProjectStructure(project) {
    const errors = [];
    
    // Campos obrigatórios
    if (!project) {
      errors.push('Projeto não pode ser nulo ou indefinido');
      return { isValid: false, errors };
    }
    
    if (!project.name || typeof project.name !== 'string' || project.name.trim().length === 0) {
      errors.push('Nome do projeto é obrigatório');
    }
    
    if (project.name && project.name.length > 100) {
      errors.push('Nome do projeto não pode ter mais de 100 caracteres');
    }
    
    if (!project.geometry || typeof project.geometry !== 'string' || project.geometry.trim().length === 0) {
      errors.push('Geometria DIDGMO é obrigatória');
    }
    
    // Validar geometria DIDGMO
    if (project.geometry) {
      const geometryValidation = this.validateGeometry(project.geometry);
      if (!geometryValidation.isValid) {
        errors.push(...geometryValidation.errors);
      }
    }
    
    // Validar categoria
    const validCategories = ['tradicional', 'moderno', 'experimental', 'bell', 'straight', 'conical'];
    if (project.category && !validCategories.includes(project.category)) {
      errors.push(`Categoria inválida. Deve ser uma de: ${validCategories.join(', ')}`);
    }
    
    // Validar velocidade do som
    if (project.soundSpeed && (isNaN(project.soundSpeed) || project.soundSpeed < 200 || project.soundSpeed > 500)) {
      errors.push('Velocidade do som deve estar entre 200 e 500 m/s');
    }
    
    // Validar diâmetro do bocal
    if (project.mouthpieceDiameter && (isNaN(project.mouthpieceDiameter) || project.mouthpieceDiameter < 10 || project.mouthpieceDiameter > 100)) {
      errors.push('Diâmetro do bocal deve estar entre 10 e 100 mm');
    }
    
    // Validar descrição
    if (project.description && project.description.length > 1000) {
      errors.push('Descrição não pode ter mais de 1000 caracteres');
    }
    
    // Validar notas
    if (project.notes && project.notes.length > 5000) {
      errors.push('Notas não podem ter mais de 5000 caracteres');
    }
    
    // Validar tags
    if (project.tags && Array.isArray(project.tags)) {
      if (project.tags.length > 20) {
        errors.push('Máximo de 20 tags permitidas');
      }
      
      project.tags.forEach((tag, index) => {
        if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push(`Tag ${index + 1} é inválida`);
        } else if (tag.length > 50) {
          errors.push(`Tag "${tag}" não pode ter mais de 50 caracteres`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validação específica da geometria DIDGMO
  static validateGeometry(geometry) {
    const errors = [];
    
    if (!geometry || typeof geometry !== 'string') {
      errors.push('Geometria deve ser uma string');
      return { isValid: false, errors };
    }
    
    console.log('Validating geometry:', geometry);
    const lines = geometry.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      errors.push('Geometria deve ter pelo menos 2 pontos (início e fim)');
      return { isValid: false, errors };
    }
    
    if (lines.length > 1000) {
      errors.push('Geometria não pode ter mais de 1000 pontos');
    }
    
    let lastPosition = -1;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Verificar formato da linha (posição diâmetro)
      const match = trimmed.match(/^(\d+\.?\d*)\s+(\d+\.?\d*)$/);
      
      if (!match) {
        errors.push(`Linha ${index + 1}: Formato inválido. Use "posição diâmetro" (ex: 0.00 0.030)`);
        return;
      }
      
      const position = parseFloat(match[1]);
      const diameter = parseFloat(match[2]);
      
      // Auto-detectar unidades baseado nos valores
      let isPositionInMeters = position <= 10; // Assumir metros se <= 10
      let isDiameterInMeters = diameter <= 1; // Assumir metros se <= 1
      
      // Se diâmetro > 1, provavelmente está em mm
      let actualDiameter = diameter;
      if (!isDiameterInMeters && diameter <= 1000) {
        actualDiameter = diameter / 1000; // Converter mm para m
      }
      
      // Se posição > 10, provavelmente está em cm ou mm
      let actualPosition = position;
      if (!isPositionInMeters && position <= 1000) {
        actualPosition = position / 100; // Converter cm para m
      } else if (!isPositionInMeters && position > 1000) {
        actualPosition = position / 1000; // Converter mm para m
      }
      
      // Validar posição (sempre em metros)
      if (isNaN(actualPosition) || actualPosition < 0) {
        errors.push(`Linha ${index + 1}: Posição deve ser um número positivo`);
      } else if (actualPosition <= lastPosition) {
        errors.push(`Linha ${index + 1}: Posição (${actualPosition.toFixed(3)}m) deve ser maior que a anterior (${lastPosition.toFixed(3)}m)`);
      } else if (actualPosition > 10) {
        errors.push(`Linha ${index + 1}: Posição (${actualPosition.toFixed(3)}m) muito grande para um didgeridoo (máx: 10m)`);
      }
      
      // Validar diâmetro (sempre em metros)
      if (isNaN(actualDiameter) || actualDiameter <= 0) {
        errors.push(`Linha ${index + 1}: Diâmetro deve ser um número positivo`);
      } else if (actualDiameter < 0.010) {
        errors.push(`Linha ${index + 1}: Diâmetro (${(actualDiameter * 1000).toFixed(1)}mm) muito pequeno (mín: 10mm)`);
      } else if (actualDiameter > 1.000) {
        errors.push(`Linha ${index + 1}: Diâmetro (${(actualDiameter * 1000).toFixed(1)}mm) muito grande (máx: 1000mm)`);
      }
      
      lastPosition = actualPosition;
    });
    
    // Verificar se começa em 0.00
    const firstLine = lines[0].trim();
    const firstMatch = firstLine.match(/^(\d+\.?\d*)\s+(\d+\.?\d*)$/);
    if (firstMatch && parseFloat(firstMatch[1]) !== 0) {
      errors.push('Geometria deve começar na posição 0.00');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validação de resultados de análise acústica
  static validateAnalysisResults(results) {
    const errors = [];
    
    if (!Array.isArray(results)) {
      errors.push('Resultados devem ser um array');
      return { isValid: false, errors };
    }
    
    if (results.length === 0) {
      errors.push('Deve haver pelo menos um resultado de análise');
      return { isValid: false, errors };
    }
    
    if (results.length > 20) {
      errors.push('Máximo de 20 harmônicos suportados');
    }
    
    results.forEach((result, index) => {
      if (!result || typeof result !== 'object') {
        errors.push(`Resultado ${index + 1}: Deve ser um objeto`);
        return;
      }
      
      // Validar frequência
      if (!result.frequency || isNaN(result.frequency) || result.frequency <= 0) {
        errors.push(`Resultado ${index + 1}: Frequência inválida`);
      } else if (result.frequency < 20 || result.frequency > 20000) {
        errors.push(`Resultado ${index + 1}: Frequência fora da faixa audível (20-20000 Hz)`);
      }
      
      // Validar nota
      const validNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      if (!result.note || !validNotes.includes(result.note)) {
        errors.push(`Resultado ${index + 1}: Nota inválida. Deve ser uma de: ${validNotes.join(', ')}`);
      }
      
      // Validar oitava
      if (result.octave === undefined || isNaN(result.octave) || result.octave < -1 || result.octave > 10) {
        errors.push(`Resultado ${index + 1}: Oitava deve estar entre -1 e 10`);
      }
      
      // Validar diferença em cents
      if (result.centDiff !== undefined && (isNaN(result.centDiff) || Math.abs(result.centDiff) > 100)) {
        errors.push(`Resultado ${index + 1}: Diferença em cents deve estar entre -100 e +100`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validação antes de salvar
  static validateForSave(project) {
    const structureValidation = this.validateProjectStructure(project);
    
    if (!structureValidation.isValid) {
      return structureValidation;
    }
    
    const errors = [];
    
    // Validações específicas para salvamento
    if (project.results && project.results.length > 0) {
      const resultsValidation = this.validateAnalysisResults(project.results);
      if (!resultsValidation.isValid) {
        errors.push(...resultsValidation.errors);
      }
    }
    
    // Verificar se dados são serializáveis
    try {
      JSON.stringify(project);
    } catch (error) {
      errors.push('Projeto contém dados não serializáveis');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validação antes de exportar
  static validateForExport(project, format = 'json') {
    const saveValidation = this.validateForSave(project);
    
    if (!saveValidation.isValid) {
      return saveValidation;
    }
    
    const errors = [];
    
    // Validações específicas por formato
    switch (format) {
      case 'csv':
        // Para CSV, verificar se há caracteres problemáticos
        if (project.name && project.name.includes('"')) {
          errors.push('Nome do projeto não pode conter aspas duplas para exportação CSV');
        }
        if (project.description && project.description.includes('\n')) {
          errors.push('Descrição não pode conter quebras de linha para exportação CSV');
        }
        break;
        
      case 'txt':
        // Para TXT, verificar encoding
        if (project.notes && !/^[\x00-\x7F]*$/.test(project.notes)) {
          // Contém caracteres não-ASCII, avisar mas não bloquear
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Sanitização de dados de entrada
  static sanitizeProject(project) {
    if (!project) return null;
    
    const sanitized = { ...project };
    
    // Sanitizar strings
    if (sanitized.name) {
      sanitized.name = sanitized.name.trim().substring(0, 100);
    }
    
    if (sanitized.description) {
      sanitized.description = sanitized.description.trim().substring(0, 1000);
    }
    
    if (sanitized.notes) {
      sanitized.notes = sanitized.notes.trim().substring(0, 5000);
    }
    
    // Sanitizar geometria
    if (sanitized.geometry) {
      const lines = sanitized.geometry.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 1000); // Máximo 1000 pontos
      
      sanitized.geometry = lines.join('\n');
    }
    
    // Sanitizar tags
    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags
        .filter(tag => tag && typeof tag === 'string')
        .map(tag => tag.trim().substring(0, 50))
        .filter(tag => tag.length > 0)
        .slice(0, 20); // Máximo 20 tags
    }
    
    // Sanitizar valores numéricos
    if (sanitized.soundSpeed) {
      sanitized.soundSpeed = Math.max(200, Math.min(500, parseFloat(sanitized.soundSpeed) || 343));
    }
    
    if (sanitized.mouthpieceDiameter) {
      sanitized.mouthpieceDiameter = Math.max(10, Math.min(100, parseFloat(sanitized.mouthpieceDiameter) || 28));
    }
    
    return sanitized;
  }
  
  // Verificar compatibilidade de versão
  static validateVersion(project) {
    const currentVersion = '1.0';
    const projectVersion = project.version || '1.0';
    
    if (projectVersion !== currentVersion) {
      return {
        isValid: false,
        errors: [`Versão do projeto (${projectVersion}) incompatível com a versão atual (${currentVersion})`],
        needsUpgrade: true
      };
    }
    
    return {
      isValid: true,
      errors: []
    };
  }
}