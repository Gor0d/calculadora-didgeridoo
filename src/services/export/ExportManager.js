import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ProjectStorage } from '../storage/ProjectStorage';
import { audioEngine } from '../audio/AudioEngine';

export class ExportManager {
  static async exportToPDF(project, options = {}) {
    try {
      const {
        includeGeometry = true,
        includeAnalysis = true,
        includeVisualization = true,
        includeNotes = true,
        template = 'professional'
      } = options;

      // Generate HTML content for PDF
      const htmlContent = this.generatePDFHTML(project, {
        includeGeometry,
        includeAnalysis,
        includeVisualization,
        includeNotes,
        template
      });

      // For now, we'll export as HTML since React Native doesn't have native PDF generation
      // In a full implementation, you'd use a service like react-native-html-to-pdf
      const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_report.html`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, htmlContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: `Exportar Relatório: ${project.name}`
        });
      }

      return { success: true, fileUri, filename };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Falha ao exportar para PDF');
    }
  }

  static generatePDFHTML(project, options) {
    const { includeGeometry, includeAnalysis, includeVisualization, includeNotes, template } = options;
    
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Análise - ${project.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            color: #1f2937;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .logo {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
        }
        .title {
            font-size: 2em;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 1.1em;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.5em;
            color: #374151;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 1.1em;
            color: #059669;
            font-weight: 700;
        }
        .geometry-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .geometry-table th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .geometry-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .geometry-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .analysis-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .analysis-table th {
            background: #1f2937;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: 600;
            font-size: 0.9em;
        }
        .analysis-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: center;
            font-size: 0.9em;
        }
        .analysis-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .frequency-cell {
            font-weight: 700;
            color: #667eea;
        }
        .note-cell {
            font-weight: 700;
            color: #dc2626;
        }
        .drone-row {
            background: rgba(239, 68, 68, 0.1) !important;
            border-left: 4px solid #dc2626;
        }
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: 900;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .notes-section {
            background: #fef7cd;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
        }
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.3;
            font-size: 0.8em;
            color: #9ca3af;
        }
        @media print {
            .container {
                box-shadow: none;
                border: 1px solid #e5e7eb;
            }
            .watermark {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎺</div>
            <h1 class="title">${project.name}</h1>
            <p class="subtitle">Relatório de Análise Acústica • ${currentDate}</p>
        </div>
`;

    // Project Information
    html += `
        <div class="section">
            <h2 class="section-title">📋 Informações do Projeto</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Nome do Projeto</div>
                    <div class="info-value">${project.name || 'Sem nome'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Categoria</div>
                    <div class="info-value">${project.category || 'Não especificada'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Data de Criação</div>
                    <div class="info-value">${project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Última Modificação</div>
                    <div class="info-value">${project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
            </div>
            ${project.description ? `<p><strong>Descrição:</strong> ${project.description}</p>` : ''}
        </div>
`;

    // Geometry Section
    if (includeGeometry && project.geometry) {
      const geometryLines = project.geometry.split('\n').filter(line => line.trim());
      html += `
        <div class="section">
            <h2 class="section-title">📐 Geometria DIDGMO</h2>
            <table class="geometry-table">
                <thead>
                    <tr>
                        <th>Ponto</th>
                        <th>Posição (cm)</th>
                        <th>Diâmetro (mm)</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
`;
      
      geometryLines.forEach((line, index) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const position = (parseFloat(parts[0]) * 100).toFixed(1); // m to cm
          const diameter = (parseFloat(parts[1]) * 1000).toFixed(1); // m to mm
          const note = index === 0 ? 'Bocal' : index === geometryLines.length - 1 ? 'Saída' : '';
          
          html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${position}</td>
                        <td>${diameter}</td>
                        <td>${note}</td>
                    </tr>
`;
        }
      });
      
      html += `
                </tbody>
            </table>
        </div>
`;
    }

    // Analysis Results
    if (includeAnalysis && project.results && project.results.length > 0) {
      const drone = project.results[0];
      const totalLength = project.metadata?.effectiveLength || 0;
      const avgRadius = project.metadata?.averageRadius || 0;
      const volume = project.metadata?.volume || 0;

      html += `
        <div class="section">
            <h2 class="section-title">🎵 Resultados da Análise</h2>
            
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-value">${drone.frequency.toFixed(1)}</div>
                    <div class="stat-label">Frequência Fundamental (Hz)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${drone.note}${drone.octave}</div>
                    <div class="stat-label">Nota Musical</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalLength.toFixed(1)}</div>
                    <div class="stat-label">Comprimento (cm)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgRadius.toFixed(1)}</div>
                    <div class="stat-label">Raio Médio (mm)</div>
                </div>
            </div>

            <h3>Série Harmônica Completa</h3>
            <table class="analysis-table">
                <thead>
                    <tr>
                        <th>Harmônico</th>
                        <th>Frequência (Hz)</th>
                        <th>Nota</th>
                        <th>Oitava</th>
                        <th>Desvio (cents)</th>
                        <th>Amplitude</th>
                        <th>Qualidade</th>
                    </tr>
                </thead>
                <tbody>
`;

      project.results.slice(0, 8).forEach((result, index) => {
        const isBlown = Math.abs(result.centDiff) < 30 && result.amplitude > 0.3;
        const quality = Math.abs(result.centDiff) < 10 ? 'Excelente' : 
                       Math.abs(result.centDiff) < 20 ? 'Boa' : 
                       Math.abs(result.centDiff) < 30 ? 'Aceitável' : 'Ruim';
        
        html += `
                    <tr ${index === 0 ? 'class="drone-row"' : ''}>
                        <td><strong>${index === 0 ? 'Drone' : `${index + 1}º`}</strong></td>
                        <td class="frequency-cell">${result.frequency.toFixed(1)}</td>
                        <td class="note-cell">${result.note}</td>
                        <td>${result.octave}</td>
                        <td style="color: ${Math.abs(result.centDiff) < 10 ? '#10b981' : Math.abs(result.centDiff) < 30 ? '#f59e0b' : '#ef4444'}">${result.centDiff > 0 ? '+' : ''}${result.centDiff}</td>
                        <td>${(result.amplitude * 100).toFixed(0)}%</td>
                        <td style="color: ${quality === 'Excelente' ? '#10b981' : quality === 'Boa' ? '#059669' : quality === 'Aceitável' ? '#f59e0b' : '#ef4444'}">${quality}</td>
                    </tr>
`;
      });

      html += `
                </tbody>
            </table>
        </div>
`;
    }

    // Physical Parameters
    if (project.metadata) {
      html += `
        <div class="section">
            <h2 class="section-title">⚙️ Parâmetros Físicos</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Comprimento Efetivo</div>
                    <div class="info-value">${project.metadata.effectiveLength?.toFixed(1) || 'N/A'} cm</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Raio Médio</div>
                    <div class="info-value">${project.metadata.averageRadius?.toFixed(1) || 'N/A'} mm</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Volume Interno</div>
                    <div class="info-value">${project.metadata.volume ? (project.metadata.volume / 1000).toFixed(1) : 'N/A'} L</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Método de Cálculo</div>
                    <div class="info-value">${project.metadata.calculationMethod === 'online_advanced' ? 'Avançado' : 'Simplificado'}</div>
                </div>
            </div>
        </div>
`;
    }

    // Notes Section
    if (includeNotes && project.notes) {
      html += `
        <div class="section">
            <h2 class="section-title">📝 Notas e Observações</h2>
            <div class="notes-section">
                <p>${project.notes.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
`;
    }

    // Footer
    html += `
        <div class="footer">
            <p>Relatório gerado pelo <strong>Didgemap Calculator</strong></p>
            <p>🎺 Ferramenta profissional para análise acústica de didgeridoo</p>
            <p><em>Desenvolvido com ❤️ para a comunidade de didgeridoo</em></p>
        </div>
    </div>
    
    <div class="watermark">
        Didgemap Calculator • ${currentDate}
    </div>
</body>
</html>
`;

    return html;
  }

  static async exportToAudio(project, options = {}) {
    try {
      const {
        format = 'wav',
        duration = 5000,
        includeDrone = true,
        includeHarmonics = true,
        includeSpectrum = false,
        volume = 0.3,
        sampleRate = 44100
      } = options;

      if (!project.results || project.results.length === 0) {
        throw new Error('Projeto não possui resultados de análise');
      }

      const audioFiles = [];
      const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_');

      // Initialize audio engine if needed
      await audioEngine.initialize();

      if (includeDrone) {
        const drone = project.results[0];
        const harmonics = project.results.slice(1, 4).map(r => ({
          frequency: r.frequency,
          amplitude: r.amplitude || 0.5
        }));

        const droneFileName = `${projectName}_drone.${format}`;
        const droneUri = await this.generateAudioFile(
          { type: 'drone', fundamental: drone.frequency, harmonics },
          droneFileName,
          { duration, volume, sampleRate }
        );
        
        audioFiles.push({
          name: 'Drone Fundamental',
          uri: droneUri,
          filename: droneFileName
        });
      }

      if (includeHarmonics) {
        const harmonicsFileName = `${projectName}_harmonics.${format}`;
        const harmonicsUri = await this.generateAudioFile(
          { type: 'harmonics', frequencies: project.results.slice(0, 6).map(r => r.frequency) },
          harmonicsFileName,
          { duration: duration * 0.8, volume, sampleRate }
        );
        
        audioFiles.push({
          name: 'Série Harmônica',
          uri: harmonicsUri,
          filename: harmonicsFileName
        });
      }

      if (includeSpectrum) {
        const spectrumFileName = `${projectName}_spectrum.${format}`;
        const spectrumUri = await this.generateAudioFile(
          { type: 'spectrum', frequencies: project.results.map(r => r.frequency) },
          spectrumFileName,
          { duration: duration * 1.2, volume, sampleRate }
        );
        
        audioFiles.push({
          name: 'Espectro Completo',
          uri: spectrumUri,
          filename: spectrumFileName
        });
      }

      // Create a zip file with all audio files (simplified implementation)
      // In a full implementation, you would use a zip library
      if (audioFiles.length === 1) {
        // Single file - share directly
        const audioFile = audioFiles[0];
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(audioFile.uri, {
            mimeType: `audio/${format}`,
            dialogTitle: `Exportar Áudio: ${audioFile.name}`
          });
        }
      } else {
        // Multiple files - create a folder reference
        const folderInfo = {
          name: `${projectName}_audio_export`,
          files: audioFiles,
          totalFiles: audioFiles.length
        };

        // For now, share the first file with a note about multiple files
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(audioFiles[0].uri, {
            mimeType: `audio/${format}`,
            dialogTitle: `Áudio Exportado (${audioFiles.length} arquivos)`
          });
        }
      }

      return { success: true, files: audioFiles };
    } catch (error) {
      console.error('Error exporting to audio:', error);
      throw new Error('Falha ao exportar áudio');
    }
  }

  static async generateAudioFile(audioConfig, filename, options) {
    try {
      const { duration, volume, sampleRate } = options;
      
      // This is a simplified implementation
      // In a real app, you would generate actual audio data
      const fileUri = FileSystem.documentDirectory + filename;
      
      // For demonstration, we'll create a simple audio description file
      const audioInfo = {
        config: audioConfig,
        duration: duration,
        volume: volume,
        sampleRate: sampleRate,
        generated: new Date().toISOString(),
        note: 'Audio file would be generated here with actual synthesis'
      };
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(audioInfo, null, 2));
      return fileUri;
    } catch (error) {
      console.error('Error generating audio file:', error);
      throw error;
    }
  }

  static async exportAdvancedReport(project, options = {}) {
    try {
      const {
        includeComparison = false,
        includeTechnicalSpecs = true,
        includeRecommendations = true,
        includeVisualization = true,
        format = 'html'
      } = options;

      const report = {
        project: project,
        analysis: await this.generateAdvancedAnalysis(project),
        recommendations: includeRecommendations ? await this.generateRecommendations(project) : null,
        technicalSpecs: includeTechnicalSpecs ? await this.generateTechnicalSpecs(project) : null,
        comparison: includeComparison ? await this.generateComparison(project) : null,
        metadata: {
          generated: new Date().toISOString(),
          version: '1.0',
          format: format
        }
      };

      let content, mimeType, extension;
      
      switch (format) {
        case 'json':
          content = JSON.stringify(report, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'csv':
          content = this.reportToCSV(report);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        default: // html
          content = this.reportToHTML(report);
          mimeType = 'text/html';
          extension = 'html';
      }

      const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_advanced_report.${extension}`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Relatório Avançado: ${project.name}`
        });
      }

      return { success: true, fileUri, filename, report };
    } catch (error) {
      console.error('Error exporting advanced report:', error);
      throw new Error('Falha ao exportar relatório avançado');
    }
  }

  static async generateAdvancedAnalysis(project) {
    if (!project.results || project.results.length === 0) {
      return null;
    }

    const results = project.results;
    const drone = results[0];
    
    return {
      fundamentalAnalysis: {
        frequency: drone.frequency,
        note: `${drone.note}${drone.octave}`,
        accuracy: Math.abs(drone.centDiff) < 10 ? 'Excelente' : 
                 Math.abs(drone.centDiff) < 20 ? 'Boa' : 'Precisa ajuste',
        centDeviation: drone.centDiff,
        amplitude: drone.amplitude
      },
      harmonicSeries: results.map((result, index) => ({
        order: index + 1,
        frequency: result.frequency,
        note: `${result.note}${result.octave}`,
        accuracy: Math.abs(result.centDiff),
        amplitude: result.amplitude,
        playable: Math.abs(result.centDiff) < 30 && result.amplitude > 0.3
      })),
      playabilityScore: this.calculatePlayabilityScore(results),
      harmonicBalance: this.analyzeHarmonicBalance(results),
      frequencyRange: {
        lowest: Math.min(...results.map(r => r.frequency)),
        highest: Math.max(...results.map(r => r.frequency)),
        span: Math.max(...results.map(r => r.frequency)) - Math.min(...results.map(r => r.frequency))
      }
    };
  }

  static calculatePlayabilityScore(results) {
    if (!results || results.length === 0) return 0;
    
    let score = 0;
    let totalWeight = 0;

    results.forEach((result, index) => {
      const weight = 1 / (index + 1); // Drone has highest weight
      const accuracyScore = Math.max(0, 100 - Math.abs(result.centDiff));
      const amplitudeScore = (result.amplitude || 0.5) * 100;
      const harmonicScore = (accuracyScore + amplitudeScore) / 2;
      
      score += harmonicScore * weight;
      totalWeight += weight;
    });

    return Math.round(score / totalWeight);
  }

  static analyzeHarmonicBalance(results) {
    if (!results || results.length < 3) return 'Insuficiente';
    
    const amplitudes = results.slice(0, 6).map(r => r.amplitude || 0.5);
    const evenness = 1 - (Math.max(...amplitudes) - Math.min(...amplitudes));
    
    if (evenness > 0.8) return 'Excelente';
    if (evenness > 0.6) return 'Boa';
    if (evenness > 0.4) return 'Regular';
    return 'Precisa melhoria';
  }

  static async generateRecommendations(project) {
    const recommendations = [];
    
    if (!project.results || project.results.length === 0) {
      recommendations.push({
        type: 'error',
        title: 'Análise Incompleta',
        description: 'Execute a análise acústica para receber recomendações personalizadas.',
        priority: 'high'
      });
      return recommendations;
    }

    const drone = project.results[0];
    const playabilityScore = this.calculatePlayabilityScore(project.results);

    // Accuracy recommendations
    if (Math.abs(drone.centDiff) > 20) {
      recommendations.push({
        type: 'tuning',
        title: 'Ajuste de Afinação Necessário',
        description: `O drone está ${drone.centDiff > 0 ? 'alto' : 'baixo'} em ${Math.abs(drone.centDiff)} cents. ${
          drone.centDiff > 0 ? 'Considere aumentar o comprimento' : 'Considere diminuir o comprimento'
        } ou ajustar o diâmetro interno.`,
        priority: 'high'
      });
    }

    // Playability recommendations
    if (playabilityScore < 70) {
      recommendations.push({
        type: 'design',
        title: 'Melhoria da Tocabilidade',
        description: 'O design atual pode dificultar a execução. Considere suavizar variações de diâmetro e otimizar a expansão cônica.',
        priority: 'medium'
      });
    }

    // Harmonic recommendations
    const weakHarmonics = project.results.filter((r, i) => i > 0 && Math.abs(r.centDiff) > 30);
    if (weakHarmonics.length > 2) {
      recommendations.push({
        type: 'harmonics',
        title: 'Otimização Harmônica',
        description: `${weakHarmonics.length} harmônicos estão fora de afinação. Ajuste a geometria para melhorar a série harmônica.`,
        priority: 'medium'
      });
    }

    // Construction recommendations based on geometry
    if (project.geometry) {
      const lines = project.geometry.split('\n').filter(line => line.trim());
      if (lines.length < 4) {
        recommendations.push({
          type: 'construction',
          title: 'Geometria Simplificada',
          description: 'Adicione mais pontos de controle para uma transição mais suave e melhor resposta acústica.',
          priority: 'low'
        });
      }
    }

    // Positive feedback
    if (playabilityScore >= 85) {
      recommendations.push({
        type: 'success',
        title: 'Excelente Design!',
        description: 'Este design apresenta excelente tocabilidade e afinação. Ideal para performance profissional.',
        priority: 'info'
      });
    }

    return recommendations;
  }

  static async generateTechnicalSpecs(project) {
    const specs = {
      acoustic: {},
      physical: {},
      performance: {},
      construction: {}
    };

    if (project.results && project.results.length > 0) {
      const drone = project.results[0];
      specs.acoustic = {
        fundamentalFrequency: `${drone.frequency.toFixed(2)} Hz`,
        musicalNote: `${drone.note}${drone.octave}`,
        centDeviation: `${drone.centDiff > 0 ? '+' : ''}${drone.centDiff} cents`,
        harmonicCount: project.results.length,
        frequencyRange: `${Math.min(...project.results.map(r => r.frequency)).toFixed(1)} - ${Math.max(...project.results.map(r => r.frequency)).toFixed(1)} Hz`
      };
    }

    if (project.metadata) {
      specs.physical = {
        effectiveLength: `${project.metadata.effectiveLength?.toFixed(1) || 'N/A'} cm`,
        averageRadius: `${project.metadata.averageRadius?.toFixed(1) || 'N/A'} mm`,
        internalVolume: `${project.metadata.volume ? (project.metadata.volume / 1000).toFixed(2) : 'N/A'} L`,
        wallThickness: 'Variável (dependente do material)'
      };
    }

    if (project.results) {
      specs.performance = {
        playabilityScore: `${this.calculatePlayabilityScore(project.results)}/100`,
        harmonicBalance: this.analyzeHarmonicBalance(project.results),
        recommendedSkillLevel: this.getSkillLevelRecommendation(project.results),
        optimalBreathPressure: this.estimateBreathPressure(project.results)
      };
    }

    specs.construction = {
      recommendedMaterial: 'Madeira eucalipto ou bamboo',
      finishSuggestion: 'Óleo natural ou cera de abelha',
      mouthpieceStyle: 'Tradicional com cera de abelha',
      decorationOptions: 'Pirogravura ou pintura natural'
    };

    return specs;
  }

  static getSkillLevelRecommendation(results) {
    const playabilityScore = this.calculatePlayabilityScore(results);
    if (playabilityScore >= 85) return 'Iniciante a Avançado';
    if (playabilityScore >= 70) return 'Intermediário a Avançado';
    if (playabilityScore >= 55) return 'Intermediário';
    return 'Avançado (design desafiador)';
  }

  static estimateBreathPressure(results) {
    const drone = results[0];
    if (drone.frequency < 60) return 'Baixa a Média (respiração relaxada)';
    if (drone.frequency < 80) return 'Média (respiração normal)';
    if (drone.frequency < 100) return 'Média a Alta (requer controle)';
    return 'Alta (respiração controlada)';
  }

  static async generateComparison(project) {
    // This would compare with standard didgeridoo types
    // For now, return a simplified comparison
    return {
      traditionalDidgeridoo: {
        lengthComparison: 'Similar ao tradicional',
        frequencyComparison: 'Dentro da faixa tradicional',
        recommendations: 'Bom para aprendizado'
      }
    };
  }

  static reportToHTML(report) {
    // Generate comprehensive HTML report
    // This would be similar to generatePDFHTML but more detailed
    return this.generatePDFHTML(report.project, {
      includeGeometry: true,
      includeAnalysis: true,
      includeVisualization: true,
      includeNotes: true,
      template: 'advanced'
    });
  }

  static reportToCSV(report) {
    let csv = 'Seção,Propriedade,Valor,Unidade,Observações\n';
    
    // Project info
    csv += `Projeto,Nome,"${report.project.name}",,-\n`;
    csv += `Projeto,Categoria,"${report.project.category || 'N/A'}",,-\n`;
    
    // Analysis results
    if (report.analysis) {
      csv += `Análise,Frequência Fundamental,${report.analysis.fundamentalAnalysis.frequency},Hz,-\n`;
      csv += `Análise,Nota Musical,"${report.analysis.fundamentalAnalysis.note}",,-\n`;
      csv += `Análise,Pontuação de Tocabilidade,${report.analysis.playabilityScore},/100,-\n`;
    }
    
    // Harmonic series
    if (report.project.results) {
      report.project.results.forEach((result, index) => {
        csv += `Harmônico ${index + 1},Frequência,${result.frequency.toFixed(2)},Hz,-\n`;
        csv += `Harmônico ${index + 1},Nota,"${result.note}${result.octave}",,-\n`;
        csv += `Harmônico ${index + 1},Desvio,${result.centDiff},cents,-\n`;
      });
    }
    
    return csv;
  }

  // Batch export functionality
  static async exportMultipleProjects(projects, options = {}) {
    try {
      const results = [];
      
      for (const project of projects) {
        try {
          const result = await this.exportAdvancedReport(project, options);
          results.push({ project: project.name, success: true, ...result });
        } catch (error) {
          results.push({ project: project.name, success: false, error: error.message });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Error in batch export:', error);
      throw new Error('Falha na exportação em lote');
    }
  }
}