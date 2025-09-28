/**
 * Centralized Logging System for EmeraldMind
 * Replaces scattered console.log statements with structured logging
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
  4: 'TRACE'
};

class Logger {
  constructor(context = 'App', level = LOG_LEVELS.INFO) {
    this.context = context;
    this.level = this.determineLogLevel(level);
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  determineLogLevel(level) {
    // In production, only show errors and warnings
    if (!this.isDevelopment) {
      return Math.min(level, LOG_LEVELS.WARN);
    }
    
    // In development, use provided level or default to INFO
    return level;
  }

  shouldLog(level) {
    return level <= this.level;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const prefix = `[${timestamp}] ${levelName} [${this.context}]`;
    
    if (data) {
      return { prefix, message, data };
    }
    return { prefix, message };
  }

  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, data);
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        if (data) {
          console.error(formatted.prefix, formatted.message, formatted.data);
        } else {
          console.error(formatted.prefix, formatted.message);
        }
        break;
      case LOG_LEVELS.WARN:
        if (data) {
          console.warn(formatted.prefix, formatted.message, formatted.data);
        } else {
          console.warn(formatted.prefix, formatted.message);
        }
        break;
      case LOG_LEVELS.INFO:
        if (data) {
          console.info(formatted.prefix, formatted.message, formatted.data);
        } else {
          console.info(formatted.prefix, formatted.message);
        }
        break;
      case LOG_LEVELS.DEBUG:
      case LOG_LEVELS.TRACE:
        if (data) {
          console.log(formatted.prefix, formatted.message, formatted.data);
        } else {
          console.log(formatted.prefix, formatted.message);
        }
        break;
    }
  }

  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  trace(message, data = null) {
    this.log(LOG_LEVELS.TRACE, message, data);
  }

  // Performance logging
  time(label) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }

  // Group logging for related operations
  group(label) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.group(`[${this.context}] ${label}`);
    }
  }

  groupEnd() {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.groupEnd();
    }
  }

  // Create child logger with extended context
  child(childContext) {
    return new Logger(`${this.context}:${childContext}`, this.level);
  }
}

// Factory function to create loggers
export const createLogger = (context, level = LOG_LEVELS.INFO) => {
  return new Logger(context, level);
};

// Pre-configured loggers for common contexts
export const appLogger = createLogger('App', LOG_LEVELS.INFO);
export const trainerLogger = createLogger('TrainerGen', LOG_LEVELS.DEBUG);
export const scriptLogger = createLogger('ScriptGen', LOG_LEVELS.DEBUG);
export const apiLogger = createLogger('API', LOG_LEVELS.INFO);
export const perfLogger = createLogger('Performance', LOG_LEVELS.DEBUG);
export const uiLogger = createLogger('UI', LOG_LEVELS.INFO);

// Export constants for external use
export { LOG_LEVELS };

export default Logger;