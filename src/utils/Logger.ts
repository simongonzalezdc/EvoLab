/**
 * Logger Utility - Conditional logging for development
 * In production builds, these logs will be stripped out
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  warn: (...args: any[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args: any[]): void => {
    // Always log errors, even in production
    console.error(...args);
  },

  debug: (...args: any[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  info: (...args: any[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};
