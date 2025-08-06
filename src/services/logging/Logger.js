/**
 * Centralized logging system for the Didgemap application
 * Provides structured logging with different levels and error reporting
 */

class Logger {
  constructor() {
    this.logLevel = __DEV__ ? 'debug' : 'error';
    this.enableConsole = __DEV__;
    this.logBuffer = [];
    this.maxBufferSize = 1000;
  }

  // Log levels (ascending priority)
  levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4
  };

  /**
   * Check if message should be logged based on current log level
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  /**
   * Format log entry with metadata
   */
  formatLogEntry(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      context,
      source: 'Didgemap'
    };

    // Add to buffer
    this.addToBuffer(entry);
    
    return entry;
  }

  /**
   * Add log entry to circular buffer
   */
  addToBuffer(entry) {
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }
    this.logBuffer.push(entry);
  }

  /**
   * Debug level logging
   */
  debug(message, context = {}) {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.formatLogEntry('debug', message, context);
    
    if (this.enableConsole) {
      console.log(`[DEBUG] ${message}`, context);
    }
    
    return entry;
  }

  /**
   * Info level logging
   */
  info(message, context = {}) {
    if (!this.shouldLog('info')) return;
    
    const entry = this.formatLogEntry('info', message, context);
    
    if (this.enableConsole) {
      console.info(`[INFO] ${message}`, context);
    }
    
    return entry;
  }

  /**
   * Warning level logging
   */
  warn(message, context = {}) {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.formatLogEntry('warn', message, context);
    
    if (this.enableConsole) {
      console.warn(`[WARN] ${message}`, context);
    }
    
    return entry;
  }

  /**
   * Error level logging
   */
  error(message, error = null, context = {}) {
    if (!this.shouldLog('error')) return;
    
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    };
    
    const entry = this.formatLogEntry('error', message, errorContext);
    
    if (this.enableConsole) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    
    // In production, you might want to send this to a crash reporting service
    this.reportError(entry);
    
    return entry;
  }

  /**
   * Critical level logging (for fatal errors)
   */
  critical(message, error = null, context = {}) {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    };
    
    const entry = this.formatLogEntry('critical', message, errorContext);
    
    if (this.enableConsole) {
      console.error(`[CRITICAL] ${message}`, error, context);
    }
    
    // Always report critical errors
    this.reportError(entry);
    
    return entry;
  }

  /**
   * Log user actions for analytics and debugging
   */
  userAction(action, details = {}) {
    const context = {
      type: 'user_action',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    
    return this.info(`User action: ${action}`, context);
  }

  /**
   * Log performance metrics
   */
  performance(metric, value, unit = 'ms', context = {}) {
    const perfContext = {
      type: 'performance',
      metric,
      value,
      unit,
      ...context
    };
    
    return this.debug(`Performance: ${metric} = ${value}${unit}`, perfContext);
  }

  /**
   * Log API calls and responses
   */
  api(method, url, status, duration, context = {}) {
    const apiContext = {
      type: 'api',
      method,
      url,
      status,
      duration,
      ...context
    };
    
    const level = status >= 400 ? 'error' : 'debug';
    return this[level](`API ${method} ${url} - ${status} (${duration}ms)`, apiContext);
  }

  /**
   * Report errors to external service
   */
  reportError(logEntry) {
    if (!__DEV__) {
      try {
        // Import Sentry dynamically to avoid circular deps
        import('../crashReporting/SentryConfig').then(({ default: sentryConfig }) => {
          if (sentryConfig.isReady()) {
            const error = logEntry.context?.error;
            if (error) {
              // Create Error object if needed
              const errorObj = typeof error === 'string' 
                ? new Error(error) 
                : new Error(error.message || 'Unknown error');
              
              if (error.stack) errorObj.stack = error.stack;
              if (error.name) errorObj.name = error.name;
              
              sentryConfig.captureException(errorObj, {
                tags: {
                  level: logEntry.level,
                  source: logEntry.source
                },
                extra: {
                  timestamp: logEntry.timestamp,
                  context: logEntry.context
                }
              });
            } else {
              sentryConfig.captureMessage(logEntry.message, logEntry.level.toLowerCase(), {
                extra: logEntry.context
              });
            }
          }
        }).catch(importError => {
          console.error('Failed to import Sentry for error reporting:', importError);
        });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count = 100) {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearLogs() {
    this.logBuffer = [];
  }

  /**
   * Export logs for debugging or support
   */
  exportLogs() {
    return {
      exportDate: new Date().toISOString(),
      logLevel: this.logLevel,
      logs: this.logBuffer,
      deviceInfo: {
        // Add device info if needed
        platform: 'React Native',
        version: '1.0.0'
      }
    };
  }

  /**
   * Set log level dynamically
   */
  setLogLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.info(`Log level changed to ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}. Valid levels: ${Object.keys(this.levels).join(', ')}`);
    }
  }

  /**
   * Enable or disable console logging
   */
  setConsoleLogging(enabled) {
    this.enableConsole = enabled;
    this.info(`Console logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Export specific methods for convenient use
export const {
  debug,
  info,
  warn,
  error,
  critical,
  userAction,
  performance,
  api
} = logger;