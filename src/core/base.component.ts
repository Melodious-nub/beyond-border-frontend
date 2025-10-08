import { Component, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Base component class that provides memory leak prevention
 * and common functionality for all components
 */
@Component({
  template: ''
})
export abstract class BaseComponent implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  /**
   * Take until destroy pattern for automatic subscription cleanup
   */
  protected takeUntilDestroy<T>() {
    return takeUntil<T>(this.destroy$);
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.error.set(error);
  }

  /**
   * Clear error state
   */
  protected clearError(): void {
    this.error.set(null);
  }

  /**
   * Handle error with logging
   */
  protected handleError(error: any, context?: string): void {
    const errorMessage = error?.message || 'An unexpected error occurred';
    // Error logging removed for production
    this.setError(errorMessage);
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
