// Main entry point for EvoLab

import { GameLoop } from './core/GameLoop';

// Initialize and start the game
async function main() {
  // console.log('🧬 Welcome to EvoLab - Evolution Simulator');

  const game = new GameLoop();

  try {
    await game.initialize();
    game.start();
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }

  // Cleanup on window unload
  window.addEventListener('beforeunload', () => {
    game.dispose();
  });
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
