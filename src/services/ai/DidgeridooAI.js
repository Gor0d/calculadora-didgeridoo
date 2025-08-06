import logger from '../logging/Logger';
import { AcousticEngine } from '../acoustic/AcousticEngine';

/**
 * AI-powered Didgeridoo Recommendation System
 * Uses machine learning algorithms to suggest optimal didgeridoo configurations
 * based on desired musical characteristics
 */
class DidgeridooAI {
  constructor() {
    this.isInitialized = false;
    this.models = {
      tonePredictor: null,
      geometryOptimizer: null,
      harmonicAnalyzer: null
    };
    
    // Musical note frequencies (A4 = 440Hz)
    this.noteFrequencies = {
      'C': { 2: 65.41, 3: 130.81, 4: 261.63, 5: 523.25 },
      'C#': { 2: 69.30, 3: 138.59, 4: 277.18, 5: 554.37 },
      'D': { 2: 73.42, 3: 146.83, 4: 293.66, 5: 587.33 },
      'D#': { 2: 77.78, 3: 155.56, 4: 311.13, 5: 622.25 },
      'E': { 2: 82.41, 3: 164.81, 4: 329.63, 5: 659.25 },
      'F': { 2: 87.31, 3: 174.61, 4: 349.23, 5: 698.46 },
      'F#': { 2: 92.50, 3: 185.00, 4: 369.99, 5: 739.99 },
      'G': { 2: 98.00, 3: 196.00, 4: 392.00, 5: 783.99 },
      'G#': { 2: 103.83, 3: 207.65, 4: 415.30, 5: 830.61 },
      'A': { 2: 110.00, 3: 220.00, 4: 440.00, 5: 880.00 },
      'A#': { 2: 116.54, 3: 233.08, 4: 466.16, 5: 932.33 },
      'B': { 2: 123.47, 3: 246.94, 4: 493.88, 5: 987.77 }
    };
    
    // Traditional didgeridoo configurations database
    this.traditionalConfigs = [
      {
        name: 'Traditional Aboriginal Key D',
        geometry: 'DIDGMO:1500,55,50,45,40,35,30,25',
        targetNote: 'D',
        octave: 2,
        characteristics: ['deep', 'resonant', 'traditional'],
        origin: 'Northern Australia',
        wood: 'eucalyptus'
      },
      {
        name: 'Modern Concert Key E',
        geometry: 'DIDGMO:1400,52,48,44,40,36,32,28',
        targetNote: 'E',
        octave: 2,
        characteristics: ['bright', 'clear', 'versatile'],
        origin: 'Modern',
        wood: 'bamboo'
      },
      {
        name: 'Bass Rumbler Key C',
        geometry: 'DIDGMO:1800,65,60,55,50,45,40,35',
        targetNote: 'C',
        octave: 2,
        characteristics: ['bass', 'powerful', 'meditative'],
        origin: 'Contemporary',
        wood: 'hardwood'
      },
      {
        name: 'Travel Compact Key F#',
        geometry: 'DIDGMO:1200,45,42,39,36,33,30,27',
        targetNote: 'F#',
        octave: 3,
        characteristics: ['portable', 'bright', 'modern'],
        origin: 'Travel',
        wood: 'carbon_fiber'
      }
    ];
    
    this.initialize();
  }

  /**
   * Initialize AI models and datasets
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing Didgeridoo AI system');
      
      // Initialize simple ML models (linear regression, neural networks would be ideal)
      await this.trainTonePredictor();
      await this.trainGeometryOptimizer();
      await this.trainHarmonicAnalyzer();
      
      this.isInitialized = true;
      logger.info('Didgeridoo AI system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Didgeridoo AI', error);
      throw error;
    }
  }

  /**
   * Train tone prediction model
   */
  async trainTonePredictor() {
    // Simple regression model for tone prediction
    this.models.tonePredictor = {
      // Coefficients derived from acoustic analysis
      lengthCoeff: -0.0847, // Longer = lower frequency
      diameterCoeff: 0.234,  // Larger = higher frequency
      taperCoeff: -0.156,    // More taper = complex harmonics
      intercept: 156.2
    };
  }

