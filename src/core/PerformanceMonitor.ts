// Performance monitoring system for tracking FPS and entity counts

// Extended Performance interface with memory property
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  entityCount: number;
  cellCount: number;
  resourceCount: number;
  particleCount: number;
  memoryUsage?: number; // MB (if available)
  drawCalls?: number;
}

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private currentFPS = 60;
  private readonly SAMPLE_SIZE = 60; // Average over 60 frames (1 second at 60fps)
  private metricsHistory: PerformanceMetrics[] = [];
  private readonly MAX_HISTORY = 300; // Keep 5 seconds of history at 60fps

  // Performance budget thresholds
  private readonly MIN_FPS = 30; // Below this = performance warning
  private readonly MAX_FRAME_TIME = 33.33; // 33ms = 30fps threshold
  private readonly MAX_ENTITIES = 500; // Warning threshold

  constructor() {
    this.lastFrameTime = performance.now();
  }

  // Update metrics each frame
  update(
    entityCount: number,
    cellCount: number,
    resourceCount: number,
    particleCount: number
  ): PerformanceMetrics {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Track frame times for FPS calculation
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.SAMPLE_SIZE) {
      this.frameTimes.shift();
    }

    // Calculate average FPS (with guard against division by zero)
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.currentFPS = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 60; // Default to 60 FPS on first frame

    // Get memory usage if available (Chrome/Edge specific feature)
    let memoryUsage: number | undefined;
    const perfWithMemory = performance as ExtendedPerformance;
    if (perfWithMemory.memory) {
      memoryUsage = perfWithMemory.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }

    const metrics: PerformanceMetrics = {
      fps: this.currentFPS,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      entityCount,
      cellCount,
      resourceCount,
      particleCount,
      memoryUsage,
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.MAX_HISTORY) {
      this.metricsHistory.shift();
    }

    this.frameCount++;

    return metrics;
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return this.metricsHistory[this.metricsHistory.length - 1] || {
      fps: 0,
      frameTime: 0,
      entityCount: 0,
      cellCount: 0,
      resourceCount: 0,
      particleCount: 0,
    };
  }

  // Check if performance is below budget
  isPerformanceLow(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps < this.MIN_FPS || metrics.frameTime > this.MAX_FRAME_TIME;
  }

  // Check if entity count is too high
  isEntityCountHigh(): boolean {
    const metrics = this.getMetrics();
    return metrics.entityCount > this.MAX_ENTITIES;
  }

  // Get performance warnings
  getWarnings(): string[] {
    const warnings: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.fps < this.MIN_FPS) {
      warnings.push(`Low FPS: ${metrics.fps} (target: 60)`);
    }

    if (metrics.frameTime > this.MAX_FRAME_TIME) {
      warnings.push(`High frame time: ${metrics.frameTime}ms (budget: 16.67ms)`);
    }

    if (metrics.entityCount > this.MAX_ENTITIES) {
      warnings.push(`High entity count: ${metrics.entityCount} (budget: ${this.MAX_ENTITIES})`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      warnings.push(`High memory usage: ${metrics.memoryUsage.toFixed(0)}MB`);
    }

    return warnings;
  }

  // Get average FPS over history
  getAverageFPS(frames: number = 60): number {
    const recentMetrics = this.metricsHistory.slice(-frames);
    if (recentMetrics.length === 0) return 60;

    const avgFPS = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
    return Math.round(avgFPS);
  }

  // Get performance summary
  getSummary(): {
    avgFPS: number;
    minFPS: number;
    maxFPS: number;
    avgFrameTime: number;
    avgEntityCount: number;
  } {
    if (this.metricsHistory.length === 0) {
      return {
        avgFPS: 60,
        minFPS: 60,
        maxFPS: 60,
        avgFrameTime: 16.67,
        avgEntityCount: 0,
      };
    }

    const fpsList = this.metricsHistory.map(m => m.fps);
    const frameTimeList = this.metricsHistory.map(m => m.frameTime);
    const entityCountList = this.metricsHistory.map(m => m.entityCount);

    return {
      avgFPS: Math.round(fpsList.reduce((a, b) => a + b, 0) / fpsList.length),
      minFPS: Math.min(...fpsList),
      maxFPS: Math.max(...fpsList),
      avgFrameTime: Math.round((frameTimeList.reduce((a, b) => a + b, 0) / frameTimeList.length) * 100) / 100,
      avgEntityCount: Math.round(entityCountList.reduce((a, b) => a + b, 0) / entityCountList.length),
    };
  }

  // Reset all metrics
  reset(): void {
    this.frameTimes = [];
    this.metricsHistory = [];
    this.frameCount = 0;
    this.currentFPS = 60;
    this.lastFrameTime = performance.now();
  }
}
