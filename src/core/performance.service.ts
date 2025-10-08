import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

/**
 * Performance optimization service for memory leak prevention
 * and performance monitoring
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly performanceMetrics = new Map<string, number>();

  /**
   * Create a destroy subject for component cleanup
   */
  createDestroySubject(): Subject<void> {
    return new Subject<void>();
  }

  /**
   * Take until destroy pattern for automatic subscription cleanup
   */
  takeUntilDestroy<T>() {
    return takeUntil<T>(this.destroy$);
  }

  /**
   * Track performance metrics
   */
  startTimer(label: string): void {
    this.performanceMetrics.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.performanceMetrics.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMetrics.delete(label);
      // Performance logging removed for production
      return duration;
    }
    return 0;
  }

  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Memory usage monitoring
   */
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Log memory usage
   */
  logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      // Memory usage logging removed for production
    }
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.performanceMetrics.clear();
  }
}