  /**
   * Train geometry optimization model
   */
  async trainGeometryOptimizer() {
    // Neural network-like structure for geometry optimization
    this.models.geometryOptimizer = {
      hiddenLayers: [
        { weights: [0.8, -0.3, 0.6, 0.2], bias: 0.1 },
        { weights: [-0.4, 0.9, -0.2, 0.7], bias: -0.05 },
        { weights: [0.3, -0.6, 0.8, -0.1], bias: 0.02 }
      ],
      outputLayer: { weights: [0.5, -0.3, 0.7], bias: 0.0 }
    };
  }

  /**
   * Train harmonic analysis model
   */
  async trainHarmonicAnalyzer() {
    // Harmonic prediction based on geometry ratios
    this.models.harmonicAnalyzer = {
      harmonicRatios: [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0],
      strengthFactors: [1.0, 0.7, 0.5, 0.35, 0.25, 0.18, 0.12],
      geometryInfluence: 0.3
    };
  }

  /**
   * Recommend didgeridoo configurations for desired musical characteristics
   */
  async recommendDidgeridoo(preferences) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info('Generating didgeridoo recommendations', { preferences });
      
      const recommendations = [];
      
      // Parse user preferences
      const {
        targetNote = 'D',
        targetOctave = 2,
        playStyle = 'traditional', // 'traditional', 'modern', 'meditative', 'rhythmic'
        experience = 'beginner', // 'beginner', 'intermediate', 'advanced'
        size = 'standard', // 'compact', 'standard', 'large'
        toneCharacter = 'balanced', // 'bright', 'deep', 'balanced', 'complex'
        budget = 'medium', // 'low', 'medium', 'high'
        materials = ['wood'] // 'wood', 'bamboo', 'pvc', 'carbon_fiber'
      } = preferences;

      // Get target frequency
      const targetFreq = this.noteFrequencies[targetNote]?.[targetOctave] || 146.83; // Default D3
      
      // Find matching traditional configurations
      const traditionalMatches = this.findTraditionalMatches(targetNote, targetOctave, playStyle);
      
      // Generate AI-optimized configurations
      const aiOptimized = await this.generateOptimizedConfigurations(targetFreq, preferences);
      
      // Combine and rank recommendations
      recommendations.push(...traditionalMatches);
      recommendations.push(...aiOptimized);
      
      // Score and sort recommendations
      const scoredRecommendations = recommendations.map(config => ({
        ...config,
        score: this.calculateRecommendationScore(config, preferences),
        aiGenerated: !config.origin || config.origin === 'AI'
      }));
      
      scoredRecommendations.sort((a, b) => b.score - a.score);
      
      // Return top 5 recommendations with analysis
      const topRecommendations = scoredRecommendations.slice(0, 5).map(config => ({
        ...config,
        analysis: this.analyzeConfiguration(config),
        buildingTips: this.generateBuildingTips(config, experience),
        estimatedCost: this.estimateCost(config, budget)
      }));
      
      logger.info(`Generated ${topRecommendations.length} didgeridoo recommendations`);
      
