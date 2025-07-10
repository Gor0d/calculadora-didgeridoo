import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AnalyzerScreen() {
  const [activeTab, setActiveTab] = useState('results');
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([
    { harmonic: 'Drone', frequency: 54, note: 'A', octave: 1, centDiff: -16.1, impedance: '0.000' },
    { harmonic: '2º', frequency: 164, note: 'E', octave: 3, centDiff: -3.3, impedance: '0.000' },
    { harmonic: '3º', frequency: 274, note: 'C#', octave: 4, centDiff: -18.9, impedance: '0.000' },
    { harmonic: '4º', frequency: 384, note: 'G', octave: 4, centDiff: -36.5, impedance: '0.000' },
    { harmonic: '5º', frequency: 493, note: 'B', octave: 4, centDiff: -1.3, impedance: '0.000' },
    { harmonic: '6º', frequency: 603, note: 'D', octave: 5, centDiff: 46.1, impedance: '0.000' },
    { harmonic: '7º', frequency: 713, note: 'F', octave: 5, centDiff: 35.3, impedance: '0.000' },
    { harmonic: '8º', frequency: 822, note: 'G#', octave: 5, centDiff: -17, impedance: '0.000' },
  ]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [volume, setVolume] = useState(30);
  const [duration, setDuration] = useState(7);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const playAudio = (type) => {
    setCurrentlyPlaying(type);
    
    let message = '';
    switch (type) {
      case 'drone':
        message = `Tocando drone: ${analysisResults[0].frequency} Hz (${analysisResults[0].note}${analysisResults[0].octave})`;
        break;
      case 'harmonics':
        message = `🎺 Tocando ${analysisResults.length - 1} harmônicos`;
        break;
      case 'spectrum':
        message = `🎼 Espectro completo: ${analysisResults.length} frequências`;
        break;
    }
    
    setTimeout(() => {
      setCurrentlyPlaying(null);
    }, duration * 1000);
  };

  const getCentColor = (centDiff) => {
    const abs = Math.abs(centDiff);
    if (abs <= 10) return '#27ae60';
    if (abs <= 20) return '#f39c12';
    return '#e74c3c';
  };

  const renderGeometryVisualization = () => (
    <View style={styles.visualization}>
      <Text style={styles.vizTitle}>📐 Geometria do Didgeridoo</Text>
      <View style={styles.didgeridooShape}>
        {/* Simple SVG-like representation */}
        <View style={styles.didgeridooBody} />
        <View style={styles.mouthpiece} />
        <View style={styles.bell} />
      </View>
      <View style={styles.measurements}>
        <Text style={styles.measureText}>Comprimento: 155 cm</Text>
        <Text style={styles.measureText}>Diâmetro: 30-75 mm</Text>
      </View>
    </View>
  );

  const renderImpedanceChart = () => (
    <View style={styles.visualization}>
      <Text style={styles.vizTitle}>📊 Espectro de Impedância</Text>
      <View style={styles.chartContainer}>
        {analysisResults.map((result, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={[
              styles.bar, 
              { 
                height: (result.frequency / 1000) * 120,
                backgroundColor: index === 0 ? '#e74c3c' : '#667eea'
              }
            ]} />
            <Text style={styles.barLabel}>{result.harmonic}</Text>
            <Text style={styles.freqLabel}>{result.frequency}Hz</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMetrics = () => (
    <View style={styles.metricsContainer}>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>📏 Comprimento Total</Text>
        <Text style={styles.metricValue}>155<Text style={styles.unit}>cm</Text></Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>⭕ Diâmetro Médio</Text>
        <Text style={styles.metricValue}>52<Text style={styles.unit}>mm</Text></Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>🎵 Nota Fundamental</Text>
        <Text style={styles.metricValue}>A1<Text style={styles.unit}>(54 Hz)</Text></Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>🎯 Precisão</Text>
        <Text style={[styles.metricValue, { color: '#f39c12' }]}>⚠️ Aceitável</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.title}>🔬 Analisador Didgeridoo</Text>
        <Text style={styles.subtitle}>Scanner e análise de instrumentos existentes</Text>
      </LinearGradient>
      
      <ScrollView style={styles.content}>
        {/* Scanner Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Scanner de Geometria</Text>
          <View style={styles.scannerArea}>
            <View style={styles.cameraPreview}>
              {isScanning ? (
                <View style={styles.scanningOverlay}>
                  <Text style={styles.scanningText}>🔄 Escaneando geometria...</Text>
                  <View style={styles.scanLine} />
                </View>
              ) : (
                <Text style={styles.cameraText}>📱 Posicione o didgeridoo na tela</Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.scanBtn, isScanning && styles.scanning]} 
            onPress={startScan}
            disabled={isScanning}
          >
            <Text style={styles.btnText}>
              {isScanning ? '⏳ Escaneando...' : '📷 Iniciar Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Audio Preview Section */}
        <View style={styles.audioCard}>
          <Text style={styles.audioTitle}>🔊 Preview Sonoro</Text>
          <View style={styles.audioButtons}>
            <TouchableOpacity 
              style={[styles.audioBtn, currentlyPlaying === 'drone' && styles.playing]} 
              onPress={() => playAudio('drone')}
            >
              <Text style={styles.audioBtnText}>🎵 Drone</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.audioBtn, currentlyPlaying === 'harmonics' && styles.playing]} 
              onPress={() => playAudio('harmonics')}
            >
              <Text style={styles.audioBtnText}>🎺 Trombetas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.audioBtn, currentlyPlaying === 'spectrum' && styles.playing]} 
              onPress={() => playAudio('spectrum')}
            >
              <Text style={styles.audioBtnText}>🎼 Espectro</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.volumeControl}>
            <Text style={styles.controlText}>🔊 Volume: {volume}%</Text>
            <Text style={styles.controlText}>⏱️ Duração: {duration}s</Text>
          </View>

          {currentlyPlaying && (
            <View style={styles.playingIndicator}>
              <Text style={styles.playingText}>
                🎵 Tocando drone: {analysisResults[0].frequency} Hz ({analysisResults[0].note}{analysisResults[0].octave})
              </Text>
            </View>
          )}
        </View>

        {/* Results Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Resultados da Análise</Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'results' && styles.activeTab]}
              onPress={() => setActiveTab('results')}
            >
              <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
                📈 Resultados
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'visualization' && styles.activeTab]}
              onPress={() => setActiveTab('visualization')}
            >
              <Text style={[styles.tabText, activeTab === 'visualization' && styles.activeTabText]}>
                📊 Visualização
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
              onPress={() => setActiveTab('metrics')}
            >
              <Text style={[styles.tabText, activeTab === 'metrics' && styles.activeTabText]}>
                📋 Métricas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'results' && (
            <View style={styles.resultsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Harmônico</Text>
                <Text style={styles.headerCell}>Freq.(Hz)</Text>
                <Text style={styles.headerCell}>Nota</Text>
                <Text style={styles.headerCell}>Oitava</Text>
                <Text style={styles.headerCell}>Cents</Text>
                <Text style={styles.headerCell}>Impedância</Text>
              </View>
              
              {analysisResults.map((result, index) => (
                <View key={index} style={[styles.tableRow, index === 0 && styles.droneRow]}>
                  <Text style={styles.cell}>{result.harmonic}</Text>
                  <Text style={[styles.cell, styles.freqValue]}>{result.frequency}</Text>
                  <Text style={[styles.cell, styles.noteValue]}>{result.note}</Text>
                  <Text style={styles.cell}>{result.octave}</Text>
                  <Text style={[styles.cell, { color: getCentColor(result.centDiff) }]}>
                    {result.centDiff > 0 ? '+' : ''}{result.centDiff}
                  </Text>
                  <Text style={styles.cell}>{result.impedance}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'visualization' && (
            <View style={styles.tabContent}>
              <View style={styles.vizTabs}>
                <TouchableOpacity style={styles.vizTab}>
                  <Text style={styles.vizTabText}>📐 Geometria</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vizTab}>
                  <Text style={styles.vizTabText}>📊 Impedância</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vizTab}>
                  <Text style={styles.vizTabText}>🎵 Espectro</Text>
                </TouchableOpacity>
              </View>
              {renderImpedanceChart()}
            </View>
          )}

          {activeTab === 'metrics' && renderMetrics()}
        </View>
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
  scannerArea: {
    marginBottom: 20,
  },
  cameraPreview: {
    height: 200,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraText: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  scanningText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scanLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#DAA520',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  scanBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanning: {
    backgroundColor: '#cccccc',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioCard: {
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
    gap: 10,
    marginBottom: 15,
  },
  audioBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playing: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  audioBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  volumeControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
  },
  playingIndicator: {
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playingText: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#667eea',
  },
  tabContent: {
    minHeight: 200,
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
    fontSize: 10,
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
    fontSize: 10,
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
  vizTabs: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  vizTab: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginRight: 5,
    borderRadius: 4,
  },
  vizTabText: {
    fontSize: 10,
    fontWeight: '600',
  },
  visualization: {
    alignItems: 'center',
    padding: 20,
  },
  vizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 5,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#667eea',
    borderRadius: 2,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  freqLabel: {
    fontSize: 7,
    color: '#666',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  metricTitle: {
    fontSize: 12,
    color: '#667eea',
    marginBottom: 5,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
});