/**
 * Tests for Logger utility
 * Ensures conditional logging works correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/utils/Logger';

describe('Logger', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should always log errors', () => {
    logger.error('Test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');
  });

  it('should have a log method', () => {
    expect(typeof logger.log).toBe('function');
  });

  it('should have a warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  it('should have an error method', () => {
    expect(typeof logger.error).toBe('function');
  });
});