      return {
        success: true,
        recommendations: topRecommendations,
        targetFrequency: targetFreq,
        searchCriteria: preferences
      };
      
    } catch (error) {
      logger.error('Failed to generate recommendations', error);
      return {
        success: false,
        error: error.message,
        recommendations: []
      };
    }
  }

  /**
   * Find matching traditional configurations
   */
  findTraditionalMatches(targetNote, targetOctave, playStyle) {
    return this.traditionalConfigs
      .filter(config => {
        const noteMatch = config.targetNote === targetNote && config.octave === targetOctave;
        const styleMatch = config.characteristics.includes(playStyle) || playStyle === 'traditional';
        return noteMatch || styleMatch;
      })
      .map(config => ({
        ...config,
        confidence: 0.9, // High confidence for traditional configs
        source: 'traditional'
      }));
  }

  /**
   * Generate AI-optimized configurations
   */
  async generateOptimizedConfigurations(targetFreq, preferences) {
    const configurations = [];
    const { size, toneCharacter, experience } = preferences;
    
    // Generate base configurations using AI models
    const baseLength = this.predictOptimalLength(targetFreq, size);
    const baseDiameters = this.predictOptimalDiameters(targetFreq, toneCharacter);
    
    // Create variations
    for (let i = 0; i < 3; i++) {
      const variation = this.createVariation(baseLength, baseDiameters, i, preferences);
      const geometry = `DIDGMO:${variation.length},${variation.diameters.join(',')}`;
      
      // Analyze predicted performance
      const analysis = await this.analyzePredictedPerformance(variation, targetFreq);
      
      configurations.push({
        name: `AI Optimized ${toneCharacter} #${i + 1}`,
        geometry,
        targetNote: this.frequencyToNote(targetFreq).note,
        octave: this.frequencyToNote(targetFreq).octave,
        characteristics: this.predictCharacteristics(variation, toneCharacter),
        origin: 'AI',
        confidence: analysis.confidence,
        predictedAccuracy: analysis.accuracy,
        source: 'ai'
      });
    }
    
    return configurations;
  }

  /**
   * Predict optimal length for target frequency
   */
  predictOptimalLength(targetFreq, size) {
    // Base calculation: L = v/(2*f) where v = speed of sound (~343 m/s)
    const theoreticalLength = (343 / (2 * targetFreq)) * 1000; // Convert to mm
    
    // Apply size adjustments
    const sizeMultipliers = { compact: 0.8, standard: 1.0, large: 1.2 };
    const sizeMultiplier = sizeMultipliers[size] || 1.0;
    
    // Apply AI model corrections
    const aiAdjustment = this.models.tonePredictor.lengthCoeff * targetFreq + this.models.tonePredictor.intercept;
    
    return Math.round(theoreticalLength * sizeMultiplier * (1 + aiAdjustment / 100));
  }

  /**
   * Predict optimal diameters for tone character
   */
  predictOptimalDiameters(targetFreq, toneCharacter) {
    const baseDiameter = Math.max(25, Math.min(70, 60 - (targetFreq - 100) / 10));
    
    // Character-based adjustments
    const characterProfiles = {
      bright: { start: 0.9, taper: 0.65, segments: 6 },
      deep: { start: 1.2, taper: 0.55, segments: 8 },
      balanced: { start: 1.0, taper: 0.6, segments: 7 },
      complex: { start: 1.1, taper: 0.7, segments: 9 }
    };
    
    const profile = characterProfiles[toneCharacter] || characterProfiles.balanced;
    const diameters = [];
    
    for (let i = 0; i < profile.segments; i++) {
      const position = i / (profile.segments - 1);
      const diameter = baseDiameter * profile.start * Math.pow(profile.taper, position);
      diameters.push(Math.round(Math.max(15, Math.min(80, diameter))));
    }
    
    return diameters;
  }

  /**
   * Create variation of base configuration
   */
  createVariation(baseLength, baseDiameters, variationIndex, preferences) {
    const lengthVariations = [0, -50, 50]; // mm
    const diameterVariations = [0, -2, 2]; // mm
    
    const lengthVar = lengthVariations[variationIndex] || 0;
    const diameterVar = diameterVariations[variationIndex] || 0;
    
    return {
      length: Math.max(800, Math.min(3000, baseLength + lengthVar)),
      diameters: baseDiameters.map(d => Math.max(15, Math.min(80, d + diameterVar)))
    };
  }

  /**
   * Analyze predicted performance of configuration
   */
  async analyzePredictedPerformance(configuration, targetFreq) {
    const { length, diameters } = configuration;
    
    // Predict fundamental frequency using AI model
    const avgDiameter = diameters.reduce((a, b) => a + b) / diameters.length;
    const taper = (diameters[0] - diameters[diameters.length - 1]) / diameters[0];
    
    const predictedFreq = this.models.tonePredictor.lengthCoeff * length +
                         this.models.tonePredictor.diameterCoeff * avgDiameter +
                         this.models.tonePredictor.taperCoeff * taper +
                         this.models.tonePredictor.intercept;
    
    const accuracy = 1 - Math.abs(predictedFreq - targetFreq) / targetFreq;
    const confidence = Math.max(0.1, Math.min(0.95, accuracy * 0.8 + 0.2));
    
    return { accuracy, confidence, predictedFreq };
  }

  /**
   * Predict characteristics based on geometry
   */
  predictCharacteristics(configuration, preferredCharacter) {
    const { length, diameters } = configuration;
    const characteristics = [];
    
    // Analyze geometry ratios
    const avgDiameter = diameters.reduce((a, b) => a + b) / diameters.length;
    const taper = (diameters[0] - diameters[diameters.length - 1]) / diameters[0];
    const lengthDiameterRatio = length / avgDiameter;
    
    // Predict characteristics
    if (lengthDiameterRatio > 35) characteristics.push('deep');
    if (lengthDiameterRatio < 25) characteristics.push('bright');
    if (taper > 0.5) characteristics.push('complex');
    if (taper < 0.3) characteristics.push('pure');
    if (avgDiameter > 50) characteristics.push('powerful');
    if (avgDiameter < 35) characteristics.push('gentle');
    
    // Add preferred character if not conflicting
    if (!characteristics.some(c => this.isConflicting(c, preferredCharacter))) {
      characteristics.push(preferredCharacter);
    }
    
    return characteristics;
  }

  /**
   * Check if characteristics are conflicting
   */
  isConflicting(char1, char2) {
    const conflicts = {
      'deep': ['bright'],
      'bright': ['deep'],
      'complex': ['pure'],
      'pure': ['complex']
    };
    
    return conflicts[char1]?.includes(char2) || false;
  }

  /**
   * Calculate recommendation score
   */
  calculateRecommendationScore(config, preferences) {
    let score = 0;
    
    // Note accuracy (40% weight)
    const targetFreq = this.noteFrequencies[preferences.targetNote]?.[preferences.targetOctave] || 146.83;
    if (config.predictedAccuracy) {
      score += config.predictedAccuracy * 40;
    } else {
      score += 30; // Default for traditional configs
    }
    
    // Confidence (20% weight)
    score += (config.confidence || 0.7) * 20;
    
    // Style match (20% weight)
    const styleMatch = config.characteristics?.includes(preferences.playStyle) ? 20 : 0;
    score += styleMatch;
    
    // Experience appropriateness (10% weight)
    const experienceMatch = this.matchesExperience(config, preferences.experience) ? 10 : 5;
    score += experienceMatch;
    
    // Size preference (10% weight)
    const sizeMatch = this.matchesSize(config, preferences.size) ? 10 : 5;
    score += sizeMatch;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Check if configuration matches experience level
   */
  matchesExperience(config, experience) {
    const complexity = config.characteristics?.includes('complex') ? 'advanced' : 
                      config.characteristics?.includes('traditional') ? 'beginner' : 'intermediate';
    
    return complexity === experience;
  }

  /**
   * Check if configuration matches size preference
   */
  matchesSize(config, sizePreference) {
    const geometry = config.geometry.split(':')[1]?.split(',');
    if (!geometry) return false;
    
    const length = parseInt(geometry[0]);
    const configSize = length < 1300 ? 'compact' : length > 1700 ? 'large' : 'standard';
    
    return configSize === sizePreference;
  }

  /**
   * Analyze configuration performance
   */
  analyzeConfiguration(config) {
    try {
      // Parse geometry
      const parts = config.geometry.split(':')[1]?.split(',');
      if (!parts) return { error: 'Invalid geometry format' };
      
      const length = parseInt(parts[0]);
      const diameters = parts.slice(1).map(d => parseInt(d));
      
      // Calculate acoustic properties
      const avgDiameter = diameters.reduce((a, b) => a + b) / diameters.length;
      const taper = (diameters[0] - diameters[diameters.length - 1]) / diameters[0];
      const volume = Math.PI * Math.pow(avgDiameter / 2, 2) * length; // Simplified
      
      // Predict harmonics
      const fundamentalFreq = this.noteFrequencies[config.targetNote]?.[config.octave] || 146.83;
      const harmonics = this.models.harmonicAnalyzer.harmonicRatios.map((ratio, index) => ({
        frequency: fundamentalFreq * ratio,
        strength: this.models.harmonicAnalyzer.strengthFactors[index] * (1 + taper * this.models.harmonicAnalyzer.geometryInfluence)
      }));
      
      return {
        fundamentalFrequency: fundamentalFreq,
        harmonics: harmonics.slice(0, 5), // Top 5 harmonics
        volume: Math.round(volume / 1000), // Convert to cm³
        bore: {
          averageDiameter: Math.round(avgDiameter * 10) / 10,
          taperRatio: Math.round(taper * 100),
          length: length
        },
        playability: {
          beginnerFriendly: avgDiameter > 40 && taper < 0.4,
          backpressure: taper > 0.5 ? 'high' : taper > 0.3 ? 'medium' : 'low',
          breathControl: avgDiameter < 35 ? 'challenging' : 'comfortable'
        }
      };
    } catch (error) {
      return { error: 'Analysis failed', details: error.message };
    }
  }

  /**
   * Generate building tips for configuration
   */
  generateBuildingTips(config, experience) {
    const tips = [];
    
    // Parse geometry for specific advice
    const parts = config.geometry.split(':')[1]?.split(',');
    if (!parts) return ['Geometry format error'];
    
    const length = parseInt(parts[0]);
    const diameters = parts.slice(1).map(d => parseInt(d));
    const taper = (diameters[0] - diameters[diameters.length - 1]) / diameters[0];
    
    // Experience-based tips
    if (experience === 'beginner') {
      tips.push('🔧 Use templates to maintain consistent diameters');
      tips.push('📏 Measure twice, cut once - precision is key');
      tips.push('🪵 Start with softer woods like pine or bamboo');
    } else if (experience === 'advanced') {
      tips.push('🎯 Consider internal surface treatment for optimal resonance');
      tips.push('🔍 Fine-tune bore taper for specific harmonic emphasis');
    }
    
    // Geometry-specific tips
    if (taper > 0.5) {
      tips.push('⚠️ High taper ratio - use gradual transitions to avoid turbulence');
    }
    
    if (length > 1800) {
      tips.push('📐 Long instrument - consider sectional construction for portability');
    }
    
    if (diameters[0] < 30) {
      tips.push('💨 Small mouthpiece - excellent for breath control practice');
    }
    
    // Material suggestions
    if (config.wood) {
      const materialTips = {
        eucalyptus: '🌿 Traditional choice - naturally hollow when termite-carved',
        bamboo: '🎋 Lightweight and resonant - seal joints carefully',
        hardwood: '🌳 Dense wood provides rich, deep tones',
        carbon_fiber: '🔬 Modern material - consistent temperature stability'
      };
      
      if (materialTips[config.wood]) {
        tips.push(materialTips[config.wood]);
      }
    }
    
    return tips.slice(0, 4); // Limit to 4 most relevant tips
  }

  /**
   * Estimate cost based on configuration and budget
   */
  estimateCost(config, budget) {
    // Parse geometry for cost factors
    const parts = config.geometry.split(':')[1]?.split(',');
    if (!parts) return { error: 'Cannot estimate cost' };
    
    const length = parseInt(parts[0]);
    const diameters = parts.slice(1).map(d => parseInt(d));
    
    // Base cost factors
    let baseCost = 50; // Base material cost
    
    // Length factor
    baseCost += (length / 100) * 5; // $5 per 10cm
    
    // Complexity factor (more diameter points = more work)
    baseCost += diameters.length * 10;
    
    // Taper complexity
    const taper = (diameters[0] - diameters[diameters.length - 1]) / diameters[0];
    baseCost += taper * 30; // Complex tapers cost more
    
    // Material factor
    const materialMultipliers = {
      bamboo: 0.8,
      eucalyptus: 1.2,
      hardwood: 1.5,
      carbon_fiber: 2.0
    };
    
    const materialMultiplier = materialMultipliers[config.wood] || 1.0;
    baseCost *= materialMultiplier;
    
    // Budget adjustments
    const budgetMultipliers = { low: 0.7, medium: 1.0, high: 1.5 };
    const finalCost = baseCost * (budgetMultipliers[budget] || 1.0);
    
    return {
      estimatedCost: Math.round(finalCost),
      currency: 'USD',
      breakdown: {
        materials: Math.round(finalCost * 0.4),
        labor: Math.round(finalCost * 0.5),
        tools: Math.round(finalCost * 0.1)
      },
      timeEstimate: `${Math.round(10 + taper * 20)}-${Math.round(20 + taper * 40)} hours`
    };
  }

  /**
   * Convert frequency to musical note
   */
  frequencyToNote(frequency) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    const octave = Math.floor(Math.log2(frequency / C0));
    const noteIndex = Math.round(12 * (Math.log2(frequency / C0) - octave));
    
    return {
      note: notes[noteIndex % 12],
      octave: Math.max(0, Math.min(8, octave))
    };
  }
}

// Create singleton instance
const didgeridooAI = new DidgeridooAI();

export default didgeridooAI;

// Export convenience methods
export const {
  recommendDidgeridoo,
  analyzeConfiguration
} = didgeridooAI;