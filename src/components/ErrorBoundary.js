import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeviceInfo, getTypography, getSpacing } from '../utils/responsive';
import * as Haptics from 'expo-haptics';

const deviceInfo = getDeviceInfo();
const typography = getTypography();
const spacing = getSpacing();

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to crash reporting service (if configured)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Here you would log to your crash reporting service
    // Example: Sentry, Crashlytics, etc.
    console.error('Error logged to service:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    });
  };

  handleReload = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  handleShowDetails = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  handleReportError = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    const { error, errorInfo } = this.state;
    const errorReport = `
Erro: ${error?.toString() || 'Unknown error'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
Timestamp: ${new Date().toISOString()}
Device: ${deviceInfo.isTablet ? 'Tablet' : 'Phone'}
`;

    Alert.alert(
      'Reportar Erro',
      'Deseja copiar os detalhes do erro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Copiar',
          onPress: () => {
            // In a real app, you'd copy to clipboard or send to support
            console.log('Error report:', errorReport);
            Alert.alert('Erro Copiado', 'Detalhes do erro foram copiados.');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;

      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.gradient}
          >
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Error Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>Oops! Algo deu errado</Text>
              
              {/* Description */}
              <Text style={styles.description}>
                O aplicativo encontrou um erro inesperado. Não se preocupe, 
                seus dados estão seguros e você pode tentar novamente.
              </Text>

              {/* Error Type */}
              {error && (
                <View style={styles.errorTypeContainer}>
                  <Text style={styles.errorType}>
                    {error.name || 'Erro Desconhecido'}
                  </Text>
                  <Text style={styles.errorMessage}>
                    {error.message || 'Nenhuma mensagem disponível'}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={this.handleReload}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>🔄 Tentar Novamente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={this.handleShowDetails}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>
                    {showDetails ? '📋 Ocultar Detalhes' : '📋 Ver Detalhes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tertiaryButton}
                  onPress={this.handleReportError}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tertiaryButtonText}>📧 Reportar Erro</Text>
                </TouchableOpacity>
              </View>

              {/* Error Details */}
              {showDetails && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Detalhes Técnicos:</Text>
                  
                  <View style={styles.detailsContent}>
                    <Text style={styles.detailsLabel}>Erro:</Text>
                    <Text style={styles.detailsText}>
                      {error?.toString() || 'No error details'}
                    </Text>
                    
                    <Text style={styles.detailsLabel}>Stack Trace:</Text>
                    <Text style={styles.detailsText}>
                      {error?.stack || 'No stack trace available'}
                    </Text>
                    
                    {errorInfo?.componentStack && (
                      <>
                        <Text style={styles.detailsLabel}>Component Stack:</Text>
                        <Text style={styles.detailsText}>
                          {errorInfo.componentStack}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Se o problema persistir, reinicie o aplicativo completamente.
                </Text>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  errorTypeContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorType: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: '#F87171',
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: typography.small,
    color: '#FCA5A5',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginBottom: spacing.sm,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.sm,
    minWidth: 160,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontSize: typography.small,
    fontWeight: '500',
  },
  tertiaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#9CA3AF',
    fontSize: typography.small,
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  detailsTitle: {
    fontSize: typography.h4,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  detailsContent: {
    maxHeight: 300,
  },
  detailsLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    color: '#10B981',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  detailsText: {
    fontSize: typography.caption,
    color: '#D1D5DB',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.caption,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});