/**
 * Test setup file for Vitest
 * Runs before all tests
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend matchers if needed
// e.g., import '@testing-library/jest-dom';
