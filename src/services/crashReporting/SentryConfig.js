import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import logger from '../logging/Logger';

/**
 * Sentry configuration for crash reporting and performance monitoring
 */
class SentryConfig {
  constructor() {
    this.isInitialized = false;
    this.isEnabled = !__DEV__; // Disable in development by default
  }

  /**
   * Initialize Sentry with configuration
   */
  initialize(options = {}) {
    if (this.isInitialized) {
      logger.warn('Sentry already initialized');
      return;
    }

    const defaultConfig = {
      // Replace with your actual Sentry DSN
      dsn: process.env.SENTRY_DSN || null,
      
      // Performance monitoring
      tracesSampleRate: __DEV__ ? 0.0 : 0.1, // 10% sampling in production
      
      // Session tracking
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      
      // Native crashes
      enableNative: true,
      enableNativeCrashHandling: true,
      
      // JavaScript errors
      enableCaptureFailedRequests: true,
      
      // Debug options
      debug: __DEV__,
      
      // Environment
      environment: __DEV__ ? 'development' : 'production',
      
      // Release tracking
      release: '1.0.0', // Should match your app version
      
      // Distribution (for Expo)
      dist: Platform.select({
        ios: 'ios',
        android: 'android',
        default: 'unknown'
      }),

      // Before send hook - filter out sensitive data
      beforeSend: (event, hint) => {
        if (!this.isEnabled) {
          return null; // Don't send if disabled
        }
        
        // Filter out sensitive information
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object') {
            // Remove any sensitive data from error context
            delete event.contexts?.device?.device_unique_id;
            delete event.user?.ip_address;
          }
        }
        
        logger.debug('Sending error to Sentry', { 
          eventId: event.event_id,
          level: event.level 
        });
        
        return event;
      },

      // Performance data filtering
      beforeSendTransaction: (transaction) => {
        if (!this.isEnabled) {
          return null;
        }
        
        // Filter out development transactions
        if (__DEV__ && transaction.transaction?.includes('dev')) {
          return null;
        }
        
        return transaction;
      },

      // Integration configuration
      integrations: [
        // React Native specific integrations will be auto-added
      ],

      // Additional options
      maxBreadcrumbs: 100,
      attachStacktrace: true,
      
      ...options
    };

    try {
      // Only initialize if DSN is provided
      if (defaultConfig.dsn) {
        Sentry.init(defaultConfig);
        this.isInitialized = true;
        this.isEnabled = true;
        
        logger.info('Sentry initialized successfully', {
          environment: defaultConfig.environment,
          release: defaultConfig.release
        });
      } else {
        logger.warn('Sentry DSN not provided, crash reporting disabled');
        this.isEnabled = false;
      }
    } catch (error) {
      logger.error('Failed to initialize Sentry', error);
      this.isEnabled = false;
    }
  }

  /**
   * Capture an exception manually
   */
  captureException(error, context = {}) {
    if (!this.isEnabled || !this.isInitialized) {
      logger.debug('Sentry not enabled, logging error locally', { error: error.message });
      return null;
    }

    try {
      Sentry.withScope((scope) => {
        // Add context information
        if (context.tags) {
          Object.keys(context.tags).forEach(key => {
            scope.setTag(key, context.tags[key]);
          });
        }

        if (context.extra) {
          Object.keys(context.extra).forEach(key => {
            scope.setExtra(key, context.extra[key]);
          });
        }

        if (context.user) {
          scope.setUser(context.user);
        }

        if (context.level) {
          scope.setLevel(context.level);
        }

        Sentry.captureException(error);
      });

      logger.debug('Exception sent to Sentry', { message: error.message });
    } catch (sentryError) {
      logger.error('Failed to send exception to Sentry', sentryError);
    }
  }

  /**
   * Capture a message manually
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.isEnabled || !this.isInitialized) {
      logger.debug('Sentry not enabled, logging message locally', { message });
      return null;
    }

    try {
      Sentry.withScope((scope) => {
        scope.setLevel(level);
        
        if (context.tags) {
          Object.keys(context.tags).forEach(key => {
            scope.setTag(key, context.tags[key]);
          });
        }

        if (context.extra) {
          Object.keys(context.extra).forEach(key => {
            scope.setExtra(key, context.extra[key]);
          });
        }

        Sentry.captureMessage(message);
      });

      logger.debug('Message sent to Sentry', { message, level });
    } catch (error) {
      logger.error('Failed to send message to Sentry', error);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb) {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    try {
      Sentry.addBreadcrumb({
        timestamp: new Date().getTime() / 1000,
        ...breadcrumb
      });
    } catch (error) {
      logger.error('Failed to add breadcrumb to Sentry', error);
    }
  }

  /**
   * Set user context
   */
  setUser(user) {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    try {
      Sentry.setUser(user);
      logger.debug('User context set in Sentry', { userId: user.id });
    } catch (error) {
      logger.error('Failed to set user context in Sentry', error);
    }
  }

  /**
   * Set tag for filtering
   */
  setTag(key, value) {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    try {
      Sentry.setTag(key, value);
    } catch (error) {
      logger.error('Failed to set tag in Sentry', error);
    }
  }

  /**
   * Set extra context data
   */
  setExtra(key, extra) {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    try {
      Sentry.setExtra(key, extra);
    } catch (error) {
      logger.error('Failed to set extra context in Sentry', error);
    }
  }

  /**
   * Enable/disable Sentry
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    logger.info(`Sentry ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if Sentry is initialized and enabled
   */
  isReady() {
    return this.isInitialized && this.isEnabled;
  }

  /**
   * Flush pending events (useful before app termination)
   */
  async flush(timeout = 5000) {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    try {
      await Sentry.flush(timeout);
      logger.debug('Sentry events flushed successfully');
    } catch (error) {
      logger.error('Failed to flush Sentry events', error);
    }
  }
}

// Create singleton instance
const sentryConfig = new SentryConfig();

export default sentryConfig;

// Export specific methods for easy access
export const {
  initialize,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  setExtra,
  setEnabled,
  isReady,
  flush
} = sentryConfig;