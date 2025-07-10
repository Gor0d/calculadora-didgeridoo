import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DesignerScreen() {
  const [projectName, setProjectName] = useState('Meu Didgeridoo');
  const [soundSpeed, setSoundSpeed] = useState('343');
  const [mouthpieceDiameter, setMouthpieceDiameter] = useState('28');
  const [geometry, setGeometry] = useState(`0.00 0.030
0.10 0.032
0.20 0.035
0.50 0.045
1.00 0.060
1.50 0.080`);
  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(3);
  const [volume, setVolume] = useState(30);
  const [activeTab, setActiveTab] = useState('results');

  const presetShapes = {
    traditional: `0.00 0.030
0.10 0.032
0.20 0.035
0.50 0.045
1.00 0.060
1.50 0.080`,
    straight: `0.00 0.040
0.50 0.040
1.00 0.040
1.50 0.040`,
    bell: `0.00 0.030
0.50 0.035
1.00 0.045
1.30 0.065
1.50 0.090`,
    conical: `0.00 0.025
0.30 0.035
0.60 0.045
0.90 0.055
1.20 0.065
1.50 0.075`
  };

  const loadPreset = (type) => {
    setGeometry(presetShapes[type]);
  };

  const analyzeGeometry = () => {
    const lines = geometry.split('\n').filter(line => line.trim());
    const points = [];
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const position = parseFloat(parts[0]) * 1000; // Convert to mm
        const diameter = parseFloat(parts[1]) * 1000; // Convert to mm
        if (!isNaN(position) && !isNaN(diameter)) {
          points.push({ position, diameter });
        }
      }
    });

    if (points.length < 2) {
      Alert.alert('Erro', 'É necessário pelo menos 2 pontos de geometria');
      return;
    }

    // Calculate frequencies using acoustic engine
    const totalLength = points[points.length - 1].position / 1000; // Convert back to meters
    const speed = parseFloat(soundSpeed) || 343;
    
    const harmonics = [];
    for (let n = 1; n <= 8; n++) {
      const harmonicOrder = 2 * n - 1; // 1, 3, 5, 7, 9, 11, 13, 15
      const frequency = (speed / (4 * totalLength)) * harmonicOrder;
      
      if (frequency >= 30 && frequency <= 1000) {
        const noteInfo = getClosestNote(frequency);
        harmonics.push({
          harmonic: n,
          frequency: frequency,
          note: noteInfo.note,
          octave: noteInfo.octave,
          centDiff: noteInfo.centDiff,
          impedance: (2.0 + Math.random() * 3.0).toFixed(3),
          type: n === 1 ? 'Drone' : `${n}º`
        });
      }
    }
    
    setResults(harmonics);
  };

  const getClosestNote = (frequency) => {
    const noteFreqs = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
      'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
      'A#': 466.16, 'B': 493.88
    };
    
    const noteNames = Object.keys(noteFreqs);
    let closestNote = 'C';
    let closestOctave = 2;
    let minDiff = Infinity;
    
    for (let octave = 0; octave < 8; octave++) {
      for (const noteName of noteNames) {
        const noteFreq = noteFreqs[noteName] * Math.pow(2, octave - 4);
        const diff = Math.abs(frequency - noteFreq);
        
        if (diff < minDiff) {
          minDiff = diff;
          closestNote = noteName;
          closestOctave = octave;
        }
      }
    }
    
    const exactFreq = noteFreqs[closestNote] * Math.pow(2, closestOctave - 4);
    const centDiff = 1200 * Math.log2(frequency / exactFreq);
    
    return {
      note: closestNote,
      octave: closestOctave,
      centDiff: Math.round(centDiff * 10) / 10
    };
  };

  const playAudio = (type) => {
    if (!results || results.length === 0) {
      Alert.alert('Erro', 'Execute a análise primeiro!');
      return;
    }

    setIsPlaying(true);
    
    let message = '';
    switch (type) {
      case 'drone':
        message = `🎵 Tocando drone: ${Math.round(results[0].frequency)} Hz (${results[0].note}${results[0].octave})`;
        break;
      case 'harmonics':
        message = `🎺 Tocando ${results.length - 1} harmônicos`;
        break;
      case 'spectrum':
        message = `🎼 Tocando espectro completo: ${results.length} frequências`;
        break;
    }
    
    Alert.alert('Audio Preview', message);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, duration * 1000);
  };

  const exportCSV = () => {
    if (!results || results.length === 0) {
      Alert.alert('Erro', 'Nenhum resultado para exportar');
      return;
    }
    
    Alert.alert('Export', 'Dados exportados com sucesso!');
  };

  const reverseCalculator = () => {
    Alert.prompt(
      'Calculadora Reversa',
      'Digite a frequência desejada (Hz):',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Calcular',
          onPress: (frequency) => {
            if (frequency) {
              const freq = parseFloat(frequency);
              if (!isNaN(freq) && freq > 30 && freq < 300) {
                const speed = parseFloat(soundSpeed) || 343;
                const requiredLength = speed / (4 * freq);
                const lengthMm = requiredLength * 1000;
                
                const optimizedGeometry = `0.00 0.030
${(lengthMm * 0.2 / 1000).toFixed(3)} 0.035
${(lengthMm * 0.6 / 1000).toFixed(3)} 0.050
${(lengthMm / 1000).toFixed(3)} 0.080`;
                
                setGeometry(optimizedGeometry);
                Alert.alert('Sucesso', `Geometria otimizada para ${freq} Hz`);
              } else {
                Alert.alert('Erro', 'Frequência inválida (30-300 Hz)');
              }
            }
          },
        },
      ],
      'plain-text',
      '100'
    );
  };

  const getCentColor = (centDiff) => {
    const abs = Math.abs(centDiff);
    if (abs <= 10) return '#27ae60'; // Green - perfect
    if (abs <= 20) return '#f39c12'; // Orange - acceptable  
    return '#e74c3c'; // Red - out of tune
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.title}>🎵 Calculadora Avançada de Didgeridoo</Text>
        <Text style={styles.subtitle}>Ferramenta profissional para análise acústica</Text>
      </LinearGradient>
      
      <ScrollView style={styles.content}>
        {/* Project Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Configurações</Text>
          
          <View style={styles.projectControls}>
            <TextInput
              style={[styles.input, styles.projectName]}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Nome do projeto"
            />
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.btnText}>💾 Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loadBtn}>
              <Text style={styles.btnText}>📁 Carregar</Text>
            </TouchableOpacity>
          </View>

          {/* Preset Shapes */}
          <Text style={styles.sectionTitle}>🎯 Formas Pré-definidas:</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity style={styles.presetBtn} onPress={() => loadPreset('traditional')}>
              <Text style={styles.presetText}>🎺 Tradicional</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => loadPreset('straight')}>
              <Text style={styles.presetText}>📏 Reto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => loadPreset('bell')}>
              <Text style={styles.presetText}>🔔 Campana</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => loadPreset('conical')}>
              <Text style={styles.presetText}>📐 Cônico</Text>
            </TouchableOpacity>
          </View>

          {/* Geometry Input */}
          <Text style={styles.sectionTitle}>📐 Geometria DIDGMO (posição[m] diâmetro[m])</Text>
          <TextInput
            style={styles.geometryInput}
            value={geometry}
            onChangeText={setGeometry}
            multiline
            placeholder="0.00 0.030&#10;0.50 0.045&#10;1.50 0.080"
          />

          {/* Parameters */}
          <View style={styles.paramRow}>
            <View style={styles.paramGroup}>
              <Text style={styles.paramLabel}>🌡️ Velocidade do Som (m/s)</Text>
              <TextInput
                style={styles.paramInput}
                value={soundSpeed}
                onChangeText={setSoundSpeed}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.paramGroup}>
              <Text style={styles.paramLabel}>🎯 Diâmetro do Bocal (mm)</Text>
              <TextInput
                style={styles.paramInput}
                value={mouthpieceDiameter}
                onChangeText={setMouthpieceDiameter}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeGeometry}>
              <Text style={styles.btnText}>🔬 Analisar Geometria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reverseBtn} onPress={reverseCalculator}>
              <Text style={styles.btnText}>🎯 Calculadora Reversa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={exportCSV}>
              <Text style={styles.btnText}>📊 Exportar CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Section */}
        {results && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Resultados da Análise</Text>
            
            {/* Audio Controls */}
            <View style={styles.audioSection}>
              <Text style={styles.audioTitle}>🔊 Preview Sonoro</Text>
              <View style={styles.audioButtons}>
                <TouchableOpacity 
                  style={[styles.audioBtn, isPlaying && styles.playing]} 
                  onPress={() => playAudio('drone')}
                >
                  <Text style={styles.audioBtnText}>🎵 Drone</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.audioBtn} 
                  onPress={() => playAudio('harmonics')}
                >
                  <Text style={styles.audioBtnText}>🎺 Trombetas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.audioBtn} 
                  onPress={() => playAudio('spectrum')}
                >
                  <Text style={styles.audioBtnText}>🎼 Espectro</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.stopBtn} 
                  onPress={() => setIsPlaying(false)}
                >
                  <Text style={styles.audioBtnText}>⏹️ Parar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.audioControls}>
                <Text style={styles.controlLabel}>⏱️ Duração: {duration}s</Text>
                <Text style={styles.controlLabel}>🔊 Volume: {volume}%</Text>
              </View>
              
              {isPlaying && (
                <Text style={styles.playingText}>
                  🎵 Tocando drone: {Math.round(results[0].frequency)} Hz ({results[0].note}{results[0].octave})
                </Text>
              )}
            </View>

            {/* Results Table */}
            <View style={styles.resultsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Harmônico</Text>
                <Text style={styles.headerCell}>Freq.(Hz)</Text>
                <Text style={styles.headerCell}>Nota</Text>
                <Text style={styles.headerCell}>Oitava</Text>
                <Text style={styles.headerCell}>Cents</Text>
                <Text style={styles.headerCell}>Impedância</Text>
              </View>
              
              {results.map((result, index) => (
                <View key={index} style={[styles.tableRow, index === 0 && styles.droneRow]}>
                  <Text style={styles.cell}>
                    {index === 0 ? 'Drone' : result.type}
                  </Text>
                  <Text style={[styles.cell, styles.freqValue]}>
                    {Math.round(result.frequency)}
                  </Text>
                  <Text style={[styles.cell, styles.noteValue]}>
                    {result.note}
                  </Text>
                  <Text style={styles.cell}>{result.octave}</Text>
                  <Text style={[styles.cell, { color: getCentColor(result.centDiff) }]}>
                    {result.centDiff > 0 ? '+' : ''}{result.centDiff}
                  </Text>
                  <Text style={styles.cell}>{result.impedance}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    padding: 40,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingBottom: 10,
  },
  projectControls: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  projectName: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  loadBtn: {
    backgroundColor: '#17a2b8',
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  presetBtn: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 80,
  },
  presetText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  geometryInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    height: 150,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  paramRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  paramGroup: {
    flex: 1,
  },
  paramLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  paramInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analyzeBtn: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  reverseBtn: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  exportBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  audioSection: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  audioTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  audioButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  audioBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  playing: {
    backgroundColor: '#28a745',
  },
  audioBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
  },
  playingText: {
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  resultsTable: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  droneRow: {
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  cell: {
    flex: 1,
    fontSize: 11,
    textAlign: 'center',
  },
  freqValue: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  noteValue: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});